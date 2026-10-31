'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiUploadCloud, FiX, FiMaximize2, FiChevronLeft, FiChevronRight, FiAlertCircle, FiDatabase 
} from 'react-icons/fi';
import { 
  FileText, 
  Loader2, 
  DownloadCloud, 
  X, 
  Zap, 
  Terminal
} from 'lucide-react';

// Importación de la instancia del cliente de Supabase
import { supabase, upsertGeneralProcessRecord } from '@/app/lib/supabaseClient';

// IMPORTACIÓN DE COMPONENTES EXTERNOS
import EJECUTOR_PLAY from './EJECUTOR_PLAY';


const SVXUnifiedPlatform = () => {
  // --- CONFIGURACIÓN MULTI-TENANT DINÁMICA ---
  const [currentTenant] = useState('General_Procces'); 
  const [targetTableName] = useState('ClientsSERVEX_General_Procces');

  // --- TUTORIAL ALERT STATE ---
  const [showTutorial, setShowTutorial] = useState(false);

  // --- ESTADOS PARA VERIFICACIÓN DE CATÁLOGO ACTIVO ---
  const [hasExistingData, setHasExistingData] = useState(false);
  const [isClearingBackend, setIsClearingBackend] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = sessionStorage.getItem(`servex_audit_tutorial_${currentTenant.toLowerCase()}`);
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    checkExistingCatalog();
  }, [currentTenant]);

  const closeTutorial = () => {
    setShowTutorial(false);
    sessionStorage.setItem(`servex_audit_tutorial_${currentTenant.toLowerCase()}`, 'true');
  };

  const checkExistingCatalog = async () => {
    try {
      const { data: record, error } = await supabase
        .from(targetTableName)
        .select('csv_new_raw')
        .eq('company_name', currentTenant)
        .maybeSingle();

      if (error) throw error;

      if (record && record.csv_new_raw) {
        setHasExistingData(true);
      }
    } catch (err) {
      console.error('[-] Error verifying active catalog record:', err);
    }
  };

  const handleIgnoreAndClear = async () => {
    setIsClearingBackend(true);
    try {
      const { error } = await supabase
        .from(targetTableName)
        .update({ csv_new_raw: null })
        .eq('company_name', currentTenant);

      if (error) throw error;

      setHasExistingData(false);
      handleFullReset();
      showAlert("Previous record cleared. You may proceed to upload the new CSV.", "success");
    } catch (err) {
      console.error('[-] Error clearing csv_new_raw column:', err);
      showAlert(`Error: ${err.message}`, "error");
    } finally {
      setIsClearingBackend(false);
    }
  };

  // --- UNIFIED STATES ---
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState([]); 
  const [sanitizedJsonData, setSanitizedJsonData] = useState([]); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [backendSuccess, setBackendSuccess] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  /**
   * SANEAMIENTO MEJORADO: Máquina de estados determinista
   */
  const sanitizeCSVToMatrix = (rawCsvText) => {
    if (!rawCsvText || !rawCsvText.trim()) return { matrix: [], json: [] };

    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;

    // Parser carácter a carácter
    for (let i = 0; i < rawCsvText.length; i++) {
      const char = rawCsvText[i];
      const nextChar = rawCsvText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; 
        } else {
          insideQuotes = !insideQuotes; 
        }
      } else if (char === ';' && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++; 
        currentRow.push(currentCell.trim());
        if (currentRow.length > 1 || currentRow[0] !== '') rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
    }

    if (rows.length === 0) return { matrix: [], json: [] };

    // Limpieza de encabezados
    const rawHeaders = rows[0].map(h => h.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '').trim());
    const perfectHeaders = [];
    const headerCounts = {};
    rawHeaders.forEach(h => {
      const cleanH = h.split(/\s+/).join(' ');
      if (!headerCounts[cleanH]) {
        headerCounts[cleanH] = 1;
        perfectHeaders.push(cleanH);
      } else {
        perfectHeaders.push(`${cleanH}_${headerCounts[cleanH]++}`);
      }
    });

    const sanitizedJson = [];
    const finalizedMatrix = [perfectHeaders];

    rows.slice(1).forEach(row => {
      const rowObject = {};
      const sanitizedRow = [];
      perfectHeaders.forEach((header, index) => {
        const val = row[index] !== undefined ? row[index].replace(/^["']|["']$/g, '').trim() : null;
        rowObject[header] = val === '' ? null : val;
        sanitizedRow.push(val);
      });
      sanitizedJson.push(rowObject);
      finalizedMatrix.push(sanitizedRow);
    });

    return { matrix: finalizedMatrix, json: sanitizedJson };
  };

  const processFileSelection = (selectedFile) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      showAlert("Invalid format. Use only .CSV", "error");
      return;
    }
    setFile(selectedFile);
    setFileName(selectedFile.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const { matrix, json } = sanitizeCSVToMatrix(text);
      if (matrix.length === 0) {
        showAlert("The file contains empty or unparseable blocks", "error");
        return;
      }
      setData(matrix);
      setSanitizedJsonData(json);
      setCurrentPage(1); 
      showAlert("File cleansed and structured successfully", "success");
    };
    reader.readAsText(selectedFile);
  };

  const handleUnifiedProcess = async () => {
    if (!file || data.length === 0) { 
      showAlert("Please upload and process a CSV file first", "warning"); 
      return; 
    }
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { company_name: currentTenant, csv_new_raw: sanitizedJsonData, CSV_final: sanitizedJsonData, created_at: new Date().toISOString() };
      if (user) payload.user_id = user.id;
      const { error: supabaseError } = await upsertGeneralProcessRecord(payload, currentTenant);
      if (supabaseError) throw new Error(`Supabase Error: ${supabaseError.message}`);
      setBackendSuccess(true);
      setHasExistingData(true);
      showAlert("CSV matrix successfully processed and saved to csv_new_raw", "success");
    } catch (err) {
      console.error('[-] Critical error in Supabase cloud persistence:', err);
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
    setData([]); setSanitizedJsonData([]); setFile(null); setFileName("");
    setBackendSuccess(false); setCurrentPage(1);
    setHasExistingData(false);
  };

  const getPaginatedData = () => {
    if (data.length <= 1) return [];
    const rawProducts = data.slice(1); 
    if (currentPage === 1) return rawProducts.slice(0, 20); 
    const start = 20 + (currentPage - 2) * 30;
    const end = start + 30;
    return rawProducts.slice(start, end);
  };

  const getTotalPages = () => {
    if (data.length <= 1) return 1;
    const totalProducts = data.length - 1;
    if (totalProducts <= 20) return 1;
    return 1 + Math.ceil((totalProducts - 20) / 30);
  };

  const getCurrentRangeLabels = () => {
    if (data.length <= 1) return { start: 0, end: 0 };
    const total = data.length - 1;
    if (currentPage === 1) return { start: 1, end: Math.min(20, total) };
    const start = 21 + (currentPage - 2) * 30;
    const end = Math.min(start + 29, total);
    return { start, end };
  };

  const renderVisualizerContent = () => (
    <div className="flex flex-col h-full overflow-hidden text-zinc-100">
      <div className="flex-shrink-0 p-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-black text-zinc-100 uppercase tracking-wider">{currentTenant} Sanitized Viewer</h2>
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded tracking-wide uppercase">In-Memory Cleansed</span>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        {hasExistingData && !file ? (
          <div className="h-full flex items-center justify-center p-6 bg-transparent">
            <div className="bg-[#09090b]/90 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
              <div className="mx-auto w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-400">
                <Zap size={24} className="fill-amber-400/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20 inline-block px-2.5 py-1 rounded-lg">Active Catalog Record</h3>
                <p className="text-[12px] text-zinc-400 leading-relaxed font-medium">Stored information was detected in the <code className="font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/10 text-zinc-200">csv_new_raw</code> column for this tenant. Please review the existing updated Excel/CSV file.</p>
              </div>
              <div className="pt-2">
                <button 
                  onClick={handleIgnoreAndClear}
                  disabled={isClearingBackend}
                  className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-[11px] uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isClearingBackend ? <><Loader2 size={14} className="animate-spin" /> Processing Server...</> : "Ignore & Load New CSV"}
                </button>
              </div>
            </div>
          </div>
        ) : !file ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40 text-zinc-400">
            <DownloadCloud size={40} className="text-zinc-500" />
            <p className="text-[11px] font-bold mt-2 text-zinc-400">Drop CSV for preview</p>
            <input type="file" accept=".csv" onChange={(e) => processFileSelection(e.target.files[0])} className="hidden" id="main-up" />
            <label htmlFor="main-up" className="mt-4 px-4 py-2 border border-white/15 hover:border-white/30 hover:bg-white/5 rounded-xl text-[10px] font-bold cursor-pointer uppercase transition-all text-zinc-300">Load File</label>
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between">
            <div className="overflow-auto flex-grow custom-scrollbar">
              <table className="w-full text-left text-[10px] text-zinc-300">
                  <thead className="bg-[#121215] sticky top-0 z-20 border-b border-white/10">
                    <tr>{data[0]?.map((h, i) => <th key={i} className="p-3 font-black uppercase whitespace-nowrap text-zinc-400 tracking-wider">{h || `Column_${i}`}</th>)}</tr>
                  </thead>
                  <tbody>
                    {getPaginatedData().map((row, ri) => (
                        <tr key={ri} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                          {row.map((cell, ci) => (
                            <td key={ci} className="p-3 border-r border-white/5">
                              <span className={cell === null ? 'text-zinc-600 italic font-mono' : 'text-zinc-300'}>{cell === null ? 'null' : cell}</span>
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
              </table>
            </div>
            <div className="flex-shrink-0 bg-[#09090b]/90 border-t border-white/10 px-4 py-2.5 flex items-center justify-between text-[11px] font-medium text-zinc-400">
              <div>Showing <span className="font-bold text-zinc-100">{getCurrentRangeLabels().start}</span> to <span className="font-bold text-zinc-100">{getCurrentRangeLabels().end}</span> of <span className="font-bold text-zinc-100">{data.length - 1}</span> products.</div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Page {currentPage} of {getTotalPages()}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-[10px] font-bold uppercase transition-all text-zinc-300 shadow-sm"><FiChevronLeft size={12} /> Previous</button>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))} disabled={currentPage === getTotalPages()} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-[10px] font-bold uppercase transition-all text-zinc-300 shadow-sm">Next <FiChevronRight size={12} /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-[88vh] bg-transparent p-6 font-sans text-zinc-100 max-w-[1600px] mx-auto space-y-4 relative overflow-hidden flex flex-col">
      
      {/* --- POPUP PROCESSING DATOS BASE (General Process) --- */}
      {isProcessing && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-6">
          <div className="bg-[#09090b]/95 border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 sm:space-y-4 backdrop-blur-2xl text-zinc-100 transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
                <div className="relative bg-white/5 border border-white/10 p-2 sm:p-3 rounded-full shadow-sm">
                  <FiDatabase className="text-zinc-200 animate-pulse" size={20} />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-100 uppercase tracking-wider">System Base Storage</h3>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">Module ({currentTenant})</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-2 sm:p-3 rounded-xl flex items-start gap-2 sm:gap-3 text-left">
              <FiAlertCircle className="text-amber-400 shrink-0 mt-0.5" size={14} />
              <p className="text-[9px] sm:text-[10px] text-amber-300 leading-tight">
                <strong>IMPORTANT:</strong> Uploading base {currentTenant} files to Cloud Database. <strong>Do not close</strong> this window or switch sections.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-300">
              <Loader2 size={12} className="animate-spin text-white" />
              <span className="uppercase tracking-widest">Saving to Cloud Database...</span>
            </div>
          </div>
        </div>
      )}

      {alert.show && createPortal(
        <div className="fixed top-6 right-6 z-[9999] p-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right-5 duration-300 bg-[#09090b]/90 border-white/10 backdrop-blur-xl min-w-[300px]">
          <div className={`w-2 h-full absolute left-0 rounded-l-xl ${alert.type === 'success' ? 'bg-emerald-500' : alert.type === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`} />
          <div className={`p-2 rounded-full ${alert.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' : alert.type === 'error' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>
             <Zap size={16} />
          </div>
          <p className="text-[11px] font-black text-zinc-200 uppercase tracking-wide">{alert.message}</p>
        </div>,
        document.body
      )}

      {showTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200 p-4">
          <div className="bg-[#09090b] w-[380px] rounded-2xl shadow-2xl border border-white/10 overflow-hidden transform animate-in zoom-in-95 duration-200 text-zinc-100">
            <div className="bg-white/5 px-4 py-3 border-b border-white/10 text-white flex justify-between items-center">
              <div className="flex items-center gap-2"><Zap size={14} className="text-amber-400 fill-amber-400" /><span className="text-[10px] font-bold uppercase tracking-wider text-zinc-200">Optimization & Sanitize Module</span></div>
              <button onClick={closeTutorial} className="hover:bg-white/10 p-1 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"><X size={16} /></button>
            </div>
            <div className="p-5">
              <h2 className="text-sm font-bold text-zinc-100 mb-2">{currentTenant} Catalog Audit</h2>
              <p className="text-[12px] text-zinc-400 leading-snug mb-4">Section optimized for the analysis, positional structural cleaning and validation of {currentTenant} catalog updates.</p>
              <div className="space-y-2"><div className="flex gap-3 p-2.5 bg-white/5 rounded-xl border-l-2 border-white/40"><FileText className="text-zinc-400 shrink-0" size={16} /><p className="text-[11px] text-zinc-300">Auto-cleanses header corruptions, multi-line row breaking and handles strict null allocations.</p></div></div>
              <button onClick={closeTutorial} className="w-full mt-5 bg-white text-zinc-950 py-2 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all shadow-md">Get Started</button>
            </div>
          </div>
        </div>
      )}



      <div className="grid grid-cols-12 gap-6 flex-grow min-h-0">
        <aside className="col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <div className="bg-[#09090b]/80 border border-white/10 rounded-2xl p-5 shadow-sm backdrop-blur-xl">
            <div className="space-y-6">
              <Step icon={<FiUploadCloud size={14}/>} title="Data Ingestion" desc={fileName ? "Sanitized Matrix" : "Waiting for CSV"} active={!!file} />
              <Step icon={<Zap size={14}/>} title="Cloud Sync" desc={backendSuccess ? "Stored" : "Pending"} active={backendSuccess} isLast />
            </div>
          </div>
          <EJECUTOR_PLAY 
            handleUnifiedProcess={handleUnifiedProcess}
            handleFullReset={handleFullReset}
            file={file}
            isProcessing={isProcessing}
            currentTenant={currentTenant}
            hasExistingData={hasExistingData}
          />
        </aside>

        <div className="col-span-9 flex flex-col h-full min-h-0">
          <nav className="flex bg-white/5 border border-white/5 p-1 rounded-xl gap-1 w-fit">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold bg-white/10 border border-white/10 text-zinc-100 shadow-sm"><Terminal size={12}/> Console View</div>
          </nav>
          <main className="flex-1 bg-[#09090b]/80 border border-white/10 rounded-2xl shadow-sm flex flex-col min-h-0 overflow-hidden relative group mt-4 backdrop-blur-xl">
            <button onClick={() => setIsMaximized(true)} className="absolute top-3 right-3 z-30 p-2 bg-[#09090b]/90 hover:bg-white hover:text-zinc-950 border border-white/15 text-zinc-300 rounded-lg shadow-sm transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 text-[10px] font-bold tracking-wider"><FiMaximize2 size={12} /> EXPAND VIEW</button>
            {renderVisualizerContent()}
          </main>
        </div>
      </div>

      {isMaximized && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-10 animate-in fade-in duration-300">
          <div className="bg-[#09090b] border border-white/10 w-[95vw] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
            <div className="flex-shrink-0 bg-[#121215] border-b border-white/10 p-4 flex justify-between items-center text-zinc-100">
              <div className="flex items-center gap-3"><Terminal size={18} /><span className="text-sm font-black uppercase tracking-widest text-zinc-200">Inspection Mode: CONSOLE.</span></div>
              <button onClick={() => setIsMaximized(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"><FiX size={24} /></button>
            </div>
            <div className="flex-grow overflow-hidden bg-transparent">{renderVisualizerContent()}</div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const Step = ({ icon, title, desc, active, isLast }) => (
  <div className="flex gap-4 relative">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 ${active ? 'bg-white border-white text-zinc-950 shadow-lg font-bold' : 'bg-white/5 border-white/10 text-zinc-500'}`}>{icon}</div>
      {!isLast && <div className={`w-[2px] h-10 my-1 ${active ? 'bg-white/40' : 'bg-white/10'}`} />}
    </div>
    <div className={`pt-1 ${!active && 'opacity-40'}`}>
      <h4 className="text-[10px] font-black mb-1 text-zinc-100 uppercase tracking-wider">{title}</h4>
      <p className="text-[10px] text-zinc-400 font-medium truncate w-32">{desc}</p>
    </div>
  </div>
);

export default SVXUnifiedPlatform;