"use client";

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, Sparkles, Clipboard, Check, 
  Zap, Maximize2, X, FileText, Shield, Cloud 
} from 'lucide-react';

const EjecutorAgente = ({ reportText, isProcessing }) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedModal, setCopiedModal] = useState(false);

  // EFECTO PARA ABRIR AUTOMÁTICAMENTE CUANDO LLEGA INFO
  useEffect(() => {
    if (reportText && !isProcessing) {
      setIsModalOpen(true);
    }
  }, [reportText, isProcessing]);

  // Componente de Renderizado de Markdown (Mismo estilo que AgentInfo)
  const MarkdownContent = ({ content, isSmall = false }) => (
    <div className={`prose prose-slate max-w-none
      prose-headings:text-[#464775] prose-headings:font-bold
      ${isSmall ? 'prose-p:text-[11px]' : 'prose-p:text-[12px]'}
      prose-h2:text-lg prose-h2:border-b prose-h2:border-[#F0F0F0] prose-h2:pb-2
      prose-p:text-[#424242] prose-p:leading-relaxed
      prose-strong:text-[#464775] prose-strong:font-bold
      prose-li:text-[#424242]`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({node, ...props}) => (
            <div className="my-4 overflow-hidden rounded border border-[#EDEBE9]">
              <table className="min-w-full divide-y divide-[#EDEBE9]" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-[#F8F9FA]" {...props} />,
          th: ({node, ...props}) => (
            <th className="px-4 py-2 text-left text-[10px] font-bold text-[#616161] uppercase" {...props} />
          ),
          td: ({node, ...props}) => (
            <td className="px-4 py-2 text-[11px] text-[#242424] border-t border-[#EDEBE9]" {...props} />
          ),
          blockquote: ({node, ...props}) => (
            <div className="bg-[#FAF9F8] border-l-2 border-[#464775] px-4 py-2 my-4 text-[11px] italic text-[#484644]">
              {props.children}
            </div>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  return (
    <div className="w-full font-sans">
      {/* VISTA PREVIA COMPACTA */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="bg-white px-4 py-2.5 flex items-center justify-between text-gray-600 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#464775]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Intelligence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded text-[9px] font-medium border border-gray-200 text-[#464775]">
              <Zap size={10} className="text-yellow-500 fill-yellow-500" />
              ENGINE v4.10
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!reportText || isProcessing}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-40"
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(reportText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              disabled={!reportText || isProcessing}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-40"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Clipboard size={14} />}
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-[#464775] mb-3">
            <Bot size={18} />
            <h3 className="text-sm font-bold text-gray-900">Executive Audit Report</h3>
          </div>

          <div className="bg-white border border-gray-100 rounded-md p-4 h-40 overflow-y-auto custom-scrollbar">
            {isProcessing ? (
              <div className="flex flex-col gap-2 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : reportText ? (
              <MarkdownContent content={reportText} isSmall={true} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-400 italic">No data currently processed.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MODAL FULL REPORT (CON ESTILO AGENTINFO) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', backgroundColor: 'rgba(30, 30, 50, 0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div 
            className="w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ maxHeight: '90vh' }}
          >
            {/* Header del Modal */}
            <div className="bg-[#464775] px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/15 p-1.5 rounded border border-white/20">
                  <FileText size={18} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-bold text-sm tracking-tight">Console Executive Report</p>
                    <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                      <Zap size={8} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-[8px] font-bold text-white/80 tracking-wider">v4.10</span>
                    </div>
                  </div>
                  <p className="text-white/50 text-[10px] font-medium uppercase tracking-widest">SVX Intelligence · Full Document View</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(reportText);
                    setCopiedModal(true);
                    setTimeout(() => setCopiedModal(false), 2000);
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold bg-white/10 px-3 py-1.5 rounded border border-white/20 hover:bg-white/20 transition-all text-white"
                >
                  {copiedModal ? <Check size={12} /> : <Clipboard size={12} />}
                  {copiedModal ? 'Copied!' : 'Copy'}
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded transition-colors text-white/70 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              <div className="px-10 lg:px-16 py-10">
                {/* Meta Bar interna */}
                <div className="mb-10 pb-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Bot size={22} className="text-[#464775]" />
                      <h1 className="text-xl font-black text-gray-900 tracking-tight">Executive Audit Report</h1>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">Generated by SVX Copilot · Engineering Audit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-[#464775] uppercase tracking-wider">Live Analysis Data</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Markdown Content */}
                <MarkdownContent content={reportText} />

                {/* Footer del Documento */}
                <div className="mt-12 pt-6 border-t border-[#EDEBE9] flex justify-between items-center opacity-70">
                   <div className="flex items-center gap-3 text-[9px] font-bold text-[#616161] uppercase tracking-[0.15em]">
                    <div className="w-1.5 h-1.5 bg-[#464775] rounded-full" />
                    <p>Powered by <span className="text-[#464775]">Servex_AI Core Logic</span></p>
                  </div>
                  <div className="flex gap-4 items-center text-[9px] font-bold text-[#616161] uppercase">
                    <div className="flex items-center gap-1">
                      <Shield size={10} />
                      <span>Azure OAuth</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Cloud size={10} />
                      <span>SVX_PROD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EDEBE9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #464775; opacity: 0.5; }
      `}</style>
    </div>
  );
};

export default EjecutorAgente;