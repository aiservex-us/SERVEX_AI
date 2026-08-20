"use client";

import React, { useEffect, useState, useRef } from 'react';
import * as PH from "@phosphor-icons/react";
import { supabase } from '@/app/lib/supabaseClient';
import { usePathname } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  AlertCircle, TrendingUp, TrendingDown, Database, Activity, Cpu,
  Trash2, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

// Colores corporativos SERVEX (Estilo Teams)
const PRIMARY = '#464775'; 
const BRAND_COLORS = ['#464775', '#0078D4', '#605E5C', '#A80000', '#107C10', '#D83B01', '#5C2D91'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#EDEBE9] p-3 shadow-md text-[#242424] text-xs" style={{ borderRadius: '4px' }}>
        <p className="font-semibold mb-2 pb-1 border-b border-[#EDEBE9] text-[#464775]">
          {label || payload[0]?.payload?.name || 'Data'}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex justify-between gap-6 py-0.5">
            <span style={{ color: entry.color || entry.fill }} className="font-medium">{entry.name || entry.dataKey}:</span>
            <span className="font-mono text-[#605E5C]">
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
      const response = await fetch('http://localhost:8000/context-chat', {
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
    <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
      <Cpu size={48} className="animate-pulse text-[#464775] mb-4" />
      <p className="text-[#605E5C] text-[13px] font-semibold">Loading catalog metrics...</p>
    </div>
  );

  if (error || !data) return (
    <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
      <AlertCircle size={48} className="text-[#A80000] mb-4" />
      <h3 className="text-[15px] font-semibold text-[#242424] mb-2">Connection Error</h3>
      <p className="text-[13px] text-[#605E5C] text-center">{error}</p>
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
    fill: item.varPercent > 0 ? '#107C10' : '#A80000'
  })).sort((a,b) => b['Variation %'] - a['Variation %']);

  // 4. Financial Impact Distribution (BarChart by absChange)
  const impactData = [...data.anomaliesData, ...data.aumentos, ...data.reducciones]
    // Filter duplicates by name
    .filter((v,i,a)=>a.findIndex(t=>(t.name === v.name))===i)
    .sort((a,b) => b.absChange - a.absChange)
    .slice(0, 10); // Top 10 impacts

  // 5. Transition Delta (Composed Bar + Line Chart)
  const transitionData = [...data.aumentos, ...data.reducciones]
    .filter((v,i,a)=>a.findIndex(t=>(t.name === v.name))===i)
    .slice(0, 7); // Top 7 mostly


  const CardContainer = ({ title, children, explanation, colSpan = 1, summaryNode }) => (
    <div className={`bg-white rounded-md border border-[#EDEBE9] p-5 flex flex-col lg:col-span-${colSpan} hover:shadow-sm transition-shadow h-[480px]`}>
      <h3 className="text-[14px] font-semibold text-[#242424] mb-3 flex items-center gap-2">
        <div className="w-1 h-4 bg-[#464775] rounded-sm"></div>
        {title}
      </h3>
      {summaryNode && (
        <div className="mb-4 p-3 bg-[#FAFAFA] border border-[#EDEBE9] rounded-md text-[11px] text-[#605E5C] max-h-[80px] overflow-y-auto">
          {summaryNode}
        </div>
      )}
      <div className="flex-1 w-full min-h-0">
        {children}
      </div>
      {explanation && (
        <div className="mt-4 pt-3 border-t border-[#EDEBE9] shrink-0">
          <p className="text-[11px] text-[#605E5C] leading-snug">
             <span className="font-semibold text-[#464775]">💡 Interpretation: </span> 
             {explanation}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <main className="flex-1 flex flex-col relative bg-[#FAFAFA] h-[100%] font-sans overflow-hidden">
      
      {/* Input oculto para CSV */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />

      {/* Modal Clear Chat */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(false)} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative bg-white rounded-xl shadow-2xl border border-[#EDEBE9] w-full max-w-[400px] overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4 text-[#A80000]">
                  <AlertCircle size={22} strokeWidth={2.5} />
                  <h3 className="text-[17px] font-bold tracking-tight text-[#242424]">Clear conversation?</h3>
                </div>
                <p className="text-[14px] text-[#605E5C] leading-relaxed font-medium">This will delete all messages in this session. This action is permanent.</p>
              </div>
              <div className="flex gap-2 p-4 bg-[#F5F5F5] justify-end">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-2 text-[12px] font-bold text-[#242424] bg-white border border-[#D1D1D1] rounded-md hover:bg-[#F0F0F0] uppercase tracking-wider">Cancel</button>
                <button onClick={confirmClearChat} className="px-5 py-2 text-[12px] font-bold text-white bg-[#A80000] rounded-md hover:bg-[#8A0000] uppercase tracking-wider">Delete all</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Analíticas */}
      <header className="h-16 flex flex-shrink-0 items-center justify-between px-6 bg-white border-b border-[#EDEBE9] z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#464775]/10 flex items-center justify-center text-[#464775]">
            <PH.ChartBar size={24} weight="duotone" />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-[#242424] m-0 leading-tight">Analytics Dashboard</h2>
            <p className="text-[13px] text-[#605E5C] m-0 mt-0.5">Strategic data inspection and price telemetry.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-all mr-1" title="Clear Chat">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Contenedor scrolleable general */}
      <div className="flex-1 overflow-y-auto pb-[180px] p-6 relative">
        
        <div className="w-full max-w-6xl mx-auto">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total Models', val: data.metrics.total, icon: Database, color: 'text-[#464775]' },
              { label: 'Modified', val: data.metrics.modified, icon: Activity, color: 'text-[#0078D4]' },
              { label: 'New', val: data.metrics.new, icon: TrendingUp, color: 'text-[#107C10]' },
              { label: 'Deleted', val: data.metrics.deleted, icon: TrendingDown, color: 'text-[#D83B01]' },
              { label: 'Cell Changes', val: data.metrics.totalCells || 0, icon: FileText, color: 'text-[#5C2D91]' }
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white p-4 rounded-md border border-[#EDEBE9] hover:shadow-sm transition-shadow flex items-center gap-4">
                <div className={`p-2.5 rounded bg-[#FAFAFA] ${kpi.color}`}>
                  <kpi.icon size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[12px] text-[#605E5C] font-medium">{kpi.label}</p>
                  <p className="text-[20px] font-semibold text-[#242424] leading-tight">{kpi.val.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6 mb-6">
            
            {/* 1. Catalog Stability Index */}
            <CardContainer 
              colSpan={1} 
              title="Catalog Stability Index" 
              explanation="Gauge showing the proportion of the catalog that remained untouched vs modified. A higher 'Untouched' arc indicates operational stability."
              summaryNode={
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-semibold">Untouched:</span> {gaugeData[0].value}</div>
                  <div><span className="font-semibold">Modified:</span> {gaugeData[1].value}</div>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gaugeData} cx="50%" cy="80%" startAngle={180} endAngle={0} innerRadius={90} outerRadius={120} paddingAngle={2} dataKey="value" stroke="none">
                    {gaugeData.map((e, i) => <Cell key={`c-${i}`} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#605E5C' }}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContainer>

            {/* 2. Transition Delta */}
            <CardContainer 
              colSpan={2} 
              title="Transition Delta" 
              explanation="Side-by-side comparison of Base vs Adjusted Price for top items, overlaid with the Percentage Variation trendline."
              summaryNode={
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-[#107C10]">🔥 Top Variation: {transitionData[0]?.name} ({transitionData[0]?.varPercent}%)</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={transitionData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#EDEBE9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 10, fill: '#605E5C'}} interval={0} angle={-15} textAnchor="end" height={60} axisLine={false} tickLine={false}/>
                  <YAxis yAxisId="left" tick={{fontSize: 10, fill: '#605E5C'}} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${v/1000}k`}/>
                  <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: '#605E5C'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#605E5C' }}/>
                  <Bar yAxisId="left" dataKey="original" name="Base Price" fill="#C8C6C4" barSize={20} radius={[2, 2, 0, 0]} />
                  <Bar yAxisId="left" dataKey="nuevo" name="Adjusted Price" fill="#464775" barSize={20} radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="varPercent" name="Variation %" stroke="#107C10" strokeWidth={3} dot={{r:5, fill:'#107C10', stroke:'#fff', strokeWidth:2}} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContainer>
          </div>

          <div className="flex flex-col gap-6 mb-6">
            
            {/* 3. Diverging Volatility */}
            <CardContainer 
              colSpan={1} 
              title="Diverging Volatility" 
              explanation="Contrasts the extremes of the catalog updates. Positive percentage shifts branch right, while negative shifts branch left."
              summaryNode={
                <div>
                  <span className="font-semibold text-[#107C10]">Highest Increase: {divergingData[0]?.['Variation %']}%</span> | 
                  <span className="font-semibold text-[#A80000]"> Highest Decrease: {divergingData[divergingData.length-1]?.['Variation %']}%</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={divergingData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDEBE9"/>
                  <XAxis type="number" tick={{fontSize: 10, fill: '#605E5C'}} axisLine={false} tickLine={false}/>
                  <YAxis dataKey="name" type="category" tick={{fontSize: 9, fill: '#605E5C'}} axisLine={false} tickLine={false} width={80}/>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="Variation %" radius={[2, 2, 2, 2]} barSize={12}>
                    {divergingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContainer>

            {/* 4. Financial Impact Distribution */}
            <CardContainer 
              colSpan={1} 
              title="Financial Impact Distribution" 
              explanation="Ranks anomalies and top variations purely by their absolute dollar impact, directing attention to the costliest shifts."
              summaryNode={
                <div>
                  <span className="font-semibold text-[#A80000]">🚨 Highest $ Displacement: </span> 
                  [{impactData[0]?.name}: ${impactData[0]?.absChange.toLocaleString()}]
                </div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEBE9"/>
                  <XAxis dataKey="name" tick={{fontSize: 10, fill: '#605E5C'}} interval={0} angle={-25} textAnchor="end" height={60} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize: 10, fill: '#605E5C'}} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${v/1000}k`}/>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="absChange" name="Absolute Impact ($)" fill="#A80000" radius={[2, 2, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </CardContainer>

          </div>

          <div className="flex flex-col gap-6 mb-6">
            
            {/* 5. Price Deviation Quadrant */}
            <CardContainer 
              colSpan={1} 
              title="Price Deviation Quadrant" 
              explanation="A matrix plotting original price vs percentage variation. Helps answer: Are huge percentage jumps happening on cheap items (low risk) or expensive ones (high risk)?"
              summaryNode={
                <div><span className="font-semibold">Outliers plotted:</span> {scatterData.length} models</div>
              }
            >
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDEBE9"/>
                  <XAxis type="number" dataKey="Original" name="Original Price" tick={{fontSize: 10, fill: '#605E5C'}} tickFormatter={(v)=>`$${v/1000}k`} axisLine={false} tickLine={false}/>
                  <YAxis type="number" dataKey="Variation %" name="Variation %" tick={{fontSize: 10, fill: '#605E5C'}} axisLine={false} tickLine={false}/>
                  <ZAxis type="number" dataKey="absChange" range={[40, 300]} name="Absolute Change" />
                  <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                  <Scatter name="Deviations" data={scatterData} fill="#0078D4" opacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContainer>

          </div>
        </div>

      </div>

    </main>
  );
};

export default ViewportGraphics;
