"use client";

import React, { useEffect, useState, useRef } from 'react';
import * as PH from "@phosphor-icons/react";
import { supabase } from '@/app/lib/supabaseClient';
import { usePathname } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis, AreaChart, Area, ComposedChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  AlertCircle, TrendingUp, TrendingDown, Database, Activity, Cpu,
  Trash2, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

// Colores corporativos SERVEX Dark Theme
const PRIMARY = '#ffffff'; 
const BRAND_COLORS = ['#ffffff', '#a1a1aa', '#71717a', '#3f3f46', '#27272a', '#18181b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090b]/95 backdrop-blur-xl border border-white/15 p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-zinc-200 text-xs font-sans">
        <p className="font-semibold mb-2 pb-1 border-b border-white/10 text-white">
          {label || payload[0]?.payload?.name || 'Data'}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex justify-between gap-6 py-0.5">
            <span style={{ color: entry.color || entry.fill }} className="font-medium">{entry.name || entry.dataKey}:</span>
            <span className="font-mono text-zinc-300">
              {typeof entry.value === 'number' && entry.name !== 'Variation %' && entry.name !== 'Quantity'
                ? `$${entry.value.toLocaleString()}`
                : entry.value}
              {entry.name === 'Variation %' ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ViewportGraphics = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
  };
  const pathname = usePathname();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === ESTADOS DEL CHAT ===
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [userId] = useState(`USER-${Math.floor(Math.random() * 10000)}`);
  
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const moduleMatch = pathname.match(/^\/([A-Z]+)\//);
        const moduleName = moduleMatch ? moduleMatch[1] : null;

        if (!moduleName) throw new Error("Módulo no identificado en URL.");

        const tableName = moduleName === "LESRO" ? "ClientsSERVEX" : `ClientsSERVEX_${moduleName}`;
        
        const { data: dbData, error: dbError } = await supabase
          .from(tableName)
          .select('audit_summary_markdown1')
          .eq('company_name', moduleName)
          .maybeSingle();

        if (dbError) throw dbError;
        
        if (dbData && dbData.audit_summary_markdown1) {
          const parsed = parseMarkdown(dbData.audit_summary_markdown1);
          setData(parsed);
        } else {
          throw new Error("No hay datos de auditoría disponibles.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pathname]);

  const parseMarkdown = (md) => {
    const result = {
      metrics: { total: 0, modified: 0, new: 0, deleted: 0, totalCells: 0 },
      aumentos: [], reducciones: [], anomaliesData: []
    };

    const lines = md.split('\n');
    let currentSection = '';

    lines.forEach(line => {
      if (line.includes('Total Modelos Comunes Evaluados') || line.includes('Total Models Comunes Evaluados')) result.metrics.total = parseInt(line.replace(/\D/g, ''), 10) || 0;
      if (line.includes('Modelos Modificados')) {
        const match = line.match(/: (\d+)/);
        if(match) result.metrics.modified = parseInt(match[1], 10);
      }
      if (line.includes('Nuevos Modelos Detectados')) {
         const match = line.match(/: (\d+)/);
         if(match) result.metrics.new = parseInt(match[1], 10);
      }
      if (line.includes('Modelos Eliminados')) {
         const match = line.match(/: (\d+)/);
         if(match) result.metrics.deleted = parseInt(match[1], 10);
      }
      if (line.includes('Total Cambios en Celdas')) {
         const match = line.match(/: (\d+)/);
         if(match) result.metrics.totalCells = parseInt(match[1], 10);
      }

      if (line.includes('Top 5 Mayores Aumentos')) currentSection = 'aumentos';
      else if (line.includes('Top 5 Mayores Reducciones')) currentSection = 'reducciones';
      else if (line.includes('Alertas de Posibles Errores')) currentSection = 'anomalies';
      else if (line.startsWith('## ')) currentSection = '';
      
      const regexVar = /\*\*(.*?)\*\*.*?:\s*(\d+)\s*->\s*(\d+)\s*\*\((.*?)\)\*/;
      if (currentSection === 'aumentos' && line.match(/^\s*\d+\.\s+\*\*/)) {
        const match = line.match(regexVar);
        if (match) {
          result.aumentos.push({
            name: match[1].substring(0, 15) + '...', fullName: match[1], original: parseFloat(match[2]), nuevo: parseFloat(match[3]), varPercent: parseFloat(match[4]), absChange: Math.abs(parseFloat(match[3]) - parseFloat(match[2]))
          });
        }
      }
      
      if (currentSection === 'reducciones' && line.match(/^\s*\d+\.\s+\*\*/)) {
        const match = line.match(regexVar);
        if (match) {
          result.reducciones.push({
            name: match[1].substring(0, 15) + '...', fullName: match[1], original: parseFloat(match[2]), nuevo: parseFloat(match[3]), varPercent: parseFloat(match[4]), absChange: Math.abs(parseFloat(match[3]) - parseFloat(match[2]))
          });
        }
      }

      if (currentSection === 'anomalies' && line.trim().startsWith('- **[')) {
        const regexAnom = /-\s*\*\*\[(.*?)\]\*\*.*?(-?\d+\.?\d*)%.*?De\s+(\d+)\s+a\s+(\d+)/;
        const match = line.match(regexAnom);
        if (match) {
          result.anomaliesData.push({
            name: match[1].substring(0, 12) + '..', fullName: match[1], varPercent: parseFloat(match[2]),
            original: parseFloat(match[3]), nuevo: parseFloat(match[4]),
            absChange: Math.abs(parseFloat(match[4]) - parseFloat(match[3]))
          });
        }
      }
    });

    return result;
  };

  // === FUNCIONES DE CHAT ===
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const confirmClearChat = () => {
    setMessages([]);
    setAttachedFile(null);
    setShowDeleteConfirm(false);
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.continuous = false;
      recognition.interimResults = false;

      let finalTranscript = "";

      recognition.onstart = () => { setIsListening(true); finalTranscript = ""; };
      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
      };
      recognition.onend = () => {
        setIsListening(false);
        if (finalTranscript.trim()) {
          setInputValue(prev => prev.trim() ? prev + " " + finalTranscript.trim() : finalTranscript.trim());
        }
      };
      recognition.onerror = () => { setIsListening(false); };
      recognitionRef.current = recognition;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) setAttachedFile(file);
    else alert("Please select a valid CSV file");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() && !attachedFile) return;

    const userText = attachedFile ? `${inputValue} (Attached file: ${attachedFile.name})`.trim() : inputValue;

    const newMessage = {
      from: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    setAttachedFile(null);
    setIsLoadingChat(true);

    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'https://servex-ai-back.onrender.com';
      const response = await fetch(`${apiURL}/context-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          mensaje: userText,
          rol: "business data specialist"
        }),
      });
      const resData = await response.json();
      setMessages(prev => [...prev, {
        from: 'bot',
        text: resData.respuesta,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages(prev => [...prev, {
        from: 'bot',
        text: "**Connection error with server (Alysa)**",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoadingChat(false);
    }
  };


  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] min-h-[80vh] bg-transparent text-xs font-semibold text-zinc-400 font-sans">
      <Cpu size={40} className="animate-pulse text-zinc-200 mb-3" />
      <p className="text-zinc-400 text-[13px] font-medium">Loading catalog metrics...</p>
    </div>
  );

  if (error || !data) return (
    <div className="w-full h-full bg-transparent flex flex-col items-center justify-center p-6">
      <AlertCircle size={44} className="text-amber-400 mb-3" />
      <h3 className="text-[15px] font-semibold text-white mb-1">Connection Error</h3>
      <p className="text-[13px] text-zinc-400 text-center max-w-sm">{error || "No data available."}</p>
    </div>
  );


  // --- PROCESAMIENTO DE DATOS PARA LAS 5 NUEVAS GRÁFICAS ---

  // 1. Catalog Stability Index (Gauge)
  const gaugeData = [
    { name: 'Untouched', value: Math.max(0, data.metrics.total - data.metrics.modified - data.metrics.new - data.metrics.deleted) },
    { name: 'Modified', value: data.metrics.modified },
    { name: 'New', value: data.metrics.new },
    { name: 'Deleted', value: data.metrics.deleted }
  ];

  // 2. Price Deviation Quadrant (Scatter)
  const scatterData = [...data.aumentos, ...data.reducciones, ...data.anomaliesData].map(item => ({
    name: item.name,
    Original: item.original,
    'Variation %': item.varPercent,
    absChange: item.absChange || Math.abs(item.nuevo - item.original)
  }));

  // 3. Diverging Volatility (Diverging Bar)
  const divergingData = [...data.aumentos, ...data.reducciones].map(item => ({
    name: item.name,
    'Variation %': item.varPercent,
    fill: item.varPercent > 0 ? '#10b981' : '#f43f5e'
  })).sort((a,b) => b['Variation %'] - a['Variation %']);

  // 4. Financial Impact Distribution (BarChart by absChange)
  const impactData = [...data.anomaliesData, ...data.aumentos, ...data.reducciones]
    .filter((v,i,a)=>a.findIndex(t=>(t.name === v.name))===i)
    .sort((a,b) => b.absChange - a.absChange)
    .slice(0, 10); // Top 10 impacts

  // 5. Transition Delta (Composed Bar + Line Chart)
  const transitionData = [...data.aumentos, ...data.reducciones]
    .filter((v,i,a)=>a.findIndex(t=>(t.name === v.name))===i)
    .slice(0, 7); // Top 7 mostly


  // 6. Servex Copilot Operational Efficiency (Radar)
  const radarEfficiencyData = [
    { metric: 'Speed', Traditional: 15, ServexCopilot: 99 },
    { metric: 'Accuracy', Traditional: 70, ServexCopilot: 99 },
    { metric: 'Time Savings', Traditional: 10, ServexCopilot: 99 },
    { metric: 'Cost Reduction', Traditional: 20, ServexCopilot: 96 },
    { metric: 'Resource Allocation', Traditional: 15, ServexCopilot: 98 },
  ];

  // 7. Time-to-Delivery Velocity Benchmark (BarChart)
  const timeSavingsData = [
    { stage: 'Data Extraction', Traditional: 72, ServexCopilot: 0.05 },
    { stage: 'ETL Alignment', Traditional: 120, ServexCopilot: 0.05 },
    { stage: 'Price Audit', Traditional: 168, ServexCopilot: 0.05 },
    { stage: 'Error Validation', Traditional: 96, ServexCopilot: 0.03 },
    { stage: 'Final Storage', Traditional: 48, ServexCopilot: 0.02 },
  ];

  // --- DATOS EXPLICATIVOS DE /listPriceChanges ---
  // 3. Price Change Category Breakdown (Explicación de las 5 pestañas de /listPriceChanges)
  const categoryBreakdownData = [
    { category: 'Increases', count: data.aumentos.length, label: 'Price Increases' },
    { category: 'Reductions', count: data.reducciones.length, label: 'Price Reductions' },
    { category: 'Anomalies', count: data.anomaliesData.length, label: 'Data Anomalies' },
    { category: 'New Items', count: data.metrics.new, label: 'New Models' },
    { category: 'Removed', count: data.metrics.deleted, label: 'Removed Models' },
  ];

  // 4. Top Price Variation Comparison (Explica los mayores cambios de /listPriceChanges)
  const topVariationsData = [...data.aumentos.slice(0, 4), ...data.reducciones.slice(0, 4)]
    .map(item => ({
      name: item.name,
      'Base Price': item.original,
      'Adjusted Price': item.nuevo,
      'Change %': item.varPercent
    })).slice(0, 7);

  const CardContainer = ({ title, children, explanation, colSpan = 1, summaryNode }) => (
    <motion.div variants={itemVariants} className={`bg-[#09090b]/85 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col lg:col-span-${colSpan} shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all duration-300 h-[480px]`}>
      <h3 className="text-[14px] font-bold text-white mb-3 flex items-center gap-2">
        <div className="w-1.5 h-4 bg-white/70 rounded-full"></div>
        {title}
      </h3>
      {summaryNode && (
        <div className="mb-4 p-3 bg-white/[0.03] border border-white/10 rounded-xl text-[11px] text-zinc-300 max-h-[80px] overflow-y-auto">
          {summaryNode}
        </div>
      )}
      <div className="flex-1 w-full min-h-0">
        {children}
      </div>
      {explanation && (
        <div className="mt-4 pt-3 border-t border-white/10 shrink-0">
          <p className="text-[11px] text-zinc-400 leading-snug">
             <span className="font-semibold text-white uppercase tracking-wider text-[10px]">Analysis: </span> 
             {explanation}
          </p>
        </div>
      )}
    </motion.div>
  );

  return (
    <main className="flex-1 flex flex-col relative bg-transparent h-[100%] font-sans overflow-hidden">
      
      {/* Input oculto para CSV */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />

      {/* Modal Clear Chat */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative bg-[#09090b]/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 w-full max-w-[400px] overflow-hidden text-zinc-100">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4 text-amber-400">
                  <AlertCircle size={22} strokeWidth={2.5} />
                  <h3 className="text-[17px] font-bold tracking-tight text-white">Clear conversation?</h3>
                </div>
                <p className="text-[14px] text-zinc-400 leading-relaxed font-normal">This will delete all messages in this session. This action is permanent.</p>
              </div>
              <div className="flex gap-2 p-4 bg-white/[0.02] border-t border-white/10 justify-end">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-2 text-[12px] font-bold text-zinc-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 uppercase tracking-wider transition-all">Cancel</button>
                <button onClick={confirmClearChat} className="px-5 py-2 text-[12px] font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 uppercase tracking-wider transition-all">Delete all</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contenedor scrolleable general */}
      <div className="flex-1 overflow-y-auto pb-[180px] p-4 sm:p-6 relative custom-scrollbar">
        
        <div className="w-full max-w-6xl mx-auto">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* 5. Price Deviation Quadrant */}
            <CardContainer 
              colSpan={2} 
              title="Price Deviation Quadrant" 
              explanation="A matrix plotting original price vs percentage variation. Helps answer: Are huge percentage jumps happening on cheap items (low risk) or expensive ones (high risk)?"
              summaryNode={
                <div><span className="font-semibold text-white">Outliers plotted:</span> {scatterData.length} models</div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)"/>
                  <XAxis type="number" dataKey="Original" name="Original Price" tick={{fontSize: 10, fill: '#a1a1aa'}} tickFormatter={(v)=>`$${v/1000}k`} axisLine={false} tickLine={false}/>
                  <YAxis type="number" dataKey="Variation %" name="Variation %" tick={{fontSize: 10, fill: '#a1a1aa'}} axisLine={false} tickLine={false}/>
                  <ZAxis type="number" dataKey="absChange" range={[40, 300]} name="Absolute Change" />
                  <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                  <Scatter name="Deviations" data={scatterData} fill="#ffffff" opacity={0.8} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContainer>

            {/* 3. Price Change Category Breakdown */}
            <CardContainer 
              colSpan={1} 
              title="Price Change Category Breakdown" 
              explanation="Visual breakdown of catalog modifications from /listPriceChanges, categorizing updates into Price Increases, Reductions, Anomalies, New Products, and Removed Items."
              summaryNode={
                <div>
                  <span className="font-semibold text-white">Audit Scope: 5 Key Categories Audited in /listPriceChanges</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={categoryBreakdownData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="monoAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Model Count" stroke="#ffffff" strokeWidth={2.5} fillOpacity={1} fill="url(#monoAreaGrad)" dot={{ r: 4, fill: '#ffffff', stroke: '#09090b', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContainer>

            {/* 4. Top Price Variation Comparison */}
            <CardContainer 
              colSpan={1} 
              title="Top Price Variation Comparison" 
              explanation="Direct visual comparison of Base Price vs Adjusted Price for top updated models highlighted in the /listPriceChanges tables."
              summaryNode={
                <div>
                  <span className="font-semibold text-white">Model Deltas: Base vs Adjusted Price comparison</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVariationsData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)"/>
                  <XAxis dataKey="name" tick={{fontSize: 10, fill: '#a1a1aa'}} interval={0} angle={-20} textAnchor="end" height={60} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize: 10, fill: '#a1a1aa'}} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${v/1000}k`}/>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}/>
                  <Bar dataKey="Base Price" name="Base Price" fill="#52525b" radius={[3, 3, 0, 0]} barSize={18} />
                  <Bar dataKey="Adjusted Price" name="Adjusted Price" fill="#ffffff" radius={[3, 3, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </CardContainer>

            {/* Transition Delta */}
            <CardContainer 
              colSpan={2} 
              title="Transition Delta" 
              explanation="Side-by-side comparison of Base vs Adjusted Price for top items, overlaid with the Percentage Variation trendline."
              summaryNode={
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-white">Top Variation: {transitionData[0]?.name} ({transitionData[0]?.varPercent}%)</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={transitionData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 10, fill: '#a1a1aa'}} interval={0} angle={-15} textAnchor="end" height={60} axisLine={false} tickLine={false}/>
                  <YAxis yAxisId="left" tick={{fontSize: 10, fill: '#a1a1aa'}} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${v/1000}k`}/>
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: '#a1a1aa'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}/>
                  <Bar yAxisId="left" dataKey="original" name="Base Price" fill="#52525b" barSize={20} radius={[2, 2, 0, 0]} />
                  <Bar yAxisId="left" dataKey="nuevo" name="Adjusted Price" fill="#ffffff" barSize={20} radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="varPercent" name="Variation %" stroke="#38bdf8" strokeWidth={2.5} dot={{r:4, fill:'#38bdf8', stroke:'#09090b', strokeWidth:2}} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContainer>

            {/* Servex Copilot ROI & Time Savings Benchmark Section */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#09090b]/85 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-5 bg-white/70 rounded-full"></div>
                  <h2 className="text-[15px] font-bold text-white tracking-tight">
                    Servex Copilot ROI & Time Savings Analysis
                  </h2>
                </div>
                <span className="text-[11px] font-semibold bg-white/10 text-zinc-200 px-3 py-1 rounded-full border border-white/20">
                  Benchmark vs 3-Week Manual Workflow
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 6. Servex Copilot Efficiency Matrix (Radar) */}
                <CardContainer 
                  colSpan={1} 
                  title="Servex Copilot Efficiency Matrix" 
                  explanation="Radar comparison benchmarking Servex Copilot against traditional 3-week manual catalog workflows across key operational dimensions."
                  summaryNode={
                    <div>
                      <span className="font-semibold text-white">Efficiency Score: 98.2% vs 26.0% Traditional</span>
                    </div>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarEfficiencyData}>
                      <PolarGrid stroke="rgba(255,255,255,0.15)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#d4d4d8' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#71717a' }} />
                      <Radar name="Traditional (3 Weeks)" dataKey="Traditional" stroke="#71717a" fill="#71717a" fillOpacity={0.25} />
                      <Radar name="Servex Copilot Engine" dataKey="ServexCopilot" stroke="#ffffff" fill="#ffffff" fillOpacity={0.4} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContainer>

                {/* 7. Catalog Processing Time Savings (BarChart Benchmark) */}
                <CardContainer 
                  colSpan={1} 
                  title="Catalog Processing Time Savings" 
                  explanation="Direct benchmark of execution hours. Traditional manual updates require ~3 weeks (504 hrs), whereas Servex Copilot completes the entire flow in ~12 mins (0.2 hrs), saving 99.8% of delivery time."
                  summaryNode={
                    <div>
                      <span className="font-semibold text-white">Time Saved: 503.8 Hours per Catalog (99.8% Reduction)</span>
                    </div>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeSavingsData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="stage" tick={{ fontSize: 10, fill: '#a1a1aa' }} interval={0} angle={-20} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}h`} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                      <Bar dataKey="Traditional" name="Traditional (3 Weeks)" fill="#52525b" radius={[2, 2, 0, 0]} barSize={20} />
                      <Bar dataKey="ServexCopilot" name="Servex Copilot (Minutes)" fill="#ffffff" radius={[2, 2, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContainer>
              </div>
            </motion.div>

            {/* 1. Catalog Stability Index */}
            <CardContainer 
              colSpan={2} 
              title="Catalog Stability Index" 
              explanation="Gauge showing the proportion of the catalog that remained untouched vs modified. A higher 'Untouched' arc indicates operational stability."
              summaryNode={
                <div className="grid grid-cols-2 gap-2 text-zinc-300">
                  <div><span className="font-semibold text-white">Untouched:</span> {gaugeData[0].value}</div>
                  <div><span className="font-semibold text-white">Modified:</span> {gaugeData[1].value}</div>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gaugeData} cx="50%" cy="80%" startAngle={180} endAngle={0} innerRadius={90} outerRadius={120} paddingAngle={2} dataKey="value" stroke="none">
                    {gaugeData.map((e, i) => <Cell key={`c-${i}`} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContainer>
            
          </motion.div>
        </div>

      </div>

    </main>
  );
};

export default ViewportGraphics;
