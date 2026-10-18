"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { marked } from "marked";
import {
  Plus, Mic, MicOff, ChevronDown, Database, Sparkles,
  Check, Settings, HelpCircle, Zap, SendHorizonal,
  Brain, Shield, Activity, Cpu, BarChart2, Trash2, RefreshCw, Search, User,
  X, ChevronRight, BookOpen
} from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';

const AI_GUIDE_QUESTIONS = [
  {
    category: "Platform & Governance",
    tag: "Vision",
    q: "What is the SERVEX AI platform and what is its primary operational objective?",
    desc: "Global system vision, high-speed automated data transformations, and autonomous enterprise management."
  },
  {
    category: "Platform & Governance",
    tag: "Modules",
    q: "What modules, pipelines, and autonomous tools are available in the system?",
    desc: "Seamless workflow integration between Copilot chat, XML Pipeline Engine, and live telemetry."
  },
  {
    category: "Platform & Governance",
    tag: "Data Security",
    q: "How does the system enforce tenant isolation and enterprise data traceability?",
    desc: "Real-time cryptographically secure audits, tenant isolation, and strict session integrity."
  },
  {
    category: "Platform & Governance",
    tag: "Architecture",
    q: "How does the proprietary AI ecosystem engineered by GLYNNE S.A.S. operate?",
    desc: "Proprietary multi-agent architecture and high-throughput data streaming pipelines by GLYNNE S.A.S."
  },
  {
    category: "Company & Analytics",
    tag: "Tenant Health",
    q: "How can I evaluate operational performance and sync health across company tenants?",
    desc: "Aggregated analytics on catalog sync speed, processing latency, and node ingestion volume."
  },
  {
    category: "Company & Analytics",
    tag: "Margins",
    q: "How are financial deviation margins and tolerance thresholds calculated in reports?",
    desc: "Precision margin formulas, list price delta calculations, and financial variance metrics."
  },
  {
    category: "Company & Analytics",
    tag: "Manufacturers",
    q: "Which commercial manufacturers are integrated into the core catalog matrix?",
    desc: "Supported brands including Teknion, LESRO, VIA Seating, and custom enterprise catalogs."
  },
  {
    category: "Company & Analytics",
    tag: "Historical Audits",
    q: "Can I query historical audit logs and compare past catalog revisions?",
    desc: "Full chronological traceability and persistent historical database record inspection."
  },
  {
    category: "Company & Analytics",
    tag: "Batch Synthesis",
    q: "Can Alysa synthesize massive multi-company order batches in conversational mode?",
    desc: "High-throughput AI batch analysis delivering instantaneous executive summaries."
  },
  {
    category: "XML Pipeline Engine",
    tag: "Automation",
    q: "How does the XML Pipeline compress 3 weeks of manual engineering into seconds?",
    desc: "Autonomous ETL engine: users upload raw files and AI executes extraction, parsing, and rebuilding."
  },
  {
    category: "XML Pipeline Engine",
    tag: "File Formats",
    q: "What file formats are supported for catalog conversion (XML, CSV, XLSX, CET)?",
    desc: "Native ingestion and autonomous normalization of manufacturer schemas and pricing tables."
  },
  {
    category: "XML Pipeline Engine",
    tag: "CET 3D",
    q: "How does the AI generate verified catalogs ready for direct import into CET Designer?",
    desc: "CET 3D compliant schema synthesis, graphic placement rules, and commercial SKU verification."
  },
  {
    category: "XML Pipeline Engine",
    tag: "20/20 & BIM",
    q: "Are catalog conversions compliant with 20/20 Design environments and BIM standards?",
    desc: "Standardized architectural specification normalization for CAD and commercial design suites."
  },
  {
    category: "XML Pipeline Engine",
    tag: "Self-Healing",
    q: "What happens if a raw catalog file contains missing nodes or malformed syntax?",
    desc: "Self-healing algorithms automatically reconstruct and close broken tags to guarantee total integrity."
  },
  {
    category: "XML Pipeline Engine",
    tag: "Dynamic Trees",
    q: "How does the AI handle dynamic product finishes, options, and tier surcharges?",
    desc: "Autonomous resolution of complex option trees and dependency rules according to official specs."
  },
  {
    category: "Audits & Pricing",
    tag: "Price Deltas",
    q: "How does the system detect and flag price discrepancies across list catalogs?",
    desc: "Item-by-item audit engine with real-time percentage delta calculations and anomaly detection."
  },
  {
    category: "Audits & Pricing",
    tag: "PO Reconciliation",
    q: "How is purchase order reconciliation executed against official price lists?",
    desc: "Algorithmic cross-referencing between client purchase orders and published manufacturer matrices."
  },
  {
    category: "Audits & Pricing",
    tag: "Executive Forum",
    q: "How does the AI publish smart audit reports directly to the corporate Forum?",
    desc: "Automated executive report generation and publishing with key performance indicators."
  },
  {
    category: "Alysa Copilot",
    tag: "Voice STT",
    q: "How do I use the Studio Audio Mixer speech-to-text to dictate complex queries?",
    desc: "Integrated high-fidelity speech recognition engine with live frequency analysis and AI auto-polishing."
  },
  {
    category: "Alysa Copilot",
    tag: "Support",
    q: "How do I contact enterprise engineering support for custom workflows?",
    desc: "Direct support channels and dedicated enterprise engineering assistance from GLYNNE S.A.S."
  }
];

