"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Mic, ChevronDown, Database, Sparkles,
  ArrowRight, Check, BarChart3, 
  Settings, HelpCircle, Shield, Layout, Zap, User, Bot, Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TeamsCopilotStyle = () => {
  const [mode, setMode] = useState('platform');
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [context, setContext] = useState('Servex US');
  
  // Nativos del Chat
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // Cargar Historial
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/general_agent/history');
        if (res.ok) {
          const data = await res.json();
          if (data.history) setMessages(data.history);
        }
      } catch (e) {
        console.error("Error cargando historial", e);
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async (textToSend = query) => {
    if (!textToSend.trim() || isLoading) return;
    
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { from: 'user', text: textToSend, time: nowStr };
    const newRawMessages = [...messages, userMsg];
    
    setMessages(newRawMessages);
    setQuery('');
    setIsLoading(true);

    try {
      // Convertir para Langchain
      const langchainMsgs = newRawMessages.map(m => ({
        role: m.from === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const payload = {
        messages: langchainMsgs,
        raw_messages: newRawMessages
      };

      const res = await fetch('http://localhost:8000/api/v1/general_agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newRawMessages, { from: 'bot', text: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      } else {
        throw new Error("Server Error");
      }
    } catch (e) {
      setMessages([...newRawMessages, { from: 'bot', text: 'Error connecting to Alysa. Please ensure the backend is running.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-[90vh] bg-[#FFF] flex flex-col font-sans text-gray-800">
      {/* --- TOP BAR --- */}
      <div className="h-12 bg-[#FFF] w-full flex items-center justify-between px-4 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded p-0.5">
            <img src="/logo2.png" alt="SVX" className="h-5 w-auto" />
          </div>
          <span className="text-sm font-semibold opacity-90 tracking-tight text-gray-800">
            SVX Copilot Intelligence
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#464775] px-3 py-1 rounded text-[11px] font-medium text-white shadow-sm">
            Alysa Mode
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 mt-2 max-w-5xl mx-auto w-full relative">
        
        {/* CONDICIONAL: Mostrar bienvenida si no hay mensajes */}
        {messages.length === 0 ? (
          <div className="w-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-2 text-[#464775] mb-2">
               <Sparkles size={18} fill="#464775" fillOpacity={0.2} />
               <span className="text-xs font-bold uppercase tracking-wider">
                 Contextual Assistance Center
               </span>
             </div>
             <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
               Welcome to Servex Copilot
             </h1>
             <p className="text-sm text-gray-500 max-w-2xl font-normal mb-8">
               I am Alysa, your AI guide. I can help you understand the platform, guide you through processes, or analyze data.
             </p>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
               <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                 <Layout size={20} className="text-[#464775] mb-3 group-hover:scale-110 transition-transform" />
                 <h3 className="text-sm font-bold mb-1 tracking-tight">Platform Guide</h3>
                 <p className="text-xs text-gray-500 leading-relaxed font-normal">
                   Step-by-step instructions for workflows and updates.
                 </p>
               </div>
               <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                 <BarChart3 size={20} className="text-[#464775] mb-3 group-hover:scale-110 transition-transform" />
                 <h3 className="text-sm font-bold mb-1 tracking-tight">Data Analytics</h3>
                 <p className="text-xs text-gray-500 leading-relaxed font-normal">
                   Queries on inventory flux and price variations.
                 </p>
               </div>
               <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                 <Shield size={20} className="text-[#464775] mb-3 group-hover:scale-110 transition-transform" />
                 <h3 className="text-sm font-bold mb-1 tracking-tight">Secure Context</h3>
                 <p className="text-xs text-gray-500 leading-relaxed font-normal">
                   Answers strictly grounded in 2026 SVX corporate context.
                 </p>
               </div>
             </div>
             
             <div className="mt-8 flex flex-wrap gap-3 items-center">
               <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                 Suggestions:
               </span>
               {["What is SERVEX AI?", "How does the XML injection work?", "Who is Alysa?"].map((tip, i) => (
                 <button 
                   key={i}
                   onClick={() => handleSend(tip)}
                   className="text-xs bg-gray-50 border border-gray-200 text-[#464775] px-3 py-1.5 rounded-full hover:bg-[#464775] hover:text-white transition-colors font-medium shadow-sm"
                 >
                   {tip}
                 </button>
               ))}
             </div>
          </div>
        ) : (
          <div className="w-full flex-1 overflow-y-auto mb-6 pr-4 space-y-6 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm ${msg.from === 'user' ? 'bg-[#464775] text-white' : 'bg-gradient-to-br from-indigo-100 to-[#EFEFFB] text-[#464775] border border-indigo-200'}`}>
                    {msg.from === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col gap-1 ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-gray-400 font-bold px-1 tracking-wide">{msg.from === 'user' ? 'YOU' : 'ALYSA SVX'} • {msg.time}</span>
                    <div className={`px-5 py-3.5 rounded-2xl text-[13px] shadow-sm font-medium leading-relaxed
                      ${msg.from === 'user' 
                        ? 'bg-[#464775] text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'}`}>
                      {msg.from === 'bot' ? (
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-a:text-[#464775] prose-strong:text-[#464775]">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-[#EFEFFB] text-[#464775] border border-indigo-200 flex items-center justify-center">
                    <Sparkles size={14} />
                  </div>
                  <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[#464775]" />
                    <span className="text-xs text-gray-400 font-semibold">Alysa is processing your query...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* --- STICKY INPUT BOX --- */}
        <div className="w-full mt-auto bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden transition-all focus-within:border-[#464775] focus-within:ring-2 focus-within:ring-[#464775]/20">
          
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/50 border-b border-gray-100 relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-[11px] font-bold text-gray-600 bg-white border border-gray-200 shadow-sm px-2.5 py-1 rounded hover:bg-gray-50 transition-colors"
            >
              <Database size={12} className="text-[#464775]" />
              {context}
              <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-9 left-4 w-48 bg-white border border-gray-200 shadow-xl rounded-lg z-50 py-1">
                {['Servex US', 'Servex LATAM', 'General HQ'].map((ctx) => (
                  <button 
                    key={ctx}
                    onClick={() => { setContext(ctx); setIsDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 flex justify-between items-center transition-colors font-medium text-gray-700"
                  >
                    {ctx}
                    {context === ctx && <Check size={14} className="text-[#464775]" />}
                  </button>
                ))}
              </div>
            )}
            <div className="h-4 w-[1px] bg-gray-200 mx-1" />
            <div className="flex items-center gap-1.5 text-[10px] text-[#464775] font-bold tracking-tight">
              <Zap size={10} className="fill-[#464775]" />
              SVX ALYSA KNOWLEDGE
            </div>
          </div>

          <div className="p-3 bg-white">
            <textarea 
              className="w-full text-[13px] text-gray-800 border-none focus:ring-0 resize-none bg-transparent placeholder-gray-400 min-h-[60px] max-h-[200px] font-medium"
              placeholder="Ask Alysa anything about the platform..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-50 bg-white">
            <div className="flex items-center gap-3 text-gray-400">
              <button className="hover:text-[#464775] hover:bg-indigo-50 p-1.5 rounded-md transition-colors"><Plus size={16} /></button>
              <button className="hover:text-[#464775] hover:bg-indigo-50 p-1.5 rounded-md transition-colors"><Mic size={16} /></button>
            </div>
            <button 
              onClick={() => handleSend()}
              disabled={!query.trim() || isLoading}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-sm
              ${query.trim() && !isLoading
                ? 'bg-[#464775] text-white hover:bg-[#3a3b61] hover:shadow-md' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
            >
              <span>{isLoading ? 'Processing...' : 'Send Query'}</span>
              {!isLoading && <ArrowRight size={14} />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamsCopilotStyle;