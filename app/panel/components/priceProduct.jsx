'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { Search, ExportSquare, Printer, Plus, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'; // Opcional: Iconos similares a la imagen

const PanelMenur = () => {
  const [xmlString, setXmlString] = useState("");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- LÓGICA INTACTA ---
  useEffect(() => {
    const fetchXMLFromSupabase = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("No se encontró usuario"); return; }
        const { data, error: sbError } = await supabase
          .from('ClientsSERVEX')
          .select('xml_raw, company_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (sbError) throw sbError;
        if (data && data.xml_raw) setXmlString(data.xml_raw);
        else setError("No se encontraron datos XML");
      } catch (err) { setError("Error al conectar con Supabase"); }
      finally { setLoading(false); }
    };
    fetchXMLFromSupabase();
  }, []);

  useEffect(() => {
    if (!xmlString) return;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const productNodes = xmlDoc.getElementsByTagName("Product");
    const extracted = [];
    for (let i = 0; i < productNodes.length; i++) {
      const product = productNodes[i];
      const code = product.getElementsByTagName("Code")[0]?.textContent || "N/A";
      const description = product.getElementsByTagName("Description")[0]?.textContent || "Sin descripción";
      const priceNode = product.getElementsByTagName("Price")[0];
      const priceValue = priceNode ? priceNode.getElementsByTagName("Value")[0]?.textContent : "0";
      extracted.push({ code, description, price: parseFloat(priceValue) || 0 });
    }
    setProducts(extracted);
  }, [xmlString]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  return (
    <div className="flex flex-col h-full w-full bg-[#fcfcfd] font-sans text-[#101828]">
      {/* TÍTULO SUPERIOR */}
      <div className="px-8 py-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm transition-all">
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm transition-all">
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0047FF] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all">
            + Create order
          </button>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="px-8 pb-4 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-[400px]">
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f4f6f8] border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-3 text-gray-400">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <button className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white">Date range</button>
            <button className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white">Status</button>
            <button className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white">More filters</button>
          </div>
        </div>

        {/* TABS (All orders, Pickups, etc) */}
        <div className="flex border-b border-gray-100 gap-8">
          <button className="pb-3 text-sm font-bold text-blue-600 border-b-2 border-blue-600 px-1 flex items-center gap-2">
            All items <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{products.length}</span>
          </button>
          <button className="pb-3 text-sm font-semibold text-gray-400 px-1">Sync status</button>
          <button className="pb-3 text-sm font-semibold text-gray-400 px-1">Recent updates</button>
        </div>
      </div>

      {/* TABLA ESTILO DASHBOARD */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(16,24,40,0.1)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="w-12 px-6 py-4"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-4 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">ID No.</th>
                <th className="px-4 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product Description</th>
                <th className="px-4 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Price</th>
                <th className="px-4 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-20 text-center text-gray-400 animate-pulse font-medium">Loading catalog data...</td></tr>
              ) : filteredProducts.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-500 font-mono tracking-tighter">{item.code}</td>
                  <td className="px-4 py-4 text-sm font-bold text-[#101828]">{item.description}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">CET Catalog</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${idx % 3 === 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {idx % 3 === 0 ? 'In Stock' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-right text-[#101828]">
                    ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="text-blue-600 text-xs font-bold hover:underline">Manage</button>
                      <button className="text-gray-400 hover:text-black transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINACIÓN ESTILO IMAGEN */}
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center text-xs font-medium text-gray-500">
            <div className="flex items-center gap-2">
              showing 1 - {filteredProducts.length} of {products.length} results
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-gray-100 rounded"> <ChevronLeft size={16}/> </button>
              <button className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg font-bold">1</button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-lg">2</button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-lg">3</button>
              <button className="p-1 hover:bg-gray-100 rounded"> <ChevronRight size={16}/> </button>
            </div>
            <div className="flex items-center gap-2">
              Items per page
              <select className="border border-gray-200 rounded-lg p-1 outline-none">
                <option>10</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelMenur;