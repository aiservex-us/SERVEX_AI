'use client';
import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
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
          totalFeatures: 0,
          avgX: 0,
          avgY: 0,
          avgZ: 0,
        };
      }
      categories[p.category].count++;
      categories[p.category].total += p.price;
      categories[p.category].totalFeatures += p.features;
      categories[p.category].avgX += p.x;
      categories[p.category].avgY += p.y;
      categories[p.category].avgZ += p.z;

      const bin = Math.floor(p.price / 100) * 100;
      priceBins[bin] = (priceBins[bin] || 0) + 1;
    });

    return {
      barDataValue: Object.values(categories).map(c => ({
        name: c.name,
        avgPrice: Math.round(c.total / c.count),
        avgFeatures: Math.round(c.totalFeatures / c.count),
      })),
      radarData: Object.values(categories).slice(0, 5).map(c => ({
        subject: c.name,
        X: c.avgX / c.count,
        Y: c.avgY / c.count,
        Z: c.avgZ / c.count,
      })),
      areaPriceData: Object.keys(priceBins)
        .sort((a, b) => a - b)
        .map(bin => ({
          priceRange: `${bin}-${+bin + 99}`,
          count: priceBins[bin],
        })),
    };
  }, [products]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#6264A7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = ['Overview', 'Market Analysis', 'Dimensional Profile', 'Feature Matrix'];

  return (
    <div className="h-full w-full flex flex-col bg-white min-h-0">

      {/* NAVBAR */}
      <nav className="h-14 shrink-0 border-b border-gray-200 px-4">
        <div className="h-full flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold text-[#6264A7]">
              Catalog Intelligence
            </h1>

            <div className="flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-3 text-xs font-medium relative
                    ${activeTab === tab
                      ? 'text-[#6264A7]'
                      : 'text-gray-500 hover:text-[#6264A7]'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6264A7]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <InfoBadge label="SCHEMA" value="OFDA 01.04" />
        </div>
      </nav>

      {/* CONTENT */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto p-4 flex flex-col gap-4">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          <StatCard title="Total Products" value={products.length} color="#6264A7" />
          <StatCard title="Materials" value={metadata.materials} color="#237B4B" />
          <StatCard title="Features" value={metadata.features} color="#C4314B" />
          <StatCard title="Total Value" value={`$${catalogStats.totalValue}`} color="#0078D4" />
        </div>

        {/* CHART AREA */}
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 p-4 flex flex-col overflow-hidden">
          <header className="shrink-0 mb-2">
            <h2 className="text-lg font-semibold">{activeTab}</h2>
            <p className="text-xs text-gray-500 italic">Dataset analytics</p>
          </header>

          <div className="flex-1 min-h-0">
            {activeTab === 'Overview' && (
              <div className="h-full">
                <ChartBlock title="Price Distribution">
                  <AreaChartBlock data={chartData.areaPriceData} />
                </ChartBlock>
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

/* ---------------- UI ---------------- */

const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-3 rounded-lg border border-gray-200">
    <p className="text-[10px] font-bold text-gray-400 uppercase">{title}</p>
    <h3 className="text-xl font-bold" style={{ color }}>{value}</h3>
  </div>
);

const InfoBadge = ({ label, value }) => (
  <div className="px-3 py-1 rounded-md bg-[#6264A7]/10 border border-[#6264A7]/20">
    <span className="text-[10px] font-bold text-[#6264A7] mr-1">{label}</span>
    <span className="text-xs font-semibold text-[#464775]">{value}</span>
  </div>
);

const ChartBlock = ({ title, children }) => (
  <div className="flex flex-col h-full">
    <span className="text-[11px] font-bold mb-1 uppercase text-gray-400">
      {title}
    </span>
    <div className="flex-1 min-h-0">
      {children}
    </div>
  </div>
);

/* ---------------- CHARTS ---------------- */

const AreaChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <XAxis dataKey="priceRange" fontSize={10} />
      <YAxis fontSize={10} />
      <Tooltip />
      <Area dataKey="count" stroke="#6264A7" fill="#6264A7" fillOpacity={0.2} />
    </AreaChart>
  </ResponsiveContainer>
);

const RadarChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart data={data} outerRadius="75%">
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
      <Radar dataKey="X" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.4} />
      <Radar dataKey="Y" stroke={COLORS[4]} fill={COLORS[4]} fillOpacity={0.4} />
      <Tooltip />
    </RadarChart>
  </ResponsiveContainer>
);

const GroupedBarChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <XAxis dataKey="name" fontSize={10} />
      <YAxis fontSize={10} />
      <Tooltip />
      <Bar dataKey="avgPrice" fill={COLORS[0]} />
      <Bar dataKey="avgFeatures" fill={COLORS[2]} />
    </BarChart>
  </ResponsiveContainer>
);

const ScatterChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <ScatterChart>
      <XAxis type="number" dataKey="features" fontSize={10} />
      <YAxis type="number" dataKey="price" fontSize={10} />
      <ZAxis range={[60, 200]} />
      <Tooltip />
      <Scatter data={data} fill={COLORS[0]} />
    </ScatterChart>
  </ResponsiveContainer>
);

export default ProfessionalDashboard;
