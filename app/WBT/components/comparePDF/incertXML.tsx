'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  FileCode, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  UploadCloud,
  FileSpreadsheet,
  RefreshCw, 
  FileType,
  Info
} from 'lucide-react';

export default function UploadClientXML() {
  const [companyName, setCompanyName] = useState('WB');
  const [xmlContent, setXmlContent] = useState('');
  const [csvContent, setCsvContent] = useState(''); 
  const [csvPdfContent, setCsvPdfContent] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  const [readingXml, setReadingXml] = useState(false);
  const [readingCsv, setReadingCsv] = useState(false);
  const [readingCsvPdf, setReadingCsvPdf] = useState(false);

  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });
  const [dragActive, setDragActive] = useState(false);
  const [dragActiveCSV, setDragActiveCSV] = useState(false); 
  const [dragActiveCsvPdf, setDragActiveCsvPdf] = useState(false); 

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null); 
  const csvPdfInputRef = useRef<HTMLInputElement | null>(null); 

  // --- ALGORITMO DE SANEAMIENTO ESTRUCTURAL EN MEMORIA (Equivalente al Script de Python) ---
  const sanitizeCSV = (rawCsvText: string): any[] => {
    if (!rawCsvText || !rawCsvText.trim()) return [];

    // Separar por líneas nativas
    const lines = rawCsvText.split(/\r?\n/);
    if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) return [];

    const rawHeaderAccum: string[] = [];
    let dataStartIndex = 0;
    let openQuotes = false;

    // Detectar si la cabecera está rota en múltiples líneas por comillas abiertas
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      rawHeaderAccum.push(line);
      
      // Cuenta cuántas comillas hay para ver si cierran el bloque
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
    
    // Limpieza ultra-sofisticada de columnas (Preservado de la lógica Python)
    const tokens = fullRawHeader.split(';');
    const cleanedTokens = tokens.map(token => {
      let tClean = token.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '').replace(/'/g, '');
      tClean = tClean.replace(/\s+/g, ' ').trim(); // Limpia espacios múltiples
      return tClean;
    });

    const perfectHeaders = cleanedTokens;
    const dataLines = lines.slice(dataStartIndex);
    const sanitizedJson: any[] = [];

    // Re-estructurar la matriz de datos mapeando contra los headers perfectos
    dataLines.forEach(line => {
      if (!line.trim()) return; // Ignorar líneas vacías al final
      const currentCells = line.split(';');
      const rowObject: any = {};

      perfectHeaders.forEach((header, index) => {
        // Si el header existe, asignamos el valor limpio de comillas extrañas
        let cellValue = currentCells[index] !== undefined ? currentCells[index] : '';
        cellValue = cellValue.replace(/^["']|["']$/g, '').trim(); // Remover comillas envolventes de los datos
        rowObject[header] = cellValue;
      });

      // Implementación del `restkey` de Python para atrapar campos huérfanos por desalineación
      if (currentCells.length > perfectHeaders.length) {
        const orphaned = currentCells.slice(perfectHeaders.length).map(c => c.replace(/^["']|["']$/g, '').trim());
        rowObject['_orphaned_fields'] = orphaned;
      }

      sanitizedJson.push(rowObject);
    });

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
      setXmlContent(e.target?.result as string);
      setMessage({ text: 'XML file loaded successfully', type: 'success' });
      setReadingXml(false);
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
      setCsvContent(e.target?.result as string);
      setMessage({ text: 'CSV file loaded successfully', type: 'success' });
      setReadingCsv(false);
    };
    reader.readAsText(file);
  };

  const readCsvPdfFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage({ text: 'Only CSV files (PDF Transformed) are allowed', type: 'error' });
      return;
    }
    setReadingCsvPdf(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvPdfContent(e.target?.result as string);
      setMessage({ text: 'PDF CSV loaded successfully', type: 'success' });
      setReadingCsvPdf(false);
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

  const handleDropCsvPdf = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setDragActiveCsvPdf(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readCsvPdfFile(file);
  };

  // --- Lógica de Saneamiento y Guardado ---
  const handleSave = async () => {
    setMessage({ text: '', type: null });
    if (!xmlContent.trim()) {
      setMessage({ text: 'XML content is required', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { 
        setMessage({ text: 'User not authorized', type: 'error' }); 
        return; 
      }

      // 1. Ejecutar el Saneamiento en memoria antes de guardar
      console.log('[+] Iniciando saneamiento estructural sobre los contenidos CSV...');
      const sanitizedCsvJson = sanitizeCSV(csvContent);
      const sanitizedCsvPdfJson = sanitizeCSV(csvPdfContent);

      // 2. Definir el Payload Unificado preparado para campos JSONB en Supabase
      const payload = {
        company_name: 'WBT', 
        xml_raw: xmlContent, 
        csv_raw: sanitizedCsvJson,      // Se inyecta la estructura JSON limpia
        csvpdf_raw: sanitizedCsvPdfJson, // Se inyecta la estructura JSON limpia
        user_id: user.id,
      };

      // 3. Persistencia en la tabla principal (con control de conflictos)
      const { error } = await supabase.from('ClientsSERVEX_WBT').upsert(payload, { 
        onConflict: 'company_name' 
      });

      if (error) {
        console.error('Supabase Full Error:', error);
        setMessage({ text: `DB Error: ${error.message}`, type: 'error' });
      } else {
        setMessage({ text: 'WB Catalog Data successfully sanitized and stored', type: 'success' });
        setXmlContent(''); 
        setCsvContent(''); 
        setCsvPdfContent('');
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ text: 'Unexpected client-side error', type: 'error' });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF] flex font-sans text-[#242424] relative">
      <div className="flex-1 flex flex-col">
        
        {/* --- PAGE HEADER --- */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8EAF6] rounded-md flex items-center justify-center">
              <FileCode className="text-[#5B5FC7]" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#242424]">WB Catalog Upload</h1>
              <p className="text-[11px] text-[#616161]">Upload master files to the Servex ecosystem</p>
            </div>
          </div>
        </div>

        {/* --- CONTENT GRID --- */}
        <div className="p-8 grid grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
          
          {/* Status Column */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Upload Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${xmlContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>1</div>
                  <span className="text-xs font-medium">XML File</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${csvContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>2</div>
                  <span className="text-xs font-medium">CSV File (Will be Sanitized)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${csvPdfContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>3</div>
                  <span className="text-xs font-medium">PDF CSV Sync (Will be Sanitized)</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-[#5B5FC7] mb-3">
                <Info size={16} />
                <span className="text-xs font-bold">Encrypted & Sanitized</span>
              </div>
              <p className="text-[11px] text-[#616161] leading-relaxed">
                Your data is parsed, structural breaks are fixed in-memory, and stored securely as compliant datasets.
              </p>
            </div>
          </div>

          {/* Main Upload Column */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-6 space-y-6">
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#242424]">Target Entity</label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B5FC7]" size={14} />
                    <input
                      className="w-full text-sm rounded border border-gray-100 bg-gray-50 pl-9 pr-4 py-2 outline-none font-bold text-[#5B5FC7] cursor-default"
                      value={companyName}
                      readOnly
                    />
                  </div>
                </div>

                {/* Drop Zones */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer
                      ${dragActive ? 'border-[#5B5FC7] bg-[#F3F2F1]' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                  >
                    {readingXml ? <RefreshCw className="mx-auto mb-2 text-[#5B5FC7] animate-spin" size={20} /> : <UploadCloud className={`mx-auto mb-2 ${dragActive ? 'text-[#5B5FC7]' : 'text-gray-400'}`} size={20} />}
                    <p className="text-[10px] font-bold text-[#242424]">{readingXml ? 'Reading...' : 'Upload XML'}</p>
                    <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readXMLFile(file); }} />
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActiveCSV(true); }}
                    onDragLeave={() => setDragActiveCSV(false)}
                    onDrop={handleDropCSV}
                    onClick={() => csvInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer
                      ${dragActiveCSV ? 'border-[#5B5FC7] bg-[#F3F2F1]' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                  >
                    {readingCsv ? <RefreshCw className="mx-auto mb-2 text-[#5B5FC7] animate-spin" size={20} /> : <FileSpreadsheet className={`mx-auto mb-2 ${dragActiveCSV ? 'text-[#5B5FC7]' : 'text-gray-400'}`} size={20} />}
                    <p className="text-[10px] font-bold text-[#242424]">{readingCsv ? 'Reading...' : 'Upload CSV'}</p>
                    <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readCSVFile(file); }} />
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActiveCsvPdf(true); }}
                    onDragLeave={() => setDragActiveCsvPdf(false)}
                    onDrop={handleDropCsvPdf}
                    onClick={() => csvPdfInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer
                      ${dragActiveCsvPdf ? 'border-[#5B5FC7] bg-[#F3F2F1]' : 'border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]'}`}
                  >
                    {readingCsvPdf ? <RefreshCw className="mx-auto mb-2 text-[#5B5FC7] animate-spin" size={20} /> : <FileType className={`mx-auto mb-2 ${dragActiveCsvPdf ? 'text-[#5B5FC7]' : 'text-gray-400'}`} size={20} />}
                    <p className="text-[10px] font-bold text-[#242424]">{readingCsvPdf ? 'Reading...' : 'Upload CSV (PDF)'}</p>
                    <input ref={csvPdfInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readCsvPdfFile(file); }} />
                  </div>
                </div>

                {/* Previews */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">XML Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={xmlContent} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">CSV Original Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={csvContent} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">PDF CSV Original Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={csvPdfContent} readOnly />
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
                  className="bg-[#5B5FC7] text-white px-8 py-2 rounded text-xs font-bold hover:bg-[#4E52B1] transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-2"
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