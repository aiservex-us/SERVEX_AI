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

export default function UploadClientXML() {
  const [companyName] = useState('LESRO');
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
        .from('ClientsSERVEX_LESRO')
        .select('xml_raw, csv_raw, csv_new_raw')
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
        setXmlContent(e.target?.result as string);
        setMessage({ text: 'XML file loaded successfully', type: 'success' });
        setReadingXml(false);
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
        setCsvContent(e.target?.result as string);
        setMessage({ text: 'CSV Base file loaded successfully', type: 'success' });
        setReadingCsv(false);
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
        setCsvNewContent(e.target?.result as string);
        setMessage({ text: 'CSV Nuevo file loaded successfully', type: 'success' });
        setReadingNewCsv(false);
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

  // --- Lógica de Saneamiento y Guardado ---
  const handleSave = async () => {
    setMessage({ text: '', type: null });
    
    // Al menos un archivo debe estar presente (ya sea cargado o existente)
    if (!xmlContent.trim() && !csvContent.trim() && !csvNewContent.trim()) {
      setMessage({ text: 'Please upload at least one file to save', type: 'error' });
      return;
    }
    
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 0));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ text: 'User not authorized', type: 'error' });
        return;
      }

      console.log('[+] Starting structural sanitation on CSV contents...');
      
      const payload: any = {
        company_name: 'LESRO',
        user_id: user.id,
      };

      if (xmlContent.trim()) {
        payload.xml_raw = xmlContent;
      }
      if (csvContent.trim()) {
        payload.csv_raw = sanitizeCSV(csvContent);
      }
      if (csvNewContent.trim()) {
        payload.csv_new_raw = sanitizeCSV(csvNewContent);
        payload.CSV_final = sanitizeCSV(csvNewContent);
      }

      const { error } = await supabase
        .from('ClientsSERVEX_LESRO')
        .update(payload)
        .eq('user_id', user.id)
        .select('');

      if (error) {
        console.error('Supabase Full Error:', error);
        setMessage({ text: `DB Error: ${error.message}`, type: 'error' });
      } else {
        setMessage({ text: 'WB Catalog Data successfully sanitized and stored', type: 'success' });
      window.dispatchEvent(new CustomEvent('globalChatMessage', { detail: { from: 'bot', text: `💾 ¡Éxito! Los datos del catálogo para ${companyName} han sido saneados y almacenados en la nube correctamente.` } }));
        setXmlContent('');
        setCsvContent('');
        setCsvNewContent('');
        // Refrescar el estado de columnas existentes tras guardar
        await checkExistingFiles();
      }
    } catch (err: unknown) {
      console.error(err);
      setMessage({ text: 'Unexpected client-side error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const showXmlExistingNotice = existingXml && !xmlContent && !readingXml;
  const showCsvExistingNotice = existingCsv && !csvContent && !readingCsv;
  const showNewCsvExistingNotice = existingNewCsv && !csvNewContent && !readingNewCsv;

  // --- Lógica de Evento Global para /saveCatalogData ---
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  });
  useEffect(() => {
    const listener = () => handleSaveRef.current();
    window.addEventListener('saveCatalogData', listener);
    return () => window.removeEventListener('saveCatalogData', listener);
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto flex font-sans text-[#242424] relative bg-white/50 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-sm">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Drop Zone 1: XML */}
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
                    <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 font-medium leading-tight">Catalog Creator Catalog</p>
                    {showXmlExistingNotice && (
                      <p className="text-[10px] text-indigo-500 mt-2 font-semibold bg-indigo-50/50 inline-block px-1.5 py-0.5 rounded-full">Click or drop to replace</p>
                    )}
                    <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readXMLFile(file); }} />
                  </div>

                  {/* Drop Zone 3: New CSV */}
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

                </div>

                {/* Previews (3 Columns now) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">XML Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-white/40 bg-white/20 backdrop-blur-md text-gray-700 px-3 py-2 h-32 resize-none outline-none" value={xmlContent} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">CSV Base Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-white/40 bg-white/20 backdrop-blur-md text-gray-700 px-3 py-2 h-32 resize-none outline-none" value={csvContent} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">New CSV Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-white/40 bg-white/20 backdrop-blur-md text-gray-700 px-3 py-2 h-32 resize-none outline-none" value={csvNewContent} readOnly />
                  </div>
                </div>

                {message.type && (
                  <div className={`p-3 rounded flex items-center gap-3 text-xs font-semibold border-l-4
                    ${message.type === 'success' ? 'bg-green-50 border-l-green-600 text-green-800' : 'bg-red-50 border-l-red-600 text-red-800'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                  </div>
                )}
              </div>

              
            </div>
        
      
    
  );
}
