'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

const PanelMenur = () => {
  const [xmlString, setXmlString] = useState("");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [catalogInfo, setCatalogInfo] = useState({ date: '', currency: '' });

  // FILTROS
  const [priceFilter, setPriceFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("List");

  // MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // EXPORT
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  // ===============================
  // FETCH XML (SIN CAMBIOS)
  // ===============================
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXMLFromSupabase();
  }, []);

  // ===============================
  // PARSE XML (SIN CAMBIOS)
  // ===============================
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
      const p = productNodes[i];

      const priceValue = parseFloat(
        p.getElementsByTagName("Value")[0]?.textContent || 0
      );

      let priority = "Normal";
      if (priceValue > 1500) priority = "High";
      if (priceValue < 300) priority = "Low";

      extracted.push({
        code: p.getElementsByTagName("Code")[0]?.textContent || "N/A",
        description: p.getElementsByTagName("Description")[0]?.textContent || "Sin descripción",
        price: priceValue,
        dimensions: `${p.getElementsByTagName("X")[0]?.textContent || '-'}x${p.getElementsByTagName("Y")[0]?.textContent || '-'}x${p.getElementsByTagName("Z")[0]?.textContent || '-'}`,
        category: p.getElementsByTagName("ClassificationRef")[0]?.textContent || "General",
        priority,
        tag: `Sprint ${Math.floor(Math.random() * 50) + 1}`
      });
    }

    setProducts(extracted);
  }, [xmlString]);

  // ===============================
  // CATEGORÍAS
  // ===============================
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  // ===============================
  // FILTRADO
  // ===============================
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || p.category === categoryFilter;

      let matchesPrice = true;
      if (priceFilter === "low") matchesPrice = p.price < 500;
      if (priceFilter === "mid") matchesPrice = p.price >= 500 && p.price <= 1500;
      if (priceFilter === "high") matchesPrice = p.price > 1500;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, priceFilter, categoryFilter]);

  // ===============================
  // UPDATE XML
  // ===============================
  const handleUpdateXML = async () => {
    try {
      setIsUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const productNodes = xmlDoc.getElementsByTagName("Product");

      for (let i = 0; i < productNodes.length; i++) {
        if (productNodes[i].getElementsByTagName("Code")[0]?.textContent === editingProduct.code) {
          productNodes[i].getElementsByTagName("Value")[0].textContent = newPrice;
          break;
        }
      }

      const updatedXml = new XMLSerializer().serializeToString(xmlDoc);
      await supabase.from('ClientsSERVEX').update({ xml_raw: updatedXml }).eq('user_id', user.id);

      setXmlString(updatedXml);
      setIsModalOpen(false);
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

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="h-full w-full bg-[#F9FAFB] text-[#1F2937] font-sans overflow-hidden">
      <main className="flex flex-col h-full overflow-hidden">

        {/* TOP NAV */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8">
          <div className="text-sm text-gray-400">
            Catalog / <span className="text-black font-medium">Product Sprints</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search SKU..."
              className="px-3 py-1.5 bg-gray-100 rounded-md text-xs"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => setIsExportOpen(!isExportOpen)} className="px-3 py-1.5 text-xs font-bold border rounded-md">
              Export
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse">
              Loading catalog...
            </div>
          ) : (
            categories.map(cat => {
              const list = filteredProducts.filter(p => p.category === cat);
              if (!list.length) return null;

              return (
                <div key={cat} className="mb-8">
                  <h3 className="text-sm font-bold mb-3">{cat}</h3>
                  <div className="bg-white border rounded-xl overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        {list.map((p, i) => (
                          <tr key={i} className="border-t hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="font-mono text-xs text-gray-400">{p.code}</div>
                              <div className="font-bold">{p.description}</div>
                            </td>
                            <td className="px-4 py-4 text-right font-black">
                              {p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setNewPrice(p.price);
                                  setIsModalOpen(true);
                                }}
                                className="text-xs font-bold text-blue-600"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h2 className="font-bold mb-4">Update Price</h2>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 rounded-md font-bold"
            />
            <div className="flex gap-2 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 border rounded-md py-2 text-xs font-bold">
                Cancel
              </button>
              <button onClick={handleUpdateXML} className="flex-1 bg-black text-white rounded-md py-2 text-xs font-bold">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT */}
      {isExportOpen && (
        <div className="fixed top-16 right-8 bg-white border rounded-xl shadow-lg">
          <button onClick={() => downloadFile(xmlString, 'catalog.xml', 'application/xml')} className="block px-4 py-2 text-xs font-bold hover:bg-gray-50">
            Download XML
          </button>
          <button onClick={() => downloadFile(JSON.stringify(products), 'catalog.json', 'application/json')} className="block px-4 py-2 text-xs font-bold hover:bg-gray-50">
            Download JSON
          </button>
        </div>
      )}
    </div>
  );
};

export default PanelMenur;
