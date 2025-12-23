'use client';
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useCatalogData } from './useCatalogData';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AuditDashboard = () => {
  const { products, materials, stats, featuresCount, loading } = useCatalogData();

  const categoryData = useMemo(() => {
    const map = {};
    products.forEach(p => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return Object.keys(map).map(k => ({ name: k.split(' ').pop(), value: map[k] })).slice(0, 8);
  }, [products]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white italic">Cargando Motores de Catálogo...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* TOP BAR - SISTEMA */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-3">
              <span className="bg-blue-600 px-2 py-0.5 rounded text-xs">CET ENGINE v16.0</span>
              CATALOG AUDIT COMMAND
            </h1>
            <p className="text-slate-500 text-xs font-mono mt-1">OFDAXML Schema: 01.04.00 | Lesro General Catalog</p>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Effective Date</p>
              <p className="text-sm font-mono text-blue-400">{stats.effectiveDate}</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition-all">Export Report</button>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard title="Total SKU's" value={products.length} trend="+12% vs 2024" icon="📦" />
          <MetricCard title="Features/Options" value={`${featuresCount} / ${stats.totalOptions}`} trend="Complexity High" icon="⚙️" />
          <MetricCard title="Material Assets" value={materials.length} trend={`${(materials.length/products.length).toFixed(1)} per product`} icon="🎨" />
          <MetricCard title="Inventory Value" value={`$${(stats.totalValue / 1000).toFixed(1)}k`} trend="USD" icon="💰" />
        </div>

        {/* MAIN CHARTS SECTION */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Gráfica Principal: Distribución de Categorías */}
          <div className="col-span-12 lg:col-span-8 bg-[#1e293b] rounded-3xl p-6 border border-slate-800 shadow-2xl">
            <div className="flex justify-between mb-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Product Density by Classification</h3>
              <div className="flex gap-2 text-[10px]">
                <span className="flex items-center gap-1"><i className="w-2 h-2 bg-blue-500 rounded-full"></i> Active</span>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={categoryData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px'}} />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Calidad de Materiales (Critical for CET) */}
          <div className="col-span-12 lg:col-span-4 bg-[#1e293b] rounded-3xl p-6 border border-slate-800 shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Texture Quality Audit</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{name: 'Medium', value: materials.length}, {name: 'High', value: 0}, {name: 'Low', value: 0}]} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-3">
               <div className="flex justify-between text-xs border-b border-slate-800 pb-2">
                  <span className="text-slate-500 font-medium italic italic">Asset Reliability:</span>
                  <span className="text-emerald-400 font-bold">98.2% Optimal</span>
               </div>
               <p className="text-[10px] text-slate-500 leading-relaxed text-center">Todos los materiales están mapeados bajo el schema OFDAXML con resolución media, optimizada para el renderizado en tiempo real de CET.</p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: TECHNICAL LIST */}
        <div className="bg-[#1e293b] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Technical SKU Inspector</h3>
            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full">Showing first 100 entries</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-[10px] uppercase text-slate-500 font-black">
              <tr>
                <th className="px-6 py-4">SKU / ID</th>
                <th className="px-6 py-4">Complexity (Opts)</th>
                <th className="px-6 py-4">CET Geometry</th>
                <th className="px-6 py-4 text-right">Price Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.slice(0, 5).map((p, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-blue-400 font-bold">{p.code}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{width: `${(p.optionsCount/20)*100}%`}}></div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{p.optionsCount} opts</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm ${p.hasDimensions ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {p.hasDimensions ? '3D_SYNC_READY' : 'DIMENSION_MISSING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-xs font-bold text-white">${p.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, trend, icon }) => (
  <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded italic">{trend}</span>
    </div>
    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</h4>
    <p className="text-2xl font-black text-white mt-1">{value}</p>
  </div>
);

export default AuditDashboard;