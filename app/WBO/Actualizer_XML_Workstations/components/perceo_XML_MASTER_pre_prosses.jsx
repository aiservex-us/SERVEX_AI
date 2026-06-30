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
  
  // Estado para controlar la página actual
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 35;

  // Cabeceras estrictas adaptadas para incluir variantes de acabados
  const baseHeaders = ["SKU / Variante", "Description", "Classification", "Finish Type", "Calculated Price"];

  const processXML = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // Ingestión desde la tabla correcta configurada en Supabase para WBD
      const { data, error: dbError } = await supabase
        .from('ClientsSERVEX_WBO')
        .select('xml_raw')
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbError) throw dbError;
      if (!data?.xml_raw) {
        setProducts([]);
        return;
      }

      // --- REGISTRO DE DESCARGA GLOBAL ---
      if (typeof window !== 'undefined') {
        window.downloadWBDXML = () => {
          try {
            const blob = new Blob([data.xml_raw], { type: 'text/xml;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'WBD.XML');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log("WBD.XML descargado con éxito.");
          } catch (downloadErr) {
            console.error("Error al descargar el XML:", downloadErr);
          }
        };
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.xml_raw, "text/xml");
      
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) throw new Error("Error parsing WBD XML structure");

      // 1. Mapear Features globales aplicando .trim() estricto en las claves
      const featuresXML = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const featureDeltasMap = {}; // { FEATURE_CODE: { 'C': delta_c, 'P': delta_p } }

      for (const f of featuresXML) {
        const rawCode = f.getElementsByTagName("Code")[0]?.textContent;
        if (!rawCode) continue;
        
        const fCode = rawCode.trim(); // Sanitización clave
        featureDeltasMap[fCode] = { 'C': 0, 'P': 0 };

        const options = Array.from(f.getElementsByTagName("Option"));
        for (const o of options) {
          const oCode = o.getElementsByTagName("Code")[0]?.textContent?.trim(); // 'C' o 'P'
          if (oCode === 'C' || oCode === 'P') {
            const deltaValue = parseFloat(o.getElementsByTagName("OptionPrice")[0]?.getElementsByTagName("Value")[0]?.textContent || "0");
            featureDeltasMap[fCode][oCode] = deltaValue;
          }
        }
      }

      // 2. Procesar los Productos y expandirlos resolviendo las referencias limpias
      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
      const extracted = [];

      for (const p of productsXML) {
        const skuBase = p.getElementsByTagName("Code")[0]?.textContent?.trim() || "";
        const description = p.getElementsByTagName("Description")[0]?.textContent || "";
        const classification = p.getElementsByTagName("ClassificationRef")[0]?.getElementsByTagName("Code")[0]?.textContent 
          || p.getElementsByTagName("ClassificationRef")[0]?.textContent 
          || "N/A";
        
        // Precio Base del Producto
        const priceElement = p.getElementsByTagName("Price")[0];
        const basePrice = priceElement ? parseFloat(priceElement.getElementsByTagName("Value")[0]?.textContent || "0") : 0;

        // Obtener la referencia al Feature sanando espacios en blanco indeseados
        const featureRefElement = p.getElementsByTagName("Features")[0]?.getElementsByTagName("FeatureRef")[0];
        const featureRef = featureRefElement ? featureRefElement.textContent.trim() : "";
        
        // Extraemos deltas cruzando datos con el mapa sanitizado
        const deltaC = featureDeltasMap[featureRef]?.['C'] ?? 0;
        const deltaP = featureDeltasMap[featureRef]?.['P'] ?? 0;

        // Variante Classic (/C)
        extracted.push({
          id: `${skuBase}-C`,
          sku: `${skuBase}/C`,
          skuBase,
          description,
          classification,
          finishType: "Classic",
          finishCode: "C",
          calculatedPrice: basePrice + deltaC,
          isPremium: false
        });

        // Variante Premium (/P)
        extracted.push({
          id: `${skuBase}-P`,
          sku: `${skuBase}/P`,
          skuBase,
          description,
          classification,
          finishType: "Premium",
          finishCode: "P",
          calculatedPrice: basePrice + deltaP,
          isPremium: true
        });
      }
      
      setProducts(extracted);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error en procesamiento de matriz de datos WBD:", err);
      setError(err.message || "Error al procesar la información de catálogos WBD.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    processXML();
    return () => {
      if (typeof window !== 'undefined' && window.downloadWBDXML) {
        delete window.downloadWBDXML;
      }
    };
  }, []);

  // Búsqueda elástica
  const filtered = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    if (!cleanSearch) return products;
    return products.filter(p => 
      p.sku.toLowerCase().includes(cleanSearch) ||
      p.description.toLowerCase().includes(cleanSearch) ||
      p.finishType.toLowerCase().includes(cleanSearch)
    );
  }, [products, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
      ? Math.round(products.reduce((acc, p) => acc + p.calculatedPrice, 0) / total) 
      : 0;
    return { total, filtered: filtered.length, avgPrice };
  }, [products, filtered]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[90vh] bg-white text-xs font-semibold text-[#616161] font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#5B5FC7] border-t-transparent rounded-full animate-spin"></div>
        Retrieving master data matrix with variants (Classic / Premium) from WBD Engine...
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
                  Classic & Premium Dynamic Split
                </span>
              </div>
              <span className="text-[10px] text-[#616161]">
                Automated Ingestion Pipeline & Structured Data Mapping (Product + Feature Delta Resolution)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#F5F5F5] border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[10px] text-[#616161] font-medium select-none">
                <span>TOTAL VARIANTS: <strong className="text-[#242424] font-bold">{stats.total}</strong></span>
                <span className="text-[#D2D2D2]">|</span>
                <span>FILTERED: <strong className="text-[#242424] font-bold">{stats.filtered}</strong></span>
                <span className="text-[#D2D2D2]">|</span>
                <span>AVG PRICE: <strong className="text-[#242424] font-bold">${stats.avgPrice.toLocaleString()}</strong></span>
              </div>

              <input
                type="text"
                placeholder="Search SKU, name, classic, premium..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] text-[#242424] placeholder-[#616161] focus:border-[#5B5FC7] outline-none transition-all w-[240px]"
              />

              <button 
                onClick={processXML}
                type="button"
                className="p-1 bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] rounded-sm text-[#616161] transition-colors"
                title="Sincronizar y recalcular matrices"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Table Matrix */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-[#616161] text-xs font-normal bg-white">
              No se encontraron coincidencias de SKU o variantes en el esquema actual.
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300">
              <table className="table-fixed border-collapse text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-semibold text-[#5B5FC7] bg-gradient-to-b from-white to-[#FCFAFF] sticky left-0 z-30 border-r border-b border-[#E0E0E0] select-none">
                      Index
                    </th>
                    {baseHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-[#242424] bg-gradient-to-b from-white to-[#FCFAFF] border-r border-b border-[#E0E0E0] min-w-[150px] max-w-[320px] whitespace-nowrap truncate uppercase tracking-wider"
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
                    {paginatedProducts.map((p, idx) => {
                      const realIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                      
                      return (
                        <motion.tr 
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.1 }}
                          className="hover:bg-[#F7F5FA] transition-colors duration-75 group"
                        >
                          {/* Column Index */}
                          <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#5B5FC7] border-r border-[#E0E0E0] sticky left-0 z-10 bg-white group-hover:bg-[#FCFAFF] border-b border-[#F0F0F0]">
                            {realIndex}
                          </td>

                          {/* SKU con variante visual real (/C o /P) */}
                          <td className="p-0 text-[#5B5FC7] border-r border-b border-[#F0F0F0] min-w-[180px] max-w-[280px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] font-bold whitespace-nowrap truncate" title={p.sku}>
                              {p.skuBase}
                              <span className={`ml-1 px-1 rounded-sm text-[10px] font-mono font-bold ${p.isPremium ? 'bg-[#FFF0F6] text-[#D01A6A] border border-[#FFD6E7]' : 'bg-[#EBF3FF] text-[#106EBE] border border-[#CCE3FF]'}`}>
                                /{p.finishCode}
                              </span>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="p-0 text-[#242424] border-r border-b border-[#F0F0F0] min-w-[250px] max-w-[350px]">
                            <div className="px-3 py-1.5 font-sans text-[11px] font-medium whitespace-nowrap truncate" title={p.description}>
                              {p.description}
                            </div>
                          </td>

                          {/* Classification */}
                          <td className="p-0 text-[#616161] border-r border-b border-[#F0F0F0] min-w-[130px] max-w-[200px]">
                            <div className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate" title={p.classification}>
                              {p.classification}
                            </div>
                          </td>

                          {/* Finish Type Label */}
                          <td className="p-0 border-r border-b border-[#F0F0F0] min-w-[120px] max-w-[160px]">
                            <div className="px-3 py-1.5">
                              <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full ${p.isPremium ? 'text-[#D01A6A] bg-[#FFF0F6]' : 'text-[#106EBE] bg-[#EBF3FF]'}`}>
                                {p.finishType}
                              </span>
                            </div>
                          </td>

                          {/* Calculated Price */}
                          <td className="p-0 text-[#242424] border-r border-b border-[#F0F0F0] min-w-[150px] max-w-[200px]">
                            <div className={`px-3 py-1.5 font-mono text-[11px] font-extrabold whitespace-nowrap truncate ${p.isPremium ? 'bg-[#FFF5FA]/40 text-[#A20E4E]' : 'bg-[#F4F8FA]/60 text-[#242424]'}`}>
                              ${p.calculatedPrice.toLocaleString()}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer Info & Pagination Controls */}
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-semibold text-[#616161] select-none">
            <div className="flex gap-4">
              <span className="uppercase tracking-tight">TOTAL COLUMNS: {baseHeaders.length}</span>
              <span className="uppercase tracking-tight">VARIANTS RENDERED: {filtered.length} of {products.length}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2 py-1 bg-white border border-[#D2D2D2] rounded-sm text-[#242424] transition-colors enabled:hover:bg-[#F3F2F1] disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-bold"
              >
                Previous
              </button>
              
              <span className="text-[#242424] font-mono px-1 text-[11px]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2 py-1 bg-white border border-[#D2D2D2] rounded-sm text-[#242424] transition-colors enabled:hover:bg-[#F3F2F1] disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-bold"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-[#5B5FC7]/10 px-2.5 py-0.5 rounded border border-[#5B5FC7]/20 text-[#5B5FC7] font-extrabold uppercase text-[9px]">
                WBD ETL Pipeline V3 (Dynamic Matrix Split)
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WBDDataMatrix;