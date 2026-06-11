'use client';

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
  FileText, 
  CheckCircle as LucideCheck, 
  AlertCircle as LucideAlert, 
  Loader2, 
  Package as LucidePackage, 
  ChevronRight, 
  DownloadCloud, 
  X, 
  Zap, 
  Terminal
} from 'lucide-react';

import { supabase } from '../../../lib/supabaseClient';

// IMPORTACIÓN DE COMPONENTES EXTERNOS
import EjecutorAgente from './EJECUTOR_agente';
import XML_EJECUTADO_VEW from './XML_EJECUTADO_VEW'; 
import EJECUTOR_PLAY from './EJECUTOR_PLAY';

const SVXUnifiedPlatform = () => {
  // --- CONFIGURACIÓN MULTI-TENANT DINÁMICA ---
  const [currentTenant] = useState('WBT'); 
  const [targetTableName] = useState('ClientsSERVEX_WBT');

  // --- TUTORIAL ALERT STATE ---
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = sessionStorage.getItem(`servex_audit_tutorial_${currentTenant.toLowerCase()}`);
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [currentTenant]);

  const closeTutorial = () => {
    setShowTutorial(false);
    sessionStorage.setItem(`servex_audit_tutorial_${currentTenant.toLowerCase()}`, 'true');
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
  const [isXmlLoading, setIsXmlLoading] = useState(false); 
  const [matchStatus, setMatchStatus] = useState(null); 
  const [diffCount, setDiffCount] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [backendSuccess, setBackendSuccess] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const [agentReport, setAgentReport] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);

  // =========================================================================
  // --- ALGORITMO DE SANEAMIENTO ESTRUCTURAL EN MEMORIA (IGUALADO A PYTHON) ---
  // =========================================================================
  const sanitizeCSVToMatrix = (rawCsvText) => {
    if (!rawCsvText || !rawCsvText.trim()) return [];

    const lines = [];
    let currentLine = '';
    let insideQuotes = false;

    // 1. Fragmentación lineal respetando saltos de línea internos en celdas bajo comillas
    for (let i = 0; i < rawCsvText.length; i++) {
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

    let rawHeaderAccum = [];
    let dataStartIndex = 0;
    let openQuotes = false;

    // Detectar si la cabecera está rota de manera multi-línea
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
    
    // Identificar el delimitador de forma segura analizando la cabecera
    const delimiter = fullRawHeader.includes(';') ? ';' : ',';
    
    // Limpieza atómica de tokens de cabecera
    const perfectHeaders = fullRawHeader.split(delimiter).map(token => {
      let tClean = token.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '').replace(/'/g, '');
      return tClean.split(/\s+/).join(' ').trim();
    });

    const dataLines = lines.slice(dataStartIndex);
    const finalizedMatrix = [perfectHeaders]; // El índice 0 será siempre nuestra cabecera sanitizada

    // 2. Re-estructurar y sanear fila por fila en caliente
    dataLines.forEach(line => {
      if (!line.trim()) return; 
      const currentCells = line.split(delimiter);
      const sanitizedRow = [];

      perfectHeaders.forEach((_, index) => {
        let cellValue = currentCells[index] !== undefined ? currentCells[index] : '';
        if (cellValue === '') {
          // Mantener concordancia con la regla de negocio de Servex para campos null
          sanitizedRow.push(null); 
        } else {
          // Remover comillas envolventes de datos crudos residuales
          cellValue = cellValue.replace(/^["']|["']$/g, '').trim(); 
          sanitizedRow.push(cellValue);
        }
      });

      // Capturar campos huérfanos si la fila excede la longitud del header (comportamiento restkey)
      if (currentCells.length > perfectHeaders.length) {
        const orphaned = currentCells.slice(perfectHeaders.length).map(c => c.replace(/^["']|["']$/g, '').trim());
        sanitizedRow.push(`[ORPHANED]: ${orphaned.join(' | ')}`);
      }

      finalizedMatrix.push(sanitizedRow);
    });

    return finalizedMatrix;
  };

  // --- LÓGICA DE GUARDADO INTEGRADA (UPSERT MULTI-TENANT) ---
  const handleSaveToCloud = async (csvRawContent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authorized");

      const { error } = await supabase
        .from(targetTableName)
        .upsert({
          company_name: currentTenant, 
          csv_raw: csvRawContent,
          user_id: user.id,
          updated_at: new Date()
        }, { 
          onConflict: 'company_name' 
        });

      if (error) throw error;
    } catch (err) {
      console.error(`Error in Upsert (${currentTenant}):`, err);
      showAlert("Cloud record update failed", "error");
    }
  };

  const handleTabChangeToXml = () => {
    setIsXmlLoading(true);
    setActiveTab('xml_view');
    setTimeout(() => {
      setIsXmlLoading(false);
    }, 100);
  };

  const handleDownloadXML = () => {
    if (!xmlActualizerRaw) return;
    const blob = new Blob([xmlActualizerRaw], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTenant}_PRICING_MASTER_AUDIT_${new Date().getFullYear()}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- CONFIGURACIÓN DE SYNC DESDE LA TABLA SELECCIONADA ---
  const fetchCloudData = async () => {
    try {
      const { data: dbData, error } = await supabase
        .from(targetTableName)
        .select('audit_report_json, xml_updated_raw, csv_raw, informa_agent_raw') 
        .eq('company_name', currentTenant)
        .maybe_single();
      
      if (error) throw error;
      
      if (dbData) {
        const report = typeof dbData.audit_report_json === 'string' 
          ? JSON.parse(dbData.audit_report_json) 
          : dbData.audit_report_json;
  
        setAuditReportJson(report);
        setXmlActualizerRaw(dbData.xml_updated_raw); 
        setAgentReport(dbData.informa_agent_raw || "");
  
        if (dbData.csv_raw && data.length > 0) {
            // Nota: Aquí data ya viene previamente sanitizado por processFileSelection
            const dbLines = dbData.csv_raw.split(/\r?\n/).filter(l => l.trim() !== "");
            const dbDelimiter = dbLines.find(l => l.includes(';') || l.includes(','))?.includes(';') ? ';' : ',';
            const dbMatrix = dbLines.map(line => line.split(dbDelimiter).map(c => c.trim()));
  
            const headerIndex = data.findIndex(row => row.join('').includes('ID') || row.join('').includes('Product') || row.join('').includes('Model'));
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
      
      console.log('[+] Ejecutando saneamiento celular pre-renderizado...');
      // ⚡ AQUÍ SE EJECUTA EL SANEAMIENTO ANTES DE MOSTRAR EN PANTALLA
      const sanitizedMatrix = sanitizeCSVToMatrix(text);
      
      if (sanitizedMatrix.length === 0) {
        showAlert("The file contains empty or unparseable blocks", "error");
        return;
      }

      setData(sanitizedMatrix);
      setMatchStatus(null);
      setMasterDataRows([]);
      showAlert("File cleansed and structured successfully", "success");
    };
    reader.readAsText(selectedFile);
  };

  // --- INTEGRACIÓN ADAPTATIVA CON EL PIPELINE API ---
  const handleUnifiedProcess = async () => {
    if (!file) { showAlert("Please upload a CSV file first", "warning"); return; }
    setIsProcessing(true);
    setBackendError(null);
    setAuditReportJson(null);
    setXmlActualizerRaw("");

    try {
      const formData = new FormData();
      formData.append('company_name', currentTenant);
      formData.append('new_csv_file', file);

      const response = await fetch('http://localhost:8000/api/v1/pipeline/process', {
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

  const renderVisualizerContent = () => (
    <AnimatePresence mode="wait">
      {activeTab === 'console' && (
        <motion.div key="console" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 p-4 border-b border-[#EDEBE9] flex justify-between items-center bg-[#FAF9F8]">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black text-[#464775] uppercase">{currentTenant} Sanitized Comparison Viewer</h2>
              <span className="bg-[#237B4B]/10 text-[#237B4B] text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">In-Memory Cleansed</span>
            </div>
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
                    <tr>{data[0]?.map((h, i) => <th key={i} className="p-3 font-black border-b border-[#EDEBE9] uppercase whitespace-nowrap">{h || `Column_${i}`}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.slice(1).map((row, ri) => (
                      <tr key={ri} className="border-b border-[#F3F2F1] hover:bg-gray-50 transition-colors bg-white">
                        {row.map((cell, ci) => {
                          const masterCell = masterDataRows[ri] ? masterDataRows[ri][ci] : null;
                          const isCellDiff = masterCell !== null && cell !== masterCell;
                          
                          let percentageChange = null;
                          if (isCellDiff) {
                            const oldVal = parseFloat(String(masterCell).replace(/[^0-9.-]+/g, ""));
                            const newVal = parseFloat(String(cell).replace(/[^0-9.-]+/g, ""));
                            
                            if (!isNaN(oldVal) && !isNaN(newVal) && oldVal !== 0) {
                              percentageChange = ((newVal - oldVal) / oldVal) * 100;
                            }
                          }

                          return (
                            <td key={ci} className={`p-3 border-r border-[#F3F2F1] ${isCellDiff ? 'bg-orange-50/40' : ''}`}>
                              {isCellDiff ? (
                                <div className="flex flex-col">
                                  <span className="text-red-500 line-through font-medium opacity-60">{masterCell === null ? 'null' : masterCell}</span>
                                  <div className="flex items-center gap-1 text-[#237B4B] font-bold">
                                    <FiArrowRight size={10} /><span>{cell === null ? 'null' : cell}</span>
                                  </div>
                                  {percentageChange !== null && (
                                    <span className={`text-[8px] font-black mt-1 ${percentageChange >= 0 ? 'text-[#237B4B]' : 'text-red-600'}`}>
                                      {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className={cell === null ? 'text-gray-300 italic font-mono' : 'text-gray-600'}>
                                  {cell === null ? 'null' : cell}
                                </span>
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
          <div className="bg-white border border-[#EDEBE9] rounded-lg flex-grow shadow-inner relative flex flex-col items-center justify-center text-center p-8">
            {(isProcessing || isXmlLoading) ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#444791] mb-2" size={32} />
                <span className="text-[10px] font-black text-[#444791] uppercase tracking-widest">
                  {isProcessing ? "Generating XML..." : "Preparing Download Link..."}
                </span>
              </div>
            ) : xmlActualizerRaw ? (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="w-16 h-16 bg-[#F3F2F1] rounded-full flex items-center justify-center mb-4">
                  <FiCode size={30} className="text-[#464775]" />
                </div>
                <h2 className="text-sm font-black text-[#464775] uppercase mb-2">XML Ready for Export</h2>
                <p className="text-[11px] text-gray-500 max-w-[300px] leading-relaxed mb-6">
                  The updated catalog code has been successfully generated and is stored in the <strong>xml_updated_raw</strong> column.
                </p>
                <button 
                  onClick={handleDownloadXML}
                  className="flex items-center gap-3 bg-[#464775] text-white px-8 py-3 rounded-md text-[11px] font-bold hover:bg-[#363975] transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  <DownloadCloud size={18} /> DOWNLOAD XML FILE
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-30 italic">
                <FiDatabase size={40} className="mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest">// Waiting for data synchronization...</span>
              </div>
            )}
          </div>
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
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">Optimization & Sanitize Module</span>
              </div>
              <button onClick={closeTutorial} className="hover:bg-white/20 p-0.5 rounded transition-colors"><X size={16} /></button>
            </div>
            <div className="p-5">
              <h2 className="text-sm font-bold text-[#242424] mb-2">{currentTenant} Catalog Audit</h2>
              <p className="text-[12px] text-[#424242] leading-snug mb-4">Section optimized for the analysis, positional structural cleaning and validation of {currentTenant} catalog updates.</p>
              <div className="space-y-2">
                <div className="flex gap-3 p-2.5 bg-[#f3f2f1] rounded border-l-2 border-[#464775]">
                  <FileText className="text-[#444791] shrink-0" size={16} />
                  <p className="text-[11px] text-[#464775]">Auto-cleanses header corruptions, multi-line row breaking and handles strict null allocations.</p>
                </div>
              </div>
              <button onClick={closeTutorial} className="w-full mt-5 bg-[#464775] text-white py-1.5 rounded text-xs font-semibold hover:bg-[#3b3e7a] transition-all">Get Started</button>
            </div>
          </div>
        </div>
      )}

      <header className="flex-shrink-0 flex items-center justify-between bg-white p-4 border border-[#EDEBE9] rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <img src={`/logosEmpresas/${currentTenant.toLowerCase()}.webp`} alt={currentTenant} className="w-15 h-15 rounded object-contain" onError={(e) => { e.target.src = "/logosEmpresas/default.webp"; }} />
          <div>
            <h1 className="text-sm font-bold uppercase tracking-tight">SERVEX_AI Unified Hub</h1>
            <p className="text-[10px] text-gray-500 font-medium">{currentTenant} Strategic Control</p>
          </div>
        </div>

        <nav className="flex bg-[#F3F2F1] p-1 rounded-md gap-1">
          <TabButton active={activeTab === 'console'} onClick={() => setActiveTab('console')} icon={<Terminal size={12}/>} label="Console" />
          <TabButton active={activeTab === 'audit_json'} onClick={() => setActiveTab('audit_json')} icon={<FiDatabase size={12}/>} label="Audit JSON" />
          <TabButton active={activeTab === 'xml_view'} onClick={handleTabChangeToXml} icon={<FiCode size={12}/>} label="XML Code" />
        </nav>
      </header>

      <div className="grid grid-cols-12 gap-6 flex-grow min-h-0">
        <aside className="col-span-3 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white border border-[#EDEBE9] rounded-lg p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-[#464775] mb-6 uppercase">Execution Pipeline</h3>
            <div className="space-y-6">
              <Step icon={<FiUploadCloud size={14}/>} title="Data Ingestion" desc={fileName ? "Sanitized Matrix" : "Waiting for CSV"} active={!!file} />
              <Step icon={<FiZap size={14}/>} title="Cloud Sync" desc={backendSuccess ? "Stored" : "Pending"} active={backendSuccess} isLast />
            </div>
          </div>

          <EJECUTOR_PLAY 
            handleUnifiedProcess={handleUnifiedProcess}
            handleFullReset={handleFullReset}
            file={file}
            isProcessing={isProcessing}
          />
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
            <div className="flex-shrink-0 bg-[#ffffff] p-4 flex justify-between items-center text-black">
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

// COMPONENTES AUXILIARES
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