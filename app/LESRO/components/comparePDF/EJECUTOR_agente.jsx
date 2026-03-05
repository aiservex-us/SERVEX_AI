import React from 'react';
import { Bot, FileText, Sparkles, ClipboardCheck } from 'lucide-react';

const EjecutorAgente = ({ reportText, isProcessing }) => {
  
  // Función auxiliar para copiar el reporte (opcional, añade valor al perfil senior)
  const copyToClipboard = () => {
    if (reportText) {
      navigator.clipboard.writeText(reportText);
      alert("Informe copiado al portapapeles");
    }
  };

  return (
    <section className="flex-1 bg-white border border-[#EDEBE9] rounded-lg shadow-sm overflow-hidden flex flex-col min-h-0">
      {/* Header - SVX Copilot Style */}
      <div className="flex-shrink-0 bg-[#F3F2F1] px-4 py-2 border-b border-[#EDEBE9] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-[#464775]" />
          <span className="text-[10px] font-black text-[#464775] uppercase tracking-wider">
            SVX Copilot - Informe de Auditoría
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {isProcessing && (
            <div className="flex items-center gap-2 text-[#915608]">
              <Sparkles size={12} className="animate-spin" />
              <span className="text-[9px] font-bold">REDACTANDO...</span>
            </div>
          )}
          {/* Botón de copiar solo si hay texto y no está procesando */}
          {reportText && !isProcessing && (
            <button 
              onClick={copyToClipboard}
              className="text-[#464775] hover:bg-white p-1 rounded transition-colors"
              title="Copiar informe"
            >
              <ClipboardCheck size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Report Body */}
      <div className="flex-grow p-6 overflow-auto bg-[#FFF] custom-scrollbar">
        {isProcessing ? (
          /* Estado: Cargando / Procesando */
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-[#F3F2F1] rounded w-3/4"></div>
            <div className="h-4 bg-[#F3F2F1] rounded w-full"></div>
            <div className="h-4 bg-[#F3F2F1] rounded w-5/6"></div>
            <div className="h-32 bg-[#F3F2F1] rounded w-full border-2 border-dashed border-[#EDEBE9]"></div>
          </div>
        ) : reportText ? (
          /* Estado: Éxito (Dato traído de informa_agent_raw) */
          <div className="prose prose-sm max-w-none">
            <div className="flex gap-4 items-start mb-6 border-l-4 border-[#464775] pl-4 bg-[#F8F8F9] py-4 rounded-r-lg">
              <FileText size={20} className="text-[#464775] mt-1 shrink-0" />
              <div className="text-[#242424] text-[13px] leading-relaxed whitespace-pre-wrap font-sans">
                {reportText}
              </div>
            </div>
          </div>
        ) : (
          /* Estado: Inicial / Vacío */
          <div className="h-full flex flex-col items-center justify-center text-[#828282] space-y-2 opacity-40">
            <Bot size={32} />
            <p className="text-[11px] font-bold uppercase tracking-widest">
              Esperando reporte de Supabase...
            </p>
          </div>
        )}
      </div>

      {/* Footer / Status Bar */}
      <div className="flex-shrink-0 px-4 py-1.5 bg-[#F3F2F1] border-t border-[#EDEBE9] flex justify-between items-center">
        <span className="text-[8px] text-[#616161] font-bold uppercase tracking-widest">
          AI ENGINE: LLAMA-3.1-8B-INSTANT
        </span>
        <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-orange-400 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-[8px] text-[#616161] font-bold uppercase">
              {isProcessing ? 'Analizando...' : 'Agente Listo'}
            </span>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F3F2F1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #C8C6C4;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #A19F9D;
        }
      `}</style>
    </section>
  );
};

export default EjecutorAgente;