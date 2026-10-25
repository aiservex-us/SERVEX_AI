'use client';

import React, { useState, useMemo } from 'react';
import {
  Package,
  Sliders,
  Copy,
  Check,
  Edit3,
  Search,
  Sparkles,
  Layers,
  Tag
} from 'lucide-react';

/**
 * Componente ProductInspectionCard
 * Renderiza de forma ejecutiva, moderna y con esquinas angulares rectas (sin border-radius)
 * los detalles de un producto inspeccionado en el catálogo XML maestro (CET Designer).
 */
export default function ProductInspectionCard({ data, onCommandSelect, isDarkMode = true }) {
  const [copiedSku, setCopiedSku] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCopy = (sku) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 2000);
    }
  };

  if (!data || !data.products || data.products.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4 my-2 text-left font-sans rounded-none">
      {/* ── BARRA SUPERIOR DE CONTEXTO DEL CATÁLOGO ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1 rounded-none">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-none ${isDarkMode ? 'bg-white/10 text-white' : 'bg-zinc-900/10 text-zinc-900'} flex items-center justify-center`}>
            <Package size={13} />
          </div>
          <span className={`text-[12px] font-bold tracking-tight ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
            Inspección de Catálogo XML • CET Designer
          </span>
        </div>

        <div className="flex items-center gap-2">
          {data.catalog && (
            <span className={`px-2.5 py-0.5 rounded-none text-[10px] font-mono font-bold ${isDarkMode ? 'bg-white/10 text-zinc-200 border border-white/15' : 'bg-slate-200 text-slate-800'}`}>
              Catálogo: {data.catalog}
            </span>
          )}
          {data.matches && (
            <span className={`px-2.5 py-0.5 rounded-none text-[10px] font-semibold flex items-center gap-1.5 ${isDarkMode ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800'}`}>
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse" />
              {data.matches} consultados
            </span>
          )}
        </div>
      </div>

      {/* ── PRODUCTOS INSPECCIONADOS ── */}
      {data.products.map((prod, pIdx) => {
        const isNotFound = !prod.price || (prod.description && prod.description.toLowerCase().includes('no localizado'));

        // Filtrado en vivo de opciones si el usuario escribe en el buscador
        const filteredOptions = (prod.options || []).filter(opt => {
          if (!searchTerm) return true;
          const q = searchTerm.toLowerCase();
          return (
            (opt.feature && opt.feature.toLowerCase().includes(q)) ||
            (opt.optionCode && opt.optionCode.toLowerCase().includes(q)) ||
            (opt.description && opt.description.toLowerCase().includes(q)) ||
            (opt.surcharge && opt.surcharge.toLowerCase().includes(q))
          );
        });

        return (
          <div
            key={pIdx}
            className={`w-full rounded-none border transition-all overflow-hidden ${
              isDarkMode
                ? 'bg-[#09090b]/80 border-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {/* ── CABECERA Y RESUMEN DEL PRODUCTO ── */}
            <div className={`p-4 sm:p-5 border-b rounded-none ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* SKU Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className={`font-mono text-sm sm:text-base font-black px-3 py-1 rounded-none tracking-wider ${
                      isDarkMode ? 'bg-white text-zinc-950 shadow-sm' : 'bg-zinc-900 text-white'
                    }`}>
                      {prod.sku}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(prod.sku)}
                      title="Copiar SKU"
                      className={`p-1.5 rounded-none text-xs transition-colors cursor-pointer ${
                        isDarkMode ? 'hover:bg-white/10 text-zinc-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500'
                      }`}
                    >
                      {copiedSku === prod.sku ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Features Count Badge */}
                  {prod.featuresCount && (
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-none flex items-center gap-1 ${
                      isDarkMode ? 'bg-white/10 text-zinc-300 border border-white/15' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      <Layers size={11} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
                      {prod.featuresCount} Características
                    </span>
                  )}
                </div>

                {/* Base List Price */}
                {!isNotFound && prod.price && (
                  <div className="flex items-baseline gap-2 bg-white/[0.04] px-3.5 py-1.5 rounded-none border border-white/10">
                    <span className={`text-[10.5px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Precio Base:
                    </span>
                    <span className={`font-mono text-sm sm:text-base font-black ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                      {prod.price}
                    </span>
                  </div>
                )}
              </div>

              {/* Descripción del Producto */}
              <p className={`text-xs sm:text-[13px] mt-3 leading-relaxed font-normal ${
                isNotFound ? 'text-rose-400 font-medium' : isDarkMode ? 'text-zinc-300' : 'text-slate-600'
              }`}>
                {prod.description}
              </p>
            </div>

            {/* ── TABLA DE OPCIONES Y RECARGOS ASOCIADOS ── */}
            {prod.options && prod.options.length > 0 ? (
              <div className="p-0 rounded-none">
                <div className={`px-4 sm:px-5 py-3 border-b flex flex-wrap items-center justify-between gap-2.5 rounded-none ${
                  isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-100 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <Sliders size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`}>
                      Desglose de Opciones y Recargos Asociados
                    </span>
                    <span className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold ${isDarkMode ? 'bg-white/10 text-zinc-300' : 'bg-slate-200 text-slate-700'}`}>
                      {prod.options.length}
                    </span>
                  </div>

                  {/* Buscador de opciones rápido si hay más de 4 opciones */}
                  {prod.options.length > 4 && (
                    <div className="relative">
                      <Search size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Filtrar opción o feature..."
                        className={`text-[11px] pl-7 pr-3 py-1 rounded-none border focus:outline-none transition-colors w-48 ${
                          isDarkMode
                            ? 'bg-black/40 border-white/15 text-zinc-100 placeholder-zinc-500 focus:border-white/40'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                        }`}
                      />
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto max-h-[380px] overflow-y-auto rounded-none">
                  <table className="w-full border-collapse text-left text-xs rounded-none">
                    <thead className={`sticky top-0 z-10 text-[10.5px] uppercase font-bold tracking-wider ${
                      isDarkMode ? 'bg-[#09090b] text-zinc-400 border-b border-white/10' : 'bg-slate-100 text-slate-600 border-b border-slate-200'
                    }`}>
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Feature</th>
                        <th className="py-2.5 px-4 font-semibold">Código Opción</th>
                        <th className="py-2.5 px-4 font-semibold">Descripción</th>
                        <th className="py-2.5 px-4 text-right font-semibold">Recargo ($ USD)</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y rounded-none ${isDarkMode ? 'divide-white/[0.05]' : 'divide-slate-100'}`}>
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, oIdx) => {
                          const isZero = opt.surcharge.includes('0.00');
                          return (
                            <tr
                              key={oIdx}
                              className={`transition-colors rounded-none ${
                                isDarkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className={`py-2.5 px-4 font-medium ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
                                {opt.feature}
                              </td>
                              <td className="py-2.5 px-4">
                                <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-none ${
                                  isDarkMode ? 'bg-white/10 text-white border border-white/15' : 'bg-slate-200 text-slate-800'
                                }`}>
                                  {opt.optionCode}
                                </span>
                              </td>
                              <td className={`py-2.5 px-4 ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                                {opt.description}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                {isZero ? (
                                  <span className={`font-mono text-xs ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                                    {opt.surcharge}
                                  </span>
                                ) : (
                                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-none ${
                                    isDarkMode ? 'bg-white/15 text-white border border-white/20' : 'bg-zinc-900 text-white'
                                  }`}>
                                    +{opt.surcharge}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-xs text-zinc-500">
                            No se encontraron opciones coincidentes con "{searchTerm}".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {/* ── PIE DE ACCIONES Y SUGERENCIAS ── */}
            <div className={`p-3.5 sm:px-5 border-t flex flex-wrap items-center justify-between gap-3 rounded-none ${
              isDarkMode ? 'border-white/10 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Sparkles size={12} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
                <span>Datos leídos directamente de la estructura XML en memoria sin alterar valores.</span>
              </div>

              {!isNotFound && onCommandSelect && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10.5px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Actualizar:
                  </span>
                  <button
                    type="button"
                    onClick={() => onCommandSelect(`Actualizar ${prod.sku} a $`)}
                    className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isDarkMode
                        ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                        : 'bg-zinc-900 text-white hover:bg-black'
                    }`}
                  >
                    <Edit3 size={11} />
                    Precio Base
                  </button>
                  {prod.options && prod.options.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onCommandSelect(`Actualizar recargo ${prod.sku} ${prod.options[0]?.optionCode || ''} a $`)}
                      className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isDarkMode
                          ? 'bg-white/10 text-white hover:bg-white/20 border-white/15'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300'
                      }`}
                    >
                      <Tag size={11} />
                      Recargo Opción
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
