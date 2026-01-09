import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, 
  FiCheck, 
  FiZap, 
  FiShield, 
  FiCpu,
  FiX,
  FiFileText,
  FiSearch
} from 'react-icons/fi';
import { 
  BsFileEarmarkArrowUp
} from 'react-icons/bs';

// Importamos el cliente de supabase
import { supabase } from '../../../lib/supabaseClient';

const SVXCopilotEnterprise = () => {
  const [data, setData] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null); // 'match', 'mismatch', 'error'

  const fadeIn = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const processCSV = (text) => {
    const lines = text.split(/\r?\n/);
    const matrix = lines
      .filter(line => line.trim() !== "")
      .map(line => line.split(','));
    setData(matrix);
    setMatchStatus(null);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith('.csv'))) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        processCSV(event.target.result);
      };
      reader.readAsText(file);
    } else {
      alert("Por favor, sube un archivo CSV válido.");
    }
  }, []);

  const handleReset = () => {
    setData([]);
    setFileName("");
    setMatchStatus(null);
  };

  // NUEVA FUNCIÓN DE ANÁLISIS Y COMPARACIÓN
  const handleAnalyze = async () => {
    if (data.length === 0) return;
    
    setIsAnalyzing(true);
    setMatchStatus(null);

    try {
      // 1. Convertimos la matriz actual de vuelta a string CSV para comparar exactamente el contenido
      const currentCsvString = data.map(row => row.join(',')).join('\n');

      // 2. Consultamos la base de datos (Buscamos por el nombre del archivo para encontrar la fila correcta)
      const { data: dbData, error } = await supabase
        .from('ClientsSERVEX')
        .select('csvpdf_raw')
        .eq('file_name', fileName)
        .single();

      if (error) throw error;

      if (dbData && dbData.csvpdf_raw) {
        // 3. Comparación binaria de los strings (limpiando espacios por si acaso)
        const normalize = (str) => str.replace(/\s/g, '');
        
        if (normalize(currentCsvString) === normalize(dbData.csvpdf_raw)) {
          setMatchStatus('match');
          alert("✅ Verificación Exitosa: El archivo coincide al 100% con el registro maestro.");
        } else {
          setMatchStatus('mismatch');
          alert("⚠️ Discrepancia Detectada: Los datos del archivo no coinciden con la base de datos.");
        }
      } else {
        alert("No se encontró un registro previo para este archivo en la base de datos.");
      }
    } catch (err) {
      console.error("Error en auditoría:", err);
      setMatchStatus('error');
      alert("Error al conectar con la base de datos maestro.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4 md:p-8 font-sans text-[#242424]">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-7xl space-y-6"
      >

        {/* TOP BRANDING & MISSION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-[#FAF9F8] border border-[#EDEBE9] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white border border-[#EDEBE9] rounded-lg flex items-center justify-center shadow-sm">
              <FiCpu className="text-[#464775] text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#464775] text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                  Enterprise AI
                </span>
                <h1 className="text-xl font-extrabold tracking-tight text-[#242424]">
                  SVX Copilot <span className="font-normal text-[#616161]">| Delta Intelligence</span>
                </h1>
              </div>
              <p className="text-[#616161] text-[13px] max-w-2xl leading-relaxed">
                Nuestra tecnología de <strong>Neural Matching 1:1</strong> elimina el error humano y revoluciona la gestión de datos.
                Transformamos semanas de trabajo manual en segundos de procesamiento inteligente.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end border-l border-[#EDEBE9] pl-5">
            <span className="text-[9px] font-bold text-[#616161] uppercase mb-1">Impacto Operativo</span>
            <div className="flex items-center gap-2 text-[#237B4B]">
              <FiZap size={14} />
              <span className="text-2xl font-black">{matchStatus === 'match' ? "100%" : "-99.2%"}</span>
            </div>
            <p className="text-[10px] font-medium text-[#616161]">
              {matchStatus === 'match' ? "Sincronización Validada" : "Reducción en tiempo de auditoría"}
            </p>
          </div>
        </header>

        {/* WORKFLOW & UPLOAD INTERFACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT PANEL */}
          <div className="lg:col-span-4 bg-white border border-[#EDEBE9] rounded-xl p-6 flex flex-col">
            <div className="mb-6">
              <h4 className="text-[11px] font-black text-[#464775] uppercase tracking-[1.5px] mb-1">
                Protocolo Copilot
              </h4>
              <p className="text-[12px] text-[#616161]">
                Estándar de sincronización de datos Servex.
              </p>
            </div>

            <div className="space-y-6 relative">
              <div className="absolute left-[10px] top-2 bottom-2 w-px bg-[#EDEBE9]" />

              <div className="flex items-start relative z-10">
                <div className={`w-5 h-5 ${data.length > 0 ? 'bg-[#237B4B]' : 'bg-[#464775]'} rounded-full flex items-center justify-center text-white text-[9px] shadow-md border-2 border-white transition-colors`}>
                  <FiCheck strokeWidth={3} />
                </div>
                <div className="ml-4">
                  <h3 className="text-[13px] font-bold">Ingesta Masiva</h3>
                  <p className="text-[10px] text-[#616161] mt-0.5">
                    {data.length > 0 ? `${data.length} filas detectadas.` : '+10,000 SKU sin latencia.'}
                  </p>
                </div>
              </div>

              <div className={`flex items-start relative z-10 ${data.length === 0 ? 'opacity-40' : ''}`}>
                <div className={`w-5 h-5 bg-white border-2 ${matchStatus ? 'border-[#237B4B] text-[#237B4B]' : data.length > 0 ? 'border-[#464775] text-[#464775]' : 'border-[#EDEBE9] text-[#616161]'} rounded-full flex items-center justify-center text-[9px] font-black shadow-sm`}>
                  {matchStatus === 'match' ? <FiCheck /> : '2'}
                </div>
                <div className="ml-4">
                  <h3 className="text-[13px] font-bold">Mapeo Binario 1:1</h3>
                  <p className="text-[10px] text-[#616161] mt-0.5">
                    {matchStatus === 'match' ? "Identidad confirmada con DB." : "Comparación contra sistema maestro."}
                  </p>
                </div>
              </div>

              <div className={`flex items-start relative z-10 ${!matchStatus ? 'opacity-40' : ''}`}>
                <div className={`w-5 h-5 bg-white border-2 ${matchStatus === 'mismatch' ? 'border-red-500 text-red-500' : 'border-[#EDEBE9] text-[#616161]'} rounded-full flex items-center justify-center text-[9px] font-black`}>
                  3
                </div>
                <div className="ml-4">
                  <h3 className="text-[13px] font-bold">Reporte de Variaciones</h3>
                  <p className="text-[10px] text-[#616161] mt-0.5">
                    Extracción visual de discrepancias.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <div className="bg-[#FAF9F8] p-3 rounded-lg border border-dashed border-[#EDEBE9]">
                <p className="text-[10px] text-[#242424] italic leading-relaxed">
                  “Los analistas se enfocan en estrategia, no en copiar datos.”
                </p>
                <p className="text-[9px] text-[#616161] mt-2 font-bold">
                  — Servex US Engineering
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - MAIN CONSOLE */}
          <div className="lg:col-span-8 bg-white border border-[#EDEBE9] rounded-xl p-8 shadow-sm flex flex-col min-h-[500px]">
            <div className="flex justify-between items-start mb-8">
              <div className="max-w-md">
                <h2 className="text-xl font-black tracking-tight">
                  Consola de Comparación
                </h2>
                <p className="text-[13px] text-[#616161] mt-1">
                  {data.length > 0 
                    ? `Visualizando: ${fileName}` 
                    : "Cargue el catálogo del cliente para iniciar el análisis profundo."}
                </p>
              </div>
              <BsFileEarmarkArrowUp size={32} className={data.length > 0 ? "text-[#464775]" : "text-[#EDEBE9]"} />
            </div>

            <AnimatePresence mode="wait">
              {data.length === 0 ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex-grow border-2 border-dashed rounded-xl p-14 flex flex-col items-center justify-center transition-all cursor-pointer mb-8 ${
                    isDragging 
                    ? "border-[#464775] bg-[#F3F2F1] scale-[1.01]" 
                    : "border-[#EDEBE9] bg-[#FAF9F8] hover:bg-white hover:border-[#464775]"
                  }`}
                >
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md mb-4 text-[#464775]">
                    <FiUploadCloud size={28} />
                  </div>
                  <p className="text-[15px] font-black">
                    Arrastra el archivo del cliente aquí
                  </p>
                  <p className="text-[11px] text-[#616161] mt-2 font-medium">
                    Soporta formato CSV (Separado por comas)
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex-grow overflow-hidden border rounded-xl mb-8 flex flex-col ${matchStatus === 'match' ? 'border-[#237B4B]' : 'border-[#EDEBE9]'}`}
                >
                  <div className="overflow-auto max-h-[400px] relative">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-[#FAF9F8] z-10 shadow-sm">
                        <tr>
                          {data[0].map((header, i) => (
                            <th key={i} className="p-3 text-[10px] font-black uppercase tracking-wider text-[#464775] border-b border-[#EDEBE9]">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDEBE9]">
                        {data.slice(1).map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-[#FAF9F8] transition-colors">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="p-3 text-[11px] text-[#616161] whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={`p-3 border-t text-center text-[10px] font-medium ${matchStatus === 'match' ? 'bg-[#E7F3ED] text-[#237B4B]' : 'bg-[#FAF9F8] text-[#616161]'}`}>
                    {matchStatus === 'match' 
                      ? "INTEGRIDAD CONFIRMADA: Datos idénticos a la base de datos." 
                      : `Mostrando el total de ${data.length - 1} registros detectados.`}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end gap-3 mt-auto">
              <button 
                onClick={handleReset}
                disabled={isAnalyzing}
                className="px-6 py-2 border border-[#D1D1D1] rounded-lg text-[12px] font-bold text-[#616161] hover:bg-[#F5F5F5] transition-all uppercase tracking-wider flex items-center gap-2"
              >
                {data.length > 0 && <FiX />} Descartar
              </button>
              <button 
                onClick={handleAnalyze}
                disabled={data.length === 0 || isAnalyzing}
                className={`px-7 py-2 rounded-lg text-[12px] font-black shadow-md flex items-center gap-2 transition-all active:scale-95 uppercase tracking-wider ${
                  data.length > 0 
                  ? "bg-[#464775] text-white hover:bg-[#38395d]" 
                  : "bg-[#EDEBE9] text-[#A19F9D] cursor-not-allowed"
                }`}
              >
                {isAnalyzing ? "Analizando..." : "Iniciar Auditoría"} 
                {isAnalyzing ? <FiSearch className="animate-spin" /> : <FiZap size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="pt-6 border-t border-[#EDEBE9] flex justify-between items-center">
          <p className="text-[9px] text-[#616161] font-medium">
            <strong>Servex US Engineering</strong> © 2026 | SVX Copilot Enterprise
          </p>
          <div className="flex items-center gap-1 text-[9px] font-bold text-[#237B4B]">
            <FiShield size={12} /> DATA ENCRYPTED
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

export default SVXCopilotEnterprise;