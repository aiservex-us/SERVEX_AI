'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { supabase, getCurrentUser } from '@/app/lib/supabaseClient';
import { 
  FiUploadCloud, FiCheck, FiZap, FiShield, 
  FiCpu, FiAlertCircle, FiPlus, FiTrash2, FiRefreshCw 
} from 'react-icons/fi';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';

const SVXCopilotEnterprise = () => {
  // Estados de carga y datos
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [dbContent, setDbContent] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) fetchMasterData(currentUser.id);
    };
    initAuth();
  }, []);

  // 1. Obtener el CSV maestro de Supabase
  const fetchMasterData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('ClientsSERVEX')
        .select('csv_raw')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setDbContent(data.csv_raw);
    } catch (err) {
      console.error("Error fetching DB data:", err);
      setError("No se pudo cargar el catálogo maestro de la base de datos.");
    }
  };

  // 2. Procesar el archivo subido
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError(null);
    }
  };

  // 3. Lógica de Neural Matching 1:1 (Comparación Delta)
  const runAudit = async () => {
    if (!file || !dbContent) {
      setError("Se requiere un archivo subido y datos en la BD para comparar.");
      return;
    }

    setIsAnalyzing(true);
    
    // Parsear el archivo local
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (fileRes) => {
        // Parsear el contenido de la BD
        Papa.parse(dbContent, {
          header: true,
          skipEmptyLines: true,
          complete: (dbRes) => {
            compareData(fileRes.data, dbRes.data);
          }
        });
      }
    });
  };

  const compareData = (newData, oldData) => {
    // Usamos la primera columna como ID (SKU/Código)
    const primaryKey = Object.keys(newData[0])[0];
    
    const oldMap = new Map(oldData.map(item => [item[primaryKey], item]));
    const newMap = new Map(newData.map(item => [item[primaryKey], item]));

    const delta = {
      added: [],
      removed: [],
      modified: [],
      unchanged: [],
      summary: { total: newData.length }
    };

    // Identificar Nuevos y Modificados
    newData.forEach(newItem => {
      const id = newItem[primaryKey];
      const oldItem = oldMap.get(id);

      if (!oldItem) {
        delta.added.push(newItem);
      } else if (JSON.stringify(newItem) !== JSON.stringify(oldItem)) {
        delta.modified.push({ id, before: oldItem, after: newItem });
      } else {
        delta.unchanged.push(newItem);
      }
    });

    // Identificar Eliminados
    oldData.forEach(oldItem => {
      if (!newMap.has(oldItem[primaryKey])) {
        delta.removed.push(oldItem);
      }
    });

    setResults(delta);
    setIsAnalyzing(false);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4 md:p-8 font-sans text-[#242424]">
      <motion.div initial="hidden" animate="visible" variants={fadeIn} className="w-full max-w-7xl space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-[#FAF9F8] border border-[#EDEBE9] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white border border-[#EDEBE9] rounded-lg flex items-center justify-center shadow-sm">
              <FiCpu className={`${isAnalyzing ? 'animate-spin' : ''} text-[#464775] text-2xl`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#464775] text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">Enterprise AI</span>
                <h1 className="text-xl font-extrabold tracking-tight">SVX Copilot <span className="font-normal text-[#616161]">| Delta Intelligence</span></h1>
              </div>
              <p className="text-[#616161] text-[13px]">Usuario: <span className="font-bold text-[#464775]">{user?.email || 'Verificando...'}</span></p>
            </div>
          </div>
          <div className="flex flex-col items-end border-l border-[#EDEBE9] pl-5">
            <span className="text-[9px] font-bold text-[#616161] uppercase mb-1">Impacto Operativo</span>
            <div className="flex items-center gap-2 text-[#237B4B]">
              <FiZap size={14} />
              <span className="text-2xl font-black">{results ? '-99.9%' : '0.0%'}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SIDEBAR PROTOCOLO */}
          <div className="lg:col-span-4 bg-white border border-[#EDEBE9] rounded-xl p-6 flex flex-col">
            <h4 className="text-[11px] font-black text-[#464775] uppercase tracking-[1.5px] mb-6">Protocolo Copilot</h4>
            
            <div className="space-y-8 relative">
              <div className="absolute left-[10px] top-2 bottom-2 w-px bg-[#EDEBE9]" />
              
              <Step icon={<FiCheck />} title="Ingesta" active={!!file} subtitle="Archivo listo para análisis" />
              <Step icon="2" title="Neural Matching" active={isAnalyzing || results} subtitle="Mapeo contra csv_raw" />
              <Step icon="3" title="Delta Report" active={!!results} subtitle="Extracción de discrepancias" />
            </div>

            {results && (
              <div className="mt-8 p-4 bg-[#F3F2F1] rounded-lg space-y-3">
                <h5 className="text-[10px] font-black uppercase text-[#616161]">Resumen de Cambios</h5>
                <div className="grid grid-cols-2 gap-2">
                  <Stat label="Nuevos" value={results.added.length} color="text-green-600" />
                  <Stat label="Cambios" value={results.modified.length} color="text-blue-600" />
                  <Stat label="Eliminados" value={results.removed.length} color="text-red-600" />
                  <Stat label="Iguales" value={results.unchanged.length} color="text-gray-600" />
                </div>
              </div>
            )}
          </div>

          {/* CONSOLA PRINCIPAL */}
          <div className="lg:col-span-8 bg-white border border-[#EDEBE9] rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-black tracking-tight">Consola de Comparación</h2>
                <p className="text-[13px] text-[#616161] mt-1">Comparando archivo local vs instancia Supabase.</p>
              </div>
              <BsFileEarmarkArrowUp size={32} className={file ? "text-[#464775]" : "text-[#EDEBE9]"} />
            </div>

            {!results ? (
              <>
                <label className="border-2 border-dashed border-[#EDEBE9] rounded-xl p-14 flex flex-col items-center bg-[#FAF9F8] hover:bg-white hover:border-[#464775] transition-all cursor-pointer mb-8 group">
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md mb-4 text-[#464775] group-hover:scale-110 transition-transform">
                    <FiUploadCloud size={28} />
                  </div>
                  <p className="text-[15px] font-black">{file ? file.name : 'Selecciona el catálogo nuevo'}</p>
                  <p className="text-[11px] text-[#616161] mt-2 font-medium">CSV Maestro de Clientes</p>
                </label>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs flex items-center gap-2">
                    <FiAlertCircle /> {error}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button onClick={() => setFile(null)} className="px-6 py-2 border border-[#D1D1D1] rounded-lg text-[12px] font-bold text-[#616161] hover:bg-[#F5F5F5] uppercase">
                    Limpiar
                  </button>
                  <button 
                    onClick={runAudit}
                    disabled={isAnalyzing || !file}
                    className="px-7 py-2 bg-[#464775] text-white rounded-lg text-[12px] font-black hover:bg-[#38395d] disabled:opacity-50 shadow-md flex items-center gap-2 uppercase"
                  >
                    {isAnalyzing ? <FiRefreshCw className="animate-spin" /> : <FiZap />} 
                    {isAnalyzing ? 'Procesando...' : 'Iniciar Auditoría Delta'}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-[#464775]">Análisis de Discrepancias Finalizado</h3>
                  <button onClick={() => setResults(null)} className="text-[10px] font-bold underline">Cargar otro archivo</button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                  {results.added.map((item, i) => (
                    <DeltaRow key={i} type="added" data={item} icon={<FiPlus />} />
                  ))}
                  {results.modified.map((item, i) => (
                    <DeltaRow key={i} type="modified" data={item.after} icon={<FiRefreshCw />} />
                  ))}
                  {results.removed.map((item, i) => (
                    <DeltaRow key={i} type="removed" data={item} icon={<FiTrash2 />} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="pt-6 border-t border-[#EDEBE9] flex justify-between items-center">
          <p className="text-[9px] text-[#616161] font-medium"><strong>Servex US Engineering</strong> © 2026</p>
          <div className="flex items-center gap-1 text-[9px] font-bold text-[#237B4B]"><FiShield size={12} /> SECURE DB LINKED</div>
        </footer>
      </motion.div>
    </div>
  );
};

// Componentes Auxiliares UI
const Step = ({ icon, title, active, subtitle }) => (
  <div className={`flex items-start relative z-10 transition-opacity ${active ? 'opacity-100' : 'opacity-40'}`}>
    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] shadow-sm border-2 ${active ? 'bg-[#464775] text-white border-white' : 'bg-white border-[#EDEBE9] text-[#616161]'}`}>
      {icon}
    </div>
    <div className="ml-4">
      <h3 className="text-[13px] font-bold">{title}</h3>
      <p className="text-[10px] text-[#616161] mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const Stat = ({ label, value, color }) => (
  <div className="bg-white p-2 rounded border border-[#EDEBE9]">
    <p className="text-[8px] uppercase font-bold text-[#616161]">{label}</p>
    <p className={`text-sm font-black ${color}`}>{value}</p>
  </div>
);

const DeltaRow = ({ type, data, icon }) => {
  const styles = {
    added: "bg-green-50 border-green-200 text-green-700",
    modified: "bg-blue-50 border-blue-200 text-blue-700",
    removed: "bg-red-50 border-red-200 text-red-700 opacity-70",
  };

  return (
    <div className={`p-3 border rounded-lg flex items-center justify-between text-[11px] ${styles[type]}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <span className="font-bold uppercase">{Object.values(data)[0]}</span>
          <span className="ml-2 opacity-80">{Object.values(data)[1]}</span>
        </div>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest">{type}</span>
    </div>
  );
};

export default SVXCopilotEnterprise;