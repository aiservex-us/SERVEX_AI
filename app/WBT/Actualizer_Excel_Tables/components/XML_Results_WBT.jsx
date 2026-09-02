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

const WBTDataMatrix = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  const TABLES_HEADERS = [
    "Model #", "List Price", "Weight", "Classic/ Premium", "Model Name", "Top", "Legs/Base/Casebody", "Top D", "Top L", "Casebody W", "Casebody H", "Casebody D", "OA D", "OA H w/ Glides", "OA H w/ Casters", "Assembly", "Locking Casters (Per Table) (-CA)", "Wheelbarrow (2 Casters) (-2CA)", "Heavy Duty Locking Casters (Einstein ONLY) (-HDCA)", "Heavy Duty Locking Casters (Per Table) (-HDCA)", "Wheelbarrow Heavy Duty Locking Casters (2 Casters) (-2HDCA)", "Heavy Duty Colored Locking Casters (Per Table) EPIC (-HDCC_)", "Heavy Duty Colored Locking Casters LOBO/TORO (Per Table) (-HDCC_)", "Wheelbarrow Heavy Duty Colored Locking Casters LOBO/TORO (2 Casters) (-2HDCC_)", "Gibraltar Casters (-C)", "5 Locking Casters Culinary Tables ONLY (-CAS01-R)", "Grand Hank Glides (Per Table) (-HG)", "Soft Touch Glides (Per Table) (-FG)", "Steel Glides (Per Table) (-SG)", "Plastic Book Box (-P14CH)", "Plastic Book Box (-P20CH)", "Plastic Book Box (-P23CH)", "Backpack Hook/s LOBO/TORO (Set of 2) All Other Tables (1) (-BPH)", "3 Tote Tray Kit (-GK_S)", "Under Mount Tote Runners 12mm Drop (Set of 2) (-GTR)", "Wire Basket (-LW)", "12H Laminate Modesty Panel (-LMOD_)", "9H Perforated Metal Modesty Panel (-913_)", "Metal Wire Management 36, 48, 60 or 72L (-WM)", "Plastic Cable Wire Management (-PWM)", "Grommet w/ Cover & Cutout (-GR)", "Power Supply Modules", "Connecting Magnets for HangOut Stools 2 Locations (-2MA)", "Connecting Magnets for HangOut Stools 4 Locations (-4MA)", "LOBO Gussets (-G)", "TORO Gussets (-G)", "TORO Full Metal Shelf (-SHF)", "TORO Offset Half Metal Shelf (-HSHF)", "TORO Centered Half Metal Shelf (-CSHF)", "TORO H-Frame (-H)", "TORO Custom Fixed Height", "EPIC Full Black Metal Shelf -ADJ Frame ONLY (-SHF)", "EPIC Half Black Metal Shelf -ADJ Frame ONLY (-HSHF)", "EPIC Pegboard -ADJ Frame ONLY (Set of 2) (-PB)", "42 Fixed Bar Height (GIB) (-B)", "36 Fixed Height (GIB) (-36)", "Overshelf 60 Culinary Tables ONLY (-OSE1)", "Overshelf 72 Culinary Tables ONLY (-OSE1)", "Double Overshelf 60 Culinary Tables ONLY (-OSE2)", "Double Overshelf 72 Culinary Tables ONLY (-OSE2)", "20x15 Drawer Culinary Tables ONLY (-DR2015)", "20x20 Drawer Culinary Tables ONLY (-DR2020)", "EPIC/TORO (FIXED) Premium Frame Color - Blue(B), Green(G), Orange(O), Purple(P), Red(R)", "Premium Armor Edge™ Colors (-S2_)", "Non-Standard Edge Band", "Premium Laminate Upcharge for Tops 36x36 & OVER", "Premium Laminate Upcharge for Tops UNDER 36x36", "Markerboard Tops 36x36 & OVER (-__MB)", "Markerboard Tops UNDER 36x36 (-__MB)", "Chemical Resistant (-09C)", "Custom Sizes"
  ];

  const processXML = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('ClientsSERVEX_WBT')
        .select('XM_CET_import')
        .eq('company_name', 'WBT')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) throw dbError;
      if (!data?.XM_CET_import) {
        setProducts([]);
        return;
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.XM_CET_import, "text/xml");
      
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) throw new Error("Error parsing XML structure");

      const globalFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const featureMap = new Map();

      for (const f of globalFeatures) {
        const fCode = f.getElementsByTagName("Code")[0]?.textContent;
        if (fCode) {
          featureMap.set(fCode, f);
        }
      }
      
      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
      const extracted = [];

      for (const p of productsXML) {
        const sku = p.getElementsByTagName("Code")[0]?.textContent || "";
        const description = p.getElementsByTagName("Description")[0]?.textContent || "";
        
        const priceElement = p.getElementsByTagName("Price")[0];
        const basePrice = priceElement ? parseFloat(priceElement.getElementsByTagName("Value")[0]?.textContent || "0") : 0;

        const featureRefs = Array.from(p.getElementsByTagName("FeatureRef"));
        let hasSuffixes = false;
        
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
        
        const createRow = (baseSku, optSuffixCode, optPrice) => {
          const finalSku = optSuffixCode ? `${baseSku}/${optSuffixCode}` : baseSku;
          const finalDesc = optSuffixCode ? `${description} [Option ${optSuffixCode}]` : description;
          const finalPrice = basePrice + (optPrice || 0);

          const row = {};
          TABLES_HEADERS.forEach(h => row[h] = ""); // Initialize empty string

          // Map base fields
          row["Model #"] = finalSku;
          row["List Price"] = finalPrice;
          row["Model Name"] = finalDesc;

          // Map extracted options to the respective columns if their code is in the header
          Object.keys(productOptionPrices).forEach(optCode => {
            const matchingHeader = TABLES_HEADERS.find(h => h.includes(`(${optCode})`) || h.includes(`-${optCode}`));
            if (matchingHeader) {
              row[matchingHeader] = productOptionPrices[optCode];
            } else if (optCode.includes('MB')) {
               const mbHeader = TABLES_HEADERS.find(h => h.includes("(__MB)"));
               if (mbHeader) row[mbHeader] = productOptionPrices[optCode];
            }
          });

          return row;
        };

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
                if (!extracted.find(e => e["Model #"] === suffixSku)) {
                  extracted.push(createRow(sku, optCode, optPrice));
                  hasSuffixes = true;
                }
              }
            }
          }
        }
        
        if (!hasSuffixes) {
          extracted.push(createRow(sku, null, 0));
        }
      }
      
      setProducts(extracted);
      setCurrentPage(1); 
    } catch (err) {
      console.error("Error processing WBT data matrix:", err);
      setError(err.message || "Error processing catalog information WBT.");
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
      String(p["Model #"] || "").toLowerCase().includes(cleanSearch) ||
      String(p["Model Name"] || "").toLowerCase().includes(cleanSearch)
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
      ? Math.round(products.reduce((acc, p) => acc + (p["List Price"] || 0), 0) / total) 
      : 0;
    return { total, filtered: filtered.length, avgPrice };
  }, [products, filtered]);

  const exportToCSV = () => {
    if (!filtered || filtered.length === 0) return;
    
    // Explicitly use semicolon and our exact headers
    const csv = Papa.unparse(filtered, {
      columns: TABLES_HEADERS,
      delimiter: ";"
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `WBT_XML_Results_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    if (!filtered || filtered.length === 0) return;
    
    const worksheet = XLSX.utils.json_to_sheet(filtered, { header: TABLES_HEADERS });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Catalog Data");
    
    XLSX.writeFile(workbook, `WBT_XML_Results_${new Date().toISOString().slice(0,10)}.xlsx`);
  };



  if (loading) return (
    <div className="flex items-center justify-center min-h-[90vh] bg-white text-xs font-semibold text-slate-500 font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
        Retrieving master data matrix from WBT Engine...
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
      <div className="w-full mx-auto">
        
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-2xl shadow-[#464775]/10 overflow-hidden flex flex-col w-full">
          
          {/* Operations / Filters Header */}
          <div className="px-4 py-2 border-b border-slate-100 bg-gradient-to-r from-slate-50/40 to-white flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">WBT Tables XML Matrix (Master Format)</span>
                <span className="text-[10px] font-bold text-[#464775] bg-[#464775]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#464775]/10 select-none">
                  Live
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
                title="Synchronize and recalculate matrices"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
              <div className="flex items-center gap-1">
                <button 
                  onClick={exportToCSV}
                  type="button"
                  className="px-2 py-1 bg-white border border-slate-200/60 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-bold"
                  title="Export current view to CSV"
                >
                  <Download size={13} /> CSV
                </button>
                <button 
                  onClick={() => setShowWarningModal(true)}
                  type="button"
                  className="px-2 py-1 bg-white border border-slate-200/60 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-bold"
                  title="Export current view to Excel"
                >
                  <Download size={13} /> Excel
                </button>
              </div>

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
              <table className="table-fixed border-collapse overflow-hidden overflow-hidden text-left text-xs w-max min-w-[4000px]">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-semibold text-[#464775] bg-white/80 backdrop-blur-md sticky left-0 z-30 border-r border-b border-slate-100 select-none">
                      Index
                    </th>
                    {TABLES_HEADERS.map((header) => (
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
                          key={p["Model #"] || realIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="hover:bg-slate-50/80 hover:shadow-sm transition-colors duration-75 group"
                        >
                          <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#464775] border-r border-slate-100 sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 border-b border-slate-50">
                            {realIndex}
                          </td>

                          {TABLES_HEADERS.map((header) => {
                            let value = p[header];
                            if (header === "List Price") value = `$${(p["List Price"] || 0).toLocaleString()}`;
                            
                            return (
                              <td key={header} className={`p-0 text-slate-800 border-r border-b border-slate-50 min-w-[160px] max-w-[280px]`}>
                                <div className={`px-3 py-1.5 font-sans text-[11px] whitespace-nowrap truncate ${header === 'Model #' || header === 'List Price' ? 'font-bold font-mono text-[#464775]' : 'font-medium'}`} title={value}>
                                  {value}
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
              <span className="uppercase tracking-tight">TOTAL COLUMNS: {TABLES_HEADERS.length}</span>
              <span className="uppercase tracking-tight">RECORDS MATCHED: {filtered.length} of {products.length}</span>
            </div>
            
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
          </div>
        </div>
      </div>
      {/* ── EXCEL SCALABILITY WARNING MODAL ── */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowWarningModal(false)}
          />
          <div className="relative bg-white w-[440px] rounded-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <span className="text-[14px] font-bold text-[#242424]">Scalability Warning</span>
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
                  The process of manually updating and downloading files is <strong>inefficient and prone to errors</strong>. 
                </p>
                <p className="text-[13px] text-[#616161] leading-relaxed">
                  Having multiple files circulating and sharing them manually is not efficient. It is critical to <strong>modularize the system</strong> to achieve better scalability.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-[#F5F5F5] flex justify-end gap-2 rounded-b-xl border-t border-slate-100">
              <button onClick={() => setShowWarningModal(false)} className="px-4 py-1.5 text-[12px] font-semibold text-[#242424] bg-white border border-[#D1D1D1] rounded hover:bg-[#F0F0F0] transition-all">
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowWarningModal(false);
                  exportToExcel();
                }} 
                className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[#464775] rounded hover:bg-[#5a1515] transition-all shadow-md"
              >
                I understand, download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WBTDataMatrix;
