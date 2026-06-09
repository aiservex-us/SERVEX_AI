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
  const [companyName, setCompanyName] = useState('WBT'); // Mantenido por consistencia de UI, mapeado a WBD en la persistencia si aplica
  const [xmlContent, setXmlContent] = useState('');
  const [csvContent, setCsvContent] = useState(''); 
  const [csvPdfContent, setCsvPdfContent] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  const [readingXml, setReadingXml] = useState(false);
  const [readingCsv, setReadingCsv] = useState(false);
  const [readingCsvPdf, setReadingCsvPdf] = useState(false);

  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | null }>({ text: '', type: null });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null); 
  const csvPdfInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * PARSER ULTRA-SOFISTICADO DE CSV CON MÁQUINA DE ESTADOS
   * Resuelve saltos de línea internos, comillas dobles y previene colisión de llaves.
   */
  const parseCSVToRows = (text: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        // Manejo de comillas dobles escapadas ("") de SQL/CSV estándar
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // Omitir la siguiente comilla
        } else {
          insideQuotes = !insideQuotes; // Conmutar estado de comillas
        }
      } else if (char === ';' && !insideQuotes) {
        currentRow.push(currentCell);
        currentCell = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // Manejo de saltos de línea Windows (CRLF)
        }
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    // Agregar residuo final si existe
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell);
      rows.push(currentRow);
    }
    return rows;
  };

  /**
   * SANEADOR DE ESTRUCTURA Y NORMALIZADOR DE CABECERAS
   */
  const sanitizeCSV = (rawCsvText: string): any[] => {
    if (!rawCsvText || !rawCsvText.trim()) return [];

    const allRows = parseCSVToRows(rawCsvText);
    if (allRows.length === 0) return [];

    // Extraer y sanear la primera fila (Cabecera)
    const rawHeaders = allRows[0];
    const cleanedHeaders = rawHeaders.map(header => {
      let hClean = header.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '').replace(/'/g, '');
      hClean = hClean.split(/\s+/).join(' ').trim();
      return hClean || 'unnamed_column';
    });

    // SISTEMA ANTICOLISIÓN DE CABECERAS: Asegura llaves únicas para el JSONB de PostgreSQL
    const perfectHeaders: string[] = [];
    const headerCounts: { [key: string]: number } = {};

    cleanedHeaders.forEach(header => {
      if (headerCounts[header] === undefined) {
        headerCounts[header] = 0;
        perfectHeaders.push(header);
      } else {
        headerCounts[header]++;
        perfectHeaders.push(`${header}_${headerCounts[header]}`);
      }
    });

    const dataRows = allRows.slice(1);
    const sanitizedJson: any[] = [];

    dataRows.forEach(row => {
      // Filtrar filas completamente vacías
      if (row.length === 0 || (row.length === 1 && row[0].trim() === '')) return;

      const rowObject: any = {};

      perfectHeaders.forEach((header, index) => {
        let cellValue = row[index] !== undefined ? row[index] : '';
        cellValue = cellValue.trim();

        // Preservación estricta de nulos para Servex US
        if (cellValue === '') {
          rowObject[header] = null;
        } else {
          // Remover comillas residuales en los extremos del valor procesado
          rowObject[header] = cellValue.replace(/^["']|["']$/g, '').trim();
        }
      });

      // Captura de campos huérfanos (restkey) por desalineación de la fila
      if (row.length > perfectHeaders.length) {
        rowObject['_orphaned_fields'] = row.slice(perfectHeaders.length).map(c => c.trim());
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

  // --- Lógica de Persistencia Alineada al DDL ---
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

      console.log('[+] Iniciando saneamiento de matrices CSV...');
      const sanitizedCsvJson = sanitizeCSV(csvContent);
      const sanitizedCsvPdfJson = sanitizeCSV(csvPdfContent);

      /**
       * ALINEACIÓN ESTRICTA CON TU DDL:
       * Los objetos JSON se convierten a string mediante JSON.stringify 
       * para almacenarse de forma correcta en los campos de destino de Supabase.
       */
      const payload = {
        company_name: 'Servex US - WBT',
        xml_raw: xmlContent, 
        csv_raw: csvContent, // Guardamos el texto plano original en el campo text
        csv_optimizer_raw: JSON.stringify(sanitizedCsvJson), // Mapeado a la columna JSONB/Text optimizada
        informa_agent_raw: JSON.stringify(sanitizedCsvPdfJson), // Reutilización estructurada o mapeo según arquitectura de negocio
        user_id: user.id,
      };

      // Inyección exacta en la tabla 'ClientsSERVEX_WBD' de acuerdo al DDL de Postgres
      const { error } = await supabase.from('ClientsSERVEX_WBD').upsert(payload, { 
        onConflict: 'id' // Cambiado a 'id' o la restricción de unicidad real de tu tabla
      });

      if (error) {
        console.error('Supabase Full Error:', error);
        setMessage({ text: `DB Error [${error.code}]: ${error.message}`, type: 'error' });
      } else {
        setMessage({ text: 'WB Catalog Data successfully sanitized and stored in ClientsSERVEX_WBD', type: 'success' });
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
    <div className="min-h-screen bg-white flex font-sans text-[#242424] relative">
      <div className="flex-1 flex flex-col">
        {/* --- CABECERA --- */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8EAF6] rounded-md flex items-center justify-center">
              <FileCode className="text-[#5B5FC7]" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#242424]">WB Catalog Upload & Sanitize</h1>
              <p className="text-[11px] text-[#616161]">Infraestructura de datos optimizada para Servex US</p>
            </div>
          </div>
        </div>

        {/* --- GRID DE CONTENIDO --- */}
        <div className="p-8 grid grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
          
          {/* Panel de Estado Lateral */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Upload Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${xmlContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>1</div>
                  <span className="text-xs font-medium">XML Master File</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${csvContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>2</div>
                  <span className="text-xs font-medium">CSV Target (State Machine Cleaned)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${csvPdfContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>3</div>
                  <span className="text-xs font-medium">PDF CSV Sync</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-[#5B5FC7] mb-3">
                <Info size={16} />
                <span className="text-xs font-bold">Arquitectura de Datos</span>
              </div>
              <p className="text-[11px] text-[#616161] leading-relaxed">
                El motor analiza caracteres especiales, sanitiza colisiones de nombres redundantes de columnas como <code className="font-mono bg-gray-100 px-1 rounded">Top</code> y empaqueta el dataset listo para el motor PostgreSQL.
              </p>
            </div>
          </div>

          {/* Formulario Principal */}
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

                {/* Zonas de Carga de Archivos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]"
                  >
                    {readingXml ? <RefreshCw className="mx-auto mb-2 text-[#5B5FC7] animate-spin" size={20} /> : <UploadCloud className="mx-auto mb-2 text-gray-400" size={20} />}
                    <p className="text-[10px] font-bold text-[#242424]">{readingXml ? 'Reading...' : 'Upload XML'}</p>
                    <input ref={fileInputRef} type="file" accept=".xml" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readXMLFile(file); }} />
                  </div>

                  <div
                    onClick={() => csvInputRef.current?.click()}
                    className="border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]"
                  >
                    {readingCsv ? <RefreshCw className="mx-auto mb-2 text-[#5B5FC7] animate-spin" size={20} /> : <FileSpreadsheet className="mx-auto mb-2 text-gray-400" size={20} />}
                    <p className="text-[10px] font-bold text-[#242424]">{readingCsv ? 'Reading...' : 'Upload CSV'}</p>
                    <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readCSVFile(file); }} />
                  </div>

                  <div
                    onClick={() => csvPdfInputRef.current?.click()}
                    className="border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]"
                  >
                    {readingCsvPdf ? <RefreshCw className="mx-auto mb-2 text-[#5B5FC7] animate-spin" size={20} /> : <FileType className="mx-auto mb-2 text-gray-400" size={20} />}
                    <p className="text-[10px] font-bold text-[#242424]">{readingCsvPdf ? 'Reading...' : 'Upload CSV (PDF)'}</p>
                    <input ref={csvPdfInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) readCsvPdfFile(file); }} />
                  </div>
                </div>

                {/* Previsualizaciones */}
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
                  className="bg-[#5B5FC7] text-white px-8 py-2 rounded text-xs font-bold hover:bg-[#4E52B1] transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Saneando y Persistiendo...' : 'Procesar y Guardar Catálogo'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  ); 
}