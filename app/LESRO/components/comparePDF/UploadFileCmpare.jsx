import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, 
  FiCheck, 
  FiZap, 
  FiShield, 
  FiCpu,
  FiX,
  FiSearch
} from 'react-icons/fi';
import { 
  BsFileEarmarkArrowUp
} from 'react-icons/bs';

// Importamos el cliente de supabase
import { supabase } from '../../../lib/supabaseClient';

const SVXCopilotEnterprise = () => {
  const [data, setData] = useState([]); // Matriz de datos [ [fila1], [fila2] ]
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

  // Función para procesar el CSV detectando el delimitador y limpiando datos
  const processCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return;

    // Detectamos si usa ';' o ',' basándonos en la línea de cabecera (típicamente la 3 en tu archivo)
    const sampleLine = lines[2] || lines[0];
    const delimiter = sampleLine.includes(';') ? ';' : ',';

    const matrix = lines.map(line => 
      line.split(delimiter).map(cell => cell.trim())
    );

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

  // FUNCIÓN DE AUDITORÍA: Solo muestra filas con diferencias
  const handleAnalyze = async () => {
    if (data.length === 0) return;
    
    setIsAnalyzing(true);
    setMatchStatus(null);

    try {
      // 1. Consultamos el registro maestro en Supabase
      const { data: dbData, error } = await supabase
        .from('ClientsSERVEX')
        .select('csvpdf_raw')
        .eq('file_name', fileName)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
            throw new Error("No se encontró el archivo maestro en la base de datos.");
        }
        throw error;
      }

      if (dbData && dbData.csvpdf_raw) {
        // 2. Procesamos el CSV maestro de la DB
        const dbLines = dbData.csvpdf_raw.split(/\r?\n/).filter(l => l.trim() !== "");
        const dbDelimiter = dbLines[2]?.includes(';') ? ';' : ',';
        const dbMatrix = dbLines.map(line => line.split(dbDelimiter).map(c => c.trim()));

        // 3. Identificamos la fila de cabecera real (en tu caso la fila index 2: ID;Price...)
        // Si el archivo no tiene las 2 filas de texto arriba, usa 0.
        const headerIndex = data.findIndex(row => row.includes('ID') || row.includes('Product Name'));
        const header = data[headerIndex] || data[0];

        // 4. Comparamos filas de datos (después de la cabecera)
        const rowsToCompare = data.slice(headerIndex + 1);
        const masterRows = dbMatrix.slice(headerIndex + 1);

        const discrepancies = rowsToCompare.filter((row, idx) => {
          const mRow = masterRows[idx];
          if (!mRow) return true; // Fila nueva que no está en DB
          
          // Comparamos el contenido de la fila
          return JSON.stringify(row) !== JSON.stringify(mRow);
        });

        if (discrepancies.length === 0) {
          setMatchStatus('match');
          alert("✅ Verificación Exitosa: Los datos coinciden al 100% con el maestro.");
        } else {
          setMatchStatus('mismatch');
          // ACTUALIZACIÓN CLAVE: Seteamos 'data' solo con el header y las filas con errores
          setData([header, ...discrepancies]);
          alert(`⚠️ Discrepancia: Se detectaron ${discrepancies.length} filas con datos diferentes.`);
        }
      }
    } catch (err) {
      console.error("Error en auditoría:", err.message);
      setMatchStatus('error');
      alert(err.message || "Error al conectar con la base de datos maestro.");
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
        {/* HEADER */}
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
                Tecnología de <strong>Neural Matching</strong> para auditoría de precios y SKU.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end border-l border-[#EDEBE9] pl-5">
            <span className="text-[9px] font-bold text-[#616161] uppercase mb-1">Resultado de Auditoría</span>
            <div className={`flex items-center gap-2 ${matchStatus === 'match' ? 'text-[#237B4B]' : 'text-red-600'}`}>
              <FiZap size={14} />
              <span className="text-2xl font-black">
                {matchStatus === 'match' ? "100%" : matchStatus === 'mismatch' ? "DIFF" : "0.0%"}
              </span>
            </div>
            <p className="text-[10px] font-medium text-[#616161]">
              {matchStatus === 'match' ? "Sincronización Validada" : "Estado del análisis actual"}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PANEL IZQUIERDO: PASOS */}
          <div className="lg:col-span-4 bg-white border border-[#EDEBE9] rounded-xl p-6 flex flex-col">
            <h4 className="text-[11px] font-black text-[#464775] uppercase tracking-[1.5px] mb-6">Protocolo de Control</h4>
            <div className="space-y-6 relative">
              <div className="absolute left-[10px] top-2 bottom-2 w-px bg-[#EDEBE9]" />
              <Step icon={<FiCheck />} label="Ingesta de Datos" sub={data.length > 0 ? `${data.length} filas` : "Esperando archivo..."} active={data.length > 0} />
              <Step icon={matchStatus ? <FiCheck /> : "2"} label="Mapeo contra DB" sub="Comparando con registro maestro" active={matchStatus} />
              <Step icon="3" label="Filtrado de Errores" sub="Mostrando solo diferencias" active={matchStatus === 'mismatch'} />
            </div>
          </div>

          {/* PANEL DERECHO: CONSOLA */}
          <div className="lg:col-span-8 bg-white border border-[#EDEBE9] rounded-xl p-8 shadow-sm flex flex-col min-h-[500px]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black">Consola de Auditoría</h2>
                <p className="text-[13px] text-[#616161]">{fileName || "Seleccione un archivo CSV de precios."}</p>
              </div>
              <BsFileEarmarkArrowUp size={32} className={data.length > 0 ? "text-[#464775]" : "text-[#EDEBE9]"} />
            </div>

            <AnimatePresence mode="wait">
              {data.length === 0 ? (
                <DropZone onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} isDragging={isDragging} />
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex-grow overflow-hidden border rounded-xl mb-6 flex flex-col ${matchStatus === 'match' ? 'border-[#237B4B]' : 'border-[#EDEBE9]'}`}>
                  <div className="overflow-auto max-h-[400px]">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-[#FAF9F8] z-10 shadow-sm">
                        <tr>
                          {data[0].map((header, i) => (
                            <th key={i} className="p-3 text-[10px] font-black uppercase text-[#464775] border-b">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDEBE9]">
                        {data.slice(1).map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-[#FAF9F8] transition-colors">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="p-3 text-[11px] text-[#616161] whitespace-nowrap">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={`p-3 text-center text-[10px] font-bold ${matchStatus === 'match' ? 'bg-[#E7F3ED] text-[#237B4B]' : 'bg-[#FAF9F8]'}`}>
                    {matchStatus === 'mismatch' ? "⚠️ MOSTRANDO SOLO FILAS CON DIFERENCIAS" : `Total registros: ${data.length - 1}`}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end gap-3">
              <button onClick={handleReset} className="px-6 py-2 border rounded-lg text-[12px] font-bold hover:bg-gray-50 uppercase tracking-wider flex items-center gap-2">
                <FiX /> Descartar
              </button>
              <button 
                onClick={handleAnalyze} 
                disabled={data.length === 0 || isAnalyzing}
                className={`px-7 py-2 rounded-lg text-[12px] font-black shadow-md flex items-center gap-2 transition-all uppercase tracking-wider ${data.length > 0 ? "bg-[#464775] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                {isAnalyzing ? "Analizando..." : "Iniciar Auditoría"} 
                {isAnalyzing ? <FiSearch className="animate-spin" /> : <FiZap />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Sub-componentes para limpieza de código
const Step = ({ icon, label, sub, active }) => (
  <div className={`flex items-start relative z-10 ${!active ? 'opacity-40' : ''}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${active ? 'bg-[#464775] text-white border-[#464775]' : 'bg-white text-gray-400 border-gray-200'}`}>
      {icon}
    </div>
    <div className="ml-4">
      <h3 className="text-[13px] font-bold">{label}</h3>
      <p className="text-[10px] text-[#616161]">{sub}</p>
    </div>
  </div>
);

const DropZone = ({ onDragOver, onDragLeave, onDrop, isDragging }) => (
  <motion.div
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    className={`flex-grow border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer mb-6 ${isDragging ? "border-[#464775] bg-[#F3F2F1]" : "border-[#EDEBE9] bg-[#FAF9F8] hover:bg-white"}`}
  >
    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md mb-4 text-[#464775]">
      <FiUploadCloud size={28} />
    </div>
    <p className="text-[15px] font-black">Arrastra el CSV del cliente aquí</p>
    <p className="text-[11px] text-[#616161] mt-2 font-medium">Soporta CSV con "," o ";"</p>
  </motion.div>
);

export default SVXCopilotEnterprise;

// ----------------------------------------------------------------------------
// app/lib/supabaseClient.js (Mantenlo así para que funcione el componente)
// ----------------------------------------------------------------------------
/*
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://mdjalirluzzvanrcjead.supabase.co';
const supabaseAnonKey = 'sb_publishable_I8pdJT2l9dXxMFwf0zEfpw_00Yo3vFC';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/