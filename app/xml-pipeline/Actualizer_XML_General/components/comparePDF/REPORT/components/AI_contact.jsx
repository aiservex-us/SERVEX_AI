"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { marked } from "marked";
import { supabase } from '@/app/lib/supabaseClient';
import {
  Plus, Mic, MicOff, ChevronDown, Database, Sparkles,
  Check, Settings, HelpCircle, Zap, SendHorizonal,
  Brain, Shield, Activity, Cpu, BarChart2, Trash2, RefreshCw, Search, BrainCircuit, CheckCircle2,
  Download, User, X, ChevronRight
} from 'lucide-react';

const CONTEXTS = ['Servex US', 'Servex LATAM', 'General HQ'];

const SLASH_COMMANDS = [
  { id: 'import_cet', icon: Database, label: '/importCETxml', desc: 'Import CET XML', phase: 1, category: 'Export Data From CET or Client' },
  { id: 'exportCETcsv', icon: Download, label: '/exportCETcsv', desc: 'Export processed CET CSV', phase: 4, category: 'Export Data From CET or Client' },
  { id: 'compareCET', icon: Sparkles, label: '/compareCET', desc: 'Compare CET XML against Base', phase: 4, category: 'Export Data From CET or Client' },
  
  { id: 'import', icon: Database, label: '/importBase', desc: 'Import Base excel & XML', phase: 1, category: 'Step 1: Data Ingestion' },
  { id: 'deleteData', icon: Trash2, label: '/deleteData', desc: 'Delete Tenant Data', phase: 2, category: 'Step 1: Data Ingestion' },
  
  { id: 'execute', icon: Cpu, label: '/executeProcess', desc: 'Restructure XML and compare catalog (Step 2)', phase: 3, category: 'Step 2: XML ETL Engine' },
  
  { id: 'prices', icon: BrainCircuit, label: '/listPriceChanges', desc: 'List Price Changes', phase: 4, category: 'Step 3: Audit & Reporting' },
  { id: 'graphics', icon: BarChart2, label: '/graphicsDashboard', desc: 'Graphics Dashboard', phase: 4, category: 'Step 3: Audit & Reporting' },
  { id: 'resumen', icon: CheckCircle2, label: '/aiResumen', desc: 'AI Summary', phase: 4, category: 'Step 3: Audit & Reporting' },
  { id: 'download', icon: Download, label: '/DownloadResultXml', desc: 'Download the processed XML result', phase: 4, category: 'Step 3: Audit & Reporting' },
  { id: 'audit', icon: BarChart2, label: '/createAuditor', desc: 'Generate full audit report and publish it to the forum', phase: 4, category: 'Step 3: Audit & Reporting' }
];

const QUICK_PROMPTS = [
  { 
    icon: Database, 
    label: "CET XML Conversion", 
    q: "How does the AI autonomously convert any CET XML catalog into an import-ready structured matrix without manual effort?" 
  },
  { 
    icon: Cpu, 
    label: "Catalog Auto-Update", 
    q: "How does Alysa automatically update the entire XML catalog once I simply upload my file?" 
  },
  { 
    icon: BarChart2, 
    label: "Compare Discrepancies", 
    q: "How does the AI audit and reconcile pricing deltas and product codes autonomously in seconds?" 
  },
  { 
    icon: Shield, 
    label: "Autonomous AI Pipeline", 
    q: "Explain how the AI compresses weeks of manual engineering into seconds—I only upload the file and Alysa does everything." 
  },
];

