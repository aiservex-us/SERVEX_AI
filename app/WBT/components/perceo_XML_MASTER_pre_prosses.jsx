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

  // Cabeceras base del catálogo estándar WB
  const baseHeaders = ["SKU", "Description", "Classification", "Base Price"];

  const processXML = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // Ingestión desde la tabla correcta configurada en Supabase para WBD
      const { data, error: dbError } = await supabase
        .from('ClientsSERVEX_WBD')
        .select('xml_raw')
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbError) throw dbError;
      if (!data?.xml_raw) {
        setProducts([]);
        return;
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.xml_raw, "text/xml");
      
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) throw new Error("Error parsing WBD XML structure");

      // Mapeo estructural basado en los Tags detectados del esquema WBD
      const featuresGlobal = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));

      const extracted = [];

      for (const p of productsXML) {
        const sku = p.getElementsByTagName("Code")[0]?.textContent || "";
        const description = p.getElementsByTagName("Description")[0]?.textContent || "";
        const classification = p.getElementsByTagName("ClassificationRef")[0]?.getElementsByTagName("Code")[0]?.textContent 
          || p.getElementsByTagName("ClassificationRef")[0]?.textContent 
          || "N/A";
        
        // Extracción del valor numérico del precio base (<Price><Value>...</Value></Price>)
        const priceElement = p.getElementsByTagName("Price")[0];
        const basePrice = priceElement ? parseFloat(priceElement.getElementsByTagName("Value")[0]?.textContent || "0") : 0;

        const row = {
          sku,
          description,
          classification,
          basePrice,
          optionsMap: {} // Almacenará dinámicamente las opciones numéricas encontradas
        };

        // Vinculación opcional con las Features y Options secundarias del esquema
        const featureRefs = Array.from(p.getElementsByTagName("FeatureRef")).map(f => f.textContent);
        
        featureRefs.forEach(fRef => {
          const matchedFeature = featuresGlobal.find(f => f.getElementsByTagName("Code")[0]?.textContent === fRef);
          if (matchedFeature) {
            const options = Array.from(matchedFeature.getElementsByTagName("Option"));
            options.forEach(opt => {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent || "";
              const optPriceElem = opt.getElementsByTagName("OptionPrice")[0];
              const optVal = optPriceElem ? parseFloat(optPriceElem.getElementsByTagName("Value")[0]?.textContent || "0") : 0;
              
              if (optCode && optVal > 0) {
                row.optionsMap[optCode] = optVal;
              }
            });
          }
        });

        extracted.push(row);
      }
      
      setProducts(extracted);
    } catch (err) {
      console.error("Error en procesamiento de matriz de datos WBD:", err);
      setError(err.message || "Error al procesar la información de catálogos WBD.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    processXML();
  }, []);

  // Obtener de forma única todas las opciones de características dinámicas para las columnas extras
  const dynamicOptionHeaders = useMemo(() => {
    const keys = new Set();
    products.forEach(p => {
      Object.keys(p.optionsMap).forEach(k => keys.add(k));
    });
    return Array.from(keys).sort();
  }, [products]);

  const allHeaders = useMemo(() => {
    return [...baseHeaders, ...dynamicOptionHeaders];
  }, [dynamicOptionHeaders]);

  const filtered = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    if (!cleanSearch) return products;
    return products.filter(p => 
      p.sku.toLowerCase().includes(cleanSearch) ||
      p.description.toLowerCase().includes(cleanSearch)
    );
  }, [products, searchTerm]);

  const stats = useMemo(() => {
    const total = products.length;
    const avgPrice = total 
      ? Math.round(products.reduce((acc, p) => acc + p.basePrice, 0) / total) 
      : 0;
    return { total, filtered: filtered.length, avgPrice };
  }, [products, filtered]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[90vh] bg-white text-xs font-semibold text-[#616161] font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#5B5FC7] border-t-transparent rounded-full animate-spin"></div>
        Retrieving master data matrix from WBD Engine...
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white p-12 text-center font-sans">
      <AlertCircle className="text-red-500 mb-3" size={36} />
      <h3 className="text-sm font-bold text-[#242424] mb-1">Error en Sincronización del Motor</h3>
      <p className="text-xs text-[#616161] max-w-md mb-4">{error}</p>
      <button 
        onClick={processXML} 
        className="flex items-center gap-2 px-4 py-2 bg-[#5B5FC7] hover:bg-[#4A4DAB] text-white text-xs font-bold rounded shadow-sm transition-colors"
      >
        <RefreshCw size={12} /> Reintentar Carga
      </button>
    </div>
  );

  return (
    <div className="min-h-[90vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          {/* Operations / Filters Header */}
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#242424]">WBD Data Matrix Master</span>
                <span className="text-[9px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-1.5 py-0.5 rounded-sm uppercase tracking-tight border border-[#5B5FC7]/10 select-none">
                  WBD Schema Engine Live
                </span>
              </div>
              <span className="text-[10px] text-[#616161]">
                Automated Ingestion Pipeline & Structured Data Mapping
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[10px] text-[#616161] font-medium select-none">
                <span>PRODUCTS: <strong className="text-[#242424] font-bold">{stats.total}</strong></span>
                <span className="text-[#D2D2D2]">|</span>
                <span>FILTERED: <strong className="text-[#242424] font-bold">{stats.filtered}</strong></span>
                <span className="text-[#D2D2D2]">|</span>
                <span>AVG BASE PRICE: <strong className="text-[#242424] font-bold">${stats.avgPrice.toLocaleString()}</strong></span>
              </div>

              <input
                type="text"
                placeholder="Search matrix..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] text-[#242424] placeholder-[#616161] focus:border-[#5B5FC7] outline-none transition-all w-[180px]"
              />

              <button 
                onClick={processXML}
                type="button"
                className="p-1 bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] rounded-sm text-[#616161] transition-colors"
                title="Sincronizar y recalcular matrices desde xml_raw"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Table Matrix */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-[#616161] text-xs font-normal bg-white">
              No se encontraron coincidencias de SKU o productos en el esquema actual.
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300">
              <table className="table-fixed border-collapse text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-semibold text-[#5B5FC7] bg-gradient-to-b from-white to-[#FCFAFF] sticky left-0 z-30 border-r border-b border-[#E0E0E0] select-none">
                      Index
                    </th>
                    {allHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-[#242424] bg-gradient-to-b from-white to-[#FCFAFF] border-r border-b border-[#E0E0E0] min-w-[160px] max-w-[280px] whitespace-nowrap truncate uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-1.5">
                          {header}
                          <Filter size={8} className="text-[#5B5FC7] opacity-40" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#F0F0F0]">
                  <AnimatePresence initial={false}>
                    {filtered.map((p, idx) => {
                      return (
                        <motion.tr 
                          key={p.sku || idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="hover:bg-[#F7F5FA] transition-colors duration-75 group"
                        >
                          {/* Index Column */}
                          <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#5B5FC7] border-r border-[#E0E0E0] sticky left-0 z-10 bg-white group-hover:bg-[#FCFAFF] border-b border-[#F0F0F0]">
                            {idx + 1}
                          </td>

                          {/* SKU */}
                          <td className="p-0 text-[#5B5FC7] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] font-bold whitespace-nowrap truncate" title={p.sku}>
                              {p.sku}
                            </div>
                          </td>

                          {/* Description */}
                          <td className="p-0 text-[#242424] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-sans text-[11px] font-medium whitespace-nowrap truncate" title={p.description}>
                              {p.description}
                            </div>
                          </td>

                          {/* Classification */}
                          <td className="p-0 text-[#616161] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate" title={p.classification}>
                              {p.classification}
                            </div>
                          </td>

                          {/* Base Price */}
                          <td className="p-0 text-[#242424] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] font-extrabold bg-[#F9F9F9]/50 whitespace-nowrap truncate">
                              ${p.basePrice.toLocaleString()}
                            </div>
                          </td>

                          {/* Dynamic Options Columns Mapping */}
                          {dynamicOptionHeaders.map(optKey => {
                            const val = p.optionsMap[optKey];
                            return (
                              <td key={optKey} className="p-0 text-[#424242] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                                <div className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate">
                                  {val !== undefined && val > 0 ? (
                                    <span className="text-[#2D884D] font-bold">+${val.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-[#A19F9D] italic text-[10px]">—</span>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer Info */}
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-semibold text-[#616161] select-none">
            <div className="flex gap-4">
              <span className="uppercase tracking-tight">TOTAL COLUMNS: {allHeaders.length}</span>
              <span className="uppercase tracking-tight">RECORDS MATCHED: {filtered.length} of {products.length}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-[#5B5FC7]/10 px-2.5 py-0.5 rounded border border-[#5B5FC7]/20 text-[#5B5FC7] font-extrabold uppercase text-[9px]">
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