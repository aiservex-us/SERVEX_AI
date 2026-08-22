"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {AnimatePresence, motion } from "framer-motion";
import {marked } from "marked";
import {supabase } from '@/app/lib/supabaseClient';
import {
  Plus, Mic, ChevronDown, Database, Sparkles,
  Check, Settings, HelpCircle, Zap, SendHorizonal,
  Brain, Shield, Activity, Cpu, BarChart2, Trash2, RefreshCw, Search, BrainCircuit, CheckCircle2
, Download
} from 'lucide-react';

const CONTEXTS = ['Servex US', 'Servex LATAM', 'General HQ'];

const SLASH_COMMANDS = [
  {id: 'import', icon: Database, label: '/importBase', desc: 'Import Base excel & XML', phase: 1 },
  { id: 'save', icon: Database, label: '/saveCatalog', desc: 'Save uploaded XML/CSV Data', phase: 2 },
  { id: 'deleteData', icon: Trash2, label: '/deleteData', desc: 'Delete Tenant Data', phase: 2 },
  {id: 'execute', icon: Cpu, label: '/executeProcess', desc: 'Restructure XML and compare catalog (Step 2)', phase: 3 },
  {id: 'prices', icon: BrainCircuit, label: '/listPriceChanges', desc: 'List Price Changes', phase: 4 },
  {id: 'graphics', icon: BarChart2, label: '/graphicsDashboard', desc: 'Graphics Dashboard', phase: 4 },
  {id: 'resumen', icon: CheckCircle2, label: '/aiResumen', desc: 'AI Resumen', phase: 4 },
  {id: 'download', icon: Download, label: '/DownloadResultXml', desc: 'Download the processed XML result', phase: 4 },
  {id: 'audit', icon: BarChart2, label: '/createAuditor', desc: 'Generate full audit report and publish it to the forum', phase: 4 }
];

const QUICK_PROMPTS = [
  {icon: Shield, label: "RBAC Permissions", q: "How do I configure RBAC permissions on the platform?" },
  {icon: Activity, label: "ETL Flows", q: "Explain the architecture of the available ETL flows." },
];


// Configuración global del renderizador de Marked para estilos premium con Tailwind
const origRenderer = new marked.Renderer();
marked.use({
  renderer: {
    table(token) {
      const orig = origRenderer.table.call(this, token);
      return `<div class="my-5 overflow-x-auto rounded-xl border border-indigo-100 shadow-sm bg-white/50 backdrop-blur-sm inline-block max-w-full">
        ${orig.replace('<table>', '<table class="text-left text-[13px] text-gray-700">')
             .replace('<thead>', '<thead class="bg-indigo-50/80 border-b border-indigo-100 text-indigo-900 font-bold uppercase tracking-wider text-[11px]">')
             .replace('<tbody>', '<tbody class="divide-y divide-indigo-50/50">')}
      </div>`;
    },
    tablerow(token) {
      const orig = origRenderer.tablerow.call(this, token);
      return orig.replace('<tr>', '<tr class="hover:bg-white transition-colors duration-200">');
    },
    tablecell(token) {
      const orig = origRenderer.tablecell.call(this, token);
      const padding = token.header ? 'px-4 py-3.5' : 'px-4 py-3';
      return orig.replace(/^<(th|td)>/, `<$1 class="${padding} whitespace-nowrap">`);
    },
    list(token) {
      const orig = origRenderer.list.call(this, token);
      const classes = token.ordered 
        ? 'list-decimal list-outside ml-5 space-y-2.5 my-4 text-gray-700' 
        : 'list-disc list-outside ml-5 space-y-2.5 my-4 text-gray-700 marker:text-indigo-400';
      return orig.replace(/^<(ul|ol)>/, `<$1 class="${classes}">`);
    },
    listitem(token) {
      const orig = origRenderer.listitem.call(this, token);
      return orig.replace(/^<li>/, '<li class="leading-relaxed pl-1">');
    },
    paragraph(token) {
      const orig = origRenderer.paragraph.call(this, token);
      return orig.replace(/^<p>/, '<p class="leading-relaxed mb-4 text-gray-700">');
    },
    heading(token) {
      const orig = origRenderer.heading.call(this, token);
      const sizes = {
        1: 'text-2xl font-bold mt-7 mb-4 text-indigo-950 tracking-tight',
        2: 'text-xl font-bold mt-6 mb-3 text-indigo-900 tracking-tight border-b border-indigo-100 pb-2',
        3: 'text-lg font-semibold mt-5 mb-3 text-indigo-800 tracking-tight',
        4: 'text-base font-semibold mt-4 mb-2 text-indigo-700',
      };
      const cls = sizes[token.depth] || sizes[4];
      return orig.replace(/^<h[1-6]>/, `<h${token.depth} class="${cls}">`);
    },
    codespan(token) {
      const orig = origRenderer.codespan.call(this, token);
      return orig.replace('<code>', '<code class="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-mono text-[12px] font-semibold border border-indigo-100 shadow-sm">');
    },
    code(token) {
      const orig = origRenderer.code.call(this, token);
      return `<div class="my-5 rounded-xl overflow-hidden bg-[#1e1e2e] shadow-lg border border-gray-800">
            <div class="px-4 py-2 bg-[#181825] border-b border-gray-800 flex items-center justify-between">
              <div class="flex gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              </div>
              <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">${token.lang || 'text'}</span>
            </div>
            <div class="p-4 overflow-x-auto custom-scrollbar">
              ${orig.replace(/<pre><code[^>]*>/, '<pre class="text-[13px] text-gray-300 font-mono leading-relaxed inline-block"><code class="block">')}
            </div>
          </div>`;
    },
    blockquote(token) {
      const orig = origRenderer.blockquote.call(this, token);
      return orig.replace('<blockquote>', '<blockquote class="border-l-4 border-indigo-400 bg-gradient-to-r from-indigo-50/80 to-transparent italic py-3 px-5 rounded-r-xl my-5 text-gray-600 shadow-sm">');
    }
  }
});

