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
              if (optCode) allPossibleOptionsMap.set(optCode, optCode);
            }
          }
        }
      }

      const dynamicOptionHeaders = Array.from(allPossibleOptionsMap.keys()).sort();
      setOptionHeaders(dynamicOptionHeaders);

      // Registrar evento en seguimiento_client
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://servex-ai-back.onrender.com';
        fetch(`${backendUrl}/api/v1/cet-ai-engine/tracking/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name: 'General_Procces',
            event_type: 'VIEW_POST_PROCESS_MATRIX',
            title: 'Visualización de Matriz XML Actualizada',
            description: `El usuario abrió la vista previa del XML post-proceso (${productsXML.length} productos).`,
            actor: 'user',
            details: { total_products: productsXML.length }
          }),
          keepalive: true
        }).catch(() => {});
      } catch (_) {}

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
        
        // Recolectar los precios de las opciones para este producto
        const productOptionPrices = {};
        for (const ref of featureRefs) {
          const refCode = ref.textContent;
          const featureNode = featureMap.get(refCode);
          if (featureNode) {
            const options = Array.from(featureNode.getElementsByTagName("Option"));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent;
              const optPriceElem = opt.querySelector("OptionPrice > Value");
              const optPrice = optPriceElem ? parseFloat(optPriceElem.textContent || "0") : 0;
              if (optCode) productOptionPrices[optCode] = optPrice;
            }
          }
        }
        
        extracted.push({
          sku,
          description,
          classification,
          basePrice,
          ...productOptionPrices
        });
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
    <div className="flex items-center justify-center py-6 bg-transparent text-xs font-semibold text-zinc-400 font-sans">
      <div className="flex items-center gap-2">
        <RefreshCw size={13} className="animate-spin text-zinc-300" />
        Retrieving master data matrix from Engine...
      </div>
    </div>
  );

  if (error) return (
    <div className="flex w-full flex-col items-center justify-center bg-transparent py-5 text-center font-sans">
      <AlertCircle className="text-rose-400 mb-1.5" size={22} />
      <h3 className="text-xs font-bold text-white mb-0.5">Engine Synchronization Error</h3>
      <p className="text-[11px] text-zinc-400 max-w-md mb-2">{error}</p>
      <button 
        onClick={processXML} 
        className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg border border-white/15 transition-all cursor-pointer"
      >
        <RefreshCw size={11} /> Retry Loading
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-full min-w-0 flex flex-col bg-transparent font-sans antialiased">
      {/* ── Compact Header Toolbar (Transparent) ── */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 py-2 px-1 border-b border-white/10 bg-transparent text-zinc-200">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white tracking-wide uppercase">XML Results Matrix</span>
          <span className="text-[9px] font-medium text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
            {stats.filtered} items
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search size={11} className="absolute left-2.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/15 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all w-[130px] sm:w-[160px]"
            />
          </div>

          <button 
            onClick={processXML} 
            type="button"
            className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/15 rounded-lg text-zinc-300 hover:text-white transition-all cursor-pointer"
            title="Recalculate matrices"
          >
            <RefreshCw size={12} className={loading ? "animate-spin text-white" : ""} />
          </button>
        </div>
      </div>

      {/* ── Table Area (Transparent Container) ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-transparent">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center mb-2 border border-white/10">
            <Search className="w-4 h-4 text-zinc-400" />
          </div>
          <h4 className="text-[11px] font-semibold text-zinc-200">No data found in matrix</h4>
          <p className="text-[10px] text-zinc-500 max-w-xs mt-0.5">
            No records matched current search filter or catalog XML is empty.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-full min-w-0 overflow-x-auto relative custom-scrollbar max-h-[380px] rounded-lg border border-white/10 bg-transparent my-1.5">
          <table className="table-auto border-collapse text-left text-[10px] w-full min-w-[700px] bg-transparent">
            <thead className="sticky top-0 z-20 bg-zinc-900/80 backdrop-blur-md border-b border-white/10">
              <tr>
                <th className="w-9 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-zinc-400 sticky left-0 z-30 bg-zinc-900/80 border-r border-b border-white/10 select-none">
                  #
                </th>
                {baseHeaders.map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 text-[10px] font-bold text-zinc-300 border-r border-b border-white/10 whitespace-nowrap truncate uppercase tracking-wider select-none bg-transparent"
                  >
                    <div className="flex items-center gap-1">
                      <span>{header}</span>
                      <Filter size={8} className="text-zinc-500" />
                    </div>
                  </th>
                ))}
                {optionHeaders.map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 text-[10px] font-bold text-zinc-300 border-r border-b border-white/10 whitespace-nowrap truncate uppercase tracking-wider select-none bg-transparent"
                    title={header}
                  >
                    <div className="flex items-center gap-1">
                      <span>{header}</span>
                      <Filter size={8} className="text-zinc-500" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 bg-transparent">
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
                      className="hover:bg-white/[0.04] transition-colors group bg-transparent"
                    >
                      <td className="px-2 py-1.5 text-center text-[9.5px] font-bold text-zinc-400 border-r border-b border-white/5 sticky left-0 z-10 bg-zinc-900/80 group-hover:bg-zinc-800/80 font-mono select-none">
                        {realIndex}
                      </td>

                      <td className="p-0 text-white border-r border-b border-white/5 bg-transparent">
                        <div className="px-3 py-1.5 font-mono text-[10px] font-bold whitespace-nowrap truncate" title={p.sku}>
                          {p.sku}
                        </div>
                      </td>

                      <td className="p-0 text-zinc-300 border-r border-b border-white/5 bg-transparent">
                        <div className="px-3 py-1.5 font-sans text-[10px] font-medium text-zinc-300 whitespace-nowrap truncate" title={p.description}>
                          {p.description}
                        </div>
                      </td>

                      <td className="p-0 text-zinc-400 border-r border-b border-white/5 bg-transparent">
                        <div className="px-3 py-1.5 font-mono text-[10px] whitespace-nowrap truncate" title={p.classification}>
                          {p.classification}
                        </div>
                      </td>

                      <td className="p-0 text-emerald-400 border-r border-b border-white/5 bg-transparent">
                        <div className="px-3 py-1.5 font-mono text-[10px] font-bold text-emerald-400 whitespace-nowrap truncate">
                          ${p.basePrice.toLocaleString()}
                        </div>
                      </td>

                      {optionHeaders.map(oh => (
                        <td key={oh} className="p-0 text-zinc-300 border-r border-b border-white/5 bg-transparent">
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

      {/* ── Compact Transparent Footer ── */}
      <div className="w-full flex items-center justify-between py-1.5 px-1 bg-transparent border-t border-white/10 text-[10px] font-medium text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <span>Cols: <strong className="text-zinc-200">{baseHeaders.length + optionHeaders.length}</strong></span>
          <span className="text-white/20">•</span>
          <span>Showing <strong className="text-zinc-200">{filtered.length}</strong> of <strong className="text-zinc-200">{products.length}</strong></span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-2 py-0.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white rounded text-zinc-300 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer"
          >
            Prev
          </button>
          
          <span className="text-zinc-300 font-mono px-1 text-[10px]">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-2 py-0.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white rounded text-zinc-300 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>    </div>
  );
};

export default WBDDataMatrix;