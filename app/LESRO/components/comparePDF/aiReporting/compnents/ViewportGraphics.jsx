"use client";

import React, { useEffect, useState } from 'react';
import * as PH from "@phosphor-icons/react";
import { supabase } from '@/app/lib/supabaseClient';
import { usePathname } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadialBarChart, RadialBar
} from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, Database, Activity, Cpu } from 'lucide-react';

// Colores corporativos SERVEX (Estilo Teams)
const PRIMARY = '#464775'; 
const BRAND_COLORS = ['#464775', '#0078D4', '#605E5C', '#A80000', '#107C10', '#D83B01', '#5C2D91'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#EDEBE9] p-3 shadow-md text-[#242424] text-xs" style={{ borderRadius: '4px' }}>
        <p className="font-semibold mb-2 pb-1 border-b border-[#EDEBE9] text-[#464775]">
          {label || payload[0]?.payload?.name || 'Datos'}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex justify-between gap-6 py-0.5">
            <span style={{ color: entry.color }} className="font-medium">{entry.name || entry.dataKey}:</span>
            <span className="font-mono text-[#605E5C]">
              {typeof entry.value === 'number' && entry.name !== 'Variación %' && entry.name !== 'Cantidad'
                ? `$${entry.value.toLocaleString()}`
                : entry.value}
              {entry.name === 'Variación %' ? '%' : ''}
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
      metrics: { total: 0, modified: 0, new: 0, deleted: 0 },
      aumentos: [], reducciones: [], anomaliesData: []
    };

    const lines = md.split('\n');
    let currentSection = '';

    lines.forEach(line => {
      if (line.includes('Total Modelos Comunes Evaluados')) result.metrics.total = parseInt(line.replace(/\D/g, ''), 10) || 0;
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

      if (line.includes('Top 5 Mayores Aumentos')) currentSection = 'aumentos';
      else if (line.includes('Top 5 Mayores Reducciones')) currentSection = 'reducciones';
      else if (line.includes('Alertas de Posibles Errores')) currentSection = 'anomalies';
      else if (line.startsWith('## ')) currentSection = '';
      
      const regexVar = /\*\*(.*?)\*\*.*?:\s*(\d+)\s*->\s*(\d+)\s*\*\((.*?)\)\*/;
      if (currentSection === 'aumentos' && line.match(/^\s*\d+\.\s+\*\*/)) {
        const match = line.match(regexVar);
        if (match) {
          result.aumentos.push({
            name: match[1].substring(0, 10) + '...', original: parseFloat(match[2]), nuevo: parseFloat(match[3]), varPercent: parseFloat(match[4])
          });
        }
      }
      
      if (currentSection === 'reducciones' && line.match(/^\s*\d+\.\s+\*\*/)) {
        const match = line.match(regexVar);
        if (match) {
          result.reducciones.push({
            name: match[1].substring(0, 10) + '...', original: parseFloat(match[2]), nuevo: parseFloat(match[3]), varPercent: parseFloat(match[4])
          });
        }
      }

      if (currentSection === 'anomalies' && line.trim().startsWith('- **[')) {
        const regexAnom = /-\s*\*\*\[(.*?)\]\*\*.*?(-?\d+\.?\d*)%.*?De\s+(\d+)\s+a\s+(\d+)/;
        const match = line.match(regexAnom);
        if (match) {
          result.anomaliesData.push({
            name: match[1].substring(0, 9) + '..', fullName: match[1], varPercent: parseFloat(match[2]),
            original: parseFloat(match[3]), nuevo: parseFloat(match[4]),
            absChange: Math.abs(parseFloat(match[4]) - parseFloat(match[3]))
          });
        }
      }
    });

    return result;
  };

  if (loading) return (
    <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
      <Cpu size={48} className="animate-pulse text-[#464775] mb-4" />
      <p className="text-[#605E5C] text-[13px] font-semibold">Cargando métricas del catálogo...</p>
    </div>
  );

  if (error || !data) return (
    <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
      <AlertCircle size={48} className="text-[#A80000] mb-4" />
      <h3 className="text-[15px] font-semibold text-[#242424] mb-2">Error de Conexión</h3>
      <p className="text-[13px] text-[#605E5C] text-center">{error}</p>
    </div>
  );

  const pieData = [
    { name: 'Sin Cambios', value: Math.max(0, data.metrics.total - data.metrics.modified - data.metrics.new - data.metrics.deleted) },
    { name: 'Modificados', value: data.metrics.modified },
    { name: 'Nuevos', value: data.metrics.new },
    { name: 'Eliminados', value: data.metrics.deleted }
  ];

  const getAvg = (arr, key) => arr.length ? arr.reduce((acc, el) => acc + el[key], 0) / arr.length : 0;
  const radarData = [
    { subject: 'Aumentos', original: getAvg(data.aumentos, 'original'), nuevo: getAvg(data.aumentos, 'nuevo') },
    { subject: 'Reducciones', original: getAvg(data.reducciones, 'original'), nuevo: getAvg(data.reducciones, 'nuevo') },
    { subject: 'Anomalías', original: getAvg(data.anomaliesData, 'original'), nuevo: getAvg(data.anomaliesData, 'nuevo') },
  ];

  let severityLevels = { 'Crítico (>500%)': 0, 'Alto (100-500%)': 0, 'Medio (<100%)': 0, 'Baja (<-90%)': 0 };
  data.anomaliesData.forEach(a => {
    if (a.varPercent >= 500) severityLevels['Crítico (>500%)']++;
    else if (a.varPercent >= 100) severityLevels['Alto (100-500%)']++;
    else if (a.varPercent <= -90) severityLevels['Baja (<-90%)']++;
    else severityLevels['Medio (<100%)']++;
  });
  const radialData = Object.keys(severityLevels).map((k, i) => ({
    name: k, Cantidad: severityLevels[k], fill: BRAND_COLORS[i % BRAND_COLORS.length]
  })).filter(d => d.Cantidad > 0);

  // Reusable card container (Fluent Design approach)
  const CardContainer = ({ title, children, explanation, colSpan = 1 }) => (
    <div className={`bg-white rounded-md border border-[#EDEBE9] p-5 flex flex-col lg:col-span-${colSpan} hover:shadow-sm transition-shadow h-[380px]`}>
      <h3 className="text-[14px] font-semibold text-[#242424] mb-4 flex items-center gap-2">
        <div className="w-1 h-4 bg-[#464775] rounded-sm"></div>
        {title}
      </h3>
      <div className="flex-1 w-full min-h-0">
        {children}
      </div>
      {explanation && (
        <div className="mt-4 pt-3 border-t border-[#EDEBE9] shrink-0">
          <p className="text-[11px] text-[#605E5C] leading-snug">
             <span className="font-semibold text-[#464775]">💡 Interpretación: </span> 
             {explanation}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full bg-[#FAFAFA] flex flex-col p-6 overflow-y-auto font-sans">
      
      {/* Header Minimalista Teams */}
      <div className="flex items-center gap-3 mb-6 border-b border-[#EDEBE9] pb-4 shrink-0">
        <div className="w-10 h-10 rounded-md bg-[#464775]/10 flex items-center justify-center text-[#464775]">
          <PH.ChartBar size={24} weight="duotone" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-[#242424] m-0 leading-tight">Dashboard de Analíticas</h2>
          <p className="text-[13px] text-[#605E5C] m-0 mt-0.5">Inspección de datos estratégicos y telemetría de precios.</p>
        </div>
      </div>
      
      {/* KPIs (Estilo Teams) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 shrink-0">
        {[
          { label: 'Total Modelos', val: data.metrics.total, icon: Database, color: 'text-[#464775]' },
          { label: 'Modificados', val: data.metrics.modified, icon: Activity, color: 'text-[#0078D4]' },
          { label: 'Nuevos', val: data.metrics.new, icon: TrendingUp, color: 'text-[#107C10]' },
          { label: 'Eliminados', val: data.metrics.deleted, icon: TrendingDown, color: 'text-[#D83B01]' }
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 shrink-0">
        <CardContainer colSpan={1} title="Composición del Catálogo" explanation="Distribución general de los productos. Un volumen alto de modelos 'Sin Cambios' representa estabilidad operativa.">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                {pieData.map((e, i) => <Cell key={`c-${i}`} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />)}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#605E5C' }}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContainer>

        <CardContainer colSpan={2} title="Top Variaciones Estratégicas" explanation="Compara el 'Precio Base' contra el 'Precio Ajustado'. Permite auditar visualmente los impactos más fuertes.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...data.aumentos, ...data.reducciones]} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEBE9"/>
              <XAxis dataKey="name" tick={{fontSize: 10, fill: '#605E5C'}} interval={0} angle={-15} textAnchor="end" height={60} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize: 10, fill: '#605E5C'}} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${v/1000}k`}/>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend iconType="rect" wrapperStyle={{ fontSize: '11px', color: '#605E5C' }}/>
              <Bar dataKey="original" name="Precio Base" fill="#C8C6C4" radius={[2, 2, 0, 0]} barSize={16} />
              <Bar dataKey="nuevo" name="Precio Ajustado" fill="#464775" radius={[2, 2, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </CardContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 shrink-0">
        <CardContainer colSpan={1} title="Trayectoria de Anomalías" explanation="Rastrea la evolución entre precios. Las separaciones pronunciadas entre líneas alertan sobre posibles errores tipográficos o algorítmicos.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.anomaliesData} margin={{ top: 5, right: 15, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEBE9"/>
              <XAxis dataKey="name" tick={{fontSize: 10, fill: '#605E5C'}} angle={-25} textAnchor="end" axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize: 10, fill: '#605E5C'}} axisLine={false} tickLine={false}/>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#605E5C' }}/>
              <Line type="monotone" dataKey="original" name="Histórico" stroke="#A19F9D" strokeWidth={2} dot={{r: 3, fill: '#A19F9D'}} activeDot={{r: 5}}/>
              <Line type="monotone" dataKey="nuevo" name="Nuevo Valor" stroke="#0078D4" strokeWidth={2} dot={{r: 3, fill: '#0078D4'}} activeDot={{r: 5}}/>
            </LineChart>
          </ResponsiveContainer>
        </CardContainer>

        <CardContainer colSpan={1} title="Magnitud Financiera Neta (Riesgo)" explanation="Cuantifica en área el impacto monetario total ($) desplazado por las anomalías detectadas en el catálogo.">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.anomaliesData} margin={{ top: 5, right: 15, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorAbs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#464775" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#464775" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDEBE9"/>
              <XAxis dataKey="name" tick={{fontSize: 10, fill: '#605E5C'}} angle={-25} textAnchor="end" axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize: 10, fill: '#605E5C'}} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${v/1000}k`}/>
              <RechartsTooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="absChange" name="Variación Absoluta ($)" stroke="#464775" strokeWidth={2} fillOpacity={1} fill="url(#colorAbs)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 shrink-0">
        <CardContainer colSpan={1} title="Dispersión de Volatilidad" explanation="Posiciona los errores (3D). Los puntos más altos (eje Y) y a la derecha (eje X) requieren revisión urgente.">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEBE9"/>
              <XAxis type="number" dataKey="nuevo" name="Precio Nuevo" tick={{fontSize: 10, fill: '#605E5C'}} tickFormatter={(v)=>`$${v/1000}k`} axisLine={false} tickLine={false}/>
              <YAxis type="number" dataKey="varPercent" name="Variación %" tick={{fontSize: 10, fill: '#605E5C'}} axisLine={false} tickLine={false}/>
              <ZAxis type="number" dataKey="absChange" range={[40, 300]} />
              <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
              <Scatter name="Anomalías" data={data.anomaliesData} fill="#D83B01" opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContainer>

        <CardContainer colSpan={1} title="Ejes de Comportamiento" explanation="Cruza los promedios globales. Un área irregular sugiere que el catálogo ha sufrido un desbalance sistémico.">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#EDEBE9" />
              <PolarAngleAxis dataKey="subject" tick={{fill: '#242424', fontSize: 11}} />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{fontSize: 9, fill: '#A19F9D'}} />
              <Radar name="Precio Base" dataKey="original" stroke="#A19F9D" fill="#A19F9D" fillOpacity={0.2} />
              <Radar name="Precio Final" dataKey="nuevo" stroke="#464775" fill="#464775" fillOpacity={0.4} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#605E5C' }}/>
              <RechartsTooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContainer>

        <CardContainer colSpan={1} title="Clúster de Severidad" explanation="Clasifica las anomalías. Barras densas en niveles 'Críticos' obligan a rechazar la actualización.">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%" barSize={12} data={radialData}>
              <RadialBar minAngle={15} background clockWise dataKey="Cantidad" cornerRadius={2} />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ fontSize: '11px', right: 0, color: '#605E5C' }} />
              <RechartsTooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </CardContainer>
      </div>
      
    </div>
  );
};

export default ViewportGraphics;
