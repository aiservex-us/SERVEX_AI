"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { marked } from "marked";
import {
  Plus, Mic, ChevronDown, Database, Sparkles,
  Check, Settings, HelpCircle, Zap, SendHorizonal,
  Brain, Shield, Activity, Cpu, BarChart2, Trash2, RefreshCw, Search
} from 'lucide-react';

const CONTEXTS = ['Servex US', 'Servex LATAM', 'General HQ'];

const SLASH_COMMANDS = [
  { id: 'resumen', icon: BarChart2, label: '/resumen', desc: 'Ver resumen métrico y top variaciones' },
  { id: 'bajas', icon: Trash2, label: '/bajas', desc: 'Ver lista de productos eliminados' },
  { id: 'altas', icon: Plus, label: '/altas', desc: 'Ver lista de productos agregados' },
  { id: 'cambios', icon: RefreshCw, label: '/cambios', desc: 'Ver todas las modificaciones' },
  { id: 'modelo', icon: Search, label: '/modelo ', desc: 'Buscar un SKU específico' },
  { id: 'execute', icon: Cpu, label: '/executeProcess', desc: 'Restructurar XML y comparar catálogo (Step 2)' },
];

const QUICK_PROMPTS = [
  { icon: Shield, label: "RBAC Permissions", q: "How do I configure RBAC permissions on the platform?" },
  { icon: Activity, label: "ETL Flows", q: "Explain the architecture of the available ETL flows." },
];

