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
  Layout,
  AlertCircle
} from 'lucide-react';

const LesroPricingMaster = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const headers = [
    "SKU", "Product Name", "Product Line", "Base Price",
    "G02 (Base)", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10",
    "Poly Arm", "Solid Arm", "Casters", "Tablet", "Chrome", "Power"
  ];

  const processXML = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      const { data, error: dbError } = await supabase
        .from('ClientsSERVEX')
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
      
      // Validar errores de parsing del XML
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) throw new Error("Error parsing XML structure");

      const features = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));

      const extracted = [];

      for (const p of productsXML) {
        const sku = p.getElementsByTagName("Code")[0]?.textContent || "";
        const name = p.getElementsByTagName("Description")[0]?.textContent || "";
        const line = p.getElementsByTagName("ClassificationRef")[0]?.textContent || "N/A";
        const basePrice = parseInt(p.querySelector("Price Value")?.textContent || "0", 10);

        const row = {
          sku,
          name,
          line,
          basePrice,
          grades: {
            G02: basePrice, // REGLA CRÍTICA: G02 es estrictamente el precio base inicial fijo
            G03: null, G04: null, G05: null, G06: null,
            G07: null, G08: null, G09: null, G10: null
          },
          opts: {
            poly: 0,
            solid: 0,
            casters: 0,
            tablet: 0,
            chrome: 0,
            power: 0
          }
        };

        // Procesamiento del Feature de Tapicería (Grados)
        const gradeFeature = features.find(f => {
          const code = f.querySelector("Code")?.textContent || "";
          return code === `UPH-AVERAGE-${sku}`;
        });

        if (gradeFeature) {
          const options = Array.from(gradeFeature.getElementsByTagName("Option"));
          options.forEach(opt => {
            const code = opt.querySelector("Code")?.textContent || "";
            const val = parseInt(opt.querySelector("Value")?.textContent || "0", 10);
            
            if (code.startsWith("GRD")) {
              const num = code.replace("GRD", "").padStart(2, "0");
              const key = `G${num}`;
              
              // No sobreescribimos G02 como upcharge; calculamos del G03 en adelante basándonos en G02 (basePrice)
              if (key !== "G02") {
                row.grades[key] = basePrice + val;
              }
            }
          });
        }

        // Procesamiento de Features Adicionales (Options/Upcharges de configuración)
        const relatedFeatures = features.filter(f => {
          const code = f.querySelector("Code")?.textContent || "";
          return code.endsWith(`-${sku}`) && !code.includes("UPH-AVERAGE");
        });

        relatedFeatures.forEach(f => {
          const fCode = f.querySelector("Code")?.textContent?.toLowerCase() || "";
          const options = Array.from(f.getElementsByTagName("Option"));
          
          options.forEach(opt => {
            const optCode = opt.querySelector("Code")?.textContent?.toUpperCase() || "";
            const val = parseInt(opt.querySelector("Value")?.textContent || "0", 10);
            
            // Ignorar códigos estándar o vacíos sin impacto financiero
            if (["AXX", "NONE", "STANDARD", "PXX"].some(x => optCode.includes(x))) return;
            if (val <= 0) return;
            
            if (fCode.includes("armpad")) {
              if (optCode.includes("APU")) row.opts.poly = val;
              if (optCode.includes("SS")) row.opts.solid = val;
            }
            if (fCode.includes("caster")) row.opts.casters = val;
            if (fCode.includes("tablet")) row.opts.tablet = val;
            if (fCode.includes("chrome")) row.opts.chrome = val;
            if (fCode.includes("power")) row.opts.power = val;
          });
        });

        extracted.push(row);
      }
      
      setProducts(extracted);
    } catch (err) {
      console.error("Error en procesamiento de matriz de precios SVX:", err);
      setError(err.message || "Error processing catalog information.");
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
      p.name.toLowerCase().includes(cleanSearch)
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
        Retrieving master data matrix...
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white p-12 text-center font-sans">
      <AlertCircle className="text-red-500 mb-3" size={36} />
      <h3 className="text-sm font-bold text-[#242424] mb-1">Engine Synchronization Error</h3>
      <p className="text-xs text-[#616161] max-w-md mb-4">{error}</p>
      <button 
        onClick={processXML} 
        className="flex items-center gap-2 px-4 py-2 bg-[#5B5FC7] hover:bg-[#4A4DAB] text-white text-xs font-bold rounded shadow-sm transition-colors"
      >
        <RefreshCw size={12} /> Retry Loading
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
                <span className="text-xs font-bold text-[#242424]">LESRO Pricing Master</span>
                <span className="text-[9px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-1.5 py-0.5 rounded-sm uppercase tracking-tight border border-[#5B5FC7]/10 select-none">
                  SVX Engine Live
                </span>
              </div>
              <span className="text-[10px] text-[#616161]">
                Central Ingestion Engine & Automated Micro-Quoting
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Stats Indicators styled as mini controls */}
              <div className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[10px] text-[#616161] font-medium select-none">
                <span>PRODUCTS: <strong className="text-[#242424] font-bold">{stats.total}</strong></span>
                <span className="text-[#D2D2D2]">|</span>
                <span>FILTERED: <strong className="text-[#242424] font-bold">{stats.filtered}</strong></span>
                <span className="text-[#D2D2D2]">|</span>
                <span>MIN BASE (G02): <strong className="text-[#242424] font-bold">${stats.avgPrice.toLocaleString()}</strong></span>
              </div>

              {/* Matrix Filter Input */}
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
              <table className="table-fixed border-collapse text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-semibold text-[#5B5FC7] bg-gradient-to-b from-white to-[#FCFAFF] sticky left-0 z-30 border-r border-b border-[#E0E0E0] select-none">
                      Index
                    </th>
                    {headers.map((header) => (
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
                          {/* Index Column pinned left */}
                          <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#5B5FC7] border-r border-[#E0E0E0] sticky left-0 z-10 bg-white group-hover:bg-[#FCFAFF] border-b border-[#F0F0F0]">
                            {idx + 1}
                          </td>

                          {/* SKU */}
                          <td className="p-0 text-[#5B5FC7] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] font-bold whitespace-nowrap truncate" title={p.sku}>
                              {p.sku}
                            </div>
                          </td>

                          {/* Product Name */}
                          <td className="p-0 text-[#242424] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] font-medium whitespace-nowrap truncate" title={p.name}>
                              {p.name}
                            </div>
                          </td>

                          {/* Product Line */}
                          <td className="p-0 text-[#616161] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate" title={p.line}>
                              {p.line}
                            </div>
                          </td>

                          {/* Base Price */}
                          <td className="p-0 text-[#242424] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] font-extrabold bg-[#F9F9F9]/50 whitespace-nowrap truncate">
                              ${p.basePrice.toLocaleString()}
                            </div>
                          </td>

                          {/* Grades Columns (G02 to G10) */}
                          {["G02","G03","G04","G05","G06","G07","G08","G09","G10"].map(g => (
                            <td key={g} className="p-0 text-[#424242] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                              <div className={`px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate ${g === 'G02' ? 'bg-[#F3F2F1]/60 font-bold text-[#242424]' : ''}`}>
                                {p.grades[g] !== null && p.grades[g] !== undefined ? (
                                  <span className={g === 'G02' ? 'font-bold' : 'font-semibold'}>${p.grades[g].toLocaleString()}</span>
                                ) : (
                                  <span className="text-[#A19F9D] italic text-[10px]">—</span>
                                )}
                              </div>
                            </td>
                          ))}

                          {/* Feature Options Columns */}
                          {Object.values(p.opts).map((v, i) => (
                            <td key={i} className="p-0 text-[#424242] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px] last:border-r-0">
                              <div className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate">
                                {v > 0 ? (
                                  <span className="text-[#2D884D] font-bold">+${v.toLocaleString()}</span>
                                ) : (
                                  <span className="text-[#A19F9D] italic text-[10px]">—</span>
                                )}
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

          {/* Pagination/Information Footer */}
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-semibold text-[#616161] select-none">
            <div className="flex gap-4">
              <span className="uppercase tracking-tight">ATTRIBUTES: {headers.length}</span>
              <span className="uppercase tracking-tight">FILTERED RECORDS: {filtered.length} of {products.length}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-[#5B5FC7]/10 px-2.5 py-0.5 rounded border border-[#5B5FC7]/20 text-[#5B5FC7] font-extrabold uppercase text-[9px]">
                SVX ETL Pipeline V2 (Oauth Verified)
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LesroPricingMaster;