const AI_GUIDE_QUESTIONS = [
  {
    category: "Ingestion & Upload",
    tag: "Zero Effort",
    q: "What do I need to do as a user to start processing in the XML Pipeline?",
    desc: "The user only uploads the file; Alysa autonomously handles 100% of the extraction, relational mapping, and analysis without manual intervention."
  },
  {
    category: "Ingestion & Upload",
    tag: "File Formats",
    q: "What file formats can I upload (Master XML, CSV, XLSX, CET export)?",
    desc: "Native compatibility and autonomous parsing of manufacturer XML schemas, CSV price matrices, and update spreadsheets."
  },
  {
    category: "Ingestion & Upload",
    tag: "Auto-Detection",
    q: "How does the AI recognize file schema and manufacturer structures without setup?",
    desc: "Intelligent heuristic classification that instantly detects node hierarchies, pricing attributes, and product SKUs upon upload."
  },
  {
    category: "Ingestion & Upload",
    tag: "Auto-Repair",
    q: "What happens if the original XML file has broken syntax or missing nodes?",
    desc: "The AI automatically heals, closes broken tags, and normalizes the XML schema, guaranteeing total data integrity without human repair."
  },
  {
    category: "Ingestion & Upload",
    tag: "Large Catalogs",
    q: "Can the pipeline process massive enterprise catalogs with thousands of references?",
    desc: "High-throughput parallel ingestion engine optimized to parse and transform enterprise catalogs in seconds."
  },
  {
    category: "XML Conversion",
    tag: "Structure",
    q: "How does Alysa convert raw XML into a clean, structured relational matrix?",
    desc: "Autonomous multi-node breakdown of SKUs, dynamic variable options, and commercial product rules executed entirely by AI."
  },
  {
    category: "XML Conversion",
    tag: "CET Designer",
    q: "How does the AI generate a catalog ready to import directly into CET Designer?",
    desc: "Autonomous generation of CET 3D-compliant schemas, graphical placement rules validation, and verified manufacturer part numbers."
  },
  {
    category: "XML Conversion",
    tag: "20/20 & BIM",
    q: "Is the converted catalog compatible with 20/20 Design environments and BIM standards?",
    desc: "Standardized normalization tailored for architectural specification software, CAD libraries, and commercial procurement systems."
  },
  {
    category: "XML Conversion",
    tag: "Download",
    q: "How do I download the updated, restructured XML result file?",
    desc: "Execute the /DownloadResultXml command or use direct instant download once the autonomous engine finishes processing."
  },
  {
    category: "XML Conversion",
    tag: "Dynamic Options",
    q: "How does the AI handle dynamic product options, finishes, and dimensional modifiers?",
    desc: "Self-healing option tree reconciliation matching finishes, tier surcharges, and fabric codes against official manufacturer specifications."
  },
  {
    category: "AI Comparison",
    tag: "Process",
    q: "How does the AI cross-reference the base XML against the new catalog update?",
    desc: "Autonomous algorithmic comparison that identifies price updates, added items, discontinued SKUs, and substitutions in seconds."
  },
  {
    category: "AI Comparison",
    tag: "Discrepancies",
    q: "How does Alysa detect and audit list price discrepancies and margins?",
    desc: "Item-by-item audit engine with instant percentage delta calculation, anomaly flagging, and error margin verification."
  },
  {
    category: "AI Comparison",
    tag: "List Price Changes",
    q: "How do I access the detailed List Price Changes audit report?",
    desc: "Use the /listPriceChanges command or open the side panel for interactive granular inspection with high-precision filtering."
  },
  {
    category: "AI Comparison",
    tag: "Tolerances",
    q: "Does the AI classify pricing discrepancies by financial impact or tolerance thresholds?",
    desc: "Predictive risk segmentation separating critical margin variances, minor price index shifts, and structural design updates."
  },
  {
    category: "AI Comparison",
    tag: "Forum Audit",
    q: "How does the AI publish the intelligent executive audit report to the Forum?",
    desc: "Execute /createAuditor to automatically consolidate key business metrics and publish an executive audit post directly to the company forum."
  },
  {
    category: "Autonomous Pipeline",
    tag: "Weeks to Seconds",
    q: "Why does the pipeline compress 3 weeks of manual engineering into seconds?",
    desc: "Full end-to-end automation: the user only uploads the file, and AI runs the entire extraction, comparison, reconciliation, and XML rebuilding."
  },
  {
    category: "Autonomous Pipeline",
    tag: "Slash Commands",
    q: "What slash commands ('/') are available to navigate and control the pipeline?",
    desc: "Interactive command suite: /importBase, /executeProcess, /compareCET, /listPriceChanges, /graphicsDashboard, and /DownloadResultXml."
  },
  {
    category: "Autonomous Pipeline",
    tag: "Telemetry & Graphs",
    q: "How can I view graphical analytics and catalog performance metrics?",
    desc: "Interactive dashboard displaying parsing speed, node volume distribution, price variance histograms, and sync health telemetry."
  },
  {
    category: "Autonomous Pipeline",
    tag: "Audit History",
    q: "Is there a persistent historical record of versions and AI-applied transformations?",
    desc: "Full chronological traceability with cryptographically sound audit logs stored in the database for compliance and quality control."
  },
  {
    category: "Autonomous Pipeline",
    tag: "Architecture",
    q: "How does the proprietary AI architecture developed by GLYNNE S.A.S. operate?",
    desc: "Proprietary high-throughput multi-agent architecture and data streaming pipeline engineered by GLYNNE S.A.S."
  }
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

    s = s.charAt(0).toUpperCase() + s.slice(1);

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

// Configuración global del renderizador de Marked para estilos premium corporativos
const origRenderer = new marked.Renderer();
marked.use({
  renderer: {
    table(token) {
      const orig = origRenderer.table.call(this, token);
      return `<div class="my-5 overflow-x-auto rounded-xl border border-[#464775]/15 shadow-sm bg-white/60 backdrop-blur-sm inline-block max-w-full">
        ${orig.replace('<table>', '<table class="text-left text-[13px] text-gray-700">')
             .replace('<thead>', '<thead class="bg-[#464775]/5 border-b border-[#464775]/15 text-[#464775] font-bold uppercase tracking-wider text-[11px]">')
             .replace('<tbody>', '<tbody class="divide-y divide-[#464775]/10">')}
      </div>`;
    },
    tablerow(token) {
      const orig = origRenderer.tablerow.call(this, token);
      return orig.replace('<tr>', '<tr class="hover:bg-white/80 transition-colors duration-200">');
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
        : 'list-disc list-outside ml-5 space-y-2.5 my-4 text-gray-700 marker:text-[#6264A7]';
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
        1: 'text-2xl font-bold mt-7 mb-4 text-[#35365e] tracking-tight',
        2: 'text-xl font-bold mt-6 mb-3 text-[#464775] tracking-tight border-b border-[#464775]/15 pb-2',
        3: 'text-lg font-semibold mt-5 mb-3 text-[#464775] tracking-tight',
        4: 'text-base font-semibold mt-4 mb-2 text-[#6264A7]',
      };
      const cls = sizes[token.depth] || sizes[4];
      return orig.replace(/^<h[1-6]>/, `<h${token.depth} class="${cls}">`);
    },
    codespan(token) {
      const orig = origRenderer.codespan.call(this, token);
      return orig.replace('<code>', '<code class="px-1.5 py-0.5 rounded-md bg-[#464775]/10 text-[#464775] font-mono text-[12px] font-semibold border border-[#464775]/20 shadow-sm">');
    },
    code(token) {
      const orig = origRenderer.code.call(this, token);
      return `<div class="my-3 rounded-lg overflow-hidden bg-transparent border-0">
            <div class="p-1 overflow-x-auto custom-scrollbar">
              ${orig.replace(/<pre><code[^>]*>/, '<pre class="text-[13px] text-slate-700 font-mono leading-relaxed inline-block"><code class="block">')}
            </div>
          </div>`;
    },
    blockquote(token) {
      const orig = origRenderer.blockquote.call(this, token);
      return orig.replace('<blockquote>', '<blockquote class="border-l-4 border-[#464775] bg-gradient-to-r from-[#464775]/5 to-transparent italic py-3 px-5 rounded-r-xl my-5 text-gray-700 shadow-sm">');
    }
  }
});

