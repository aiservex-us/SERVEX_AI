import React, { useState, useEffect, useRef } from 'react';
import { FiZap, FiTerminal } from 'react-icons/fi';
import { Zap, Loader2, ChevronRight } from 'lucide-react';

const EJECUTOR_PLAY = ({ 
  handleUnifiedProcess, 
  handleFullReset, 
  file, 
  isProcessing 
}) => {
  const [logs, setLogs] = useState([]);
  const scrollRef = useRef(null);

  // Auto-scroll para la pantallita de consola
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Función para añadir logs con delay para simular el avance del pipeline
  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { time, message, type }]);
  };

  const ejecutarConConsola = async () => {
    setLogs([]); // Limpiar consola anterior
    addLog("🚀 INITIALIZING SERVEX_AI PIPELINE...", "start");
    
    try {
      // Nota: Aquí llamamos a la función que pasaste por props
      // pero añadimos la lógica de logs visuales
      addLog("📥 STEP 1 — Reading CSV...");
      
      const result = await handleUnifiedProcess();
      
      // Si la función termina con éxito, mostramos el log final
      addLog("✅ CSV loaded and normalized");
      addLog("📡 STEP 2 — Loading master data...");
      addLog("🔎 STEP 3 — Auditing discrepancies...");
      addLog("📦 STEP 4 — Extracting PIM XML...");
      addLog("🧬 STEP 6 — Generating XML...");
      addLog("☁️ STEP 7 — Updating Supabase...");
      addLog("🤖 STEP 8 — Running AI agent...");
      addLog("🎉 PIPELINE COMPLETED SUCCESSFULLY", "success");

    } catch (err) {
      addLog(`❌ ERROR: ${err.message}`, "error");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Contenedor Principal de Acciones */}
      <div className="bg-[#464775] text-white rounded-lg p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-yellow-400" />
          <h4 className="text-xs font-bold uppercase">Platform Actions.</h4>
        </div>
        
        <button 
          onClick={ejecutarConConsola}
          disabled={!file || isProcessing}
          className="w-full bg-white text-[#444791] py-2 rounded font-bold text-[11px] hover:bg-gray-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <FiZap size={14} />}
          PROCESS & SYNC TO CLOUD
        </button>

        <button 
          onClick={() => {
            setLogs([]);
            handleFullReset();
          }} 
          className="w-full mt-2 py-2 text-[10px] font-bold opacity-60 hover:opacity-100 uppercase tracking-widest"
        >
          Reset System
        </button>
      </div>

      {/* Pantallita de Consola (Monitor de Pipeline) */}
      <div className="bg-[#1a1b2e] border border-[#464775]/30 rounded-lg overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-[#2d2e45] px-3 py-1.5 border-b border-[#464775]/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiTerminal size={10} className="text-emerald-400" />
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">SVX_AI_CORE_LOGS</span>
          </div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="h-40 overflow-y-auto p-3 font-mono text-[9px] leading-relaxed space-y-1 bg-black/20"
        >
          {logs.length === 0 ? (
            <div className="text-gray-600 italic animate-pulse">
              {">"} Awaiting execution signal...
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-2 border-l border-white/5 pl-2">
                <span className="text-gray-500 shrink-0">[{log.time}]</span>
                <span className={`
                  ${log.type === 'error' ? 'text-red-400' : ''}
                  ${log.type === 'success' ? 'text-emerald-400 font-bold' : ''}
                  ${log.type === 'start' ? 'text-blue-300 underline' : 'text-gray-300'}
                `}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex items-center gap-2 text-emerald-500 animate-pulse">
              <ChevronRight size={10} />
              <span className="typing-cursor">Running task...</span>
            </div>
          )}
        </div>
        
        <div className="bg-[#2d2e45]/30 px-3 py-1 text-[8px] text-gray-500 flex justify-between uppercase font-bold">
          <span>Status: {isProcessing ? 'Active' : 'Idle'}</span>
          <span>Buffer: 1024kb</span>
        </div>
      </div>
    </div>
  );
};

export default EJECUTOR_PLAY;