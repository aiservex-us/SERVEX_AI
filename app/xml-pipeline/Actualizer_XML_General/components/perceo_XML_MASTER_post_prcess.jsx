'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase, resolveXmlContent } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Search, 
  RefreshCw, 
  Table as TableIcon, 
  Filter, 
  AlertCircle
} from 'lucide-react';

const WBDDataMatrix = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  
  // Estado para controlar la page actual
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Cabeceras estrictas requeridas para mostrar del XML
  const baseHeaders = ["SKU", "Description", "Classification", "Base Price"];
  const [optionHeaders, setOptionHeaders] = useState([]);

  const processXML = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ingestión desde la tabla correcta configurada en Supabase filtrando por la entidad General Process
      const { data, error: dbError } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .select('xml_actualizer_raw')
        .eq('company_name', 'General_Procces')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) throw dbError;
      const rawText = await resolveXmlContent(data?.xml_actualizer_raw);
      if (!rawText) {
        setProducts([]);
        return;
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(rawText, "text/xml");
      
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) throw new Error("Error parsing General Process XML structure");

      // 1. Mapear todos los Features globales para búsqueda rápida (O(1))
      const globalFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const featureMap = new Map();
      const allPossibleOptionsMap = new Map();

      for (const f of globalFeatures) {
        const fCode = f.getElementsByTagName("Code")[0]?.textContent;
        if (fCode) {
          featureMap.set(fCode, f);
        }
      }
      
      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
      const extracted = [];

      // Paso 1: Determinar las opciones que REALMENTE usan los productos para evitar ensuciar los headers con otros catálogos
      for (const p of productsXML) {
        const featureRefs = Array.from(p.getElementsByTagName("FeatureRef"));
        for (const ref of featureRefs) {
          const refCode = ref.textContent;
          const featureNode = featureMap.get(refCode);
          if (featureNode) {
            const options = Array.from(featureNode.getElementsByTagName("Option"));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent;
              if (optCode !== "C" && optCode !== "P") {
                if (optCode) allPossibleOptionsMap.set(optCode, optCode);
              }
            }
          }
        }
      }

      const dynamicOptionHeaders = Array.from(allPossibleOptionsMap.keys()).sort();
      setOptionHeaders(dynamicOptionHeaders);

      // Paso 2: Extraer datos de los productos individualmente

      for (const p of productsXML) {
        const sku = p.getElementsByTagName("Code")[0]?.textContent || "";
        const description = p.getElementsByTagName("Description")[0]?.textContent || "";
        const classification = p.getElementsByTagName("ClassificationRef")[0]?.getElementsByTagName("Code")[0]?.textContent 
          || p.getElementsByTagName("ClassificationRef")[0]?.textContent 
          || "N/A";
        
        // Extracción del valor numérico del precio base (<Price><Value>...</Value></Price>)
        const priceElement = p.getElementsByTagName("Price")[0];
        const basePrice = priceElement ? parseFloat(priceElement.getElementsByTagName("Value")[0]?.textContent || "0") : 0;

        const featureRefs = Array.from(p.getElementsByTagName("FeatureRef"));
        let hasSuffixes = false;
        
        // Recolectar los precios de las opciones para este producto
        const productOptionPrices = {};
        for (const ref of featureRefs) {
          const refCode = ref.textContent;
          const featureNode = featureMap.get(refCode);
          if (featureNode) {
            const options = Array.from(featureNode.getElementsByTagName("Option"));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent;
              if (optCode !== "C" && optCode !== "P") {
                const optPriceElem = opt.querySelector("OptionPrice > Value");
                const optPrice = optPriceElem ? parseFloat(optPriceElem.textContent || "0") : 0;
                if (optCode) productOptionPrices[optCode] = optPrice;
              }
            }
          }
        }
        
        // 2. Extraer opciones /C y /P buscando en sus FeatureRefs
        for (const ref of featureRefs) {
          const refCode = ref.textContent;
          const featureNode = featureMap.get(refCode);
          if (featureNode) {
            const options = Array.from(featureNode.getElementsByTagName("Option"));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent;
              if (optCode === "C" || optCode === "P") {
                const optPriceElem = opt.querySelector("OptionPrice > Value");
                const optPrice = optPriceElem ? parseFloat(optPriceElem.textContent || "0") : 0;
                
                const suffixSku = `${sku}/${optCode}`;
                if (!extracted.find(e => e.sku === suffixSku)) {
                  extracted.push({
                    sku: suffixSku,
                    description: `${description} [Option ${optCode}]`,
                    classification,
                    basePrice: basePrice + optPrice,
                    ...productOptionPrices
                  });
                  hasSuffixes = true;
                }
              }
            }
          }
        }
        
        // Si no tiene sufijos C o P, entonces añadimos el producto base
        if (!hasSuffixes) {
          extracted.push({
            sku,
            description,
            classification,
            basePrice,
            ...productOptionPrices
          });
        }
      }
      
      setProducts(extracted);
      setCurrentPage(1); // Reiniciar a la primera page tras una recarga exitosa
    } catch (err) {
      console.error("Error processing General Process data matrix:", err);
      setError(err.message || "Error processing catalog information General Process.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    processXML();
  }, []);

  const filtered = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    if (!cleanSearch) return products;
    return products.filter(p => 
      p.sku.toLowerCase().includes(cleanSearch) ||
      p.description.toLowerCase().includes(cleanSearch)
    );
  }, [products, searchTerm]);

  // Al cambiar el término de búsqueda, devolvemos la vista a la primera page automáticamente
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Segmentación de los datos en bloques exactos de 20 para el renderizado
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filtered.length / itemsPerPage) || 1;
  }, [filtered]);

  const stats = useMemo(() => {
    const total = products.length;
    const avgPrice = total 
      ? Math.round(products.reduce((acc, p) => acc + p.basePrice, 0) / total) 
      : 0;
    return { total, filtered: filtered.length, avgPrice };
  }, [products, filtered]);

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh] min-h-[80vh] bg-transparent text-xs font-semibold text-slate-500 font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
        Retrieving master data matrix from WBD Engine...
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-[80vh] min-h-[80vh] w-full flex-col items-center justify-center bg-transparent p-12 text-center font-sans">
      <AlertCircle className="text-red-500 mb-3" size={36} />
      <h3 className="text-sm font-bold text-slate-800 mb-1">Engine Synchronization Error</h3>
      <p className="text-xs text-slate-500 max-w-md mb-4">{error}</p>
      <button 
        onClick={processXML} 
        className="flex items-center gap-2 px-4 py-2 bg-[#464775] hover:bg-[#2B2C4B] text-white text-xs font-bold rounded shadow-sm transition-colors"
      >
        <RefreshCw size={12} /> Retry Loading
      </button>
    </div>
  );

  return (
    <div className="h-full md:h-[80vh] flex flex-col justify-center items-center bg-transparent relative z-10 p-1 sm:p-2 md:p-4 font-sans antialiased">
      <div className="w-full mx-auto">
        
        <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-[#464775]/30 shadow-lg shadow-[#464775]/5 overflow-hidden flex flex-col w-full">
          
          {/* Operations / Filters Header */}
          <div className="px-4 py-2.5 border-b border-[#464775]/15 bg-white/40 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">XML Results Matrix</span>
                <span className="text-[9px] font-bold text-[#464775] bg-[#464775]/10 px-2 py-0.5 rounded-full border border-[#464775]/20 select-none">
                  XML Schema Engine
                </span>
              </div>
              <span className="text-[9.5px] text-slate-500 font-medium">
                Structured feature & option price calculation matrix
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-[#464775]/5 border border-[#464775]/15 rounded-lg px-2.5 py-1 text-[10px] text-slate-600 font-medium select-none">
                <span>Products: <strong className="text-slate-800 font-bold">{stats.total}</strong></span>
                <span className="text-[#464775]/30">|</span>
                <span>Filtered: <strong className="text-slate-800 font-bold">{stats.filtered}</strong></span>
                <span className="text-[#464775]/30">|</span>
                <span>Avg Price: <strong className="text-[#464775] font-bold">${stats.avgPrice.toLocaleString()}</strong></span>
              </div>

              <div className="relative flex items-center">
                <Search size={12} className="absolute left-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search matrix..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/70 border border-[#464775]/25 rounded-lg pl-7 pr-2.5 py-0.5 text-[10.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#464775] focus:bg-white transition-all w-[160px]"
                />
              </div>

              <button 
                onClick={processXML}
                type="button"
                className="p-1 bg-white/70 border border-[#464775]/25 hover:bg-[#464775]/10 rounded-lg text-[#464775] transition-all shadow-2xs"
                title="Synchronize and recalculate matrices"
              >
                <RefreshCw size={12} className={loading ? "animate-spin text-[#464775]" : ""} />
              </button>
            </div>
          </div>

          {/* Table Matrix */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-white/30 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-[#464775]/10 flex items-center justify-center mb-2.5 border border-[#464775]/20">
                <svg className="w-6 h-6 text-[#464775]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">No data found</h3>
              <p className="text-[10px] text-slate-500 max-w-xs font-medium">
                We couldn't find any records matching your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-300 max-h-[58vh]">
              <table className="table-fixed border-collapse text-left text-[10px] w-max min-w-full">
                <thead className="sticky top-0 z-20 bg-[#464775]/10 backdrop-blur-md border-b border-[#464775]/20">
                  <tr>
                    <th className="w-10 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-[#464775] bg-[#464775]/10 backdrop-blur-md sticky left-0 z-30 border-r border-b border-[#464775]/20 select-none">
                      #
                    </th>
                    {baseHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[10px] font-bold text-[#464775] bg-[#464775]/10 backdrop-blur-md border-r border-b border-[#464775]/20 min-w-[150px] max-w-[260px] whitespace-nowrap truncate uppercase tracking-wider select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>{header}</span>
                          <Filter size={9} className="text-[#464775] opacity-50" />
                        </div>
                      </th>
                    ))}
                    {optionHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[10px] font-bold text-[#464775] bg-[#464775]/15 border-r border-b border-[#464775]/20 min-w-[150px] max-w-[260px] whitespace-nowrap truncate uppercase tracking-wider select-none"
                        title={header}
                      >
                        <div className="flex items-center gap-1">
                          <span>{header}</span>
                          <Filter size={9} className="text-[#464775] opacity-50" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white/60 divide-y divide-[#464775]/10">
                  <AnimatePresence initial={false}>
                    {paginatedProducts.map((p, idx) => {
                      const realIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                      
                      return (
                        <motion.tr 
                          key={p.sku || realIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="hover:bg-[#464775]/10 transition-colors group"
                        >
                          {/* Index Column */}
                          <td className="px-2 py-1.5 text-center text-[9.5px] font-bold text-[#464775] border-r border-[#464775]/10 sticky left-0 z-10 bg-white/90 group-hover:bg-[#464775]/10 border-b border-[#464775]/10 font-mono">
                            {realIndex}
                          </td>

                          {/* SKU */}
                          <td className="p-0 text-[#464775] border-r border-b border-[#464775]/10 min-w-[150px] max-w-[260px]">
                            <div className="px-3 py-1.5 font-mono text-[10px] font-bold whitespace-nowrap truncate" title={p.sku}>
                              {p.sku}
                            </div>
                          </td>

                          {/* Description */}
                          <td className="p-0 text-slate-800 border-r border-b border-[#464775]/10 min-w-[150px] max-w-[260px]">
                            <div className="px-3 py-1.5 font-sans text-[10px] font-medium text-slate-700 whitespace-nowrap truncate" title={p.description}>
                              {p.description}
                            </div>
                          </td>

                          {/* Classification */}
                          <td className="p-0 text-slate-500 border-r border-b border-[#464775]/10 min-w-[150px] max-w-[260px]">
                            <div className="px-3 py-1.5 font-mono text-[10px] whitespace-nowrap truncate" title={p.classification}>
                              {p.classification}
                            </div>
                          </td>

                          {/* Base Price */}
                          <td className="p-0 text-slate-800 border-r border-b border-[#464775]/10 min-w-[150px] max-w-[260px]">
                            <div className="px-3 py-1.5 font-mono text-[10px] font-bold text-[#464775] whitespace-nowrap truncate">
                              ${p.basePrice.toLocaleString()}
                            </div>
                          </td>

                          {/* Dynamic Option Prices */}
                          {optionHeaders.map(oh => (
                            <td key={oh} className="p-0 text-[#464775] border-r border-b border-[#464775]/10 min-w-[150px] max-w-[260px]">
                              <div className="px-3 py-1.5 font-mono text-[10px] font-medium whitespace-nowrap truncate">
                                {p[oh] !== undefined ? `$${p[oh].toLocaleString()}` : "-"}
                              </div>
                            </td>
                          ))}
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="bg-white/40 backdrop-blur-md px-4 py-2 border-t border-[#464775]/15 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-medium text-slate-600 select-none">
            <div className="flex items-center gap-3">
              <span>Total Columns: <strong className="text-slate-800 font-bold">{baseHeaders.length + optionHeaders.length}</strong></span>
              <span className="text-[#464775]/30">|</span>
              <span>Showing <strong className="text-slate-800 font-bold">{filtered.length}</strong> of <strong className="text-slate-800 font-bold">{products.length}</strong> items</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-0.5 bg-white/80 border border-[#464775]/25 hover:bg-[#464775] hover:text-white rounded-md text-[#464775] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[10px]"
              >
                Previous
              </button>
              
              <span className="text-[#464775] font-bold px-1.5 text-[10px]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-0.5 bg-white/80 border border-[#464775]/25 hover:bg-[#464775] hover:text-white rounded-md text-[#464775] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[10px]"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WBDDataMatrix;