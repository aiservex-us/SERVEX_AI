'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FiUploadCloud, FiX, FiMaximize2, FiChevronLeft, FiChevronRight 
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
import { supabase } from '../../../lib/supabaseClient';

// IMPORTACIÓN DE COMPONENTES EXTERNOS
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

  // --- UNIFIED STATES ---
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState([]); 
  
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
    if (!rawCsvText || !rawCsvText.trim()) return [];

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

    if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) return [];

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
    
    const perfectHeaders = fullRawHeader.split(delimiter).map(token => {
      let tClean = token.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '').replace(/'/g, '');
      return tClean.split(/\s+/).join(' ').trim();
    });

    const dataLines = lines.slice(dataStartIndex);
    const finalizedMatrix = [perfectHeaders];

    dataLines.forEach(line => {
      if (!line.trim()) return; 
      const currentCells = line.split(delimiter);
      const sanitizedRow = [];

      perfectHeaders.forEach((_, index) => {
        let cellValue = currentCells[index] !== undefined ? currentCells[index] : '';
        if (cellValue === '') {
          sanitizedRow.push(null); 
        } else {
          cellValue = cellValue.replace(/^["']|["']$/g, '').trim(); 
          sanitizedRow.push(cellValue);
        }
      });

      if (currentCells.length > perfectHeaders.length) {
        const orphaned = currentCells.slice(perfectHeaders.length).map(c => c.replace(/^["']|["']$/g, '').trim());
        sanitizedRow.push(`[ORPHANED]: ${orphaned.join(' | ')}`);
      }

      finalizedMatrix.push(sanitizedRow);
    });

    return finalizedMatrix;
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
      const sanitizedMatrix = sanitizeCSVToMatrix(text);
      
      if (sanitizedMatrix.length === 0) {
        showAlert("The file contains empty or unparseable blocks", "error");
        return;
      }

      setData(sanitizedMatrix);
      setCurrentPage(1); 
      showAlert("File cleansed and structured successfully", "success");
    };
    reader.readAsText(selectedFile);
  };

  // =========================================================================
  // --- CONVERSOR DE MATRIZ SANADA A TEXTO PLANO (CSV STRING) ---
  // =========================================================================
  const convertMatrixToCSVText = (matrix) => {
    return matrix.map(row => {
      return row.map(cell => {
        if (cell === null || cell === undefined) return '';
        let cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes(';') || cellStr.includes('\n') || cellStr.includes('"')) {
          cellStr = `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',');
    }).join('\n');
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
      console.log('[+] Convirtiendo matriz estructurada a formato CSV plano...');
      const cleansedCSVText = convertMatrixToCSVText(data);

      console.log(`[+] Sincronizando con la tabla ${targetTableName} para tenant: ${currentTenant}`);
      
      // Realizamos el upsert apuntando explícitamente sobre el índice único company_name
      const { error: supabaseError } = await supabase
        .from(targetTableName)
        .upsert(
          { 
            company_name: currentTenant, 
            csv_new_raw: cleansedCSVText,
            created_at: new Date().toISOString()
          }, 
          { onConflict: 'company_name' }
        );

      if (supabaseError) {
        throw new Error(`Supabase Error: ${supabaseError.message}`);
      }

      setBackendSuccess(true);
      showAlert("CSV matrix successfully processed and saved to Supabase", "success");
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
    setData([]); setFile(null); setFileName("");
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
        {!file ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <DownloadCloud size={40} />
            <p className="text-[11px] font-bold mt-2">Drop CSV for preview</p>
            <input type="file" accept=".csv" onChange={(e) => processFileSelection(e.target.files[0])} className="hidden" id="main-up" />
            <label htmlFor="main-up" className="mt-4 px-4 py-2 border rounded text-[10px] font-bold cursor-pointer uppercase">Load File</label>
          </div>
        ) : (
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
                Mostrando del <span className="font-bold text-[#464775]">{getCurrentRangeLabels().start}</span> al <span className="font-bold text-[#464775]">{getCurrentRangeLabels().end}</span> de un total de <span className="font-bold">{data.length - 1}</span> productos.
              </div>
              <div className="flex items-center gap-15">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Página {currentPage} de {getTotalPages()}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#EDEBE9] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white text-[10px] font-bold uppercase transition-all shadow-sm"
                  >
                    <FiChevronLeft size={12} /> Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                    disabled={currentPage === getTotalPages()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded border border-[#EDEBE9] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white text-[10px] font-bold uppercase transition-all shadow-sm"
                  >
                    Siguiente <FiChevronRight size={12} />
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

      <header className="flex-shrink-0 flex items-center justify-between bg-white p-4 border border-[#EDEBE9] rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <img src={`/logosEmpresas/WB.webp`} alt={currentTenant} className="w-15 h-15 rounded object-contain" onError={(e) => { e.target.src = "/logosEmpresas/default.webp"; }} />
          <div>
            <h1 className="text-sm font-bold uppercase tracking-tight">SERVEX_AI Unified Hub</h1>
            <p className="text-[10px] text-gray-500 font-medium">{currentTenant} Strategic Control</p>
          </div>
        </div>

        <nav className="flex bg-[#F3F2F1] p-1 rounded-md gap-1">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold bg-white text-[#444791] shadow-sm">
            <Terminal size={12}/> Console View
          </div>
        </nav>
      </header>

      <div className="grid grid-cols-12 gap-6 flex-grow min-h-0">
        <aside className="col-span-3 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-white border border-[#EDEBE9] rounded-lg p-5 shadow-sm">
            <h3 className="text-[10px] font-black text-[#464775] mb-6 uppercase">Execution Pipeline</h3>
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
          />
        </aside>

        <div className="col-span-9 flex flex-col h-full min-h-0">
          <main className="flex-1 bg-white border border-[#EDEBE9] rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden relative group">
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