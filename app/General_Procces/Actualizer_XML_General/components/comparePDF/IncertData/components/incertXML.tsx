'use client';

import Papa from 'papaparse';
import { useState, useRef, useTransition, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
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
        const hasXml = !!data.xml_raw && String(data.xml_raw).trim().length > 0;
        const hasCsv = !!data.csv_raw &&
          (Array.isArray(data.csv_raw) ? data.csv_raw.length > 0 : String(data.csv_raw).trim().length > 0);
        const hasNewCsv = !!data.csv_new_raw &&
          (Array.isArray(data.csv_new_raw) ? data.csv_new_raw.length > 0 : String(data.csv_new_raw).trim().length > 0);
        
        setExistingXml(hasXml);
        if (hasXml) {
          let fname = (data as any)?.xml_name || (data as any)?.file_name || '';
          if (!fname && data.xml_raw) {
            const m = String(data.xml_raw).match(/<!--\s*filename:\s*(.*?)\s*-->/i);
            if (m && m[1]) fname = m[1].trim();
            else {
              const m2 = String(data.xml_raw).match(/<Catalog[^>]*\bName=["']([^"']+)["']/i);
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
            const subRefs = Array.from(fNode.getElementsByTagName("FeatureRef"));
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
            const options = Array.from(featureNode.getElementsByTagName("Option"));
            for (const opt of options) {
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
            const options = Array.from(featureNode.getElementsByTagName("Option"));
            for (const opt of options) {
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

        const createRow = (baseSku: string, optSuffixCode: string | null, optPrice: number) => {
          const finalSku = optSuffixCode ? `${baseSku}/${optSuffixCode}` : baseSku;
          const finalDesc = optSuffixCode ? `${description} [Option ${optSuffixCode}]` : description;
          const finalPrice = basePrice + (optPrice || 0);

          const row: Record<string, any> = {};
          computedHeaders.forEach(h => row[h] = "");

          row["Model #"] = finalSku;
          row["List Price"] = finalPrice;
          row["Weight"] = weight;
          row["Classic/ Premium"] = classification;
          row["Model Name"] = finalDesc;

          validColumns.forEach(col => {
            if (productOptionPrices[col.optCode] !== undefined) {
              row[col.label] = productOptionPrices[col.optCode];
            } else {
              row[col.label] = 0;
            }
          });

          return row;
        };

        let hasSuffixes = false;
        for (const fCode of featureCodes) {
          const featureNode = featureMap.get(fCode);
          if (featureNode) {
            const options = Array.from(featureNode.getElementsByTagName("Option"));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent?.trim();
              if (optCode === "C" || optCode === "P") {
                const optPriceElem = opt.querySelector("OptionPrice > Value");
                const optPrice = optPriceElem ? parseFloat(optPriceElem.textContent || "0") : 0;

                const suffixSku = `${sku}/${optCode}`;
                if (!extracted.find(e => e["Model #"] === suffixSku)) {
                  extracted.push(createRow(sku, optCode, optPrice));
                  hasSuffixes = true;
                }
              }
            }
          }
        }

        if (!hasSuffixes) {
          extracted.push(createRow(sku, null, 0));
        }
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
        payload.xml_raw = prefixedContent;
        payload.XM_CET_import = prefixedContent;
        if (fileName) {
          payload.xml_name = fileName;
          payload.file_name = fileName;
        }
        const generatedCsv = await generateCsvFromCetXml(rawContent);
        if (generatedCsv) {
          payload.csv_raw = generatedCsv;
        }
      } else if (type === 'csv_base') {
        payload.csv_raw = sanitizeCSV(rawContent);
      } else if (type === 'csv_new') {
        payload.csv_new_raw = sanitizeCSV(rawContent);
        payload.CSV_final = sanitizeCSV(rawContent);
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
    <div className="w-full max-w-sm mx-auto flex font-sans text-[#242424] relative bg-transparent p-0">
      <div className="flex-1 flex flex-col gap-3">

        {/* --- POPUP PROCESANDO DATOS BASE --- */}
        {loading && (
          <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-6">
            <div className="bg-white border border-gray-200 shadow-2xl rounded-lg sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 sm:space-y-4 transform animate-in zoom-in-95 duration-200">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#5b5fc7]/10 rounded-full animate-ping"></div>
                  <div className="relative bg-white border border-gray-100 p-2 sm:p-3 rounded-full shadow-sm">
                    <DatabaseZap className="text-[#5b5fc7] animate-pulse" size={20} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-tight">System Base Storage</h3>
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Module ({companyName})</p>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 text-left">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={14} />
                <p className="text-[9px] sm:text-[10px] text-amber-800 leading-tight">
                  <strong>IMPORTANT:</strong> Uploading base {companyName} files to Cloud Database. <strong>Do not close</strong> this window.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#5b5fc7]">
                <Loader2 size={12} className="animate-spin" />
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
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                      ${dragActive ? 'border-[#464775] bg-[#464775]/5' : showXmlExistingNotice ? 'border-[#464775]/40 bg-[#464775]/5 hover:bg-[#464775]/10' : 'border-white/40 bg-white/20 backdrop-blur-md hover:bg-white/30'}`}
                  >
                    {readingXml ? (
                      <RefreshCw className="mx-auto mb-1.5 text-[#464775] animate-spin" size={20} />
                    ) : checkingExisting ? (
                      <RefreshCw className="mx-auto mb-1.5 text-gray-400 animate-spin" size={20} />
                    ) : showXmlExistingNotice ? (
                      <DatabaseZap className="mx-auto mb-1.5 text-[#464775]" size={20} />
                    ) : (
                      <UploadCloud className={`mx-auto mb-1.5 ${dragActive ? 'text-[#464775]' : 'text-gray-400'}`} size={20} />
                    )}
                    <p className={`text-xs sm:text-sm font-bold mt-1.5 ${showXmlExistingNotice ? 'text-[#464775]' : 'text-[#242424]'}`}>
                      {readingXml
                        ? 'Reading...'
                        : checkingExisting
                          ? 'Checking...'
                          : showXmlExistingNotice
                            ? 'File already exists in DB'
                            : 'Upload XML'}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-[#464775] font-bold mt-1 font-mono leading-tight px-1 max-w-full truncate bg-[#464775]/10 py-0.5 rounded">{xmlFileName || "Catalog Creator Catalog"}</p>
                    {showXmlExistingNotice && (
                      <p className="text-[10px] text-indigo-500 mt-2 font-semibold bg-indigo-50/50 inline-block px-1.5 py-0.5 rounded-full">Click or drop to replace</p>
                    )}
                    <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readXMLFile(file); }} />
                  </div>
                  )}

                  {/* Drop Zone 3: New CSV */}
                  {(step === 'all' || step === 'csv_new') && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActiveNewCSV(true); }}
                    onDragLeave={() => setDragActiveNewCSV(false)}
                    onDrop={handleDropNewCSV}
                    onClick={() => csvNewInputRef.current?.click()}
                    className={`border border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                      ${dragActiveNewCSV ? 'border-[#464775] bg-[#464775]/5' : showNewCsvExistingNotice ? 'border-[#464775]/40 bg-[#464775]/5 hover:bg-[#464775]/10' : 'border-white/40 bg-white/20 backdrop-blur-md hover:bg-white/30'}`}
                  >
                    {readingNewCsv ? (
                      <RefreshCw className="mx-auto mb-1.5 text-[#464775] animate-spin" size={20} />
                    ) : checkingExisting ? (
                      <RefreshCw className="mx-auto mb-1.5 text-gray-400 animate-spin" size={20} />
                    ) : showNewCsvExistingNotice ? (
                      <DatabaseZap className="mx-auto mb-1.5 text-[#464775]" size={20} />
                    ) : (
                      <FileSpreadsheet className={`mx-auto mb-1.5 ${dragActiveNewCSV ? 'text-[#464775]' : 'text-gray-400'}`} size={20} />
                    )}
                    <p className={`text-xs sm:text-sm font-bold mt-1.5 ${showNewCsvExistingNotice ? 'text-[#464775]' : 'text-[#242424]'}`}>
                      {readingNewCsv
                        ? 'Reading...'
                        : checkingExisting
                          ? 'Checking...'
                          : showNewCsvExistingNotice
                            ? 'File already exists in DB'
                            : 'Upload CSV Nuevo'}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 font-medium leading-tight">New catalog to compare</p>
                    {showNewCsvExistingNotice && (
                      <p className="text-[10px] text-indigo-500 mt-2 font-semibold bg-indigo-50/50 inline-block px-1.5 py-0.5 rounded-full">Click or drop to replace</p>
                    )}
                    <input ref={csvNewInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readNewCSVFile(file); }} />
                  </div>
                  )}

                </div>

                {message.type && (
                  <div className={`p-3 rounded-lg flex items-center gap-3 text-xs font-semibold border-l-4
                    ${message.type === 'success' ? 'bg-[#464775]/10 border-l-[#464775] text-[#464775]' : 'bg-red-50 border-l-red-600 text-red-800'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} className="text-[#464775]" /> : <AlertCircle size={16} />}
                    {message.text}
                  </div>
                )}
              </div>
            </div>
  );
}
