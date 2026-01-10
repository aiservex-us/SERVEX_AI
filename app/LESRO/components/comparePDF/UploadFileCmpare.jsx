import React, { useState, useCallback } from 'react';
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
  FiArrowRight
} from 'react-icons/fi';
import { 
  BsFileEarmarkArrowUp
} from 'react-icons/bs';

// Importamos el cliente de supabase
import { supabase } from '../../../lib/supabaseClient';

const SVXCopilotEnterprise = () => {
  const [data, setData] = useState([]); 
  const [masterDataRows, setMasterDataRows] = useState([]); // Para guardar las filas originales de la DB
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null); // 'match', 'mismatch', 'error'
  const [diffCount, setDiffCount] = useState(0);

  const fadeIn = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // 1. PROCESAR CSV LOCAL (Detecta ; o ,)
  const processCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return;

    const sampleLine = lines.find(l => l.includes(';') || l.includes(','));
    const delimiter = sampleLine && sampleLine.includes(';') ? ';' : ',';

    const matrix = lines.map(line => 
      line.split(delimiter).map(cell => cell.trim())
    );

    setData(matrix);
    setMatchStatus(null);
    setDiffCount(0);
    setMasterDataRows([]);
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
    }
  }, []);

  // 2. FUNCIÓN DE AUDITORÍA CON COMPARACIÓN DETALLADA (BEFORE/AFTER)
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
        alert("No se encontró ningún registro maestro en la tabla 'ClientsSERVEX'.");
        setIsAnalyzing(false);
        return;
      }

      const dbRow = dbRows[0];
      const dbLines = dbRow.csv_raw.split(/\r?\n/).filter(l => l.trim() !== "");
      const dbDelimiter = dbLines.find(l => l.includes(';') || l.includes(','))?.includes(';') ? ';' : ',';
      const dbMatrix = dbLines.map(line => line.split(dbDelimiter).map(c => c.trim()));

      const headerIndex = data.findIndex(row => row.join('').includes('ID') || row.join('').includes('Product'));
      const header = data[headerIndex] || data[0];

      const currentRows = data.slice(headerIndex + 1);
      const masterRowsOnly = dbMatrix.slice(headerIndex + 1);

      // Creamos un array de objetos que contienen la fila nueva y su correspondiente maestra
      const auditResults = currentRows.map((row, idx) => {
        const mRow = masterRowsOnly[idx] || []; // Fila espejo en la DB
        const isDifferent = JSON.stringify(row) !== JSON.stringify(mRow);
        return { row, mRow, isDifferent };
      });

      const discrepancies = auditResults.filter(item => item.isDifferent);

      if (discrepancies.length === 0) {
        setMatchStatus('match');
        alert("✅ Integridad Total: El contenido coincide al 100% con la base de datos.");
      } else {
        setMatchStatus('mismatch');
        setDiffCount(discrepancies.length);
        
        // Guardamos las filas de la DB correspondientes a los errores para el "Antes"
        setMasterDataRows(discrepancies.map(d => d.mRow));
        // Actualizamos data con las filas nuevas del CSV
        setData([header, ...discrepancies.map(d => d.row)]);
      }
    } catch (err) {
      console.error("Error en auditoría:", err);
      alert("Error al conectar con la base de datos.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#FDFDFD] p-4 md:p-8 font-sans text-[#242424]">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="w-full max-w-7xl space-y-6">
        
        {/* BRANDING HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white border border-[#EDEBE9] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#464775] rounded-lg flex items-center justify-center text-white shadow-lg">
              <FiCpu size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#242424]">
                SVX Copilot <span className="font-light text-[#616161]">| Delta Audit</span>
              </h1>
              <p className="text-[11px] text-[#616161] uppercase font-bold tracking-widest">Master Data Comparison</p>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#616161] uppercase">Diferencias Críticas</p>
              <p className={`text-xl font-black ${matchStatus === 'match' ? 'text-[#237B4B]' : matchStatus === 'mismatch' ? 'text-red-500' : 'text-[#464775]'}`}>
                {matchStatus === 'match' ? '0' : matchStatus === 'mismatch' ? diffCount : '---'}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LADO IZQUIERDO: INFO */}
          <div className="lg:col-span-3 bg-white border border-[#EDEBE9] rounded-xl p-6">
             <h3 className="text-[12px] font-black text-[#464775] mb-6 uppercase">Protocolo de Análisis</h3>
             <div className="space-y-6 relative">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#F3F2F1]" />
                <Step icon={<FiCheck />} title="Archivo Local" desc={fileName || "Esperando CSV..."} active={data.length > 0} />
                <Step icon={<FiSearch />} title="Mapeo Binario" desc="Celda por celda" active={isAnalyzing || matchStatus} />
                <Step icon={<FiShield />} title="Resultado" desc={matchStatus === 'mismatch' ? "Diferencias visualizadas" : "Esperando..."} active={matchStatus} />
             </div>
             
             {matchStatus === 'mismatch' && (
               <div className="mt-10 p-4 bg-[#FAF9F8] rounded-lg border border-[#EDEBE9]">
                 <h4 className="text-[10px] font-black uppercase text-[#464775] mb-2">Leyenda de Auditoría</h4>
                 <div className="space-y-2">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-red-400 rounded-full" />
                     <span className="text-[9px] font-bold text-[#616161]">ROJO: DATO EN DB (ANTERIOR)</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-[#237B4B] rounded-full" />
                     <span className="text-[9px] font-bold text-[#616161]">VERDE: DATO NUEVO (CSV)</span>
                   </div>
                 </div>
               </div>
             )}
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
                  <div className="overflow-auto border rounded-lg max-h-[450px]">
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
                              // Verificamos si esta celda es diferente a la de la DB
                              const masterCell = masterDataRows[ri] ? masterDataRows[ri][ci] : null;
                              const isCellDiff = masterCell !== null && cell !== masterCell;

                              return (
                                <td key={ci} className={`p-3 border-r border-[#F3F2F1] last:border-0 ${isCellDiff ? 'bg-orange-50/30' : ''}`}>
                                  {isCellDiff ? (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-red-500 line-through opacity-70 font-medium">
                                        {masterCell || '(vacío)'}
                                      </span>
                                      <div className="flex items-center gap-1 text-[#237B4B] font-bold">
                                        <FiArrowRight size={10} />
                                        <span>{cell}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-[#616161]">{cell}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {matchStatus === 'mismatch' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-[11px] font-bold flex items-center gap-2">
                      <FiAlertTriangle className="animate-pulse" /> 
                      AUDITORÍA ACTIVA: Se muestran {diffCount} filas con cambios detectados en valores específicos.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex justify-end gap-3">
               <button onClick={() => { setData([]); setMatchStatus(null); setFileName(""); setMasterDataRows([]); }} className="px-6 py-2 border rounded-lg text-[12px] font-bold text-gray-500 hover:bg-gray-50 transition-all">
                  RESETEAR
               </button>
               <button 
                onClick={handleAnalyze}
                disabled={data.length === 0 || isAnalyzing}
                className={`px-8 py-2 rounded-lg text-[12px] font-black shadow-lg flex items-center gap-2 ${data.length > 0 ? 'bg-[#464775] text-white hover:opacity-90' : 'bg-gray-100 text-gray-400'}`}
               >
                 {isAnalyzing ? "COMPARANDO..." : "EJECUTAR AUDITORÍA"} <FiZap />
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Step = ({ icon, title, desc, active }) => (
  <div className={`flex items-start gap-4 transition-opacity ${!active && 'opacity-30'}`}>
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] border-2 ${active ? 'bg-[#464775] border-[#464775] text-white' : 'bg-white border-[#EDEBE9] text-gray-300'}`}>
      {icon}
    </div>
    <div>
      <h4 className="text-[12px] font-bold">{title}</h4>
      <p className="text-[10px] text-[#616161]">{desc}</p>
    </div>
  </div>
);

export default SVXCopilotEnterprise;