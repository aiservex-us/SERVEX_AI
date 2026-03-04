import React, { useEffect, useState } from 'react';
import { Bot, FileText, Sparkles, History, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase (Asegúrate de tener estas variables en tu .env o cámbialas aquí)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const EjecutorAgente = ({ externalProcessing }) => {
  const [reportText, setReportText] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [localProcessing, setLocalProcessing] = useState(false);

  // Unificamos el estado de procesamiento (externo o local)
  const isProcessing = externalProcessing || localProcessing;

  // 1. CARGA INICIAL: Traer el reporte persistido en Supabase
  const fetchReport = async () => {
    try {
      const { data, error } = await supabase
        .from('ClientsSERVEX')
        .select('informa_agent_raw')
        .eq('company_name', 'LESRO')
        .single();

      if (data && data.informa_agent_raw) {
        setReportText(data.informa_agent_raw);
      }
    } catch (err) {
      console.error("Error cargando reporte inicial:", err);
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchReport();
    
    // Opcional: Escuchar cambios en tiempo real en Supabase
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ClientsSERVEX', filter: 'company_name=eq.LESRO' },
        (payload) => {
          if (payload.new && payload.new.informa_agent_raw) {
            setReportText(payload.new.informa_agent_raw);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section className="flex-1 bg-white border border-[#EDEBE9] rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[400px]">
      {/* HEADER DINÁMICO */}
      <div className="flex-shrink-0 bg-[#F3F2F1] px-4 py-2.5 border-b border-[#EDEBE9] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={16} className={`${isProcessing ? 'text-[#005FB8] animate-pulse' : 'text-[#464775]'}`} />
          <span className="text-[10px] font-black text-[#464775] uppercase tracking-wider">
            SVX Copilot - Intelligence Unit
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {isProcessing ? (
            <div className="flex items-center gap-2 text-[#915608] bg-[#FFF4CE] px-2 py-0.5 rounded border border-[#FDE396]">
              <Sparkles size={11} className="animate-spin" />
              <span className="text-[9px] font-black uppercase">Redactando Informe...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#27AE60]">
              <History size={11} />
              <span className="text-[9px] font-bold uppercase tracking-tight">Registro Sincronizado</span>
            </div>
          )}
        </div>
      </div>

      {/* CUERPO DEL REPORTE */}
      <div className="flex-grow p-6 overflow-auto bg-[#FFF] custom-scrollbar relative">
        {loadingInitial ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
             <RefreshCw className="animate-spin text-[#C8C6C4]" size={24} />
             <span className="text-[10px] text-[#A19F9D] font-bold uppercase">Conectando a Cloud Core...</span>
          </div>
        ) : reportText ? (
          <div className={`transition-all duration-700 ${isProcessing ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}>
            <div className="flex gap-4 items-start mb-6 border-l-4 border-[#464775] pl-5 bg-[#F8F8F9] py-5 rounded-r-xl shadow-sm border-y border-r border-[#EDEBE9]">
              <FileText size={22} className="text-[#464775] mt-1 shrink-0 opacity-80" />
              <div className="flex flex-col gap-3 w-full">
                <div className="flex justify-between items-center border-b border-[#EDEBE9] pb-2">
                  <span className="text-[9px] font-black text-[#464775] uppercase tracking-widest">Official Audit Report</span>
                  <span className="text-[9px] text-[#828282] font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div className="text-[#242424] text-[13px] leading-relaxed whitespace-pre-wrap font-sans">
                  {reportText}
                </div>
              </div>
            </div>
            
            {isProcessing && (
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center">
                 <div className="bg-white px-4 py-2 rounded-full shadow-xl border border-[#EDEBE9] flex items-center gap-3">
                    <Sparkles size={14} className="text-[#915608] animate-bounce" />
                    <span className="text-[11px] font-bold text-[#242424]">SVX está analizando los nuevos cambios...</span>
                 </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#828282] space-y-3 opacity-30">
            <Bot size={48} strokeWidth={1} />
            <p className="text-[12px] font-bold uppercase tracking-widest">No hay datos de auditoría</p>
            <p className="text-[10px] max-w-[200px] text-center italic">Inicie un proceso de carga para activar al agente narrativo.</p>
          </div>
        )}
      </div>

      {/* STATUS BAR FOOTER */}
      <div className="flex-shrink-0 px-4 py-1.5 bg-[#F3F2F1] border-t border-[#EDEBE9] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-[8px] text-[#616161] font-bold uppercase tracking-widest">
            AI Engine: LLAMA-3.1-8B-INSTANT
          </span>
          <div className="h-2 w-[1px] bg-[#C8C6C4]"></div>
          <span className="text-[8px] text-[#616161] font-bold uppercase tracking-widest">
            Unit: LESRO-BACKEND-01
          </span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-orange-400 animate-pulse' : 'bg-[#27AE60]'}`}></div>
            <span className="text-[8px] text-[#242424] font-black uppercase">Active</span>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F3F2F1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #C8C6C4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #464775; }
      `}</style>
    </section>
  );
};

export default EjecutorAgente;