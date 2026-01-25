import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, 
  FiCheck, 
  FiZap, 
  FiShield, 
  FiCpu,
  FiX,
  FiSearch,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiInfo,
  FiXCircle
} from 'react-icons/fi';
import { 
  BsFileEarmarkArrowUp
} from 'react-icons/bs';

import { supabase } from '../../../lib/supabaseClient';

const SVXCopilotEnterprise = () => {
  const [data, setData] = useState([]); 
  const [masterDataRows, setMasterDataRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null); 
  const [diffCount, setDiffCount] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
  };

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert({ ...alert, show: false }), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const processCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return;
    const sampleLine = lines.find(l => l.includes(';') || l.includes(','));
    const delimiter = sampleLine && sampleLine.includes(';') ? ';' : ',';
    const matrix = lines.map(line => line.split(delimiter).map(cell => cell.trim()));

    setData(matrix);
    setMatchStatus(null);
    setDiffCount(0);
    setMasterDataRows([]);
    showAlert("Archivo CSV cargado correctamente", "success");
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => processCSV(event.target.result);
      reader.readAsText(file);
    } else {
      showAlert("Formato no válido. Use solo .CSV", "error");
    }
  }, []);

  const handleAnalyze = async () => {
    if (data.length === 0) return;
    setIsAnalyzing(true);
    try {
      const { data: dbRows, error } = await supabase
        .from('ClientsSERVEX')
        .select('csv_raw')
        .not('csv_raw', 'is', null)
        .limit(1); 

      if (error) throw error;
      if (!dbRows || dbRows.length === 0) {
        showAlert("Registro maestro no encontrado", "error");
        setIsAnalyzing(false); return;
      }

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
        showAlert("Integridad Total Confirmada", "success");
      } else {
        setMatchStatus('mismatch');
        setDiffCount(discrepancies.length);
        setMasterDataRows(discrepancies.map(d => d.mRow));
        setData([header, ...discrepancies.map(d => d.row)]);
        showAlert(`Discrepancias detectadas: ${discrepancies.length}`, "warning");
      }
    } catch (err) {
      showAlert("Error de conexión con SVX Cloud", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-[#FDFDFD] p-2 md:p-4 font-sans text-[#242424] w-full max-w-5xl mx-auto">
      
      <AnimatePresence>
        {alert.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[9999] flex items-center gap-2 px-3 py-2 rounded-lg shadow-xl border bg-white border-[#EDEBE9] min-w-[240px]"
          >
            <div className={`p-1.5 rounded-md text-white ${alert.type === 'success' ? 'bg-[#237B4B]' : alert.type === 'error' ? 'bg-[#A4262C]' : alert.type === 'warning' ? 'bg-[#D83B01]' : 'bg-[#464775]'}`}>
              {alert.type === 'success' && <FiCheckCircle size={14} />}
              {alert.type === 'error' && <FiXCircle size={14} />}
              {alert.type === 'warning' && <FiAlertTriangle size={14} />}
              {alert.type === 'info' && <FiInfo size={14} />}
            </div>
            <div className="flex-grow">
              <p className="text-[10px] font-bold leading-tight">{alert.message}</p>
            </div>
            <button onClick={() => setAlert({ ...alert, show: false })}><FiX size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-3">
        
   

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          
          {/* LADO IZQUIERDO */}
          <div className="lg:col-span-3 bg-white border border-[#EDEBE9] rounded-lg overflow-hidden flex flex-col shadow-sm h-fit">
              <div className="bg-[#FAF9F8] p-2 border-b border-[#EDEBE9]">
                <h3 className="text-[9px] font-black text-[#464775] uppercase tracking-wider text-center">Protocolo</h3>
              </div>
              
              <div className="p-3">
                <div className="flex flex-col">
                  <Step icon={<FiCheck size={12}/>} title="Archivo" desc={fileName || "Pendiente"} active={data.length > 0} />
                  <Step icon={<FiSearch size={12}/>} title="Mapeo" desc="SVX Cloud" active={isAnalyzing || matchStatus} />
                  <Step icon={<FiShield size={12}/>} title="Delta" desc={matchStatus ? "Finalizado" : "En espera"} active={matchStatus} isLast />
                </div>
                
                {matchStatus === 'mismatch' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 p-2 bg-[#FFF4F4] rounded border border-red-500/10">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-500 rounded-px" />
                      <span className="text-[8px] font-black text-red-800 uppercase">DB Master</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#237B4B] rounded-px" />
                      <span className="text-[8px] font-black text-[#237B4B] uppercase">CSV Nuevo</span>
                    </div>
                  </motion.div>
                )}
              </div>
          </div>

          {/* CONSOLA */}
          <div className="lg:col-span-9 bg-white border border-[#EDEBE9] rounded-lg p-4 shadow-sm flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold">Consola de Análisis</h2>
              <BsFileEarmarkArrowUp size={18} className={data.length > 0 ? "text-[#464775]" : "text-[#EDEBE9]"} />
            </div>

            <AnimatePresence mode="wait">
              {data.length === 0 ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex-grow border border-dashed rounded-lg flex flex-col items-center justify-center transition-all ${isDragging ? "bg-[#F3F2F1] border-[#464775]" : "bg-[#FAF9F8] border-[#EDEBE9]"}`}
                >
                  <FiUploadCloud size={24} className="text-[#464775] mb-2" />
                  <p className="text-[10px] font-bold">Suelte el CSV aquí</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-grow overflow-hidden flex flex-col">
                  <div className="overflow-auto border rounded-md max-h-[300px]">
                    <table className="w-full text-left text-[9px]">
                      <thead className="bg-[#FAF9F8] sticky top-0 z-20">
                        <tr>
                          {data[0].map((h, i) => (
                            <th key={i} className="p-2 font-black border-b text-[#464775] uppercase whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.slice(1).map((row, ri) => (
                          <tr key={ri} className="border-b hover:bg-gray-50 transition-colors">
                            {row.map((cell, ci) => {
                              const masterCell = masterDataRows[ri] ? masterDataRows[ri][ci] : null;
                              const isCellDiff = masterCell !== null && cell !== masterCell;
                              return (
                                <td key={ci} className={`p-2 border-r border-[#F3F2F1] last:border-0 ${isCellDiff ? 'bg-orange-50/30' : ''}`}>
                                  {isCellDiff ? (
                                    <div className="flex flex-col">
                                      <span className="text-red-500 line-through font-medium opacity-70">{masterCell || '(null)'}</span>
                                      <div className="flex items-center gap-1 text-[#237B4B] font-bold">
                                        <FiArrowRight size={8} /><span>{cell}</span>
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
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex justify-end gap-2 pt-3 border-t">
               <button onClick={() => { setData([]); setMatchStatus(null); setFileName(""); setMasterDataRows([]); }} className="px-3 py-1.5 border rounded-md text-[9px] font-bold text-gray-500 hover:bg-gray-50 uppercase tracking-tighter">
                 Reset
               </button>
               <button 
                onClick={handleAnalyze} disabled={data.length === 0 || isAnalyzing}
                className={`px-4 py-1.5 rounded-md text-[9px] font-black shadow-md flex items-center gap-2 transition-all ${data.length > 0 ? 'bg-[#464775] text-white hover:brightness-110' : 'bg-gray-100 text-gray-400'}`}
               >
                 {isAnalyzing ? "AUDITANDO..." : "EJECUTAR"} <FiZap size={10} />
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Step = ({ icon, title, desc, active, isLast }) => (
  <div className="flex gap-3 relative">
    <div className="flex flex-col items-center">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${active ? 'bg-[#464775] border-[#464775] text-white' : 'bg-white border-[#EDEBE9] text-gray-300'}`}>
        {icon}
      </div>
      {!isLast && <div className={`w-[1px] h-full my-0.5 ${active ? 'bg-[#464775]' : 'bg-[#F3F2F1]'}`} />}
    </div>
    <div className={`pb-4 ${!active && 'opacity-40'}`}>
      <h4 className="text-[10px] font-black leading-none mb-0.5">{title}</h4>
      <p className="text-[8px] text-[#616161] font-medium truncate w-20">{desc}</p>
    </div>
  </div>
);

export default SVXCopilotEnterprise;