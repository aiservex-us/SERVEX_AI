import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, FiCheck, FiZap, FiShield, FiX, FiSearch, 
  FiAlertTriangle, FiArrowRight, FiCheckCircle, FiInfo, FiXCircle, FiCode, FiDatabase,
  FiMaximize2, FiLayers, FiPackage
} from 'react-icons/fi';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';
import { 
  FileText, CheckCircle, AlertCircle, Loader2, Package, 
  ChevronRight, DownloadCloud, X, Zap, Terminal
} from 'lucide-react';

import { supabase } from '../../../lib/supabaseClient';

// IMPORTACIÓN DE COMPONENTES EXTERNOS
import EjecutorAgente from './EJECUTOR_agente';
import XML_EJECUTADO_VEW from './XML_EJECUTADO_VEW'; // Nuevo componente visualizador

const SVXUnifiedPlatform = () => {
  // --- TUTORIAL ALERT STATE ---
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = sessionStorage.getItem('servex_audit_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    sessionStorage.setItem('servex_audit_tutorial_seen', 'true');
  };

  // --- NAVIGATION STATES ---
  const [activeTab, setActiveTab] = useState('console'); 

  // --- UNIFIED STATES ---
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState([]); 
  const [masterDataRows, setMasterDataRows] = useState([]);
  
  // --- SUPABASE STATES ---
  const [auditReportJson, setAuditReportJson] = useState(null);
  const [xmlActualizerRaw, setXmlActualizerRaw] = useState("");

  // --- CONTROL STATES ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null); 
  const [diffCount, setDiffCount] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [backendSuccess, setBackendSuccess] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const [agentReport, setAgentReport] = useState("")
  
  // --- NUEVO ESTADO PARA EL POPUP ---
  const [isMaximized, setIsMaximized] = useState(false);

  const handleDownloadXML = () => {
    if (!xmlActualizerRaw) return;
    const blob = new Blob([xmlActualizerRaw], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LESRO_PRICING_MASTER_AUDIT_${new Date().getFullYear()}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchCloudData = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from('ClientsSERVEX')
        .select('audit_report_json, xml_actualizer_raw, csv_raw, informa_agent_raw')
        .eq('company_name', 'LESRO')
        .single();
      
      if (error) throw error;
      
      if (dbData) {
        const report = typeof dbData.audit_report_json === 'string' 
          ? JSON.parse(dbData.audit_report_json) 
          : dbData.audit_report_json;
  
        setAuditReportJson(report);
        setXmlActualizerRaw(dbData.xml_actualizer_raw);
        setAgentReport(dbData.informa_agent_raw || "");
  
        if (dbData.csv_raw && data.length > 0) {
            const dbLines = dbData.csv_raw.split(/\r?\n/).filter(l => l.trim() !== "");
            const dbDelimiter = dbLines.find(l => l.includes(';') || l.includes(','))?.includes(';') ? ';' : ',';
            const dbMatrix = dbLines.map(line => line.split(dbDelimiter).map(c => c.trim()));
  
            const headerIndex = data.findIndex(row => row.join('').includes('ID') || row.join('').includes('Product'));
            const header = data[headerIndex] || data[0];
            const currentRows = data.slice(headerIndex + 1);
            const masterRowsOnly = dbMatrix.slice(headerIndex + 1);
  
            const auditResults = currentRows.map((row, idx) => {
              const mRow = masterRowsOnly[idx] || [];
              const isDifferent = JSON.stringify(row) !== JSON.stringify(mRow);
              return { row, mRow, isDifferent };
            });
  
            const discrepancies = auditResults.filter(item => item.isDifferent);
  
            if (discrepancies.length > 0) {
              setMatchStatus('mismatch');
              setDiffCount(discrepancies.length);
              setMasterDataRows(discrepancies.map(d => d.mRow));
              setData([header, ...discrepancies.map(d => d.row)]);
            } else {
              setMatchStatus('match');
            }
        }
      }
    } catch (err) {
      console.error("Error fetching cloud data:", err);
      showAlert("Error syncing data from cloud", "error");
    }
  };

  const processFileSelection = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      showAlert("Invalid format. Use only .CSV", "error");
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
      setMatchStatus(null);
      setMasterDataRows([]);
      showAlert("File linked successfully", "success");
    };
    reader.readAsText(selectedFile);
  };

  const handleUnifiedProcess = async () => {
    if (!file) { showAlert("Please upload a CSV file first", "warning"); return; }
    setIsProcessing(true);
    setBackendError(null);
    setAuditReportJson(null);
    setXmlActualizerRaw("");

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://0.0.0.0:8000/audit-process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'SERVEX_AI Error');
      }

      setBackendSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 200));
      await fetchCloudData();
      showAlert("Cloud synchronization successful", "success");
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
    setMasterDataRows([]);
  };

  // --- RENDERIZADO DE CONTENIDO SEGÚN TAB ACTIVA ---
  const renderVisualizerContent = () => (
    <AnimatePresence mode="wait">
      {activeTab === 'console' && (
        <motion.div key="console" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 p-4 border-b border-[#EDEBE9] flex justify-between items-center bg-[#FAF9F8]">
            <h2 className="text-xs font-black text-[#464775] uppercase">Local Comparison Viewer</h2>
            {matchStatus === 'mismatch' && (
              <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Cloud Master</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#237B4B] rounded-full" />
                    <span className="text-[9px] font-bold text-[#237B4B] uppercase">New Change</span>
                  </div>
              </div>
            )}
          </div>
          <div className="flex-grow overflow-auto">
            {!file ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <DownloadCloud size={40} />
                <p className="text-[11px] font-bold mt-2">Drop CSV for preview</p>
                <input type="file" accept=".csv" onChange={(e) => processFileSelection(e.target.files[0])} className="hidden" id="main-up" />
                <label htmlFor="main-up" className="mt-4 px-4 py-2 border rounded text-[10px] font-bold cursor-pointer uppercase">Load File</label>
              </div>
            ) : (
              <table className="w-full text-left text-[10px]">
                  <thead className="bg-[#FAF9F8] sticky top-0 z-20">
                    <tr>{data[0]?.map((h, i) => <th key={i} className="p-3 font-black border-b border-[#EDEBE9] uppercase whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.slice(1).map((row, ri) => (
                      <tr key={ri} className="border-b border-[#F3F2F1] hover:bg-gray-50 transition-colors bg-white">
                        {row.map((cell, ci) => {
                          const masterCell = masterDataRows[ri] ? masterDataRows[ri][ci] : null;
                          const isCellDiff = masterCell !== null && cell !== masterCell;
                          return (
                            <td key={ci} className={`p-3 border-r border-[#F3F2F1] ${isCellDiff ? 'bg-orange-50/40' : ''}`}>
                              {isCellDiff ? (
                                <div className="flex flex-col">
                                  <span className="text-red-500 line-through font-medium opacity-60">{masterCell || '(null)'}</span>
                                  <div className="flex items-center gap-1 text-[#237B4B] font-bold">
                                    <FiArrowRight size={10} /><span>{cell}</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-600">{cell}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
              </table>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'audit_json' && (
        <motion.div key="json" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col h-full p-4 overflow-hidden">
          <h2 className="flex-shrink-0 text-xs font-black text-[#464775] uppercase mb-4">Column: audit_report_json</h2>
          <div className="bg-[#1E1E1E] text-[#D4D4D4] p-4 rounded-lg font-mono text-[11px] overflow-auto flex-grow shadow-inner">
            {isProcessing ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>
            ) : auditReportJson ? (
              <pre>{JSON.stringify(auditReportJson, null, 2)}</pre>
            ) : (
              <p className="opacity-50">// No data processed in cloud yet...</p>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'xml_view' && (
        <motion.div key="xml" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col h-full p-4 overflow-hidden">
          <div className="flex-shrink-0 flex justify-between items-center mb-4">
            <h2 className="text-xs font-black text-[#464775] uppercase">Column: xml_actualizer_raw (Raw Code)</h2>
            {xmlActualizerRaw && !isProcessing && (
              <button 
                onClick={handleDownloadXML}
                className="flex items-center gap-2 bg-[#464775] text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-[#363975] transition-all shadow-sm"
              >
                <DownloadCloud size={14} /> DOWNLOAD XML
              </button>
            )}
          </div>
          <div className="bg-white border border-[#EDEBE9] text-[#242424] p-4 rounded-lg font-mono text-[11px] overflow-auto flex-grow whitespace-pre shadow-inner relative">
            {isProcessing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10">
                <Loader2 className="animate-spin text-[#444791] mb-2" size={32} />
                <span className="text-[10px] font-black text-[#444791] uppercase tracking-widest">Generating XML...</span>
              </div>
            ) : xmlActualizerRaw ? (
              xmlActualizerRaw
            ) : (
              <div className="h-full flex items-center justify-center opacity-30 italic">// Waiting for data synchronization...</div>
            )}
          </div>
        </motion.div>
      )}

      {/* NUEVA OPCIÓN: VISUALIZADOR DE PRODUCTOS XML */}
      {activeTab === 'xml_inspector' && (
        <motion.div key="inspector" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col h-full overflow-hidden">
          {isProcessing ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[#444791] mb-2" size={32} />
              <span className="text-[10px] font-black text-[#444791] uppercase tracking-widest">Parsing Catalog Structure...</span>
            </div>
          ) : (
            <XML_EJECUTADO_VEW xmlString={xmlActualizerRaw} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="h-[88vh] bg-[#FDFDFD] p-6 font-sans text-[#242424] max-w-[1600px] mx-auto space-y-4 relative overflow-hidden flex flex-col">
      
      {showTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-[380px] rounded shadow-xl border border-[#d1d1d1] overflow-hidden transform animate-in zoom-in-95 duration-200">
            <div className="bg-[#464775] px-4 py-2 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Optimization Module</span>
              </div>
              <button onClick={closeTutorial} className="hover:bg-white/20 p-0.5 rounded transition-colors"><X size={16} /></button>
            </div>
            <div className="p-5">
              <h2 className="text-sm font-bold text-[#242424] mb-2">LESRO Catalog Audit</h2>
              <p className="text-[12px] text-[#424242] leading-snug mb-4">Section optimized for the analysis and comparison of LESRO catalog updates.</p>
              <div className="space-y-2">
                <div className="flex gap-3 p-2.5 bg-[#f3f2f1] rounded border-l-2 border-[#464775]">
                  <FileText className="text-[#444791] shrink-0" size={16} />
                  <p className="text-[11px] text-[#464775]">Updated XML for <strong>CET Designer</strong> and <strong>Catalog Creator</strong>.</p>
                </div>
              </div>
              <button onClick={closeTutorial} className="w-full mt-5 bg-[#464775] text-white py-1.5 rounded text-xs font-semibold hover:bg-[#3b3e7a] transition-all">Get Started</button>
            </div>
          </div>
        </div>
      )}

      <header className="flex-shrink-0 flex items-center justify-between bg-white p-4 border border-[#EDEBE9] rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logosEmpresas/lesro.webp" alt="LESRO" className="w-15 h-15 rounded object-contain" />
          <div>
            <h1 className="text-sm font-bold uppercase tracking-tight">SERVEX_AI Unified Hub</h1>
            <p className="text-[10px] text-gray-500 font-medium">LESRO Strategic Control</p>
          </div>
        </div>

        <nav className="flex bg-[#F3F2F1] p-1 rounded-md gap-1">
          <TabButton active={activeTab === 'console'} onClick={() => setActiveTab('console')} icon={<Terminal size={12}/>} label="Console" />
          <TabButton active={activeTab === 'audit_json'} onClick={() => setActiveTab('audit_json')} icon={<FiDatabase size={12}/>} label="Audit JSON" />
          <TabButton active={activeTab === 'xml_view'} onClick={() => setActiveTab('xml_view')} icon={<FiCode size={12}/>} label="XML Code" />
          {/* BOTÓN NUEVO AGREGADO AL MENÚ */}
          <TabButton active={activeTab === 'xml_inspector'} onClick={() => setActiveTab('xml_inspector')} icon={<FiPackage size={12}/>} label="XML Inspector (Visual)" />
        </nav>

     
      </header>

      <div className="grid grid-cols-12 gap-6 flex-grow min-h-0">
        <aside className="col-span-3 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white border border-[#EDEBE9] rounded-lg p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-[#464775] mb-6 uppercase">Execution Pipeline</h3>
            <div className="space-y-6">
              <Step icon={<FiUploadCloud size={14}/>} title="Data Ingestion" desc={fileName || "Waiting for CSV"} active={!!file} />
              <Step icon={<FiZap size={14}/>} title="Cloud Sync" desc={backendSuccess ? "Stored" : "Pending"} active={backendSuccess} isLast />
            </div>
          </div>

          <div className="bg-[#464775] text-white rounded-lg p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3"><Zap size={16} className="text-yellow-400" /><h4 className="text-xs font-bold uppercase">Platform Actions.</h4></div>
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

        <div className="col-span-9 flex flex-col gap-4 h-full min-h-0">
          <main className="flex-1 bg-white border border-[#EDEBE9] rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden relative group">
            <button 
              onClick={() => setIsMaximized(true)}
              className="absolute top-3 right-3 z-30 p-2 bg-white/90 hover:bg-[#464775] hover:text-white border border-[#EDEBE9] rounded shadow-sm transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 text-[10px] font-bold"
            >
              <FiMaximize2 size={12} /> EXPAND VIEW
            </button>
            {renderVisualizerContent()}
          </main>

          <EjecutorAgente reportText={agentReport} isProcessing={isProcessing} />
        </div>
      </div>

      {isMaximized && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-10 animate-in fade-in duration-300">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-[95vw] h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex-shrink-0 bg-[#464775] p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <Terminal size={18} />
                <span className="text-sm font-black uppercase tracking-widest">Inspection Mode: {activeTab.replace('_', ' ').toUpperCase()}</span>
              </div>
              <button onClick={() => setIsMaximized(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><FiX size={24} /></button>
            </div>
            <div className="flex-grow overflow-hidden bg-white">{renderVisualizerContent()}</div>
          </motion.div>
        </div>,
        document.body
      )}
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
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${active ? 'bg-[#464775] border-[#444791] text-white shadow-lg' : 'bg-white border-[#EDEBE9] text-gray-300'}`}>{icon}</div>
      {!isLast && <div className={`w-[2px] h-10 my-1 ${active ? 'bg-[#444791]' : 'bg-[#EDEBE9]'}`} />}
    </div>
    <div className={`pt-1 ${!active && 'opacity-40'}`}>
      <h4 className="text-[10px] font-black mb-1 text-[#464775] uppercase tracking-wider">{title}</h4>
      <p className="text-[10px] text-gray-500 font-medium truncate w-32">{desc}</p>
    </div>
  </div>
);

export default SVXUnifiedPlatform;