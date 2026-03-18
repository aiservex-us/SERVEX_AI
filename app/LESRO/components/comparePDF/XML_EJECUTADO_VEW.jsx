"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPackage, FiLayers, FiChevronDown, FiChevronRight, 
  FiDollarSign, FiInfo, FiHash, FiActivity 
} from 'react-icons/fi';
import { Box, FileText, Search, Database } from "lucide-react";

const TeamsOFDAVisualizer = ({ xmlString }) => {
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const catalogData = useMemo(() => {
    if (!xmlString) return null;
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      
      const allFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const productNodes = Array.from(xmlDoc.getElementsByTagName("Product"));

      return productNodes.map((prod, idx) => {
        const sku = prod.getElementsByTagName("Code")[0]?.textContent || "N/A";
        const description = prod.getElementsByTagName("Description")[0]?.textContent || "No Description";
        const basePriceNode = prod.querySelector("Price > Value");
        const basePrice = parseFloat(basePriceNode?.textContent || "0");

        // Lógica de vinculación por Code (igual que tu Python: if sku in f_code)
        const relatedFeatures = allFeatures.filter(f => {
          const fCode = f.getElementsByTagName("Code")[0]?.textContent || "";
          return fCode.includes(sku);
        });

        const processedFeatures = relatedFeatures.map(f => {
          const fName = f.getElementsByTagName("Code")[0]?.textContent || "Feature";
          const optionNodes = Array.from(f.getElementsByTagName("Option"));

          const options = optionNodes.map(opt => {
            const optCode = opt.getElementsByTagName("Code")[0]?.textContent || "";
            const upchargeNode = opt.querySelector("OptionPrice > Value");
            const upcharge = parseFloat(upchargeNode?.textContent || "0");
            const isGrade = optCode.toUpperCase().includes("GRD");

            return {
              code: optCode,
              upcharge,
              total: basePrice + upcharge,
              desc: opt.getElementsByTagName("Description")[0]?.textContent || "",
              isGrade
            };
          });

          return { name: fName, options };
        });

        return { id: idx, sku, description, basePrice, features: processedFeatures };
      });
    } catch (err) {
      console.error("XML Engine Error:", err);
      return [];
    }
  }, [xmlString]);

  // Filtro de búsqueda por SKU
  const filteredData = useMemo(() => {
    return catalogData?.filter(p => p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [catalogData, searchTerm]);

  if (!catalogData) return (
    <div className="flex flex-col items-center justify-center p-20 bg-[#F5F5F5] rounded-xl border-2 border-dashed border-slate-200">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-[#6264A7] mb-4">
        <Database size={32} />
      </motion.div>
      <p className="text-slate-500 font-bold text-sm">Synchronizing with LESRO PIM...</p>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#F3F2F1] text-slate-700 font-sans overflow-hidden">
      
      {/* HEADER ESTILO TEAMS */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#6264A7] flex items-center justify-center text-white shadow-md">
            <Box size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#242424]">Catalog Auditor: Lesro US</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> OFDAxml Connected
              </span>
            </div>
          </div>
        </div>

        {/* BUSCADOR INTEGRADO */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text"
            placeholder="Search SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-[#F3F2F1] border-transparent focus:bg-white focus:border-[#6264A7] focus:ring-1 focus:ring-[#6264A7] rounded-md text-xs w-64 transition-all outline-none"
          />
        </div>
      </div>

      {/* BODY DE PRODUCTOS */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        {filteredData.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* PRODUCT ROW */}
            <div 
              onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
            >
              <div className="flex items-center gap-4">
                <div className={`${expandedProduct === product.id ? 'text-[#6264A7]' : 'text-slate-300'}`}>
                  {expandedProduct === product.id ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-[13px] text-[#242424] tracking-tight">{product.sku}</span>
                    <span className="px-2 py-0.5 bg-[#F1F3F9] text-[#464775] text-[10px] font-bold rounded border border-[#E1E4F2]">
                      Base: ${product.basePrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{product.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Features Linked</span>
                  <span className="text-[11px] font-black text-[#6264A7]">{product.features.length}</span>
                </div>
              </div>
            </div>

            {/* EXPANDED CONTENT: FEATURES & OPTIONS */}
            <AnimatePresence>
              {expandedProduct === product.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-[#FAF9F8] border-t border-slate-100 p-5"
                >
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {product.features.map((feat, fIdx) => (
                      <div key={fIdx} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="bg-[#6264A7] px-3 py-2 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white flex items-center gap-2">
                            <FiLayers size={14} /> {feat.name}
                          </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                                <th className="px-3 py-2 text-left">OPTION CODE</th>
                                <th className="px-3 py-2 text-right">UPCHARGE</th>
                                <th className="px-3 py-2 text-right">TOTAL PIM</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {feat.options.map((opt, oIdx) => (
                                <tr key={oIdx} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-3 py-2">
                                    <div className="flex flex-col">
                                      <span className={`font-bold ${opt.isGrade ? 'text-blue-600' : 'text-slate-700'}`}>
                                        {opt.code}
                                      </span>
                                      <span className="text-[9px] text-slate-400 truncate max-w-[120px]">{opt.desc}</span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-slate-400">
                                    +${opt.upcharge.toFixed(2)}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                      ${opt.total.toFixed(2)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* FOOTER INFORMATIVO ESTILO TEAMS */}
      <div className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-6 shrink-0 text-[10px] text-slate-400 font-medium">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><FiActivity className="text-emerald-500" /> System: Stable</span>
          <span className="flex items-center gap-1 text-[#6264A7]"><FiHash /> Relational Engine v1.4</span>
        </div>
        <span>{filteredData.length} Products Loaded</span>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6264A7; }
      `}</style>
    </div>
  );
};

export default TeamsOFDAVisualizer;