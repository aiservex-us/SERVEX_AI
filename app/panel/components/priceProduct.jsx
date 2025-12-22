'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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

  // ESTADOS PARA EL MODAL DE EDICIÓN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // EXPORT
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  // 1. OBTENER XML DE SUPABASE
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

  useEffect(() => {
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

  // 3. LÓGICA DE FILTRADO
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

  // ACTUALIZAR XML
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setNewPrice(product.price.toString());
    setIsModalOpen(true);
  };

  const handleUpdateXML = async () => {
    try {
      setIsUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      const productNodes = xmlDoc.getElementsByTagName("Product");

      for (let i = 0; i < productNodes.length; i++) {
        const code = productNodes[i].getElementsByTagName("Code")[0]?.textContent;
        if (code === editingProduct.code) {
          productNodes[i].getElementsByTagName("Value")[0].textContent = newPrice;
          break;
        }
      }

      const serializer = new XMLSerializer();
      const updatedXmlString = serializer.serializeToString(xmlDoc);

      await supabase
        .from('ClientsSERVEX')
        .update({ xml_raw: updatedXmlString })
        .eq('user_id', user.id);

      setXmlString(updatedXmlString);
      setIsModalOpen(false);
      alert("XML updated successfully");
    } catch (err) {
      console.error(err);
      alert("Error updating XML");
    } finally {
      setIsUpdating(false);
    }
  };

  // EXPORT HELPERS
  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const downloadXML = () => {
    downloadFile(xmlString, 'catalog.xml', 'application/xml');
  };

  const downloadJSON = () => {
    downloadFile(
      JSON.stringify({ catalogInfo, products }, null, 2),
      'catalog.json',
      'application/json'
    );
  };

  // Cerrar dropdown
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-white font-sans text-slate-900">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalog Products</h1>
          <p className="text-xs text-slate-400">Effective Date: {catalogInfo.date}</p>
        </div>

        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm"
          >
            Export
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
              <button onClick={downloadXML} className="w-full px-4 py-3 text-left hover:bg-slate-50 text-sm">
                Download XML
              </button>
              <button onClick={downloadJSON} className="w-full px-4 py-3 text-left hover:bg-slate-50 text-sm">
                Download JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BARRA DE FILTROS ESTILIZADA */}
      <div className="px-8 pb-4 space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          
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
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="text-blue-600 text-xs font-bold hover:underline"
                        >
                          Edit
                        </button>
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

      {/* MODAL DE EDICIÓN ESTILIZADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Edit Product Price</h2>
            <p className="text-sm text-slate-500 mb-6">Updating price for SKU: <span className="font-mono font-bold text-blue-600">{editingProduct?.code}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Price ({catalogInfo.currency})</label>
                <input 
                  type="number" 
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8f9fb] border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-lg"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateXML}
                disabled={isUpdating}
                className="flex-1 px-4 py-2.5 bg-[#0047FF] text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-lg shadow-blue-200"
              >
                {isUpdating ? "Updating XML..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelMenur;