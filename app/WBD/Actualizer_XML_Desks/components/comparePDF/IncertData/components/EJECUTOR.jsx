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
  Terminal,
  Trash2
} from 'lucide-react';

// Importación de la instancia del cliente de Supabase
import { supabase } from '../../../../../../lib/supabaseClient';

// IMPORTACIÓN DE COMPONENTES EXTERNOS
import EJECUTOR_PLAY from './EJECUTOR_PLAY';

const SVXUnifiedPlatform = () => {
  // --- CONFIGURACIÓN MULTI-TENANT DINÁMICA ---
  const [currentTenant] = useState('WBD'); 
  const [targetTableName] = useState('ClientsSERVEX_WBD');

  // --- TUTORIAL ALERT STATE ---
  const [showTutorial, setShowTutorial] = useState(false);

  // --- ESTADOS PARA VERIFICACIÓN DE CATÁLOGO ACTIVO ---
  const [hasExistingData, setHasExistingData] = useState(false);
  const [isClearingBackend, setIsClearingBackend] = useState(false);
  const [isDeletingRow, setIsDeletingRow] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = sessionStorage.getItem(`servex_audit_tutorial_${currentTenant.toLowerCase()}`);
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
    // Verificar si la columna csv_new_raw tiene información en Supabase para este tenant
    checkExistingCatalog();
  }, [currentTenant]);

  const closeTutorial = () => {
    setShowTutorial(false);
    sessionStorage.setItem(`servex_audit_tutorial_${currentTenant.toLowerCase()}`, 'true');
  };

  // --- COMPROBACIÓN EN BACKEND ---
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
      console.error('[-] Error al verificar el registro de catálogo activo:', err);
    }
  };

  // --- CONTROLADOR PARA BORRAR LA COLUMNA EXCLUSIVAMENTE ---
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
      console.error('[-] Error al vaciar la columna csv_new_raw:', err);
      showAlert(`Error: ${err.message}`, "error");
    } finally {
      setIsClearingBackend(false);
    }
  };

  // --- CONTROLADOR PARA ELIMINAR LA FILA COMPLETA DE LA TABLA ---
  const handleDeleteCompleteRow = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to completely delete the row associated with company ${currentTenant} from the database? This action cannot be undone.`);
    if (!confirmDelete) return;

    setIsDeletingRow(true);
    try {
      const { error } = await supabase
        .from(targetTableName)
        .delete()
        .eq('company_name', currentTenant);

      if (error) throw error;

      setHasExistingData(false);
      handleFullReset();
      showAlert(`Complete row for ${currentTenant} has been successfully deleted.`, "success");
    } catch (err) {
      console.error('[-] Error crítico al eliminar la fila completa:', err);
      showAlert(`Deletion failed: ${err.message}`, "error");
    } finally {
      setIsDeletingRow(false);
    }
  };

  // --- UNIFIED STATES ---
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState([]); 
  const [sanitizedJsonData, setSanitizedJsonData] = useState([]); // Estructura JSON limpia (Array de Objetos)
  
  // --- PAGINATION STATES (DINÁMICA PARA TODO EL CSV) ---
  const [currentPage, setCurrentPage] = useState(1);

  // --- CONTROL STATES ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [backendSuccess, setBackendSuccess] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // =========================================================================
  // --- ALGORITMO DE SANEAMIENTO ESTRUCTURAL EN MEMORIA (IGUALADO A PYTHON) ---
  // =========================================================================
  const sanitizeCSVToMatrix = (rawCsvText) => {
    if (!rawCsvText || !rawCsvText.trim()) return { matrix: [], json: [] };

    const lines = [];
    let currentLine = '';
    let insideQuotes = false;

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

    if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) return { matrix: [], json: [] };

    let rawHeaderAccum = [];
    let dataStartIndex = 0;
    let openQuotes = false;

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
    const delimiter = fullRawHeader.includes(';') ? ';' : ',';
    
    const tokens = fullRawHeader.split(delimiter);
    const perfectHeaders = tokens.map(token => {
      let tClean = token.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '').replace(/'/g, '');
      return tClean.split(/\s+/).join(' ').trim();
    });

    const dataLines = lines.slice(dataStartIndex);
    const finalizedMatrix = [perfectHeaders];
    const sanitizedJson = []; // Array de objetos llave-valor intermedio para inyección limpia

    dataLines.forEach(line => {
      if (!line.trim()) return; 
      const currentCells = line.split(delimiter);
      const sanitizedRow = [];
      const rowObject = {};

      perfectHeaders.forEach((header, index) => {
        let cellValue = currentCells[index] !== undefined ? currentCells[index] : '';
        if (cellValue === '') {
          sanitizedRow.push(null); 
          rowObject[header] = null;
        } else {
          cellValue = cellValue.replace(/^["']|["']$/g, '').trim(); 
          sanitizedRow.push(cellValue);
          rowObject[header] = cellValue;
        }
      });

      if (currentCells.length > perfectHeaders.length) {
        const orphaned = currentCells.slice(perfectHeaders.length).map(c => c.replace(/^["']|["']$/g, '').trim());
        sanitizedRow.push(`[ORPHANED]: ${orphaned.join(' | ')}`);
        rowObject['_orphaned_fields'] = orphaned;
      }

      finalizedMatrix.push(sanitizedRow);
      sanitizedJson.push(rowObject);
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
      
      console.log('[+] Ejecutando saneamiento celular pre-renderizado...');
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

  // =========================================================================
  // --- ALMACENAMIENTO EXCLUSIVO EN LA COLUMNA csv_new_raw DE SUPABASE ---
  // =========================================================================
  const handleUnifiedProcess = async () => {
    if (!file || data.length === 0) { 
      showAlert("Please upload and process a CSV file first", "warning"); 
      return; 
    }
    setIsProcessing(true);

    try {
      console.log('[+] Recuperando sesión de usuario para auditoría...');
      const { data: { user } } = await supabase.auth.getUser();

      console.log(`[+] Sincronizando con la tabla ${targetTableName} para tenant: ${currentTenant}`);
      
      // Creamos el payload asignando directamente el array estructurado JSON sin convertirlo a texto plano por comas
      const payload = { 
        company_name: currentTenant, 
        csv_new_raw: sanitizedJsonData, // Se inyecta la matriz limpia serializada en objetos idéntica a insertXM
        created_at: new Date().toISOString()
      };

      if (user) {
        payload.user_id = user.id;
      }

      // Realizamos el upsert apuntando explícitamente sobre el índice único de tu DDL: company_name
      const { error: supabaseError } = await supabase
        .from(targetTableName)
        .upsert(payload, { onConflict: 'company_name' });

      if (supabaseError) {
        throw new Error(`Supabase Error: ${supabaseError.message}`);
      }

      setBackendSuccess(true);
      setHasExistingData(true); // Cambia el estado para que se refleje de inmediato
      showAlert("CSV matrix successfully processed and saved to csv_new_raw", "success");
    } catch (err) {
      console.error('[-] Error crítico en la persistencia cloud de Supabase:', err);
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
  };

  // =========================================================================
  // --- CÁLCULO DE ÍNDICES DINÁMICOS ---
  // =========================================================================
  const getPaginatedData = () => {
    if (data.length <= 1) return [];
    const rawProducts = data.slice(1); 
    
    if (currentPage === 1) {
      return rawProducts.slice(0, 20); 
    } else {
      const start = 20 + (currentPage - 2) * 30;
      const end = start + 30;
      return rawProducts.slice(start, end);
    }
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
    
    if (currentPage === 1) {
      return { start: 1, end: Math.min(20, total) };
    } else {
      const start = 21 + (currentPage - 2) * 30;
      const end = Math.min(start + 29, total);
      return { start, end };
    }
  };

  const renderVisualizerContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b border-[#EDEBE9] flex justify-between items-center bg-[#FAF9F8]">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-black text-[#464775] uppercase">{currentTenant} Sanitized Viewer</h2>
          <span className="bg-[#237B4B]/10 text-[#237B4B] text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">In-Memory Cleansed</span>
        </div>
      </div>

      <div className="flex-grow overflow-auto">
        {hasExistingData && !file ? (
          /* --- ADVERTENCIA CENTRALIZADA CUANDO HAY DATOS EN DB Y NO SE HA CARGADO ARCHIVO --- */
          <div className="h-full flex items-center justify-center p-6 bg-gray-50/50">
            <div className="bg-white border border-[#EDEBE9] rounded-xl p-8 max-w-md w-full shadow-lg text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto w-12 h-12 bg-[#464775]/10 rounded-full flex items-center justify-center text-[#464775]">
                <Zap size={24} className="fill-[#464775]/10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#464775] bg-[#464775]/10 inline-block px-2.5 py-1 rounded">
                  Active Catalog Record
                </h3>
                <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                  Stored information was detected in the <code className="font-mono bg-gray-100 px-1 py-0.5 rounded border border-gray-200 text-[#464775]">csv_new_raw</code> column for this tenant. Please review the existing updated Excel/CSV file.
                </p>
              </div>
              <div className="pt-2">
                <button 
                  onClick={handleIgnoreAndClear}
                  disabled={isClearingBackend}
                  className="w-full bg-[#464775] hover:bg-[#3b3e7a] text-white font-bold text-[11px] uppercase tracking-wider py-3 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isClearingBackend ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Processing Server...
                    </>
                  ) : (
                    "Ignore & Load New CSV"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : !file ? (
          /* --- VISTA DE CARGA INICIAL POR DEFECTO --- */
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <DownloadCloud size={40} />
            <p className="text-[11px] font-bold mt-2">Drop CSV for preview</p>
            <input type="file" accept=".csv" onChange={(e) => processFileSelection(e.target.files[0])} className="hidden" id="main-up" />
            <label htmlFor="main-up" className="mt-4 px-4 py-2 border rounded text-[10px] font-bold cursor-pointer uppercase">Load File</label>
          </div>
        ) : (
          /* --- TABLA CON LA MATRIZ DE DATOS --- */
          <div className="flex flex-col h-full justify-between">
            <div className="overflow-auto flex-grow">
              <table className="w-full text-left text-[10px]">
                  <thead className="bg-[#FAF9F8] sticky top-0 z-20">
                    <tr>{data[0]?.map((h, i) => <th key={i} className="p-3 font-black border-b border-[#EDEBE9] uppercase whitespace-nowrap">{h || `Column_${i}`}</th>)}</tr>
                  </thead>
                  <tbody>
                    {getPaginatedData().map((row, ri) => {
                      return (
                        <tr key={ri} className="border-b border-[#F3F2F1] hover:bg-gray-50 transition-colors bg-white">
                          {row.map((cell, ci) => {
                            return (
                              <td key={ci} className="p-3 border-r border-[#F3F2F1]">
                                <span className={cell === null ? 'text-gray-300 italic font-mono' : 'text-gray-600'}>
                                  {cell === null ? 'null' : cell}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
              </table>
            </div>

            <div className="flex-shrink-0 bg-[#FAF9F8] border-t border-[#EDEBE9] px-4 py-2.5 flex items-center justify-between text-[11px] font-medium text-gray-600">
              <div>
                Showing <span className="font-bold text-[#464775]">{getCurrentRangeLabels().start}</span> to <span className="font-bold text-[#464775]">{getCurrentRangeLabels().end}</span> of <span className="font-bold">{data.length - 1}</span> products.
              </div>
              <div className="flex items-center gap-15">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Page {currentPage} of {getTotalPages()}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#EDEBE9] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white text-[10px] font-bold uppercase transition-all shadow-sm"
                  >
                    <FiChevronLeft size={12} /> Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                    disabled={currentPage === getTotalPages()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#EDEBE9] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white text-[10px] font-bold uppercase transition-all shadow-sm"
                  >
                    Next <FiChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-[88vh] bg-[#FDFDFD] p-6 font-sans text-[#242424] max-w-[1600px] mx-auto space-y-4 relative overflow-hidden flex flex-col">
      
      {/* --- POPUP PROCESANDO DATOS BASE --- */}
      {isProcessing && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-6">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-lg sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 sm:space-y-4 transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#5b5fc7]/10 rounded-full animate-ping"></div>
                <div className="relative bg-white border border-gray-100 p-2 sm:p-3 rounded-full shadow-sm">
                  <FiDatabase className="text-[#5b5fc7] animate-pulse" size={20} />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-tight">System Base Storage</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Module ({currentTenant})</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 text-left">
              <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={14} />
              <p className="text-[9px] sm:text-[10px] text-amber-800 leading-tight">
                <strong>IMPORTANT:</strong> Uploading base {currentTenant} files to Cloud Database. <strong>Do not close</strong> this window or switch sections.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#5b5fc7]">
              <Loader2 size={12} className="animate-spin" />
              <span className="uppercase tracking-widest">Saving to Cloud Database...</span>
            </div>
          </div>
        </div>
      )}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-[2000] p-3 rounded shadow-lg text-[11px] font-bold uppercase tracking-wider ${alert.type === 'success' ? 'bg-emerald-600 text-white' : alert.type === 'error' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}>
          {alert.message}
        </div>
      )}

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

      

      <div className="grid grid-cols-12 gap-6 flex-grow min-h-0">
      <aside className="col-span-3 flex flex-col gap-4 overflow-y-auto">
  <div className="bg-white border border-[#EDEBE9] rounded-lg p-5 shadow-sm">
    <h3 className=""></h3>
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
    hasExistingData={hasExistingData} // <--- Inyección de la prop aquí
  />
</aside>

        <div className="col-span-9 flex flex-col h-full min-h-0">
          <nav className="flex bg-[#F3F2F1] p-1 rounded-md gap-1">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold bg-white text-[#444791] shadow-sm">
              <Terminal size={12}/> Console View
            </div>
          </nav>
          <main className="flex-1 bg-white border border-[#EDEBE9] rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden relative group mt-4">
            <button 
              onClick={() => setIsMaximized(true)}
              className="absolute top-3 right-3 z-30 p-2 bg-white/90 hover:bg-[#464775] hover:text-white border border-[#EDEBE9] rounded shadow-sm transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 text-[10px] font-bold"
            >
              <FiMaximize2 size={12} /> EXPAND VIEW
            </button>
            {renderVisualizerContent()}
          </main>
        </div>
      </div>

      {isMaximized && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-10 animate-in fade-in duration-300">
          <div className="bg-white w-[95vw] h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex-shrink-0 bg-[#ffffff] p-4 flex justify-between items-center text-black">
              <div className="flex items-center gap-3">
                <Terminal size={18} />
                <span className="text-sm font-black uppercase tracking-widest">Inspection Mode: CONSOLE.</span>
              </div>
              <button onClick={() => setIsMaximized(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><FiX size={24} /></button>
            </div>
            <div className="flex-grow overflow-hidden bg-white">{renderVisualizerContent()}</div>
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
      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${active ? 'bg-[#464775] border-[#444791] text-white shadow-lg' : 'bg-white border-[#EDEBE9] text-gray-300'}`}>
        {icon}
      </div>
      {!isLast && <div className={`w-[2px] h-10 my-1 ${active ? 'bg-[#444791]' : 'bg-[#EDEBE9]'}`} />}
    </div>
    <div className={`pt-1 ${!active && 'opacity-40'}`}>
      <h4 className="text-[10px] font-black mb-1 text-[#464775] uppercase tracking-wider">{title}</h4>
      <p className="text-[10px] text-gray-500 font-medium truncate w-32">{desc}</p>
    </div>
  </div>
);

export default SVXUnifiedPlatform;