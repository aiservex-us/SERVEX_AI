"use client";

import React, { useState } from 'react';
import { 
  Bot, Sparkles, Clipboard, Check, 
  Zap
} from 'lucide-react';

const EjecutorAgente = ({ reportText, isProcessing }) => {
  const [copied, setCopied] = useState(false);

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