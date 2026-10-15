"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { marked } from "marked";
import {
  Plus, Mic, MicOff, ChevronDown, Database, Sparkles,
  Check, Settings, HelpCircle, Zap, SendHorizonal,
  Brain, Shield, Activity, Cpu, BarChart2, Trash2, RefreshCw, Search
} from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';

const QUICK_PROMPTS = [
  { icon: Shield, label: "Core Principles", q: "What is the strategic imperative of SERVEX AI?" },
  { icon: Activity, label: "Platform Guide", q: "Explain the End-to-End ingestion pipeline." },
];


const BotMessage = ({ text }) => {
  const processedText = React.useMemo(() => {
    if (!text) return "";
    if (text.includes('\t') && !text.includes('|---')) {
      const lines = text.split('\n');
      let inTable = false;
      let newText = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('\t')) {
          const cols = line.split('\t').map(c => c.trim().replace(/\|/g, '-'));
          const mdRow = '| ' + cols.join(' | ') + ' |';
          if (!inTable) {
            inTable = true;
            newText.push(mdRow);
            newText.push('|' + cols.map(() => '---|').join(''));
          } else {
            newText.push(mdRow);
          }
        } else {
          inTable = false;
          newText.push(line);
        }
      }
      return newText.join('\n');
    }
    return text;
  }, [text]);

  const htmlContent = React.useMemo(() => {
    if (!processedText) return "";
    try {
      return marked.parse(processedText);
    } catch (e) {
      return processedText;
    }
  }, [processedText]);

  return (
    <div
      className="prose-light animate-fadeIn"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

// Motor de puntuación, gramática, acentuación y estandarización corporativa para Speech-to-Text
function formatProfessionalSpeechText(rawText) {
  if (!rawText || !rawText.trim()) return "";

  let text = rawText.trim();

  // 1. Sustituir comandos de puntuación hablados (Español / Inglés)
  const punctuationMap = [
    { regex: /\b(signo de interrogaci[oó]n|question mark)\b/gi, replacement: '?' },
    { regex: /\b(signo de exclamaci[oó]n|exclamation mark)\b/gi, replacement: '!' },
    { regex: /\b(punto y coma|semicolon)\b/gi, replacement: ';' },
    { regex: /\b(dos puntos|colon)\b/gi, replacement: ':' },
    { regex: /\b(punto y aparte|nueva l[ií]nea|new line)\b/gi, replacement: '\n' },
    { regex: /\b(punto seguido|punto final|punto|period|full stop)\b/gi, replacement: '.' },
    { regex: /\b(coma|comma)\b/gi, replacement: ',' },
  ];

  punctuationMap.forEach(({ regex, replacement }) => {
    text = text.replace(regex, replacement);
  });

  // 2. Limpieza de espaciados alrededor de signos
  text = text
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([.,;:!?])(?=[^\s\d])/g, '$1 ')
    .replace(/\s+/g, ' ');

  // 3. Diccionario corporativo y acrónimos clave
  const termsMap = [
    { regex: /\b(servex ai|servex copilot|servex)\b/gi, replacement: 'SERVEX' },
    { regex: /\balysa\b/gi, replacement: 'Alysa' },
    { regex: /\bglynne\b/gi, replacement: 'GLYNNE' },
    { regex: /\bxml\b/gi, replacement: 'XML' },
    { regex: /\bcsv\b/gi, replacement: 'CSV' },
    { regex: /\bpdf\b/gi, replacement: 'PDF' },
    { regex: /\bapi\b/gi, replacement: 'API' },
    { regex: /\bcet designer\b/gi, replacement: 'CET Designer' },
    { regex: /\bcet\b/gi, replacement: 'CET' },
    { regex: /\bxlsx?\b/gi, replacement: 'Excel' },
    { regex: /\bwbs\b/gi, replacement: 'WBS' },
    { regex: /\bwbg\b/gi, replacement: 'WBG' },
    { regex: /\bwbo\b/gi, replacement: 'WBO' },
    { regex: /\bwbd\b/gi, replacement: 'WBD' },
    { regex: /\bwba\b/gi, replacement: 'WBA' },
    { regex: /\bwbt\b/gi, replacement: 'WBT' },
    { regex: /\blesro\b/gi, replacement: 'LESRO' },
    { regex: /\bteknion\b/gi, replacement: 'Teknion' },
  ];

  termsMap.forEach(({ regex, replacement }) => {
    text = text.replace(regex, replacement);
  });

  // 4. Saludos y fórmulas comunes en español
  const accentsMap = [
    { regex: /\b(como estas|como esta)\b/gi, replacement: '¿cómo estás?' },
    { regex: /\b(hola alysa)\b/gi, replacement: '¡Hola Alysa!' },
    { regex: /\b(hola)\b/gi, replacement: '¡Hola!' },
    { regex: /\bque tal\b/gi, replacement: '¿qué tal?' },
    { regex: /\bcatalogo\b/gi, replacement: 'catálogo' },
    { regex: /\bcatalogos\b/gi, replacement: 'catálogos' },
    { regex: /\bauditoria\b/gi, replacement: 'auditoría' },
    { regex: /\bauditorias\b/gi, replacement: 'auditorías' },
    { regex: /\blinea\b/gi, replacement: 'línea' },
    { regex: /\blineas\b/gi, replacement: 'líneas' },
    { regex: /\bcodigo\b/gi, replacement: 'código' },
    { regex: /\bcodigos\b/gi, replacement: 'códigos' },
  ];

  accentsMap.forEach(({ regex, replacement }) => {
    text = text.replace(regex, replacement);
  });

  // 5. División en oraciones y puntuación automática de preguntas y cierres
  const questionStartersEs = [
    'cómo', 'como', 'cuál', 'cual', 'cuáles', 'cuales', 'qué', 'que',
    'por qué', 'quién', 'quien', 'cuándo', 'cuando',
    'dónde', 'donde', 'cuánto', 'cuanto', 'puedes', 'podrías', 'me ayudas', 'ayúdame'
  ];

  const segments = text.split(/(?<=[.!?\n])\s+/);

  const formattedSegments = segments.map(seg => {
    let s = seg.trim();
    if (!s) return "";

    // Capitalizar primera letra
    s = s.charAt(0).toUpperCase() + s.slice(1);

    // Detección inteligente de preguntas
    const isQuestionEs = questionStartersEs.some(q => s.toLowerCase().startsWith(q + ' ') || s.toLowerCase() === q);
    const isQuestionEn = /^(how|what|why|when|where|who|can you|could you|is there|are there|will you)\b/i.test(s);

    if ((isQuestionEs || isQuestionEn) && !s.endsWith('?') && !s.endsWith('!')) {
      if (!s.startsWith('¿') && isQuestionEs) {
        s = '¿' + s + '?';
      } else if (!s.endsWith('?')) {
        s = s + '?';
      }
    } else if (!/[.!?]$/.test(s)) {
      s = s + '.';
    }

    // Normalizar signos repetidos
    s = s.replace(/\?+\./g, '?').replace(/!+\./g, '!').replace(/\.{2,}/g, '.');

    return s;
  });

  let result = formattedSegments.filter(Boolean).join(' ');

  result = result
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([¿¡])\s+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  return result;
}