const BotMessage = 
({text, isNew, onType }) => {
  const processedText = useMemo(() => {
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

  const [displayedText, setDisplayedText] = useState(isNew ? "" : processedText);

  useEffect(() => {
    if (!isNew) {
      setDisplayedText(processedText);
      return;
    }
    let i = 0;
    const intervalId = setInterval(() => {
      i += 4;
      setDisplayedText(processedText.slice(0, i));
      if (onType) onType(true);
      if (i >= processedText.length) {
        setDisplayedText(processedText);
        clearInterval(intervalId);
      }
    }, 15);
    return () => clearInterval(intervalId);
  }, [processedText, isNew, onType]);

  return (
    <div
      className="text-sm font-sans flex flex-col gap-1 w-full max-w-full overflow-x-auto overflow-y-hidden prose-light"
      dangerouslySetInnerHTML={{__html: marked.parse(displayedText) }}
    />
  );
};

export default function TeamsAgentChat({ currentSection, renderTool, onOpenToolPanel }) {
  const [selectedAgent] = useState({agent_name: "Alysa", role: "AI Engine" });
  const getInitialPhase = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('alysa_phase_' + window.location.pathname.split('/')[1]);
      if (stored) return parseInt(stored, 10);
    }
    return 1;
  };
  const [unlockedPhase, setUnlockedPhase] = useState(getInitialPhase);

  const updatePhase = (newPhase) => {
    setUnlockedPhase(newPhase);
    if (typeof window !== 'undefined') {
      localStorage.setItem('alysa_phase_' + window.location.pathname.split('/')[1], newPhase);
    }
  };

  useEffect(() => {
    const checkDbPhase = async () => {
      try {
        const moduleMatch = window.location.pathname.match(/^\/(WB[A-Z]|LESRO)/i);
        const modName = moduleMatch ? moduleMatch[1].toUpperCase() : 'WBS';
        const tableName = modName === 'LESRO' ? 'ClientsSERVEX_LESRO' : `ClientsSERVEX_${modName}`;
        
        const { data, error } = await supabase
          .from(tableName)
          .select('xml_raw, xml_actualizer_raw')
          .eq('company_name', 'Servex US')
          .maybeSingle();

        if (data) {
          if (data.xml_actualizer_raw) {
             setUnlockedPhase(4);
             localStorage.setItem('alysa_phase_' + modName, 4);
          }
          else if (data.xml_raw) {
             setUnlockedPhase(3);
             localStorage.setItem('alysa_phase_' + modName, 3);
          }
        }
      } catch (err) {
        console.error("Error validando la fase en DB:", err);
      }
    };
    checkDbPhase();
  }, []);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [context, setContext] = useState('Servex US');
  const [charCount, setCharCount] = useState(0);
  const [showSlashMenu, setShowSlashMenu] = useState(false);

  const messagesEndRef = useRef(null);

  // Global chat message listener
  useEffect(() => {
    const handleGlobalMessage = (e) => {
      const { from, text, toolId } = e.detail;
      setMessages(prev => [...prev, { from, text, toolId, isNew: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) }]);
      setTimeout(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };
    window.addEventListener('globalChatMessage', handleGlobalMessage);
    return () => window.removeEventListener('globalChatMessage', handleGlobalMessage);
  }, []);

  const inputRef = useRef(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://servex-ai-back.onrender.com";

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${apiURL}/wbo/api/v1/agent/history`);
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


  useEffect(() => {inputRef.current?.focus(); }, []);

  const scrollContainerRef = useRef(null);

  const scrollToBottom = useCallback((immediate = false) => {
    if (scrollContainerRef.current) {
      const {scrollHeight, scrollTop, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      if (immediate && !isNearBottom) return;

      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: immediate ? "auto" : "smooth"
      });
    }
  }, []);

  useEffect(() => {scrollToBottom(); }, [messages, scrollToBottom]);

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
    setInput("");
    setCharCount(0);
    setShowSlashMenu(false);
    // Add a slight delay to allow React state to settle before sending
    setTimeout(() => {
        sendMessage(cmdLabel);
    }, 50);
  };

  const sendMessage = async (overrideText) => {
    const queryToSend = (overrideText || input).trim();
    if (!queryToSend || isLoading) return;

    const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, {from: "user", text: queryToSend, time: now }]);
    setInput("");
    setCharCount(0);
    setIsLoading(true);
    // WIDGET TOOL HANDLERS
        const qLower = queryToSend.toLowerCase();
    if (qLower === '/importbase' && unlockedPhase < 2) updatePhase(2);
    if (qLower === '/savecatalog' && unlockedPhase < 3) updatePhase(3);
    if (qLower === '/executeprocess' && unlockedPhase < 4) updatePhase(4);
    if (qLower === '/deletedata') updatePhase(1);

    if (queryToSend.toLowerCase() === '/savecatalog') {
      window.dispatchEvent(new CustomEvent('saveCatalogData'));
      setMessages(prev => [...prev, { from: 'bot', text: '✅ Ejecutando el proceso de guardado y saneamiento de datos en la nube...', isNew: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' }) }]);
      setIsLoading(false);
      setTimeout(() => scrollToBottom(true), 100);
      return;
    }
        if (queryToSend.toLowerCase() === '/deletedata') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Abriendo panel de eliminación de datos...', isNew: true }, { from: 'tool', toolId: 'delete_data' }]);
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }
if (queryToSend.toLowerCase() === '/importbase') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Abriendo entorno de Ingestión de Datos en el chat...', isNew: true }, { from: 'tool', toolId: 'incert_delete' }]);
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;


    }
    if (queryToSend.toLowerCase() === '/listpricechanges') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Desplegando el panel de List Price Changes...', isNew: true }]);
        if(onOpenToolPanel) onOpenToolPanel('report');
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }
    if (queryToSend.toLowerCase() === '/graphicsdashboard') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Cargando el Dashboard de Analíticas Gráficas...', isNew: true }]);
        if(onOpenToolPanel) onOpenToolPanel('graphics');
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }
    if (queryToSend.toLowerCase() === '/airesumen') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Generando ventana de AI Resumen...', isNew: true }]);
        if(onOpenToolPanel) onOpenToolPanel('AI_reporter');
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }

    
    if (queryToSend.toLowerCase() === '/downloadresultxml') {
      const nowTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' });
      
      try {
        const {data, error } = await supabase
          .from('ClientsSERVEX_WBO')
          .select('xml_actualizer_raw')
          .eq('company_name', 'WBO')
          .single();

        if (error || !data || !data.xml_actualizer_raw) {
          setMessages(prev => [...prev, {from: "bot", text: "❌ Error: XML file not found in the database for WBO.", time: nowTime }]);
        } else {
          const blob = new Blob([data.xml_actualizer_raw], {type: 'application/xml' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'WBO.xml');
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setMessages(prev => [...prev, {from: "bot", text: "✅ Download started. The file WBO.xml has been saved successfully.", time: nowTime }]);
        }
      } catch (err) {
        setMessages(prev => [...prev, {from: "bot", text: "❌ An unexpected error occurred while trying to download the XML.", time: nowTime }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }


    if (queryToSend === '/createAuditor') {
      const nowTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {from: "bot", text: "📊 Generating smart audit report and publishing it to the Forum...", time: nowTime }]);
      
      try {
        const match = window.location.pathname.match(/^\/(WB[A-Z])/i);
        const modulePrefix = match ? match[1].toLowerCase() : 'wbs';
        
        const {data: {user } } = await supabase.auth.getUser();
        const userEmail = user?.email || 'admin@servex-us.com';
        
        const response = await fetch(`${apiURL}/${modulePrefix}/api/v1/agent/create-audit`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json' },
          body: JSON.stringify({email: userEmail })
        });

        if (!response.ok) {
          throw new Error('Audit generator response failed');
        }
        
        await response.json();
        setMessages(prev => [...prev, {from: "bot", text: "✅ Audit successfully generated and published to the forum!", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' }) }]);
      } catch (err) {
        setMessages(prev => [...prev, {from: "bot", text: `❌ Error generating audit: ${err.message}`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' }) }]);
      }
      setIsLoading(false);
      return;
    }

    if (queryToSend === '/executeProcess') {
      const nowTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {from: "bot", text: "⚙️ Starting ETL engine for cloud catalog processing (WBO). Please wait...", time: nowTime }]);
      
      try {
        const formData = new FormData();
        formData.append('company_name', 'WBO');
        
        const response = await fetch(`${apiURL}/wbo/api/v1/pipeline/compare-only-WBO`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Comparison engine response failed');
        }
        
        await response.json();
        setMessages(prev => [...prev, {from: "bot", text: "✅ ETL process completed successfully! The catalog has been restructured and compared. You can now review the audit in 'List Price Changes'.", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' }) }]);
        setTimeout(() => { sendMessage('/listPriceChanges'); }, 1500);
      } catch (err) {
        setMessages(prev => [...prev, {from: "bot", text: `❌ Error during ETL process execution: ${err.message}`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' }) }]);
      }
      setIsLoading(false);
      return;
    }

    try {
      // Mapear el historial de messages al formato esperado por el backend
      const historyPayload = messages.filter(msg => msg.text).map(msg => ({
        role: msg.from === "user" ? "user" : "assistant",
        content: msg.text
      }));
      // Agregar el mensaje actual
      historyPayload.push({role: "user", content: queryToSend });

      const res = await fetch(`${apiURL}/wbo/api/v1/agent/chat`, {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({messages: historyPayload, raw_messages: [...messages.filter(msg => msg.text), {from: "user", text: queryToSend, time: now }], company_name: context, current_section: currentSection, unlocked_phase: unlockedPhase }),
      });
      const data = await res.json();
      const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, {from: "bot", text: data?.reply || "No response received.", time: botTime }]);
    } catch {
      setMessages(prev => [...prev, {from: "bot", text: "❌ Connection error.", time: "--:--" }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); sendMessage(); setShowSlashMenu(false); }
    if (e.key === 'Escape') {setShowSlashMenu(false); }
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
            <span className="text-[13px] font-semibold tracking-tight text-gray-900 leading-none">Alysa</span>

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
                  await fetch(`${apiURL}/wbo/api/v1/agent/history`, {method: "DELETE" });
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
                  initial={{opacity: 0, y: 24 }}
                  animate={{opacity: 1, y: 0 }}
                  transition={{duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
                    initial={{opacity: 0 }}
                    animate={{opacity: 1 }}
                    transition={{delay: 0.3, duration: 0.5 }}
                  >
                    {[
                      {label: "Documents", value: "Servex client" },
                      {label: "Accuracy", value: "98.4%" },
                      {label: "Sync", value: "Real-time" },
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
                initial={{opacity: 0, y: 16 }}
                animate={{opacity: 1, y: 0 }}
                transition={{delay: 0.45, duration: 0.5 }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Frequent Queries
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map(({icon: Icon, label, q }) => (
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
            <div className="flex flex-col gap-6 py-7 max-w-4xl mx-auto w-full">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                  const isUser = msg.from === 'user';
                  return (
                    <motion.div
                      layout
                      key={idx}
                      initial={{opacity: 0, y: 20, x: isUser ? 20 : -20, scale: 0.95 }}
                      animate={{opacity: 1, y: 0, x: 0, scale: 1 }}
                      transition={{
                        duration: 0.5, 
                        ease: [0.23, 1, 0.32, 1],
                        layout: {duration: 0.3, ease: "easeOut" }
                      }}
                      className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'w-full'}`}
                    >
                      {msg.from === 'tool' ? (
                        <div className="w-full my-3 p-1 bg-transparent rounded-2xl overflow-hidden relative">
                          <div className="w-full h-full overflow-y-auto max-h-[85vh] relative">
                             {renderTool && renderTool(msg.toolId)}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Avatar */}
                          <motion.div 
                        whileHover={{scale: 1.05, rotate: isUser ? 5 : -5 }}
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
                      <div className={`flex flex-col min-w-0 gap-1 max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-baseline gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[12px] font-semibold text-gray-800">
                            {isUser ? 'You' : selectedAgent.agent_name}
                          </span>
                          <span className="text-[10px] text-gray-400">{msg.time}</span>
                        </div>

                        <motion.div 
                          whileHover={{ y: -1 }}
                          className={`py-2 text-[14.5px] leading-relaxed relative transition-all max-w-full overflow-hidden
                          ${isUser
                            ? 'bg-[#464775] text-white rounded-2xl rounded-tr-sm shadow-md px-5 py-3'
                            : 'bg-transparent text-slate-800 px-1'
                          }`}
                        >
                          <div className="relative z-10 max-w-full overflow-hidden">
                            {msg.from === "bot" ? (
                              <BotMessage text={msg.text} isNew={msg.isNew} onType={scrollToBottom} />
                            ) : (
                              <p className="whitespace-pre-wrap m-0">{msg.text}</p>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    </>
                  )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  layout
                  initial={{opacity: 0, y: 15, x: -10, scale: 0.95 }}
                  animate={{opacity: 1, y: 0, x: 0, scale: 1 }}
                  exit={{opacity: 0, scale: 0.9, transition: {duration: 0.2 } }}
                  transition={{duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="flex gap-3 items-start"
                >
                  <motion.div 
                    initial={{scale: 0.8 }} animate={{scale: 1 }} transition={{type: "spring", bounce: 0.5 }}
                    className="relative w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-[#464775] text-white shadow-sm"
                  >
                    <Brain size={15} />
                    <span className="absolute -inset-1 rounded-[14px] border border-[#464775]/40 animate-pulse" />
                  </motion.div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12px] font-semibold text-gray-800">{selectedAgent.agent_name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">Thinking...</span>
                    </div>
                    <div className="flex items-center gap-1.5 py-2.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          initial={{opacity: 0.3, y: 0 }}
                          animate={{opacity: 1, y: [-2, 2, -2] }}
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
              initial={{opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
              animate={{opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }}
              transition={{type: "spring", stiffness: 400, damping: 25 }}
              className="absolute bottom-[calc(100%+8px)] left-0 right-0 mx-auto max-w-[820px] bg-white border border-slate-200 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] z-50 overflow-hidden"
            >
              <div className="p-1.5">
                <div className="px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50 mb-0.5">
                  Audit Commands
                </div>
                {SLASH_COMMANDS.filter(cmd => cmd.phase <= unlockedPhase).map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => handleCommandSelect(cmd.label)}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left group"
                  >
                    <div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 flex-shrink-0">
                      <cmd.icon size={11} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[10px] font-medium text-gray-600 group-hover:text-indigo-700 truncate">{cmd.label}</span>
                      <span className="text-[8px] text-gray-400 group-hover:text-indigo-400 truncate">{cmd.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-[820px] mx-auto bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-200/80 rounded-full relative focus-within:border-indigo-400 focus-within:shadow-[0_4px_30px_rgba(99,102,241,0.15)] transition-all duration-300 flex items-center pr-2 pl-4 py-2"
        >
          {/* Main Action Icon */}
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors flex-shrink-0"
            title="Attach"
          >
            <Plus size={20} />
          </button>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-[14.5px] text-gray-800 placeholder-gray-400 leading-relaxed min-h-[24px] max-h-[100px] overflow-y-auto px-3 py-1 font-sans self-center mt-1"
            placeholder="Escribe un comando ('/') o mensaje..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />

          {/* Char count (minimalist) */}
          {charCount > 0 && (
            <span className="text-[10px] font-medium text-gray-300 mr-3 flex-shrink-0">
              {charCount}
            </span>
          )}

          {/* Send Button */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
              ${input.trim() && !isLoading
                ? 'bg-[#464775] text-white shadow-md shadow-[#464775]/40 hover:scale-105 active:scale-95'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <SendHorizonal size={15} className={input.trim() ? "ml-0.5" : ""} />
            )}
          </button>
        </motion.div>

        <p className="text-center mt-2.5 text-[10px] text-gray-400 tracking-wide">
          © 2026 GLYNNE S.A.S. All rights reserved. Creators and developers of Alysa and its underlying processes.
        </p>
      </footer>

      {/* Keyframe animations solo (no CSS de layout/color) */}
      <style jsx global>{`
        .orb-ring-1 {animation: orb-pulse 3s ease-in-out infinite; }
        .orb-ring-2 {animation: orb-pulse 3s ease-in-out infinite 0.6s; }
        .avatar-pulse {animation: avatar-pulse 2.5s ease-in-out infinite; }
        .dot-bounce   {animation: dot-bounce 1.2s ease-in-out infinite; }

        @keyframes orb-pulse {
          0%, 100% {opacity: 1; transform: scale(1); }
          50%       {opacity: 0.5; transform: scale(1.08); }
        }
        @keyframes avatar-pulse {
          0%, 100% {opacity: 0.4; transform: scale(1); }
          50%       {opacity: 0;   transform: scale(1.25); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% {transform: translateY(0);   opacity: 0.4; }
          40%            {transform: translateY(-6px); opacity: 1; }
        }

        /* Prose markdown — clases de Tailwind no alcanzan innerHTML */
        .prose-light {font-size: 13.5px; line-height: 1.7; color: #1f2937; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; }
        .prose-light p  {margin: 0 0 10px; }
        .prose-light p:last-child {margin-bottom: 0; }
        .prose-light strong {color: #3730a3; font-weight: 600; }
        .prose-light a  {color: #6366f1; text-decoration: underline; text-underline-offset: 2px; }
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
        .prose-light pre code {background: transparent; border: none; color: #374151; padding: 0; }
        .prose-light ul {list-style: none; padding: 0; margin: 8px 0; }
        .prose-light ul li {padding-left: 16px; position: relative; margin-bottom: 4px; }
        .prose-light ul li::before {
          content: ''; position: absolute; left: 0; top: 9px;
          width: 5px; height: 5px; border-radius: 50%; background: #6366f1;
        }
        .prose-light ol {padding-left: 20px; margin: 8px 0; }
        .prose-light h1, .prose-light h2, .prose-light h3 {
          color: #111827; font-weight: 600; margin: 16px 0 8px; letter-spacing: -0.02em;
        }

                .prose-light table {
          width: 100%; max-width: 100%; border-collapse: collapse; margin: 16px 0;
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

        @media (prefers-reduced-motion: reduce) {
          .orb-ring-1, .orb-ring-2, .avatar-pulse, .dot-bounce {animation: none; }
        }
      `}</style>
    </div>
  );
}