const QUICK_PROMPTS = [
  {
    icon: BarChart2,
    label: "Company Analysis",
    q: "Provide a comprehensive operational analysis of our enterprise tenants, active catalogs, and telemetry status."
  },
  {
    icon: Shield,
    label: "Audit Discrepancies",
    q: "Run a discrepancy audit across all catalog pricing lists and flag critical margin variations."
  },
  {
    icon: Cpu,
    label: "Pipeline Execution",
    q: "What is the current live status of the XML Pipeline, ingestion batches, and catalog conversions?"
  },
  {
    icon: Activity,
    label: "Architecture Specs",
    q: "Explain the Servex AI multi-agent architecture and technical engine specifications."
  },
];

const AlysaSvgIcon = ({ className = "w-7 h-7 flex-shrink-0", ...props }) => (
  <svg
    viewBox="60 180 870 640"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect x="593" y="197" width="153" height="149" rx="32" fill="#35365e" />
    <rect x="766" y="232" width="106" height="101" rx="22" fill="#7e81b8" />
    <rect x="740" y="350" width="176" height="174" rx="36" fill="#6264A7" />
    <path
      d="M 353 202 L 340 221 L 223 471 L 72 773 L 69 784 L 72 795 L 88 805 L 258 805 L 269 801 L 278 791 L 440 452 L 445 449 L 527 606 L 389 608 L 383 611 L 375 626 L 371 697 L 377 706 L 567 707 L 581 718 L 621 793 L 629 801 L 640 805 L 840 804 L 847 799 L 852 789 L 849 776 L 702 542 L 590 356 L 506 205 L 491 197 L 365 197 Z"
      fill="#464775"
    />
  </svg>
);


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

const INITIAL_PROACTIVE_MESSAGE = {
  from: 'bot',
  text: '¡Hola! 👋 Soy **Alysa**, tu copiloto de ingeniería y catálogos XML.\n\n¿En qué catálogo o matriz de precios estás trabajando hoy? Puedo auditar discrepancias en tus archivos, verificar reglas de opciones en CET/20-20 o resolver cualquier consulta sobre especificaciones.',
  isProactiveGreeting: true
};

