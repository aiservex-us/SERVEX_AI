'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Layers,
  Sliders,
  TrendingUp,
  Filter,
  Copy,
  Check,
  Search,
  Sparkles,
  Tag,
  ArrowRight,
  Eye,
  Lightbulb,
  ExternalLink
} from 'lucide-react';

/**
 * Componente CatalogAnalyticsCard
 * Renderiza de forma ejecutiva, moderna y 100% armónica con la interfaz Servex AI
 * las consultas analíticas del catálogo XML maestro (CET Designer), tales como:
 * - "primeros 5 productos del catálogo"
 * - "los productos más caros"
 * - "los más económicos"
 * - rangos de precios y filtros posicionales.
 */
export default function CatalogAnalyticsCard({ data, onCommandSelect, isDarkMode = true }) {
  const [copiedSku, setCopiedSku] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!data) return null;

  const {
    title = 'Exploración de Productos del Catálogo',
    company = 'Catálogo XML',
    totalSkus = '',
    priceRange = '',
    minPrice = '',
    maxPrice = '',
    avgPrice = '',
    filterBadge = '',
    products = [],
    tipText = '',
    suggestions = []
  } = data;

  const handleCopy = (sku) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 2000);
    }
  };

  const handleInspect = (sku) => {
    if (onCommandSelect && sku) {
      onCommandSelect(`consultar opciones del modelo ${sku}`);
    }
  };

  const handleSuggestion = (cmd) => {
    if (onCommandSelect && cmd) {
      onCommandSelect(cmd);
    }
  };

  // Filtrado reactivo en vivo dentro de la tarjeta
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const q = searchTerm.toLowerCase();
    return products.filter(p =>
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.price && p.price.toLowerCase().includes(q)) ||
      (p.features && p.features.toLowerCase().includes(q))
    );
  }, [products, searchTerm]);

  return (
    <div className="w-full flex flex-col gap-3.5 my-2.5 text-left font-sans">
      {/* ── BARRA SUPERIOR DE CONTEXTO & METADATOS ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg ${isDarkMode ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-700'} flex items-center justify-center`}>
            <BarChart3 size={13} />
          </div>
          <span className={`text-[12px] font-bold tracking-tight ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
            Analítica de Productos • Catálogo CET Designer
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {company && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              isDarkMode ? 'bg-white/10 text-zinc-100 border border-white/15' : 'bg-slate-200 text-slate-800'
            }`}>
              Catálogo: {company}
            </span>
          )}
          {filterBadge && (
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 ${
              isDarkMode ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {filterBadge}
            </span>
          )}
        </div>
      </div>

      {/* ── TARJETA PRINCIPAL GLASSMORPHIC ── */}
      <div
        className={`w-full rounded-2xl border transition-all overflow-hidden ${
          isDarkMode
            ? 'bg-[#09090b]/80 border-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Cabecera de la consulta */}
        <div className={`p-4 sm:p-5 border-b ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg">📋</span>
                <h3 className={`text-base sm:text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  {title}
                </h3>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Datos reales extraídos en memoria directamente del XML maestro CET sin intermediación de Excel.
              </p>
            </div>

            {/* Buscador reactivo dentro de la tarjeta */}
            {products.length > 3 && (
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por SKU o descripción..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-sans transition-all outline-none ${
                    isDarkMode
                      ? 'bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-500 focus:border-indigo-400/50 focus:bg-white/10'
                      : 'bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white'
                  }`}
                />
              </div>
            )}
          </div>

          {/* ── GRID DE 4 KPIS EJECUTIVOS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            {/* KPI 1: Total Modelos */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Total Modelos
                </span>
                <Layers size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
              </div>
              <span className={`text-sm sm:text-base font-extrabold mt-1 tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                {totalSkus || `${products.length} SKUs`}
              </span>
              <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Catálogo activo
              </span>
            </div>

            {/* KPI 2: Rango Precios Base */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Rango de Precios
                </span>
                <Sliders size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
              </div>
              <span className={`text-xs sm:text-[13px] font-bold mt-1 tracking-tight truncate ${isDarkMode ? 'text-zinc-200' : 'text-zinc-900'}`} title={priceRange}>
                {priceRange || (minPrice && maxPrice ? `${minPrice} — ${maxPrice}` : 'N/A')}
              </span>
              <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Mínimo $\longrightarrow$ Máximo
              </span>
            </div>

            {/* KPI 3: Precio Promedio */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Precio Promedio
                </span>
                <TrendingUp size={13} className="text-emerald-400" />
              </div>
              <span className="text-sm sm:text-base font-extrabold mt-1 tracking-tight text-emerald-400 font-mono">
                {avgPrice || 'N/A'}
              </span>
              <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Promedio List Price
              </span>
            </div>

            {/* KPI 4: Segmento / Filtro */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Filtro Aplicado
                </span>
                <Filter size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
              </div>
              <span className={`text-xs sm:text-[12.5px] font-bold mt-1 tracking-tight truncate ${isDarkMode ? 'text-indigo-300' : 'text-indigo-700'}`} title={filterBadge}>
                {filterBadge || 'General'}
              </span>
              <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Criterio seleccionado
              </span>
            </div>
          </div>
        </div>

        {/* ── TABLA DE PRODUCTOS ANALIZADOS ── */}
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode ? 'border-white/10 bg-white/[0.04] text-zinc-400' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}>
                <th className="px-3 py-3 text-center w-12">#</th>
                <th className="px-3.5 py-3">SKU / Modelo</th>
                <th className="px-3.5 py-3">Descripción Comercial</th>
                <th className="px-3.5 py-3 text-right">Precio de Lista Base</th>
                <th className="px-3.5 py-3 text-center">Features Vinculadas</th>
                <th className="px-3.5 py-3 text-center w-28">Acción</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDarkMode ? 'divide-white/[0.06] text-zinc-200' : 'divide-slate-100 text-slate-700'}`}>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-400 italic">
                    No se encontraron productos que coincidan con la búsqueda "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  return (
                    <tr
                      key={p.sku || idx}
                      className={`transition-colors group ${
                        isDarkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Posición # */}
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-mono font-bold ${
                          isDarkMode ? 'bg-white/5 text-zinc-400' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.index || idx + 1}
                        </span>
                      </td>

                      {/* SKU / Modelo con botón de copia */}
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono text-xs sm:text-[13px] font-extrabold px-2.5 py-1 rounded-lg tracking-wider ${
                            isDarkMode
                              ? 'bg-white/10 text-white border border-white/15'
                              : 'bg-zinc-900 text-white'
                          }`}>
                            {p.sku}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.sku)}
                            title="Copiar SKU"
                            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                              isDarkMode
                                ? 'hover:bg-white/15 text-zinc-400 hover:text-white'
                                : 'hover:bg-slate-200 text-slate-500'
                            }`}
                          >
                            {copiedSku === p.sku ? (
                              <Check size={13} className="text-emerald-400" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Descripción Comercial */}
                      <td className="px-3.5 py-3">
                        <span className={`line-clamp-2 leading-relaxed ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                          {p.description || '—'}
                        </span>
                      </td>

                      {/* Precio de Lista Base */}
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        <span className={`inline-block font-mono font-bold text-xs sm:text-[13px] px-2.5 py-1 rounded-lg ${
                          isDarkMode
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {p.price || '$0.00 USD'}
                        </span>
                      </td>

                      {/* Features Vinculadas */}
                      <td className="px-3.5 py-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          p.features && p.features.includes('familias')
                            ? isDarkMode
                              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                              : 'bg-indigo-50 text-indigo-700'
                            : isDarkMode
                              ? 'bg-white/5 text-zinc-400 border border-white/10'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Tag size={10} />
                          {p.features || 'Base Estándar'}
                        </span>
                      </td>

                      {/* Botón Acción Rápida: Inspeccionar */}
                      <td className="px-3.5 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleInspect(p.sku)}
                          title={`Consultar opciones de ${p.sku}`}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            isDarkMode
                              ? 'bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 hover:border-white/20'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200'
                          }`}
                        >
                          <Eye size={11} />
                          <span>Opciones</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER: SUGERENCIAS INTERACTIVAS Y TIPS ── */}
        <div className={`p-3.5 sm:p-4 border-t flex flex-col gap-3 ${
          isDarkMode ? 'border-white/10 bg-white/[0.015]' : 'border-slate-100 bg-slate-50/50'
        }`}>
          {/* Tip amigable si existe */}
          {tipText && (
            <div className="flex items-start gap-2">
              <Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                {tipText}
              </p>
            </div>
          )}

          {/* Chips de comandos sugeridos accionables */}
          {suggestions && suggestions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isDarkMode ? 'text-zinc-500' : 'text-slate-400'
              }`}>
                <Sparkles size={11} className="text-indigo-400" />
                Acciones Rápidas:
              </span>
              {suggestions.map((sug, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => handleSuggestion(sug.command)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-white/5 hover:bg-white/15 text-zinc-200 hover:text-white border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                  }`}
                >
                  <span>{sug.label}</span>
                  <ArrowRight size={11} className="text-zinc-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
