import React, { useState } from 'react';
import { Bot, FileText, Sparkles, Maximize2, X, Clipboard, Check } from 'lucide-react';

const EjecutorAgente = ({ reportText, isProcessing }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Lógica de formateo centralizada
  const formatReport = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-[#242424]">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('* ')) {
        return (
          <li key={index} className="ml-6 mb-1 list-disc text-[#464775]">
            <span className="text-[#242424]">{formattedLine.slice(1)}</span>
          </li>
        );
      }
      return line.trim() === '' ? <br key={index} /> : <p key={index} className="mb-3">{formattedLine}</p>;
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <section className="flex-1 bg-white border border-[#EDEBE9] rounded-lg shadow-sm overflow-hidden flex flex-col min-h-0">
        {/* Header */}
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
            {reportText && !isProcessing && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 text-[#464775] hover:bg-white px-2 py-1 rounded transition-all border border-transparent hover:border-[#EDEBE9] shadow-sm"
              >
                <Maximize2 size={13} />
                <span className="text-[9px] font-bold uppercase">Expandir</span>
              </button>
            )}
          </div>
        </div>

        {/* Mini Preview Body */}
        <div className="flex-grow p-6 overflow-auto bg-[#FFF] custom-scrollbar">
          {isProcessing ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-[#F3F2F1] rounded w-3/4"></div>
              <div className="h-4 bg-[#F3F2F1] rounded w-full"></div>
              <div className="h-24 bg-[#F3F2F1] rounded w-full"></div>
            </div>
          ) : reportText ? (
            <div className="text-[#242424] text-[13px] leading-relaxed font-sans opacity-80">
              {formatReport(reportText)}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#828282] space-y-2 opacity-40">
              <Bot size={32} />
              <p className="text-[11px] font-bold uppercase tracking-widest">Esperando reporte...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-1.5 bg-[#F3F2F1] border-t border-[#EDEBE9] flex justify-between items-center text-[8px] font-bold text-[#616161]">
          <span className="uppercase tracking-widest">LLAMA-3.1-8B-INSTANT</span>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-orange-400 animate-pulse' : 'bg-green-500'}`}></div>
            <span>{isProcessing ? 'PROCESANDO' : 'LISTO'}</span>
          </div>
        </div>
      </section>

      {/* --- MODAL INMERSIVO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#242424]/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-4xl max-h-full bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-[#464775] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-none">Reporte Detallado de Auditoría</h3>
                  <p className="text-[10px] text-white/70 mt-1 uppercase tracking-widest">Análisis asistido por SERVEX_AI</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-xs font-medium"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Clipboard size={14} />}
                  {copied ? 'Copiado' : 'Copiar Texto'}
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-grow p-8 md:p-12 overflow-auto bg-[#FAF9F8] custom-scrollbar">
              <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 shadow-sm border border-[#EDEBE9] rounded-sm min-h-full">
                <div className="prose prose-slate max-w-none text-[#242424] text-sm leading-relaxed">
                  {formatReport(reportText)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 px-6 py-3 bg-[#F3F2F1] border-t border-[#EDEBE9] flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-[#464775] text-white text-xs font-bold rounded hover:bg-[#3b3c63] transition-all shadow-md"
              >
                CERRAR VISTA
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F3F2F1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #C8C6C4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #A19F9D; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </>
  );
};

export default EjecutorAgente;