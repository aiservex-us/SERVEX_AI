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

  useEffect(() => {
    if (reportText && !isProcessing) {
      setIsModalOpen(true);
    }
  }, [reportText, isProcessing]);

  const MarkdownContent = ({ content, isSmall = false }) => (
    <div className={`prose prose-slate max-w-none
      prose-headings:text-[#464775] prose-headings:font-bold
      ${isSmall ? 'prose-p:text-[9px]' : 'prose-p:text-[9px]'}
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
            <h3 className="text-s font-bold text-gray-900">Executive Audit Report</h3>
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
                <p className="text-s text-gray-400 italic">No data currently processed.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MODAL FULL REPORT ACTUALIZADO */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div 
            className="w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200"
            style={{ maxHeight: '92vh' }}
          >
            {/* Header Limpio (Sin fondo morado) */}
            <div className="bg-white px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 p-1.5 rounded border border-gray-200">
                  <FileText size={18} className="text-[#464775]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-bold text-s tracking-tight">Executive Audit Report</p>
                    <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                      <Zap size={8} className="text-yellow-600 fill-yellow-600" />
                      <span className="text-[8px] font-bold text-gray-500 tracking-wider">v4.10</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">SVX Intelligence · Full Document</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(reportText);
                    setCopiedModal(true);
                    setTimeout(() => setCopiedModal(false), 2000);
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold bg-white px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition-all text-gray-600 shadow-sm"
                >
                  {copiedModal ? <Check size={12} className="text-green-500" /> : <Clipboard size={12} />}
                  {copiedModal ? 'Copied!' : 'Copy Document'}
                </button>
                <div className="w-px h-6 bg-gray-100 mx-1" />
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#FCFCFC]">
              <div className="max-w-4xl mx-auto px-8 lg:px-12 py-10 bg-white min-h-full shadow-[0_0_40px_rgba(0,0,0,0.02)]">
                {/* Meta Bar interna */}
                <div className="mb-10 pb-6 border-b border-gray-100 flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-1 bg-[#464775] rounded-full" />
                      <p className="text-[10px] text-[#464775] font-black uppercase tracking-[0.2em]">Engineering Audit</p>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Intelligence Report</h1>
                    <p className="text-[11px] text-gray-400 mt-1">Ref ID: SVX-{new Date().getFullYear()}-0425</p>
                  </div>
                  <div className="text-right pb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date of Issue</p>
                    <p className="text-xs font-bold text-gray-800">
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Markdown Content */}
                <MarkdownContent content={reportText} />

                {/* Footer del Documento */}
                <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-center opacity-60">
                   <div className="flex items-center gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-[0.15em]">
                    <p>Powered by <span className="text-[#464775]">Servex_AI Logic</span></p>
                  </div>
                  <div className="flex gap-4 items-center text-[9px] font-bold text-gray-400 uppercase">
                    <div className="flex items-center gap-1">
                      <Shield size={10} />
                      <span>Secured Environment</span>
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