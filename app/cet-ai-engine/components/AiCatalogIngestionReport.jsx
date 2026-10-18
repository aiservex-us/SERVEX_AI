'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode2,
  Table,
  Tag,
  Layers,
  Palette,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  Download,
  ArrowRight,
  Filter,
  Check,
  Cpu,
  Database
} from 'lucide-react';

function AiCatalogIngestionReport({
  summary,
  csvRaw,
  xmlRaw,
  getCatalogExcelColumns,
  onCommandSelect,
  time,
  isDarkMode = true
}) {
  const [familySearch, setFamilySearch] = useState('');
  const [expandedFamilies, setExpandedFamilies] = useState(false);
  const [expandedCommercial, setExpandedCommercial] = useState(false);

  // Columnas deterministas reales (0ms fast path si el backend ya envió las columnas calculadas)
  const { baseColumns, commercialColumns, totalColumns } = useMemo(() => {
    if (summary?.base_columns && Array.isArray(summary.base_columns)) {
      return {
        baseColumns: summary.base_columns,
        commercialColumns: summary.commercial_columns || [],
        totalColumns: summary.total_columns || (summary.base_columns.length + (summary.commercial_columns?.length || 0))
      };
    }
    if (typeof getCatalogExcelColumns === 'function') {
      return getCatalogExcelColumns(summary, csvRaw, xmlRaw);
    }
    return {
      baseColumns: [
        { code: "Model #", label: "Model #", type: "Identificador SKU", desc: "Código de modelo del producto base" },
        { code: "List Price", label: "List Price", type: "Precio Base (USD)", desc: "Precio de lista estándar sin recargos" },
        { code: "Weight", label: "Weight", type: "Especificación", desc: "Peso físico del producto (N/A si no aplica)" },
        { code: "Classic/ Premium", label: "Classic/ Premium", type: "Clasificación", desc: "Gama o categoría de producto" },
        { code: "Model Name", label: "Model Name", type: "Descripción", desc: "Nombre y descripción comercial del modelo" }
      ],
      commercialColumns: summary?.commercial_columns || [],
      totalColumns: 5 + (summary?.commercial_columns?.length || 0)
    };
  }, [summary, csvRaw, xmlRaw, getCatalogExcelColumns]);

  // Virtualización ligera para acelerar el renderizado inicial de columnas comerciales
  const displayedCommercialColumns = useMemo(() => {
    if (expandedCommercial || commercialColumns.length <= 8) {
      return commercialColumns;
    }
    return commercialColumns.slice(0, 8);
  }, [commercialColumns, expandedCommercial]);

  const baseFeatures = useMemo(() => {
    if (summary?.features_list && summary.features_list.length > 0) {
      return summary.features_list;
    }
    return (summary?.physical_components_list || []).concat(summary?.finishes_list || []);
  }, [summary]);

  const filteredBaseFeatures = useMemo(() => {
    if (!familySearch.trim()) return baseFeatures;
    const q = familySearch.toLowerCase();
    return baseFeatures.filter(item => {
      const code = (item.code || item.feature_code || '').toLowerCase();
      const name = (item.name || item.feature_name || '').toLowerCase();
      const subType = (item.sub_type || '').toLowerCase();
      return code.includes(q) || name.includes(q) || subType.includes(q);
    });
  }, [baseFeatures, familySearch]);

  const displayedFeatures = useMemo(() => {
    if (expandedFamilies || familySearch.trim()) {
      return filteredBaseFeatures;
    }
    return filteredBaseFeatures.slice(0, 6);
  }, [filteredBaseFeatures, expandedFamilies, familySearch]);

  const catalogName = summary?.catalog_name || summary?.file_name || 'Catálogo CET';
  const fileSizeKb = summary?.file_size_kb || 0;
  const totalSkus = summary?.total_products?.toLocaleString() || summary?.base_skus || 0;
  const totalFeatures = summary?.total_features?.toLocaleString() || summary?.features_count || 0;
  const totalOptions = summary?.total_options?.toLocaleString() || summary?.options || 0;
  const integrity = summary?.integrity || '100% CET';
  const sampleProduct = summary?.sample_product_example;

  return (
    <div
      style={{ transform: 'translateZ(0)', contain: 'content' }}
      className={`mt-3 space-y-4 font-sans text-left text-[13px] md:text-[13.5px] leading-relaxed ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}
    >
      {/* ── PROCESO 1: MÉTRICAS E INTEGRIDAD ── */}
      <motion.div
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 ${isDarkMode ? 'bg-[#09090b]/80 border-white/10 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/90 border-slate-200/90 text-gray-800 shadow-sm'} backdrop-blur-md rounded-2xl border transition-colors`}
      >
        {/* Cards internas con fondos sólidos neutros */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20' : 'bg-white/90 border-slate-200/80 hover:bg-white hover:border-slate-300'} border transition-all shadow-2xs`}>
              <span className={`text-[9px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} uppercase tracking-wider block`}>
                SKUs Base Indexados
              </span>
              <span className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} font-mono block mt-0.5`}>
                {totalSkus}
              </span>
              <span className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium block`}>
                Modelos de producto únicos
              </span>
            </div>

            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20' : 'bg-white/90 border-slate-200/80 hover:bg-white hover:border-slate-300'} border transition-all shadow-2xs`}>
              <span className={`text-[9px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} uppercase tracking-wider block`}>
                Features Estructurales
              </span>
              <span className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} font-mono block mt-0.5`}>
                {totalFeatures}
              </span>
              <span className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium block`}>
                Familias de configuración
              </span>
            </div>

            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20' : 'bg-white/90 border-slate-200/80 hover:bg-white hover:border-slate-300'} border transition-all shadow-2xs`}>
              <span className={`text-[9px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} uppercase tracking-wider block`}>
                Opciones Comerciales
              </span>
              <span className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'} font-mono block mt-0.5`}>
                {totalOptions}
              </span>
              <span className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium block`}>
                Opciones y acabados parseados
              </span>
            </div>

            <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20' : 'bg-white/90 border-slate-200/80 hover:bg-white hover:border-slate-300'} border transition-all shadow-2xs`}>
              <span className={`text-[9px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} uppercase tracking-wider block`}>
                Integridad de Datos
              </span>
              <span className={`text-base font-extrabold ${isDarkMode ? 'text-white font-bold' : 'text-slate-900'} font-mono block mt-0.5`}>
                {integrity}
              </span>
              <span className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium block`}>
                Esquema CET Designer validado
              </span>
            </div>
          </div>
        </motion.div>

      {/* ── PROCESO 2: ESTRUCTURA DETERMINISTA DE LA MATRIZ EXCEL ── */}
      <motion.div
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 ${isDarkMode ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/85 border-slate-200/90 text-gray-800 shadow-sm'} backdrop-blur-md rounded-2xl border space-y-3 transition-colors`}
        >
          {/* Mensaje Explicativo de la IA */}
          <div className="space-y-1">
            <h4 className={`text-[13.5px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-1.5`}>
              <span>2. Estructura de Columnas de la Matriz Excel (.xlsx / .csv)</span>
            </h4>
            <p className={`text-[13px] ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'} leading-relaxed`}>
              A partir de la desestructuración del catálogo y los registros almacenados en <code className={`px-1.5 py-0.5 rounded-md ${isDarkMode ? 'bg-white/10 text-zinc-100 border-white/20' : 'bg-slate-100 text-slate-800 border-slate-200'} font-mono text-[12px] font-semibold border`}>csv_raw</code>, he calculado la matriz determinista de <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalColumns} columnas</strong> con las que el motor construye el archivo. Se compone de <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{baseColumns.length} campos fijos</strong> del producto base y <strong className={`font-semibold ${isDarkMode ? 'text-white font-bold' : 'text-slate-900'}`}>{commercialColumns.length} columnas dinámicas de recargo comercial activo</strong>:
            </p>
          </div>

          <div className={`flex items-center justify-between gap-2 border-t border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200/80'} py-2`}>
            <span className={`text-[11px] font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'} uppercase tracking-wider`}>
              Columnas en Matriz Excel
            </span>
            <span className={`px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-white text-zinc-950 font-black' : 'bg-slate-900 text-white font-bold'} text-[9.5px] font-mono shadow-2xs`}>
              {totalColumns} columnas en total
            </span>
          </div>

          {/* Opciones Comerciales Dinámicas (Recargos) con Cards Originales */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <div className={`flex items-center gap-1 font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'} uppercase tracking-wider`}>
                <Tag size={12} className={isDarkMode ? 'text-zinc-300' : 'text-slate-700'} />
                <span>Columnas Dinámicas de Opciones Comerciales (Recargos en Excel)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-white/10 text-white border-white/20' : 'bg-[#18181b]/10 text-[#18181b] border-[#18181b]/20'} font-mono font-bold text-[9px] border`}>
                  {commercialColumns.length} columnas con recargo activo
                </span>
                {commercialColumns.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setExpandedCommercial(prev => !prev)}
                    className={`px-2 py-0.5 rounded-lg border ${isDarkMode ? 'border-white/15 bg-white/10 hover:bg-white/20 text-zinc-200' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'} text-[9px] font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer shadow-2xs`}
                  >
                    {expandedCommercial ? (
                      <>
                        <ChevronUp size={11} />
                        <span>Mostrar menos</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown size={11} />
                        <span>Ver todas ({commercialColumns.length})</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {commercialColumns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {displayedCommercialColumns.map((col, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.07]' : 'bg-white border-slate-200 hover:border-slate-400'} border hover:shadow-xs transition-all flex flex-col justify-between gap-1 shadow-2xs`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`font-mono font-bold text-[10.5px] ${isDarkMode ? 'bg-white text-zinc-950' : 'bg-slate-900 text-white'} px-2 py-0.5 rounded-md shadow-2xs truncate`}>
                        {col.code}
                      </span>
                      <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md ${isDarkMode ? 'bg-white/10 text-white border-white/20' : 'bg-[#18181b]/10 text-[#18181b] border-[#18181b]/20'} border shrink-0`}>
                        {col.price && col.price !== '0' && col.price !== 'Recargo' ? `+$${col.price} USD` : '+$Recargo USD'}
                      </span>
                    </div>

                    <div className="my-1">
                      <p className={`text-[11px] font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'} leading-snug line-clamp-2`} title={col.label}>
                        {col.label}
                      </p>
                      <span className={`text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-semibold block mt-0.5`}>
                        Columna en Excel #{baseColumns.length + idx + 1}
                      </span>
                    </div>

                    <div className={`pt-1.5 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-100'} flex items-center justify-between text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium`}>
                      <span className={`truncate ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`} title={col.featureName}>
                        {col.featureName || 'Opción Comercial'}
                      </span>
                      <span className={`${isDarkMode ? 'text-zinc-200' : 'text-[#18181b]'} font-bold shrink-0 ml-1`}>
                        Activa en Matriz
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-white/[0.04] border-white/10 text-zinc-300' : 'bg-white border-slate-200 text-slate-500'} border text-[11px] font-medium flex items-center gap-2 shadow-2xs`}>
                <CheckCircle2 size={14} className={`${isDarkMode ? 'text-white' : 'text-[#18181b]'} shrink-0`} />
                <span>No se detectaron recargos adicionales en este catálogo. Todas las opciones y acabados están incluidos al costo base estándar ($0 USD).</span>
              </div>
            )}
          </div>

          {/* Columnas Base Fijas del Modelo */}
          <div className={`space-y-1.5 pt-2 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200/80'}`}>
            <div className="flex items-center justify-between text-[10px]">
              <div className={`flex items-center gap-1 font-bold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'} uppercase tracking-wider`}>
                <Layers size={12} className={isDarkMode ? 'text-zinc-300' : 'text-slate-700'} />
                <span>Columnas Base del Modelo (Campos Fijos del Producto)</span>
              </div>
              <span className={`text-[9px] font-mono ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium`}>
                {baseColumns.length} columnas fijas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
              {baseColumns.map((col, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/[0.03] border-white/10 hover:border-white/25' : 'bg-slate-50/80 border-slate-200 hover:border-slate-400'} border transition-all flex flex-col justify-between gap-1 shadow-2xs`}
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
          <div className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-black/50 border-white/15' : 'bg-white/90 border-slate-200/90'} border space-y-1.5 shadow-2xs`}>
            <div className={`flex items-center justify-between text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'} font-bold uppercase tracking-wider`}>
              <span>Vista Previa de Fila de Encabezados (Excel / CSV)</span>
              <span className={`font-mono ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>Fila 1 · {totalColumns} Columnas</span>
            </div>
            <div className={`flex items-center gap-1 overflow-x-auto pb-1 ${isDarkMode ? 'scrollbar-thumb-zinc-700' : 'scrollbar-thumb-slate-300'} scrollbar-thin text-[9px] font-mono font-bold`}>
              {baseColumns.map((c, i) => (
                <span key={i} className={`px-2 py-1 rounded ${isDarkMode ? 'bg-white/10 border-white/15 text-zinc-200' : 'bg-white border-slate-200 text-slate-700'} border shrink-0 shadow-2xs`}>
                  {c.label}
                </span>
              ))}
              {commercialColumns.map((c, i) => (
                <span key={`comm-${i}`} className={`px-2 py-1 rounded ${isDarkMode ? 'bg-white text-zinc-950 border-white' : 'bg-slate-900 text-white border-slate-900'} border shrink-0 shadow-2xs`}>
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
          className={`p-4 ${isDarkMode ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/85 border-slate-200/90 text-gray-800 shadow-sm'} backdrop-blur-md rounded-2xl border space-y-3 transition-colors`}
        >
          {/* Mensaje Explicativo de la IA */}
          <div className="space-y-1">
            <h4 className={`text-[13.5px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-1.5`}>
              <span>3. Familias y Acabados Base Incluidos a Costo Estándar ($0 USD)</span>
            </h4>
            <p className={`text-[13px] ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'} leading-relaxed`}>
              En el catálogo identifiqué <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{baseFeatures.length} familias base</strong> (como telas, pinturas, laminados y opciones estructurales) que están incluidas al costo estándar de <strong className={`font-semibold ${isDarkMode ? 'text-white font-bold' : 'text-slate-900'}`}>$0 USD</strong>. Los diseñadores de CET pueden configurar estas opciones libremente sin incrementar el precio de lista del producto:
            </p>
          </div>

          <div className={`flex items-center justify-between gap-2 border-t border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200/80'} py-2`}>
            <span className={`text-[11px] font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'} uppercase tracking-wider`}>
              Familias y Acabados Base
            </span>
            <span className={`px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-white/10 text-zinc-200' : 'bg-slate-100 text-slate-700'} font-mono font-bold text-[9.5px]`}>
              {baseFeatures.length} familias base
            </span>
          </div>

          {/* Buscador de familias base */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={familySearch}
                onChange={(e) => setFamilySearch(e.target.value)}
                placeholder="Buscar familia base o acabado (ej: AE, CASEBODY, TOTE, -MB)..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg ${isDarkMode ? 'bg-white/5 border-white/15 text-zinc-100 placeholder-zinc-500 focus:border-white/40' : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:border-slate-800'} border text-[10.5px] focus:outline-none transition-colors shadow-2xs`}
              />
            </div>
            {baseFeatures.length > 6 && !familySearch && (
              <button
                type="button"
                onClick={() => setExpandedFamilies(prev => !prev)}
                className={`px-2.5 py-1.5 rounded-lg border ${isDarkMode ? 'border-white/15 bg-white/5 hover:bg-white/10 text-zinc-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'} text-[10.5px] font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-2xs`}
              >
                {expandedFamilies ? (
                  <>
                    <ChevronUp size={13} />
                    <span>Mostrar menos</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={13} />
                    <span>Ver todas ({baseFeatures.length})</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Cards internas de familias */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto ${isDarkMode ? 'scrollbar-thumb-zinc-700' : 'scrollbar-thumb-slate-300'} scrollbar-thin p-0.5`}>
            {displayedFeatures.map((item, idx) => {
              const code = item.code || item.feature_code || 'CODE';
              const name = item.name || item.feature_name || code;
              const optsCount = item.options_count || item.total_options || (Array.isArray(item.options) ? item.options.length : null);
              const category = item.sub_type || item.feature_name || 'Tela / Color / Acabado';

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl ${isDarkMode ? 'bg-white/[0.04] border-white/10 hover:border-white/25 text-zinc-200' : 'bg-white border-slate-200 hover:border-slate-400 text-slate-800'} border transition-all flex flex-col justify-between gap-1 shadow-2xs group`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className={`font-mono font-bold text-[10px] ${isDarkMode ? 'text-zinc-200 bg-white/10 border-white/15' : 'text-slate-800 bg-slate-100 border-slate-200'} px-1.5 py-0.5 rounded border truncate`}>
                      {code}
                    </span>
                    {optsCount ? (
                      <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-white/10 text-zinc-300' : 'bg-slate-100 text-slate-600'} shrink-0`}>
                        {optsCount} {optsCount === 1 ? 'opción' : 'opciones'}
                      </span>
                    ) : (
                      <span className={`text-[8px] font-mono font-semibold px-1 py-0.2 rounded ${isDarkMode ? 'bg-white/5 text-zinc-400' : 'bg-slate-100 text-slate-500'} shrink-0`}>
                        Base $0
                      </span>
                    )}
                  </div>

                  <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'} line-clamp-1`} title={name}>
                    {name}
                  </p>

                  <div className={`flex items-center gap-1 text-[8.5px] ${isDarkMode ? 'text-zinc-500 border-white/10' : 'text-slate-400 border-slate-100'} font-medium truncate pt-1 border-t`}>
                    <span className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-semibold`}>Tipo:</span>
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
          className={`p-4 ${isDarkMode ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/85 border-slate-200/90 text-gray-800 shadow-sm'} backdrop-blur-md rounded-2xl border space-y-3 transition-colors`}
        >
          {/* Mensaje Explicativo de la IA */}
          <div className="space-y-1">
            <h4 className={`text-[13.5px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-1.5`}>
              <span>4. Auditoría Estructural de Producto Modelo (Muestra en Memoria)</span>
            </h4>
            <p className={`text-[13px] ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'} leading-relaxed`}>
              Para validar que las relaciones relacionales funcionan correctamente, seleccioné de la memoria una muestra real: el SKU <strong className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{sampleProduct.sku}</strong> (Precio Base: <strong className={`font-mono font-bold ${isDarkMode ? 'text-white font-bold' : 'text-slate-900'}`}>${sampleProduct.base_price || '0'} USD</strong>). Aquí puedes verificar cómo se enlazan sus características y opciones hijas:
            </p>
          </div>

          <div className={`flex items-center justify-between gap-2 border-t border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200/80'} py-2`}>
            <span className={`text-[11px] font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'} uppercase tracking-wider`}>
              Ejemplo de Producto en Memoria
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-white text-zinc-950' : 'bg-slate-900 text-white'} text-[10px] font-mono font-bold`}>
                SKU: {sampleProduct.sku}
              </span>
              <span className={`px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-white/10 text-white border-white/20' : 'bg-[#18181b]/10 text-[#18181b] border-[#18181b]/20'} border text-[10px] font-mono font-bold`}>
                Precio Base: ${sampleProduct.base_price || '0'}
              </span>
            </div>
          </div>

          <p className={`text-[11px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'} font-medium leading-relaxed`}>
            {sampleProduct.description || 'Producto modelo desestructurado con sus dependencias en memoria activa.'}
          </p>

          {sampleProduct.features && sampleProduct.features.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className={`text-[9.5px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} uppercase tracking-wider block`}>
                Árbol de Features y Opciones Vinculadas al Producto:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleProduct.features.map((feat, featIdx) => (
                  <div
                    key={featIdx}
                    className={`p-2 rounded-lg ${isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50/80 border-slate-200'} border space-y-1 shadow-2xs`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`font-mono font-bold text-[10px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {feat.feature_code}
                      </span>
                      <span className={`text-[8.5px] font-mono ${isDarkMode ? 'text-zinc-400 bg-white/10 border-white/15' : 'text-slate-500 bg-white border-slate-200'} font-medium px-1.5 py-0.2 rounded border`}>
                        {feat.total_options || feat.options?.length || 0} opciones
                      </span>
                    </div>
                    <p className={`text-[9.5px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'} font-medium truncate`} title={feat.feature_name}>
                      {feat.feature_name}
                    </p>
                    {feat.options && feat.options.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {feat.options.map((opt, optIdx) => (
                          <span
                            key={optIdx}
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${isDarkMode ? 'bg-white/10 text-zinc-200 border-white/15' : 'bg-white text-slate-700 border-slate-200'} border shadow-2xs`}
                            title={`${opt.code} - ${opt.description}`}
                          >
                            {opt.code}
                            {Number(opt.current_price) > 0 && (
                              <span className={`font-bold ml-1 ${isDarkMode ? 'text-white font-bold' : 'text-[#18181b] font-bold'}`}>
                                +${opt.current_price}
                              </span>
                            )}
                          </span>
                        ))}
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
      <div className={`p-4 ${isDarkMode ? 'bg-[#09090b]/60 border-white/10 text-zinc-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/80 border-slate-200/90 text-gray-800 shadow-sm'} backdrop-blur-2xl rounded-2xl border space-y-3 transition-colors`}>
        <p className={`text-[13px] ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'} leading-relaxed`}>
          El catálogo maestro está listo en memoria para recibir instrucciones de actualización de precios, consulta de características o generación de matrices de exportación:
        </p>

        {/* Barra de Acciones Rápidas con Botones en Blanco/Grises/Negro */}
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <button
            type="button"
            onClick={() => onCommandSelect && onCommandSelect('/exportCETcsv')}
            className={`px-3 py-1.5 rounded-xl ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'} border font-semibold shadow-2xs flex items-center gap-1.5 text-xs transition-all hover:scale-[1.02] cursor-pointer`}
          >
            <Download size={13} />
            <span>/exportCETcsv</span>
          </button>
          <button
            type="button"
            onClick={() => onCommandSelect && onCommandSelect('/compareCET')}
            className={`px-3 py-1.5 rounded-xl ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'} border font-semibold shadow-2xs flex items-center gap-1.5 text-xs transition-all hover:scale-[1.02] cursor-pointer`}
          >
            <Sparkles size={13} />
            <span>/compareCET</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(AiCatalogIngestionReport);
