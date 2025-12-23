'use client';
import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { useCatalogData } from './useCatalogData';

const COLORS = ['#6264A7', '#464775', '#8B8CC7', '#C4314B', '#237B4B', '#0078D4'];

const ProfessionalDashboard = () => {
  const { products, loading, catalogStats, metadata } = useCatalogData();
  const [activeTab, setActiveTab] = useState('Overview');

  const chartData = useMemo(() => {
    const categories = {};
    const priceBins = {};

    products.forEach(p => {
      if (!categories[p.category]) {
        categories[p.category] = {
          name: p.category,
          count: 0,
          total: 0,
          avgX: 0,
          avgY: 0,
          avgZ: 0,
          totalFeatures: 0
        };
      }
      categories[p.category].count++;
      categories[p.category].total += p.price;
      categories[p.category].avgX += p.x;
      categories[p.category].avgY += p.y;
      categories[p.category].avgZ += p.z;
      categories[p.category].totalFeatures += p.features;

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="w-10 h-10 border-4 border-[#6264A7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = ['Overview', 'Market Analysis', 'Dimensional Profile', 'Feature Matrix'];

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#242424]">
      {/* MICROSOFT TEAMS STYLE NAVBAR */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-[#6264A7]">Catalog Intelligence</h1>
              <div className="flex h-16 items-end gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 pb-4 pt-5 text-sm font-medium transition-all relative
                      ${activeTab === tab 
                        ? 'text-[#6264A7]' 
                        : 'text-gray-500 hover:text-[#6264A7] hover:bg-gray-50'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#6264A7] rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
               <InfoBadge label="SCHEMA" value="OFDA 01.04" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        {/* KPI ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Products" value={products.length} color="#6264A7" />
          <StatCard title="Materials" value={metadata.materials} color="#237B4B" />
          <StatCard title="Features" value={metadata.features} color="#C4314B" />
          <StatCard title="Total Value" value={`$${catalogStats.totalValue}`} color="#0078D4" />
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[600px] transition-all">
          <header className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">{activeTab}</h2>
            <p className="text-gray-500 italic">Detailed view of current dataset analytics</p>
          </header>

          <div className="h-[500px] w-full">
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-2 h-full gap-8">
                <div className="flex flex-col">
                  <span className="text-sm font-bold mb-4 uppercase text-gray-400">Category Volume</span>
                  <PieChartBlock data={chartData.pieData} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold mb-4 uppercase text-gray-400">Price Distribution</span>
                  <AreaChartBlock data={chartData.areaPriceData} />
                </div>
              </div>
            )}

            {activeTab === 'Market Analysis' && (
               <GroupedBarChartBlock data={chartData.barDataValue} />
            )}

            {activeTab === 'Dimensional Profile' && (
               <RadarChartBlock data={chartData.radarData} />
            )}

            {activeTab === 'Feature Matrix' && (
               <ScatterChartBlock data={products} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

/* ---------------- UI COMPONENTS ---------------- */

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
    <h3 className="text-2xl font-bold mt-1" style={{ color }}>{value}</h3>
  </div>
);

const InfoBadge = ({ label, value }) => (
  <div className="bg-[#6264A7]/10 px-3 py-1.5 rounded-lg border border-[#6264A7]/20">
    <span className="text-[10px] font-bold text-[#6264A7] mr-2 uppercase">{label}</span>
    <span className="text-xs font-semibold text-[#464775]">{value}</span>
  </div>
);

/* ---------------- CHART BLOCKS (OPTIMIZED FOR LARGE VIEW) ---------------- */

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-xl border border-gray-100 rounded-lg">
        <p className="font-bold text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AreaChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6264A7" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#6264A7" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
      <XAxis dataKey="priceRange" axisLine={false} tickLine={false} fontSize={12} />
      <YAxis axisLine={false} tickLine={false} fontSize={12} />
      <Tooltip content={<CustomTooltip />} />
      <Area type="monotone" dataKey="count" stroke="#6264A7" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
    </AreaChart>
  </ResponsiveContainer>
);

const PieChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie data={data} dataKey="value" innerRadius={80} outerRadius={140} paddingAngle={5}>
        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie>
      <Tooltip />
      <Legend verticalAlign="bottom" height={36}/>
    </PieChart>
  </ResponsiveContainer>
);

const RadarChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
      <PolarGrid stroke="#E5E7EB" />
      <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 12 }} />
      <PolarRadiusAxis angle={30} domain={[0, 100]} />
      <Radar name="X Profile" dataKey="X" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.5} />
      <Radar name="Y Profile" dataKey="Y" stroke={COLORS[4]} fill={COLORS[4]} fillOpacity={0.5} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
    </RadarChart>
  </ResponsiveContainer>
);

const GroupedBarChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} barGap={8}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
      <XAxis dataKey="name" axisLine={false} tickLine={false} />
      <YAxis axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      <Bar dataKey="avgPrice" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Average Price ($)" />
      <Bar dataKey="avgFeatures" fill={COLORS[2]} radius={[4, 4, 0, 0]} name="Average Features" />
    </BarChart>
  </ResponsiveContainer>
);

const ScatterChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
      <XAxis type="number" dataKey="features" name="Features" label={{ value: 'Features Count', position: 'bottom' }} />
      <YAxis type="number" dataKey="price" name="Price" label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} />
      <ZAxis dataKey="x" range={[100, 1000]} name="Volume" />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
      <Scatter name="Products" data={data} fill={COLORS[0]} fillOpacity={0.6} />
    </ScatterChart>
  </ResponsiveContainer>
);

export default ProfessionalDashboard;