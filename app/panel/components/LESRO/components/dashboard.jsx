'use client';
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area 
} from 'recharts';
import { useCatalogData } from './useCatalogData';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ProfessionalDashboard = () => {
  const { products, loading, catalogStats, metadata } = useCatalogData();

  const chartData = useMemo(() => {
    const categories = {};
    
    products.forEach(p => {
      if (!categories[p.category]) {
        categories[p.category] = { name: p.category, count: 0, total: 0, avgX: 0, avgY: 0, avgZ: 0 };
      }
      categories[p.category].count += 1;
      categories[p.category].total += p.price;
      categories[p.category].avgX += p.x;
      categories[p.category].avgY += p.y;
      categories[p.category].avgZ += p.z;
    });

    const pieData = Object.values(categories).map(c => ({ name: c.name, value: c.count }));
    const barData = Object.values(categories).map(c => ({ 
      name: c.name, 
      total: Math.round(c.total),
      avg: Math.round(c.total / c.count)
    }));

    // Datos para Radar (Promedio de dimensiones por las primeras 5 categorías)
    const radarData = Object.values(categories).slice(0, 5).map(c => ({
      subject: c.name,
      X: c.avgX / c.count,
      Y: c.avgY / c.count,
      Z: c.avgZ / c.count,
      fullMark: 150,
    }));

    return { pieData, barData, radarData };
  }, [products]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-gray-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-semibold animate-pulse">Compilando Estructura de Catálogo...</p>
    </div>
  );

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto text-gray-800">
        
        {/* Header con Info del XML */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Catalog Intelligence</h1>
            <p className="text-slate-500 font-medium">Gestión avanzada de XML: Catalog Creator</p>
          </div>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Nodos XML</p>
                <p className="text-sm font-bold text-slate-700">{metadata.rawNodes.toLocaleString()}</p>
             </div>
             <div className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md">
                <p className="text-[10px] opacity-80 font-bold uppercase">Esquema</p>
                <p className="text-sm font-bold">OFDA 01.04.00</p>
             </div>
          </div>
        </header>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Products (SKU)" value={products.length} trend="+2.4%" color="text-indigo-600" />
          <StatCard title="Materials" value={metadata.materials} sub="Texturas y Acabados" color="text-emerald-600" />
          <StatCard title="Config. Features" value={metadata.features} sub="Reglas de producto" color="text-amber-500" />
          <StatCard title="Total Value" value={`$${catalogStats.totalValue.toLocaleString()}`} sub={catalogStats.currency} color="text-slate-900" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* Gráfico de Barras - Valor */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-slate-800 tracking-tight">Financial Impact by Class</h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">USD</span>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} 
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart - Dimensiones */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-8 tracking-tight">Dimensional Profile (Avg)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b'}} />
                  <Radar name="Dimensión" dataKey="X" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                  <Radar name="Profundidad" dataKey="Y" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Data Table - Vista de Colaborador */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h3 className="font-bold text-slate-800">Product Integrity Audit</h3>
            <p className="text-sm text-slate-500">Detalle técnico de los últimos productos procesados</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">SKU / Code</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Classification</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Features</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Dimensions (X/Y/Z)</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Base Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.slice(0, 10).map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-700">{prod.code}</p>
                      <p className="text-[10px] text-slate-400 truncate w-40">{prod.description}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-medium text-slate-600">{prod.features}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-500 font-mono">
                      {prod.x}" x {prod.y}" x {prod.z}"
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      ${prod.price.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, sub, color, trend }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all hover:translate-y-[-4px] hover:shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      {trend && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">{trend}</span>}
    </div>
    <h2 className={`text-3xl font-black ${color} tracking-tight`}>{value}</h2>
    <p className="text-xs text-slate-400 font-medium mt-2">{sub}</p>
  </div>
);

export default ProfessionalDashboard;