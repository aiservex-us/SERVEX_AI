"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Mic, Trash2, StopCircle,
  Settings2, FileText, Lightbulb, Paperclip, Box,
  Smile, MoreHorizontal, Type, Bold, Italic
} from "lucide-react";
import { marked } from "marked";

// Configuración de Marked
marked.setOptions({ gfm: true, breaks: true });

export default function TeamsAgentChat() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://generative-glynne-motor.onrender.com";

  useEffect(() => {
    const envAgentConfig = {
      agent_name: process.env.NEXT_PUBLIC_AGENT_NAME || "SVX Copilot",
      role: "AI Assistant",
    };
    setSelectedAgent(envAgentConfig);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { 
      from: "user", 
      text: input, 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${apiURL}/dynamic/agent/chat/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: userMsg.text, agent_config: selectedAgent }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { 
        from: "bot", 
        text: data?.reply || "No recibí respuesta.",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { from: "bot", text: "❌ Error de conexión." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#f8fafc] font-sans text-slate-800 relative overflow-hidden">
      
      {/* HEADER DINÁMICO (Solo se muestra cuando hay chat activo) */}
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.header 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6264A7] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {selectedAgent?.agent_name?.charAt(0) || "S"}
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-700">{selectedAgent?.agent_name}</h2>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setMessages([])} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* CONTENEDOR DE MENSAJES */}
      <main className={`flex-1 overflow-y-auto px-4 md:px-8 custom-scrollbar ${messages.length === 0 ? 'flex items-center justify-center' : 'py-8'}`}>
        
        {messages.length === 0 ? (
          /* VISTA INICIAL: LOGO Y TEXTO */
          <div className="flex flex-col items-center mb-40">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-6"
            >
               <img src="/logo2.png" alt="Logo" className="w-32 h-32 object-contain opacity-20" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">SVX Client Copilot</h1>
            <p className="text-slate-500 text-sm max-w-sm text-center">
              How can I help your organization today? Start a conversation below.
            </p>
          </div>
        ) : (
          /* MENSAJES ACTIVOS */
          <div className="max-w-4xl mx-auto space-y-8 w-full">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 group"
              >
                <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${msg.from === 'user' ? 'bg-slate-700' : 'bg-[#6264A7]'}`}>
                  {msg.from === 'user' ? 'ME' : 'AI'}
                </div>
                
                <div className="flex flex-col max-w-[85%]">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-700">{msg.from === 'user' ? 'You' : selectedAgent?.agent_name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                  </div>
                  <div className={`p-4 rounded-2xl text-[13.5px] leading-relaxed border shadow-sm ${
                    msg.from === 'user' 
                    ? 'bg-white border-slate-200 text-slate-700 rounded-tr-none' 
                    : 'bg-[#6264A7] border-[#6264A7] text-white rounded-tl-none'
                  }`}>
                    {msg.from === "bot" ? (
                      <div className="prose prose-sm prose-invert max-w-none prose-p:leading-relaxed" 
                           dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-4 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-slate-200"></div>
                <div className="h-12 w-24 bg-white border border-slate-200 rounded-2xl rounded-tl-none"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* INPUT DINÁMICO */}
      <footer className={`p-4 transition-all duration-500 ${
        messages.length === 0 
        ? 'absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl' 
        : 'bg-white border-t border-slate-200 w-full sticky bottom-0 z-30'
      }`}>
        <div className={`mx-auto bg-white border border-slate-300/80 rounded-2xl shadow-xl transition-all duration-300 focus-within:border-[#6264A7] focus-within:ring-4 focus-within:ring-[#6264A7]/5 overflow-hidden`}>
          
          {/* Barra de formato (Solo visible en desktop o cuando hay texto) */}
          <div className="flex items-center gap-1 p-2 border-b border-slate-50 bg-slate-50/50">
             <div className="flex items-center gap-1 px-2 border-r border-slate-200 mr-2">
                <button className="p-1.5 text-slate-400 hover:text-[#6264A7] hover:bg-white rounded-md transition-all"><Type size={16} /></button>
                <button className="p-1.5 text-slate-400 hover:text-[#6264A7] hover:bg-white rounded-md transition-all"><Paperclip size={16} /></button>
             </div>
             <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 hover:border-[#6264A7] transition-all shadow-sm">
                  <FileText size={14} className="text-[#6264A7]" />
                  Researcher
                </button>
                <button className="p-1.5 text-slate-400 hover:text-[#6264A7] hover:bg-white rounded-md transition-all"><Lightbulb size={16} /></button>
             </div>
          </div>

          <div className="flex items-end p-2 gap-2">
            <textarea
              rows={messages.length === 0 ? 2 : 1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder="Ask anything to SVX Copilot..."
              className="flex-1 p-3 text-[14px] focus:outline-none resize-none bg-transparent"
            />
            
            <div className="flex items-center gap-1 mb-1 pr-1">
              <button onClick={() => setIsRecording(!isRecording)} className={`p-2.5 rounded-xl transition-all ${isRecording ? 'bg-red-50 text-red-500 shadow-inner' : 'text-slate-400 hover:bg-slate-50 hover:text-[#6264A7]'}`}>
                {isRecording ? <StopCircle size={18} /> : <Mic size={18} />}
              </button>
              
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-sm
                  ${input.trim() 
                    ? 'bg-[#6264A7] text-white hover:bg-[#4E52B1] scale-105 active:scale-95' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                `}
              >
                <Send size={18} className={input.trim() ? "translate-x-0.5 -translate-y-0.5 rotate-[-10deg]" : ""} />
              </button>
            </div>
          </div>
        </div>
        {messages.length === 0 && (
          <p className="text-[11px] text-center mt-4 text-slate-400 font-medium">
             Enter to send • Shift+Enter for new line
          </p>
        )}
      </footer>

      {/* Estilos CSS adicionales para el scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}