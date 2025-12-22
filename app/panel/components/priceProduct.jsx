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
  const [activeTab, setActiveTab] = useState("List");

  // ESTADOS PARA EL MODAL DE EDICIÓN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // EXPORT
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  // 1. OBTENER XML DE SUPABASE (Funcionalidad Original intacta)
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
      const priceValue = parseFloat(priceNode ? priceNode.getElementsByTagName("Value")[0]?.textContent : "0") || 0;
      
      const xVal = product.getElementsByTagName("X")[0]?.textContent;
      const yVal = product.getElementsByTagName("Y")[0]?.textContent;
      const zVal = product.getElementsByTagName("Z")[0]?.textContent;
      let dimensions = xVal || yVal || zVal ? `${xVal || '-'}x${yVal || '-'}x${zVal || '-'}` : "N/A";
      
      const category = product.getElementsByTagName("ClassificationRef")[0]?.textContent || "General";

      // Lógica de "Prioridad" basada en precio para la UI
      let priority = "Normal";
      if (priceValue > 1500) priority = "High";
      if (priceValue < 300) priority = "Low";

      extracted.push({
        code,
        description,
        price: priceValue,
        dimensions,
        category,
        priority,
        // Tag ficticio coherente para el diseño
        tag: `Sprint ${Math.floor(Math.random() * 50) + 1}`
      });
    }
    setProducts(extracted);
  }, [xmlString]);

  // CATEGORÍAS ÚNICAS PARA AGRUPACIÓN (Inspirado en la imagen)
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
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
      await supabase.from('ClientsSERVEX').update({ xml_raw: updatedXmlString }).eq('user_id', user.id);
      setXmlString(updatedXmlString);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

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

  return (
    <div className="flex h-[100%] w-full bg-[#F9FAFB] text-[#1F2937] font-sans overflow-hidden">
      
      {/* SIDEBAR (Inspirado en la imagen) */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold italic">S</div>
          <span className="font-bold text-lg tracking-tight">Stacks</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Main Menu</div>
          {['Dashboard', 'Products', 'Inventory', 'Analytics', 'Settings'].map((item) => (
            <button key={item} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${item === 'Products' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${item === 'Products' ? 'bg-blue-600' : 'bg-transparent'}`} />
              {item}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">Admin User</p>
              <p className="text-[10px] text-gray-400 truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAV */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Tasks</span> <span className="text-gray-300">/</span> 
            <span>Catalog</span> <span className="text-gray-300">/</span> 
            <span className="text-black font-medium">Product Sprints</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search SKU..." 
                  className="pl-8 pr-4 py-1.5 bg-gray-100 border-none rounded-md text-xs focus:ring-2 focus:ring-blue-500 w-64"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <button onClick={() => setIsExportOpen(!isExportOpen)} className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-md hover:bg-gray-50">Export</button>
            <button className="px-3 py-1.5 text-xs font-bold bg-black text-white rounded-md flex items-center gap-2">
              <span className="text-lg leading-none">+</span> Issue
            </button>
          </div>
        </header>

        {/* SUB-HEADER FILTERS */}
        <div className="bg-white border-b border-gray-200 px-8 py-2 flex items-center gap-6 overflow-x-auto shrink-0">
          {['List', 'Kanban', 'Gantt', 'Calendar', 'Dashboard'].map(view => (
            <button 
              key={view}
              onClick={() => setActiveTab(view)}
              className={`text-xs font-bold py-3 px-1 border-b-2 transition-colors ${activeTab === view ? 'border-blue-600 text-black' : 'border-transparent text-gray-400'}`}
            >
              {view}
            </button>
          ))}
          <div className="h-4 w-px bg-gray-200 mx-2" />
          <select 
            className="text-xs font-bold text-gray-500 bg-transparent border-none focus:ring-0 cursor-pointer"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* TABLE CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {loading ? (
               <div className="flex items-center justify-center h-64 text-gray-400 animate-pulse font-medium">Loading catalog data...</div>
            ) : (
              categories
              .filter(cat => categoryFilter === "All" || cat === categoryFilter)
              .map((cat) => {
                const catProducts = filteredProducts.filter(p => p.category === cat);
                if (catProducts.length === 0) return null;

                return (
                  <section key={cat} className="space-y-4">
                    {/* CATEGORY HEADER */}
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${cat === 'UXR' ? 'bg-orange-400' : 'bg-green-400'}`} />
                      <h3 className="text-sm font-bold text-gray-900">{cat}</h3>
                      <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 rounded text-gray-400">{catProducts.length}</span>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400 font-black">
                            <th className="px-6 py-3 font-bold">Name / Code</th>
                            <th className="px-4 py-3 font-bold">Priority</th>
                            <th className="px-4 py-3 font-bold">Dimensions</th>
                            <th className="px-4 py-3 font-bold">Tag</th>
                            <th className="px-4 py-3 font-bold text-right">Price ({catalogInfo.currency})</th>
                            <th className="px-4 py-3 font-bold text-center">Assignee</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {catProducts.map((product, idx) => (
                            <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-mono text-gray-400 mb-0.5">{product.code}</span>
                                  <span className="text-sm font-bold text-gray-800">{product.description}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                  product.priority === 'High' ? 'bg-red-50 text-red-600' : 
                                  product.priority === 'Normal' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {product.priority}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-xs text-gray-500 font-medium">
                                {product.dimensions}
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  {product.tag}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm font-black text-right">
                                {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="flex -space-x-2">
                                    {[1, 2].map(i => (
                                      <div key={i} className={`w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br ${i%2===0 ? 'from-pink-400 to-purple-500':'from-blue-400 to-cyan-400'}`} />
                                    ))}
                                  </div>
                                  <button 
                                    onClick={() => { setEditingProduct(product); setNewPrice(product.price); setIsModalOpen(true); }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded-md transition-all"
                                  >
                                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE EDICIÓN - ESTILO PROFESIONAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6">
              <h2 className="text-lg font-bold mb-1">Update Price</h2>
              <p className="text-xs text-gray-400 mb-6 font-mono">{editingProduct?.code}</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Value ({catalogInfo.currency})</label>
                  <input 
                    type="number" 
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-all">Cancel</button>
                <button 
                  onClick={handleUpdateXML}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 disabled:bg-gray-300 transition-all"
                >
                  {isUpdating ? "Saving..." : "Confirm Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DROPDOWN EXPORT (Simulado) */}
      {isExportOpen && (
        <div className="absolute top-16 right-20 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
          <button onClick={() => downloadFile(xmlString, 'catalog.xml', 'application/xml')} className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-50 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Download XML
          </button>
          <button onClick={() => downloadFile(JSON.stringify(products), 'catalog.json', 'application/json')} className="w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-50 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Download JSON
          </button>
        </div>
      )}
    </div>
  );
};

export default PanelMenur;