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

        // Procesamiento de Features Adicionales (Opciones/Upcharges de configuración)
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
      setError(err.message || "Error al procesar la información de catálogos.");
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
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white p-6">
      <RefreshCw className="animate-spin text-[#5B5FC7] mb-4" size={32} />
      <span className="text-xs font-semibold text-[#242424] tracking-wide animate-pulse">
        Calculando matrices dinámicas e inyectando reglas de negocio SVX...
      </span>
    </div>
  );

  if (error) return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6 text-center">
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
    <div className="flex flex-col h-full w-full max-w-full bg-[#FFF] font-sans text-[#242424] overflow-hidden select-none">
      
      {/* HEADER PRINCIPAL */}
      <div className="bg-white px-6 py-3 border-b border-[#EDEBE9] shadow-sm z-20 shrink-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-[#5B5FC7] p-2 rounded-lg shadow-sm shrink-0">
              <Layout size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-extrabold tracking-tight text-[#242424] truncate">
                  LESRO Pricing Master
                </h2>
                <span className="text-[9px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  SVX Engine Live
                </span>
              </div>
              <p className="text-[10px] text-[#616161] tracking-wide truncate">
                Central Ingestion Engine & Automated Micro-Quoting
              </p>
            </div>
          </div>

          {/* INDICADORES DE ESTADO (Métricas) */}
          <div className="flex items-center gap-2 shrink-0 sm:self-center self-start">
            {[
              { label: "Total Catálogo", value: stats.total },
              { label: "Filtrados", value: stats.filtered },
              { label: "Mínimo Base (G02)", value: `$${stats.avgPrice.toLocaleString()}` }
            ].map((s, i) => (
              <div key={i} className="bg-[#F3F2F1] px-3 py-1.5 rounded border border-[#EDEBE9] min-w-[85px]">
                <p className="text-[8px] uppercase font-bold text-[#616161] tracking-wider leading-none mb-1">{s.label}</p>
                <p className="text-[11px] font-black text-[#242424] leading-none">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS / FILTROS */}
      <div className="bg-[#FAF9F8] px-6 py-2.5 flex items-center justify-between gap-3 border-b border-[#EDEBE9] shrink-0 w-full">
        <div className="relative flex-1 min-w-0 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={12} />
          <input 
            type="text"
            placeholder="Buscar por SKU o descripción de producto..."
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#D2D0CE] border-b-[#5B5FC7] border-b-2 focus:border-[#5B5FC7] focus:ring-1 focus:ring-[#5B5FC7] transition-all outline-none text-[11px] font-medium text-[#242424] rounded-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={processXML} 
            className="p-2 hover:bg-[#EDEBE9] active:bg-[#E1DFDD] rounded text-[#616161] transition-colors border border-[#EDEBE9] bg-white shadow-sm"
            title="Sincronizar y recalcular matrices desde xml_raw"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* CONTENEDOR DE LA MATRIZ DE PRECIOS */}
      <div className="flex-1 m-4 bg-white rounded border border-[#EDEBE9] flex flex-col overflow-hidden shadow-xs">
        {filtered.length > 0 ? (
          <div className="flex-1 overflow-auto custom-scrollbar w-full">
            <table className="min-w-full border-separate border-spacing-0 text-[10px]">
              <thead>
                <tr className="bg-[#FAF9F8]">
                  {headers.map((header, idx) => (
                    <th 
                      key={header} 
                      className={`px-4 py-2.5 text-left font-bold text-[#242424] sticky top-0 bg-[#FAF9F8] z-10 whitespace-nowrap border-b border-r border-[#EDEBE9] ${idx === 0 ? "left-0 z-20 bg-[#FAF9F8]" : ""}`}
                    >
                      <div className="flex items-center gap-1.5 uppercase tracking-wider text-[9px]">
                        <span>{header}</span>
                        <Filter size={8} className="text-[#5B5FC7] opacity-50" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEBE9]">
                <AnimatePresence initial={false}>
                  {filtered.map((p, idx) => (
                    <motion.tr 
                      key={p.sku || idx} 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: Math.min(idx * 0.01, 0.15) }}
                      className="group hover:bg-[#F3F2F1] transition-colors"
                    >
                      {/* SKU bloqueado en la izquierda si hay scroll horizontal */}
                      <td className="px-4 py-2 font-black text-[#5B5FC7] border-r border-[#EDEBE9] bg-white group-hover:bg-[#F3F2F1] sticky left-0 z-5 whitespace-nowrap">
                        {p.sku}
                      </td>
                      <td className="px-4 py-2 text-[#242424] border-r border-[#EDEBE9] whitespace-nowrap font-semibold max-w-xs truncate">
                        {p.name}
                      </td>
                      <td className="px-4 py-2 text-[#616161] border-r border-[#EDEBE9] whitespace-nowrap tracking-tight">
                        {p.line}
                      </td>
                      <td className="px-4 py-2 font-black text-[#242424] border-r border-[#EDEBE9] bg-[#FAF9F8] text-right font-mono pr-5">
                        ${p.basePrice.toLocaleString()}
                      </td>

                      {/* RENDER DE MATRIZ DE GRADOS */}
                      {["G02","G03","G04","G05","G06","G07","G08","G09","G10"].map(g => (
                        <td 
                          key={g} 
                          className={`px-4 py-2 border-r border-[#EDEBE9] whitespace-nowrap text-right font-mono pr-5 ${g === 'G02' ? 'bg-[#F3F2F1]/60 font-bold text-[#242424]' : 'text-[#424242]'}`}
                        >
                          {p.grades[g] !== null && p.grades[g] !== undefined ? (
                            <span>${p.grades[g].toLocaleString()}</span>
                          ) : (
                            <span className="text-[#A19F9D]">—</span>
                          )}
                        </td>
                      ))}

                      {/* RENDER DE OPCIONES CONFIGURABLES (UPCHARGES) */}
                      {Object.values(p.opts).map((v, i) => (
                        <td key={i} className="px-4 py-2 text-[#424242] border-r border-[#EDEBE9] last:border-none whitespace-nowrap text-right font-mono pr-5">
                          {v > 0 ? (
                            <span className="text-[#107C41] font-bold">+{v.toLocaleString()}</span>
                          ) : (
                            <span className="text-[#A19F9D]">—</span>
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-12 px-4 text-center bg-[#FAF9F8]">
            <TableIcon size={28} className="text-[#A19F9D] mb-3" />
            <p className="text-xs font-bold text-[#323130]">No se encontraron coincidencias de SKU o productos</p>
            <p className="text-[11px] text-[#616161] mt-0.5">Asegúrate de que la sintaxis o filtros del catálogo sean correctos.</p>
          </div>
        )}
      </div>

      {/* PIE DE PÁGINA */}
      <div className="px-6 py-2 bg-white border-t border-[#EDEBE9] flex sm:flex-row flex-col justify-between items-center gap-2 text-[9px] font-semibold text-[#616161] shrink-0 w-full tracking-wide">
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#107C41] animate-pulse"></div>
          <span>Mostrando {filtered.length} de {products.length} productos procesados en memoria</span>
        </div>
        <div className="bg-[#5B5FC7]/10 text-[#5B5FC7] px-2 py-0.5 rounded-sm font-black uppercase text-[8px] tracking-widest order-1 sm:order-2">
          SVX ETL Pipeline Pipeline V2 (Oauth Verified)
        </div>
      </div>

      {/* ESTILOS DE INTEGRACIÓN DE INTERFAZ */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #C8C6C4; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #A19F9D; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F3F2F1; }
        
        table { 
          table-layout: auto !important; 
          width: max-content !important; 
        }
      `}</style>
    </div>
  );
};

export default LesroPricingMaster;