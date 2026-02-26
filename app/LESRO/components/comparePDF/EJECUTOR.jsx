import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, FiCheck, FiZap, FiShield, FiX, FiSearch, 
  FiAlertTriangle, FiArrowRight, FiCheckCircle, FiInfo, FiXCircle, FiCode, FiDatabase
} from 'react-icons/fi';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';
import { 
  FileText, CheckCircle, AlertCircle, Loader2, Package, 
  ChevronRight, DownloadCloud, X, Zap, Terminal
} from 'lucide-react';

import { supabase } from '../../../lib/supabaseClient';

const SVXUnifiedPlatform = () => {
  // --- ESTADOS DE NAVEGACIÓN ---
  const [activeTab, setActiveTab] = useState('console'); // console, audit_json, xml_view

  // --- ESTADOS UNIFICADOS ---
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState([]); 
  const [masterDataRows, setMasterDataRows] = useState([]);
  
  // --- ESTADOS DE SUPABASE (RESULTADOS) ---
  const [auditReportJson, setAuditReportJson] = useState(null);
  const [xmlActualizerRaw, setXmlActualizerRaw] = useState("");

  // --- ESTADOS DE CONTROL ---
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null); 
  const [diffCount, setDiffCount] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [backendSuccess, setBackendSuccess] = useState(false);
  const [backendError, setBackendError] = useState(null);

  // Lógica manual para descargar el XML
  const handleDownloadXML = () => {
    if (!xmlActualizerRaw) return;
    const blob = new Blob([xmlActualizerRaw], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SERIVEX_ACTUALIZER_${new Date().getTime()}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Lógica para obtener datos frescos de Supabase tras el proceso
  const fetchCloudData = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from('ClientsSERVEX')
        .select('audit_report_json, xml_actualizer_raw')
        .eq('company_name', 'LESRO')
        .maybeSingle();
      
      if (error) throw error;
      
      if (dbData) {
        // Aseguramos que el JSON se maneje correctamente si viene como string
        const report = typeof dbData.audit_report_json === 'string' 
          ? JSON.parse(dbData.audit_report_json) 
          : dbData.audit_report_json;

        setAuditReportJson(report);
        setXmlActualizerRaw(dbData.xml_actualizer_raw);
      }
    } catch (err) {
      console.error("Error fetching cloud data:", err);
      showAlert("Error al sincronizar datos de la nube", "error");
    }
  };

  const processFileSelection = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      showAlert("Formato no válido. Use solo .CSV", "error");
      return;
    }
    setFile(selectedFile);
    setFileName(selectedFile.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length === 0) return;
      const sampleLine = lines.find(l => l.includes(';') || l.includes(','));
      const delimiter = sampleLine && sampleLine.includes(';') ? ';' : ',';
      const matrix = lines.map(line => line.split(delimiter).map(cell => cell.trim()));
      setData(matrix);
      showAlert("Archivo vinculado", "success");
    };
    reader.readAsText(selectedFile);
  };

  const handleUnifiedProcess = async () => {
    if (!file) { showAlert("Primero cargue un archivo CSV", "warning"); return; }
    setIsProcessing(true);
    setBackendError(null);
    
    // Limpiamos estados previos para asegurar que el usuario vea la nueva data
    setAuditReportJson(null);
    setXmlActualizerRaw("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/audit-process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'SERVEX_AI Error');
      }

      const result = await response.json();
      setBackendSuccess(true);
      
      // Breve espera para asegurar que la escritura en Supabase sea consistente
      await new Promise(resolve => setTimeout(resolve, 200));

      // Obtener los datos actualizados de las columnas
      await fetchCloudData();
      showAlert("Sincronización con Supabase exitosa", "success");

    } catch (err) {
      setBackendError(err.message);
      showAlert(err.message, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
  };

  const handleFullReset = () => {
    setData([]); setFile(null); setFileName(""); setMatchStatus(null);
    setBackendSuccess(false); setAuditReportJson(null); setXmlActualizerRaw("");
  };

  return (
    <div className="h-[88vh] bg-[#FDFDFD] p-6 font-sans text-[#242424] max-w-[1600px] mx-auto space-y-4">
      
      {/* HEADER INTEGRADO */}
      <header className="flex items-center justify-between bg-white p-4 border border-[#EDEBE9] rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#444791] rounded flex items-center justify-center text-white font-bold">SVX</div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-tight">SERVEX_AI Unified Hub</h1>
            <p className="text-[10px] text-gray-500 font-medium">Control Centralizado de Ingeniería de Datos</p>
          </div>
        </div>

        {/* MENÚ DE NAVEGACIÓN SUPERIOR */}
        <nav className="flex bg-[#F3F2F1] p-1 rounded-md gap-1">
          <TabButton active={activeTab === 'console'} onClick={() => setActiveTab('console')} icon={<Terminal size={12}/>} label="Consola" />
          <TabButton active={activeTab === 'audit_json'} onClick={() => setActiveTab('audit_json')} icon={<FiDatabase size={12}/>} label="Audit JSON (Cloud)" />
          <TabButton active={activeTab === 'xml_view'} onClick={() => setActiveTab('xml_view')} icon={<FiCode size={12}/>} label="XML Actualizer" />
        </nav>

        <div className="flex gap-2">
            {file && <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <FiCheck size={10}/> {fileName}
            </span>}
            <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[72vh]">
        {/* PANEL IZQUIERDO: PROTOCOLO */}
        <aside className="col-span-3 flex flex-col gap-4">
          <div className="bg-white border border-[#EDEBE9] rounded-lg p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-[#464775] mb-6 uppercase">Pipeline de Ejecución</h3>
            <div className="space-y-6">
              <Step icon={<FiUploadCloud size={14}/>} title="Carga de Datos" desc={fileName || "Esperando CSV"} active={!!file} />
              <Step icon={<FiZap size={14}/>} title="Sync Cloud" desc={backendSuccess ? "Almacenado" : "Pendiente"} active={backendSuccess} isLast />
            </div>
          </div>

          <div className="bg-[#444791] text-white rounded-lg p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-yellow-400" />
              <h4 className="text-xs font-bold uppercase">Acciones de Plataforma</h4>
            </div>
            <p className="text-[11px] opacity-80 mb-4">Procesa el archivo y actualiza automáticamente las columnas de auditoría en Supabase.</p>
            <button 
              onClick={handleUnifiedProcess}
              disabled={!file || isProcessing}
              className="w-full bg-white text-[#444791] py-2 rounded font-bold text-[11px] hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <FiZap size={14} />}
              PROCESS & SYNC TO CLOUD
            </button>
            <button onClick={handleFullReset} className="w-full mt-2 py-2 text-[10px] font-bold opacity-60 hover:opacity-100 uppercase tracking-widest">Reset System</button>
          </div>
        </aside>

        {/* PANEL CENTRAL: CONTENIDO DINÁMICO SEGÚN TAB */}
        <main className="col-span-9 bg-white border border-[#EDEBE9] rounded-lg shadow-sm flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'console' && (
              <motion.div key="console" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col h-full">
                <div className="p-4 border-b border-[#EDEBE9] flex justify-between items-center bg-[#FAF9F8]">
                  <h2 className="text-xs font-black text-[#464775] uppercase">Visor de Comparación Local</h2>
                </div>
                <div className="flex-grow overflow-auto">
                   {!file ? (
                     <div className="h-full flex flex-col items-center justify-center opacity-40">
                       <DownloadCloud size={40} />
                       <p className="text-[11px] font-bold mt-2">Arrastre CSV para pre-visualización</p>
                       <input type="file" accept=".csv" onChange={(e) => processFileSelection(e.target.files[0])} className="hidden" id="main-up" />
                       <label htmlFor="main-up" className="mt-4 px-4 py-2 border rounded text-[10px] font-bold cursor-pointer uppercase">Cargar Archivo</label>
                     </div>
                   ) : (
                     <table className="w-full text-left text-[10px]">
                        <thead className="bg-[#FAF9F8] sticky top-0">
                          <tr>{data[0]?.map((h, i) => <th key={i} className="p-3 font-black border-b border-[#EDEBE9] uppercase whitespace-nowrap">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {data.slice(1, 50).map((row, ri) => (
                            <tr key={ri} className="border-b border-[#F3F2F1] hover:bg-gray-50">
                              {row.map((cell, ci) => <td key={ci} className="p-3 border-r border-[#F3F2F1]">{cell}</td>)}
                            </tr>
                          ))}
                        </tbody>
                     </table>
                   )}
                </div>
              </motion.div>
            )}

            {activeTab === 'audit_json' && (
              <motion.div key="json" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col h-full p-4">
                <h2 className="text-xs font-black text-[#464775] uppercase mb-4">Columna: audit_report_json</h2>
                <div className="bg-[#1E1E1E] text-[#D4D4D4] p-4 rounded-lg font-mono text-[11px] overflow-auto flex-grow shadow-inner">
                  {isProcessing ? (
                    <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>
                  ) : auditReportJson ? (
                    <pre>{JSON.stringify(auditReportJson, null, 2)}</pre>
                  ) : (
                    <p className="opacity-50">// Sin datos procesados en la nube aún...</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'xml_view' && (
              <motion.div key="xml" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col h-full p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-black text-[#464775] uppercase">Columna: xml_actualizer_raw</h2>
                  {xmlActualizerRaw && !isProcessing && (
                    <button 
                      onClick={handleDownloadXML}
                      className="flex items-center gap-2 bg-[#444791] text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-[#363975] transition-all shadow-sm"
                    >
                      <DownloadCloud size={14} /> DESCARGAR XML
                    </button>
                  )}
                </div>
                
                <div className="bg-white border border-[#EDEBE9] text-[#242424] p-4 rounded-lg font-mono text-[11px] overflow-auto flex-grow whitespace-pre shadow-inner relative">
                  {isProcessing ? (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10">
                       <Loader2 className="animate-spin text-[#444791] mb-2" size={32} />
                       <span className="text-[10px] font-black text-[#444791] uppercase tracking-widest">Generando XML...</span>
                     </div>
                  ) : xmlActualizerRaw ? (
                    xmlActualizerRaw
                  ) : (
                    <div className="h-full flex items-center justify-center opacity-30 italic">
                      // Esperando sincronización de datos...
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold transition-all ${active ? 'bg-white text-[#444791] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
  >
    {icon} {label}
  </button>
);

const Step = ({ icon, title, desc, active, isLast }) => (
  <div className="flex gap-4 relative">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${active ? 'bg-[#444791] border-[#444791] text-white shadow-lg' : 'bg-white border-[#EDEBE9] text-gray-300'}`}>{icon}</div>
      {!isLast && <div className={`w-[2px] h-10 my-1 ${active ? 'bg-[#444791]' : 'bg-[#EDEBE9]'}`} />}
    </div>
    <div className={`pt-1 ${!active && 'opacity-40'}`}>
      <h4 className="text-[10px] font-black mb-1 text-[#464775] uppercase tracking-wider">{title}</h4>
      <p className="text-[10px] text-gray-500 font-medium truncate w-32">{desc}</p>
    </div>
  </div>
);

export default SVXUnifiedPlatform;