export default function TeamsAgentChat({ isFloating = false, onClose }) {

  const [selectedAgent] = useState({ agent_name: "Alysa SVX", role: "AI Engine" });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('Servex General');
  const [charCount, setCharCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const ignoreSpeechRef = useRef(false);
  const speechBaseTextRef = useRef("");
  const currentTranscriptRef = useRef("");

  // Obtener usuario actual
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://servex-ai-back.onrender.com";

  // Cargar Historial
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return; // Esperar a tener el user_id
      try {
        const res = await fetch(`${apiURL}/api/v1/general_agent/history?user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.history) {
            setMessages(data.history);
          }
        }
      } catch (e) {
        console.error("Failed to load chat history:", e);
      }
    };
    fetchHistory();
  }, [apiURL, userId]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Cleanup de reconocimiento de voz al desmontar
  useEffect(() => {
    return () => {
      ignoreSpeechRef.current = true;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  // Función STT para grabar voz y transcribir directamente al input
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // Al detener manualmente desde el micrófono:
      // Usamos stop() en lugar de abort() para consolidar el audio y conservar el texto en el input
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      // Aplicar formateo, puntuación y estandarización corporativa inteligente
      if (currentTranscriptRef.current) {
        const polished = formatProfessionalSpeechText(currentTranscriptRef.current);
        currentTranscriptRef.current = polished;
        setInput(polished);
        setCharCount(polished.length);
      }
      return;
    }

    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = typeof navigator !== 'undefined' ? (navigator.language || "es-ES") : "es-ES";

      ignoreSpeechRef.current = false;
      const initialVal = inputRef.current ? inputRef.current.value : input;
      speechBaseTextRef.current = initialVal ? (initialVal.trim() + " ") : "";
      currentTranscriptRef.current = initialVal || "";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        if (ignoreSpeechRef.current) return;

        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + " ";
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        if (ignoreSpeechRef.current) return;

        const currentSpoken = (finalTranscript + interimTranscript).trim();
        const newText = speechBaseTextRef.current ? (speechBaseTextRef.current + currentSpoken) : currentSpoken;
        currentTranscriptRef.current = newText;
        setInput(newText);
        setCharCount(newText.length);
        if (inputRef.current) {
          inputRef.current.scrollTop = inputRef.current.scrollHeight;
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error !== "no-speech") {
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
        if (!ignoreSpeechRef.current && currentTranscriptRef.current) {
          const polished = formatProfessionalSpeechText(currentTranscriptRef.current);
          currentTranscriptRef.current = polished;
          setInput(polished);
          setCharCount(polished.length);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start error:", err);
      setIsRecording(false);
    }
  }, [isRecording, input]);

  const scrollToBottom = useCallback((immediate = false) => {
    if (scrollContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      if (immediate && !isNearBottom) return;

      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: immediate ? "auto" : "smooth"
      });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    setCharCount(val.length);
    currentTranscriptRef.current = val;
  };

  const sendMessage = async (overrideText) => {
    // 1. INMEDIATAMENTE invalidar e interrumpir cualquier captura de voz
    ignoreSpeechRef.current = true;
    speechBaseTextRef.current = "";
    currentTranscriptRef.current = "";
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);

    const queryToSend = (overrideText || input).trim();
    if (!queryToSend || isLoading) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { from: 'user', text: queryToSend, time: nowStr };
    const newRawMessages = [...messages, userMsg];

    setMessages(newRawMessages);
    setInput("");
    setCharCount(0);
    setIsLoading(true);

    try {
      const langchainMsgs = newRawMessages.map(m => ({
        role: m.from === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const payload = {
        messages: langchainMsgs,
        raw_messages: newRawMessages,
        user_id: userId
      };

      const res = await fetch(`${apiURL}/api/v1/general_agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages([...newRawMessages, { from: 'bot', text: data?.reply || "No response received.", time: botTime, isNew: true }]);
      } else {
        throw new Error("Server Error");
      }
    } catch (e) {
      setMessages([...newRawMessages, { from: 'bot', text: 'Error connecting to Alysa. Please ensure the backend is running.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isNew: true }]);
    } finally {
      setIsLoading(false);
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
    <div className={
      isFloating
        ? "w-full h-full md:w-[500px] md:h-[600px] md:max-h-[85vh] flex flex-col font-sans text-gray-900 md:border md:border-gray-200 md:rounded-2xl md:shadow-2xl overflow-hidden md:shadow-indigo-100/50 pointer-events-auto relative bg-white"
        : "w-full h-[82vh] md:h-[84vh] flex flex-col font-sans text-gray-900 border border-gray-200/90 rounded-2xl shadow-sm overflow-hidden relative bg-white"
    }>

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
        <div className="flex items-center gap-2.5">
          <span className="text-[14px] font-black tracking-tight text-[#464775] uppercase">
            Alysa
          </span>
          <span className="text-[9.5px] font-bold text-[#464775] bg-[#464775]/10 border border-[#464775]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Servex Copilot
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Engine v4.10
          </div>
          {isFloating ? (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Plus size={16} className="rotate-45" />
            </button>
          ) : (
            <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <Settings size={15} />
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={async () => {
                if (!userId) return;
                setMessages([]);
                try {
                  await fetch(`${apiURL}/api/v1/general_agent/history?user_id=${userId}`, { method: "DELETE" });
                } catch (e) {}
              }}
              className="text-[11px] font-medium text-gray-500 border border-gray-300 px-2.5 py-1 rounded-lg hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main ref={scrollContainerRef} className="relative z-10 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent">
        <div className="w-full max-w-[1000px] mx-auto flex flex-col px-5 min-h-full">

          {messages.length === 0 ? (
            /* ── HOME ── */
            <div className="flex flex-col flex-1 pt-6 pb-5">
              {/* Hero */}
              <div className="relative text-center mb-10">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full blur-3xl pointer-events-none" />
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex justify-center mb-4 mt-2">
                    <img src="/alysa.png" alt="Alysa Logo" className="h-28 w-auto object-contain" />
                  </div>
                  <h2 className="text-[12px] text-gray-400 font-medium">
                    (AI Autonomous Logic & Yield System Architect.)
                  </h2>
                </motion.div>

                <div className="relative mx-auto max-w-sm mt-6">
                  <motion.div
                    className="absolute inset-0 bg-indigo-400/30 rounded-[30px] blur-[20px]"
                    animate={{
                      scale: [0.95, 1.05, 0.95],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="relative z-10 flex border border-white/60 rounded-xl overflow-hidden bg-white/60 backdrop-blur-md shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {[
                      { label: "Role", value: "Root Presenter" },
                      { label: "Accuracy", value: "99.9%" },
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
                <div className={`grid gap-2 ${isFloating ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
                      className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'w-full'}`}
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
                        {isUser ? 'YOU' : <img src="/logo2.png" alt="SVX" className="w-4 h-4 object-contain brightness-200" />}
                        {!isUser && (
                          <span className="absolute -inset-1 rounded-[14px] border border-[#464775]/40 animate-pulse" />
                        )}
                      </motion.div>

                      {/* Bubble col */}
                      <div className={`flex flex-col min-w-0 max-w-[88%] md:max-w-[85%] gap-1 ${isUser ? 'items-end' : 'items-start flex-1'}`}>
                        <div className={`flex items-baseline gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[12px] font-semibold text-gray-800">
                            {isUser ? 'You' : selectedAgent.agent_name}
                          </span>
                          <span className="text-[10px] text-gray-400">{msg.time}</span>
                        </div>

                        <motion.div
                          whileHover={{ y: -1 }}
                          className={`text-[13.5px] leading-relaxed relative break-words min-w-0
                          ${isUser
                              ? 'px-4 py-3 rounded-2xl shadow-sm bg-[#464775] text-white rounded-tr-sm border border-[#464775]'
                              : 'py-2 text-gray-800 w-full overflow-hidden'
                            }`}
                        >
                          {msg.from === "bot" ? (
                            <BotMessage text={msg.text} />
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
                    <img src="/logo2.png" alt="SVX" className="w-4 h-4 object-contain brightness-200" />
                    <span className="absolute -inset-1 rounded-[14px] border border-[#464775]/40 animate-pulse" />
                  </motion.div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12px] font-semibold text-gray-800">{selectedAgent.agent_name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Processing...</span>
                    </div>
                    <div className="flex items-center gap-1.5 py-2.5">
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
            </div>
          )}
        </div>
      </main>

      {/* ── INPUT ── */}
      <footer className="relative z-10 flex-shrink-0 px-5 py-3 pb-4 bg-white/40 backdrop-blur-md border-t border-white/50">
        <div className="max-w-[1000px] mx-auto bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl relative focus-within:border-[#464775]/40 shadow-sm">

          {/* Meta row */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/40 border-b border-white/50 rounded-t-2xl">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <Zap size={12} className="text-indigo-400" />
              <span>Engine v4.10</span>
            </div>
            {isRecording ? (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6264A7]/10 border border-[#6264A7]/25 text-[#464775] text-[11px] font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#6264A7] animate-pulse" />
                <span>Audio Mixer Active</span>
              </div>
            ) : charCount > 0 && (
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                {charCount}
              </span>
            )}
          </div>

          {/* Textarea */}
          <div className="flex flex-col px-3.5 pt-3 pb-1 w-full">
            <div className="flex items-start gap-2 w-full">
              <Sparkles size={15} className={`mt-0.5 flex-shrink-0 transition-colors ${isRecording ? 'text-[#6264A7] animate-pulse' : 'text-indigo-400 opacity-70'}`} />
              <textarea
                ref={inputRef}
                rows={1}
                className="flex-1 bg-transparent border-none outline-none resize-none text-[16px] md:text-[14px] text-gray-800 placeholder-gray-400 leading-relaxed min-h-[24px] max-h-[120px] overflow-y-auto caret-indigo-500 font-sans"
                placeholder={isRecording ? "Listening to your voice... Speak now..." : "Ask about processes, data, or system architecture…"}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Efecto Studio Audio Mixer a todo lo ancho del input */}
            {isRecording && (
              <div className="w-full mt-2.5 mb-1 p-2.5 rounded-xl bg-gradient-to-r from-[#464775]/5 via-[#6264A7]/10 to-[#464775]/5 border border-[#6264A7]/20 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6264A7] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#464775]"></span>
                    </span>
                    <span className="text-[11.5px] font-bold text-[#464775] tracking-tight">
                      Studio Audio Mixer
                    </span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">
                      · Capturing and transcribing speech frequencies live
                    </span>
                  </div>

                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#6264A7]/15 text-[#6264A7] border border-[#6264A7]/20">
                    Live Input
                  </span>
                </div>

                {/* Espectro completo de barras de ecualizador de audio a lo ancho de todo el input */}
                <div className="w-full h-8 flex items-end justify-between gap-[2px] md:gap-[3px] px-1 overflow-hidden">
                  {Array.from({ length: 48 }).map((_, idx) => (
                    <span
                      key={idx}
                      className="flex-1 max-w-[5px] min-w-[2px] rounded-full bg-gradient-to-t from-[#464775] to-[#6264A7]"
                      style={{
                        animation: `mixer-bar-bounce 0.85s ease-in-out infinite ${(idx * 0.038).toFixed(2)}s`,
                        opacity: 0.55 + (idx % 4) * 0.14
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-3.5 py-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Attach"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <Plus size={17} />
              </button>

              <button
                type="button"
                title={isRecording ? "Stop Recording (Stop STT)" : "Voice Recording (Speech-to-Text)"}
                onClick={toggleRecording}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-[#464775] text-white shadow-md shadow-[#464775]/25 ring-2 ring-[#6264A7]/50 animate-pulse'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-[#464775]'
                }`}
              >
                {isRecording ? <MicOff size={17} /> : <Mic size={17} />}
              </button>

              <button
                type="button"
                title="Auto-Punctuate & Polish Text"
                onClick={() => {
                  if (input.trim()) {
                    const polished = formatProfessionalSpeechText(input);
                    setInput(polished);
                    setCharCount(polished.length);
                    currentTranscriptRef.current = polished;
                  }
                }}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#6264A7] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Sparkles size={16} />
              </button>

              <button
                type="button"
                title="Help"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <HelpCircle size={17} />
              </button>
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
          © 2026 GLYNNE S.A.S. All rights reserved. Creators and developers of Alysa and its underlying processes.
        </p>
      </footer>

      {/* Keyframe animations */}
      <style jsx global>{`
        .orb-ring-1 { animation: orb-pulse 3s ease-in-out infinite; }
        .orb-ring-2 { animation: orb-pulse 3s ease-in-out infinite 0.6s; }
        .avatar-pulse { animation: avatar-pulse 2.5s ease-in-out infinite; }
        .dot-bounce   { animation: dot-bounce 1.2s ease-in-out infinite; }

        @keyframes mixer-bar-bounce {
          0%, 100% { height: 4px; }
          25% { height: 26px; }
          50% { height: 7px; }
          75% { height: 20px; }
        }

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

        /* Prose markdown */
        .prose-light { font-size: 13.5px; line-height: 1.7; color: #1f2937; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; }
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
        .prose-light table {
          width: 100%; border-collapse: collapse; margin: 16px 0;
          font-size: 12.5px; border-radius: 8px; overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;
          display: block; overflow-x: auto; white-space: nowrap;
        }
        .prose-light th, .prose-light td {
          border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left;
        }
        .prose-light th {
          background-color: #f9fafb; font-weight: 600; color: #374151; 
          text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;
        }
        .prose-light td {
          background-color: #ffffff; color: #4b5563; white-space: normal; min-width: 120px;
        }
        .prose-light tr:nth-child(even) td {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
}