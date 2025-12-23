'use client';
import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useCatalogData } from './useCatalogData';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ProfessionalDashboard = () => {
  const { products, loading, catalogStats, metadata } = useCatalogData();

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
        fullMark: 100
      })),
      areaPriceData: Object.keys(priceBins).sort((a, b) => a - b)
        .map(bin => ({ priceRange: `${bin}-${+bin + 99}`, count: priceBins[bin] }))
    };
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-[1440px] mx-auto space-y-12">

        {/* HEADER */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Catalog Intelligence</h1>
            <p className="text-sm text-slate-500">Advanced XML analytics</p>
          </div>
          <div className="flex gap-4">
            <InfoBadge label="XML Nodes" value={metadata.rawNodes} />
            <InfoBadge label="Schema" value="OFDA 01.04.00" dark />
          </div>
        </header>

        {/* KPI ROW */}
        <div className="grid grid-cols-4 gap-6">
          <StatCard title="Products" value={products.length} />
          <StatCard title="Materials" value={metadata.materials} />
          <StatCard title="Features" value={metadata.features} />
          <StatCard title="Catalog Value" value={`$${catalogStats.totalValue}`} />
        </div>

        {/* MAIN GRID (como la imagen) */}
        <div className="grid grid-cols-12 gap-8">

          {/* IZQUIERDA */}
          <div className="col-span-4 space-y-8">
            <Card title="Price Distribution">
              <AreaChartBlock data={chartData.areaPriceData} />
            </Card>

            <Card title="Product Categories">
              <PieChartBlock data={chartData.pieData} />
            </Card>
          </div>

          {/* CENTRO (GRÁFICA PROTAGONISTA) */}
          <div className="col-span-8">
            <Card title="Dimensional Profile" large>
              <RadarChartBlock data={chartData.radarData} />
            </Card>
          </div>

          {/* INFERIOR */}
          <div className="col-span-12 grid grid-cols-3 gap-8">
            <Card title="Avg Features">
              <BarChartBlock data={chartData.barDataValue} />
            </Card>

            <Card title="Price vs Features">
              <ScatterChartBlock data={products} />
            </Card>

            <Card title="Price & Features">
              <GroupedBarChartBlock data={chartData.barDataValue} />
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

/* ---------------- UI BLOCKS ---------------- */

const Card = ({ title, children, large }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${large ? 'p-10 h-[420px]' : 'p-6 h-[300px]'}`}>
    <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
    <div className="h-full">{children}</div>
  </div>
);

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
    <p className="text-xs uppercase text-slate-400 font-semibold">{title}</p>
    <h2 className="text-3xl font-bold text-slate-900 mt-2">{value}</h2>
  </div>
);

const InfoBadge = ({ label, value, dark }) => (
  <div className={`px-4 py-2 rounded-xl ${dark ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
    <p className="text-[10px] uppercase opacity-70">{label}</p>
    <p className="text-sm font-bold">{value}</p>
  </div>
);

/* ---------------- CHART BLOCKS (SIN CAMBIOS DE LÓGICA) ---------------- */

const AreaChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="priceRange" fontSize={10} />
      <YAxis fontSize={10} />
      <Tooltip />
      <Area dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
    </AreaChart>
  </ResponsiveContainer>
);

const PieChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie data={data} dataKey="value" outerRadius={80}>
        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

const RadarChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <RadarChart data={data}>
      <PolarGrid />
      <PolarAngleAxis dataKey="subject" />
      <Radar dataKey="X" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.4} />
      <Radar dataKey="Y" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.3} />
      <Radar dataKey="Z" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.2} />
      <Tooltip />
    </RadarChart>
  </ResponsiveContainer>
);

const BarChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" fontSize={10} />
      <YAxis fontSize={10} />
      <Tooltip />
      <Bar dataKey="avgFeatures" fill={COLORS[3]} />
    </BarChart>
  </ResponsiveContainer>
);

const GroupedBarChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" fontSize={10} />
      <YAxis />
      <Tooltip />
      <Bar dataKey="avgPrice" fill={COLORS[0]} />
      <Bar dataKey="avgFeatures" fill={COLORS[1]} />
    </BarChart>
  </ResponsiveContainer>
);

const ScatterChartBlock = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <ScatterChart>
      <CartesianGrid />
      <XAxis dataKey="features" />
      <YAxis dataKey="price" />
      <ZAxis dataKey="x" range={[50, 300]} />
      <Tooltip />
      <Scatter data={data} fill={COLORS[4]} />
    </ScatterChart>
  </ResponsiveContainer>
);

export default ProfessionalDashboard;
