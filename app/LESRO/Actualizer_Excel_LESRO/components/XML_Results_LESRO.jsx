'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Filter, 
  AlertCircle,
  Download,
  X
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const LESRO_31_COLUMNS = [
  "ID",
  "Price Guide Sequence",
  "Product Line",
  "Product Name",
  "Price (Non UPH Products)",
  "Price Grade 02",
  "Price Grade 03",
  "Price Grade 04",
  "Price Grade 05",
  "Price Grade 06",
  "Price Grade 07",
  "Price Grade 08",
  "Price Grade 09",
  "Price Grade 10",
  "Price Grade 11",
  "Price Grade 12",
  "Price Grade 13",
  "Price Optional Armpad or Armcap - Polyurethane",
  "Price Optional Armcap - Polyurethane",
  "Price Optional ArmPAD - Polyurethane",
  "Price Optional Armpad or Armcap - Solid Surface",
  "Price Optional Armcap - Solid Surface",
  "Price Optional ArmPAD - Solid Surface",
  "Price Optional Casters",
  "Price Optional Swivel Tablet",
  "Price Optional Chrome Finish",
  "Price Optional Ganging Brackets",
  "Price Optional Power Unit",
  "Price Optional Bevel Edge",
  "Price Optional Shelf",
  "Country of Origin"
];

// Parser de reserva de XML a la matriz de 31 columnas de LESRO
const parseLesroXmlTo31Columns = (xmlString) => {
  if (!xmlString || !xmlString.trim()) return [];
  
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) throw new Error("Error al analizar la estructura XML de LESRO");

  const globalFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
  const featureMap = new Map();
  for (const f of globalFeatures) {
    const fCode = f.getElementsByTagName("Code")[0]?.textContent;
    if (fCode) featureMap.set(fCode, f);
  }

  const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
  const rows = [];
  const lineSeqCounter = {};

  for (const p of productsXML) {
    const pCode = (p.getElementsByTagName("Code")[0]?.textContent || "").trim();
    if (!pCode) continue;

    const pDesc = (p.getElementsByTagName("Description")[0]?.textContent || "").trim();
    const priceElem = p.getElementsByTagName("Price")[0];
    const basePriceStr = priceElem ? (priceElem.getElementsByTagName("Value")[0]?.textContent || "0") : "0";
    const basePrice = parseFloat(basePriceStr) || 0;

    let pLine = pDesc;
    let pName = pDesc;
    if (pDesc.includes(",")) {
      const parts = pDesc.split(",");
      pLine = parts[0].trim();
      pName = parts.slice(1).join(",").trim();
    }

    lineSeqCounter[pLine] = (lineSeqCounter[pLine] || 0) + 1;
    const seq = lineSeqCounter[pLine];

    const featureRefs = Array.from(p.getElementsByTagName("FeatureRef")).map(f => f.textContent).filter(Boolean);

    let uphFeat = null;
    let armpadFeat = null;
    let powerFeat = null;

    for (const fCode of featureRefs) {
      if (fCode.includes("UPH-GRADE")) uphFeat = featureMap.get(fCode);
      else if (fCode.includes("ARMPAD")) armpadFeat = featureMap.get(fCode);
      else if (fCode.includes("POWER")) powerFeat = featureMap.get(fCode);
    }
    if (!uphFeat && featureMap.has(`UPH-GRADE-${pCode}`)) uphFeat = featureMap.get(`UPH-GRADE-${pCode}`);
    if (!armpadFeat && featureMap.has(`ARMPAD-${pCode}`)) armpadFeat = featureMap.get(`ARMPAD-${pCode}`);

    // Grados
    const grados = {};
    if (uphFeat) {
      const options = Array.from(uphFeat.getElementsByTagName("Option"));
      for (const opt of options) {
        const oCode = opt.getElementsByTagName("Code")[0]?.textContent || "";
        const oPriceElem = opt.querySelector("OptionPrice > Value");
        const upcharge = parseFloat(oPriceElem?.textContent || "0") || 0;
        const total = basePrice + upcharge;
        
        if (oCode === "COM" || oCode.toUpperCase().includes("GRD2")) {
          grados[2] = total;
        } else if (oCode.toUpperCase().includes("GRD")) {
          const num = oCode.replace(/\D/g, "");
          if (num) grados[parseInt(num, 10)] = total;
        }
      }
    }

    // Armpads
    let armPoly = null;
    let armSolid = null;
    if (armpadFeat) {
      const options = Array.from(armpadFeat.getElementsByTagName("Option"));
      for (const opt of options) {
        const oCode = (opt.getElementsByTagName("Code")[0]?.textContent || "").toUpperCase();
        const oPriceElem = opt.querySelector("OptionPrice > Value");
        const opPrice = parseFloat(oPriceElem?.textContent || "0") || 0;
        if (opPrice > 0) {
          if (oCode.includes("APU") || oCode.includes("POLY") || oCode.includes("URETHANE")) armPoly = opPrice;
          else if (oCode.includes("SS") || oCode.includes("SOLID")) armSolid = opPrice;
        }
      }
    }

    // Power
    let powerPrice = null;
    if (powerFeat) {
      const options = Array.from(powerFeat.getElementsByTagName("Option"));
      for (const opt of options) {
        const oPriceElem = opt.querySelector("OptionPrice > Value");
        const opPrice = parseFloat(oPriceElem?.textContent || "0") || 0;
        if (opPrice > 0) powerPrice = opPrice;
      }
    }

    // Ganging
    let gangingPrice = null;
    const gangingLines = ['AMHERST', 'ASHFORD', 'AVON', 'BELMONT', 'BROOKLYN', 'CHAT', 'FRANKLIN', 'FREMONT', 'GANSETT', 'HARTFORD', 'LENOX', 'NEWPORT', 'RHAPSODY', 'WESTON', 'WILLOW', 'WATERFALL'];
    if (gangingLines.some(l => pLine.toUpperCase().includes(l))) {
      if (['Armless', 'Guest', 'Sofa', 'Loveseat', 'Chair', 'Bench'].some(k => pName.includes(k))) {
        gangingPrice = 47.0;
      }
    }

    // Country
    let country = 'US';
    if (pDesc.toUpperCase().includes('CN') || (pName.toUpperCase().includes('LAMINATE') && (pName.toUpperCase().includes('END TABLE') || pName.toUpperCase().includes('COFFEE TABLE') || pName.toUpperCase().includes('CORNER TABLE')))) {
      country = 'CN';
    } else if (pName.toUpperCase().includes('GLASS TOP')) {
      country = 'TW';
    }

    const isUph = (2 in grados) || Object.keys(grados).length > 0;

    const row = {
      "ID": pCode,
      "Price Guide Sequence": seq,
      "Product Line": pLine,
      "Product Name": pName,
      "Price (Non UPH Products)": isUph ? "" : (basePrice || ""),
      "Price Grade 02": isUph ? (grados[2] !== undefined ? grados[2] : basePrice) : "",
      "Price Grade 03": grados[3] !== undefined ? grados[3] : "",
      "Price Grade 04": grados[4] !== undefined ? grados[4] : "",
      "Price Grade 05": grados[5] !== undefined ? grados[5] : "",
      "Price Grade 06": grados[6] !== undefined ? grados[6] : "",
      "Price Grade 07": grados[7] !== undefined ? grados[7] : "",
      "Price Grade 08": grados[8] !== undefined ? grados[8] : "",
      "Price Grade 09": grados[9] !== undefined ? grados[9] : "",
      "Price Grade 10": grados[10] !== undefined ? grados[10] : "",
      "Price Grade 11": grados[11] !== undefined ? grados[11] : "",
      "Price Grade 12": grados[12] !== undefined ? grados[12] : "",
      "Price Grade 13": grados[13] !== undefined ? grados[13] : "",
      "Price Optional Armpad or Armcap - Polyurethane": armPoly !== null ? armPoly : "",
      "Price Optional Armcap - Polyurethane": "",
      "Price Optional ArmPAD - Polyurethane": armPoly !== null ? armPoly : "",
      "Price Optional Armpad or Armcap - Solid Surface": armSolid !== null ? armSolid : "",
      "Price Optional Armcap - Solid Surface": "",
      "Price Optional ArmPAD - Solid Surface": armSolid !== null ? armSolid : "",
      "Price Optional Casters": "",
      "Price Optional Swivel Tablet": "",
      "Price Optional Chrome Finish": "",
      "Price Optional Ganging Brackets": gangingPrice !== null ? gangingPrice : "",
      "Price Optional Power Unit": powerPrice !== null ? powerPrice : "",
      "Price Optional Bevel Edge": "",
      "Price Optional Shelf": "",
      "Country of Origin": country
    };

    rows.push(row);
  }

  return rows;
};

const XMLResultsLESRO = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const processXML = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener registro de ClientsSERVEX_LESRO
      const { data, error: dbError } = await supabase
        .from('ClientsSERVEX_LESRO')
        .select('csv_raw, CSV_final, xml_actualizer_raw, XM_CET_import, xml_raw')
        .eq('company_name', 'LESRO')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) throw dbError;

      const csvPayload = data?.csv_raw || data?.CSV_final;
      const xmlPayload = data?.XM_CET_import || data?.xml_actualizer_raw || data?.xml_raw;

      if (csvPayload && csvPayload.trim().length > 0) {
        // Cargar desde CSV estructurado de 31 columnas
        const parsed = Papa.parse(csvPayload, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false
        });

        if (parsed.data && parsed.data.length > 0) {
          const formatted = parsed.data.map(item => {
            const row = {};
            LESRO_31_COLUMNS.forEach(col => {
              row[col] = item[col] !== undefined ? item[col] : "";
            });
            return row;
          });
          setProducts(formatted);
          setCurrentPage(1);
          setLoading(false);
          return;
        }
      }

      if (xmlPayload && xmlPayload.trim().length > 0) {
        // Parsear desde el XML a la matriz de 31 columnas
        const rows = parseLesroXmlTo31Columns(xmlPayload);
        setProducts(rows);
        setCurrentPage(1);
        setLoading(false);
        return;
      }

      setProducts([]);
    } catch (err) {
      console.error("Error cargando matriz LESRO:", err);
      setError(err.message || "Error procesando la información del catálogo LESRO.");
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
    return products.filter(p => {
      const id = (p["ID"] || "").toString().toLowerCase();
      const line = (p["Product Line"] || "").toString().toLowerCase();
      const name = (p["Product Name"] || "").toString().toLowerCase();
      return id.includes(cleanSearch) || line.includes(cleanSearch) || name.includes(cleanSearch);
    });
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
    return { total, filtered: filtered.length };
  }, [products, filtered]);

  const exportToExcel = () => {
    if (!filtered || filtered.length === 0) return;
    
    const csvData = filtered.map(p => {
      const row = {};
      LESRO_31_COLUMNS.forEach(header => {
        row[header] = p[header] !== undefined ? p[header] : "";
      });
      return row;
    });
    
    const worksheet = XLSX.utils.json_to_sheet(csvData, { header: LESRO_31_COLUMNS });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LESRO Master Catalog");
    
    XLSX.writeFile(workbook, `LESRO_PRICING_2026_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh] min-h-[80vh] bg-transparent text-xs font-semibold text-slate-500 font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
        Cargando matriz de 31 columnas de LESRO...
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-[80vh] min-h-[80vh] w-full flex-col items-center justify-center bg-transparent p-12 text-center font-sans">
      <AlertCircle className="text-red-500 mb-3" size={36} />
      <h3 className="text-sm font-bold text-slate-800 mb-1">Error de Ingestión LESRO</h3>
      <p className="text-xs text-slate-500 max-w-md mb-4">{error}</p>
      <button 
        onClick={processXML} 
        className="flex items-center gap-2 px-4 py-2 bg-[#464775] hover:bg-[#343559] text-white text-xs font-bold rounded shadow-sm transition-colors"
      >
        <RefreshCw size={12} /> Reintentar
      </button>
    </div>
  );

  return (
    <div className="h-[80vh] min-h-[80vh] flex flex-col justify-center items-center bg-transparent p-2 md:p-4 text-slate-800 font-sans antialiased">
      <div className="w-full mx-auto">
        
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-2xl shadow-[#464775]/10 overflow-hidden flex flex-col w-full">
          
          {/* Operations / Filters Header */}
          <div className="px-4 py-2 border-b border-slate-100 bg-gradient-to-r from-slate-50/40 to-white flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">LESRO Master 31-Column Matrix</span>
                <span className="text-[10px] font-bold text-[#464775] bg-[#464775]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#464775]/10 select-none">
                  Live
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Estructura de Matriz Maestra LESRO 2026 (31 Columnas)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-transparent/80 border border-slate-200/60 rounded-sm px-2 py-0.5 text-[10px] text-slate-500 font-medium select-none">
                <span>REGISTROS: <strong className="text-slate-800 font-bold">{stats.total}</strong></span>
                <span className="text-[#D2D2D2]">|</span>
                <span>FILTRADOS: <strong className="text-slate-800 font-bold">{stats.filtered}</strong></span>
              </div>

              <input
                type="text"
                placeholder="Buscar por ID, Line, Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200/60 rounded-sm px-2 py-0.5 text-[11px] text-slate-800 placeholder-[#616161] focus:border-[#464775] outline-none transition-all w-[200px]"
              />

              <button 
                onClick={processXML}
                type="button"
                className="p-1 bg-white border border-slate-200/60 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors"
                title="Sincronizar y recalcular"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
              
              <button 
                onClick={() => setShowWarningModal(true)}
                type="button"
                className="px-2.5 py-1 bg-[#464775] text-white hover:bg-[#343559] rounded-sm transition-colors flex items-center justify-center gap-1.5 text-[11px] font-bold shadow-sm"
                title="Exportar vista a Excel"
              >
                <Download size={13} /> Excel
              </button>
            </div>
          </div>

          {/* Table Matrix */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center bg-white/40 backdrop-blur-md">
              <div className="w-16 h-16 rounded-2xl bg-[#464775]/5 flex items-center justify-center mb-4 border border-[#464775]/10 shadow-inner">
                <svg className="w-8 h-8 text-[#464775]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">No se encontraron registros</h3>
              <p className="text-xs text-slate-500 max-w-sm font-medium">
                No hay productos en la matriz LESRO que coincidan con la búsqueda.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300 max-h-[58vh]">
              <table className="table-fixed border-collapse overflow-hidden text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-semibold text-[#464775] bg-white/80 backdrop-blur-md sticky left-0 z-30 border-r border-b border-slate-100 select-none">
                      Index
                    </th>
                    {LESRO_31_COLUMNS.map((header) => (
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
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#F0F0F0]">
                  <AnimatePresence initial={false}>
                    {paginatedProducts.map((p, idx) => {
                      const realIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                      
                      return (
                        <motion.tr 
                          key={p.ID || realIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="hover:bg-slate-50/80 hover:shadow-sm transition-colors duration-75 group"
                        >
                          <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#464775] border-r border-slate-100 sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 border-b border-slate-50">
                            {realIndex}
                          </td>

                          {LESRO_31_COLUMNS.map((header) => {
                            let value = p[header] !== undefined ? p[header] : "-";
                            return (
                              <td key={header} className="p-0 text-slate-800 border-r border-b border-slate-50 min-w-[160px] max-w-[280px]">
                                <div className={`px-3 py-1.5 font-sans text-[11px] whitespace-nowrap truncate ${header === 'ID' ? 'font-bold font-mono text-[#464775]' : 'font-medium'}`} title={String(value)}>
                                  {value !== null && value !== undefined && value !== "" ? String(value) : "-"}
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

          <div className="bg-gradient-to-r from-slate-50/40 to-white px-4 py-2 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-semibold text-slate-500 select-none">
            <div className="flex gap-4">
              <span className="uppercase tracking-tight">TOTAL COLUMNAS: {LESRO_31_COLUMNS.length}</span>
              <span className="uppercase tracking-tight">MOSTRANDO: {paginatedProducts.length} de {filtered.length}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2 py-1 bg-white border border-slate-200/60 rounded-sm text-slate-800 transition-colors enabled:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-bold"
              >
                Anterior
              </button>
              
              <span className="text-slate-800 font-mono px-1 text-[11px]">
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2 py-1 bg-white border border-slate-200/60 rounded-sm text-slate-800 transition-colors enabled:hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-bold"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── EXCEL WARNING MODAL ── */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowWarningModal(false)}
          />
          <div className="relative bg-white w-[440px] rounded-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <span className="text-[14px] font-bold text-[#242424]">Advertencia de Escalabilidad</span>
              <button onClick={() => setShowWarningModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-8 py-6 flex gap-4">
              <div className="p-2 h-fit rounded-full shrink-0 bg-[#C4314B]/10 text-[#C4314B]">
                <AlertCircle size={22} className="currentColor" />
              </div>
              <div className="flex-1 mt-1">
                <p className="text-[13px] text-[#616161] leading-relaxed mb-3">
                  El proceso de actualización y descarga manual de archivos es <strong>ineficiente y propenso a errores</strong>. 
                </p>
                <p className="text-[13px] text-[#616161] leading-relaxed">
                  Tener múltiples archivos circulando y compartiéndolos manualmente no es eficiente. Es crítico <strong>modularizar el sistema</strong> para lograr una mejor escalabilidad.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-[#F5F5F5] flex justify-end gap-2 rounded-b-xl border-t border-slate-100">
              <button onClick={() => setShowWarningModal(false)} className="px-4 py-1.5 text-[12px] font-semibold text-[#242424] bg-white border border-[#D1D1D1] rounded hover:bg-[#F0F0F0] transition-all">
                Cancelar
              </button>
              <button 
                onClick={async () => {
                  setShowWarningModal(false);
                  
                  if (filtered && filtered.length > 0) {
                    const csvString = Papa.unparse(filtered, {
                      columns: LESRO_31_COLUMNS,
                      delimiter: ";"
                    });
                    
                    try {
                      const { data: existing } = await supabase
                        .from('ClientsSERVEX_LESRO')
                        .select('id')
                        .eq('company_name', 'LESRO')
                        .maybeSingle();

                      if (existing && existing.id) {
                        await supabase
                          .from('ClientsSERVEX_LESRO')
                          .update({ csv_raw: csvString })
                          .eq('id', existing.id);
                      } else {
                        await supabase
                          .from('ClientsSERVEX_LESRO')
                          .insert([{ company_name: 'LESRO', csv_raw: csvString }]);
                      }
                    } catch (err) {
                      console.error('Error guardando CSV maestro:', err);
                    }
                  }
                  
                  exportToExcel();
                }} 
                className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[#464775] rounded hover:bg-[#343559] transition-all shadow-md"
              >
                Entendido, descargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XMLResultsLESRO;
