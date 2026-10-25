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
  Lightbulb
} from 'lucide-react';

/**
 * Componente CatalogAnalyticsCard
 * Renderiza de forma ejecutiva, moderna y con esquinas rectas (sin border-radius)
 * las consultas analíticas del catálogo XML maestro (CET Designer).
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
    <div className="w-full flex flex-col gap-3.5 my-2.5 text-left font-sans rounded-none">
      {/* ── BARRA SUPERIOR DE CONTEXTO & METADATOS ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1 rounded-none">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-none ${isDarkMode ? 'bg-white/10 text-white' : 'bg-zinc-900/10 text-zinc-900'} flex items-center justify-center`}>
            <BarChart3 size={13} />
          </div>
          <span className={`text-[12px] font-bold tracking-tight ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
            Analítica de Productos • Catálogo CET Designer
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {company && (
            <span className={`px-2.5 py-0.5 rounded-none text-[10px] font-mono font-bold ${
              isDarkMode ? 'bg-white/10 text-zinc-100 border border-white/15' : 'bg-slate-200 text-slate-800'
            }`}>
              Catálogo: {company}
            </span>
          )}
          {filterBadge && (
            <span className={`px-2.5 py-0.5 rounded-none text-[10px] font-semibold flex items-center gap-1.5 ${
              isDarkMode ? 'bg-white/10 text-zinc-200 border border-white/15' : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-none ${isDarkMode ? 'bg-white' : 'bg-zinc-900'} animate-pulse`} />
              {filterBadge}
            </span>
          )}
        </div>
      </div>

      {/* ── TARJETA PRINCIPAL GLASSMORPHIC RECTA ── */}
      <div
        className={`w-full rounded-none border transition-all overflow-hidden ${
          isDarkMode
            ? 'bg-[#09090b]/80 border-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Cabecera de la consulta */}
        <div className={`p-4 sm:p-5 border-b rounded-none ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
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
                  className={`w-full pl-8 pr-3 py-1.5 rounded-none text-xs font-sans transition-all outline-none ${
                    isDarkMode
                      ? 'bg-white/5 border border-white/10 text-zinc-100 placeholder-zinc-500 focus:border-white/20 focus:bg-white/10'
                      : 'bg-slate-100 border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-300 focus:bg-white'
                  }`}
                />
              </div>
            )}
          </div>

          {/* ── GRID DE 4 KPIS EJECUTIVOS RECTOS ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            {/* KPI 1: Total Modelos */}
            <div className={`p-2.5 sm:p-3 rounded-none border flex flex-col justify-between transition-all ${
              isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 shadow-2xs' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Total Modelos
                </span>
                <Layers size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
              </div>
              <span className={`text-sm sm:text-base font-extrabold mt-1 tracking-tight font-mono ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                {totalSkus || `${products.length} SKUs`}
              </span>
              <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Catálogo activo
              </span>
            </div>

            {/* KPI 2: Rango Precios Base */}
            <div className={`p-2.5 sm:p-3 rounded-none border flex flex-col justify-between transition-all ${
              isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 shadow-2xs' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Rango Precios
                </span>
                <Sliders size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
              </div>
              <span className={`text-xs sm:text-[13px] font-bold mt-1 tracking-tight truncate font-mono ${isDarkMode ? 'text-zinc-200' : 'text-zinc-900'}`} title={priceRange}>
                {priceRange || (minPrice && maxPrice ? `${minPrice} — ${maxPrice}` : 'N/A')}
              </span>
              <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Mínimo $\longrightarrow$ Máximo
              </span>
            </div>

            {/* KPI 3: Precio Promedio */}
            <div className={`p-2.5 sm:p-3 rounded-none border flex flex-col justify-between transition-all ${
              isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 shadow-2xs' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Precio Promedio
                </span>
                <TrendingUp size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
              </div>
              <span className={`text-sm sm:text-base font-extrabold mt-1 tracking-tight font-mono ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                {avgPrice || 'N/A'}
              </span>
              <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Promedio List Price
              </span>
            </div>

            {/* KPI 4: Segmento / Filtro */}
            <div className={`p-2.5 sm:p-3 rounded-none border flex flex-col justify-between transition-all ${
              isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 shadow-2xs' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Filtro Aplicado
                </span>
                <Filter size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
              </div>
              <span className={`text-xs sm:text-[12.5px] font-bold mt-1 tracking-tight truncate ${isDarkMode ? 'text-zinc-200' : 'text-zinc-900'}`} title={filterBadge}>
                {filterBadge || 'General'}
              </span>
              <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Criterio seleccionado
              </span>
            </div>
          </div>
        </div>

        {/* ── TABLA DE PRODUCTOS ANALIZADOS (RECTA) ── */}
        <div className="overflow-x-auto w-full custom-scrollbar rounded-none">
          <table className="w-full text-left border-collapse rounded-none">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider rounded-none ${
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
            <tbody className={`divide-y text-xs rounded-none ${isDarkMode ? 'divide-white/[0.06] text-zinc-200' : 'divide-slate-100 text-slate-700'}`}>
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
                      className={`transition-colors group rounded-none ${
                        isDarkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Posición # */}
                      <td className="px-3 py-3 text-center rounded-none">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-none text-[11px] font-mono font-bold ${
                          isDarkMode ? 'bg-white/5 text-zinc-400' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.index || idx + 1}
                        </span>
                      </td>

                      {/* SKU / Modelo en badge de alto contraste recto */}
                      <td className="px-3.5 py-3 whitespace-nowrap rounded-none">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono text-xs sm:text-[13px] font-black px-2.5 py-1 rounded-none tracking-wider ${
                            isDarkMode
                              ? 'bg-white text-zinc-950 shadow-sm'
                              : 'bg-zinc-900 text-white'
                          }`}>
                            {p.sku}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.sku)}
                            title="Copiar SKU"
                            className={`p-1.5 rounded-none text-xs transition-colors cursor-pointer ${
                              isDarkMode
                                ? 'hover:bg-white/10 text-zinc-400 hover:text-white'
                                : 'hover:bg-slate-200 text-slate-500'
                            }`}
                          >
                            {copiedSku === p.sku ? (
                              <Check size={13} className="text-white" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Descripción Comercial */}
                      <td className="px-3.5 py-3 rounded-none">
                        <span className={`line-clamp-2 leading-relaxed ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                          {p.description || '—'}
                        </span>
                      </td>

                      {/* Precio de Lista Base en badge consistente recto */}
                      <td className="px-3.5 py-3 text-right whitespace-nowrap rounded-none">
                        <span className={`inline-block font-mono font-black text-xs sm:text-[13px] px-3 py-1 rounded-none ${
                          isDarkMode
                            ? 'bg-white/[0.04] text-white border border-white/10 shadow-2xs'
                            : 'bg-slate-100 text-slate-900 border border-slate-200'
                        }`}>
                          {p.price || '$0.00 USD'}
                        </span>
                      </td>

                      {/* Features Vinculadas */}
                      <td className="px-3.5 py-3 text-center whitespace-nowrap rounded-none">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[11px] font-semibold ${
                          isDarkMode
                            ? 'bg-white/10 text-zinc-300 border border-white/15'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          <Tag size={10} />
                          {p.features || 'Base Estándar'}
                        </span>
                      </td>

                      {/* Botón Acción Rápida: Inspeccionar */}
                      <td className="px-3.5 py-3 text-center whitespace-nowrap rounded-none">
                        <button
                          type="button"
                          onClick={() => handleInspect(p.sku)}
                          title={`Consultar opciones de ${p.sku}`}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[11px] font-semibold transition-all cursor-pointer ${
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
        <div className={`p-3.5 sm:p-4 border-t flex flex-col gap-3 rounded-none ${
          isDarkMode ? 'border-white/10 bg-white/[0.015]' : 'border-slate-100 bg-slate-50/50'
        }`}>
          {/* Tip amigable si existe */}
          {tipText && (
            <div className="flex items-start gap-2">
              <Lightbulb size={14} className={isDarkMode ? 'text-zinc-400 shrink-0 mt-0.5' : 'text-slate-500 shrink-0 mt-0.5'} />
              <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                {tipText}
              </p>
            </div>
          )}

          {/* Chips de comandos sugeridos accionables con esquinas rectas */}
          {suggestions && suggestions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1 rounded-none">
              <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isDarkMode ? 'text-zinc-500' : 'text-slate-400'
              }`}>
                <Sparkles size={11} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
                Acciones Rápidas:
              </span>
              {suggestions.map((sug, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => handleSuggestion(sug.command)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
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
