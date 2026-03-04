import React from 'react';
import { Terminal, Cpu } from 'lucide-react'; // Importamos Cpu para el icono del agente

const EjecutorAgente = ({ terminalLogs, isProcessing }) => {
  return (
    <section className="flex-1 bg-white border border-[#EDEBE9] rounded-lg shadow-sm overflow-hidden flex flex-col font-mono min-h-0">
      {/* Console Header */}
      <div className="flex-shrink-0 bg-[#F3F2F1] px-4 py-2 border-b border-[#EDEBE9] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-[#464775]" />
          <span className="text-[10px] font-black text-[#464775] uppercase tracking-wider">
            Live Execution Console
          </span>
        </div>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D1D1D1]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#D1D1D1]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#D1D1D1]"></div>
        </div>
      </div>

      {/* Console Body */}
      <div className="flex-grow p-4 overflow-auto text-[11px] space-y-1.5 bg-[#FFF] custom-scrollbar">
        {terminalLogs.map((log) => (
          <div key={log.id} className={`flex gap-3 items-start border-l-2 pl-1 transition-colors ${
            log.type === 'agent' ? 'border-yellow-500 bg-yellow-50/30 p-2 rounded-r' : 'border-transparent hover:border-[#464775]'
          }`}>
            <span className="text-[#828282] shrink-0 font-medium">
              [{new Date(log.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
            </span>
            
            {/* Etiquetas dinámicas según el tipo de log */}
            <span className={`font-bold shrink-0 ${
              log.type === 'system' ? 'text-[#464775]' : 
              log.type === 'agent' ? 'text-yellow-600' : 
              log.type === 'error' ? 'text-red-600' : 'text-[#005FB8]'
            }`}>
              {log.type === 'system' ? '>>' : 
               log.type === 'agent' ? 'SVX_COPILOT' : 
               log.type === 'error' ? 'ERR' : 'INF'}
            </span>

            <span className={`leading-relaxed ${log.type === 'agent' ? 'text-[#242424] font-medium' : 'text-[#242424]'}`}>
              {log.type === 'agent' && <Cpu size={10} className="inline mr-2 mb-0.5" />}
              {log.msg}
            </span>
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3 animate-pulse pl-1 border-l-2 border-[#464775]">
             <span className="text-[#828282]">[{new Date().toLocaleTimeString()}]</span>
             <span className="text-[#915608] font-bold">PRC</span>
             <span className="text-[#915608] italic">Executing cloud pipelines and AI analysis...</span>
          </div>
        )}
        
        <div className="pt-2 flex items-center gap-1 pl-1">
          <span className="text-[#464775] font-bold font-sans">SERVEX_AI</span>
          <span className="text-[#464775] animate-bounce text-lg leading-none">.</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex-shrink-0 px-4 py-1 bg-white border-t border-[#EDEBE9] flex justify-end">
        <span className="text-[7.5px] text-[#616161] font-bold uppercase tracking-widest">
          System GLYNNE
        </span>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F3F2F1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #C8C6C4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #A19F9D; }
      `}</style>
    </section>
  );
};

export default EjecutorAgente;