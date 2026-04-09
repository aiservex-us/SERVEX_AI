'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AgentInfo = () => {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('ClientsSERVEX')
          .select('informa_agent_raw')
          .single();

        if (supabaseError) throw supabaseError;

        setAgentData(data?.informa_agent_raw);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#464775]"></div>
        <span className="ml-3 text-[#616161] font-medium">Sincronizando con SVX_AI...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="m-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
        <p className="font-bold">Error de Conexión</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF] min-h-screen py-8 px-4 font-sans text-[#242424]">
      {/* Contenedor Principal Estilo Teams Enterprise */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-[0_8px_16px_rgba(0,0,0,0.08)] border border-[#E1E1E1] overflow-hidden">
        
        {/* Header - Identidad Corporativa SVX */}
        <div className="bg-[#ffffff] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
              <span className="text-white font-black text-sm tracking-tighter">SVX</span>
            </div>
           
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-400/30 rounded-md">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-600 text-[10px] font-bold uppercase tracking-widest">
              Live Report
            </span>
          </div>
        </div>

        {/* Cuerpo del Reporte con Procesamiento Markdown */}
        <div className="p-8">
          {agentData ? (
            <div className="prose prose-slate max-w-none 
              prose-headings:text-[#464775] prose-headings:font-bold
              prose-h2:text-2xl prose-h2:border-b prose-h2:pb-3 prose-h2:mt-8
              prose-h3:text-lg prose-h3:text-[#464775]/80
              prose-h4:text-[#616161] prose-h4:uppercase prose-h4:text-[11px] prose-h4:tracking-[0.2em] prose-h4:font-black
              prose-p:text-[#424242] prose-p:leading-relaxed prose-p:text-[15px]
              prose-strong:text-[#464775] prose-strong:font-bold">
              
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({node, ...props}) => (
                    <div className="my-8 overflow-hidden rounded-xl border border-[#EDEBE9] shadow-sm">
                      <table className="min-w-full divide-y divide-[#EDEBE9]" {...props} />
                    </div>
                  ),
                  thead: ({node, ...props}) => <thead className="bg-[#FAF9F8]" {...props} />,
                  th: ({node, ...props}) => (
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-[#616161] uppercase tracking-[0.1em]" {...props} />
                  ),
                  td: ({node, ...props}) => (
                    <td className="px-6 py-4 text-[13px] text-[#242424] border-t border-[#EDEBE9] bg-white" {...props} />
                  ),
                  hr: () => <hr className="my-10 border-t border-[#F0F0F0]" />,
                  blockquote: ({node, ...props}) => (
                    <div className="bg-[#F3F2F1] border-l-4 border-[#464775] p-5 my-8 rounded-r-xl shadow-inner italic text-[#484644]">
                      {props.children}
                    </div>
                  )
                }}
              >
                {agentData}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#616161] italic text-sm">No se encontró información estructurada para este agente.</p>
            </div>
          )}
        </div>

        {/* Footer de Auditoría de Ingeniería */}
        <div className="bg-[#FAF9F8] border-t border-[#EDEBE9] p-5 px-8 flex justify-between items-center text-[11px] text-[#616161] font-medium uppercase tracking-tight">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#464775] rounded-full"></span>
            <p>Orquestado por <span className="text-[#464775] font-bold">SERVEX_AI Engine</span></p>
          </div>
          <div className="flex gap-6 items-center">
            <span className="bg-[#EDEBE9] px-2 py-1 rounded">Protocol: Secure_Auth_v2</span>
            <span className="text-[#464775]">Next.js Platform</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentInfo;