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

// Importamos el cliente de supabase
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
    <div className="flex flex-col items-center min-h-screen bg-[#FDFDFD] p-4 md:p-8 font-sans text-[#242424]">
      
      {/* NOTIFICACIONES CUSTOM */}
      <AnimatePresence>
        {alert.show && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
            className="fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border min-w-[320px] bg-white border-[#EDEBE9]"
          >
            <div className={`p-2 rounded-lg text-white ${alert.type === 'success' ? 'bg-[#237B4B]' : alert.type === 'error' ? 'bg-[#A4262C]' : alert.type === 'warning' ? 'bg-[#D83B01]' : 'bg-[#464775]'}`}>
              {alert.type === 'success' && <FiCheckCircle size={18} />}
              {alert.type === 'error' && <FiXCircle size={18} />}
              {alert.type === 'warning' && <FiAlertTriangle size={18} />}
              {alert.type === 'info' && <FiInfo size={18} />}
            </div>
            <div className="flex-grow">
              <p className="text-[9px] font-black uppercase tracking-tighter text-[#616161]">SVX System Message</p>
              <p className="text-[12px] font-bold">{alert.message}</p>
            </div>
            <button onClick={() => setAlert({ ...alert, show: false })}><FiX size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-7xl space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white border border-[#EDEBE9] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#464775] rounded-lg flex items-center justify-center text-white shadow-lg"><FiCpu size={24} /></div>
            <div>
              <h1 className="text-xl font-black tracking-tight">SVX Copilot <span className="font-light text-[#616161]">| Delta Audit</span></h1>
              <p className="text-[11px] text-[#616161] uppercase font-bold tracking-widest">Master Data Comparison</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-[#616161] uppercase">Diferencias Críticas</p>
            <p className={`text-xl font-black ${matchStatus === 'match' ? 'text-[#237B4B]' : matchStatus === 'mismatch' ? 'text-red-500' : 'text-[#464775]'}`}>
              {matchStatus === 'match' ? '0' : matchStatus === 'mismatch' ? diffCount : '---'}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LADO IZQUIERDO: PROTOCOLO DE ANÁLISIS REFORZADO */}
          <div className="lg:col-span-3 bg-white border border-[#EDEBE9] rounded-xl overflow-hidden flex flex-col shadow-sm">
              <div className="bg-[#FAF9F8] p-4 border-b border-[#EDEBE9]">
                <h3 className="text-[11px] font-black text-[#464775] uppercase tracking-wider">Protocolo de Análisis</h3>
              </div>
              
              <div className="p-6 flex-grow">
                <div className="flex flex-col">
                  <Step 
                    icon={<FiCheck />} 
                    title="Archivo Local" 
                    desc={fileName || "Pendiente de carga"} 
                    active={data.length > 0} 
                    isLast={false} 
                  />
                  <Step 
                    icon={<FiSearch />} 
                    title="Mapeo Binario" 
                    desc="Comparación en SVX Cloud" 
                    active={isAnalyzing || matchStatus} 
                    isLast={false} 
                  />
                  <Step 
                    icon={<FiShield />} 
                    title="Resultado Delta" 
                    desc={matchStatus === 'mismatch' ? "Cambios detectados" : "Esperando ejecución"} 
                    active={matchStatus} 
                    isLast={true} 
                  />
                </div>
                
                {matchStatus === 'mismatch' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-[#FFF4F4] rounded-lg border border-red-100">
                    <h4 className="text-[10px] font-black uppercase text-red-700 mb-3 flex items-center gap-2">
                      <FiAlertTriangle /> Leyenda Delta
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-sm shadow-sm" />
                        <span className="text-[10px] font-bold text-red-800 tracking-tight">DATA MAESTRA (DB)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#237B4B] rounded-sm shadow-sm" />
                        <span className="text-[10px] font-bold text-[#237B4B] tracking-tight">NUEVO VALOR (CSV)</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
          </div>

          {/* LADO DERECHO: CONSOLA */}
          <div className="lg:col-span-9 bg-white border border-[#EDEBE9] rounded-xl p-8 shadow-sm flex flex-col min-h-[550px]">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-bold">Consola de Comparación Inteligente</h2>
              <BsFileEarmarkArrowUp size={24} className={data.length > 0 ? "text-[#464775]" : "text-[#EDEBE9]"} />
            </div>

            <AnimatePresence mode="wait">
              {data.length === 0 ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex-grow border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${isDragging ? "bg-[#F3F2F1] border-[#464775]" : "bg-[#FAF9F8] border-[#EDEBE9]"}`}
                >
                  <FiUploadCloud size={40} className="text-[#464775] mb-4" />
                  <p className="font-bold">Sube el CSV para auditar contra la DB</p>
                  <p className="text-[11px] text-[#616161]">Comparación automática de precios y referencias</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-grow overflow-hidden flex flex-col">
                  <div className="overflow-auto border rounded-lg max-h-[450px] shadow-inner">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-[#FAF9F8] sticky top-0 shadow-sm z-20">
                        <tr>
                          {data[0].map((h, i) => (
                            <th key={i} className="p-3 font-black border-b text-[#464775] uppercase whitespace-nowrap">{h}</th>
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
                                <td key={ci} className={`p-3 border-r border-[#F3F2F1] last:border-0 ${isCellDiff ? 'bg-orange-50/20' : ''}`}>
                                  {isCellDiff ? (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-red-500 line-through font-medium">{masterCell || '(null)'}</span>
                                      <div className="flex items-center gap-1 text-[#237B4B] font-bold">
                                        <FiArrowRight size={10} /><span>{cell}</span>
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

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t">
               <button onClick={() => { setData([]); setMatchStatus(null); setFileName(""); setMasterDataRows([]); }} className="px-6 py-2 border rounded-lg text-[12px] font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-tighter">
                 Resetear Consola
               </button>
               <button 
                onClick={handleAnalyze} disabled={data.length === 0 || isAnalyzing}
                className={`px-8 py-2 rounded-lg text-[12px] font-black shadow-lg flex items-center gap-2 transition-all ${data.length > 0 ? 'bg-[#464775] text-white hover:scale-[1.02]' : 'bg-gray-100 text-gray-400'}`}
               >
                 {isAnalyzing ? "PROCESANDO..." : "EJECUTAR AUDITORÍA"} <FiZap />
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* COMPONENTE STEP OPTIMIZADO */
const Step = ({ icon, title, desc, active, isLast }) => (
  <div className="flex gap-4 relative">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] border-2 z-10 transition-all ${active ? 'bg-[#464775] border-[#464775] text-white shadow-md' : 'bg-white border-[#EDEBE9] text-gray-300'}`}>
        {icon}
      </div>
      {!isLast && (
        <div className={`w-[2px] h-full -my-1 transition-colors ${active ? 'bg-[#464775]' : 'bg-[#F3F2F1]'}`} />
      )}
    </div>
    <div className={`pb-8 transition-opacity ${!active && 'opacity-40'}`}>
      <h4 className="text-[12px] font-black text-[#242424] leading-none mb-1">{title}</h4>
      <p className="text-[10px] text-[#616161] font-medium max-w-[140px] break-words line-clamp-2" title={desc}>
        {desc}
      </p>
    </div>
  </div>
);

export default SVXCopilotEnterprise;