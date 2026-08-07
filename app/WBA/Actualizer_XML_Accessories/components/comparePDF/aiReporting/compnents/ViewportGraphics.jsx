"use client";

import React, { useEffect, useState } from 'react';
import * as PH from "@phosphor-icons/react";
import { supabase } from '@/app/lib/supabaseClient';
import { usePathname } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, Database, Activity } from 'lucide-react';

const COLORS = ['#464775', '#00C49F', '#FFBB28', '#FF8042'];

const ViewportGraphics = () => {
  const pathname = usePathname();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Extraer el módulo de la URL (e.g. /WBO/...)
        const moduleMatch = pathname.match(/^\/([A-Z]+)\//);
        const moduleName = moduleMatch ? moduleMatch[1] : null;

        if (!moduleName) {
          throw new Error("No se pudo determinar el módulo de la URL.");
        }

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
          throw new Error("No hay datos de auditoría disponibles para graficar.");
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
      anomalies: []
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
      
      if (currentSection === 'aumentos' && line.match(/^\s*\d+\.\s+\*\*/)) {
        const regex = /\*\*(.*?)\*\*.*?:\s*(\d+)\s*->\s*(\d+)\s*\*\((.*?)\)\*/;
        const match = line.match(regex);
        if (match) {
          result.aumentos.push({
            name: match[1].substring(0, 15) + (match[1].length > 15 ? '...' : ''),
            original: parseFloat(match[2]),
            nuevo: parseFloat(match[3]),
            var: match[4]
          });
        }
      }
      
      if (currentSection === 'reducciones' && line.match(/^\s*\d+\.\s+\*\*/)) {
        const regex = /\*\*(.*?)\*\*.*?:\s*(\d+)\s*->\s*(\d+)\s*\*\((.*?)\)\*/;
        const match = line.match(regex);
        if (match) {
          result.reducciones.push({
            name: match[1].substring(0, 15) + (match[1].length > 15 ? '...' : ''),
            original: parseFloat(match[2]),
            nuevo: parseFloat(match[3]),
            var: match[4]
          });
        }
      }

      if (currentSection === 'anomalies' && line.trim().startsWith('- **[')) {
        result.anomalies.push(line.replace('- ', '').trim());
      }
    });

    return result;
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
        <PH.Spinner size={40} className="animate-spin text-[#464775] mb-4" />
        <p className="text-[#605E5C]">Cargando analíticas...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full h-full bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-[#242424] mb-2">Error cargando dashboard</h3>
        <p className="text-[13px] text-[#605E5C] text-center max-w-sm">{error}</p>
      </div>
    );
  }

  const pieData = [
    { name: 'Modificados', value: data.metrics.modified },
    { name: 'Nuevos', value: data.metrics.new },
    { name: 'Eliminados', value: data.metrics.deleted },
    { name: 'Sin Cambios', value: Math.max(0, data.metrics.total - data.metrics.modified - data.metrics.new - data.metrics.deleted) },
  ];

  return (
    <div className="w-full h-full bg-[#FAFAFA] flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-[#EDEBE9] pb-4 shrink-0">
        <div className="w-10 h-10 rounded-lg bg-[#464775]/10 flex items-center justify-center text-[#464775]">
          <PH.ChartBar size={24} weight="duotone" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#242424] m-0 leading-tight">Dashboard Gráfico</h2>
          <p className="text-[13px] text-[#605E5C] m-0 mt-1">Visualización estratégica y analíticas del último Audit.</p>
        </div>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 shrink-0">
        <div className="bg-white p-4 rounded-xl border border-[#EDEBE9] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Database size={24}/></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Evaluados</p>
            <p className="text-2xl font-bold text-gray-800">{data.metrics.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#EDEBE9] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Activity size={24}/></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Modificados</p>
            <p className="text-2xl font-bold text-gray-800">{data.metrics.modified}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#EDEBE9] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={24}/></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Nuevos</p>
            <p className="text-2xl font-bold text-gray-800">{data.metrics.new}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#EDEBE9] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><TrendingDown size={24}/></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Eliminados</p>
            <p className="text-2xl font-bold text-gray-800">{data.metrics.deleted}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 shrink-0">
        {/* Gráfico Circular de Estado */}
        <div className="bg-white p-5 rounded-xl border border-[#EDEBE9] shadow-sm lg:col-span-1 h-[300px] flex flex-col">
          <h3 className="text-sm font-semibold text-[#242424] mb-4">Composición del Catálogo</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Barras Aumentos */}
        <div className="bg-white p-5 rounded-xl border border-[#EDEBE9] shadow-sm lg:col-span-2 h-[300px] flex flex-col">
          <h3 className="text-sm font-semibold text-[#242424] mb-4">Top Variaciones (Aumentos vs Reducciones)</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...data.aumentos, ...data.reducciones]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" height={60}/>
                <YAxis tick={{fontSize: 11}}/>
                <RechartsTooltip 
                  formatter={(value) => [`$${value}`, '']}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
                <Bar dataKey="original" name="Precio Original" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nuevo" name="Precio Nuevo" fill="#464775" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Anomalías Críticas */}
      {data.anomalies.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden shrink-0 mb-6">
          <div className="bg-red-50 px-5 py-3 border-b border-red-100 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600"/>
            <h3 className="text-sm font-bold text-red-800">Alertas Críticas y Anomalías</h3>
          </div>
          <div className="p-5 max-h-[250px] overflow-y-auto">
            <ul className="space-y-3">
              {data.anomalies.map((anom, idx) => (
                <li key={idx} className="flex items-start gap-3 text-[13px] text-gray-700">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"/>
                  <span dangerouslySetInnerHTML={{ __html: anom.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ViewportGraphics;
