'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase, resolveXmlContent } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Filter, 
  AlertCircle,
  Download,
  X,
  Search
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const BASE_HEADERS = ["Model #", "List Price", "Weight", "Classic/ Premium", "Model Name"];

const DynamicDataMatrix = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [matrixHeaders, setMatrixHeaders] = useState(BASE_HEADERS);
  
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const processedXmlRef = useRef(null);
  const [processedIndex, setProcessedIndex] = useState(0);
  const [totalProductsInXml, setTotalProductsInXml] = useState(0);
  const [isExportingFull, setIsExportingFull] = useState(false);

  const yieldToMainThread = () => new Promise(resolve => setTimeout(resolve, 0));

  const extractProductRows = (p, featureMap, getProductFeatureCodes, validColumns, computedHeaders) => {
    const sku = p.getElementsByTagName("Code")[0]?.textContent || "";
    const description = p.getElementsByTagName("Description")[0]?.textContent || "";
    const classification = p.getElementsByTagName("ClassificationRef")[0]?.getElementsByTagName("Code")[0]?.textContent 
      || p.getElementsByTagName("ClassificationRef")[0]?.textContent 
      || "Standard";
    
    const priceElement = p.getElementsByTagName("Price")[0];
    const basePrice = priceElement ? parseFloat(priceElement.getElementsByTagName("Value")[0]?.textContent || "0") : 0;
    const weight = p.getElementsByTagName("Weight")[0]?.textContent || "N/A";

    const featureCodes = getProductFeatureCodes(p);
    const productOptionPrices = {};
    
    for (const fCode of featureCodes) {
      const featureNode = featureMap.get(fCode);
      if (featureNode) {
        const options = Array.from(featureNode.getElementsByTagName("Option"));
        for (const opt of options) {
          const optCode = opt.getElementsByTagName("Code")[0]?.textContent?.trim();
          const optPriceElem = opt.querySelector("OptionPrice > Value");
          if (optPriceElem && optCode) {
            const optPrice = parseFloat(optPriceElem.textContent || "0");
            if (productOptionPrices[optCode] === undefined || optPrice > productOptionPrices[optCode]) {
              productOptionPrices[optCode] = optPrice;
            }
          }
        }
      }
    }

    const createRow = (baseSku, optSuffixCode, optPrice) => {
      const finalSku = optSuffixCode ? `${baseSku}/${optSuffixCode}` : baseSku;
      const finalDesc = optSuffixCode ? `${description} [Option ${optSuffixCode}]` : description;
      const finalPrice = basePrice + (optPrice || 0);

      const row = {};
      computedHeaders.forEach(h => row[h] = "");

      row["Model #"] = finalSku;
      row["List Price"] = finalPrice;
      row["Weight"] = weight;
      row["Classic/ Premium"] = classification;
      row["Model Name"] = finalDesc;

      validColumns.forEach(col => {
        if (productOptionPrices[col.optCode] !== undefined) {
          row[col.label] = productOptionPrices[col.optCode];
        } else {
          row[col.label] = 0;
        }
      });

      return row;
    };

    const rows = [];
    let hasSuffixes = false;
    for (const fCode of featureCodes) {
      const featureNode = featureMap.get(fCode);
      if (featureNode) {
        const options = Array.from(featureNode.getElementsByTagName("Option"));
        for (const opt of options) {
          const optCode = opt.getElementsByTagName("Code")[0]?.textContent?.trim();
          if (optCode === "C" || optCode === "P") {
            const optPriceElem = opt.querySelector("OptionPrice > Value");
            const optPrice = optPriceElem ? parseFloat(optPriceElem.textContent || "0") : 0;
            
            const suffixSku = `${sku}/${optCode}`;
            if (!rows.find(e => e["Model #"] === suffixSku)) {
              rows.push(createRow(sku, optCode, optPrice));
              hasSuffixes = true;
            }
          }
        }
      }
    }
    
    if (!hasSuffixes) {
      rows.push(createRow(sku, null, 0));
    }

    return rows;
  };

  const processXML = async () => {
    try {
      setLoading(true);
      setError(null);
      setProducts([]);
      setProcessedIndex(0);

      const { data, error: dbError } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .select('XM_CET_import, xml_raw')
        .eq('company_name', 'General_Procces')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbError) throw dbError;
      const rawXmlStr = await resolveXmlContent(data?.XM_CET_import || data?.xml_raw);
      if (!rawXmlStr) {
        setProducts([]);
        setMatrixHeaders(BASE_HEADERS);
        setLoading(false);
        return;
      }

      await yieldToMainThread();

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(rawXmlStr, "text/xml");
      
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

      const featureCache = new Map();
      const getProductFeatureCodes = (pNode) => {
        const directRefs = Array.from(pNode.getElementsByTagName("FeatureRef")).map(r => r.textContent?.trim()).filter(Boolean);
        const cacheKey = directRefs.join('|');
        if (featureCache.has(cacheKey)) {
          return featureCache.get(cacheKey);
        }

        const resolved = [];
        const visited = new Set();

        const traverse = (fCode) => {
          if (!fCode || visited.has(fCode)) return;
          visited.add(fCode);
          resolved.push(fCode);

          const fNode = featureMap.get(fCode);
          if (fNode) {
            const subRefs = Array.from(fNode.getElementsByTagName("FeatureRef"));
            for (const sub of subRefs) {
              const subCode = sub.textContent?.trim();
              if (subCode) traverse(subCode);
            }
          }
        };

        for (const code of directRefs) {
          traverse(code);
        }

        featureCache.set(cacheKey, resolved);
        return resolved;
      };

      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
      setTotalProductsInXml(productsXML.length);

      const optionMap = new Map();

      for (let i = 0; i < productsXML.length; i++) {
        if (i > 0 && i % 200 === 0) {
          await yieldToMainThread();
        }
        const p = productsXML[i];
        const featureCodes = getProductFeatureCodes(p);
        for (const fCode of featureCodes) {
          const featureNode = featureMap.get(fCode);
          if (featureNode) {
            const options = Array.from(featureNode.getElementsByTagName("Option"));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent?.trim();
              const optDesc = opt.getElementsByTagName("Description")[0]?.textContent?.trim();
              const optPriceElem = opt.querySelector("OptionPrice > Value");
              
              if (optPriceElem && optCode) {
                const optPrice = parseFloat(optPriceElem.textContent || "0");
                const label = optDesc 
                  ? (optDesc.toLowerCase().includes(optCode.toLowerCase()) ? optDesc : `${optCode} (${optDesc})`)
                  : optCode;
                
                const existing = optionMap.get(optCode);
                if (!existing) {
                  optionMap.set(optCode, { optCode, label, maxPrice: optPrice });
                } else {
                  if (optPrice > existing.maxPrice) {
                    existing.maxPrice = optPrice;
                  }
                  if (!existing.label || existing.label === optCode) {
                    existing.label = label;
                  }
                }
              }
            }
          }
        }
      }

      const validColumns = Array.from(optionMap.values()).filter(c => c.maxPrice > 0);
      const dynamicOptionHeaders = validColumns.map(c => c.label);
      const computedHeaders = [...BASE_HEADERS, ...dynamicOptionHeaders];
      
      setMatrixHeaders(computedHeaders);

      // Guardar referencia en el ref para carga bajo demanda
      processedXmlRef.current = {
        productsXML,
        featureMap,
        getProductFeatureCodes,
        validColumns,
        computedHeaders
      };

      // CARGA DE BÚFER INICIAL (EXACTAMENTE 30 PRODUCTOS = 2 PÁGINAS DE 15)
      const initialRows = [];
      const initialCount = Math.min(30, productsXML.length);
      
      for (let i = 0; i < initialCount; i++) {
        const rows = extractProductRows(productsXML[i], featureMap, getProductFeatureCodes, validColumns, computedHeaders);
        initialRows.push(...rows);
      }

      setProducts(initialRows);
      setProcessedIndex(initialCount);
      setLoading(false);
      setCurrentPage(1); 

      // Sincronizar en segundo plano la matriz completa en csv_raw en la base de datos
      setTimeout(() => {
        loadAllForExport();
      }, 500);
    } catch (err) {
      console.error("Error processing catalog XML data matrix:", err);
      setError(err.message || "Error processing catalog information.");
      setLoading(false);
    }
  };

  const syncMatrixCsvToDb = async (rowsData, headers) => {
    try {
      if (!rowsData || rowsData.length === 0 || !headers) return;
      const csvString = Papa.unparse(rowsData, {
        columns: headers,
        delimiter: ";"
      });
      if (csvString) {
        await supabase
          .from('ClientsSERVEX_General_Procces')
          .update({ csv_raw: csvString })
          .eq('company_name', 'General_Procces');
      }
    } catch (err) {
      console.warn('⚠️ Error guardando csv_raw de la matriz:', err);
    }
  };

  const loadMoreProductsBuffer = async (countToLoad = 30) => {
    if (!processedXmlRef.current) return;
    const { productsXML, featureMap, getProductFeatureCodes, validColumns, computedHeaders } = processedXmlRef.current;
    
    if (processedIndex >= productsXML.length) return;

    const nextIndex = Math.min(processedIndex + countToLoad, productsXML.length);
    const newRows = [];

    for (let i = processedIndex; i < nextIndex; i++) {
      const rows = extractProductRows(productsXML[i], featureMap, getProductFeatureCodes, validColumns, computedHeaders);
      newRows.push(...rows);
    }

    setProducts(prev => [...prev, ...newRows]);
    setProcessedIndex(nextIndex);
  };

  // Carga bajo demanda al navegar a páginas posteriores
  useEffect(() => {
    const requiredItemCount = (currentPage + 1) * itemsPerPage;
    if (requiredItemCount >= products.length && processedIndex < totalProductsInXml) {
      loadMoreProductsBuffer(30);
    }
  }, [currentPage, products.length, processedIndex, totalProductsInXml]);

  const loadAllForExport = async () => {
    if (!processedXmlRef.current) return products;

    const { productsXML, featureMap, getProductFeatureCodes, validColumns, computedHeaders } = processedXmlRef.current;
    let allRows = [...products];

    if (processedIndex < productsXML.length) {
      setIsExportingFull(true);
      for (let i = processedIndex; i < productsXML.length; i++) {
        if (i % 200 === 0) await yieldToMainThread();
        const rows = extractProductRows(productsXML[i], featureMap, getProductFeatureCodes, validColumns, computedHeaders);
        allRows.push(...rows);
      }

      setProducts(allRows);
      setProcessedIndex(productsXML.length);
      setIsExportingFull(false);
    }

    // Almacena automáticamente la matriz convertida en la columna csv_raw
    syncMatrixCsvToDb(allRows, computedHeaders);

    return allRows;
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

  const exportToCSV = async () => {
    const fullProducts = await loadAllForExport();
    if (!fullProducts || fullProducts.length === 0) return;
    
    const csv = Papa.unparse(fullProducts, {
      columns: matrixHeaders,
      delimiter: ";"
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Universal_Catalog_Matrix_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = async () => {
    const fullProducts = await loadAllForExport();
    if (!fullProducts || fullProducts.length === 0) return;
    
    const worksheet = XLSX.utils.json_to_sheet(fullProducts, { header: matrixHeaders });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Catalog Data");
    
    XLSX.writeFile(workbook, `Universal_Catalog_Matrix_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh] min-h-[80vh] bg-transparent text-xs font-semibold text-slate-500 font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
        Retrieving master data matrix from Engine...
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
    <div className="h-[80vh] min-h-[80vh] flex flex-col justify-center items-center bg-transparent p-2 md:p-4 font-sans antialiased">
      <div className="w-full mx-auto">
        
        <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-[#464775]/30 shadow-lg shadow-[#464775]/5 overflow-hidden flex flex-col w-full">
          
          {/* Operations / Filters Header */}
          <div className="px-4 py-2.5 border-b border-[#464775]/15 bg-white/40 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">Export Data Client Matrix</span>
                {isExportingFull && (
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50/80 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse select-none">
                    <RefreshCw size={9} className="animate-spin text-indigo-600" />
                    Preparing ({products.length} / {totalProductsInXml})
                  </span>
                )}
              </div>
              <span className="text-[9.5px] text-slate-500 font-medium">
                Dynamic catalog matrix & client data injection engine
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="hidden sm:flex items-center gap-2 bg-[#464775]/5 border border-[#464775]/15 rounded-lg px-2.5 py-1 text-[10px] text-slate-600 font-medium select-none">
                <span>Products: <strong className="text-slate-800 font-bold">{stats.total}</strong></span>
                <span className="text-[#464775]/30">|</span>
                <span>Filtered: <strong className="text-slate-800 font-bold">{stats.filtered}</strong></span>
                <span className="text-[#464775]/30">|</span>
                <span>Avg Price: <strong className="text-[#464775] font-bold">${stats.avgPrice.toLocaleString()}</strong></span>
              </div>

              <div className="relative flex items-center flex-1 sm:flex-initial min-w-[120px]">
                <Search size={12} className="absolute left-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search matrix..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/70 border border-[#464775]/25 rounded-lg pl-7 pr-2.5 py-0.5 text-[10.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#464775] focus:bg-white transition-all w-full sm:w-[160px]"
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

              <button 
                onClick={() => setShowWarningModal(true)}
                type="button"
                className="p-1 bg-[#464775] hover:bg-[#3b3c63] text-white rounded-lg transition-all flex items-center justify-center shadow-2xs"
                title="Export current view to Excel"
              >
                <Download size={12} />
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
              <table className="table-fixed border-collapse text-left text-[10px] w-max min-w-[2000px]">
                <thead className="sticky top-0 z-20 bg-[#464775]/10 backdrop-blur-md border-b border-[#464775]/20">
                  <tr>
                    <th className="w-10 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-[#464775] bg-[#464775]/10 backdrop-blur-md sticky left-0 z-30 border-r border-b border-[#464775]/20 select-none">
                      #
                    </th>
                    {matrixHeaders.map((header, i) => (
                      <th
                        key={header + i}
                        className="px-3 py-2 text-[10px] font-bold text-[#464775] bg-[#464775]/10 backdrop-blur-md border-r border-b border-[#464775]/20 min-w-[150px] max-w-[260px] whitespace-nowrap truncate uppercase tracking-wider select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>{header || "(Empty)"}</span>
                          <Filter size={9} className="text-[#464775] opacity-50" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white/60 divide-y divide-[#464775]/10">
                  {paginatedProducts.map((p, idx) => {
                    const realIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                    
                    return (
                      <tr 
                        key={p["Model #"] || realIndex}
                        className="hover:bg-[#464775]/10 transition-colors group"
                      >
                        <td className="px-2 py-1.5 text-center text-[9.5px] font-bold text-[#464775] border-r border-[#464775]/10 sticky left-0 z-10 bg-white/90 group-hover:bg-[#464775]/10 border-b border-[#464775]/10 font-mono">
                          {realIndex}
                        </td>

                        {matrixHeaders.map((header, i) => {
                          let value = p[header];
                          if (header === "List Price") value = `$${(p["List Price"] || 0).toLocaleString()}`;
                          
                          const isHighlight = header === 'Model #' || header === 'List Price';
                          return (
                            <td key={header + i} className="p-0 text-slate-800 border-r border-b border-[#464775]/10 min-w-[150px] max-w-[260px]">
                              <div 
                                className={`px-3 py-1.5 font-sans text-[10px] whitespace-nowrap truncate ${isHighlight ? 'font-bold text-[#464775] font-mono' : 'font-medium text-slate-700'}`} 
                                title={value}
                              >
                                {value !== undefined && value !== null ? String(value) : ""}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="bg-white/40 backdrop-blur-md px-4 py-2 border-t border-[#464775]/15 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-medium text-slate-600 select-none">
            <div className="flex items-center gap-3">
              <span>Columns: <strong className="text-slate-800 font-bold">{matrixHeaders.length}</strong></span>
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

      {/* ── EXCEL SCALABILITY WARNING MODAL ── */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowWarningModal(false)}
          />
          <div className="relative bg-white w-[440px] rounded-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <span className="text-[14px] font-bold text-[#242424]">Export Matrix Data</span>
              <button onClick={() => setShowWarningModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-8 py-6 flex gap-4">
              <div className="p-2 h-fit rounded-full shrink-0 bg-[#464775]/10 text-[#464775]">
                <Download size={22} className="currentColor" />
              </div>
              <div className="flex-1 mt-1">
                <p className="text-[13px] text-[#616161] leading-relaxed mb-3">
                  Exporting dynamic XML catalog data matrix with <strong>{matrixHeaders.length} total columns</strong>.
                </p>
                <p className="text-[13px] text-[#616161] leading-relaxed">
                  Select your preferred download format for full multi-tenant compatibility.
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
                  exportToCSV();
                }}
                className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#464775] hover:bg-[#2B2C4B] rounded transition-all shadow-sm"
              >
                Download CSV
              </button>
              <button 
                onClick={() => {
                  setShowWarningModal(false);
                  exportToExcel();
                }}
                className="px-4 py-1.5 text-[12px] font-bold text-white bg-[#107C41] hover:bg-[#0B5C30] rounded transition-all shadow-sm"
              >
                Download Excel (.xlsx)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicDataMatrix;
