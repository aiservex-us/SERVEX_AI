'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
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
  const itemsPerPage = 30;

  // Cabeceras estrictas requeridas para mostrar del XML
  const baseHeaders = ["SKU", "Description", "Classification", "Base Price"];
  const [optionHeaders, setOptionHeaders] = useState([]);

  const processXML = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ingestión desde la tabla correcta configurada en Supabase filtrando por la entidad WBO
      const { data, error: dbError } = await supabase
        .from('ClientsSERVEX_WBO')
        .select('xml_raw')
        .eq('company_name', 'WBO')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) throw dbError;
      if (!data?.xml_raw) {
        setProducts([]);
        return;
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.xml_raw, "text/xml");
      
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) throw new Error("Error parsing WBO XML structure");

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
                const optDesc = opt.getElementsByTagName("Description")[0]?.textContent || optCode;
                if (optDesc) allPossibleOptionsMap.set(optDesc, optDesc);
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
                const optDesc = opt.getElementsByTagName("Description")[0]?.textContent || optCode;
                const optPriceElem = opt.querySelector("OptionPrice > Value");
                const optPrice = optPriceElem ? parseFloat(optPriceElem.textContent || "0") : 0;
                if (optDesc) productOptionPrices[optDesc] = optPrice;
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
      console.error("Error processing WBO data matrix:", err);
      setError(err.message || "Error processing catalog information WBO.");
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
    <div className="flex items-center justify-center min-h-[90vh] bg-white text-xs font-semibold text-slate-500 font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
        Retrieving master data matrix from WBD Engine...
      </div>
    </div>
  );

  if (error) return (
    <div className="flex min-h-[90vh] h-full w-full flex-col items-center justify-center bg-white p-12 text-center font-sans">
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
    <div className="min-h-[90vh] bg-gradient-to-br from-[#F8F9FE] to-white p-6 md:p-8 text-slate-800 font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-2xl shadow-[#464775]/10 overflow-hidden flex flex-col w-full">
          
          {/* Operations / Filters Header */}
          <div className="px-4 py-2 border-b border-slate-100 bg-gradient-to-r from-slate-50/40 to-white flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">WBO Data Matrix Master</span>
                <span className="text-[10px] font-bold text-[#464775] bg-[#464775]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#464775]/10 select-none">
                  WBD Schema Engine Live
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Automated Ingestion Pipeline & Structured Data Mapping
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50/80 border border-slate-200/60 rounded-sm px-2 py-0.5 text-[10px] text-slate-500 font-medium select-none">
                <span>PRODUCTS: <strong className="text-slate-800 font-bold">{stats.total}</strong></span>
                <span className="text-[#D2D2D2]">|</span>
                <span>FILTERED: <strong className="text-slate-800 font-bold">{stats.filtered}</strong></span>
                <span className="text-[#D2D2D2]">|</span>
                <span>AVG BASE PRICE: <strong className="text-slate-800 font-bold">${stats.avgPrice.toLocaleString()}</strong></span>
              </div>

              <input
                type="text"
                placeholder="Search matrix..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200/60 rounded-sm px-2 py-0.5 text-[11px] text-slate-800 placeholder-[#616161] focus:border-[#464775] outline-none transition-all w-[180px]"
              />

              <button 
                onClick={processXML}
                type="button"
                className="p-1 bg-white border border-slate-200/60 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors"
                title="Synchronize and recalculate matrices from xml_raw"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Table Matrix */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center bg-white/40 backdrop-blur-md">
              <div className="w-16 h-16 rounded-2xl bg-[#464775]/5 flex items-center justify-center mb-4 border border-[#464775]/10 shadow-inner">
                <svg className="w-8 h-8 text-[#464775]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">No data found</h3>
              <p className="text-xs text-slate-500 max-w-sm font-medium">
                We couldn't find any records matching your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300">
              <table className="table-fixed border-collapse overflow-hidden overflow-hidden text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-semibold text-[#464775] bg-white/80 backdrop-blur-md sticky left-0 z-30 border-r border-b border-slate-100 select-none">
                      Index
                    </th>
                    {baseHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-slate-800 bg-white/80 backdrop-blur-md border-r border-b border-slate-100 min-w-[160px] max-w-[280px] whitespace-nowrap truncate uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-1.5">
                          {header}
                          <Filter size={8} className="text-[#464775] opacity-40" />
                        </div>
                      </th>
                    ))}
                    {optionHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-[#464775] bg-[#464775]/5 backdrop-blur-md border-r border-b border-[#464775]/10 min-w-[160px] max-w-[280px] whitespace-nowrap truncate uppercase tracking-wider"
                        title={header}
                      >
                        <div className="flex items-center gap-1.5">
                          {header}
                          <Filter size={8} className="text-[#464775] opacity-40" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#F0F0F0]">
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
                          className="hover:bg-slate-50/80 hover:shadow-sm transition-colors duration-75 group"
                        >
                          {/* Index Column */}
                          <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#464775] border-r border-slate-100 sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 border-b border-slate-50">
                            {realIndex}
                          </td>

                          {/* SKU */}
                          <td className="p-0 text-[#464775] border-r border-b border-slate-50 min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] font-bold whitespace-nowrap truncate" title={p.sku}>
                              {p.sku}
                            </div>
                          </td>

                          {/* Description */}
                          <td className="p-0 text-slate-800 border-r border-b border-slate-50 min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-sans text-[11px] font-medium whitespace-nowrap truncate" title={p.description}>
                              {p.description}
                            </div>
                          </td>

                          {/* Classification */}
                          <td className="p-0 text-slate-500 border-r border-b border-slate-50 min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate" title={p.classification}>
                              {p.classification}
                            </div>
                          </td>

                          {/* Base Price */}
                          <td className="p-0 text-slate-800 border-r border-b border-slate-50 min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] font-extrabold bg-[#F9F9F9]/50 whitespace-nowrap truncate">
                              ${p.basePrice.toLocaleString()}
                            </div>
                          </td>

                          {/* Dynamic Option Prices */}
                          {optionHeaders.map(oh => (
                            <td key={oh} className="p-0 text-[#464775] border-r border-b border-slate-50 min-w-[160px] max-w-[280px]">
                              <div className="px-3 py-1.5 font-mono text-[11px] font-semibold whitespace-nowrap truncate">
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

          {/* Table Footer Info & Pagination Controls */}
          <div className="bg-gradient-to-r from-slate-50/40 to-white px-4 py-2 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-semibold text-slate-500 select-none">
            <div className="flex gap-4">
              <span className="uppercase tracking-tight">TOTAL COLUMNS: {baseHeaders.length + optionHeaders.length}</span>
              <span className="uppercase tracking-tight">RECORDS MATCHED: {filtered.length} of {products.length}</span>
            </div>
            
            {/* Controles de paginación de 20 en 20 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2 py-1 bg-white border border-slate-200/60 rounded-sm text-slate-800 transition-colors enabled:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-bold"
              >
                Previous
              </button>
              
              <span className="text-slate-800 font-mono px-1 text-[11px]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2 py-1 bg-white border border-slate-200/60 rounded-sm text-slate-800 transition-colors enabled:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-bold"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-[#464775]/10 px-2.5 py-0.5 rounded border border-[#464775]/20 text-[#464775] font-extrabold uppercase text-[10px]">
                WBD ETL Pipeline V2 (Oauth Verified)
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WBDDataMatrix;