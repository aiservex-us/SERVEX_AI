'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, 
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
        const formatted = data.map((item, idx) => ({
          name: `Prod ${idx + 1}`,
          cambios: item.audit_report_jsonP?.summary_metrics?.total_cell_changes || 0,
          porcentaje: Math.random() * 100 
        }));
        setData(formatted);
      }
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  const COLORS = ['#464775', '#8E8EA8', '#C7C7D6'];

  if (loading) return <div className="text-xs p-4 text-[#605E5C]">Cargando analítica...</div>;

  return (
    <div className="flex flex-col gap-4 w-full" style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}>
      
      {/* Gráfica 1: Volumen */}
      <div className="bg-white p-4 border border-[#E1DFDD] shadow-sm">
        <h3 className="text-[10px] font-bold text-[#605E5C] uppercase mb-2">Volumen de Cambios</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data}>
            <XAxis dataKey="name" hide />
            <Tooltip />
            <Bar dataKey="cambios" fill="#464775" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica 2: Tendencia */}
      <div className="bg-white p-4 border border-[#E1DFDD] shadow-sm">
        <h3 className="text-[10px] font-bold text-[#605E5C] uppercase mb-2">Impacto (%)</h3>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip />
            <Area type="monotone" dataKey="porcentaje" stroke="#464775" fill="#EDF2FB" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica 3: Distribución */}
      <div className="bg-white p-4 border border-[#E1DFDD] shadow-sm">
        <h3 className="text-[10px] font-bold text-[#605E5C] uppercase mb-2">Distribución</h3>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={data} dataKey="cambios" innerRadius={30} outerRadius={50}>
              {data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}