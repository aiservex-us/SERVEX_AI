"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { marked } from "marked";
import { 
  Plus, Mic, ChevronDown, Database, Sparkles,
  ArrowRight, Check, BarChart3, 
  Settings, HelpCircle, Shield, Layout, Zap, SendHorizonal
} from 'lucide-react';

export default function TeamsAgentChat() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // States del diseño de Teams
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [context, setContext] = useState('Servex US');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://generative-glynne-motor.onrender.com";

  useEffect(() => {
    setSelectedAgent({ agent_name: "SVX Copilot", role: "AI Assistant" });
    // Enfocar el input al cargar
    inputRef.current?.focus();
  }, []);

  const scrollContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, []);

  useEffect(() => { 
    scrollToBottom(); 
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    const queryToSend = input.trim();
    if (!queryToSend || isLoading) return;

    const userMsg = { 
      from: "user", 
      text: queryToSend, 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${apiURL}/dynamic/agent/chat/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: queryToSend, agent_config: selectedAgent }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { 
        from: "bot", 
        text: data?.reply || "No recibí respuesta.",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { from: "bot", text: "❌ Error de conexión.", time: "--:--" }]);
    } finally {
      setIsLoading(false);
      // Re-enfocar el input después de enviar
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full h-[90vh] flex flex-col bg-[#F5F5F5] font-sans text-gray-800 relative overflow-hidden">
      
      {/* --- TOP BAR (Teams Style) --- */}
      <div className="h-12 bg-white w-full flex items-center justify-between px-4 text-[#242424] border-b border-[#EDEBE9] shrink-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo2.png" alt="SVX" className="h-5 w-auto" />
          <span className="text-sm font-semibold tracking-tight text-[#242424]">SVX Copilot Intelligence</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-0.5 rounded-full text-[11px] font-medium border border-[#E1DFDD] bg-[#FAF9F8] text-[#323130] tracking-wide">
            Enterprise Mode
          </div>
          
          <Settings size={16} className="text-[#616161] cursor-pointer hover:text-[#5B5FC7] transition-colors" />
          
          {messages.length > 0 && (
            <button 
              onClick={() => setMessages([])} 
              className="text-xs font-medium text-[#A4262C] hover:bg-[#FDF2F2] px-2.5 py-1 rounded transition-colors"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col bg-white">
        
        {/* Chat Container */}
        <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col">
          
          {messages.length === 0 ? (
            /* --- VISTA INICIAL --- */
            <div className="flex-1 flex flex-col px-6 py-10">
              {/* Header */}
              <div className="mb-8 border-b border-[#EDEBE9] pb-6">
                <div className="flex items-center gap-2.5 text-[#5B5FC7] mb-3">
                  <Sparkles size={20} className="fill-[#5B5FC7]/10" />
                  <span className="text-sm font-semibold tracking-wide">Centro de Asistencia Contextual</span>
                </div>
                <h1 className="text-2xl font-bold text-[#242424] mb-2">Bienvenido a Servex Copilot</h1>
                <p className="text-sm text-[#616161] max-w-2xl">
                  Consulta procesos, resuelve dudas de la plataforma o analiza datos críticos. Documentación 2025 sincronizada.
                </p>
              </div>

              {/* Grid de Información (Simplificado para el ejemplo) */}
              <div className="mb-10">
                <div className="bg-white p-5 rounded-lg border border-[#EDEBE9] shadow-sm hover:shadow-md transition-shadow duration-300 group cursor-pointer max-w-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-[#EFEEFC] rounded-lg group-hover:bg-[#5B5FC7] transition-colors duration-300">
                      <Layout size={22} className="text-[#5B5FC7] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B5FC7] bg-[#EFEEFC] px-2.5 py-1 rounded-full">
                      v2.4 Actualizado
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#242424] mb-1.5 group-hover:text-[#5B5FC7] transition-colors">
                    Guía de Arquitectura de Plataforma
                  </h3>
                  
                  <p className="text-xs text-[#616161] leading-relaxed">
                    Documentación central sobre flujos ETL, definiciones de roles RBAC y configuraciones de infraestructura.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* --- FLUJO DE CHAT (MENSAJES con Animación) --- */
            <div className="flex-1 px-6 py-8 space-y-8">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                  const isUser = msg.from === 'user';
                  return (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex gap-3.5 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-semibold shadow-sm ${isUser ? 'bg-[#464775]' : 'bg-[#5B5FC7]'}`}>
                        {isUser ? 'TÚ' : 'AI'}
                      </div>
                      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-baseline gap-2.5 mb-1.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className="font-semibold text-xs text-[#242424]">{isUser ? 'Tú' : selectedAgent?.agent_name}</span>
                          <span className="text-[11px] text-[#616161] font-normal">{msg.time}</span>
                        </div>
                        <div className={`px-4 py-3 rounded-xl text-[13px] leading-relaxed shadow-sm border ${isUser ? 'bg-[#EEF1FA] border-[#E1DFDD] text-[#242424] rounded-br-none' : 'bg-white border-[#EDEBE9] text-[#242424] rounded-bl-none'}`}>
                          {msg.from === "bot" ? (
                            <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:text-[#242424] prose-a:text-[#5B5FC7] prose-strong:text-[#242424]" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex gap-3.5 items-start">
                  <div className="w-9 h-9 rounded-full bg-[#5B5FC7] shrink-0 flex items-center justify-center">
                    <Sparkles size={16} className="text-white animate-pulse" />
                  </div>
                  <div className="flex flex-col items-start">
                     <span className="font-semibold text-xs text-[#242424] mb-1.5">{selectedAgent?.agent_name} está escribiendo...</span>
                    <div className="px-5 py-3 rounded-xl bg-white border border-[#EDEBE9] rounded-bl-none shadow-sm flex gap-1">
                      <div className="w-1.5 h-1.5 bg-[#C8C6C4] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#C8C6C4] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-[#C8C6C4] rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* --- FIXED INPUT BOX AT BOTTOM --- */}
        <div className="sticky bottom-0 w-full bg-white border-t border-[#EDEBE9] p-4 z-40">
          <div className="max-w-5xl mx-auto bg-white border border-[#C8C6C4] rounded-xl focus-within:border-[#5B5FC7] focus-within:ring-1 focus-within:ring-[#5B5FC7] transition-all shadow-sm">
            
            {/* Context & Engine Row */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#EDEBE9] bg-[#FAF9F8] rounded-t-xl relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                className="flex items-center gap-2 text-xs font-semibold text-[#323130] bg-white border border-[#E1DFDD] px-3 py-1 rounded-md hover:bg-[#F3F2F1] transition-colors"
              >
                <Database size={14} className="text-[#5B5FC7]" /> 
                <span className="opacity-60">CONTEXTO:</span> {context} 
                <ChevronDown size={14} className="ml-1 opacity-60" />
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-11 left-3 w-52 bg-white border border-[#E1DFDD] shadow-xl rounded-lg z-50 py-1.5"
                  >
                    {['Servex US', 'Servex LATAM', 'General HQ'].map((ctx) => (
                      <button 
                        key={ctx} 
                        onClick={() => { setContext(ctx); setIsDropdownOpen(false); }} 
                        className="w-full text-left px-3.5 py-2 text-sm hover:bg-[#F3F2F1] flex justify-between items-center text-[#323130]"
                      >
                        {ctx} {context === ctx && <Check size={16} className="text-[#5B5FC7]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="h-5 w-[1px] bg-[#E1DFDD] mx-1" />
              <div className="flex items-center gap-1.5 text-xs text-[#616161] font-medium">
                <Zap size={13} className="text-[#F9A826] fill-[#F9A826]" /> MOTOR v4.10 READY
              </div>
            </div>

            {/* Textarea */}
            <div className="px-1 pt-1">
              <textarea 
                ref={inputRef}
                rows="3"
                className="w-full p-3 text-sm text-[#242424] border-none focus:ring-0 resize-none bg-transparent placeholder-[#616161] min-h-[60px] max-h-[200px]"
                placeholder="Pregunta sobre procesos o datos (Ej: ¿Cómo configuro permisos RBAC?)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Action Buttons Row */}
            <div className="flex justify-between items-center px-3 py-2 rounded-b-xl">
              <div className="flex items-center gap-1.5 text-[#616161]">
                <button className="p-1.5 rounded hover:bg-[#F3F2F1] hover:text-[#5B5FC7] transition-colors">
                  <Plus size={19} />
                </button>
                <button className="p-1.5 rounded hover:bg-[#F3F2F1] hover:text-[#5B5FC7] transition-colors">
                  <Mic size={19} />
                </button>
                <button className="p-1.5 rounded hover:bg-[#F3F2F1] hover:text-[#5B5FC7] transition-colors">
                  <HelpCircle size={19} />
                </button>
              </div>
              
              <button 
                onClick={sendMessage} 
                disabled={!input.trim() || isLoading} 
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-xs transition-all duration-200 ${input.trim() && !isLoading ? 'bg-[#5B5FC7] text-white hover:bg-[#4E52B1] shadow' : 'bg-[#F3F2F1] text-[#A19F9D] border border-[#E1DFDD] cursor-not-allowed'}`}
              >
                <span>Enviar</span> 
                {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <SendHorizonal size={15} />
                )}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-[#616161] text-center mt-2.5 opacity-70">Copilot puede cometer errores. Verifica la información importante.</p>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E1DFDD; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C8C6C4; }
        
        /* Ajustes básicos de Markdown */
        .prose pre { background-color: #F3F2F1; color: #242424; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
        .prose code { color: #A4262C; background-color: #FDF2F2; padding: 0.1rem 0.3rem; border-radius: 0.25rem; font-size: 0.9em; }
        .prose pre code { color: inherit; background-color: transparent; padding: 0; }
        .prose ul { list-style-type: disc; padding-left: 1.25rem; }
        .prose ol { list-style-type: decimal; padding-left: 1.25rem; }
      `}</style>
    </div>
  );
}