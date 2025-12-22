'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

const PanelMenur = () => {
  const [xmlString, setXmlString] = useState("");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [catalogInfo, setCatalogInfo] = useState({ date: '', currency: '' });

  // ESTADOS DE FILTRADO
  const [priceFilter, setPriceFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // 1. OBTENER XML DE SUPABASE
  useEffect(() => {
    const fetchXMLFromSupabase = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('ClientsSERVEX')
          .select('xml_raw')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) setXmlString(data.xml_raw);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchXMLFromSupabase();
  }, []);

  // 2. PARSEAR XML
  useEffect(() => {
    if (!xmlString) return;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const effectiveDate = xmlDoc.getElementsByTagName("EffectiveDate")[0]?.textContent || "N/A";
    const currency = xmlDoc.getElementsByTagName("Currency")[0]?.textContent || "USD";
    setCatalogInfo({ date: effectiveDate, currency });

    const productNodes = xmlDoc.getElementsByTagName("Product");
    const extracted = [];

    for (let i = 0; i < productNodes.length; i++) {
      const product = productNodes[i];
      const code = product.getElementsByTagName("Code")[0]?.textContent || "N/A";
      const description = product.getElementsByTagName("Description")[0]?.textContent || "Sin descripción";
      
      const priceNode = product.getElementsByTagName("Price")[0];
      const priceValue = priceNode ? priceNode.getElementsByTagName("Value")[0]?.textContent : "0";

      const xVal = product.getElementsByTagName("X")[0]?.textContent;
      const yVal = product.getElementsByTagName("Y")[0]?.textContent;
      const zVal = product.getElementsByTagName("Z")[0]?.textContent;

      let dimensions = "N/A";
      if (xVal || yVal || zVal) {
        dimensions = `${xVal || '-'} x ${yVal || '-'} x ${zVal || '-'}`;
      }

      const category = product.getElementsByTagName("ClassificationRef")[0]?.textContent || "General";

      extracted.push({
        code,
        description,
        price: parseFloat(priceValue) || 0,
        dimensions,
        category
      });
    }
    setProducts(extracted);
  }, [xmlString]);

  // CATEGORÍAS ÚNICAS
  const categories = useMemo(() => {
    return ["All", ...new Set(products.map(p => p.category))];
  }, [products]);

  // 3. LÓGICA DE FILTRADO (SKU, Nombre y Precio)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;

      let matchesPrice = true;
      if (priceFilter === "low") matchesPrice = p.price < 500;
      if (priceFilter === "mid") matchesPrice = p.price >= 500 && p.price <= 1500;
      if (priceFilter === "high") matchesPrice = p.price > 1500;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchTerm, products, priceFilter, categoryFilter]);

  return (
    <div className="flex flex-col h-full w-full bg-white font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Catalog Products</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Effective Date: {catalogInfo.date}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm text-slate-700">
            Export
          </button>
        
        </div>
      </div>

      {/* BARRA DE FILTROS ESTILIZADA */}
      <div className="px-8 pb-4 space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* BUSCADOR SKU / NOMBRE */}
          <div className="relative w-full md:w-[450px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input
              type="text"
              placeholder="Search by SKU or product name..."
              className="w-full pl-12 pr-4 py-2.5 bg-[#f8f9fb] border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* FILTROS TIPO DROPDOWN ESTILIZADOS */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[#f8f9fb] p-1 rounded-xl border border-slate-100">
              {[
                { label: 'All Prices', value: 'All' },
                { label: '< $500', value: 'low' },
                { label: '$500 - $1.5k', value: 'mid' },
                { label: '> $1.5k', value: 'high' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setPriceFilter(range.value)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    priceFilter === range.value 
                    ? 'bg-white text-[#0047FF] shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

           
          </div>
        </div>

        {/* TABS CON CONTADOR DINÁMICO */}
        <div className="flex items-center gap-8 border-b border-slate-100">
          <button className="pb-3 text-sm font-bold text-[#0047FF] border-b-2 border-[#0047FF] px-1 flex items-center gap-2 transition-all">
            Results <span className="bg-blue-50 text-[#0047FF] text-[10px] px-2 py-0.5 rounded-md font-black">{filteredProducts.length}</span>
          </button>
        
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 overflow-auto px-8 pb-10">
        <div className="border border-slate-100 rounded-2xl shadow-sm overflow-hidden bg-white">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-[#fcfcfd]">
              <tr>
                <th className="px-6 py-4 text-left w-12"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" /></th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">SKU / Code</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Product Name</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Dimensions</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-left">Category</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Price ({catalogInfo.currency})</th>
                <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-20 text-center text-slate-400 animate-pulse">Loading catalog...</td></tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5"><input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" /></td>
                    <td className="px-4 py-5 text-sm text-slate-500 font-medium font-mono">{item.code}</td>
                    <td className="px-4 py-5">
                      <div className="text-sm font-bold text-slate-900 leading-tight">{item.description}</div>
                    </td>
                    <td className="px-4 py-5 text-xs text-slate-500 font-medium">{item.dimensions}</td>
                    <td className="px-4 py-5">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-sm font-bold text-right text-slate-900">
                      ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-blue-600 text-xs font-bold hover:underline">Edit</button>
                        <button className="text-slate-400 hover:text-slate-900 text-[10px] font-bold border border-slate-100 rounded px-1.5 py-0.5">More</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="px-6 py-20 text-center text-slate-400 font-medium">No results found for your selection.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PanelMenur;