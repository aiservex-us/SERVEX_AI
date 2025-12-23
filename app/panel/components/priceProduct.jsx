'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

const PanelMenur = () => {
  const [xmlString, setXmlString] = useState("");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [catalogInfo, setCatalogInfo] = useState({ date: '', currency: '' });
  
  // ESTADO DE PAGINACIÓN POR CATEGORÍA
  const [categoryPages, setCategoryPages] = useState({});

  // ESTADOS DE FILTRADO
  const [priceFilter, setPriceFilter] = useState("All");
  const [dimensionFilter, setDimensionFilter] = useState("All"); // Cambiado de categoryFilter a dimensionFilter
  const [activeTab, setActiveTab] = useState("List");

  // ESTADOS PARA EL MODAL DE EDICIÓN
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    description: "",
    price: "",
    dimensions: "",
    category: ""
  });
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
      
      // PRECIO BASE
      const priceNode = product.getElementsByTagName("Price")[0];
      const basePrice = parseFloat(priceNode ? priceNode.getElementsByTagName("Value")[0]?.textContent : "0") || 0;
      
      // --- LÓGICA DE MÚLTIPLES PRECIOS (GRADOS) ---
      const extraPrices = [];
      const options = product.getElementsByTagName("Option");
      
      for (let j = 0; j < options.length; j++) {
        const opt = options[j];
        const optDesc = opt.getElementsByTagName("Description")[0]?.textContent;
        const optPriceNode = opt.getElementsByTagName("OptionPrice")[0];
        const optVal = parseFloat(optPriceNode ? optPriceNode.getElementsByTagName("Value")[0]?.textContent : "0") || 0;
        
        if (optDesc && optDesc.toLowerCase().includes("grade")) {
          extraPrices.push({
            label: optDesc,
            value: basePrice + optVal
          });
        }
      }

      const xVal = product.getElementsByTagName("X")[0]?.textContent || "";
      const yVal = product.getElementsByTagName("Y")[0]?.textContent || "";
      const zVal = product.getElementsByTagName("Z")[0]?.textContent || "";
      let dimensions = xVal || yVal || zVal ? `${xVal}x${yVal}x${zVal}` : "N/A";
      
      const category = product.getElementsByTagName("ClassificationRef")[0]?.textContent || "General";

      let priority = "Normal";
      if (basePrice > 1500) priority = "High";
      if (basePrice < 300) priority = "Low";

      extracted.push({
        code,
        description,
        price: basePrice,
        extraPrices,
        dimensions,
        category,
        priority,
        tag: `Sprint ${Math.floor(Math.random() * 50) + 1}`
      });
    }
    setProducts(extracted);
  }, [xmlString]);

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  // 3. LÓGICA DE FILTRADO (MODIFICADA PARA DIMENSIONES)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrado por dimensión
      let matchesDim = true;
      if (dimensionFilter === "with") matchesDim = p.dimensions !== "N/A";
      if (dimensionFilter === "without") matchesDim = p.dimensions === "N/A";

      let matchesPrice = true;
      if (priceFilter === "low") matchesPrice = p.price < 500;
      if (priceFilter === "mid") matchesPrice = p.price >= 500 && p.price <= 1500;
      if (priceFilter === "high") matchesPrice = p.price > 1500;

      return matchesSearch && matchesDim && matchesPrice;
    });
  }, [searchTerm, products, priceFilter, dimensionFilter]);

  // ABRIR MODAL CON DATOS
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditFormData({
      description: product.description,
      price: product.price,
      dimensions: product.dimensions,
      category: product.category
    });
    setIsModalOpen(true);
  };

  // ACTUALIZAR XML COMPLETO
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
          const descNode = productNodes[i].getElementsByTagName("Description")[0];
          if (descNode) descNode.textContent = editFormData.description;
          const priceValNode = productNodes[i].getElementsByTagName("Value")[0];
          if (priceValNode) priceValNode.textContent = editFormData.price;
          const catNode = productNodes[i].getElementsByTagName("ClassificationRef")[0];
          if (catNode) catNode.textContent = editFormData.category;
          const dims = editFormData.dimensions.split('x');
          if (dims.length === 3) {
            if (productNodes[i].getElementsByTagName("X")[0]) productNodes[i].getElementsByTagName("X")[0].textContent = dims[0];
            if (productNodes[i].getElementsByTagName("Y")[0]) productNodes[i].getElementsByTagName("Y")[0].textContent = dims[1];
            if (productNodes[i].getElementsByTagName("Z")[0]) productNodes[i].getElementsByTagName("Z")[0].textContent = dims[2];
          }
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

  const getPage = (cat) => categoryPages[cat] || 0;
  const setPage = (cat, val) => setCategoryPages(prev => ({ ...prev, [cat]: val }));

  return (
    <div className="flex h-[100%] w-full bg-[#F9FAFB] text-[#1F2937] font-sans overflow-hidden">
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
          
          {/* FILTRO DE DIMENSIONES (CAMBIO SOLICITADO) */}
          <select 
            className="text-xs font-bold text-gray-500 bg-transparent border-none focus:ring-0 cursor-pointer"
            onChange={(e) => setDimensionFilter(e.target.value)}
            value={dimensionFilter}
          >
            <option value="All">All Dimensions</option>
            <option value="with">With Dimensions</option>
            <option value="without">No Dimensions (N/A)</option>
          </select>
        </div>

        {/* TABLE CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {loading ? (
               <div className="flex items-center justify-center h-64 text-gray-400 animate-pulse font-medium">Loading catalog data...</div>
            ) : (
              categories.map((cat) => {
                const catProducts = filteredProducts.filter(p => p.category === cat);
                if (catProducts.length === 0) return null;

                const itemsPerPage = 10;
                const currentPage = getPage(cat);
                const totalPages = Math.ceil(catProducts.length / itemsPerPage);
                const paginatedItems = catProducts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

                return (
                  <section key={cat} className="space-y-4">
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
                            <th className="px-4 py-3 font-bold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {paginatedItems.map((product, idx) => (
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
                              <td className="px-4 py-4 text-right">
                                {product.extraPrices.length > 0 ? (
                                  <div className="flex flex-col gap-1">
                                    {product.extraPrices.map((ep, i) => (
                                      <div key={i} className="text-[10px] leading-tight flex justify-end gap-2">
                                        <span className="text-gray-400 uppercase font-bold">{ep.label}:</span>
                                        <span className="font-black">${ep.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm font-black">
                                    {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center">
                                  <button 
                                    onClick={() => handleOpenEdit(product)}
                                    className="p-1.5 hover:bg-gray-200 rounded-md transition-all"
                                  >
                                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {totalPages > 1 && (
                        <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between bg-white">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Page {currentPage + 1} of {totalPages}
                          </span>
                          <div className="flex gap-2">
                            <button 
                              disabled={currentPage === 0}
                              onClick={() => setPage(cat, currentPage - 1)}
                              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <button 
                              disabled={currentPage >= totalPages - 1}
                              onClick={() => setPage(cat, currentPage + 1)}
                              className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* MODAL DE EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6">
              <h2 className="text-lg font-bold mb-1">Edit Product Information</h2>
              <p className="text-xs text-gray-400 mb-6 font-mono">SKU: {editingProduct?.code}</p>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                  <input 
                    type="text" 
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price ({catalogInfo.currency})</label>
                    <input 
                      type="number" 
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                    <input 
                      type="text" 
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dimensions (XxYxZ)</label>
                  <input 
                    type="text" 
                    placeholder="0x0x0"
                    value={editFormData.dimensions}
                    onChange={(e) => setEditFormData({...editFormData, dimensions: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
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
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DROPDOWN EXPORT */}
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