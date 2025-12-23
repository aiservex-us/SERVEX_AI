'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';

const OrionDashboard = () => {
  const [xmlString, setXmlString] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catalogInfo, setCatalogInfo] = useState({ date: '', currency: '' });

  // 1. FETCH & PARSE (Igual a tu lógica original)
  useEffect(() => {
    const fetchXML = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('ClientsSERVEX').select('xml_raw').eq('user_id', user.id).single();
        if (data) setXmlString(data.xml_raw);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchXML();
  }, []);

  useEffect(() => {
    if (!xmlString) return;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const productNodes = xmlDoc.getElementsByTagName("Product");
    const extracted = [];
    for (let i = 0; i < productNodes.length; i++) {
      const p = productNodes[i];
      const basePrice = parseFloat(p.getElementsByTagName("Value")[0]?.textContent || "0");
      extracted.push({
        code: p.getElementsByTagName("Code")[0]?.textContent,
        description: p.getElementsByTagName("Description")[0]?.textContent,
        price: basePrice,
        category: p.getElementsByTagName("ClassificationRef")[0]?.textContent || "General",
      });
    }
    setProducts(extracted);
  }, [xmlString]);

  // 2. PROCESAMIENTO DE DATOS PARA GRÁFICAS
  const stats = useMemo(() => {
    const totalLoad = products.reduce((acc, curr) => acc + curr.price, 0);
    const categoryCounts = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    const radarData = Object.keys(categoryCounts).map(cat => ({
      subject: cat,
      A: products.filter(p => p.category === cat).reduce((a, b) => a + b.price, 0) / categoryCounts[cat],
      fullMark: 1500,
    }));

    return { totalLoad, categoryCounts, radarData };
  }, [products]);

  if (loading) return <div className="p-20 text-center animate-pulse">Cargando Visualización...</div>;

  return (
    <div className="h-[100vh] bg-[#F4F7FE] p-8 font-sans text-[#1B2559]">
      {/* Contenedor Principal Estilo Apple/Minimal */}
      <div className="mx-auto max-w-[1400px] bg-white rounded-[40px] shadow-2xl shadow-blue-100 overflow-hidden flex flex-col border border-gray-100">
        
        {/* Header */}
        <header className="px-12 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs italic">O</div>
            <span className="font-black tracking-tighter text-xl uppercase">Orion</span>
          </div>
          <nav className="flex gap-8 text-sm font-semibold text-gray-400">
            <span className="hover:text-purple-600 cursor-pointer">Statistics</span>
            <span className="text-black border-b-2 border-purple-600 pb-1">Overview</span>
            <span className="hover:text-purple-600 cursor-pointer">Dashboard</span>
            <span className="hover:text-purple-600 cursor-pointer">Analytics</span>
          </nav>
          <div className="flex items-center gap-4 opacity-40">
            <div className="w-5 h-5 border-2 border-black rounded-full" />
            <div className="w-5 h-5 bg-black rounded-sm" />
          </div>
        </header>

        <div className="flex flex-1 p-12 pt-4 gap-12">
          
          {/* Columna Izquierda: Estadísticas Generales */}
          <div className="w-1/4 flex flex-col gap-12">
            <section>
              <h1 className="text-4xl font-black mb-8">General statistics</h1>
              <div className="mb-2">
                <p className="text-gray-400 font-bold text-sm">Total system load</p>
                <p className="text-green-400 text-xs font-bold">All figures are normal</p>
              </div>
              <button className="bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-200">Details</button>
            </section>

            <section>
              <p className="text-gray-400 font-bold text-sm mb-1">Total Valuation</p>
              <h2 className="text-5xl font-black tracking-tight">${stats.totalLoad.toLocaleString()}</h2>
            </section>

            <section className="bg-white rounded-3xl p-6 border border-gray-50 shadow-sm">
              <h3 className="font-black text-sm mb-4">Quantity of data</h3>
              <div className="space-y-3">
                {Object.entries(stats.categoryCounts).slice(0, 6).map(([name, count]) => (
                  <div key={name} className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-400 font-bold">• {name}</span>
                    <span className="font-black">{count} <span className="text-gray-300 ml-2">{(count * 15).toLocaleString()}</span></span>
                  </div>
                ))}
              </div>
            </section>

            {/* Pequeña gráfica de barras inferior */}
            <div className="h-20 w-full flex items-end gap-1">
              {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                <div key={i} className="flex-1 bg-purple-100 rounded-t-full" style={{ height: `${h}%` }}>
                  {i === 3 && <div className="w-full h-full bg-purple-500 rounded-t-full" />}
                </div>
              ))}
            </div>
          </div>

          {/* Columna Central: Radar Chart */}
          <div className="flex-1 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-50/30 rounded-full scale-90 -z-10" />
            <div className="w-full h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#1B2559', fontSize: 12, fontWeight: 'bold' }} />
                  <Radar
                    name="Value"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.1}
                  />
                  {/* Círculos decorativos en los vértices */}
                  <Radar dataKey="A" stroke="#FF718B" fill="none" strokeWidth={3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Labels de categorías flotantes */}
            {stats.radarData.map((d, i) => (
               <div key={i} className="absolute text-[10px] font-black uppercase tracking-widest text-center" style={{ 
                 transform: `rotate(${i * (360/stats.radarData.length)}deg) translateY(-240px)` 
               }}>
                 <p className="rotate-0 text-gray-400">{d.subject}</p>
                 <p className="text-black text-sm">${Math.round(d.A).toLocaleString()}</p>
               </div>
            ))}
          </div>

          {/* Columna Derecha: Ranking Lateral */}
          <div className="w-1/4 flex flex-col gap-6 pt-8">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Last update</p>
              <p className="text-xs font-black">All figures are normal</p>
            </div>

            <div className="bg-white rounded-[35px] p-8 border border-gray-50 shadow-xl shadow-gray-100">
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 mb-4">
                   <svg className="w-full h-full -rotate-90">
                     <circle cx="48" cy="48" r="40" fill="none" stroke="#F4F7FE" strokeWidth="8"/>
                     <circle cx="48" cy="48" r="40" fill="none" stroke="#6366F1" strokeWidth="8" strokeDasharray="251" strokeDashoffset="50"/>
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/></svg>
                   </div>
                </div>
                <p className="text-gray-400 font-bold text-xs uppercase">Avg. Price</p>
                <h4 className="text-2xl font-black">${(stats.totalLoad / products.length || 0).toFixed(0)}</h4>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                {products.sort((a,b) => b.price - a.price).slice(0, 10).map((prod, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-gray-400 truncate w-24 uppercase tracking-tighter">{prod.description}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#1B2559]">${prod.price}</span>
                      <span className={i % 2 === 0 ? "text-green-400" : "text-red-400"}>
                        {i % 2 === 0 ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <footer className="px-12 py-4 flex justify-between items-center border-t border-gray-50 bg-gray-50/30">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[3px]">Orion Data Visualisation</p>
          <p className="text-[9px] font-bold text-gray-300 uppercase">2024</p>
        </footer>
      </div>
    </div>
  );
};

export default OrionDashboard;