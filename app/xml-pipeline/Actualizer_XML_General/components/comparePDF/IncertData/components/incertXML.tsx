'use client';

import Papa from 'papaparse';
import { useState, useRef, useTransition, useEffect, useCallback } from 'react';
import { supabase, uploadToCatalogsStorage } from '@/app/lib/supabaseClient';
import {
  FileCode,
  Building2,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileSpreadsheet,
  RefreshCw,
  Info,
  DatabaseZap,
  Loader2
} from 'lucide-react';

export default function UploadClientXML({ step = 'all' }: { step?: string }) {
  const [companyName] = useState('General_Procces');
  const [xmlFileName, setXmlFileName] = useState('');
  const [xmlContent, setXmlContent] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [csvNewContent, setCsvNewContent] = useState('');
  const [loading, setLoading] = useState(false);

  const [readingXml, setReadingXml] = useState(false);
  const [readingCsv, setReadingCsv] = useState(false);
  const [readingNewCsv, setReadingNewCsv] = useState(false);

  // --- Estado de verificación de columnas existentes en BD ---
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingXml, setExistingXml] = useState(false);
  const [existingCsv, setExistingCsv] = useState(false);
  const [existingNewCsv, setExistingNewCsv] = useState(false);

  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });
  const [dragActive, setDragActive] = useState(false);
  const [dragActiveCSV, setDragActiveCSV] = useState(false);
  const [dragActiveNewCSV, setDragActiveNewCSV] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);
  const csvNewInputRef = useRef<HTMLInputElement | null>(null);

  // React Transition para prevenir bloqueos de renderizado en hilos de UI al cargar datasets grandes
  const [, startTransition] = useTransition();

  // --- Verificar si ya existe un registro con XML/CSV guardados para esta compañía ---
  const checkExistingFiles = useCallback(async () => {
    setCheckingExisting(true);
    try {
      const { data, error } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .select('xml_raw, xml_name, file_name, csv_raw, csv_new_raw')
        .eq('company_name', companyName)
        .maybeSingle();

      if (error) {
        console.error('Error checking existing files:', error);
        setExistingXml(false);
        setExistingCsv(false);
        setExistingNewCsv(false);
      } else if (data) {
        const hasXml = !!(data as any)?.xml_raw && String((data as any)?.xml_raw).trim().length > 0;
        const hasCsv = !!data.csv_raw &&
          (Array.isArray(data.csv_raw) ? data.csv_raw.length > 0 : String(data.csv_raw).trim().length > 0);
        const hasNewCsv = !!data.csv_new_raw &&
          (Array.isArray(data.csv_new_raw) ? data.csv_new_raw.length > 0 : String(data.csv_new_raw).trim().length > 0);
        
        setExistingXml(hasXml);
        if (hasXml) {
          let fname = (data as any)?.xml_name || (data as any)?.file_name || '';
          if (!fname && (data as any)?.xml_raw) {
            const m = String((data as any)?.xml_raw).match(/<!--\s*filename:\s*(.*?)\s*-->/i);
            if (m && m[1]) fname = m[1].trim();
            else {
              const m2 = String((data as any)?.xml_raw).match(/<Catalog[^>]*\bName=["']([^"']+)["']/i);
              if (m2 && m2[1]) fname = m2[1].endsWith('.xml') ? m2[1] : `${m2[1]}.xml`;
            }
          }
          if (!fname) fname = `${companyName}.xml`;
          setXmlFileName(fname);
        }
        setExistingCsv(hasCsv);
        setExistingNewCsv(hasNewCsv);
      } else {
        setExistingXml(false);
        setExistingCsv(false);
        setExistingNewCsv(false);
      }
    } catch (err) {
      console.error('Unexpected error checking existing files:', err);
      setExistingXml(false);
      setExistingCsv(false);
      setExistingNewCsv(false);
    } finally {
      setCheckingExisting(false);
    }
  }, [companyName]);

  useEffect(() => {
    checkExistingFiles();
  }, [checkExistingFiles]);

  // --- ALGORITMO DE SANEAMIENTO ESTRUCTURAL EN MEMORIA ---
  interface CsvRow {
    [key: string]: string | null | string[] | undefined;
    _orphaned_fields?: string[];
  }

    const sanitizeCSV = (rawCsvText: string): CsvRow[] => {
    if (!rawCsvText || !rawCsvText.trim()) return [];

    // PapaParse detecta automáticamente si se usa ';' o ',' y respeta las comillas anidadas
    const parsed = Papa.parse(rawCsvText.trim(), {
      header: false,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.warn("PapaParse warnings:", parsed.errors);
    }

    const data = parsed.data as string[][];
    if (data.length === 0) return [];

    // Headers en la primera fila
    const rawHeaders = data[0];
    const cleanedHeaders = rawHeaders.map(token => {
      let tClean = token.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '').replace(/'/g, '');
      tClean = tClean.split(/\s+/).join(' ').trim();
      return tClean;
    });

    const headersLen = cleanedHeaders.length;
    const sanitizedJson: CsvRow[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowObject: CsvRow = {};

      for (let j = 0; j < headersLen; j++) {
        const header = cleanedHeaders[j];
        let cellValue = row[j] !== undefined ? row[j] : '';

        if (cellValue === '') {
          rowObject[header] = null;
        } else {
          cellValue = cellValue.replace(/^["']|["']$/g, '').trim();
          rowObject[header] = cellValue;
        }
      }

      if (row.length > headersLen) {
        const orphaned = row.slice(headersLen).map(c => c.replace(/^["']|["']$/g, '').trim());
        rowObject['_orphaned_fields'] = orphaned;
      }

      sanitizedJson.push(rowObject);
    }

    return sanitizedJson;
  };

  // --- Lógica de Lectura de Archivos ---
  const readXMLFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setMessage({ text: 'Only XML files are allowed', type: 'error' });
      return;
    }
    setReadingXml(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      startTransition(() => {
        const content = e.target?.result as string;
        setXmlContent(content);
        setMessage({ text: 'XML file loaded successfully', type: 'success' });
        setReadingXml(false);
        if (step === 'xml') {
          setXmlFileName(file.name);
          saveSingleStep('xml', content, file.name);
        }
      });
    };
    reader.readAsText(file);
  };

  const readCSVFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage({ text: 'Only CSV files are allowed', type: 'error' });
      return;
    }
    setReadingCsv(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      startTransition(() => {
        const content = e.target?.result as string;
        setCsvContent(content);
        setMessage({ text: 'CSV Base file loaded successfully', type: 'success' });
        setReadingCsv(false);
        if (step === 'csv_base') {
          saveSingleStep('csv_base', content);
        }
      });
    };
    reader.readAsText(file);
  };

  const readNewCSVFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage({ text: 'Only CSV files are allowed', type: 'error' });
      return;
    }
    setReadingNewCsv(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      startTransition(() => {
        const content = e.target?.result as string;
        setCsvNewContent(content);
        setMessage({ text: 'CSV Nuevo file loaded successfully', type: 'success' });
        setReadingNewCsv(false);
        if (step === 'csv_new') {
          saveSingleStep('csv_new', content);
        }
      });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readXMLFile(file);
  };

  const handleDropCSV = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setDragActiveCSV(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readCSVFile(file);
  };

  const handleDropNewCSV = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setDragActiveNewCSV(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readNewCSVFile(file);
  };

  const yieldToMainThread = () => new Promise(resolve => setTimeout(resolve, 0));

  async function generateCsvFromCetXml(xmlString: string): Promise<string> {
    if (!xmlString || !xmlString.trim() || typeof window === 'undefined') return '';
    try {
      await yieldToMainThread();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      if (xmlDoc.querySelector("parsererror")) return '';

      const BASE_HEADERS = ["Model #", "List Price", "Weight", "Classic/ Premium", "Model Name"];
      const globalFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const featureMap = new Map();

      for (const f of globalFeatures) {
        const fCode = f.getElementsByTagName("Code")[0]?.textContent;
        if (fCode) featureMap.set(fCode, f);
      }

      // Función recursiva con memorización para resolver todos los FeatureRefs
      const featureCache = new Map<string, string[]>();
      const getProductFeatureCodes = (pNode: Element) => {
        const directRefs = Array.from(pNode.getElementsByTagName("FeatureRef")).map(r => r.textContent?.trim()).filter((c): c is string => !!c);
        const cacheKey = directRefs.join('|');
        if (featureCache.has(cacheKey)) {
          return featureCache.get(cacheKey)!;
        }

        const resolved: string[] = [];
        const visited = new Set<string>();

        const traverse = (fCode: string) => {
          if (!fCode || visited.has(fCode)) return;
          visited.add(fCode);
          resolved.push(fCode);

          const fNode = featureMap.get(fCode);
          if (fNode) {
            const subRefs = Array.from((fNode as Element).getElementsByTagName("FeatureRef"));
            for (const sub of subRefs) {
              const subCode = sub.textContent?.trim();
              if (subCode) traverse(subCode);
            }
          }
        };

        for (const code of directRefs) {
          traverse(code);
        }

        featureCache.set(cacheKey, resolved);
        return resolved;
      };

      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
      const optionMap = new Map();

      for (let i = 0; i < productsXML.length; i++) {
        if (i > 0 && i % 150 === 0) {
          await yieldToMainThread();
        }
        const p = productsXML[i];
        const featureCodes = getProductFeatureCodes(p);
        for (const fCode of featureCodes) {
          const featureNode = featureMap.get(fCode);
          if (featureNode) {
            const options = Array.from((featureNode as Element).getElementsByTagName("Option"));
            for (const opt of (options as Element[])) {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent?.trim();
              const optDesc = opt.getElementsByTagName("Description")[0]?.textContent?.trim();
              const optPriceElem = opt.querySelector("OptionPrice > Value");

              if (optPriceElem && optCode) {
                const optPrice = parseFloat(optPriceElem.textContent || "0");
                const label = optDesc 
                  ? (optDesc.toLowerCase().includes(optCode.toLowerCase()) ? optDesc : `${optCode} (${optDesc})`)
                  : optCode;

                const existing = optionMap.get(optCode);
                if (!existing) {
                  optionMap.set(optCode, { optCode, label, maxPrice: optPrice });
                } else {
                  if (optPrice > existing.maxPrice) existing.maxPrice = optPrice;
                  if (!existing.label || existing.label === optCode) existing.label = label;
                }
              }
            }
          }
        }
      }

      const validColumns = Array.from(optionMap.values()).filter(c => c.maxPrice > 0);
      const dynamicOptionHeaders = validColumns.map(c => c.label);
      const computedHeaders = [...BASE_HEADERS, ...dynamicOptionHeaders];
      const extracted: any[] = [];
      await yieldToMainThread();

      for (let i = 0; i < productsXML.length; i++) {
        if (i > 0 && i % 150 === 0) {
          await yieldToMainThread();
        }
        const p = productsXML[i];
        const sku = p.getElementsByTagName("Code")[0]?.textContent || "";
        const description = p.getElementsByTagName("Description")[0]?.textContent || "";
        const classification = p.getElementsByTagName("ClassificationRef")[0]?.getElementsByTagName("Code")[0]?.textContent 
          || p.getElementsByTagName("ClassificationRef")[0]?.textContent 
          || "Standard";

        const priceElement = p.getElementsByTagName("Price")[0];
        const basePrice = priceElement ? parseFloat(priceElement.getElementsByTagName("Value")[0]?.textContent || "0") : 0;
        const weight = p.getElementsByTagName("Weight")[0]?.textContent || "N/A";

        const featureCodes = getProductFeatureCodes(p);
        const productOptionPrices: Record<string, number> = {};

        for (const fCode of featureCodes) {
          const featureNode = featureMap.get(fCode);
          if (featureNode) {
            const options = Array.from((featureNode as Element).getElementsByTagName("Option"));
            for (const opt of (options as Element[])) {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent?.trim();
              const optPriceElem = opt.querySelector("OptionPrice > Value");
              if (optPriceElem && optCode) {
                const optPrice = parseFloat(optPriceElem.textContent || "0");
                if (productOptionPrices[optCode] === undefined || optPrice > productOptionPrices[optCode]) {
                  productOptionPrices[optCode] = optPrice;
                }
              }
            }
          }
        }

        const createRow = (baseSku: string) => {
          const row: Record<string, any> = {};
          computedHeaders.forEach(h => row[h] = "");

          row["Model #"] = baseSku;
          row["List Price"] = basePrice;
          row["Weight"] = weight;
          row["Classic/ Premium"] = classification;
          row["Model Name"] = description;

          validColumns.forEach(col => {
            if (productOptionPrices[col.optCode] !== undefined) {
              row[col.label] = productOptionPrices[col.optCode];
            } else {
              row[col.label] = 0;
            }
          });

          return row;
        };

        extracted.push(createRow(sku));
      }

      if (extracted.length === 0) return '';

      return Papa.unparse(extracted, {
        columns: computedHeaders,
        delimiter: ";"
      });
    } catch (err) {
      console.error('Error generating CSV from CET XML:', err);
      return '';
    }
  }

  const saveSingleStep = async (type: 'xml' | 'csv_base' | 'csv_new', rawContent: string, fileName?: string) => {
    setLoading(true);
    setMessage({ text: 'Saving to Supabase...', type: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload: any = {
        company_name: 'General_Procces',
      };
      if (user?.id) {
        payload.user_id = user.id;
      }

      if (type === 'xml') {
        const prefixedContent = fileName ? `<!-- filename: ${fileName} -->\n${rawContent}` : rawContent;
        if (fileName) {
          payload.xml_name = fileName.replace(/\.xml$/i, '').trim();
          payload.file_name = fileName;
        }

        // --- OPTIMIZACIÓN EN SUPABASE STORAGE (catalogs-storage) ---
        let uploadedPublicUrl = '';
        try {
          const cleanName = (fileName || 'catalog.xml').replace(/[^a-zA-Z0-9._-]/g, '_');
          const storageFilePath = `General_Procces/${Date.now()}_${cleanName}`;
          const xmlBlob = new Blob([prefixedContent], { type: 'application/xml' });

          const { data: storageData, error: storageErr } = await supabase.storage
            .from('catalogs-storage')
            .upload(storageFilePath, xmlBlob, {
              cacheControl: '3600',
              upsert: true,
              contentType: 'application/xml'
            });

          if (!storageErr && storageData) {
            const { data: publicUrlObj } = supabase.storage
              .from('catalogs-storage')
              .getPublicUrl(storageData.path);

            if (publicUrlObj?.publicUrl) {
              uploadedPublicUrl = publicUrlObj.publicUrl;
            }
          } else if (storageErr) {
            console.warn('⚠️ Supabase Storage catalogs-storage warning:', storageErr.message);
          }
        } catch (stgErr) {
          console.warn('⚠️ Error secundario al subir a catalogs-storage:', stgErr);
        }

        // Manejo ligero en BD si el XML es pesado para evitar saturación de la tabla
        if (uploadedPublicUrl && prefixedContent.length > 300 * 1024) {
          payload.xml_raw = `[STORAGE_URL]: ${uploadedPublicUrl}`;
          payload.XM_CET_import = `[STORAGE_URL]: ${uploadedPublicUrl}`;
        } else {
          payload.xml_raw = prefixedContent;
          payload.XM_CET_import = prefixedContent;
        }

        const generatedCsv = await generateCsvFromCetXml(rawContent);
        if (generatedCsv) {
          let storageGenUrl: string | null = null;
          if (generatedCsv.length > 200 * 1024) {
            try {
              storageGenUrl = await uploadToCatalogsStorage(
                generatedCsv,
                `csv_matrices/General_Procces/csv_raw_${Date.now()}.csv`,
                'text/csv'
              );
            } catch (_) {}
          }
          payload.csv_raw = storageGenUrl ? `[STORAGE_URL]: ${storageGenUrl}` : generatedCsv;
          try {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('csv_raw', generatedCsv);
              window.dispatchEvent(new CustomEvent('catalogMatrixUpdated', { detail: { csvRaw: generatedCsv } }));
            }
          } catch (_) {}
          try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servex-ai-back.onrender.com';
            const fdBase = new FormData();
            fdBase.append('company_name', 'General_Procces');
            fdBase.append('csv_raw', generatedCsv);
            fetch(`${backendUrl}/api/v1/General_Procces/pipeline/cache-csv-base`, {
              method: 'POST',
              body: fdBase
            }).catch(() => {});
          } catch (_) {}
        }
      } else if (type === 'csv_base') {
        let storageCsvBaseUrl: string | null = null;
        if (rawContent && rawContent.length > 200 * 1024) {
          try {
            storageCsvBaseUrl = await uploadToCatalogsStorage(
              rawContent,
              `csv_matrices/General_Procces/csv_raw_${Date.now()}.csv`,
              'text/csv'
            );
          } catch (_) {}
        }
        payload.csv_raw = storageCsvBaseUrl ? `[STORAGE_URL]: ${storageCsvBaseUrl}` : rawContent;
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('csv_raw', rawContent);
            window.dispatchEvent(new CustomEvent('catalogMatrixUpdated', { detail: { csvRaw: rawContent } }));
          }
        } catch (_) {}
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servex-ai-back.onrender.com';
          const fdBase = new FormData();
          fdBase.append('company_name', 'General_Procces');
          fdBase.append('csv_raw', rawContent);
          fetch(`${backendUrl}/api/v1/General_Procces/pipeline/cache-csv-base`, {
            method: 'POST',
            body: fdBase
          }).catch(() => {});
        } catch (_) {}
      } else if (type === 'csv_new') {
        let storageCsvNewUrl: string | null = null;
        if (rawContent && rawContent.length > 200 * 1024) {
          try {
            storageCsvNewUrl = await uploadToCatalogsStorage(
              rawContent,
              `csv_matrices/General_Procces/csv_new_${Date.now()}.csv`,
              'text/csv'
            );
          } catch (_) {}
        }
        const valToStore = storageCsvNewUrl ? `[STORAGE_URL]: ${storageCsvNewUrl}` : rawContent;
        payload.csv_new_raw = valToStore;
        payload.CSV_final = valToStore;
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('csv_new_raw', rawContent);
            window.dispatchEvent(new CustomEvent('catalogCsvNewUpdated', { detail: { csvNewRaw: rawContent } }));
          }
        } catch (_) {}
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servex-ai-back.onrender.com';
          const fd = new FormData();
          fd.append('company_name', 'General_Procces');
          // Enviar rawContent directamente para validación rápida en memoria sin round-trips
          fd.append('csv_new_raw', rawContent);
          const cacheRes = await fetch(`${backendUrl}/api/v1/General_Procces/pipeline/cache-csv-new`, {
            method: 'POST',
            body: fd
          });
          const cacheData = await cacheRes.json().catch(() => ({}));
          if (cacheData?.coherent === false) {
            setMessage({
              text: `⚠️ El dataset no coincide con el catálogo base (${cacheData.common_count || 0} modelos comunes). Por favor sube el archivo CSV correcto.`,
              type: 'error'
            });
            setLoading(false);
            return;
          }
        } catch (_) {}
      }

      const { error } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .upsert(payload, { onConflict: 'company_name' });

      if (error) {
        console.error('Supabase Error:', error);
        setMessage({ text: `DB Error: ${error.message}`, type: 'error' });
      } else {
        setMessage({ text: 'Saved successfully', type: 'success' });
        checkExistingFiles();
        if (type === 'xml') {
            window.dispatchEvent(new CustomEvent('wbsImportStep', { detail: { step: 'csv_base' } }));
        } else if (type === 'csv_base') {
            window.dispatchEvent(new CustomEvent('wbsImportStep', { detail: { step: 'csv_new' } }));
        } else if (type === 'csv_new') {
            window.dispatchEvent(new CustomEvent('wbsImportStep', { detail: { step: 'done' } }));
        }
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Unexpected error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Saneamiento y Guardado ---

  const showXmlExistingNotice = existingXml && !xmlContent && !readingXml;
  const showCsvExistingNotice = existingCsv && !csvContent && !readingCsv;
  const showNewCsvExistingNotice = existingNewCsv && !csvNewContent && !readingNewCsv;


  return (
    <div className="w-full max-w-sm mx-auto flex font-sans text-zinc-100 relative bg-transparent p-0">
      <div className="flex-1 flex flex-col gap-3">

        {/* --- POPUP PROCESANDO DATOS BASE --- */}
        {loading && (
          <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4 sm:p-6">
            <div className="bg-[#09090b]/90 border border-white/15 backdrop-blur-2xl shadow-2xl rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 sm:space-y-4 text-zinc-100 transform animate-in zoom-in-95 duration-200">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
                  <div className="relative bg-white/5 border border-white/10 p-2 sm:p-3 rounded-full shadow-sm">
                    <DatabaseZap className="text-white animate-pulse" size={20} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight">System Base Storage</h3>
                <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Module ({companyName})</p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-2 sm:p-3 rounded-xl flex items-start gap-2 sm:gap-3 text-left">
                <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={14} />
                <p className="text-[9px] sm:text-[10px] text-amber-300 leading-tight">
                  <strong>IMPORTANT:</strong> Uploading base {companyName} files to Cloud Database. <strong>Do not close</strong> this window.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-300">
                <Loader2 size={12} className="animate-spin text-white" />
                <span className="uppercase tracking-widest">Saving to Cloud Database...</span>
              </div>
            </div>
          </div>
        )}

        {/* Drop Zones Grid (3 Columns now) */}
        <div className={`grid grid-cols-1 ${step === 'all' ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-3`}>
          {/* Drop Zone 1: XML */}
          {(step === 'all' || step === 'xml') && (
          <div
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer
              ${dragActive ? 'border-white bg-white/10' : showXmlExistingNotice ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-white/15 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.08]'}`}
          >
            {readingXml ? (
              <RefreshCw className="mx-auto mb-1.5 text-white animate-spin" size={20} />
            ) : checkingExisting ? (
              <RefreshCw className="mx-auto mb-1.5 text-zinc-500 animate-spin" size={20} />
            ) : showXmlExistingNotice ? (
              <DatabaseZap className="mx-auto mb-1.5 text-emerald-400" size={20} />
            ) : (
              <UploadCloud className={`mx-auto mb-1.5 ${dragActive ? 'text-white' : 'text-zinc-400'}`} size={20} />
            )}
            <p className={`text-xs sm:text-sm font-bold mt-1.5 ${showXmlExistingNotice ? 'text-white' : 'text-zinc-200'}`}>
              {readingXml
                ? 'Reading...'
                : checkingExisting
                  ? 'Checking...'
                  : showXmlExistingNotice
                    ? 'File already exists in DB'
                    : 'Upload XML'}
            </p>
            <p className="text-[9px] sm:text-[10px] text-zinc-300 font-bold mt-1 font-mono leading-tight px-2 max-w-full truncate bg-white/10 border border-white/10 py-0.5 rounded-lg">{xmlFileName || "Catalog Creator Catalog"}</p>
            {showXmlExistingNotice && (
              <p className="text-[10px] text-zinc-300 mt-2 font-semibold bg-white/10 border border-white/10 inline-block px-2 py-0.5 rounded-full">Click or drop to replace</p>
            )}
            <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readXMLFile(file); }} />
          </div>
          )}

          {/* Drop Zone 3: New CSV */}
          {(step === 'all' || step === 'csv_new') && (
          <div
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActiveNewCSV(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActiveNewCSV(false); }}
            onDrop={handleDropNewCSV}
            onClick={() => csvNewInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer
              ${dragActiveNewCSV ? 'border-white bg-white/10' : showNewCsvExistingNotice ? 'border-white/20 bg-white/5 hover:bg-white/10' : 'border-white/15 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.08]'}`}
          >
            {readingNewCsv ? (
              <RefreshCw className="mx-auto mb-1.5 text-white animate-spin" size={20} />
            ) : checkingExisting ? (
              <RefreshCw className="mx-auto mb-1.5 text-zinc-500 animate-spin" size={20} />
            ) : showNewCsvExistingNotice ? (
              <DatabaseZap className="mx-auto mb-1.5 text-emerald-400" size={20} />
            ) : (
              <FileSpreadsheet className={`mx-auto mb-1.5 ${dragActiveNewCSV ? 'text-white' : 'text-zinc-400'}`} size={20} />
            )}
            <p className={`text-xs sm:text-sm font-bold mt-1.5 ${showNewCsvExistingNotice ? 'text-white' : 'text-zinc-200'}`}>
              {readingNewCsv
                ? 'Reading...'
                : checkingExisting
                  ? 'Checking...'
                  : showNewCsvExistingNotice
                    ? 'File already exists in DB'
                    : 'Upload CSV Nuevo'}
            </p>
            <p className="text-[9px] sm:text-[10px] text-zinc-400 mt-1 font-medium leading-tight">New catalog to compare</p>
            {showNewCsvExistingNotice && (
              <p className="text-[10px] text-zinc-300 mt-2 font-semibold bg-white/10 border border-white/10 inline-block px-2 py-0.5 rounded-full">Click or drop to replace</p>
            )}
            <input ref={csvNewInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readNewCSVFile(file); }} />
          </div>
          )}

        </div>

        {message.type && (
          <div className={`p-3 rounded-xl flex items-center gap-3 text-xs font-semibold border-l-4
            ${message.type === 'success' ? 'bg-emerald-500/10 border-l-emerald-400 text-emerald-300' : 'bg-rose-500/10 border-l-rose-500 text-rose-300'}`}>
            {message.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
