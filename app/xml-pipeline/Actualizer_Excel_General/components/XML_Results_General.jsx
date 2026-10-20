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
import { recordClientAction } from '@/app/lib/trackingClient';

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

  const recordTrackingEvent = async (eventType, description, title, details = {}) => {
    recordClientAction({
      companyName: 'General_Procces',
      eventType,
      title,
      description,
      details
    });
  };

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

    const createRow = (baseSku) => {
      const row = {};
      computedHeaders.forEach(h => row[h] = "");

      row["Model #"] = baseSku;
      row["List Price"] = basePrice;
      row["Weight"] = weight;
      row["Classic/ Premium"] = classification;
      row["Model Name"] = description;

      validColumns.forEach(col => {
        if (productOptionPrices[col.optCode] !== undefined) {
          row[col.label] = productOptionPrices[col.optCode];
        } else {
          row[col.label] = 0;
        }
      });

      return row;
    };

    return [createRow(sku)];
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

      // Registrar evento de apertura en seguimiento_client
      recordTrackingEvent(
        'OPEN_EXCEL_EXPORT',
        `El usuario abrió el componente para visualizar y exportar la matriz Excel (${productsXML.length} productos).`,
        'Apertura de Módulo de Exportación',
        { total_products: productsXML.length }
      );

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

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('catalogMatrixUpdated', {
            detail: { headers, csvRaw: csvString }
          }));
        }
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
    
    // Registrar evento de descarga CSV en seguimiento_client
    recordTrackingEvent(
      'DOWNLOAD_CSV',
      `El usuario descargó la matriz de catálogo en formato CSV (${fullProducts.length} productos).`,
      'Descarga de Matriz CSV',
      { total_products: fullProducts.length, format: 'csv' }
    );

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
    
    // Registrar evento de descarga Excel en seguimiento_client
    recordTrackingEvent(
      'DOWNLOAD_EXCEL',
      `El usuario descargó la matriz de catálogo en formato Excel (.xlsx) (${fullProducts.length} productos).`,
      'Descarga de Matriz Excel',
      { total_products: fullProducts.length, format: 'xlsx' }
    );

    const worksheet = XLSX.utils.json_to_sheet(fullProducts, { header: matrixHeaders });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Catalog Data");
    
    XLSX.writeFile(workbook, `Universal_Catalog_Matrix_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

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
          <span className="text-[11px] font-bold text-white tracking-wide uppercase">Export Data Client</span>
          <span className="text-[9px] font-medium text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
            {stats.filtered} items
          </span>
          {isExportingFull && (
            <span className="text-[9px] font-medium text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse select-none">
              <RefreshCw size={8} className="animate-spin text-white" />
              Preparing ({products.length} / {totalProductsInXml})
            </span>
          )}
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
            title="Recalculate matrix"
          >
            <RefreshCw size={12} className={loading ? "animate-spin text-white" : ""} />
          </button>

          <button 
            onClick={() => setShowWarningModal(true)}
            type="button"
            className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            title="Export to Excel"
          >
            <Download size={11} />
            <span>Excel</span>
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
                {matrixHeaders.map((header, i) => (
                  <th
                    key={header + i}
                    className="px-3 py-2 text-[10px] font-bold text-zinc-300 border-r border-b border-white/10 whitespace-nowrap truncate uppercase tracking-wider select-none bg-transparent"
                  >
                    <div className="flex items-center gap-1">
                      <span>{header || "(Empty)"}</span>
                      <Filter size={8} className="text-zinc-500" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-transparent divide-y divide-white/5">
              {paginatedProducts.map((p, idx) => {
                const realIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                
                return (
                  <tr 
                    key={`${p["Model #"] || 'prod'}-${realIndex}`}
                    className="hover:bg-white/[0.04] transition-colors group bg-transparent"
                  >
                    <td className="px-2 py-1.5 text-center text-[9.5px] font-bold text-zinc-400 border-r border-b border-white/5 sticky left-0 z-10 bg-zinc-900/80 group-hover:bg-zinc-800/80 font-mono select-none">
                      {realIndex}
                    </td>

                    {matrixHeaders.map((header, i) => {
                      let value = p[header];
                      if (header === "List Price") value = `$${(p["List Price"] || 0).toLocaleString()}`;
                      
                      const isHighlight = header === 'Model #' || header === 'List Price';
                      return (
                        <td key={header + i} className="p-0 border-r border-b border-white/5 bg-transparent">
                          <div 
                            className={`px-3 py-1.5 text-[10.5px] whitespace-nowrap truncate ${isHighlight ? 'font-bold text-white font-mono' : 'font-medium text-zinc-300'}`} 
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

      {/* ── Compact Transparent Footer ── */}
      <div className="w-full flex items-center justify-between py-1.5 px-1 bg-transparent border-t border-white/10 text-[10px] font-medium text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <span>Cols: <strong className="text-zinc-200">{matrixHeaders.length}</strong></span>
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
      </div>

      {/* ── EXCEL SCALABILITY WARNING MODAL ── */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setShowWarningModal(false)}
          />
          <div className="relative bg-[#09090b]/95 w-full max-w-md rounded-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] border border-white/15 animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-zinc-100 font-sans z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <span className="text-[14px] font-bold text-white tracking-tight">Export Matrix Data</span>
              <button onClick={() => setShowWarningModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Download size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[12.5px] text-zinc-300 leading-relaxed mb-2.5">
                  Exporting dynamic XML catalog data matrix with <strong className="text-white font-semibold">{matrixHeaders.length} total columns</strong>.
                </p>
                <p className="text-[11.5px] text-zinc-400 leading-relaxed">
                  Select your preferred download format for full multi-tenant compatibility.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-white/[0.02] flex justify-end gap-2.5 rounded-b-2xl border-t border-white/10">
              <button onClick={() => setShowWarningModal(false)} className="px-4 py-2 text-xs font-semibold text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer">
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowWarningModal(false);
                  exportToCSV();
                }}
                className="px-4 py-2 text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Download CSV
              </button>
              <button 
                onClick={() => {
                  setShowWarningModal(false);
                  exportToExcel();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer"
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
