'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileCode2,
  Table,
  CheckCircle2,
  Download,
  Database,
  Layers,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Papa from 'papaparse';

// Normalizador seguro de códigos de feature para matching relacional
const safeCleanKey = (k) => {
  if (!k) return '';
  return String(k)
    .replace(/^Feature_/, '')
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .trim();
};

function AiCatalogIngestionReport({
  summary = {},
  csvRaw = null,
  xmlRaw = null,
  getCatalogExcelColumns = null,
  onCommandSelect = null,
  time = '12:00',
  isDarkMode = true
}) {
  const [familySearch, setFamilySearch] = useState('');
  const [expandedFamilies, setExpandedFamilies] = useState(false);

  const DEFAULT_BASE_COLUMNS = [
    { code: 'Model #', label: 'Model #', desc: 'Unique product or SKU identifier', type: 'Alphanumeric' },
    { code: 'List Price', label: 'List Price', desc: 'Official catalog base list price', type: 'USD Currency' },
    { code: 'Weight', label: 'Weight', desc: 'Structural net weight of the unit', type: 'Decimal' },
    { code: 'Classic/ Premium', label: 'Classic/ Premium', desc: 'Product line and finish classification', type: 'Text' },
    { code: 'Model Name', label: 'Model Name', desc: 'Extended commercial name or description', type: 'Text' }
  ];

  // 1. Columnas y Matriz generadas determinísticamente a partir del XML
  const { baseColumns, commercialColumns, totalColumns } = useMemo(() => {
    // 0. Fast path: Si el backend ya calculó las columnas determinísticamente desde el XML
    if (summary?.base_columns && Array.isArray(summary.base_columns)) {
      const comm = summary.commercial_columns || summary.commercial_features || [];
      return {
        baseColumns: summary.base_columns,
        commercialColumns: comm,
        totalColumns: summary.total_columns || (summary.base_columns.length + comm.length)
      };
    }

    // 1. Si está disponible la función extractora getCatalogExcelColumns
    if (typeof getCatalogExcelColumns === 'function') {
      const res = getCatalogExcelColumns(summary, csvRaw, xmlRaw);
      if (res && (res.baseColumns || res.commercialColumns)) {
        const base = res.baseColumns || DEFAULT_BASE_COLUMNS;
        const comm = res.commercialColumns || [];
        return {
          baseColumns: base,
          commercialColumns: comm,
          totalColumns: typeof res.totalColumns === 'number'
            ? res.totalColumns
            : (base.length + comm.length)
        };
      }
    }

    // 2. Extracción heurística de respaldo a partir de summary
    const commCols = (summary?.commercial_columns || summary?.commercial_features || summary?.commercial_options_list || []).map((f, i) => ({
      code: f.code || `OPC-${i + 1}`,
      label: f.label || f.description || f.name || `Option ${f.code}`,
      price: f.price || '0.00',
      featureName: f.featureName || f.feature_name || f.code
    }));

    return {
      baseColumns: DEFAULT_BASE_COLUMNS,
      commercialColumns: commCols,
      totalColumns: DEFAULT_BASE_COLUMNS.length + commCols.length
    };
  }, [summary, csvRaw, xmlRaw, getCatalogExcelColumns]);

  // 2. Familias base incluidas a $0 USD
  const baseFeatures = useMemo(() => {
    if (Array.isArray(summary?.base_families_zero_cost) && summary.base_families_zero_cost.length > 0) {
      return summary.base_families_zero_cost;
    }
    if (Array.isArray(summary?.features_list) && summary.features_list.length > 0) {
      return summary.features_list;
    }
    if (Array.isArray(summary?.base_features) && summary.base_features.length > 0) {
      return summary.base_features;
    }
    const combined = (summary?.physical_components_list || []).concat(summary?.finishes_list || []);
    if (combined.length > 0) return combined;
    if (Array.isArray(summary?.features) && summary.features.length > 0) {
      return summary.features;
    }
    return [];
  }, [summary]);

  const filteredBaseFeatures = useMemo(() => {
    if (!familySearch.trim()) return baseFeatures;
    const q = familySearch.toLowerCase().trim();
    return baseFeatures.filter(f =>
      String(f.code || f.feature_code || '').toLowerCase().includes(q) ||
      String(f.name || f.feature_name || '').toLowerCase().includes(q) ||
      String(f.sub_type || '').toLowerCase().includes(q)
    );
  }, [baseFeatures, familySearch]);

  const displayedFeatures = useMemo(() => {
    if (familySearch.trim()) {
      return filteredBaseFeatures.slice(0, 50);
    }
    return expandedFamilies ? filteredBaseFeatures.slice(0, 50) : filteredBaseFeatures.slice(0, 6);
  }, [filteredBaseFeatures, expandedFamilies, familySearch]);


  const totalSkus = useMemo(() => {
    const raw =
      typeof summary?.total_skus === 'number'
        ? summary.total_skus
        : typeof summary?.total_products === 'number'
          ? summary.total_products
          : typeof summary?.product_count === 'number'
            ? summary.product_count
            : Array.isArray(summary?.products)
              ? summary.products.length
              : typeof summary?.products === 'number'
                ? summary.products
                : Number(summary?.total_skus || summary?.total_products || 0);
    return (Number.isFinite(raw) ? raw : 0).toLocaleString();
  }, [summary]);

  const totalFeatures = useMemo(() => {
    const raw =
      typeof summary?.total_features === 'number'
        ? summary.total_features
        : typeof summary?.features_count === 'number'
          ? summary.features_count
          : Array.isArray(summary?.features)
            ? summary.features.length
            : typeof summary?.features === 'number'
              ? summary.features
              : Number(summary?.total_features || summary?.features_count || 0);
    return (Number.isFinite(raw) ? raw : 0).toLocaleString();
  }, [summary]);

  const totalOptions = useMemo(() => {
    const raw =
      typeof summary?.total_options === 'number'
        ? summary.total_options
        : typeof summary?.options_count === 'number'
          ? summary.options_count
          : Array.isArray(summary?.options)
            ? summary.options.length
            : typeof summary?.options === 'number'
              ? summary.options
              : Number(summary?.total_options || summary?.options_count || 0);
    return (Number.isFinite(raw) ? raw : 0).toLocaleString();
  }, [summary]);

  const integrity = summary?.integrity || '100% CET';
  const sampleProduct = summary?.sample_product_example;

  return (
    <div
      style={{ transform: 'translateZ(0)', contain: 'content' }}
      className={`mt-3 space-y-4 font-sans text-left text-[13px] md:text-[13.5px] leading-relaxed rounded-none ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}
    >
      {/* ── PROCESO 1: MÉTRICAS E INTEGRIDAD ── */}
      <motion.div
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 ${isDarkMode ? 'bg-[#09090b]/80 border-white/10 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/90 border-slate-200/90 text-gray-800 shadow-sm'} backdrop-blur-md rounded-none border transition-colors`}
      >
        {/* Cards internas con esquinas rectas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-none">
            <div className={`p-2.5 rounded-none ${isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20' : 'bg-white/90 border-slate-200/80 hover:bg-white hover:border-slate-300'} border transition-all shadow-2xs`}>
              <span className={`text-[9px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} uppercase tracking-wider block`}>
                Indexed Base SKUs
              </span>
              <span className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} font-mono block mt-0.5`}>
                {totalSkus}
              </span>
              <span className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium block`}>
                Unique product models
              </span>
            </div>

            <div className={`p-2.5 rounded-none ${isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20' : 'bg-white/90 border-slate-200/80 hover:bg-white hover:border-slate-300'} border transition-all shadow-2xs`}>
              <span className={`text-[9px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} uppercase tracking-wider block`}>
                Structural Features
              </span>
              <span className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} font-mono block mt-0.5`}>
                {totalFeatures}
              </span>
              <span className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium block`}>
                Configuration families
              </span>
            </div>

            <div className={`p-2.5 rounded-none ${isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20' : 'bg-white/90 border-slate-200/80 hover:bg-white hover:border-slate-300'} border transition-all shadow-2xs`}>
              <span className={`text-[9px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} uppercase tracking-wider block`}>
                Commercial Options
              </span>
              <span className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} font-mono block mt-0.5`}>
                {totalOptions}
              </span>
              <span className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium block`}>
                Parsed options and finishes
              </span>
            </div>

            <div className={`p-2.5 rounded-none ${isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20' : 'bg-white/90 border-slate-200/80 hover:bg-white hover:border-slate-300'} border transition-all shadow-2xs`}>
              <span className={`text-[9px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} uppercase tracking-wider block`}>
                Data Integrity
              </span>
              <span className={`text-base font-extrabold ${isDarkMode ? 'text-white font-bold' : 'text-slate-900'} font-mono block mt-0.5`}>
                {integrity}
              </span>
              <span className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium block`}>
                Validated CET Designer schema
              </span>
            </div>
          </div>
        </motion.div>

      {/* ── PROCESO 2: ESTRUCTURA DETERMINISTA DE LA MATRIZ EXCEL ── */}
      <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 ${isDarkMode ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/85 border-slate-200/90 text-gray-800 shadow-sm'} backdrop-blur-md rounded-none border space-y-3 transition-colors`}
        >
          {/* Mensaje Explicativo de la IA */}
          <div className="space-y-1 rounded-none">
            <h4 className={`text-[13.5px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-1.5`}>
              <span>2. Excel Matrix Column Structure (.xlsx / .csv)</span>
            </h4>
            <p className={`text-[13px] ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'} leading-relaxed`}>
              Based on the catalog destructuring and the records stored in <code className={`px-1.5 py-0.5 rounded-none ${isDarkMode ? 'bg-white/10 text-zinc-100 border-white/20' : 'bg-slate-100 text-slate-800 border-slate-200'} font-mono text-[12px] font-semibold border`}>csv_raw</code>, I have calculated the deterministic matrix of <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalColumns} columns</strong> used by the engine to build the file. It consists of <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{baseColumns.length} fixed fields</strong> for the base product and <strong className={`font-semibold ${isDarkMode ? 'text-white font-bold' : 'text-slate-900'}`}>{commercialColumns.length} dynamic active commercial surcharge columns</strong>:
            </p>
          </div>

          <div className={`flex items-center justify-between gap-2 border-t border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200/80'} py-2 rounded-none`}>
            <span className={`text-[11px] font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'} uppercase tracking-wider`}>
              Columns in Excel Matrix
            </span>
            <span className={`px-2.5 py-0.5 rounded-none ${isDarkMode ? 'bg-white text-zinc-950 font-black' : 'bg-slate-900 text-white font-bold'} text-[9.5px] font-mono shadow-2xs`}>
              {totalColumns} total columns
            </span>
          </div>

          {/* Columnas Base Fijas del Modelo */}
          <div className="space-y-1.5 rounded-none">
            <div className="flex items-center justify-between text-[10px]">
              <div className={`flex items-center gap-1 font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'} uppercase tracking-wider`}>
                <Layers size={12} className={isDarkMode ? 'text-zinc-300' : 'text-slate-700'} />
                <span>Base Model Columns (Fixed Product Fields)</span>
              </div>
              <span className={`text-[9px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium`}>
                {baseColumns.length} fixed columns
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 rounded-none">
              {baseColumns.map((col, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-none ${isDarkMode ? 'bg-white/[0.03] border-white/10 hover:border-white/25' : 'bg-slate-50/80 border-slate-200 hover:border-slate-400'} border transition-all flex flex-col justify-between gap-1 shadow-2xs`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`font-mono font-bold text-[10px] ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>
                      {col.label}
                    </span>
                    <span className={`text-[8px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'} shrink-0`}>
                      Col #{idx + 1}
                    </span>
                  </div>
                  <p className={`text-[9px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'} leading-tight truncate`}>
                    {col.desc}
                  </p>
                  <span className={`text-[8px] font-semibold ${isDarkMode ? 'text-zinc-400 border-white/10' : 'text-slate-500 border-slate-100'} pt-0.5 border-t block truncate`}>
                    {col.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tira de Vista Previa de Encabezados (Excel / CSV) */}
          <div className={`p-2.5 rounded-none ${isDarkMode ? 'bg-black/50 border-white/15' : 'bg-white/90 border-slate-200/90'} border space-y-1.5 shadow-2xs`}>
            <div className={`flex items-center justify-between text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'} font-bold uppercase tracking-wider`}>
              <span>Header Row Preview (Excel / CSV)</span>
              <span className={`font-mono ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>Row 1 · {totalColumns} Columns</span>
            </div>
            <div className={`flex items-center gap-1 overflow-x-auto pb-1 ${isDarkMode ? 'scrollbar-thumb-zinc-700' : 'scrollbar-thumb-slate-300'} scrollbar-thin text-[9px] font-mono font-bold rounded-none`}>
              {baseColumns.map((c, i) => (
                <span key={i} className={`px-2 py-1 rounded-none ${isDarkMode ? 'bg-white/10 border-white/15 text-zinc-200' : 'bg-white border-slate-200 text-slate-700'} border shrink-0 shadow-2xs`}>
                  {c.label}
                </span>
              ))}
              {commercialColumns.map((c, i) => (
                <span key={`comm-${i}`} className={`px-2 py-1 rounded-none ${isDarkMode ? 'bg-white text-zinc-950 border-white' : 'bg-slate-900 text-white border-slate-900'} border shrink-0 shadow-2xs`}>
                  {c.label}
                </span>
              ))}
            </div>
          </div>
      </motion.div>

      {/* ── PROCESO 3: FAMILIAS Y ACABADOS BASE ($0 USD) ── */}
      {baseFeatures.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 ${isDarkMode ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/85 border-slate-200/90 text-gray-800 shadow-sm'} backdrop-blur-md rounded-none border space-y-3 transition-colors`}
        >
          {/* Mensaje Explicativo de la IA */}
          <div className="space-y-1 rounded-none">
            <h4 className={`text-[13.5px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-1.5`}>
              <span>3. Base Families &amp; Finishes Included at Standard Cost ($0 USD)</span>
            </h4>
            <p className={`text-[13px] ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'} leading-relaxed`}>
              In the catalog I identified <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{baseFeatures.length} base families</strong> (such as fabrics, paints, laminates, and structural options) included at the standard cost of <strong className={`font-semibold ${isDarkMode ? 'text-white font-bold' : 'text-slate-900'}`}>$0 USD</strong>. CET designers can configure these options freely without increasing the product list price:
            </p>
          </div>

          <div className={`flex items-center justify-between gap-2 border-t border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200/80'} py-2 rounded-none`}>
            <span className={`text-[11px] font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'} uppercase tracking-wider`}>
              Base Families &amp; Finishes
            </span>
            <span className={`px-2.5 py-0.5 rounded-none ${isDarkMode ? 'bg-white/10 text-zinc-200' : 'bg-slate-100 text-slate-700'} font-mono font-bold text-[9.5px]`}>
              {baseFeatures.length} base families
            </span>
          </div>

          {/* Buscador de familias base */}
          <div className="flex items-center gap-2 rounded-none">
            <div className="relative flex-1">
              <Search size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={familySearch}
                onChange={(e) => setFamilySearch(e.target.value)}
                placeholder="Search base family or finish (e.g., AE, CASEBODY, TOTE, -MB)..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-none ${isDarkMode ? 'bg-white/5 border-white/15 text-zinc-100 placeholder-zinc-500 focus:border-white/40' : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:border-slate-800'} border text-[10.5px] focus:outline-none transition-colors shadow-2xs`}
              />
            </div>
            {baseFeatures.length > 6 && !familySearch && (
              <button
                type="button"
                onClick={() => setExpandedFamilies(prev => !prev)}
                className={`px-2.5 py-1.5 rounded-none border ${isDarkMode ? 'border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'} text-[10.5px] font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-2xs`}
              >
                {expandedFamilies ? (
                  <>
                    <ChevronUp size={13} />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} />
                    <span>View all ({baseFeatures.length})</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Cards internas de familias */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto ${isDarkMode ? 'scrollbar-thumb-zinc-700' : 'scrollbar-thumb-slate-300'} scrollbar-thin p-0.5 rounded-none`}>
            {displayedFeatures.map((item, idx) => {
              const code = item.code || item.feature_code || 'CODE';
              const name = item.name || item.feature_name || code;
              const optsCount = item.options_count || item.total_options || (Array.isArray(item.options) ? item.options.length : null);
              const category = item.sub_type || item.feature_name || 'Fabric / Color / Finish';

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-none ${isDarkMode ? 'bg-white/[0.04] border-white/10 hover:border-white/25 text-zinc-200' : 'bg-white border-slate-200 hover:border-slate-400 text-slate-800'} border transition-all flex flex-col justify-between gap-1 shadow-2xs group`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`font-mono font-bold text-[10px] ${isDarkMode ? 'text-zinc-200 bg-white/10 border-white/15' : 'text-slate-800 bg-slate-100 border-slate-200'} px-1.5 py-0.5 rounded-none border truncate`}>
                      {code}
                    </span>
                    {optsCount ? (
                      <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded-none ${isDarkMode ? 'bg-white/10 text-zinc-300' : 'bg-slate-100 text-slate-600'} shrink-0`}>
                        {optsCount} {optsCount === 1 ? 'option' : 'options'}
                      </span>
                    ) : (
                      <span className={`text-[8px] font-mono font-semibold px-1 py-0.2 rounded-none ${isDarkMode ? 'bg-white/5 text-zinc-400' : 'bg-slate-100 text-slate-500'} shrink-0`}>
                        Base $0
                      </span>
                    )}
                  </div>

                  <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'} line-clamp-1`} title={name}>
                    {name}
                  </p>

                  <div className={`flex items-center gap-1 text-[8.5px] ${isDarkMode ? 'text-zinc-500 border-white/10' : 'text-slate-400 border-slate-100'} font-medium truncate pt-1 border-t`}>
                    <span className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-semibold`}>Type:</span>
                    <span className="truncate">{category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── PROCESO 4: AUDITORÍA DE PRODUCTO MODELO EN MEMORIA ── */}
      {sampleProduct && (
        <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 ${isDarkMode ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/85 border-slate-200/90 text-gray-800 shadow-sm'} backdrop-blur-md rounded-none border space-y-3 transition-colors`}
        >
          {/* Mensaje Explicativo de la IA */}
          <div className="space-y-1 rounded-none">
            <h4 className={`text-[13.5px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-1.5`}>
              <span>4. Sample Product Structural Audit (In-Memory Sample)</span>
            </h4>
            <p className={`text-[13px] ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'} leading-relaxed`}>
              To validate that relational links work properly, I selected a real sample from memory: SKU <strong className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sampleProduct.sku}</strong> (Base Price: <strong className={`font-mono font-bold ${isDarkMode ? 'text-white font-bold' : 'text-slate-900'}`}>${sampleProduct.base_price || '0'} USD</strong>). Here you can verify how its child features and options are linked:
            </p>
          </div>

          <div className={`flex items-center justify-between gap-2 border-t border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200/80'} py-2 rounded-none`}>
            <span className={`text-[11px] font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'} uppercase tracking-wider`}>
              In-Memory Product Sample
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-none ${isDarkMode ? 'bg-white text-zinc-950' : 'bg-slate-900 text-white'} text-[10px] font-mono font-bold`}>
                SKU: {sampleProduct.sku}
              </span>
              <span className={`px-2 py-0.5 rounded-none ${isDarkMode ? 'bg-white/10 text-white border-white/20' : 'bg-[#18181b]/10 text-[#18181b] border-[#18181b]/20'} border text-[10px] font-mono font-bold`}>
                Base Price: ${sampleProduct.base_price || '0'}
              </span>
            </div>
          </div>

          <p className={`text-[11px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'} font-medium leading-relaxed`}>
            {sampleProduct.description || 'Sample product destructured with its dependencies in active memory.'}
          </p>

          {sampleProduct.features && sampleProduct.features.length > 0 && (
            <div className="space-y-1.5 pt-1 rounded-none">
              <span className={`text-[9.5px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} uppercase tracking-wider block`}>
                Product Linked Features &amp; Options Tree:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-none">
                {sampleProduct.features.map((feat, featIdx) => (
                  <div
                    key={featIdx}
                    className={`p-2 rounded-none ${isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50/80 border-slate-200'} border space-y-1 shadow-2xs`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`font-mono font-bold text-[10px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {feat.feature_code}
                      </span>
                      <span className={`text-[8.5px] font-mono ${isDarkMode ? 'text-zinc-400 bg-white/10 border-white/15' : 'text-slate-500 bg-white border-slate-200'} font-medium px-1.5 py-0.2 rounded-none border`}>
                        {feat.total_options || feat.options?.length || 0} options
                      </span>
                    </div>
                    <p className={`text-[9.5px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'} font-medium truncate`} title={feat.feature_name}>
                      {feat.feature_name}
                    </p>
                    {feat.options && feat.options.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5 rounded-none">
                        {feat.options.map((opt, optIdx) => {
                          const optCode = typeof opt === 'object' && opt !== null ? (opt.code || opt.option_code || '') : String(opt || '');
                          const optPrice = typeof opt === 'object' && opt !== null ? Number(opt.current_price || opt.price || 0) : 0;
                          const optDesc = typeof opt === 'object' && opt !== null ? (opt.description || optCode) : optCode;
                          return (
                            <span
                              key={optIdx}
                              className={`text-[9px] font-mono px-1.5 py-0.2 rounded-none ${isDarkMode ? 'bg-white/10 text-zinc-200 border-white/15' : 'bg-white text-slate-700 border-slate-200'} border shadow-2xs`}
                              title={`${optCode} - ${optDesc}`}
                            >
                              {optCode}
                              {optPrice > 0 && (
                                <span className={`font-bold ml-1 ${isDarkMode ? 'text-white font-bold' : 'text-[#18181b] font-bold'}`}>
                                  +${optPrice}
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── CONCLUSIÓN Y BARRA DE ACCIÓN RÁPIDA DE LA IA ── */}
      <div className={`p-4 ${isDarkMode ? 'bg-[#09090b]/60 border-white/10 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/80 border-slate-200/90 text-gray-800 shadow-sm'} backdrop-blur-2xl rounded-none border space-y-3 transition-colors`}>
        <p className={`text-[13px] ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'} leading-relaxed`}>
          The master catalog is ready in memory to receive price update instructions, feature queries, or export matrix generation:
        </p>

        {/* Barra de Acciones Rápidas con Botones en Blanco/Grises/Negro */}
        <div className="flex items-center gap-2 flex-wrap pt-0.5 rounded-none">
          <button
            type="button"
            onClick={() => onCommandSelect && onCommandSelect('/exportCETcsv')}
            className={`px-3 py-1.5 rounded-none ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'} border font-semibold shadow-2xs flex items-center gap-1.5 text-xs transition-all hover:scale-[1.02] cursor-pointer`}
          >
            <Download size={13} />
            <span>/exportCETcsv</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AiCatalogIngestionReport);
