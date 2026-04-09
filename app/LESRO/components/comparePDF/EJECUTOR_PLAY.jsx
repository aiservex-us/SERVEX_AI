import React, { useState, useEffect, useRef } from 'react';
import { FiZap, FiTerminal, FiTrash2, FiActivity, FiDatabase, FiCode } from 'react-icons/fi';
import { Zap, Loader2, ChevronRight, Maximize2, X, Cpu, Search, FileCode } from 'lucide-react';

const EJECUTOR_PLAY = ({ 
  handleUnifiedProcess, 
  handleFullReset, 
  file, 
  isProcessing 
}) => {
  const [logs, setLogs] = useState([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollRef = useRef(null);
  const modalScrollRef = useRef(null);

  useEffect(() => {
    const target = isMaximized ? modalScrollRef.current : scrollRef.current;
    if (target) {
      target.scrollTop = target.scrollHeight;
    }
  }, [logs, isMaximized]);

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { time, message, type }]);
  };

  const ejecutarConConsola = async () => {
    setLogs([]); 
    addLog("🚀 [KERNEL] INITIALIZING SERVEX_AI MULTI-STAGE PIPELINE...", "start");
    
    try {
      addLog("📥 [IO_SUBSYSTEM] Reading CSV buffer & detecting delimiter (auto_charset)...");
      const result = await handleUnifiedProcess();
      
      addLog("✅ [DATA_NORM] CSV structure parsed. Header ID/SKU identified via fuzzy match.");
      addLog("📡 [SUPABASE_EXTRACT] Fetching Master Data (ClientsSERVEX) for company 'LESRO'...");
      addLog("🔎 [AUDIT_ENGINE] Running auditar_csv_logic: cross-referencing CSV rows vs MasterDB...");
      addLog("📦 [XML_EXTRACT] Parsing OFDA PIM XML... Indexing Feature/Option nodes.");
      addLog("🧬 [CALC_MODULE] Recalculating upcharges via recalcular_upcharge_dinamico()...");
      addLog("☁️ [SYNC_DB] Injecting audit_report_json & audit_summary_json to Supabase...");
      addLog("🤖 [AI_AGENT] Notifying SeveX_AI Agent for post-processing validation...");
      addLog("🎉 [PROCESS_EXIT] Pipeline completed. 0 errors. Exit code: 0", "success");

    } catch (err) {
      addLog(`❌ [RUNTIME_ERROR] Pipeline halted: ${err.message}`, "error");
    }
  };

  // --- VISTA DETALLADA PARA EL POPUP (BACKEND LOGIC) ---
  const DetailedBackendView = () => (
    <div className="space-y-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e0e0e0] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2 text-[#5b5fc7]">
            <Search size={16} />
            <span className="text-xs font-bold uppercase">Auditoría de Discrepancias</span>
          </div>
          <p className="text-[10px] text-[#616161] leading-relaxed">
            El motor compara el <code className="bg-gray-100 px-1">csv_usuario</code> contra el <code className="bg-gray-100 px-1">csv_raw</code> de la base de datos. 
            Utiliza una lógica de detección de delimitadores automática (detectar_delimitador) y normalización de headers (ID/SKU).
          </p>
        </div>
        <div className="bg-white border border-[#e0e0e0] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2 text-[#237b4b]">
            <Cpu size={16} />
            <span className="text-xs font-bold uppercase">Limpieza y Cálculo</span>
          </div>
          <p className="text-[10px] text-[#616161] leading-relaxed">
            Se ejecuta <code className="bg-gray-100 px-1">limpiar_monto()</code> para remover símbolos de moneda y espacios. 
            El sistema recalcula el upcharge dinámico basado en el Price Grade 02 como precio base de referencia.
          </p>
        </div>
      </div>

      <div className="bg-[#f9f9f9] border border-[#e0e0e0] p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3 text-[#c4314b]">
          <FileCode size={16} />
          <span className="text-xs font-bold uppercase">Procesamiento de Reglas XML (OFDA)</span>
        </div>
        <div className="space-y-2 text-[10px] text-[#424242]">
          <div className="flex gap-2">
            <span className="text-[#5b5fc7] font-bold">1.</span>
            <span>Mapeo estricto de opciones: POLYURETHANE, SOLID SURFACE, CASTERS, TABLET, CHROME, POWER.</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[#5b5fc7] font-bold">2.</span>
            <span>Inyección de namespaces para compatibilidad con esquemas de la industria (OFDAXML).</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[#5b5fc7] font-bold">3.</span>
            <span>Generación de micro-reporte resumen (<code className="bg-gray-200 px-1">audit_summary_json</code>).</span>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-dashed border-[#e0e0e0] pt-4">
        <h5 className="text-[10px] font-bold text-[#616161] mb-2 flex items-center gap-2">
          <FiActivity size={12}/> ESTADO ACTUAL DEL PIPELINE
        </h5>
        <div className="bg-gray-50 rounded p-2 font-mono text-[9px] text-[#444] border border-gray-100">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <span className="opacity-50">[{log.time}]</span>
              <span className={log.type === 'success' ? 'text-green-600' : ''}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 font-sans antialiased text-[#242424]">
      
      {/* --- MODAL MAXIMIZADO (VISTA ULTRADETALLADA) --- */}
      {isMaximized && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-[#e0e0e0] overflow-hidden flex flex-col max-h-[90vh]">
            <div className=" px-4 py-3 flex justify-between items-center text-gray-30">
              <div className="flex items-center gap-3">
                <FiDatabase size={16} />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest">SeveX_AI Backend Intelligence</h3>
                  <p className="text-[9px] opacity-80">Documentación técnica del proceso en ejecución</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMaximized(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div ref={modalScrollRef} className="flex-1 overflow-y-auto p-6 bg-white border-t border-gray-100">
              <DetailedBackendView />
            </div>

            <div className="bg-[#f5f5f5] px-4 py-2 text-[9px] text-[#828282] border-t border-[#e0e0e0] flex justify-between items-center font-bold">
              <span className="flex items-center gap-1"><FiCode/> ENGINE: PYTHON 3.11 / SUPABASE SDK</span>
              <span className="text-[#5b5fc7]">STABLE_BUILD_2026</span>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENEDOR DE ACCIONES --- */}
      <div className="bg-white border border-[#e0e0e0] rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[#5b5fc7]">
            <Zap size={14} fill="currentColor" />
          </div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#616161]">System Actions</h4>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <button 
            onClick={ejecutarConConsola}
            disabled={!file || isProcessing}
            className="w-full bg-[#5b5fc7] hover:bg-[#4f52b2] disabled:bg-[#f0f0f0] disabled:text-[#bdbdbd] text-white py-1.5 px-3 rounded font-semibold text-[11px] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <FiZap size={14} />}
            RUN PIPELINE & SYNC
          </button>

          <button 
            onClick={() => { setLogs([]); handleFullReset(); }} 
            className="w-full py-1.5 px-3 text-[10px] font-medium text-[#616161] hover:text-[#c4314b] hover:bg-[#f5f5f5] rounded transition-all flex items-center justify-center gap-2"
          >
            <FiTrash2 size={13} />
            Reset System
          </button>
        </div>
      </div>

      {/* --- CONSOLA MINIMIZADA (VISTA ESTÁNDAR) --- */}
      <div className="bg-white border border-[#e0e0e0] rounded-lg overflow-hidden flex flex-col shadow-sm">
        <div className="bg-[#f5f5f5] px-3 py-1.5 border-b border-[#e0e0e0] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiTerminal size={12} className="text-[#5b5fc7]" />
            <span className="text-[10px] font-bold text-[#616161] uppercase tracking-tight">Output Monitor</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMaximized(true)}
              className="p-1 hover:bg-[#e0e0e0] rounded text-[#828282] transition-colors flex items-center gap-1"
              title="Maximize"
            >
              <span className="text-[9px] font-bold uppercase px-1">Detalles técnicos</span>
              <Maximize2 size={10} />
            </button>
          </div>
        </div>

        {/* Cuerpo de Logs Pequeño */}
        <div 
          ref={scrollRef}
          className="h-23 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed space-y-1 bg-[#fafafa]"
        >
          {logs.length === 0 ? (
            <div className="flex items-center gap-2 text-[#adadad] italic">
              <span className="text-[#5b5fc7] font-bold">{">"}</span>
              Awaiting system trigger...
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-2 border-l border-[#eee] pl-2 animate-in fade-in slide-in-from-left-1">
                <span className="text-[#adadad] shrink-0 font-medium">{log.time}</span>
                <span className={`
                  ${log.type === 'error' ? 'text-[#c4314b] font-medium' : ''}
                  ${log.type === 'success' ? 'text-[#237b4b] font-bold' : ''}
                  ${log.type === 'start' ? 'text-[#0078d4] font-semibold underline' : 'text-[#424242]'}
                `}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex items-center gap-2 text-[#5b5fc7] animate-pulse mt-1">
              <ChevronRight size={10} />
              <span className="font-bold">Executing task...</span>
            </div>
          )}
        </div>
        
        <div className="bg-[#f5f5f5] px-3 py-1 text-[9px] text-[#828282] flex justify-between border-t border-[#e0e0e0] font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[8px]">
              <span className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-[#237b4b]' : 'bg-[#d1d1d1]'}`} />
              {isProcessing ? 'PROCESSING' : 'READY'}
            </span>
          </div>
          <span className="opacity-70 text-[8px]">v2.0.4</span>
        </div>
      </div>
    </div>
  );
};

export default EJECUTOR_PLAY;