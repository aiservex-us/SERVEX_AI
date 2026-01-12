import React, { useState, useRef, useEffect } from 'react';
import * as PH from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { marked } from "marked";
import { 
  Sparkles, Layout, BarChart3, Shield, 
  SendHorizontal, Paperclip, Mic, Trash2, AlertCircle,
  Database, ChevronDown, Check, Zap, Info
} from 'lucide-react';

const Viewport = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mode, setMode] = useState('platform');
  const [context, setContext] = useState('Servex US');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const messagesEndRef = useRef(null);

  const confirmClearChat = () => {
    setMessages([]);
    setShowDeleteConfirm(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage = {
      from: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: 'bot',
        text: "I'm processing your request using the **2026 official documentation**. How else can I assist you with the SVX project?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsLoading(false);
    }, 1500);
  };

  const isChatActive = messages.length > 0;

  return (
    <main className="flex-1 flex flex-col relative bg-[#FFF] h-[100%] font-sans overflow-hidden">
      
      {/* --- MODAL DE CONFIRMACIÓN --- */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white rounded-xl shadow-2xl border border-[#EDEBE9] w-full max-w-[400px] overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4 text-[#C4314B]">
                  <AlertCircle size={22} strokeWidth={2.5} />
                  <h3 className="text-[17px] font-bold tracking-tight text-[#242424]">Clear conversation?</h3>
                </div>
                <p className="text-[14px] text-[#605E5C] leading-relaxed font-medium">
                  This will delete all messages in this session. This action is permanent.
                </p>
              </div>
              <div className="flex gap-2 p-4 bg-[#F5F5F5] justify-end">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-2 text-[12px] font-bold text-[#242424] bg-white border border-[#D1D1D1] rounded-md hover:bg-[#F0F0F0] uppercase tracking-wider">Cancel</button>
                <button onClick={confirmClearChat} className="px-5 py-2 text-[12px] font-bold text-white bg-[#C4314B] rounded-md hover:bg-[#A4263D] uppercase tracking-wider">Delete all</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <header className="h-10 flex items-center justify-between px-6 bg-[#FFFFFF] border-b border-[#EDEBE9] z-20">
        <div className="flex bg-[#F3F2F1] rounded p-0.5 border border-[#EDEBE9]">
          <button className="px-3 py-0.5 text-[10px] font-bold bg-[#FFFFFF] shadow-sm text-[#242424] rounded-sm uppercase">Context</button>
          <button className="px-3 py-0.5 text-[10px] font-bold text-[#605E5C] uppercase">Analizer</button>
        </div>
        <div className="text-[11px] font-medium text-[#605E5C]">
          Project / <span className="text-[#464775] font-bold">SVX copilot v1.2</span>
        </div>
        <div className="flex items-center gap-2">
          {isChatActive && (
            <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-all mr-1"><Trash2 size={16} /></button>
          )}
          <div className="w-6 h-6 rounded-full bg-[#EDEBE9] flex items-center justify-center text-[#464775]"><PH.User size={14} weight="bold" /></div>
          <button className="bg-[#464775] text-white px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 shadow-sm">EXPORT <PH.DownloadSimple size={14} weight="bold" /></button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 m-2 rounded-xl border border-[#EDEBE9] shadow-sm relative overflow-hidden bg-white flex flex-col">
        
        {/* Background Animation (solo si no hay chat) */}
        {!isChatActive && (
          <div className="absolute inset-0 z-0 flex items-center justify-center" style={{ backgroundImage: "url('/ball3.gif')", backgroundSize: '50%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[0px]"></div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto z-10">
          {isChatActive ? (
            /* --- CHAT VIEW --- */
            <div className="max-w-4xl mx-auto space-y-8 w-full px-4 py-10">
              {messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 w-full ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${msg.from === 'user' ? 'bg-slate-700' : 'bg-[#464775]'}`}>{msg.from === 'user' ? 'ME' : 'AI'}</div>
                  <div className={`flex flex-col max-w-[85%] ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-baseline gap-2 mb-1 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="font-bold text-[12px] text-slate-700">{msg.from === 'user' ? 'You' : 'Copilot'}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-[13.5px] leading-relaxed border shadow-sm ${msg.from === 'user' ? 'bg-white border-slate-200 text-slate-700 rounded-tr-none' : 'bg-[#464775] border-[#464775] text-white rounded-tl-none'}`}>
                      {msg.from === "bot" ? <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} /> : <p className="whitespace-pre-wrap">{msg.text}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && <div className="flex gap-4 animate-pulse"><div className="w-9 h-9 rounded-xl bg-slate-200"></div><div className="h-12 w-24 bg-white border border-slate-200 rounded-2xl rounded-tl-none"></div></div>}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* --- EMPTY STATE (TEAMS STYLE) --- */
            <div className="w-full max-w-4xl mx-auto pt-10 px-6 flex flex-col relative z-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-8 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-2 text-[#464775] mb-2">
                  <Sparkles size={18} fill="#464775" fillOpacity={0.2} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Contextual Assistance Center</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Servex Copilot</h1>
                <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
                  Learn processes, resolve platform questions, or analyze critical data. Synchronized with official 2026 documentation.
                </p>
              </div>

        

            </div>
          )}
        </div>

        {/* --- INPUT BOX --- */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-30 transition-all duration-500 ${!isChatActive ? 'translate-y-0' : 'translate-y-0'}`}>
          <form onSubmit={handleSendMessage} className="bg-white border border-[#EDEBE9] rounded-xl shadow-2xl flex flex-col overflow-hidden focus-within:ring-1 focus-within:ring-[#464775]/20">
            
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 relative">
              <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 text-[10px] font-bold text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">
                <Database size={12} className="text-[#464775]" /> CONTEXT: {context} <ChevronDown size={10} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-9 left-4 w-40 bg-white border border-gray-200 shadow-xl rounded z-50 py-1">
                  {['Servex US', 'Servex LATAM'].map((ctx) => (
                    <button key={ctx} type="button" onClick={() => {setContext(ctx); setIsDropdownOpen(false)}} className="w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50 flex justify-between items-center">{ctx} {context === ctx && <Check size={10} className="text-[#464775]" />}</button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold ml-auto"><Zap size={10} className="text-yellow-500 fill-yellow-500" /> SVX ENGINE READY</div>
            </div>

            <div className="px-4 pt-3">
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={mode === 'platform' ? "How do I configure permissions?" : "Show me the purchase report..."}
                className="w-full bg-transparent border-none outline-none text-[14px] py-1 text-gray-700 placeholder:text-gray-400 resize-none min-h-[60px]"
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
              />
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-[#FAFBFC] border-t border-[#F3F2F1]">
              <div className="flex items-center gap-1">
                <button type="button" className="p-2 text-gray-400 hover:text-[#464775] rounded-lg"><Paperclip size={18} /></button>
                <button type="button" className="p-2 text-gray-400 hover:text-[#464775] rounded-lg"><Mic size={18} /></button>
              </div>
              <button type="submit" disabled={!inputValue.trim()} className="bg-[#464775] text-white px-5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#3b3c63] transition-all disabled:opacity-40 shadow-sm">
                SEND QUERY <SendHorizontal size={14} />
              </button>
            </div>
          </form>

        </div>
      </div>
    </main>
  );
};

export default Viewport;