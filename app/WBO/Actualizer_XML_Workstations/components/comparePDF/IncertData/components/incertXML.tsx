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

export default function UploadClientXML() {
  const [companyName] = useState('WBO');
  const [xmlContent, setXmlContent] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [loading, setLoading] = useState(false);

  const [readingXml, setReadingXml] = useState(false);
  const [readingCsv, setReadingCsv] = useState(false);

  // --- Estado de verificación de columnas existentes en BD ---
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingXml, setExistingXml] = useState(false);
  const [existingCsv, setExistingCsv] = useState(false);

  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });
  const [dragActive, setDragActive] = useState(false);
  const [dragActiveCSV, setDragActiveCSV] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  // React Transition para prevenir bloqueos de renderizado en hilos de UI al cargar datasets grandes
  const [, startTransition] = useTransition();

  // --- Verificar si ya existe un registro con XML/CSV guardados para esta compañía ---
  const checkExistingFiles = useCallback(async () => {
    setCheckingExisting(true);
    try {
      const { data, error } = await supabase
        .from('ClientsSERVEX_WBO')
        .select('xml_raw, csv_raw')
        .eq('company_name', companyName)
        .maybeSingle();

      if (error) {
        console.error('Error checking existing files:', error);
        setExistingXml(false);
        setExistingCsv(false);
      } else if (data) {
        const hasXml = !!data.xml_raw && String(data.xml_raw).trim().length > 0;
        const hasCsv = !!data.csv_raw &&
          (Array.isArray(data.csv_raw) ? data.csv_raw.length > 0 : String(data.csv_raw).trim().length > 0);
        setExistingXml(hasXml);
        setExistingCsv(hasCsv);
      } else {
        setExistingXml(false);
        setExistingCsv(false);
      }
    } catch (err) {
      console.error('Unexpected error checking existing files:', err);
      setExistingXml(false);
      setExistingCsv(false);
    } finally {
      setCheckingExisting(false);
    }
  }, [companyName]);

  useEffect(() => {
    checkExistingFiles();
  }, [checkExistingFiles]);

  // --- ALGORITMO DE SANEAMIENTO ESTRUCTURAL EN MEMORIA (Equivalente al Script de Python) ---
  interface CsvRow {
    [key: string]: string | null | string[] | undefined;
    _orphaned_fields?: string[];
  }

  const sanitizeCSV = (rawCsvText: string): CsvRow[] => {
    if (!rawCsvText || !rawCsvText.trim()) return [];

    // Reconstrucción exacta del comportamiento de Python ante saltos de línea y comillas abiertas
    const lines: string[] = [];
    let currentLine = '';
    let insideQuotes = false;

    // Bucle iterativo directo optimizado para reducir la latencia de procesamiento de cadenas
    const len = rawCsvText.length;
    for (let i = 0; i < len; i++) {
      const char = rawCsvText[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && rawCsvText[i + 1] === '\n') {
          i++; // Omitir el siguiente \n de la secuencia \r\n
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

    // Detectar si la cabecera está rota en múltiples líneas por comillas abiertas
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

    // Limpieza de columnas preservada e igualada a la lógica de Python
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

    // Optimización con bucles indexados for para mitigar penalizaciones por Garbage Collection en memoria
    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      if (!line.trim()) continue; // Ignorar líneas vacías
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

      // Implementación del restkey de Python
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
        setMessage({ text: 'CSV file loaded successfully', type: 'success' });
        setReadingCsv(false);
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

  // --- Lógica de Saneamiento y Guardado ---
  const handleSave = async () => {
    setMessage({ text: '', type: null });
    if (!xmlContent.trim()) {
      setMessage({ text: 'XML content is required', type: 'error' });
      return;
    }
    setLoading(true);

    // Permitir el cambio de estado visual de UI de manera inmediata
    await new Promise(resolve => setTimeout(resolve, 0));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ text: 'User not authorized', type: 'error' });
        return;
      }

      console.log('[+] Iniciando saneamiento estructural sobre los contenidos CSV...');
      const sanitizedCsvJson = sanitizeCSV(csvContent);

      const payload = {
        company_name: 'WBO',
        xml_raw: xmlContent,
        csv_raw: sanitizedCsvJson,
        user_id: user.id,
      };

      // Modificación de red limpia y tipada: Evita el eco masivo de datos de vuelta por la red HTTP
      const { error } = await supabase
        .from('ClientsSERVEX_WBO ')
        .upsert(payload, { onConflict: 'company_name' })
        .select('');

      if (error) {
        console.error('Supabase Full Error:', error);
        setMessage({ text: `DB Error: ${error.message}`, type: 'error' });
      } else {
        setMessage({ text: 'WB Catalog Data successfully sanitized and stored', type: 'success' });
        setXmlContent('');
        setCsvContent('');
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

  // Determina si la zona debe mostrar el aviso de "ya existe en BD"
  const showXmlExistingNotice = existingXml && !xmlContent && !readingXml;
  const showCsvExistingNotice = existingCsv && !csvContent && !readingCsv;
return (
    <div className="min-h-[60vh] bg-[#FFF] flex font-sans text-[#242424] relative">
      <div className="flex-1 flex flex-col">

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

        {/* --- PAGE HEADER --- */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#464775]/10 rounded-md flex items-center justify-center">
              <FileCode className="text-[#464775]" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#242424]">WBO  Catalog Upload</h1>
              <p className="text-[11px] text-[#616161]">Upload master files to the Servex ecosystem</p>
            </div>
          </div>
        </div>

        {/* --- INFO BANNER: Propósito del catálogo --- */}
        <div className="bg-[#464775]/10 border-b border-[#464775]/20 px-8 py-3">
          <p className="text-[11px] text-[#464775] leading-relaxed max-w-4xl">
            Aquí podrás almacenar y reemplazar todos los datos crudos y bases del{' '}
            <span className="font-bold">WBO</span> correspondientes a los catálogos WBO de esta entidad.
          </p>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="p-8 grid grid-cols-12 gap-6 max-w-7xl mx-auto w-full">

          {/* Status Column */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Upload Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${xmlContent || existingXml ? 'bg-[#464775]/10 text-[#464775]' : 'bg-gray-100 text-gray-400'}`}>1</div>
                  <span className="text-xs font-medium">XML File</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${csvContent || existingCsv ? 'bg-[#464775]/10 text-[#464775]' : 'bg-gray-100 text-gray-400'}`}>2</div>
                  <span className="text-xs font-medium">CSV File (Will be Sanitized)</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-[#464775] mb-3">
                <Info size={16} />
                <span className="text-xs font-bold">Encrypted & Sanitized</span>
              </div>
              <p className="text-[11px] text-[#616161] leading-relaxed">
                Your data is parsed, structural breaks are fixed in-memory, and stored securely as compliant datasets.
              </p>

              {/* --- NUEVO: explicación de cada archivo --- */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-[#464775]">XML — Catalog Creator</p>
                  <p className="text-[10px] text-[#616161] leading-relaxed">
                    Es el catálogo generado por Catalog Creator. Representa la versión final/estructurada del catálogo.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#464775]">CSV — Catálogo Base</p>
                  <p className="text-[10px] text-[#616161] leading-relaxed">
                    Es el catálogo base con el que arranca el proceso: el paso anterior al último, previo a la generación del XML final.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Upload Column */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-6 space-y-6">

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#242424]">Target Entity</label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[#464775]" size={14} />
                    <input
                      className="w-full text-sm rounded border border-gray-100 bg-gray-50 pl-9 pr-4 py-2 outline-none font-bold text-[#464775] cursor-default"
                      value={companyName}
                      readOnly
                    />
                  </div>
                </div>

                {/* Drop Zones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer
                      ${dragActive ? 'border-[#464775] bg-[#464775]/5' : showXmlExistingNotice ? 'border-[#464775]/40 bg-[#464775]/5 hover:bg-[#464775]/10' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                  >
                    {readingXml ? (
                      <RefreshCw className="mx-auto mb-2 text-[#464775] animate-spin" size={20} />
                    ) : checkingExisting ? (
                      <RefreshCw className="mx-auto mb-2 text-gray-400 animate-spin" size={20} />
                    ) : showXmlExistingNotice ? (
                      <DatabaseZap className="mx-auto mb-2 text-[#464775]" size={20} />
                    ) : (
                      <UploadCloud className={`mx-auto mb-2 ${dragActive ? 'text-[#464775]' : 'text-gray-400'}`} size={20} />
                    )}
                    <p className={`text-[10px] font-bold ${showXmlExistingNotice ? 'text-[#464775]' : 'text-[#242424]'}`}>
                      {readingXml
                        ? 'Reading...'
                        : checkingExisting
                          ? 'Checking...'
                          : showXmlExistingNotice
                            ? 'File already exists in DB'
                            : 'Upload XML'}
                    </p>
                    <p className="text-[8px] text-[#9CA3AF] mt-0.5">Catálogo de Catalog Creator</p>
                    {showXmlExistingNotice && (
                      <p className="text-[9px] text-[#464775]/80 mt-1 font-medium">Click or drop to replace</p>
                    )}
                    <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readXMLFile(file); }} />
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActiveCSV(true); }}
                    onDragLeave={() => setDragActiveCSV(false)}
                    onDrop={handleDropCSV}
                    onClick={() => csvInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer
                      ${dragActiveCSV ? 'border-[#464775] bg-[#464775]/5' : showCsvExistingNotice ? 'border-[#464775]/40 bg-[#464775]/5 hover:bg-[#464775]/10' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                  >
                    {readingCsv ? (
                      <RefreshCw className="mx-auto mb-2 text-[#464775] animate-spin" size={20} />
                    ) : checkingExisting ? (
                      <RefreshCw className="mx-auto mb-2 text-gray-400 animate-spin" size={20} />
                    ) : showCsvExistingNotice ? (
                      <DatabaseZap className="mx-auto mb-2 text-[#464775]" size={20} />
                    ) : (
                      <FileSpreadsheet className={`mx-auto mb-2 ${dragActiveCSV ? 'text-[#464775]' : 'text-gray-400'}`} size={20} />
                    )}
                    <p className={`text-[10px] font-bold ${showCsvExistingNotice ? 'text-[#464775]' : 'text-[#242424]'}`}>
                      {readingCsv
                        ? 'Reading...'
                        : checkingExisting
                          ? 'Checking...'
                          : showCsvExistingNotice
                            ? 'File already exists in DB'
                            : 'Upload CSV'}
                    </p>
                    <p className="text-[8px] text-[#9CA3AF] mt-0.5">Catálogo base — inicio del proceso</p>
                    {showCsvExistingNotice && (
                      <p className="text-[9px] text-[#464775]/80 mt-1 font-medium">Click or drop to replace</p>
                    )}
                    <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readCSVFile(file); }} />
                  </div>
                </div>

                {/* Previews */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">XML Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={xmlContent} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">CSV Original Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={csvContent} readOnly />
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

              <div className="bg-[#FAF9F8] px-6 py-4 flex justify-end border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-[#464775] text-white px-8 py-2 rounded text-xs font-bold hover:bg-[#36375a] transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Sanitizing & Saving...' : 'Save Catalog Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}