const BotMessage = ({ text, onCommandSelect }) => {
  const processedText = useMemo(() => {
    if (!text) return "";
    let finalStr = text;
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
      finalStr = newText.join('\n');
    }
    return finalStr;
  }, [text]);

  const htmlContent = useMemo(() => {
    let html = "";
    if (typeof processedText === 'string') {
      html = marked.parse(processedText);
    } else {
      html = marked.parse(String(processedText || ""));
    }
    
    // Inyectar botones interactivos para comandos de barra después del markdown
    const COMMANDS_REGEX = /(\/(?:importCETxml|SaveXMLcet|exportCETcsv|compareCET|importBase|saveCatalog|deleteData|executeProcess|listPriceChanges|graphicsDashboard|aiResumen|DownloadResultXml|createAuditor))\b/g;
    html = html.replace(COMMANDS_REGEX, '<button class="text-[#464775] hover:text-[#35365e] font-semibold hover:underline cursor-pointer inline-flex items-center mx-0.5 alysa-cmd-btn bg-transparent p-0 border-none shadow-none" data-cmd="$1">$1</button>');
    html = html.replace(/<code[^>]*>(\s*<button[^>]*alysa-cmd-btn[^>]*>.*?<\/button>\s*)<\/code>/gi, '$1');
    html = html.replace(/<pre[^>]*>(\s*<button[^>]*alysa-cmd-btn[^>]*>.*?<\/button>\s*)<\/pre>/gi, '$1');
    html = html.replace(/<pre[^>]*>\s*<code[^>]*>(\s*<button[^>]*alysa-cmd-btn[^>]*>.*?<\/button>\s*)<\/code>\s*<\/pre>/gi, '$1');
    return html;
  }, [processedText]);

  const handleClick = (e) => {
    const btn = e.target.closest('.alysa-cmd-btn');
    if (btn && onCommandSelect) {
      const cmd = btn.getAttribute('data-cmd');
      onCommandSelect(cmd);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="text-sm font-sans flex flex-col gap-1 w-full max-w-full overflow-x-auto overflow-y-hidden prose-light"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default function TeamsAgentChat({ currentSection, renderTool, onOpenToolPanel }) {
  const [selectedAgent] = useState({ agent_name: "Alysa", role: "AI Engine" });

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
        const modName = (typeof window !== 'undefined' && window.location.pathname.split('/')[1]) || 'xml-pipeline';
        const tableName = 'ClientsSERVEX_General_Procces';
        
        const { data } = await supabase
          .from(tableName)
          .select('xml_raw, xml_actualizer_raw')
          .eq('company_name', 'General_Procces')
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
  const [context, setContext] = useState('Servex US');
  const [charCount, setCharCount] = useState(0);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Estados de Guía IA y Micrófono STT
  const [showAiGuideModal, setShowAiGuideModal] = useState(false);
  const [guideSearch, setGuideSearch] = useState("");
  const [guideCategory, setGuideCategory] = useState("all");
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef(null);
  const ignoreSpeechRef = useRef(false);
  const speechBaseTextRef = useRef("");
  const currentTranscriptRef = useRef("");

  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL || "https://servex-ai-back.onrender.com";

  // Listener para el botón "Guía IA" ubicado en el header de page.jsx
  useEffect(() => {
    const handleOpenAiGuide = () => setShowAiGuideModal(true);
    window.addEventListener('openAiGuide', handleOpenAiGuide);
    return () => window.removeEventListener('openAiGuide', handleOpenAiGuide);
  }, []);

  // Filtro de preguntas de la Guía IA
  const filteredGuideQuestions = useMemo(() => {
    return AI_GUIDE_QUESTIONS.filter(item => {
      const matchesCat = guideCategory === "all" || item.category === guideCategory;
      const matchesSearch = !guideSearch.trim() || 
        item.q.toLowerCase().includes(guideSearch.toLowerCase()) ||
        item.desc.toLowerCase().includes(guideSearch.toLowerCase()) ||
        item.tag.toLowerCase().includes(guideSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [guideCategory, guideSearch]);

  // Listener de mensajes globales y pasos de importación
  useEffect(() => {
    const handleGlobalMessage = (e) => {
      const { from, text, toolId } = e.detail;
      setMessages(prev => [...prev, { from, text, toolId, isNew: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };
    window.addEventListener('globalChatMessage', handleGlobalMessage);

    const handleGeneralImportStep = (e) => {
      const { step } = e.detail;
      if (step === 'csv_base') {
        setMessages(prev => [
          ...prev, 
          { from: 'bot', text: 'XML saved successfully. Base CSV is already registered in the system. Now, please upload the Updated CSV file.', isNew: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, 
          { from: 'tool', toolId: 'incert_wbs_csv_new' }
        ]);
      } else if (step === 'csv_new') {
        setMessages(prev => [
          ...prev, 
          { from: 'bot', text: 'Base CSV saved successfully. Finally, please upload the Updated CSV file.', isNew: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, 
          { from: 'tool', toolId: 'incert_wbs_csv_new' }
        ]);
      } else if (step === 'done') {
        setMessages(prev => [
          ...prev, 
          { from: 'bot', text: 'All files have been saved successfully. The Ingestion process is complete.', isNew: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        updatePhase(3);
      }
      setTimeout(() => scrollToBottom(true), 100);
    };
    window.addEventListener('wbsImportStep', handleGeneralImportStep);

    return () => {
      window.removeEventListener('globalChatMessage', handleGlobalMessage);
      window.removeEventListener('wbsImportStep', handleGeneralImportStep);
    };
  }, []);

  // Carga de historial
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${apiURL}/api/v1/General_Procces/agent/history`).catch(() => null);
        if (!res || !res.ok) return;
        const data = await res.json().catch(() => null);
        if (data && data.status === "success" && data.history) {
          setMessages(data.history);
        }
      } catch (e) {
        // Silenciosamente ignorar si el backend está offline
      }
    };
    fetchHistory();
  }, [apiURL]);

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
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
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
    setTimeout(() => {
      sendMessage(cmdLabel);
    }, 50);
  };

  const sendMessage = async (overrideText) => {
    // Interrumpir cualquier captura de voz activa
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

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { from: "user", text: queryToSend, time: now }]);
    setInput("");
    setCharCount(0);
    setShowSlashMenu(false);
    setIsLoading(true);

    // CONTROLADORES DE HERRAMIENTAS Y COMANDOS DE BARRA
    const qLower = queryToSend.toLowerCase();
    if (qLower === '/importbase' && unlockedPhase < 2) updatePhase(2);
    if (qLower === '/executeprocess' && unlockedPhase < 4) updatePhase(4);
    if (qLower === '/deletedata') updatePhase(1);

    if (qLower === '/deletedata') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Opening tenant data deletion panel...', isNew: true }, { from: 'tool', toolId: 'delete_data' }]);
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }

    if (qLower === '/importcetxml') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Opening CET Data Ingestion environment in chat...\n\nHere we process XMLs from any catalog to dynamically convert them into a structured matrix, allowing the system to automatically generate client injection and update data.', isNew: true }, { from: 'tool', toolId: 'import_cet_xml' }]);
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }

    if (qLower === '/importbase') {
      (async () => {
        try {
          const { data } = await supabase
            .from('ClientsSERVEX_General_Procces')
            .select('xml_raw, xml_name, file_name, XM_CET_import')
            .eq('company_name', 'General_Procces')
            .maybeSingle();

          const xmlContent = data?.xml_raw || data?.XM_CET_import || '';
          const hasXml = !!xmlContent && String(xmlContent).trim().length > 0;

          if (hasXml) {
            let fname = data?.xml_name || data?.file_name || '';
            if (!fname && xmlContent) {
              const m = String(xmlContent).match(/<!--\s*filename:\s*(.*?)\s*-->/i);
              if (m && m[1]) fname = m[1].trim();
              else {
                const m2 = String(xmlContent).match(/<Catalog[^>]*\bName=["']([^"']+)["']/i);
                if (m2 && m2[1]) fname = m2[1].endsWith('.xml') ? m2[1] : `${m2[1]}.xml`;
              }
            }
            if (!fname) fname = 'General Process.xml';

            setMessages(prev => [
              ...prev,
              {
                from: 'bot',
                text: `The master XML file **(${fname})** for General Process is already loaded in the database (**File already exists in DB**). The system is ready to ingest the new catalog CSV (csv_new_raw).`,
                isNew: true
              },
              { from: 'tool', toolId: 'incert_wbs_csv_new' }
            ]);
          } else {
            setMessages(prev => [
              ...prev,
              { from: 'bot', text: 'Please upload the master XML file for General Process.', isNew: true },
              { from: 'tool', toolId: 'incert_delete' }
            ]);
          }
        } catch (e) {
          setMessages(prev => [
            ...prev,
            { from: 'bot', text: 'Please upload the master XML file for General Process.', isNew: true },
            { from: 'tool', toolId: 'incert_delete' }
          ]);
        }
        setIsLoading(false);
        scrollToBottom(true);
      })();
      return;
    }

    if (qLower === '/exportcetcsv') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Opening main Results and CET CSV Export panel...', isNew: true }]);
        if (typeof onOpenToolPanel === 'function') onOpenToolPanel('xml_results');
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }

    if (qLower === '/comparecet') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Deploying CET Comparator on the main panel...', isNew: true }]);
        if (typeof onOpenToolPanel === 'function') onOpenToolPanel('compare_cet');
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }

    if (qLower === '/listpricechanges') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Opening the List Price Changes panel...', isNew: true }]);
        if (onOpenToolPanel) onOpenToolPanel('report');
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }

    if (qLower === '/graphicsdashboard') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Loading Graphics Analytics Dashboard...', isNew: true }]);
        if (onOpenToolPanel) onOpenToolPanel('graphics');
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }

    if (qLower === '/airesumen') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Generating AI Summary view...', isNew: true }]);
        if (onOpenToolPanel) onOpenToolPanel('AI_reporter');
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }

    if (qLower === '/downloadresultxml') {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      try {
        const { data, error } = await supabase
          .from('ClientsSERVEX_General_Procces')
          .select('xml_actualizer_raw')
          .eq('company_name', 'General_Procces')
          .single();

        if (error || !data || !data.xml_actualizer_raw) {
          setMessages(prev => [...prev, { from: "bot", text: "❌ Error: XML file not found in the database for General Process.", time: nowTime }]);
        } else {
          const blob = new Blob([data.xml_actualizer_raw], { type: 'application/xml' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'General Process.xml');
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setMessages(prev => [...prev, { from: "bot", text: "✅ Download started. The file General Process.xml has been saved successfully.", time: nowTime }]);
        }
      } catch (err) {
        setMessages(prev => [...prev, { from: "bot", text: "❌ An unexpected error occurred while trying to download the XML.", time: nowTime }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (queryToSend === '/createAuditor') {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { from: "bot", text: "📊 Generating smart audit report and publishing it to the Forum...", time: nowTime }]);
      
      try {
        const modulePrefix = 'api/v1/General_Procces';
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || 'admin@servex-us.com';
        
        const response = await fetch(`${apiURL}/${modulePrefix}/api/v1/agent/create-audit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail })
        });

        if (!response.ok) {
          throw new Error('Audit generator response failed');
        }
        
        await response.json();
        setMessages(prev => [...prev, { from: "bot", text: "✅ Audit successfully generated and published to the forum!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      } catch (err) {
        setMessages(prev => [...prev, { from: "bot", text: `❌ Error generating audit: ${err.message}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }
      setIsLoading(false);
      return;
    }

    if (queryToSend === '/executeProcess') {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { from: "bot", text: "⚙️ Starting ETL engine for cloud catalog processing (General Process). Please wait...", time: nowTime }]);
      
      try {
        const formData = new FormData();
        formData.append('company_name', 'General_Procces');
        
        const response = await fetch(`${apiURL}/api/v1/General_Procces/pipeline/compare-only`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Comparison engine response failed');
        }
        
        await response.json();
        setMessages(prev => [...prev, { from: "bot", text: "✅ ETL process completed successfully! The catalog has been restructured and compared. You can now review the audit in 'List Price Changes'.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setTimeout(() => { sendMessage('/listPriceChanges'); }, 1500);
      } catch (err) {
        setMessages(prev => [...prev, { from: "bot", text: `❌ Error during ETL process execution: ${err.message}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }
      setIsLoading(false);
      return;
    }

    // Solicitud ordinaria al agente IA
    try {
      const historyPayload = messages.filter(msg => msg.text).map(msg => ({
        role: msg.from === "user" ? "user" : "assistant",
        content: msg.text
      }));
      historyPayload.push({ role: "user", content: queryToSend });

      const res = await fetch(`${apiURL}/api/v1/General_Procces/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          raw_messages: [...messages.filter(msg => msg.text), { from: "user", text: queryToSend, time: now }],
          company_name: context,
          current_section: currentSection,
          unlocked_phase: unlockedPhase
        }),
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      setShowSlashMenu(false);
    }
    if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  const renderInputCard = (isCentered = false) => {
    return (
      <div
        className={`w-full ${
          isCentered ? 'max-w-[760px] mx-auto shadow-[0_12px_40px_-6px_rgba(70,71,117,0.14),0_2px_10px_-2px_rgba(70,71,117,0.06)]' : 'max-w-[1000px] mx-auto shadow-sm'
        } bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl relative focus-within:border-[#464775]/50 focus-within:ring-4 focus-within:ring-[#464775]/10 transition-all duration-300`}
      >
        {/* Menú de Comandos Slash flotante sobre el Input */}
        <AnimatePresence>
          {showSlashMenu && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute bottom-[calc(100%+8px)] left-0 right-0 mx-auto max-w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_12px_40px_rgba(70,71,117,0.12)] z-50 overflow-hidden"
            >
              <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-2">
                {Object.entries(
                  SLASH_COMMANDS.filter(cmd => cmd.phase <= unlockedPhase).reduce((acc, cmd) => {
                    const cat = cmd.category || 'Other Commands';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(cmd);
                    return acc;
                  }, {})
                ).map(([category, commands]) => (
                  <div key={category} className="mb-1.5 last:mb-0">
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50 transition-colors rounded-lg text-left"
                    >
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {category}
                      </span>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${expandedCategory === category ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {expandedCategory === category && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-1 pl-2 space-y-0.5">
                            {commands.map((cmd) => (
                              <button
                                key={cmd.id}
                                onClick={() => handleCommandSelect(cmd.label)}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#464775]/5 hover:text-[#464775] transition-colors text-left group"
                              >
                                <div className="text-slate-400 group-hover:text-[#464775] transition-colors flex-shrink-0">
                                  <cmd.icon size={13} strokeWidth={2} />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-[#464775] truncate transition-colors">{cmd.label}</span>
                                  <span className="text-[9.5px] text-slate-400 group-hover:text-slate-500 truncate transition-colors">{cmd.desc}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Textarea & Icon */}
        <div className="flex flex-col px-3.5 pt-3 pb-1 w-full">
          <div className="flex items-start gap-2.5 w-full">
            <Sparkles size={16} className={`mt-1 flex-shrink-0 transition-colors ${isRecording ? 'text-[#6264A7] animate-pulse' : 'text-[#464775]/60'}`} />
            <textarea
              ref={inputRef}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] max-[700px]:text-[14px] text-gray-800 placeholder-gray-400 leading-relaxed min-h-[28px] max-h-[140px] overflow-y-auto caret-[#464775] font-sans"
              placeholder={isRecording ? "Listening to your voice... Speak now..." : "Ask about processes, data, or system architecture… (type '/' for commands)"}
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

              {/* Espectro completo de barras de audio */}
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

        {/* Actions toolbar */}
        <div className="flex items-center justify-between px-3.5 py-2">
          <div className="flex items-center gap-1">
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
    <div className="w-full h-full flex flex-col font-sans text-gray-900 overflow-hidden relative bg-transparent">
      {/* ── MAIN SCROLLABLE CONTAINER ── */}
      <main ref={scrollContainerRef} className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent">
        {messages.length === 0 ? (
          /* ── HOME (HERO PRESENTATION & CENTERED CARD) ── */
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
              className="w-full mt-4 flex items-center justify-center gap-2 flex-wrap"
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
                      {msg.from === 'tool' ? (
                        <div className="w-full my-3 p-1 bg-transparent overflow-hidden relative flex justify-center">
                          <div className="w-full h-full overflow-y-auto max-h-[85vh] relative">
                            {renderTool && renderTool(msg.toolId)}
                          </div>
                        </div>
                      ) : (
                        <>
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

                          {/* Bubble column */}
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
                                <BotMessage text={msg.text} onCommandSelect={handleCommandSelect} />
                              ) : (
                                <p className="whitespace-pre-wrap m-0">{msg.text}</p>
                              )}
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

              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        )}
      </main>

      {/* ── INPUT (DOCKED WHEN CHATTING) ── */}
      {messages.length > 0 && (
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

                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: "all", label: "All" },
                    { id: "Ingestion & Upload", label: "Ingestion" },
                    { id: "XML Conversion", label: "Conversion" },
                    { id: "AI Comparison", label: "Comparison" },
                    { id: "Autonomous Pipeline", label: "Automation" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setGuideCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                        guideCategory === cat.id
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

      {/* Estilos globales y animaciones de keyframes */}
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
        .prose-light strong { color: #35365e; font-weight: 600; }
        .prose-light a  { color: #464775; text-decoration: underline; text-underline-offset: 2px; }
        .prose-light code:has(.alysa-cmd-btn) { background: transparent !important; border: none !important; padding: 0 !important; font-family: inherit !important; }
        .prose-light code {
          font-size: 12px; font-family: 'JetBrains Mono', monospace;
          background: #464775/10; color: #464775;
          padding: 2px 6px; border-radius: 4px;
          border: 1px solid #464775/20;
        }
        .prose-light pre:has(.alysa-cmd-btn) { background: transparent !important; border: none !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
        .prose-light pre {
          background: #f8faff; border: 1px solid #e0e7ff;
          padding: 14px; border-radius: 8px; overflow-x: auto; margin: 10px 0;
        }
        .prose-light pre code { background: transparent; border: none; color: #374151; padding: 0; }
        .prose-light ul { list-style: none; padding: 0; margin: 8px 0; }
        .prose-light ul li { padding-left: 16px; position: relative; margin-bottom: 4px; }
        .prose-light ul li::before {
          content: ''; position: absolute; left: 0; top: 9px;
          width: 5px; height: 5px; border-radius: 50%; background: #464775;
        }
        .prose-light ol { padding-left: 20px; margin: 8px 0; }
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
          .orb-ring-1, .orb-ring-2, .avatar-pulse, .dot-bounce { animation: none; }
        }
      `}</style>
    </div>
  );
}