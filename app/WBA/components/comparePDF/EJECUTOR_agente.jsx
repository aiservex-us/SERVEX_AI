"use client";

import React, { useState } from 'react';
import { 
  Bot, Sparkles, Clipboard, Check, 
  Zap, Maximize2, X, FileText
} from 'lucide-react';

const EjecutorAgente = ({ reportText, isProcessing }) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedModal, setCopiedModal] = useState(false);

  const formatReport = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      if (line.trim().startsWith('* ')) {
        return (
          <li key={index} className="ml-5 mb-1 list-disc text-[#464775]">
            <span className="text-gray-700 text-xs">{formattedLine.slice(1)}</span>
          </li>
        );
      }
      return line.trim() === '' ? <br key={index} /> : <p key={index} className="mb-2 text-xs text-gray-700">{formattedLine}</p>;
    });
  };

  const formatReportModal = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-gray-900 text-sm">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      if (line.trim().startsWith('* ')) {
        return (
          <li key={index} className="ml-6 mb-2 list-disc text-[#464775]">
            <span className="text-gray-700 text-sm leading-relaxed">{formattedLine.slice(1)}</span>
          </li>
        );
      }
      return line.trim() === '' 
        ? <div key={index} className="h-3" /> 
        : <p key={index} className="mb-3 text-sm text-gray-700 leading-relaxed">{formattedLine}</p>;
    });
  };

  return (
    <div className="w-full font-sans">
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="bg-white px-4 py-2.5 flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-white fill-white/20" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Intelligence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded text-[9px] font-medium border border-white/20">
              <Zap size={10} className="text-yellow-400 fill-yellow-400" />
              ENGINE v4.10
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!reportText || isProcessing}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-40"
              title="View full report"
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

          <div className="bg-white border border-gray-100 rounded-md p-4 h-30 overflow-y-auto custom-scrollbar">
            {isProcessing ? (
              <div className="flex flex-col gap-2 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : reportText ? (
              <div className="font-normal">{formatReport(reportText)}</div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-400 italic">No data currently processed.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MODAL FULL REPORT */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-6"
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', backgroundColor: 'rgba(30, 30, 50, 0.55)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div 
            className="w-full max-w-3xl bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{ maxHeight: '88vh' }}
          >
            {/* Modal Header */}
            <div className="bg-[#464775] px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-white/15 p-1.5 rounded">
                  <FileText size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm tracking-tight">Executive Audit Report</p>
                  <p className="text-white/50 text-[10px] font-medium uppercase tracking-widest">SVX Intelligence · Full Document</p>
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
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Subtle top document rule */}
            <div className="h-1 w-full bg-gradient-to-r from-[#464775] via-purple-400 to-indigo-300 flex-shrink-0" />

            {/* Document meta bar */}
            <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Report</span>
              </div>
              <div className="h-3 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Engine v4.10</span>
              </div>
              <div className="h-3 w-px bg-gray-200" />
              <span className="text-[10px] text-gray-400 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-10 py-8">
                {/* Document heading */}
                <div className="mb-8 pb-5 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={20} className="text-[#464775]" />
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Executive Audit Report</h1>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">Generated by SVX Copilot Intelligence · Servex US</p>
                </div>

                {/* Report content */}
                <div className="prose-sm max-w-none">
                  {formatReportModal(reportText)}
                </div>

                {/* Footer rule */}
                <div className="mt-10 pt-5 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">SVX Copilot · Confidential</span>
                  <span className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">Engine v4.10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E1E1E1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C1C1C1; }
      `}</style>
    </div>
  );
};

export default EjecutorAgente;