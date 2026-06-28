import React, { useState, useRef, useEffect } from 'react';
import * as PH from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { marked } from "marked";
import { 
  Sparkles, Layout, BarChart3, Shield, 
  SendHorizontal, Paperclip, Mic, Trash2, AlertCircle,
  Database, ChevronDown, Check, Zap, Info, X, FileText
} from 'lucide-react';

const Viewport = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mode, setMode] = useState('platform');
  const [context, setContext] = useState('Servex US');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // === NUEVO (NO MODIFICA NADA EXISTENTE) ===
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [userId] = useState(`USER-${Math.floor(Math.random() * 10000)}`);
  const messagesEndRef = useRef(null);

  const confirmClearChat = () => {
    setMessages([]);
    setAttachedFile(null);
    setShowDeleteConfirm(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ============================
  // 🎤 VOICE TO TEXT (REAL)
  // ============================
  const handleMicClick = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Tu navegador no soporta reconocimiento de voz.");
    return;
  }

  if (!recognitionRef.current) {
    const recognition = new SpeechRecognition();

    recognition.lang = "es-ES";
    recognition.continuous = false; // 👈 CLAVE
    recognition.interimResults = false;

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
      finalTranscript = "";
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
    };

    recognition.onend = () => {
      setIsListening(false);

      if (finalTranscript.trim()) {
        setInputValue(prev =>
          prev.trim()
            ? prev + " " + finalTranscript.trim()
            : finalTranscript.trim()
        );
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }

  // Toggle real
  if (isListening) {
    recognitionRef.current.stop();
  } else {
    recognitionRef.current.start();
  }
};


  // ============================
  // CSV
  // ============================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setAttachedFile(file);
    } else {
      alert("Por favor selecciona un archivo CSV válido");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() && !attachedFile) return;

    const userText = attachedFile 
      ? `${inputValue} (Archivo adjunto: ${attachedFile.name})`.trim() 
      : inputValue;

    const newMessage = {
      from: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/context-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          mensaje: userText,
          rol: "especialista en datos empresariales"
        }),
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        from: 'bot',
        text: data.respuesta,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages(prev => [...prev, {
        from: 'bot',
        text: "**Error de conexión con el servidor**",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isChatActive = messages.length > 0;

  return (
    <main className="flex-1 flex flex-col relative bg-[#FFF] h-[100%] font-sans overflow-hidden">
      
      {/* Input de archivo oculto */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        className="hidden" 
      />

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

      <header className="h-10 flex items-center justify-between px-6 bg-[#FFFFFF] border-b border-[#EDEBE9] z-20">
        <div className="text-[11px] font-medium text-[#605E5C]">
          Project / <span className="text-[#464775] font-bold">SVX copilot v1.2</span>
        </div>
        <div className="flex items-center gap-2">
          {isChatActive && (
            <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-all mr-1"><Trash2 size={16} /></button>
          )}
          <div className="w-6 h-6 rounded-full bg-[#EDEBE9] flex items-center justify-center text-[#464775]"><PH.User size={14} weight="bold" /></div>
        </div>
      </header>

      <div className="flex-1 m-2 rounded-xl border border-[#EDEBE9] shadow-sm relative overflow-hidden bg-white flex flex-col">
        
        {!isChatActive && (
          <div className="absolute inset-0 z-0 flex items-center justify-center" style={{ backgroundImage: "url('/ball.gif')", backgroundSize: '40%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[0px]"></div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto z-10 pb-[180px]"> 
          {isChatActive ? (
            <div className="max-w-4xl mx-auto space-y-8 w-full px-4 py-10">
              {messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 w-full ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Cambio de color en avatar del usuario a Morado */}
                  <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm ${msg.from === 'user' ? 'bg-[#464775]' : 'bg-slate-200 !text-slate-600'}`}>{msg.from === 'user' ? 'ME' : 'AI'}</div>
                  <div className={`flex flex-col max-w-[85%] ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-baseline gap-2 mb-1 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="font-bold text-[12px] text-slate-700">{msg.from === 'user' ? 'You' : 'Copilot'}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{msg.time}</span>
                    </div>
                    {/* Cambio de colores en burbujas: Usuario -> Morado | Bot -> Blanco con texto negro */}
                    <div className={`p-4 rounded-2xl text-[13.5px] leading-relaxed border shadow-sm ${msg.from === 'user' ? 'bg-[#464775] border-[#464775] text-white rounded-tr-none' : 'bg-white border-slate-200 text-slate-700 rounded-tl-none'}`}>
                      {msg.from === "bot" ? <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} /> : <p className="whitespace-pre-wrap">{msg.text}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && <div className="flex gap-4 animate-pulse"><div className="w-9 h-9 rounded-xl bg-slate-200"></div><div className="h-12 w-24 bg-white border border-slate-200 rounded-2xl rounded-tl-none"></div></div>}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto pt-10 px-6 flex flex-col relative z-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="w-full max-w-4xl mx-auto pt-4 px-6 flex flex-col relative z-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
  <div className="mb-3 w-[100%] border-b border-gray-100 pb-3">
    <div className="flex items-center gap-1.5 text-[#464775] mb-1">
      <Sparkles size={14} fill="#464775" fillOpacity={0.2} />
      <span className="text-[9px] font-bold uppercase tracking-wider">Contextual Assistance Center</span>
    </div>
    <h1 className="text-xl font-bold text-gray-900 mb-0.5">Welcome to Servex Contextual Copilot</h1>
    <p className="text-[12px] text-gray-500 max-w-2xl leading-snug">
      Learn processes, resolve platform questions, or analyze critical data. Synchronized with official 2026 documentation.
    </p>
  </div>
</div>
            </div>
          )}
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-30">
          <form onSubmit={handleSendMessage} className="bg-white border border-[#EDEBE9] rounded-xl shadow-2xl flex flex-col overflow-hidden focus-within:ring-1 focus-within:ring-[#464775]/20">
            
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 relative">
              <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 text-[10px] font-bold text-gray-600 bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">
                <Database size={12} className="text-[#464775]" /> CONTEXT LESRO AI PROTOCOL <ChevronDown size={0} />
              </button>
           
              <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-bold ml-auto"><Zap size={10} className="text-yellow-500 fill-yellow-500" /> SVX ENGINE READY</div>
            </div>

            <div className="px-4 pt-3">
              {/* VISTA PREVIA DEL ARCHIVO CARGADO */}
              {attachedFile && (
                <div className="flex items-center gap-2 mb-2 bg-[#F3F2F1] w-fit px-2 py-1 rounded border border-[#EDEBE9]">
                  <FileText size={14} className="text-[#464775]" />
                  <span className="text-[11px] font-bold text-[#464775]">{attachedFile.name}</span>
                  <button type="button" onClick={() => setAttachedFile(null)} className="hover:bg-gray-200 rounded-full p-0.5">
                    <X size={12} />
                  </button>
                </div>
              )}
              
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
                <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-400 hover:text-[#464775] rounded-lg transition-colors">
                  <Paperclip size={18} />
                </button>
                <button 
                  type="button" 
                  onClick={handleMicClick}
                  className={`p-2 rounded-lg transition-all ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-[#464775]'}`}
                >
                  <Mic size={18} />
                </button>
              </div>
              <button type="submit" disabled={(!inputValue.trim() && !attachedFile) || isLoading} className="bg-[#464775] text-white px-5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#3b3c63] transition-all disabled:opacity-40 shadow-sm">
                {isLoading ? "SENDING..." : "SEND QUERY"} <SendHorizontal size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Viewport;