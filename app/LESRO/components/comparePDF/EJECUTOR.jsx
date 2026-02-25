'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient'; // Asegúrate que esta ruta sea correcta en tu estructura
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Package, 
  Info,
  ChevronRight,
  DownloadCloud,
  X,
  Zap,
  Database, 
  FileSpreadsheet, 
  RefreshCw, 
  Search,
  Table as TableIcon,
  Download,
  Filter
} from 'lucide-react';

const ServexUnifiedPlatform = () => {
  // --- ESTADOS DE AUDIT UPLOADER (PARTE SUPERIOR) ---
  const [file, setFile] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // --- ESTADOS DE DATA VIEWER (PARTE INFERIOR) ---
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('csv_raw'); 
  const [searchTerm, setSearchTerm] = useState('');

  // --- EFECTOS INICIALES ---
  useEffect(() => {
    const hasSeenTutorial = sessionStorage.getItem('servex_audit_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    fetchLatestData();
  }, []);

  // --- LÓGICA DE DATA VIEWER ---
  const fetchLatestData = async () => {
    setLoadingData(true);
    try {
      const { data: record, error } = await supabase
        .from('ClientsSERVEX')
        .select('company_name, csv_raw, csvpdf_raw, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setData(record);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const parseCSV = (csvString, type) => {
    if (!csvString || csvString === '---') return [];
    const lines = csvString.trim().split('\n');
    if (lines.length < 1) return [];
    const delimiter = type === 'csv_raw' ? ';' : ',';
    const headers = lines[0].split(delimiter).map(h => h.replace(/"/g, '').trim());
    const dataLines = lines.slice(1);
    
    return dataLines.map(line => {
      const values = line.split(delimiter).map(v => v.replace(/"/g, '').trim());
      return headers.reduce((obj, header, i) => {
        const key = header || `Col_${i}`;
        obj[key] = values[i] || '';
        return obj;
      }, {});
    });
  };

  // --- LÓGICA DE AUDIT UPLOADER ---
  const closeTutorial = () => {
    setShowTutorial(false);
    sessionStorage.setItem('servex_audit_tutorial_seen', 'true');
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(false);
  };

  const handleUploadAndProcess = async () => {
    if (!file) {
      setError("Please select a CSV file to continue.");
      return;
    }

    setLoadingAudit(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Ejecución del Backend (Audit Process)
      const response = await fetch('http://localhost:8000/audit-process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'SERVEX_AI Server Error');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SERVEX_AI_PACK_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(true);
      
      // 2. Refrescar la tabla inferior automáticamente tras el éxito
      setTimeout(() => fetchLatestData(), 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Renderizado condicional de datos
  const currentCsvData = data ? parseCSV(data[activeTab], activeTab) : [];
  const filteredData = currentCsvData.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
      
      {/* POPUP TUTORIAL (AuditUploader) */}
      {showTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-[380px] rounded shadow-xl border border-[#d1d1d1] overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="bg-[#444791] px-4 py-2 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Optimization Module</span>
              </div>
              <button onClick={closeTutorial} className="hover:bg-white/20 p-0.5 rounded transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-5">
              <h2 className="text-sm font-bold text-[#242424] mb-2">LESRO Catalog Audit</h2>
              <p className="text-[12px] text-[#424242] leading-snug mb-4">
                Section optimized for the <strong>analysis and comparison</strong> of <strong>LESRO</strong> catalog updates.
              </p>
              <div className="space-y-2">
                <div className="flex gap-3 p-2.5 bg-[#f3f2f1] rounded border-l-2 border-[#444791]">
                  <FileText className="text-[#444791] shrink-0" size={16} />
                  <p className="text-[11px] text-[#424242]">Updated XML for <strong>CET Designer</strong>.</p>
                </div>
                <div className="flex gap-3 p-2.5 bg-[#f3f2f1] rounded border-l-2 border-[#444791]">
                  <CheckCircle className="text-[#237b4b] shrink-0" size={16} />
                  <p className="text-[11px] text-[#424242]">Automatic generation of detected changes.</p>
                </div>
              </div>
              <button onClick={closeTutorial} className="w-full mt-5 bg-[#444791] text-white py-1.5 rounded text-xs font-semibold hover:bg-[#3b3e7a]">Get Started</button>
            </div>
          </div>
        </div>
      )}

      {/* --- SECCIÓN SUPERIOR: AUDIT UPLOADER --- */}
      <div className="max-w-7xl mx-auto p-4 md:pt-8">
        <div className="bg-white rounded-md shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13)] overflow-hidden mb-6">
          <div className="bg-white border-b border-[#e1e1e1] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#444791] rounded-lg flex items-center justify-center text-white font-bold shadow-lg">S</div>
              <div>
                <h1 className="text-[#242424] text-lg font-semibold leading-tight">SERVEX_AI Data Engine</h1>
                <div className="flex items-center gap-2 text-xs text-[#444791]">
                  <span>Files</span> <ChevronRight size={12} /> <span className="font-semibold">Lesro Audit & Sync</span>
                </div>
              </div>
            </div>
            <button onClick={() => setShowTutorial(true)} className="p-2 hover:bg-[#f0f0f0] rounded-full text-[#616161]"><Info size={20}/></button>
          </div>

          <div className="p-8">
            <div className="relative border-2 border-dashed border-[#d1d1d1] rounded-lg bg-[#fafafa] p-10 flex flex-col items-center justify-center transition-colors hover:bg-[#f0f0f0] group">
              <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="w-16 h-16 bg-white border border-[#e1e1e1] rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:text-[#5B5FC7]">
                <DownloadCloud size={30} className="text-[#616161] group-hover:text-[#5B5FC7]" />
              </div>
              <h3 className="text-base font-semibold text-[#242424]">Drag catalog or click to browse</h3>
              {file && (
                <div className="mt-4 flex items-center gap-3 bg-[#e8ebfa] text-[#5B5FC7] px-4 py-2 rounded-md font-medium border border-[#c5cbef]">
                  <FileText size={18} /> <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center mt-6">
              <button
                onClick={handleUploadAndProcess}
                disabled={loadingAudit || !file}
                className={`min-w-[240px] py-2.5 px-6 rounded-sm font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  loadingAudit ? 'bg-[#f0f0f0] text-[#bdbdbd]' : 'bg-[#444791] text-white hover:opacity-90'
                }`}
              >
                {loadingAudit ? <Loader2 className="animate-spin" size={18} /> : <Package size={18} />}
                {loadingAudit ? "Processing..." : "Sync, Export & Preview"}
              </button>
              {success && <div className="mt-2 text-[#237b4b] text-sm font-semibold flex items-center gap-2"><CheckCircle size={16}/> Package generated & View updated</div>}
              {error && <div className="mt-2 p-3 bg-[#fde7e9] text-[#a4262c] rounded-sm text-sm flex items-center gap-2"><AlertCircle size={18}/> {error}</div>}
            </div>
          </div>
        </div>

        {/* --- SECCIÓN INFERIOR: DATA VIEWER --- */}
        <div className="bg-white rounded-md shadow-[0_3.2px_7.2px_0_rgba(0,0,0,0.13)] overflow-hidden flex flex-col h-[600px]">
          {/* HEADER DATA VIEWER */}
          <div className="bg-white px-6 py-3 border-b border-[#EDEBE9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#5B5FC7] p-2 rounded-lg shadow-md text-white"><Database size={20} /></div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-[#242424]">{data?.company_name || 'Loading...'}</h2>
                  <span className="text-[9px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-2 py-0.5 rounded-full">LIVE PREVIEW</span>
                </div>
                <p className="text-[10px] text-[#616161]">Database State: {data ? new Date(data.created_at).toLocaleString() : '--'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-[#F0F0F0] p-1 rounded-lg">
              <button onClick={() => setActiveTab('csv_raw')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeTab === 'csv_raw' ? 'bg-white text-[#5B5FC7] shadow-sm' : 'text-[#616161]'}`}>Manual</button>
              <button onClick={() => setActiveTab('csvpdf_raw')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeTab === 'csvpdf_raw' ? 'bg-white text-[#5B5FC7] shadow-sm' : 'text-[#616161]'}`}>PDF Sync</button>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="px-6 py-2 flex items-center justify-between gap-3 border-b border-[#EDEBE9]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={12} />
              <input type="text" placeholder="Search in table..." className="w-full pl-9 pr-4 py-1.5 bg-[#F0F0F0] text-[11px] rounded-t-md outline-none focus:bg-white transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={fetchLatestData} className="p-1.5 hover:bg-[#F0F0F0] rounded-full text-[#616161]"><RefreshCw className={loadingData ? "animate-spin" : ""} size={14} /></button>
          </div>

          {/* TABLE AREA */}
          <div className="flex-1 overflow-hidden flex flex-col m-2 border border-[#EDEBE9] rounded-lg">
            {loadingData ? (
              <div className="flex flex-1 flex-col items-center justify-center"><RefreshCw className="animate-spin text-[#5B5FC7] mb-2" /><span className="text-xs font-semibold">Synchronizing...</span></div>
            ) : filteredData.length > 0 ? (
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="min-w-full border-separate border-spacing-0 text-[10px]">
                  <thead>
                    <tr className="bg-[#FAF9F8]">
                      {Object.keys(currentCsvData[0]).map((header) => (
                        <th key={header} className="px-4 py-2 text-left font-bold text-[#242424] sticky top-0 bg-[#FAF9F8] z-10 border-b border-r border-[#EDEBE9] uppercase text-[9px]">
                          <div className="flex items-center gap-1.5">{header} <Filter size={8} className="opacity-40" /></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F0F0]">
                    {filteredData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F5F5F7] transition-colors">
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="px-4 py-2 text-[#424242] border-r border-[#F0F0F0]/50 whitespace-nowrap">{val || '---'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-[#616161]"><TableIcon size={32} className="mb-2 opacity-20" /><p className="text-xs">No data available</p></div>
            )}
          </div>

          {/* FOOTER INTERNO */}
          <div className="px-4 py-2 bg-[#f0f0f0] flex justify-between items-center text-[10px] text-[#616161] font-medium">
            <span>{filteredData.length} records found</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> System Active</span>
              <span>SERVEX_AI © 2026</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D1D1; border-radius: 10px; border: 2px solid #FFF; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F5F5F5; }
        table { table-layout: auto !important; width: max-content !important; }
      `}</style>
    </div>
  );
};

export default ServexUnifiedPlatform;