'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';
import { supabase, getCurrentUser } from '@/app/lib/supabaseClient';
import { 
  FiUploadCloud, FiCheck, FiZap, FiShield, 
  FiCpu, FiAlertCircle, FiPlus, FiTrash2, FiRefreshCw, FiDatabase
} from 'react-icons/fi';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';

const SVXCopilotEnterprise = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [dbContent, setDbContent] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState('checking'); // checking, found, empty

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        fetchMasterData(currentUser.id);
      } else {
        setDbStatus('empty');
        setError("No se detectó sesión de usuario activa.");
      }
    };
    initAuth();
  }, []);

  const fetchMasterData = async (userId) => {
    try {
      console.log("🔍 Buscando catálogo maestro para UID:", userId);
      const { data, error } = await supabase
        .from('ClientsSERVEX')
        .select('csv_raw')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.warn("⚠️ Error o registro no encontrado:", error.message);
        setDbStatus('empty');
        return;
      }

      if (data && data.csv_raw) {
        console.log("✅ Datos maestros recuperados exitosamente.");
        setDbContent(data.csv_raw);
        setDbStatus('found');
      } else {
        setDbStatus('empty');
      }
    } catch (err) {
      console.error("❌ Error fatal fetchMasterData:", err);
      setDbStatus('empty');
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError(null);
    }
  };

  // Función para limpiar el CSV de Lesro (quitar las primeras 2 líneas de texto)
  const cleanCSV = (rawText) => {
    const lines = rawText.split('\n');
    // Buscamos la línea que contiene "ID" que es el encabezado real
    const headerIndex = lines.findIndex(line => line.includes('ID;Price Guide'));
    if (headerIndex === -1) return rawText; // Si no lo encuentra, devuelve original
    return lines.slice(headerIndex).join('\n');
  };

  const runAudit = async () => {
    if (!file) {
      setError("Por favor, selecciona un archivo CSV primero.");
      return;
    }
    if (!dbContent) {
      setError("No hay datos maestros en la base de datos para este usuario. Sube un archivo a la tabla 'ClientsSERVEX' primero.");
      return;
    }

    setIsAnalyzing(true);
    
    // Configuración de PapaParse para archivos con ";"
    const parseConfig = {
      header: true,
      skipEmptyLines: true,
      delimiter: ";",
      transformHeader: (h) => h.trim()
    };

    // Leer archivo subido
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = cleanCSV(e.target.result);
      Papa.parse(text, {
        ...parseConfig,
        complete: (fileRes) => {
          // Parsear contenido de DB
          const dbText = cleanCSV(dbContent);
          Papa.parse(dbText, {
            ...parseConfig,
            complete: (dbRes) => {
              compareData(fileRes.data, dbRes.data);
            }
          });
        }
      });
    };
    reader.readAsText(file);
  };

  const compareData = (newData, oldData) => {
    // La llave primaria es "ID" (SKU)
    const primaryKey = "ID";
    
    const oldMap = new Map(oldData.map(item => [item[primaryKey], item]));
    const newMap = new Map(newData.map(item => [item[primaryKey], item]));

    const delta = {
      added: [],
      removed: [],
      modified: [],
      unchanged: [],
    };

    newData.forEach(newItem => {
      const id = newItem[primaryKey];
      if (!id) return;

      const oldItem = oldMap.get(id);

      if (!oldItem) {
        delta.added.push(newItem);
      } else {
        // Comparación profunda de valores
        const isDifferent = JSON.stringify(newItem) !== JSON.stringify(oldItem);
        if (isDifferent) {
          delta.modified.push({ id, before: oldItem, after: newItem });
        } else {
          delta.unchanged.push(newItem);
        }
      }
    });

    oldData.forEach(oldItem => {
      if (oldItem[primaryKey] && !newMap.has(oldItem[primaryKey])) {
        delta.removed.push(oldItem);
      }
    });

    setResults(delta);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white p-4 md:p-8 font-sans text-[#242424]">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} className="w-full max-w-7xl space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-[#FAF9F8] border border-[#EDEBE9] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white border border-[#EDEBE9] rounded-lg flex items-center justify-center shadow-sm">
              <FiCpu className={`${isAnalyzing ? 'animate-spin' : ''} text-[#464775] text-2xl`} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">SVX Copilot <span className="font-normal text-[#616161]">| Delta Intelligence</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <FiDatabase className={dbStatus === 'found' ? 'text-green-500' : 'text-amber-500'} />
                <span className="text-[11px] font-bold uppercase">
                  {dbStatus === 'found' ? 'Base de Datos Conectada' : 'Sin Catálogo Maestro'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
             <span className="text-[10px] text-[#616161]">USUARIO</span>
             <p className="text-xs font-bold">{user?.email || 'No identificado'}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* IZQUIERDA: RESUMEN */}
          <div className="lg:col-span-4 bg-white border border-[#EDEBE9] rounded-xl p-6">
            <h4 className="text-[11px] font-black text-[#464775] uppercase tracking-wider mb-6">Protocolo de Auditoría</h4>
            <div className="space-y-4">
              <Step active={!!file} label="1. Carga de Nuevo Catálogo" />
              <Step active={dbStatus === 'found'} label="2. Vínculo con Maestro (Supabase)" />
              <Step active={!!results} label="3. Análisis de Discrepancias" />
            </div>

            {results && (
              <div className="mt-8 grid grid-cols-2 gap-3">
                <StatCard label="Nuevos" val={results.added.length} color="bg-green-100 text-green-700" />
                <StatCard label="Cambios" val={results.modified.length} color="bg-blue-100 text-blue-700" />
                <StatCard label="Eliminados" val={results.removed.length} color="bg-red-100 text-red-700" />
                <StatCard label="Sin cambios" val={results.unchanged.length} color="bg-gray-100 text-gray-700" />
              </div>
            )}
          </div>

          {/* DERECHA: ACCIÓN */}
          <div className="lg:col-span-8 bg-white border border-[#EDEBE9] rounded-xl p-8 shadow-sm">
            {!results ? (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-black italic">Consola de Ingesta Delta</h2>
                  <p className="text-xs text-[#616161]">Sube el archivo modificado para compararlo contra el almacenamiento oficial.</p>
                </div>

                <label className="border-2 border-dashed border-[#EDEBE9] rounded-xl p-16 flex flex-col items-center bg-[#FAF9F8] hover:border-[#464775] transition-all cursor-pointer mb-6">
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                  <FiUploadCloud size={40} className="mb-4 text-[#464775]" />
                  <span className="font-bold text-sm">{file ? file.name : "Seleccionar CSV de Cliente"}</span>
                </label>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 text-[11px] rounded flex items-center gap-2">
                    <FiAlertCircle /> {error}
                  </div>
                )}

                <div className="flex justify-end">
                  <button 
                    onClick={runAudit}
                    disabled={isAnalyzing || !file || dbStatus !== 'found'}
                    className="px-8 py-3 bg-[#464775] text-white rounded-lg text-xs font-black hover:bg-[#38395d] disabled:opacity-30 flex items-center gap-2"
                  >
                    {isAnalyzing ? <FiRefreshCw className="animate-spin" /> : <FiZap />}
                    EJECUTAR COMPARACIÓN 1:1
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <h3 className="font-bold">Resultados del Análisis</h3>
                  <button onClick={() => setResults(null)} className="text-[10px] underline uppercase">Subir otro</button>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {results.modified.map((item, i) => (
                    <div key={i} className="p-3 bg-blue-50 border border-blue-100 rounded text-[11px] flex justify-between">
                      <div>
                        <span className="font-black">ID: {item.id}</span>
                        <p className="text-[#616161]">Se detectó cambio en atributos de precio/descripción.</p>
                      </div>
                      <span className="text-blue-600 font-bold uppercase">Modificado</span>
                    </div>
                  ))}
                  {results.added.map((item, i) => (
                    <div key={i} className="p-3 bg-green-50 border border-green-100 rounded text-[11px] flex justify-between">
                      <span className="font-black">ID: {item.ID}</span>
                      <span className="text-green-600 font-bold uppercase">Nuevo SKU</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Step = ({ active, label }) => (
  <div className={`flex items-center gap-3 ${active ? 'opacity-100' : 'opacity-30'}`}>
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${active ? 'bg-[#464775] text-white' : 'bg-gray-200'}`}>
      {active ? <FiCheck /> : '•'}
    </div>
    <span className="text-xs font-medium">{label}</span>
  </div>
);

const StatCard = ({ label, val, color }) => (
  <div className={`${color} p-3 rounded-lg`}>
    <p className="text-[9px] uppercase font-black opacity-70">{label}</p>
    <p className="text-lg font-black">{val}</p>
  </div>
);

export default SVXCopilotEnterprise;