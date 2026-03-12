"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Maximize2, X, Clipboard, Check, 
  MessageSquare, Send, Database, ChevronDown, 
  Zap, Plus, Mic, HelpCircle, ArrowRight, Layout,
  FileText
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
            <span className="text-gray-700 text-[13px]">{formattedLine.slice(1)}</span>
          </li>
        );
      }
      return line.trim() === '' ? <br key={index} /> : <p key={index} className="mb-2 text-[13px] text-gray-700">{formattedLine}</p>;
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
      setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Error de conexión con SVX Engine." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full font-sans">
      {/* --- PREVIEW CARD ORIGINAL --- */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="bg-[#464775] px-4 py-2.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-white fill-white/20" />
            <span className="text-[11px] font-bold uppercase tracking-wider">SVX Copilot Intelligence</span>
          </div>
          <button onClick={() => setIsChatOpen(true)} className="p-1 hover:bg-white/20 rounded transition-colors">
            <MessageSquare size={14} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-[#464775] mb-3">
            <Bot size={18} />
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">Análisis de Auditoría</h3>
          </div>
          <div className="bg-gray-50/50 border border-gray-100 rounded p-4 max-h-32 overflow-hidden relative">
            <div className="opacity-60 pointer-events-none">{formatReport(reportText?.substring(0, 200) + "...")}</div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent flex items-end justify-center pb-2">
               <button onClick={() => setIsChatOpen(true)} className="text-[10px] font-bold text-[#464775] hover:underline uppercase">Ver análisis completo y chatear</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- MODAL 90% CON BLUR --- */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          {/* Backdrop con Blur intenso */}
          <div 
            className="absolute inset-0 bg-[#242424]/40 backdrop-blur-md"
            onClick={() => setIsChatOpen(false)}
          />
          
          {/* Contenedor del Modal (90% de ancho/alto aprox) */}
          <div className="relative w-full h-full max-w-[95%] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            
            {/* Header Estilo Teams */}
            <div className="h-14 bg-[#464775] w-full flex items-center justify-between px-6 text-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded p-1">
                  <Bot size={18} className="text-[#464775]" />
                </div>
                <div>
                  <span className="text-sm font-bold tracking-tight block">SVX Copilot Intelligence</span>
                  <span className="text-[9px] opacity-60 uppercase font-black tracking-widest">Enterprise Neural Engine</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold">
                  <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                  CONTEXT: {context}
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden bg-[#FAF9F8]">
              {/* Main Chat Area */}
              <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6">
                
                {/* Scrollable Messages */}
                <div className="flex-1 overflow-y-auto mb-6 space-y-8 pr-4 custom-scrollbar">
                  
                  {/* Saludo y Reporte Inicial */}
                  <div className="flex gap-5">
                    <div className="w-10 h-10 rounded-xl bg-[#464775] flex items-center justify-center shrink-0 shadow-lg">
                      <Sparkles size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-gray-900 mb-1">Análisis de Integridad LESRO</h2>
                      <p className="text-xs text-gray-500 mb-4">Sincronizado con Supabase Real-time Auditor</p>
                      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <div className="prose prose-sm max-w-none">
                          {formatReport(reportText)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Burbujas de Chat */}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${msg.role === 'user' ? 'bg-white border border-gray-200' : 'bg-[#464775]'}`}>
                        {msg.role === 'user' ? <div className="text-[#464775] font-black text-xs">U</div> : <Bot size={20} className="text-white" />}
                      </div>
                      <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#464775] text-white' : 'bg-white border border-gray-100 text-gray-800'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-5 animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-[#464775] flex items-center justify-center opacity-40">
                        <Bot size={20} className="text-white" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 flex gap-1.5 items-center">
                        <div className="w-2 h-2 bg-[#464775]/40 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#464775]/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-[#464775]/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Box Estilo Microsoft Copilot v2025 */}
                <div className="shrink-0 bg-white border border-gray-300 rounded-2xl shadow-2xl focus-within:border-[#464775] focus-within:ring-2 focus-within:ring-[#464775]/10 transition-all overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                      <Database size={12} />
                      AUDIT DATA SOURCE: ClientsSERVEX
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <textarea 
                      className="w-full text-sm text-gray-700 border-none focus:ring-0 resize-none bg-transparent placeholder-gray-400 min-h-[60px]"
                      placeholder="Pregunta a SVX Copilot sobre variaciones de precios o SKUs específicos..."
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

                  <div className="px-4 py-3 bg-white flex justify-between items-center border-t border-gray-50">
                    <div className="flex items-center gap-4 text-gray-400">
                      <Plus size={20} className="cursor-pointer hover:text-[#464775] transition-colors" />
                      <Mic size={20} className="cursor-pointer hover:text-[#464775] transition-colors" />
                    </div>
                    <button 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-xs transition-all
                      ${inputMessage.trim() && !isTyping 
                        ? 'bg-[#464775] text-white hover:bg-[#3a3b61] shadow-lg shadow-[#464775]/20' 
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                    >
                      <span>Enviar Consulta</span>
                      <ArrowRight size={16} />
                    </button>
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E2E2; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C8C8C8; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { transform: scale(0.98); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default EjecutorAgente;