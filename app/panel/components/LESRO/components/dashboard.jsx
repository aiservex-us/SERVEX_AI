'use client';
import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { useCatalogData } from './useCatalogData';

const COLORS = ['#2563EB', '#FB923C', '#4ADE80', '#1F2937', '#94A3B8', '#F1F5F9'];

const DashboardVisuals = () => {
  const { products, loading, catalogStats, metadata } = useCatalogData();
  const [activeTab, setActiveTab] = useState('Overview');

  // LIMPIEZA DE TEXTOS LARGOS
  const cleanLabel = (label) => {
    if (!label) return "";
    return label.length > 15 ? label.substring(0, 12) + "..." : label;
  };

  const chartData = useMemo(() => {
    const categories = {};
    const priceBins = {};

    products.forEach(p => {
      // Limpiamos el nombre de la categoría para evitar los textos largos que mencionas
      const catName = p.category?.split(' ').pop() || 'General'; 
      
      if (!categories[catName]) {
        categories[catName] = {
          name: catName, count: 0, total: 0, avgX: 0, avgY: 0, avgZ: 0, totalFeatures: 0
        };
      }
      categories[catName].count++;
      categories[catName].total += p.price;
      categories[catName].avgX += p.x;
      categories[catName].avgY += p.y;
      categories[catName].avgZ += p.z;
      categories[catName].totalFeatures += p.features;

      const bin = Math.floor(p.price / 100) * 100;
      priceBins[bin] = (priceBins[bin] || 0) + 1;
    });

    return {
      pieData: Object.values(categories).map(c => ({ name: c.name, value: c.count })),
      barDataValue: Object.values(categories).map(c => ({
        name: c.name,
        avgPrice: Math.round(c.total / c.count),
        avgFeatures: Math.round(c.totalFeatures / c.count)
      })),
      radarData: Object.values(categories).slice(0, 5).map(c => ({
        subject: c.name,
        X: c.avgX / c.count,
        Y: c.avgY / c.count,
        Z: c.avgZ / c.count,
      })),
      areaPriceData: Object.keys(priceBins).sort((a, b) => a - b)
        .map(bin => ({ priceRange: `${bin}-${+bin + 99}`, count: priceBins[bin] }))
    };
  }, [products]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#F9FAFB]"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>;

  const tabs = ['Overview', 'Pricing Strategy', 'Dimensional Profiling', 'Technical Matrix'];

  return (
    <div className="h-screen w-full bg-[#F9FAFB] text-[#1F2937] flex flex-col overflow-hidden">
      
      {/* HEADER COMPACTO */}
      <header className="h-12 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-tight">
          <span className="text-black">Catalog</span> <span>/</span> <span>Analytics</span>
        </div>
        <div className="flex items-center gap-3 font-black text-[10px]">
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">LIVE DATA</span>
          <button className="bg-black text-white px-3 py-1 rounded">REFRESH</button>
        </div>
      </header>

      {/* TABS COMPACTOS */}
      <div className="bg-white border-b border-gray-200 px-6 flex items-center gap-4 shrink-0">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[10px] font-black py-3 px-1 border-b-2 transition-all uppercase tracking-widest ${
              activeTab === tab ? 'border-blue-600 text-black' : 'border-transparent text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENIDO PRINCIPAL ADAPTADO AL VIEWPORT */}
      <main className="flex-1 p-4 flex flex-col gap-4 min-h-0">
        
        {/* KPI ROW MÁS PEQUEÑO */}
        <div className="grid grid-cols-4 gap-4 shrink-0">
          <StatCard title="Total Skus" value={products.length} />
          <StatCard title="Nodes" value={metadata.rawNodes || 0} />
          <StatCard title="Materials" value={metadata.materials} />
          <StatCard title="Total Value" value={`$${catalogStats.totalValue}`} highlight />
        </div>

        {/* CONTENEDOR DE GRÁFICA AL 100% DEL ESPACIO RESTANTE */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center shrink-0">
            <h3 className="text-[11px] font-black uppercase text-gray-900">{activeTab}</h3>
          </div>

          <div className="flex-1 p-4">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'Overview' && (
                <AreaChart data={chartData.areaPriceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="priceRange" fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} fill="#2563EB" fillOpacity={0.1} />
                </AreaChart>
              )}

              {activeTab === 'Pricing Strategy' && (
                <BarChart data={chartData.barDataValue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={9} 
                    fontWeight="bold" 
                    axisLine={false} 
                    tickFormatter={cleanLabel} // LIMPIA TEXTOS LARGOS
                  />
                  <YAxis fontSize={9} fontWeight="bold" axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgPrice" fill="#000000" radius={[2, 2, 0, 0]} name="PRICE" />
                  <Bar dataKey="avgFeatures" fill="#2563EB" radius={[2, 2, 0, 0]} name="FEATURES" />
                </BarChart>
              )}

              {activeTab === 'Dimensional Profiling' && (
                <RadarChart data={chartData.radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fontWeight: 'bold' }} />
                  <Radar name="X" dataKey="X" stroke="#2563EB" fill="#2563EB" fillOpacity={0.5} />
                  <Radar name="Y" dataKey="Y" stroke="#FB923C" fill="#FB923C" fillOpacity={0.5} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              )}

              {activeTab === 'Technical Matrix' && (
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis type="number" dataKey="features" fontSize={9} axisLine={false} />
                  <YAxis type="number" dataKey="price" fontSize={9} axisLine={false} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter data={products} fill="#1F2937" fillOpacity={0.5} />
                </ScatterChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ---------------- COMPONENTES DE INTERFAZ ---------------- */

const StatCard = ({ title, value, highlight }) => (
  <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
    <p className="text-[9px] font-black uppercase tracking-wider text-gray-400 mb-0.5">{title}</p>
    <p className={`text-lg font-black leading-tight ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{value}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-xl rounded text-[10px] font-bold">
        <p className="text-gray-400 uppercase mb-1 border-b pb-1">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex justify-between gap-4 py-0.5">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="text-black">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default DashboardVisuals;