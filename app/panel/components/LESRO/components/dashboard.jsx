'use client';
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useCatalogData } from './useCatalogData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ProfessionalDashboard = () => {
  const { products, loading, catalogStats } = useCatalogData();

  // Procesar datos para las gráficas
  const chartData = useMemo(() => {
    const counts = {};
    const priceByCat = {};
    
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
      priceByCat[p.category] = (priceByCat[p.category] || 0) + p.price;
    });

    const pieData = Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    const barData = Object.keys(priceByCat).map(key => ({ 
      name: key, 
      total: Math.round(priceByCat[key]),
      avg: Math.round(priceByCat[key] / counts[key])
    }));

    return { pieData, barData };
  }, [products]);

  if (loading) return <div className="p-10 text-center animate-pulse font-medium">Generando analíticas...</div>;

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Executive Overview</h1>
            <p className="text-gray-500 font-medium">Análisis en tiempo real de catálogo XML</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">Live Database</span>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total SKU's" value={products.length} sub="Productos activos" color="text-blue-600" />
          <StatCard title="Catalog Value" value={`$${catalogStats.totalValue.toLocaleString()}`} sub={catalogStats.currency} color="text-emerald-600" />
          <StatCard title="Average Price" value={`$${catalogStats.avgPrice.toFixed(2)}`} sub="Per unit" color="text-orange-500" />
          <StatCard title="Categories" value={chartData.pieData.length} sub="Segmentos" color="text-purple-600" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Bar Chart - Valor por Categoría */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-6">Inventory Value by Category</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="total" fill="#111827" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Distribución */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-6">Product Distribution</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pieData}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {chartData.pieData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Sub-componente para las tarjetas de métricas
const StatCard = ({ title, value, sub, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
    <h2 className={`text-2xl font-black ${color}`}>{value}</h2>
    <p className="text-xs text-gray-400 font-medium mt-1">{sub}</p>
  </div>
);

export default ProfessionalDashboard;