export default function TeamsAgentChat({ isFloating = false, onClose, isInitialWidget = false }) {

  const [messages, setMessages] = useState([]);
  const [isSimulatingTyping, setIsSimulatingTyping] = useState(isInitialWidget);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('Servex General');
  const [charCount, setCharCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showAiGuideModal, setShowAiGuideModal] = useState(false);
  const [guideSearch, setGuideSearch] = useState("");
  const [guideCategory, setGuideCategory] = useState("all");

  // Animación de typing realista antes de enviar el mensaje inicial en el widget
  useEffect(() => {
    if (!isInitialWidget) return;

    if (messages.length > 0) {
      setIsSimulatingTyping(false);
      return;
    }

    setIsSimulatingTyping(true);
    const timer = setTimeout(() => {
      setMessages(prev => {
        if (prev.length === 0) {
          return [{
            ...INITIAL_PROACTIVE_MESSAGE,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }];
        }
        return prev;
      });
      setIsSimulatingTyping(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [isInitialWidget, messages.length]);

  const filteredGuideQuestions = React.useMemo(() => {
    return AI_GUIDE_QUESTIONS.filter(item => {
      const matchesCat = guideCategory === "all" || item.category === guideCategory;
      const matchesSearch = !guideSearch.trim() ||
        item.q.toLowerCase().includes(guideSearch.toLowerCase()) ||
        item.desc.toLowerCase().includes(guideSearch.toLowerCase()) ||
        item.tag.toLowerCase().includes(guideSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [guideCategory, guideSearch]);

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
          if (data.status === "success" && Array.isArray(data.history) && data.history.length > 0) {
            setMessages(data.history);
            setIsSimulatingTyping(false);
            return;
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
        try { recognitionRef.current.abort(); } catch (e) { }
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
        } catch (e) { }
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
        try { recognitionRef.current.abort(); } catch (e) { }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = typeof navigator !== 'undefined' ? (navigator.language || "en-US") : "en-US";

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
      try { recognitionRef.current.abort(); } catch (e) { }
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

  const renderInputCard = (isCentered = false) => {
    return (
      <div
        className={`w-full ${isCentered ? 'max-w-[760px] mx-auto shadow-[0_12px_40px_-6px_rgba(70,71,117,0.14),0_2px_10px_-2px_rgba(70,71,117,0.06)]' : 'max-w-[1000px] mx-auto shadow-sm'
          } bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl relative focus-within:border-[#464775]/50 focus-within:ring-4 focus-within:ring-[#464775]/10 transition-all duration-300`}
      >
        {/* Meta row */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/40 border-b border-white/50 rounded-t-2xl">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#464775]">
            <Zap size={12} className="text-[#6264A7]" />
            <span>Engine v4.10</span>
          </div>
          {isRecording ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6264A7]/10 border border-[#6264A7]/25 text-[#464775] text-[11px] font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#6264A7] animate-pulse" />
              <span>Audio Mixer Active</span>
            </div>
          ) : charCount > 0 ? (
            <span className="text-[10px] font-medium text-gray-500 bg-white/80 border border-gray-200/60 px-2 py-0.5 rounded-md">
              {charCount} chars
            </span>
          ) : null}
        </div>

        {/* Textarea */}
        <div className="flex flex-col px-3.5 pt-3 pb-1 w-full">
          <div className="flex items-start gap-2.5 w-full">
            <Sparkles size={16} className={`mt-1 flex-shrink-0 transition-colors ${isRecording ? 'text-[#6264A7] animate-pulse' : 'text-[#464775]/60'}`} />
            <textarea
              ref={inputRef}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] max-[700px]:text-[14px] text-gray-800 placeholder-gray-400 leading-relaxed min-h-[28px] max-h-[140px] overflow-y-auto caret-[#464775] font-sans"
              placeholder={isRecording ? "Listening to your voice... Speak now..." : "Ask about company analysis, catalog pipelines, or discrepancies… (type '/' for commands)"}
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
              title={isRecording ? "Stop Recording (Stop STT)" : "Voice Recording (Speech-to-Text)"}
              onClick={toggleRecording}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isRecording
                  ? 'bg-[#464775] text-white shadow-md shadow-[#464775]/25 ring-2 ring-[#6264A7]/50 animate-pulse'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-[#464775]'
                }`}
            >
              {isRecording ? <MicOff size={17} /> : <Mic size={17} />}
            </button>

            <button
              type="button"
              title="AI Guide & FAQ"
              onClick={() => setShowAiGuideModal(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#464775] transition-colors"
            >
              <HelpCircle size={17} />
            </button>
          </div>

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200
              ${input.trim() && !isLoading
                ? 'bg-[#464775] text-white shadow-md shadow-[#464775]/25 hover:bg-[#35365e] hover:-translate-y-px'
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
    );
  };

  return (
    <div className={
      isFloating
        ? "w-full h-full md:w-[500px] md:h-[600px] md:max-h-[85vh] flex flex-col min-h-0 font-sans text-gray-900 border-0 md:border md:border-gray-200 rounded-none md:rounded-2xl shadow-none md:shadow-2xl overflow-hidden md:shadow-indigo-100/50 pointer-events-auto relative bg-white"
        : "w-full h-full flex flex-col min-h-0 font-sans text-gray-900 overflow-hidden relative bg-white"
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
      <header className="relative z-10 h-[52px] flex-shrink-0 flex items-center justify-between px-5 max-[700px]:px-3.5 bg-transparent border-b border-slate-200/30">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold text-[#464775] bg-[#464775]/10 border border-[#464775]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Servex Copilot
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* AI Guide Modal Trigger Button */}
          <button
            type="button"
            onClick={() => setShowAiGuideModal(true)}
            title="AI Guide & FAQ"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#464775]/10 hover:bg-[#464775]/20 text-[#464775] border border-[#464775]/20 hover:border-[#464775]/35 transition-all text-[11px] font-semibold shadow-sm group"
          >
            <Sparkles size={13} className="text-[#6264A7] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">AI Guide</span>
          </button>

          {isFloating && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <Plus size={16} className="rotate-45" />
            </button>
          )}
          {messages.some(m => m.from === 'user') && (
            <button
              onClick={async () => {
                if (!userId) return;
                setMessages(isInitialWidget ? [{
                  ...INITIAL_PROACTIVE_MESSAGE,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }] : []);
                try {
                  await fetch(`${apiURL}/api/v1/general_agent/history?user_id=${userId}`, { method: "DELETE" });
                } catch (e) { }
              }}
              className="text-[11px] font-medium text-gray-500 border border-gray-300 px-2.5 py-1 rounded-lg hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main ref={scrollContainerRef} className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent">
        {messages.length === 0 && !isSimulatingTyping ? (
          /* ── HOME (CENTERED HEADER & PROFESSIONAL INPUT) ── */
          <div className="w-full max-w-[840px] mx-auto min-h-full flex flex-col justify-center items-center py-8 px-4">
            {/* Hero Presentation Header */}
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-6 w-full flex flex-col items-center"
            >
              <div className="flex justify-center mb-3">
                <img src="/alysa.png" alt="Alysa Logo" className="h-20 md:h-24 w-auto object-contain drop-shadow-sm" />
              </div>
              <h2 className="text-[12px] md:text-[13px] text-gray-400 font-medium tracking-tight">
                (AI Autonomous Logic &amp; Yield System Architect.)
              </h2>

              {/* Status Badges */}
              <div className="flex items-center justify-center gap-2 flex-wrap mt-3.5">
                <span className="text-[11px] font-semibold text-[#464775] bg-[#464775]/10 border border-[#464775]/20 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Shield size={12} className="text-[#464775]" />
                  Root Presenter
                </span>
                <span className="text-[11px] font-medium text-slate-600 bg-white/70 border border-slate-200/80 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Activity size={12} className="text-[#6264A7]" />
                  Accuracy 99.9%
                </span>
                <span className="text-[11px] font-medium text-slate-600 bg-white/70 border border-slate-200/80 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Zap size={12} className="text-[#6264A7]" />
                  Real-time Sync
                </span>
              </div>
            </motion.div>

            {/* Centered Professional Input Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.5 }}
              className="w-full"
            >
              {renderInputCard(true)}
            </motion.div>

            {/* Quick Prompts below input */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.5 }}
              className="w-full mt-4 flex items-center justify-center gap-2.5 flex-wrap"
            >
              {QUICK_PROMPTS.map(({ icon: Icon, label, q }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(q)}
                  title={q}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/70 backdrop-blur-md border border-white/80 hover:border-[#464775]/40 hover:bg-white hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 group text-[12px] text-gray-700 shadow-[0_2px_8px_-2px_rgba(70,71,117,0.06)]"
                >
                  <div className="w-5 h-5 rounded-md bg-[#464775]/10 flex items-center justify-center text-[#464775] group-hover:bg-[#464775]/20 transition-colors flex-shrink-0">
                    <Icon size={12} />
                  </div>
                  <span className="font-semibold text-gray-800 whitespace-nowrap">{label}</span>
                </button>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-center mt-6 text-[10.5px] text-gray-400 tracking-wide"
            >
              © 2026 GLYNNE S.A.S. All rights reserved. Creators and developers of Alysa and its underlying processes.
            </motion.p>
          </div>
        ) : (
          /* ── ACTIVE CHAT STREAM ── */
          <div className="w-full max-w-[1000px] mx-auto flex flex-col px-5 max-[700px]:px-3 min-h-full">
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
                      {isUser ? (
                        <motion.div
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          className="relative w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[9px] font-bold shadow-sm z-10 bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          <User size={15} className="text-slate-600" />
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.08 }}
                          className="flex-shrink-0 flex items-center justify-center pt-0.5"
                        >
                          <AlysaSvgIcon className="w-7 h-7 drop-shadow-sm" />
                        </motion.div>
                      )}

                      {/* Bubble col */}
                      <div className={`flex flex-col min-w-0 max-w-[88%] md:max-w-[85%] gap-1 ${isUser ? 'items-end' : 'items-start flex-1'}`}>
                        <div className={`flex items-baseline gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                          {isUser && (
                            <span className="text-[12px] font-semibold text-gray-800">
                              You
                            </span>
                          )}
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
              {(isLoading || isSimulatingTyping) && (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="flex gap-3 items-start"
                >
                  <div className="flex-shrink-0 flex items-center justify-center pt-0.5">
                    <AlysaSvgIcon className="w-7 h-7 drop-shadow-sm" />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {isSimulatingTyping ? 'Alysa está escribiendo...' : 'Processing...'}
                      </span>
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
          </div>
        )}
      </main>

      {/* ── INPUT (DOCKED WHEN CHATTING OR TYPING) ── */}
      {(messages.length > 0 || isSimulatingTyping) && (
        <footer className="relative z-10 flex-shrink-0 px-5 max-[700px]:px-2.5 py-3 max-[700px]:py-2 pb-4 max-[700px]:pb-2.5 bg-white/40 backdrop-blur-md border-t border-white/50 animate-fadeIn">
          {renderInputCard(false)}
          <p className="text-center mt-2.5 text-[10px] text-gray-400 tracking-wide">
            © 2026 GLYNNE S.A.S. All rights reserved. Creators and developers of Alysa and its underlying processes.
          </p>
        </footer>
      )}

      {/* ── MODAL DE GUÍA IA (20 PREGUNTAS ORIENTATIVAS) ── */}
      <AnimatePresence>
        {showAiGuideModal && (
          <div
            onClick={() => setShowAiGuideModal(false)}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-3 md:p-6 backdrop-blur-md bg-transparent"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden text-slate-800"
            >
              {/* Header del Modal */}
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#464775]/10 border border-[#464775]/20 flex items-center justify-center text-[#464775] shadow-sm">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">
                        AI Guidance & Documentation
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#464775] text-white">
                        20 Questions
                      </span>
                    </div>
                    <p className="text-[11.5px] text-gray-500 mt-0.5">
                      Select a key question to query Alysa Copilot and receive instant architectural guidance.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAiGuideModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filtro y Búsqueda */}
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between flex-shrink-0">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={guideSearch}
                    onChange={(e) => setGuideSearch(e.target.value)}
                    placeholder="Filter questions by keyword (XML, audit, margins, CET, etc.)..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-[12.5px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#464775] focus:ring-2 focus:ring-[#464775]/10 transition-all"
                  />
                  {guideSearch && (
                    <button
                      onClick={() => setGuideSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[11px]"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Categorías */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: "all", label: "All" },
                    { id: "Platform & Governance", label: "Platform" },
                    { id: "Company & Analytics", label: "Analytics" },
                    { id: "XML Pipeline Engine", label: "Pipeline" },
                    { id: "Audits & Pricing", label: "Audits" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setGuideCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${guideCategory === cat.id
                          ? 'bg-[#464775] text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-gray-600 hover:border-[#464775]/30 hover:text-[#464775]'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Preguntas */}
              <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
                {filteredGuideQuestions.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p className="text-[13px]">No questions found matching &ldquo;{guideSearch}&rdquo;.</p>
                    <button
                      onClick={() => { setGuideSearch(""); setGuideCategory("all"); }}
                      className="mt-2 text-[12px] text-[#464775] font-semibold underline"
                    >
                      View all questions
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {filteredGuideQuestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setShowAiGuideModal(false);
                          sendMessage(item.q);
                        }}
                        className="group flex flex-col justify-between p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-[#464775]/50 hover:bg-[#464775]/[0.03] hover:shadow-md transition-all text-left"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-[#464775]/10 group-hover:text-[#464775] transition-colors">
                              {item.category} · {item.tag}
                            </span>
                            <ChevronRight size={14} className="text-gray-300 group-hover:text-[#464775] group-hover:translate-x-0.5 transition-all" />
                          </div>
                          <h4 className="text-[12.5px] font-semibold text-gray-800 group-hover:text-[#464775] leading-snug transition-colors">
                            {item.q}
                          </h4>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer del Modal */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#6264A7]" />
                  <span>Click any question to send it directly to the chat.</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAiGuideModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-[12px] font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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