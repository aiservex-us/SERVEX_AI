'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import Link from 'next/link'; 
import { 
  UploadCloud, 
  FileCode, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  FileUp,
  Info,
  MoreHorizontal,
  Settings2,
  HelpCircle,
  Maximize2,
  FileSpreadsheet,
  RefreshCw, 
  FileType,
  Trash2
} from 'lucide-react';

export default function UploadClientXML() {
  // --- Lógica de Estado (Actualizado a WB) ---
  const [companyName, setCompanyName] = useState('WB');
  const [xmlContent, setXmlContent] = useState('');
  const [csvContent, setCsvContent] = useState(''); 
  const [csvPdfContent, setCsvPdfContent] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  // --- Estados para Reset e Historial ---
  const [resetLoading, setResetLoading] = useState(false);
  const [isHistoryCleared, setIsHistoryCleared] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  // --- Lógica de Guardado (Tabla: ClientsSERVEX_WB) ---
  const handleSave = async () => {
    setMessage({ text: '', type: null });
    
    if (!companyName.trim() || !xmlContent.trim()) {
      setMessage({ text: 'Name and XML are required', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // 1. Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setMessage({ text: 'Authorization error. Please login again.', type: 'error' });
        setLoading(false);
        return;
      }

      // 2. Insertar en la tabla con el nombre exacto (case-sensitive)
      const { error } = await supabase
        .from('ClientsSERVEX_WB')
        .insert({
          company_name: companyName, 
          xml_raw: xmlContent, 
          csv_raw: csvContent, 
          csvpdf_raw: csvPdfContent, 
          user_id: user.id,
        });

      if (error) {
        console.error("Supabase error detail:", error);
        setMessage({ text: `Error: ${error.message}`, type: 'error' });
      } else {
        setMessage({ text: 'Data saved successfully', type: 'success' });
        setXmlContent(''); 
        setCsvContent(''); 
        setCsvPdfContent('');
        setIsHistoryCleared(false);
      }
    } catch (err) {
      console.error("Unexpected failure:", err);
      setMessage({ text: 'An unexpected error occurred during save', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Reset (Filtrando por WB) ---
  const executeReset = async () => {
    setShowConfirmModal(false);
    setResetLoading(true);
    setMessage({ text: '', type: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMessage({ text: 'User not authorized', type: 'error' }); return; }

      const { error } = await supabase
        .from('ClientsSERVEX_WB')
        .delete()
        .eq('company_name', 'WB')
        .eq('user_id', user.id);

      if (error) setMessage({ text: 'Error cleaning database', type: 'error' });
      else {
        setMessage({ text: 'History deleted successfully.', type: 'success' });
        setXmlContent(''); setCsvContent(''); setCsvPdfContent('');
        setIsHistoryCleared(true);
      }
    } catch (err) {
      setMessage({ text: 'An unexpected error occurred', type: 'error' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF] flex font-sans text-[#242424] relative">
      
      {/* --- MODAL DE CONFIRMACIÓN --- */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-left">
              <div className="flex items-center gap-4 mb-4 text-red-600">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                You are about to delete all history for **WB**. This action is irreversible and the current master files will be lost. Do you wish to continue?
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 rounded text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button onClick={executeReset} className="bg-red-600 text-white px-6 py-2 rounded text-xs font-bold hover:bg-red-700 transition-all shadow-sm active:scale-95">
                Yes, delete history
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        
        {/* --- TOP BAR --- */}
        <div className="h-12 bg-[#464775] flex items-center justify-between px-4 shadow-sm z-10">
          <div className="flex items-center gap-4 text-white">
            <div className="bg-white p-1 rounded-sm">
              <FileUp size={14} className="text-[#464775]" />
            </div>
            <span className="text-xs font-semibold">Servex Ingest Engine (WB)</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <HelpCircle size={16} />
            <Settings2 size={16} />
          </div>
        </div>

        {/* --- HEADER --- */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8EAF6] rounded-md flex items-center justify-center">
              <FileCode className="text-[#5B5FC7]" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#242424]">WB Catalog Upload</h1>
              <p className="text-[11px] text-[#616161]">Structured data processing for WB environment</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-md text-gray-500"><Maximize2 size={16} /></button>
            <button className="p-2 hover:bg-gray-100 rounded-md text-gray-500"><MoreHorizontal size={16} /></button>
          </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="p-8 grid grid-cols-12 gap-6 max-w-7xl">
          
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Process Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${companyName ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>1</div>
                  <span className="text-xs font-medium">Entity: WB</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${xmlContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>2</div>
                  <span className="text-xs font-medium">XML Validation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${csvContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>3</div>
                  <span className="text-xs font-medium">CSV Upload</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${csvPdfContent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>4</div>
                  <span className="text-xs font-medium">PDF Sync</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 text-[#5B5FC7] mb-3">
                <Info size={16} />
                <span className="text-xs font-bold">Security Note</span>
              </div>
              <p className="text-[11px] text-[#616161] leading-relaxed">
                This channel is end-to-end encrypted. Data is stored in isolated WB instances.
              </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-4">
            
            {/* PANEL DE RESET */}
            <div className={`rounded-lg border p-6 mb-4 shadow-sm flex flex-col items-center text-center transition-colors duration-500 ${isHistoryCleared ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isHistoryCleared ? 'bg-green-100' : 'bg-red-100'}`}>
                {isHistoryCleared ? <CheckCircle2 className="text-green-600" size={20} /> : <Trash2 className="text-red-600" size={20} />}
              </div>
              <h2 className={`text-sm font-black uppercase tracking-wider mb-1 ${isHistoryCleared ? 'text-green-900' : 'text-red-900'}`}>
                {isHistoryCleared ? 'WB DATABASE READY' : 'WB CLEANUP RECOMMENDED'}
              </h2>
              <p className={`text-[11px] max-w-md mb-4 leading-normal font-medium ${isHistoryCleared ? 'text-green-700' : 'text-red-700'}`}>
                {isHistoryCleared 
                  ? 'History for WB has been cleared. You can now upload new files.' 
                  : 'Clear the WB history before adding new master files.'}
              </p>
              <button 
                onClick={() => setShowConfirmModal(true)}
                disabled={resetLoading || isHistoryCleared}
                className={`text-white px-6 py-2 rounded text-[11px] font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95 disabled:opacity-50 ${isHistoryCleared ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {resetLoading ? <RefreshCw className="animate-spin" size={14} /> : (isHistoryCleared ? <CheckCircle2 size={14} /> : <Trash2 size={14} />)}
                {isHistoryCleared ? 'History Cleared' : 'Delete WB History'}
              </button>
            </div>

            <div className="bg-[#F3F2F1] rounded-lg border border-[#E1DFDD] p-6 mb-4 shadow-sm flex flex-col items-center text-center">
              <h2 className="text-sm font-black text-[#242424] uppercase tracking-wider mb-1">SYNC WB CATALOG</h2>
              <p className="text-[11px] text-[#616161] max-w-md mb-4 leading-normal">
                If the WB data comes from a PDF, use the synchronizer to format it correctly.
              </p>
              <Link href="/synchronizer" className="bg-white border border-[#5B5FC7] text-[#5B5FC7] px-6 py-2 rounded text-[11px] font-bold hover:bg-[#5B5FC7] hover:text-white transition-all flex items-center gap-2 shadow-sm">
                <RefreshCw size={14} />
                Go to Synchronizer
              </Link>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-6 space-y-6">
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#242424]">Company / Client</label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B5FC7]" size={14} />
                    <input
                      className="w-full text-sm rounded border border-gray-100 bg-gray-50 pl-9 pr-4 py-2 outline-none font-bold text-[#5B5FC7] cursor-default"
                      value={companyName}
                      readOnly
                    />
                  </div>
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">XML Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={xmlContent} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">CSV Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={csvContent} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">PDF CSV Preview</label>
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
                  {loading ? 'Saving WB Data...' : 'Save WB Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}