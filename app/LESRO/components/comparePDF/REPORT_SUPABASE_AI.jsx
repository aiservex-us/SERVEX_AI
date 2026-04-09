import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AgentReportUI = ({ rawData }) => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8 font-sans text-[#242424]">
      {/* Contenedor Principal Estilo Teams */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] border border-[#E1E1E1] overflow-hidden">
        
        {/* Header Superior - Identidad de Marca */}
        <div className="bg-[#464775] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-xs">SVX</span>
            </div>
            <h1 className="text-white font-semibold text-lg tracking-tight">
              SVX Copilot <span className="text-purple-200 font-normal ml-1">| Reporte de Sincronización</span>
            </h1>
          </div>
          <div className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full">
            <span className="text-green-100 text-xs font-medium uppercase tracking-wider">Procesado</span>
          </div>
        </div>

        {/* Cuerpo del Reporte */}
        <div className="p-8 space-y-8">
          
          {/* Estilización Personalizada de Markdown */}
          <div className="prose prose-slate max-w-none 
            prose-headings:text-[#464775] prose-headings:font-bold
            prose-h2:border-b prose-h2:pb-2 prose-h2:text-2xl
            prose-h4:text-[#616161] prose-h4:uppercase prose-h4:text-xs prose-h4:tracking-widest
            prose-p:text-[#424242] prose-p:leading-relaxed
            prose-strong:text-[#464775]">
            
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Estilo para las Tablas de Datos
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-6 rounded-lg border border-[#EDEBE9]">
                    <table className="min-w-full divide-y divide-[#EDEBE9]" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => <thead className="bg-[#FAF9F8]" {...props} />,
                th: ({node, ...props}) => (
                  <th className="px-4 py-3 text-left text-[11px] font-bold text-[#616161] uppercase tracking-wider" {...props} />
                ),
                td: ({node, ...props}) => (
                  <td className="px-4 py-3 text-sm text-[#242424] border-t border-[#EDEBE9]" {...props} />
                ),
                // Estilo para las líneas horizontales
                hr: () => <hr className="my-8 border-t-2 border-[#F0F0F0]" />,
                // Estilo para bloques de ahorro/eficiencia
                blockquote: ({node, ...props}) => (
                  <div className="bg-[#F3F2F1] border-l-4 border-[#464775] p-4 my-6 rounded-r-md italic">
                    {props.children}
                  </div>
                )
              }}
            >
              {rawData}
            </ReactMarkdown>
          </div>

        </div>

        {/* Footer de Auditoría */}
        <div className="bg-[#FAF9F8] border-t border-[#EDEBE9] p-4 px-8 flex justify-between items-center text-[12px] text-[#616161]">
          <p>Generado automáticamente por <strong>SVX_AI Engine</strong></p>
          <div className="flex gap-4">
            <span>Server: Render Cloud</span>
            <span className="font-mono">Ref: Base/Grados/Opt</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentReportUI;