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

  // ESTADOS PARA EL MODAL DE EDICIÓN (CAMPOS COMPLETOS)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    description: "",
    price: "",
    category: "",
    x: "",
    y: "",
    z: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);

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

      const xVal = product.getElementsByTagName("X")[0]?.textContent || "";
      const yVal = product.getElementsByTagName("Y")[0]?.textContent || "";
      const zVal = product.getElementsByTagName("Z")[0]?.textContent || "";

      let dimensionsLabel = "N/A";
      if (xVal || yVal || zVal) {
        dimensionsLabel = `${xVal || '-'} x ${yVal || '-'} x ${zVal || '-'}`;
      }

      const category = product.getElementsByTagName("ClassificationRef")[0]?.textContent || "General";

      extracted.push({
        code,
        description,
        price: parseFloat(priceValue) || 0,
        dimensions: dimensionsLabel,
        category,
        rawDims: { x: xVal, y: yVal, z: zVal }
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

  // --- LÓGICA DE EDICIÓN COMPLETA ---
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditFormData({
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      x: product.rawDims.x,
      y: product.rawDims.y,
      z: product.rawDims.z
    });
    setIsModalOpen(true);
  };

  const handleUpdateXML = async () => {
    try {
      setIsUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const productNodes = xmlDoc.getElementsByTagName("Product");
      let found = false;

      for (let i = 0; i < productNodes.length; i++) {
        const code = productNodes[i].getElementsByTagName("Code")[0]?.textContent;
        if (code === editingProduct.code) {
          // Actualizar Descripción
          productNodes[i].getElementsByTagName("Description")[0].textContent = editFormData.description;
          // Actualizar Precio
          productNodes[i].getElementsByTagName("Value")[0].textContent = editFormData.price;
          // Actualizar Categoría
          productNodes[i].getElementsByTagName("ClassificationRef")[0].textContent = editFormData.category;
          // Actualizar Dimensiones
          if (productNodes[i].getElementsByTagName("X")[0]) productNodes[i].getElementsByTagName("X")[0].textContent = editFormData.x;
          if (productNodes[i].getElementsByTagName("Y")[0]) productNodes[i].getElementsByTagName("Y")[0].textContent = editFormData.y;
          if (productNodes[i].getElementsByTagName("Z")[0]) productNodes[i].getElementsByTagName("Z")[0].textContent = editFormData.z;
          
          found = true;
          break;
        }
      }

      if (!found) throw new Error("Product not found");

      const serializer = new XMLSerializer();
      const updatedXmlString = serializer.serializeToString(xmlDoc);

      const { error } = await supabase
        .from('ClientsSERVEX')
        .update({ xml_raw: updatedXmlString })
        .eq('user_id', user.id);

      if (error) throw error;

      setXmlString(updatedXmlString);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error updating data");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#fcfcfd] font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-6 gap-4 bg-white border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Catalog Products</h1>
          <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">Effective: {catalogInfo.date}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all text-slate-700 shadow-sm">
            Export XML
          </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="px-8 py-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:w-[450px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input
              type="text"
              placeholder="Search by SKU or Name..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-slate-200/50 p-1 rounded-2xl">
            {['All', 'low', 'mid', 'high'].map((v) => (
              <button
                key={v}
                onClick={() => setPriceFilter(v)}
                className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${priceFilter === v ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {v === 'All' ? 'ALL PRICES' : v === 'low' ? '< $500' : v === 'mid' ? '$500-$1.5K' : '> $1.5K'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 overflow-auto px-8 pb-10">
        <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SKU Code</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-6 py-6 text-sm font-bold text-slate-400 font-mono">{item.code}</td>
                  <td className="px-6 py-6">
                    <div className="text-sm font-black text-slate-800">{item.description}</div>
                    <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase italic">{item.dimensions}</div>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-3 py-1 text-[10px] font-black rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right text-sm font-black text-blue-600">
                    ${item.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="opacity-0 group-hover:opacity-100 bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                    >
                      EDIT PRODUCT
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ULTRA-MODERNO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            {/* Header Modal */}
            <div className="bg-blue-600 p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Product Editor</h2>
                  <p className="text-blue-100 text-xs font-bold mt-1 uppercase tracking-widest">SKU: {editingProduct?.code}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            {/* Formulario */}
            <div className="p-8 grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Description</label>
                <input 
                  type="text" 
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  className="w-full mt-2 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <input 
                  type="text" 
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                  className="w-full mt-2 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price ({catalogInfo.currency})</label>
                <input 
                  type="number" 
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                  className="w-full mt-2 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-black text-blue-600"
                />
              </div>

              <div className="col-span-2 grid grid-cols-3 gap-4">
                {['x', 'y', 'z'].map((dim) => (
                  <div key={dim}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dim {dim.toUpperCase()}</label>
                    <input 
                      type="text" 
                      value={editFormData[dim]}
                      onChange={(e) => setEditFormData({...editFormData, [dim]: e.target.value})}
                      className="w-full mt-2 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 font-bold text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-8 pt-0 flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 text-sm font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
              >
                Discard
              </button>
              <button 
                onClick={handleUpdateXML}
                disabled={isUpdating}
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 uppercase tracking-widest"
              >
                {isUpdating ? "Syncing XML..." : "Update Product Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelMenur;