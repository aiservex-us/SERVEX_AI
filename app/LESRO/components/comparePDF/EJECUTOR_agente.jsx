"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Maximize2, X, Clipboard, Check, 
  MessageSquare, Send, Database, ChevronDown, 
  Zap, Plus, Mic, HelpCircle, ArrowRight, Layout,
  BarChart3, Shield, Settings, FileText
} from 'lucide-react';

const EjecutorAgente = ({ reportText, isProcessing }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState('Servex US');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) scrollToBottom();
  }, [messages, isTyping]);

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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Connection error with SVX Engine." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full font-sans">
      {/* --- PREVIEW CARD (TEAMS STYLE) --- */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="bg-gray-100 px-4 py-2.5 flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-white fill-white/20" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Intelligence</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded text-[9px] font-medium border border-white/20">
              <Zap size={10} className="text-yellow-400 fill-yellow-400" />
              ENGINE v4.10
            </div>
            <button onClick={() => setIsChatOpen(true)} className="p-1 hover:bg-white/20 rounded transition-colors">
              <MessageSquare size={14} />
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-[#464775] mb-3">
            <Bot size={18} />
            <h3 className="text-sm font-bold text-gray-900">Executive Audit Report</h3>
          </div>

          {/* --- CAMBIO AQUÍ: De max-h-48 a h-48 para fijar la altura --- */}
<div className="bg-gray-50/50 border border-gray-100 rounded-md p-4 h-48 overflow-y-auto custom-scrollbar">
  {isProcessing ? (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  ) : reportText ? (
    <div className="font-normal">{formatReport(reportText)}</div>
  ) : (
    // Agregamos flex y items-center para que el texto de "No data" se vea bien centrado en el espacio fijo
    <div className="h-full flex items-center justify-center">
      <p className="text-xs text-gray-400 italic">No data currently processed.</p>
    </div>
  )}
</div>
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={() => setIsChatOpen(true)}
              disabled={!reportText || isProcessing}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#464775] text-white rounded text-[11px] font-bold hover:bg-[#3a3b61] transition-all disabled:opacity-50"
            >
              <span>Open Copilot Chat</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* --- FULL SCREEN CHAT MODAL (TEAMS COPILOT STYLE) --- */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="h-12 bg-[#464775] w-full flex items-center justify-between px-4 text-white shadow-md">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded p-0.5">
                <Bot size={16} className="text-[#464775]" />
              </div>
              <span className="text-sm font-semibold opacity-90 tracking-tight">SVX Copilot Intelligence</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(reportText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-[11px] font-medium bg-white/10 px-3 py-1 rounded border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
              >
                {copied ? <Check size={12} /> : <Clipboard size={12} />}
                Copy Report
              </button>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center p-6 overflow-hidden">
            <div className="w-full max-w-4xl h-full flex flex-col">
              
              {/* Contextual Header */}
              <div className="mb-6 border-b border-gray-200 pb-4 flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 text-[#464775] mb-1">
                    <Sparkles size={16} fill="#464775" fillOpacity={0.2} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Contextual Assistance Center</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">Servex Intelligence Chat</h1>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-md mb-1">
                  <span className="px-3 py-1 bg-white text-[#464775] shadow-sm rounded text-[10px] font-bold uppercase">Active Audit</span>
                </div>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-2 custom-scrollbar">
                {/* Initial Message (The Report) */}
                <div className="flex gap-4 group">
                  <div className="w-8 h-8 rounded bg-[#464775] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">SVX Copilot • Recent Audit</p>
                    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                      <div className="prose prose-sm max-w-none">{formatReport(reportText)}</div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-gray-100' : 'bg-[#464775]'}`}>
                      {msg.role === 'user' ? <div className="text-[#464775] font-bold text-xs">U</div> : <Bot size={18} className="text-white" />}
                    </div>
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">
                        {msg.role === 'user' ? 'You' : 'SVX Copilot'}
                      </p>
                      <div className={`p-4 rounded-lg text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#464775] text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-8 h-8 rounded bg-[#464775] flex items-center justify-center flex-shrink-0 opacity-50">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4 w-24 flex gap-1 items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area (TEAMS STYLE) */}
              <div className="bg-white border border-gray-300 rounded-lg shadow-xl overflow-hidden focus-within:border-[#464775] focus-within:ring-1 focus-within:ring-[#464775]/30 transition-all">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-[10px] font-bold text-gray-600 bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                  >
                    <Database size={10} className="text-[#464775]" />
                    CONTEXT: {context}
                    <ChevronDown size={10} className={isDropdownOpen ? 'rotate-180' : ''} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-9 left-4 w-40 bg-white border border-gray-200 shadow-xl rounded z-50 py-1">
                      {['Servex US', 'Servex LATAM'].map((ctx) => (
                        <button 
                          key={ctx}
                          onClick={() => { setContext(ctx); setIsDropdownOpen(false); }}
                          className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-50 flex justify-between items-center font-medium"
                        >
                          {ctx}
                          {context === ctx && <Check size={10} className="text-[#464775]" />}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                  <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-semibold tracking-tight uppercase">
                    <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                    Ready for Data Analysis
                  </div>
                </div>

                <div className="p-3">
                  <textarea 
                    className="w-full text-sm text-gray-700 border-none focus:ring-0 resize-none bg-transparent placeholder-gray-400 min-h-[80px]"
                    placeholder="Ask a question about SKU discrepancies or time savings..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>

                <div className="flex justify-between items-center px-4 py-2 border-t border-gray-100 bg-white">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Plus size={18} className="cursor-pointer hover:text-[#464775]" />
                    <Mic size={18} className="cursor-pointer hover:text-[#464775]" />
                    <HelpCircle size={18} className="cursor-pointer hover:text-[#464775]" />
                  </div>

                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className={`flex items-center gap-2 px-6 py-1.5 rounded-md font-bold text-xs transition-all
                    ${inputMessage.trim() && !isTyping 
                      ? 'bg-[#464775] text-white hover:bg-[#3a3b61]' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
                  >
                    <span>Send Query</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="mt-4 flex flex-wrap gap-4 items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">Suggestions:</span>
                {["Explain price errors", "Savings summary", "Grade 2 SKUs"].map((tip, i) => (
                  <button 
                    key={i}
                    onClick={() => setInputMessage(tip)}
                    className="text-[10px] text-[#464775] hover:underline font-semibold"
                  >
                    {tip}
                  </button>
                ))}
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