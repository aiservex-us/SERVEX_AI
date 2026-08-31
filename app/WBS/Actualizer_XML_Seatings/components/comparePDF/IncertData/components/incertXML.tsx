'use client';

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
  const [companyName] = useState('WBS');
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
        .from('ClientsSERVEX_WBS')
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

    const lines: string[] = [];
    let currentLine = '';
    let insideQuotes = false;

    const len = rawCsvText.length;
    for (let i = 0; i < len; i++) {
      const char = rawCsvText[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && rawCsvText[i + 1] === '\n') {
          i++; 
        }
        lines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    if (currentLine || rawCsvText.endsWith('\n') || rawCsvText.endsWith('\r')) {
      lines.push(currentLine);
    }

    if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) return [];

    const rawHeaderAccum: string[] = [];
    let dataStartIndex = 0;
    let openQuotes = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      rawHeaderAccum.push(line);

      const quoteCount = (line.match(/"/g) || []).length;
      if (quoteCount % 2 !== 0) {
        openQuotes = !openQuotes;
      }

      if (!openQuotes) {
        dataStartIndex = i + 1;
        break;
      }
    }

    const fullRawHeader = rawHeaderAccum.join('\n');

    const tokens = fullRawHeader.split(';');
    const cleanedTokens = tokens.map(token => {
      let tClean = token.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '').replace(/'/g, '');
      tClean = tClean.split(/\s+/).join(' ').trim();
      return tClean;
    });

    const perfectHeaders = cleanedTokens;
    const dataLines = lines.slice(dataStartIndex);
    const sanitizedJson: CsvRow[] = [];
    const headersLen = perfectHeaders.length;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue; 
      const currentCells = line.split(';');
      const rowObject: CsvRow = {};

      for (let j = 0; j < headersLen; j++) {
        const header = perfectHeaders[j];
        let cellValue = currentCells[j] !== undefined ? currentCells[j] : '';

        if (cellValue === '') {
          rowObject[header] = null;
        } else {
          cellValue = cellValue.replace(/^["']|["']$/g, '').trim();
          rowObject[header] = cellValue;
        }
      }

      if (currentCells.length > headersLen) {
        const orphaned = currentCells.slice(headersLen).map(c => c.replace(/^["']|["']$/g, '').trim());
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
          saveSingleStep('xml', content);
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

    const saveSingleStep = async (type: 'xml' | 'csv_base' | 'csv_new', rawContent: string) => {
    setLoading(true);
    setMessage({ text: 'Saving to Supabase...', type: null });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ text: 'User not authorized', type: 'error' });
        setLoading(false);
        return;
      }

      const payload: any = {
        company_name: 'WBS',
        user_id: user.id,
      };

      if (type === 'xml') {
        payload.xml_raw = rawContent;
      } else if (type === 'csv_base') {
        payload.csv_raw = sanitizeCSV(rawContent);
      } else if (type === 'csv_new') {
        payload.csv_new_raw = sanitizeCSV(rawContent);
        payload.CSV_final = sanitizeCSV(rawContent);
      }

      const { error } = await supabase
        .from('ClientsSERVEX_WBS')
        .update(payload)
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase Error:', error);
        setMessage({ text: `DB Error: ${error.message}`, type: 'error' });
      } else {
        setMessage({ text: 'Saved successfully', type: 'success' });
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
    <div className="w-full flex font-sans text-[#242424] relative bg-white/50 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-sm">
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
                <div className={`grid grid-cols-1 ${step === 'all' ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-3`}>
                  {/* Drop Zone 1: XML */}
                  {(step === 'all' || step === 'xml') && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                      ${dragActive ? 'border-[#464775] bg-[#464775]/5' : showXmlExistingNotice ? 'border-[#464775]/40 bg-[#464775]/5 hover:bg-[#464775]/10' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
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
                  )}

                  {/* Drop Zone 2: Base CSV */}
                  {(step === 'all' || step === 'csv_base') && (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActiveCSV(true); }}
                    onDragLeave={() => setDragActiveCSV(false)}
                    onDrop={handleDropCSV}
                    onClick={() => csvInputRef.current?.click()}
                    className={`border border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                      ${dragActiveCSV ? 'border-[#464775] bg-[#464775]/5' : showCsvExistingNotice ? 'border-[#464775]/40 bg-[#464775]/5 hover:bg-[#464775]/10' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                  >
                    {readingCsv ? (
                      <RefreshCw className="mx-auto mb-1.5 text-[#464775] animate-spin" size={20} />
                    ) : checkingExisting ? (
                      <RefreshCw className="mx-auto mb-1.5 text-gray-400 animate-spin" size={20} />
                    ) : showCsvExistingNotice ? (
                      <DatabaseZap className="mx-auto mb-1.5 text-[#464775]" size={20} />
                    ) : (
                      <FileSpreadsheet className={`mx-auto mb-1.5 ${dragActiveCSV ? 'text-[#464775]' : 'text-gray-400'}`} size={20} />
                    )}
                    <p className={`text-xs sm:text-sm font-bold mt-1.5 ${showCsvExistingNotice ? 'text-[#464775]' : 'text-[#242424]'}`}>
                      {readingCsv
                        ? 'Reading...'
                        : checkingExisting
                          ? 'Checking...'
                          : showCsvExistingNotice
                            ? 'File already exists in DB'
                            : 'Upload CSV Base'}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 font-medium leading-tight">Catálogo base — inicio del proceso</p>
                    {showCsvExistingNotice && (
                      <p className="text-[10px] text-indigo-500 mt-2 font-semibold bg-indigo-50/50 inline-block px-1.5 py-0.5 rounded-full">Click or drop to replace</p>
                    )}
                    <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readCSVFile(file); }} />
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
                      ${dragActiveNewCSV ? 'border-[#464775] bg-[#464775]/5' : showNewCsvExistingNotice ? 'border-[#464775]/40 bg-[#464775]/5 hover:bg-[#464775]/10' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
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

                {/* Previews */}
                <div className={`grid grid-cols-1 ${step === 'all' ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-3`}>
                  {(step === 'all' || step === 'xml') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">XML Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={xmlContent} readOnly />
                  </div>
                  )}
                  {(step === 'all' || step === 'csv_base') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">CSV Base Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={csvContent} readOnly />
                  </div>
                  )}
                  {(step === 'all' || step === 'csv_new') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">New CSV Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={csvNewContent} readOnly />
                  </div>
                  )}
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
