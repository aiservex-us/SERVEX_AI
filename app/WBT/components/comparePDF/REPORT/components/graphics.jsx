'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  AreaChart, Area, PieChart, Pie, Cell, CartesianGrid 
} from 'recharts';

export default function AuditAnalyticsDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const { data } = await supabase
        .from('ClientsSERVEX_WBT')
        .select('audit_report_jsonP')
        .limit(10);
      
      if (data) {
        // Transformamos los datos para las gráficas
        const formatted = data.map((item, idx) => ({
          name: `Prod ${idx + 1}`,
          cambios: item.audit_report_jsonP?.summary_metrics?.total_cell_changes || 0,
          porcentaje: Math.random() * 100 // Ejemplo: reemplaza con lógica real de %
        }));
        setData(formatted);
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  const COLORS = ['#464775', '#8E8EA8', '#C7C7D6'];

  if (loading) return <div className="text-sm text-[#605E5C]">Procesando métricas de analítica...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-[#F5F5F5]" style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}>
      
      {/* Gráfica 1: Cambios detectados */}
      <div className="bg-white p-6 border border-[#E1DFDD] shadow-sm">
        <h3 className="text-xs font-bold text-[#605E5C] uppercase mb-6">Volumen de Cambios</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="name" hide />
            <Tooltip />
            <Bar dataKey="cambios" fill="#464775" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica 2: Tendencia de impacto */}
      <div className="bg-white p-6 border border-[#E1DFDD] shadow-sm">
        <h3 className="text-xs font-bold text-[#605E5C] uppercase mb-6">Impacto en Productos (%)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip />
            <Area type="monotone" dataKey="porcentaje" stroke="#464775" fill="#EDF2FB" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica 3: Distribución */}
      <div className="bg-white p-6 border border-[#E1DFDD] shadow-sm">
        <h3 className="text-xs font-bold text-[#605E5C] uppercase mb-6">Distribución de Auditoría</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="cambios" innerRadius={40} outerRadius={70}>
              {data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}