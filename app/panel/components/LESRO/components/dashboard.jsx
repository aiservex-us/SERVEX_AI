'use client';
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useCatalogData } from './useCatalogData';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#eab308', '#d946ef'];

const ProfessionalDashboard = () => {
  const { products, loading, catalogStats, metadata } = useCatalogData();

  const chartData = useMemo(() => {
    const categories = {};
    const priceBins = {}; // Para la distribución de precios
    
    products.forEach(p => {
      if (!categories[p.category]) {
        categories[p.category] = { name: p.category, count: 0, total: 0, avgX: 0, avgY: 0, avgZ: 0, totalFeatures: 0 };
      }
      categories[p.category].count += 1;
      categories[p.category].total += p.price;
      categories[p.category].avgX += p.x;
      categories[p.category].avgY += p.y;
      categories[p.category].avgZ += p.z;
      categories[p.category].totalFeatures += p.features;

      // Distribución de precios
      const bin = Math.floor(p.price / 100) * 100; // Agrupa precios en rangos de 100
      priceBins[bin] = (priceBins[bin] || 0) + 1;
    });

    const pieData = Object.values(categories).map(c => ({ name: c.name, value: c.count }));
    const barDataValue = Object.values(categories).map(c => ({ 
      name: c.name, 
      total: Math.round(c.total),
      avgPrice: Math.round(c.total / c.count),
      avgFeatures: Math.round(c.totalFeatures / c.count) // Promedio de features por categoría
    }));

    // Datos para Radar (Promedio de dimensiones por las primeras 5 categorías)
    const radarData = Object.values(categories).slice(0, 5).map(c => ({
      subject: c.name,
      X: c.avgX / c.count || 0,
      Y: c.avgY / c.count || 0,
      Z: c.avgZ / c.count || 0,
      fullMark: Math.max(1, (c.avgX / c.count || 0), (c.avgY / c.count || 0), (c.avgZ / c.count || 0)) * 1.2, // Escala dinámica
    }));

    // Datos para AreaChart de distribución de precios
    const areaPriceData = Object.keys(priceBins)
      .sort((a, b) => a - b)
      .map(bin => ({ priceRange: `${bin}-${parseInt(bin) + 99}`, count: priceBins[bin] }));

    return { pieData, barDataValue, radarData, areaPriceData, categories };
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

        {/* --- Primera fila de Gráficos (3) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          
          {/* 1. Gráfico de Área - Distribución de Precios */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 tracking-tight mb-8">Price Distribution</h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.areaPriceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="priceRange" angle={-45} textAnchor="end" height={60} interval={Math.floor(chartData.areaPriceData.length / 5)} fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis fontSize={11} tick={{fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.7} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Gráfico de Radar - Perfil Dimensional por Categoría */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-8 tracking-tight">Dimensional Profile (Avg)</h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData.radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b'}} />
                  <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{fontSize: 10, fill: '#64748b'}} />
                  <Radar name="X (Width)" dataKey="X" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.5} />
                  <Radar name="Y (Depth)" dataKey="Y" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.3} />
                  <Radar name="Z (Height)" dataKey="Z" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.2} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Gráfico de Barras - Features por Categoría */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 tracking-tight mb-8">Avg Features per Category</h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.barDataValue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis fontSize={11} tick={{fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="avgFeatures" fill={COLORS[3]} radius={[6, 6, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- Segunda fila de Gráficos (3) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 4. Gráfico de Pie - Distribución de Productos por Categoría */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 tracking-tight mb-8">Product Category Distribution</h3>
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. Gráfico de Barras Agrupadas - Precio y Features por Categoría */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 tracking-tight mb-8">Price & Features by Category</h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.barDataValue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} fontSize={10} tick={{fill: '#64748b'}} />
                  <YAxis yAxisId="left" orientation="left" stroke={COLORS[0]} fontSize={11} tick={{fill: '#64748b'}} />
                  <YAxis yAxisId="right" orientation="right" stroke={COLORS[1]} fontSize={11} tick={{fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                  <Bar yAxisId="left" dataKey="avgPrice" fill={COLORS[0]} name="Avg. Price" barSize={15} radius={[6,6,0,0]} />
                  <Bar yAxisId="right" dataKey="avgFeatures" fill={COLORS[1]} name="Avg. Features" barSize={15} radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 6. Gráfico de Dispersión - Precio vs. Features */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 tracking-tight mb-8">Price vs. Features per Product</h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" dataKey="features" name="Features" unit="" fontSize={11} tick={{fill: '#64748b'}} />
                  <YAxis type="number" dataKey="price" name="Price" unit="$" fontSize={11} tick={{fill: '#64748b'}} />
                  <ZAxis type="number" dataKey="x" range={[50, 500]} name="Width" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                  <Scatter name="Products" data={products} fill={COLORS[4]} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
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