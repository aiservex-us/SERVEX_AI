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
import { AlertCircle, TrendingUp, TrendingDown, Database, Activity, Cpu, Fingerprint } from 'lucide-react';

const COLORS = ['#464775', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl text-white text-xs">
        <p className="font-bold mb-2 pb-1 border-b border-white/20">{label || payload[0]?.payload?.name || 'Data'}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex justify-between gap-4 py-0.5">
            <span style={{ color: entry.color }}>{entry.name || entry.dataKey}:</span>
            <span className="font-mono">
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
      aumentos: [],
      reducciones: [],
      anomaliesData: []
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
        // - **[CLN7107-4-113330-AC/C]** El valor de 'List Price' tuvo un cambio drástico del -98.9% (De 5316 a 56)
        const regexAnom = /-\s*\*\*\[(.*?)\]\*\*.*?(-?\d+\.?\d*)%.*?De\s+(\d+)\s+a\s+(\d+)/;
        const match = line.match(regexAnom);
        if (match) {
          result.anomaliesData.push({
            name: match[1].substring(0, 9) + '..',
            fullName: match[1],
            varPercent: parseFloat(match[2]),
            original: parseFloat(match[3]),
            nuevo: parseFloat(match[4]),
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
      <p className="text-[#605E5C] text-sm tracking-widest uppercase font-semibold">Inicializando Entorno AI...</p>
    </div>
  );

  if (error || !data) return (
    <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-[#242424] mb-2">Error Crítico</h3>
      <p className="text-[13px] text-[#605E5C] text-center">{error}</p>
    </div>
  );

  // DATA PREPARATION FOR CHARTS
  const pieData = [
    { name: 'Modificados', value: data.metrics.modified },
    { name: 'Nuevos', value: data.metrics.new },
    { name: 'Eliminados', value: data.metrics.deleted },
    { name: 'Sin Cambios', value: Math.max(0, data.metrics.total - data.metrics.modified - data.metrics.new - data.metrics.deleted) },
  ];

  // Radar Data
  const getAvg = (arr, key) => arr.length ? arr.reduce((acc, el) => acc + el[key], 0) / arr.length : 0;
  const radarData = [
    { subject: 'Aumentos', original: getAvg(data.aumentos, 'original'), nuevo: getAvg(data.aumentos, 'nuevo') },
    { subject: 'Reducciones', original: getAvg(data.reducciones, 'original'), nuevo: getAvg(data.reducciones, 'nuevo') },
    { subject: 'Anomalías', original: getAvg(data.anomaliesData, 'original'), nuevo: getAvg(data.anomaliesData, 'nuevo') },
  ];

  // Radial Bar Data (Buckets)
  let severityLevels = { 'Crítico (>500%)': 0, 'Alto (100-500%)': 0, 'Medio (<100%)': 0, 'Baja (<-90%)': 0 };
  data.anomaliesData.forEach(a => {
    if (a.varPercent >= 500) severityLevels['Crítico (>500%)']++;
    else if (a.varPercent >= 100) severityLevels['Alto (100-500%)']++;
    else if (a.varPercent <= -90) severityLevels['Baja (<-90%)']++;
    else severityLevels['Medio (<100%)']++;
  });
  const radialData = Object.keys(severityLevels).map((k, i) => ({
    name: k, Cantidad: severityLevels[k], fill: COLORS[i]
  })).filter(d => d.Cantidad > 0);

  return (
    <div className="w-full h-full bg-[#F3F4F6] flex flex-col p-6 overflow-y-auto font-sans">
      
      {/* Header Dashboard AI */}
      <div className="flex items-center justify-between gap-3 mb-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#464775] to-[#2B2C54] flex items-center justify-center text-white shadow-lg">
            <Fingerprint size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 m-0 tracking-tight">AI Analytics Engine</h2>
            <p className="text-[13px] text-gray-500 m-0 mt-1 font-medium">Deep Data Inspection & Anomaly Forensics</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          System Online
        </div>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 shrink-0">
        {[
          { label: 'Total Modelos', val: data.metrics.total, icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Modificados', val: data.metrics.modified, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Nuevos', val: data.metrics.new, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Eliminados', val: data.metrics.deleted, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
            <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}><kpi.icon size={24}/></div>
            <div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{kpi.label}</p>
              <p className="text-2xl font-black text-gray-800 tracking-tight">{kpi.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 shrink-0">
        {/* 1. Donut Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-[320px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"/>
          <h3 className="text-[13px] font-bold text-gray-800 mb-4 tracking-wide uppercase">1. Composición del Catálogo</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((e, i) => <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Diverging Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 h-[320px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"/>
          <h3 className="text-[13px] font-bold text-gray-800 mb-4 tracking-wide uppercase">2. Top Variaciones Estratégicas</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...data.aumentos, ...data.reducciones]} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} interval={0} angle={-15} textAnchor="end" height={60} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${v/1000}k`}/>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="rect" wrapperStyle={{ fontSize: '11px' }}/>
                <Bar dataKey="original" name="Precio Base" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="nuevo" name="Precio Ajustado" fill="#464775" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 shrink-0">
        {/* 3. LineChart: Trayectoria de Anomalías */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-[320px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-orange-400"/>
          <h3 className="text-[13px] font-bold text-gray-800 mb-4 tracking-wide uppercase">3. Trayectoria de Anomalías</h3>
          <p className="text-[11px] text-gray-500 mb-2">Seguimiento de la brecha de precio en los errores detectados.</p>
          <div className="flex-1 w-full min-h-0 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.anomaliesData} margin={{ top: 5, right: 15, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} angle={-25} textAnchor="end" axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false}/>
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }}/>
                <Line type="monotone" dataKey="original" name="Histórico" stroke="#94a3b8" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}}/>
                <Line type="monotone" dataKey="nuevo" name="Nuevo Valor" stroke="#e11d48" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. AreaChart: Magnitud Financiera Absoluta */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-[320px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"/>
          <h3 className="text-[13px] font-bold text-gray-800 mb-4 tracking-wide uppercase">4. Magnitud Financiera Neta (Riesgo)</h3>
          <p className="text-[11px] text-gray-500 mb-2">Volumen absoluto de dólares desplazados por la anomalía.</p>
          <div className="flex-1 w-full min-h-0 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.anomaliesData} margin={{ top: 5, right: 15, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorAbs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#6b7280'}} angle={-25} textAnchor="end" axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize: 10, fill: '#6b7280'}} axisLine={false} tickLine={false} tickFormatter={(v)=>`$${v/1000}k`}/>
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="absChange" name="Variación Absoluta ($)" stroke="#10b981" fillOpacity={1} fill="url(#colorAbs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 shrink-0">
        {/* 5. ScatterChart: Mapeo de Volatilidad */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1 h-[320px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"/>
          <h3 className="text-[13px] font-bold text-gray-800 mb-4 tracking-wide uppercase">5. Dispersión de Volatilidad</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis type="number" dataKey="nuevo" name="Precio Nuevo" tick={{fontSize: 10}} tickFormatter={(v)=>`$${v/1000}k`} axisLine={false} tickLine={false}/>
                <YAxis type="number" dataKey="varPercent" name="Variación %" tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                <ZAxis type="number" dataKey="absChange" range={[50, 400]} />
                <RechartsTooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                <Scatter name="Anomalías" data={data.anomaliesData} fill="#f59e0b" opacity={0.8} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. RadarChart: Comportamiento Promedio */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1 h-[320px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-pink-500"/>
          <h3 className="text-[13px] font-bold text-gray-800 mb-4 tracking-wide uppercase">6. Ejes de Comportamiento</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#4b5563', fontSize: 11, fontWeight: 'bold'}} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{fontSize: 9, fill: '#9ca3af'}} />
                <Radar name="Precio Base" dataKey="original" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                <Radar name="Precio Final" dataKey="nuevo" stroke="#d946ef" fill="#d946ef" fillOpacity={0.5} />
                <Legend wrapperStyle={{ fontSize: '10px' }}/>
                <RechartsTooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. RadialBarChart: Agrupación de Severidad */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1 h-[320px] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-600"/>
          <h3 className="text-[13px] font-bold text-gray-800 mb-4 tracking-wide uppercase">7. Clúster de Severidad</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={15} data={radialData}>
                <RadialBar minAngle={15} background clockWise dataKey="Cantidad" cornerRadius={10} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ fontSize: '11px', right: 0 }} />
                <RechartsTooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ViewportGraphics;
