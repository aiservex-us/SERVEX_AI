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
    <div className="flex h-[100%] w-full bg-[#F5F5F5] text-[#242424] font-sans overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAV - Teams Style (Light) */}
        <header className="h-12 border-b border-[#EDEBE9] bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-[#605E5C]">
            <span>Tasks</span> <span className="text-[#BEBBB8]">/</span> 
            <span>Catalog</span> <span className="text-[#BEBBB8]">/</span> 
            <span className="text-[#242424] font-semibold">Product Sprints</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="pl-9 pr-4 py-1 bg-[#F3F2F1] border border-transparent rounded-[4px] text-xs focus:bg-white focus:border-[#6264A7] focus:ring-0 w-64 transition-all"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="w-4 h-4 absolute left-3 top-1.5 text-[#605E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <button onClick={() => setIsExportOpen(!isExportOpen)} className="px-3 py-1 text-xs font-semibold border border-[#E1DFDD] bg-white rounded-[4px] hover:bg-[#F3F2F1] text-[#242424]">Export</button>
            <button className="px-3 py-1 text-xs font-semibold bg-[#6264A7] text-white rounded-[4px] hover:bg-[#4B53BC] flex items-center gap-2 transition-colors">
              <span className="text-lg leading-none">+</span> Issue
            </button>
          </div>
        </header>
  
        {/* SUB-HEADER FILTERS - Teams Tabs */}
        <div className="bg-white border-b border-[#EDEBE9] px-6 flex items-center gap-4 shrink-0">
          {['List', 'Kanban', 'Gantt', 'Calendar', 'Dashboard'].map(view => (
            <button 
              key={view}
              onClick={() => setActiveTab(view)}
              className={`text-xs font-semibold py-3 px-2 border-b-[3px] transition-all ${activeTab === view ? 'border-[#6264A7] text-[#6264A7]' : 'border-transparent text-[#605E5C] hover:text-[#242424]'}`}
            >
              {view}
            </button>
          ))}
          <div className="h-4 w-px bg-[#EDEBE9] mx-2" />
          
          <select 
            className="text-xs font-semibold text-[#605E5C] bg-transparent border-none focus:ring-0 cursor-pointer hover:text-[#242424]"
            onChange={(e) => setDimensionFilter(e.target.value)}
            value={dimensionFilter}
          >
            <option value="All">All Dimensions</option>
            <option value="with">With Dimensions</option>
            <option value="without">No Dimensions (N/A)</option>
          </select>
        </div>
  
        {/* TABLE CONTENT */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-full mx-auto space-y-6">
            {loading ? (
               <div className="flex items-center justify-center h-64 text-[#605E5C] animate-pulse font-semibold text-sm italic">Loading catalog data...</div>
            ) : (
              categories.map((cat) => {
                const catProducts = filteredProducts.filter(p => p.category === cat);
                if (catProducts.length === 0) return null;
  
                const itemsPerPage = 10;
                const currentPage = getPage(cat);
                const totalPages = Math.ceil(catProducts.length / itemsPerPage);
                const paginatedItems = catProducts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  
                return (
                  <section key={cat} className="space-y-2">
                    <div className="flex items-center gap-2 group cursor-pointer">
                      <svg className="w-3 h-3 text-[#605E5C]" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                      <h3 className="text-xs font-bold text-[#242424] uppercase tracking-wider">{cat}</h3>
                      <span className="text-[10px] font-semibold text-[#605E5C] bg-[#EDEBE9] px-1.5 py-0.5 rounded-sm">{catProducts.length}</span>
                    </div>
  
                    <div className="bg-white border border-[#EDEBE9] rounded-sm overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAF9F8] border-b border-[#EDEBE9] text-[11px] text-[#605E5C] font-semibold">
                            <th className="px-4 py-2.5 font-semibold">Name / Code</th>
                            <th className="px-4 py-2.5 font-semibold">Priority</th>
                            <th className="px-4 py-2.5 font-semibold">Dimensions</th>
                            <th className="px-4 py-2.5 font-semibold">Tag</th>
                            <th className="px-4 py-2.5 font-semibold text-right">Price ({catalogInfo.currency})</th>
                            <th className="px-4 py-2.5 font-semibold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EDEBE9]">
                          {paginatedItems.map((product, idx) => (
                            <tr key={idx} className="group hover:bg-[#F3F2F1] transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-semibold text-[#6264A7] mb-0.5">{product.code}</span>
                                  <span className="text-[13px] font-semibold text-[#242424]">{product.description}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] ${
                                  product.priority === 'High' ? 'bg-[#FDE7E9] text-[#A4262C]' : 
                                  product.priority === 'Normal' ? 'bg-[#E1DFDD] text-[#323130]' : 'bg-[#F3F2F1] text-[#605E5C]'
                                }`}>
                                  {product.priority}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-[#605E5C]">
                                {product.dimensions}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[11px] text-[#605E5C] flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  {product.tag}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {product.extraPrices.length > 0 ? (
                                  <div className="flex flex-col gap-0.5">
                                    {product.extraPrices.map((ep, i) => (
                                      <div key={i} className="text-[10px] flex justify-end gap-2">
                                        <span className="text-[#605E5C] font-semibold uppercase">{ep.label}:</span>
                                        <span className="font-bold text-[#242424]">${ep.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[13px] font-bold text-[#242424]">
                                    {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                  <button 
                                    onClick={() => handleOpenEdit(product)}
                                    className="p-1.5 hover:bg-[#EDEBE9] text-[#605E5C] hover:text-[#6264A7] rounded-sm transition-all"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {totalPages > 1 && (
                        <div className="px-4 py-2 border-t border-[#EDEBE9] flex items-center justify-between bg-[#FAF9F8]">
                          <span className="text-[10px] text-[#605E5C] font-semibold uppercase">
                            Page {currentPage + 1} of {totalPages}
                          </span>
                          <div className="flex gap-1">
                            <button 
                              disabled={currentPage === 0}
                              onClick={() => setPage(cat, currentPage - 1)}
                              className="p-1 rounded-sm border border-[#E1DFDD] bg-white hover:bg-[#F3F2F1] disabled:opacity-30 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                            </button>
                            <button 
                              disabled={currentPage >= totalPages - 1}
                              onClick={() => setPage(cat, currentPage + 1)}
                              className="p-1 rounded-sm border border-[#E1DFDD] bg-white hover:bg-[#F3F2F1] disabled:opacity-30 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
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
  
      {/* MODAL - Teams Fluent Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-md shadow-[0_20px_40px_rgba(0,0,0,0.2)] w-full max-w-md border border-[#EDEBE9] overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-bold text-[#242424] mb-1">Edit Product</h2>
              <p className="text-[11px] text-[#6264A7] mb-6 font-semibold uppercase tracking-wider">SKU: {editingProduct?.code}</p>
              
              <div className="grid grid-cols-1 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#605E5C]">Description</label>
                  <input 
                    type="text" 
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    className="w-full px-3 py-1.5 bg-[#FAF9F8] border-b-2 border-[#E1DFDD] focus:border-[#6264A7] outline-none text-[13px] font-semibold transition-all"
                  />
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[#605E5C]">Price ({catalogInfo.currency})</label>
                    <input 
                      type="number" 
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                      className="w-full px-3 py-1.5 bg-[#FAF9F8] border-b-2 border-[#E1DFDD] focus:border-[#6264A7] outline-none text-[13px] font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-[#605E5C]">Category</label>
                    <input 
                      type="text" 
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                      className="w-full px-3 py-1.5 bg-[#FAF9F8] border-b-2 border-[#E1DFDD] focus:border-[#6264A7] outline-none text-[13px] font-semibold"
                    />
                  </div>
                </div>
  
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-[#605E5C]">Dimensions (XxYxZ)</label>
                  <input 
                    type="text" 
                    placeholder="0x0x0"
                    value={editFormData.dimensions}
                    onChange={(e) => setEditFormData({...editFormData, dimensions: e.target.value})}
                    className="w-full px-3 py-1.5 bg-[#FAF9F8] border-b-2 border-[#E1DFDD] focus:border-[#6264A7] outline-none text-[13px] font-mono"
                  />
                </div>
              </div>
  
              <div className="flex items-center gap-2 mt-8">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-xs font-semibold text-[#242424] border border-[#E1DFDD] hover:bg-[#F3F2F1] rounded-[4px] transition-all">Cancel</button>
                <button 
                  onClick={handleUpdateXML}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 bg-[#6264A7] text-white text-xs font-semibold rounded-[4px] hover:bg-[#4B53BC] disabled:bg-[#C8C6C4] transition-all shadow-md"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
  
      {/* DROPDOWN EXPORT - Teams Style */}
      {isExportOpen && (
        <div className="absolute top-12 right-24 mt-1 w-48 bg-white border border-[#EDEBE9] rounded-sm shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-100">
          <button onClick={() => downloadFile(xmlString, 'catalog.xml', 'application/xml')} className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-[#F3F2F1] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#0078D4]" /> Download XML
          </button>
          <button onClick={() => downloadFile(JSON.stringify(products), 'catalog.json', 'application/json')} className="w-full px-4 py-2 text-left text-xs font-semibold hover:bg-[#F3F2F1] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#D83B01]" /> Download JSON
          </button>
        </div>
      )}
    </div>
  );
      }

export default PanelMenur;