export default function TeamsAgentChat({ currentSection }) {
  const [selectedAgent] = useState({ agent_name: "SVX Copilot", role: "AI Engine" });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [context, setContext] = useState('Servex US');
  const [charCount, setCharCount] = useState(0);
  const [showSlashMenu, setShowSlashMenu] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://servex-ai-back.onrender.com";

  useEffect(() => {
    const fetchHistory = async () => {
  
    if (queryToSend === '/executeProcess') {
      window.dispatchEvent(new Event('executeProcessCommand'));
    }

    try {
        const res = await fetch(`${apiURL}/wbd/api/v1/agent/history`);
        const data = await res.json();
        if (data.status === "success" && data.history) {
          setMessages(data.history);
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    };
    fetchHistory();
  }, [apiURL]);


  useEffect(() => { inputRef.current?.focus(); }, []);

  const scrollContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    setCharCount(val.length);
    if (val === "/") {
      setShowSlashMenu(true);
    } else if (!val.startsWith("/")) {
      setShowSlashMenu(false);
    }
  };

  const handleCommandSelect = (cmdLabel) => {
    setInput(cmdLabel);
    setCharCount(cmdLabel.length);
    setShowSlashMenu(false);
    inputRef.current?.focus();
  };

  const sendMessage = async (overrideText) => {
    const queryToSend = (overrideText || input).trim();
    if (!queryToSend || isLoading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { from: "user", text: queryToSend, time: now }]);
    setInput("");
    setCharCount(0);
    setIsLoading(true);

    try {
      // Mapear el historial de mensajes al formato esperado por el backend
      const historyPayload = messages.map(msg => ({
        role: msg.from === "user" ? "user" : "assistant",
        content: msg.text
      }));
      // Agregar el mensaje actual
      historyPayload.push({ role: "user", content: queryToSend });

      const res = await fetch(`${apiURL}/wbd/api/v1/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyPayload, raw_messages: [...messages, { from: "user", text: queryToSend, time: now }], company_name: context, current_section: currentSection }),
      });
      const data = await res.json();
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { from: "bot", text: data?.reply || "No response received.", time: botTime }]);
    } catch {
      setMessages(prev => [...prev, { from: "bot", text: "❌ Connection error.", time: "--:--" }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); setShowSlashMenu(false); }
    if (e.key === 'Escape') { setShowSlashMenu(false); }
  };

  return (
    <div className="relative w-full h-[88vh] flex flex-col font-sans text-gray-900 overflow-hidden">
      {/* --- FONDO ESTILO MAIN1 (SIN ANIMACIONES) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="/fondo.jpg" alt="Background" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-[#464775]/5 to-[#464775]/15" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/10 to-transparent border-l border-white/60 shadow-[1px_0_10px_rgba(0,0,0,0.03)]" />
        </div>
        <div className="absolute top-[5%] right-[15%] w-[40%] h-[100%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/5 to-transparent border-l border-white/50" />
        </div>
      </div>

      {/* ── TOP BAR ── */}
      <header className="relative z-10 h-[52px] flex-shrink-0 flex items-center justify-between px-5 bg-white/60 backdrop-blur-md border-b border-white/50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center">
            <img src="/logo2.png" alt="SVX" className="h-4 w-auto" />
          </div>
          <div className="flex flex-col gap-0">
            <span className="text-[13px] font-semibold tracking-tight text-gray-900 leading-none">SVX Copilot</span>

          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400  animate-pulse" />
            Engine v4.10 · Online
          </div>

          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <Settings size={15} />
          </button>
          {messages.length > 0 && (
            <button
              onClick={async () => {
                setMessages([]);
                try {
                  await fetch(`${apiURL}/wbd/api/v1/agent/history`, { method: "DELETE" });
                } catch (e) {}
              }}
              className="text-[11px] font-medium text-gray-400 border border-gray-200 px-2.5 py-1 rounded-lg hover:border-red-200 hover:text-red-400 hover:bg-red-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main ref={scrollContainerRef} className="relative z-10 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent">
        <div className="w-full max-w-[820px] mx-auto flex flex-col px-5 min-h-full">

          {messages.length === 0 ? (

            /* ── HOME ── */
            <div className="flex flex-col flex-1 pt-10 pb-5">

              {/* Hero */}
              <div className="relative text-center mb-10">
                {/* glow background */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-96 h-64  rounded-full blur-3xl pointer-events-none" />

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex justify-center mb-4 mt-2">
                    <img src="/alysa.png" alt="Alysa Logo" className="h-33 w-auto object-contain" />
                  </div>

                  <h2 className="text-[12px] text-gray-400 font-medium">
                    (AI Autonomous Logic & Yield System Architect.)
                  </h2>
                </motion.div>

                {/* Metrics with living shadow */}
                <div className="relative mx-auto max-w-sm mt-6">
                  {/* Glowing background */}
                  <motion.div
                    className="absolute inset-0 bg-indigo-400/30 rounded-[30px] blur-[20px]"
                    animate={{
                      scale: [0.95, 1.05, 0.95],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  <motion.div
                    className="relative z-10 flex border border-white/60 rounded-xl overflow-hidden bg-white/60 backdrop-blur-md shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {[
                      { label: "Documents", value: "Servex client" },
                      { label: "Accuracy", value: "98.4%" },
                      { label: "Sync", value: "Real-time" },
                    ].map((m, i) => (
                      <div key={m.label} className={`flex-1 flex flex-col gap-0.5 py-3 px-4 text-center ${i < 2 ? 'border-r border-white/50' : ''}`}>
                        <span className="text-[12px] font-semibold tracking-tight text-gray-700">{m.value}</span>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">{m.label}</span>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Quick prompts */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Frequent Queries
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map(({ icon: Icon, label, q }) => (
                    <button
                      key={label}
                      onClick={() => sendMessage(q)}
                      className="flex flex-col items-start gap-1.5 p-3.5 rounded-xl bg-white/60 backdrop-blur-md border border-white/50 text-left hover:border-indigo-200 hover:bg-white/80 hover:-translate-y-px hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                        <Icon size={15} />
                      </div>
                      <span className="text-[12px] font-semibold text-gray-800">{label}</span>
                      <span className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{q}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

          ) : (

            /* ── MESSAGES ── */
            <div className="flex flex-col gap-6 py-7">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                  const isUser = msg.from === 'user';
                  return (
                    <motion.div
                      layout
                      key={idx}
                      initial={{ opacity: 0, y: 20, x: isUser ? 20 : -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        ease: [0.23, 1, 0.32, 1],
                        layout: { duration: 0.3, ease: "easeOut" }
                      }}
                      className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <motion.div 
                        whileHover={{ scale: 1.05, rotate: isUser ? 5 : -5 }}
                        className={`relative w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[9px] font-bold shadow-sm z-10
                        ${isUser
                          ? 'bg-slate-100 text-slate-500 border border-slate-200'
                          : 'bg-[#464775] text-white'
                        }`}
                      >
                        {isUser ? 'YOU' : <Brain size={15} />}
                        {!isUser && (
                          <span className="absolute -inset-1 rounded-[14px] border border-[#464775]/40 animate-pulse" />
                        )}
                      </motion.div>

                      {/* Bubble col */}
                      <div className={`flex flex-col max-w-[78%] gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-baseline gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[12px] font-semibold text-gray-800">
                            {isUser ? 'You' : selectedAgent.agent_name}
                          </span>
                          <span className="text-[10px] text-gray-400">{msg.time}</span>
                        </div>

                        <motion.div 
                          whileHover={{ y: -1 }}
                          className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm relative
                          ${isUser
                            ? 'bg-[#464775] text-white rounded-tr-sm border border-[#464775]'
                            : 'bg-white/80 backdrop-blur-md text-gray-800 rounded-tl-sm border border-white/60'
                          }`}
                        >
                          {msg.from === "bot" ? (
                            <div
                              className="prose-light"
                              dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                            />
                          ) : (
                            <p className="whitespace-pre-wrap m-0">{msg.text}</p>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="flex gap-3 items-start"
                >
                  <motion.div 
                    initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                    className="relative w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-[#464775] text-white shadow-sm"
                  >
                    <Brain size={15} />
                    <span className="absolute -inset-1 rounded-[14px] border border-[#464775]/40 animate-pulse" />
                  </motion.div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12px] font-semibold text-gray-800">{selectedAgent.agent_name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Pensando...</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-3.5 bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl rounded-tl-sm shadow-sm">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0.3, y: 0 }}
                          animate={{ opacity: 1, y: [-2, 2, -2] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.15
                          }}
                          className="w-1.5 h-1.5 rounded-full bg-[#464775]"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </main>

      {/* ── INPUT ── */}
      <footer className="relative z-10 flex-shrink-0 px-5 py-3 pb-4 bg-white/40 backdrop-blur-md border-t border-white/50">
        {/* ── SLASH COMMANDS MENU ── */}
        <AnimatePresence>
          {showSlashMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-[calc(100%+8px)] left-0 right-0 mx-auto max-w-[820px] bg-white/80 backdrop-blur-md border border-white/60 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50 mb-1">
                  Comandos de Auditoría
                </div>
                {SLASH_COMMANDS.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleCommandSelect(cmd.label)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500">
                      <cmd.icon size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-semibold text-gray-700 group-hover:text-indigo-700">{cmd.label}</span>
                      <span className="text-[11px] text-gray-400 group-hover:text-indigo-400">{cmd.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-[820px] mx-auto bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl relative focus-within:border-indigo-400 shadow-sm">

          {/* Meta row */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/40 border-b border-white/50 rounded-t-2xl">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <Zap size={12} className="text-indigo-400" />
              <span>Engine v4.10</span>
            </div>

            {charCount > 0 && (
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                {charCount}
              </span>
            )}
          </div>

          {/* Textarea */}
          <div className="flex items-start gap-2 px-3.5 pt-3 pb-1">
            <Sparkles size={15} className="text-indigo-400 mt-0.5 flex-shrink-0 opacity-70" />
            <textarea
              ref={inputRef}
              rows={3}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[14px] text-gray-800 placeholder-gray-400 leading-relaxed min-h-[56px] max-h-[180px] caret-indigo-500 font-sans"
              placeholder="Ask about processes, data, or system architecture…"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-3.5 py-2">
            <div className="flex items-center gap-0.5">
              {[
                { icon: Plus, title: "Attach" },
                { icon: Mic, title: "Voice" },
                { icon: HelpCircle, title: "Help" },
              ].map(({ icon: Icon, title }) => (
                <button
                  key={title}
                  title={title}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200
                ${input.trim() && !isLoading
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200 hover:bg-indigo-600 hover:-translate-y-px'
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <SendHorizonal size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center mt-2.5 text-[10px] text-gray-400 tracking-wide">
          © 2026 GLYNNE S.A.S. All rights reserved. Creators and developers of SVX Copilot and its underlying processes.
        </p>
      </footer>

      {/* Keyframe animations solo (no CSS de layout/color) */}
      <style jsx global>{`
        .orb-ring-1 { animation: orb-pulse 3s ease-in-out infinite; }
        .orb-ring-2 { animation: orb-pulse 3s ease-in-out infinite 0.6s; }
        .avatar-pulse { animation: avatar-pulse 2.5s ease-in-out infinite; }
        .dot-bounce   { animation: dot-bounce 1.2s ease-in-out infinite; }

        @keyframes orb-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.08); }
        }
        @keyframes avatar-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0;   transform: scale(1.25); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0);   opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }

        /* Prose markdown — clases de Tailwind no alcanzan innerHTML */
        .prose-light { font-size: 13.5px; line-height: 1.7; color: #1f2937; }
        .prose-light p  { margin: 0 0 10px; }
        .prose-light p:last-child { margin-bottom: 0; }
        .prose-light strong { color: #3730a3; font-weight: 600; }
        .prose-light a  { color: #6366f1; text-decoration: underline; text-underline-offset: 2px; }
        .prose-light code {
          font-size: 12px; font-family: 'JetBrains Mono', monospace;
          background: #eef2ff; color: #4f46e5;
          padding: 2px 6px; border-radius: 4px;
          border: 1px solid #c7d2fe;
        }
        .prose-light pre {
          background: #f8faff; border: 1px solid #e0e7ff;
          padding: 14px; border-radius: 8px; overflow-x: auto; margin: 10px 0;
        }
        .prose-light pre code { background: transparent; border: none; color: #374151; padding: 0; }
        .prose-light ul { list-style: none; padding: 0; margin: 8px 0; }
        .prose-light ul li { padding-left: 16px; position: relative; margin-bottom: 4px; }
        .prose-light ul li::before {
          content: ''; position: absolute; left: 0; top: 9px;
          width: 5px; height: 5px; border-radius: 50%; background: #6366f1;
        }
        .prose-light ol { padding-left: 20px; margin: 8px 0; }
        .prose-light h1, .prose-light h2, .prose-light h3 {
          color: #111827; font-weight: 600; margin: 16px 0 8px; letter-spacing: -0.02em;
        }

        @media (prefers-reduced-motion: reduce) {
          .orb-ring-1, .orb-ring-2, .avatar-pulse, .dot-bounce { animation: none; }
        }
      `}</style>
    </div>
  );
}