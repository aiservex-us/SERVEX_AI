"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { marked } from "marked";
import {
  Plus, Mic, ChevronDown, Database, Sparkles,
  Check, Settings, HelpCircle, Zap, SendHorizonal,
  Brain, Shield, Activity, Cpu
} from 'lucide-react';

const CONTEXTS = ['Servex US', 'Servex LATAM', 'General HQ'];

const QUICK_PROMPTS = [
  { icon: Shield,   label: "RBAC Permissions",    q: "How do I configure RBAC permissions on the platform?" },
  { icon: Activity, label: "ETL Flows",        q: "Explain the architecture of the available ETL flows." },
  ];

export default function TeamsAgentChat() {
  const [selectedAgent] = useState({ agent_name: "SVX Copilot", role: "AI Engine" });
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [context, setContext]       = useState('Servex US');
  const [charCount, setCharCount]   = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://generative-glynne-motor.onrender.com";

  useEffect(() => { inputRef.current?.focus(); }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setCharCount(e.target.value.length);
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
      const res  = await fetch(`${apiURL}/dynamic/agent/chat/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: queryToSend, agent_config: selectedAgent }),
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="w-full h-[88vh] flex flex-col bg-white font-sans text-gray-900 overflow-hidden">

      {/* ── TOP BAR ── */}
      <header className="h-[52px] flex-shrink-0 flex items-center justify-between px-5 bg-white border-b border-gray-100 z-50">
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
              onClick={() => setMessages([])}
              className="text-[11px] font-medium text-gray-400 border border-gray-200 px-2.5 py-1 rounded-lg hover:border-red-200 hover:text-red-400 hover:bg-red-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
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
                  {/* Orb */}
                  <div className="relative w-16 h-16 mx-auto mb-7 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl bg-indigo-100 border border-indigo-300 orb-ring-1" />
                    <div className="absolute -inset-3 rounded-[20px] border border-indigo-200/50 orb-ring-2" />
                    <Brain size={28} className="text-indigo-500 relative z-10" />
                  </div>

           <h1 className="text-[32px] font-bold tracking-tight text-[#464775] leading-tight mb-3">
  I am Alysa
</h1>
               <h2 className="text-[14px] ">
                        (AI Autonomous Logic & Yield System Architect.)
               </h2>
                </motion.div>

                {/* Metrics */}
                <motion.div
                  className="flex mt-8 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {[
                    { label: "Documents",  value: "Servex client" },
                    { label: "Accuracy", value: "98.4%" },
                    { label: "Sync",  value: "Real-time" },
                  ].map((m, i) => (
                    <div key={m.label} className={`flex-1 flex flex-col gap-1 py-4 px-6 text-center ${i < 2 ? 'border-r border-gray-100' : ''}`}>
                      <span className="text-s font-bold tracking-tight text-gray-900">{m.value}</span>
                      <span className="text-[11px] text-gray-400">{m.label}</span>
                    </div>
                  ))}
                </motion.div>
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
                      className="flex flex-col items-start gap-1.5 p-3.5 rounded-xl bg-white border border-gray-100 text-left hover:border-indigo-200 hover:bg-indigo-50/40 hover:-translate-y-px hover:shadow-md transition-all duration-200 group"
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
                      key={idx}
                      initial={{ opacity: 0, y: 18, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`relative w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[9px] font-bold
                        ${isUser
                          ? 'bg-gray-100 text-gray-500 border border-gray-200'
                          : 'bg-indigo-50 text-indigo-500 border border-indigo-200'
                        }`}
                      >
                        {isUser ? 'YOU' : <Brain size={15} />}
                        {!isUser && (
                          <span className="absolute -inset-1 rounded-[14px] border border-indigo-300/50 avatar-pulse" />
                        )}
                      </div>

                      {/* Bubble col */}
                      <div className={`flex flex-col max-w-[78%] gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-baseline gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[12px] font-semibold text-gray-800">
                            {isUser ? 'You' : selectedAgent.agent_name}
                          </span>
                          <span className="text-[10px] text-gray-400">{msg.time}</span>
                        </div>

                        <div className={`px-4 py-3 rounded-xl text-[13.5px] leading-relaxed border
                          ${isUser
                            ? 'bg-indigo-50/70 border-indigo-100 text-gray-900 rounded-tr-sm'
                            : 'bg-white border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
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
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-start"
                >
                  <div className="relative w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-indigo-50 text-indigo-500 border border-indigo-200">
                    <Brain size={15} />
                    <span className="absolute -inset-1 rounded-[14px] border border-indigo-300/50 avatar-pulse" />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12px] font-semibold text-gray-800">{selectedAgent.agent_name}</span>
                      <span className="text-[10px] text-gray-400 animate-pulse">Processing…</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-3 bg-white border border-gray-100 rounded-xl rounded-tl-sm shadow-sm">
                      {[0, 160, 320].map(delay => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400 dot-bounce"
                          style={{ animationDelay: `${delay}ms` }}
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
      <footer className="flex-shrink-0 px-5 py-3 pb-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-[820px] mx-auto bg-white border border-gray-200 rounded-2xl relative focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-sm">

          {/* Meta row */}
          <div
            className="flex items-center justify-between px-3.5 py-2 border-b border-gray-100"
            onClick={() => setIsDropdownOpen(false)}
          >
            <div className="flex items-center gap-2.5">
              {/* Context selector */}
              <div
                className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors"
                onClick={e => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
              >
                <Database size={12} className="text-indigo-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Context</span>
                <span className="text-[11px] font-semibold text-gray-700">{context}</span>
                <ChevronDown
                  size={12}
                  className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                />

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[calc(100%+6px)] left-0 w-44 bg-white border border-gray-200 rounded-xl overflow-hidden z-50 shadow-xl"
                    >
                      {CONTEXTS.map(ctx => (
                        <button
                          key={ctx}
                          onClick={() => { setContext(ctx); setIsDropdownOpen(false); }}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-[12px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          {ctx}
                          {context === ctx && <Check size={13} className="text-indigo-500" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-px h-4 bg-gray-200" />

              <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                <Zap size={11} className="text-amber-400" />
                Engine v4.10
              </div>
            </div>

            {charCount > 0 && (
              <span className="text-[10px] text-gray-400">{charCount}</span>
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
                { icon: Plus,        title: "Attach" },
                { icon: Mic,         title: "Voice" },
                { icon: HelpCircle,  title: "Help" },
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
          SVX Copilot can make mistakes · Verify critical information with official sources
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