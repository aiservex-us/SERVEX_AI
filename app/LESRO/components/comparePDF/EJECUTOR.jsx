import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, FiCheck, FiZap, FiShield, FiX, FiSearch, 
  FiAlertTriangle, FiArrowRight, FiCheckCircle, FiInfo, FiXCircle 
} from 'react-icons/fi';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';
import { 
  FileText, CheckCircle, AlertCircle, Loader2, Package, 
  ChevronRight, DownloadCloud, X, Zap 
} from 'lucide-react';

import { supabase } from '../../../lib/supabaseClient';

const SVXUnifiedPlatform = () => {
  // --- ESTADOS UNIFICADOS ---
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState([]); 
  const [masterDataRows, setMasterDataRows] = useState([]);
  
  // --- ESTADOS DE CONTROL ---
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null); 
  const [diffCount, setDiffCount] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [backendSuccess, setBackendSuccess] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = sessionStorage.getItem('servex_audit_tutorial_seen');
    if (!hasSeenTutorial) setShowTutorial(true);
  }, []);

  // --- LÓGICA DE CARGA ÚNICA ---
  const processFileSelection = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      showAlert("Formato no válido. Use solo .CSV", "error");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setBackendError(null);
    setBackendSuccess(false);
    setMatchStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length === 0) return;
      
      const sampleLine = lines.find(l => l.includes(';') || l.includes(','));
      const delimiter = sampleLine && sampleLine.includes(';') ? ';' : ',';
      const matrix = lines.map(line => line.split(delimiter).map(cell => cell.trim()));

      setData(matrix);
      showAlert("Archivo vinculado y listo para procesar", "success");
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFileSelection(droppedFile);
  }, []);

  // --- EL MOTOR "SYNC AND EXPORT" (UNIFICADO) ---
  const handleUnifiedProcess = async () => {
    if (!file || data.length === 0) {
      showAlert("Primero cargue un archivo CSV", "warning");
      return;
    }

    setIsProcessing(true);
    setBackendError(null);
    setBackendSuccess(false);

    try {
      // 1. FASE: AUDITORÍA VISUAL (Supabase)
      const { data: dbRows, error: sbError } = await supabase
        .from('ClientsSERVEX')
        .select('csv_raw')
        .not('csv_raw', 'is', null)
        .limit(1);

      if (sbError) throw new Error("Error conectando con SVX Cloud");
      
      if (dbRows && dbRows.length > 0) {
        const dbRow = dbRows[0];
        const dbLines = dbRow.csv_raw.split(/\r?\n/).filter(l => l.trim() !== "");
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
        if (discrepancies.length === 0) {
          setMatchStatus('match');
        } else {
          setMatchStatus('mismatch');
          setDiffCount(discrepancies.length);
          setMasterDataRows(discrepancies.map(d => d.mRow));
          setData([header, ...discrepancies.map(d => d.row)]);
        }
      }

      // 2. FASE: ACTUALIZACIÓN BACKEND (Python/FastAPI)
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/audit-process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'SERVEX_AI Data Engine Error');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SERVEX_SYNC_${new Date().getTime()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setBackendSuccess(true);
      showAlert("Proceso Unificado Completado", "success");

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
    setData([]);
    setFile(null);
    setFileName("");
    setMatchStatus(null);
    setBackendSuccess(false);
    setBackendError(null);
    setMasterDataRows([]);
  };

  return (
    <div className="h-[88vh] bg-[#FDFDFD] p-6 font-sans text-[#242424] max-w-[1600px] mx-auto space-y-6">
      
      {/* HEADER INTEGRADO */}
      <header className="flex items-center justify-between bg-white p-4 border border-[#EDEBE9] rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#444791] rounded flex items-center justify-center text-white font-bold">SVX</div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-tight">SERVEX_AI Unified Hub</h1>
            <p className="text-[10px] text-gray-500 font-medium">Control de Calidad & Sincronización de Catálogo</p>
          </div>
        </div>
        <div className="flex gap-2">
            {file && <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <FiCheck size={10}/> {fileName}
            </span>}
            <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[75vh]">
        {/* PANEL IZQUIERDO: PROTOCOLO */}
        <aside className="col-span-3 flex flex-col gap-4">
          <div className="bg-white border border-[#EDEBE9] rounded-lg p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-[#464775] mb-6 uppercase">Pipeline de Ejecución</h3>
            <div className="space-y-6">
              <Step icon={<FiUploadCloud size={14}/>} title="Carga de Datos" desc={fileName || "Esperando CSV"} active={!!file} />
              <Step icon={<FiSearch size={14}/>} title="Análisis Visual" desc={matchStatus ? "Auditado" : "Pendiente"} active={matchStatus} />
              <Step icon={<FiZap size={14}/>} title="Sync Backend" desc={backendSuccess ? "Exportado" : "En cola"} active={backendSuccess} isLast />
            </div>
          </div>

          <div className="bg-[#444791] text-white rounded-lg p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-yellow-400" />
              <h4 className="text-xs font-bold uppercase">Acciones Maestras</h4>
            </div>
            <p className="text-[11px] opacity-80 mb-4">Ejecuta la comparación visual y genera el paquete de actualización para el motor de datos.</p>
            <button 
              onClick={handleUnifiedProcess}
              disabled={!file || isProcessing}
              className="w-full bg-white text-[#444791] py-2 rounded font-bold text-[11px] hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Package size={14} />}
              SYNC AND EXPORT
            </button>
            <button onClick={handleFullReset} className="w-full mt-2 py-2 text-[10px] font-bold opacity-60 hover:opacity-100">RESET SYSTEM</button>
          </div>
        </aside>

        {/* PANEL CENTRAL: CONSOLA VISUAL */}
        <main className="col-span-9 bg-white border border-[#EDEBE9] rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#EDEBE9] flex justify-between items-center bg-[#FAF9F8]">
            <h2 className="text-xs font-black text-[#464775] uppercase">Consola de Análisis Visual</h2>
            <div className="flex gap-4">
              {matchStatus === 'mismatch' && (
                <div className="flex items-center gap-2 text-orange-600 text-[10px] font-bold">
                  <FiAlertTriangle /> {diffCount} DIFERENCIAS ENCONTRADAS
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow overflow-hidden p-0 relative">
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`h-full m-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all ${isDragging ? 'bg-[#f0f2ff] border-[#444791]' : 'bg-[#FAF9F8] border-[#EDEBE9]'}`}
                >
                  <DownloadCloud size={40} className="text-[#464775] mb-2 opacity-40" />
                  <p className="text-[11px] font-bold text-[#464775]">Arrastra el archivo CSV maestro para iniciar</p>
                  <input type="file" accept=".csv" onChange={(e) => processFileSelection(e.target.files[0])} className="hidden" id="main-upload" />
                  <label htmlFor="main-upload" className="mt-4 px-4 py-2 bg-white border border-[#EDEBE9] rounded text-[10px] font-bold cursor-pointer hover:shadow-md transition-all">EXAMINAR EQUIPO</label>
                </motion.div>
              ) : (
                <div className="h-full overflow-auto">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-[#FAF9F8] sticky top-0 z-20">
                      <tr>
                        {data[0]?.map((h, i) => (
                          <th key={i} className="p-3 font-black border-b border-[#EDEBE9] text-[#464775] uppercase whitespace-nowrap bg-[#FAF9F8]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(1).map((row, ri) => (
                        <tr key={ri} className="border-b border-[#F3F2F1] hover:bg-gray-50/50">
                          {row.map((cell, ci) => {
                            const masterCell = masterDataRows[ri] ? masterDataRows[ri][ci] : null;
                            const isCellDiff = masterCell !== null && cell !== masterCell;
                            return (
                              <td key={ci} className={`p-3 border-r border-[#F3F2F1] last:border-0 ${isCellDiff ? 'bg-orange-50' : ''}`}>
                                {isCellDiff ? (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[9px] text-red-400 line-through font-medium italic">{masterCell}</span>
                                    <div className="flex items-center gap-1 text-green-700 font-bold">
                                      <FiArrowRight size={10} /> <span>{cell}</span>
                                    </div>
                                  </div>
                                ) : <span className="text-[#616161]">{cell}</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* FOOTER DE ESTADO DEL ENGINE */}
          <div className="p-4 bg-[#FAF9F8] border-t border-[#EDEBE9] flex items-center justify-between">
            <div className="flex gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded bg-white border border-[#EDEBE9] text-[9px] font-bold ${backendSuccess ? 'text-green-600' : 'text-gray-400'}`}>
                <FileText size={12} /> JSON ENGINE
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded bg-white border border-[#EDEBE9] text-[9px] font-bold ${backendSuccess ? 'text-green-600' : 'text-gray-400'}`}>
                <Package size={12} /> ZIP PACKAGE
              </div>
            </div>
            {backendSuccess && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 text-[#237b4b] text-[10px] font-black uppercase">
                <CheckCircle size={14} /> Sincronización Exitosa
              </motion.div>
            )}
            {backendError && (
              <div className="flex items-center gap-2 text-red-600 text-[10px] font-bold">
                <AlertCircle size={14} /> {backendError}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* NOTIFICACIONES FLOTANTES */}
      <AnimatePresence>
        {alert.show && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded shadow-2xl bg-white border border-[#EDEBE9] min-w-[300px]"
          >
            <div className={`p-2 rounded text-white ${alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
              {alert.type === 'success' ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
            </div>
            <p className="text-xs font-bold text-gray-700">{alert.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Step = ({ icon, title, desc, active, isLast }) => (
  <div className="flex gap-4 relative">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${active ? 'bg-[#444791] border-[#444791] text-white shadow-lg' : 'bg-white border-[#EDEBE9] text-gray-300'}`}>{icon}</div>
      {!isLast && <div className={`w-[2px] h-10 my-1 ${active ? 'bg-[#444791]' : 'bg-[#EDEBE9]'}`} />}
    </div>
    <div className={`pt-1 ${!active && 'opacity-40'}`}>
      <h4 className="text-[10px] font-black leading-none mb-1 text-[#464775] uppercase tracking-wider">{title}</h4>
      <p className="text-[10px] text-gray-500 font-medium truncate w-32">{desc}</p>
    </div>
  </div>
);

export default SVXUnifiedPlatform;