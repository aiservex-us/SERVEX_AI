'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sliders,
  Database,
  Sparkles,
  Copy,
  Check,
  Edit3,
  Search,
  Info,
  Lightbulb,
  Send,
  Tag,
  ArrowRight
} from 'lucide-react';

/**
 * Componente CatalogSummaryCard
 * Renderiza de forma ejecutiva, moderna y con esquinas angulares rectas (sin border-radius)
 * los resúmenes de catálogo, listas de precios activas, desglose de características
 * con recargo (up-charge), bloques interactivos de ejemplos de actualización y tips amigables.
 */
export default function CatalogSummaryCard({ data, onCommandSelect, isDarkMode = true }) {
  const [copiedExample, setCopiedExample] = useState(false);
  const [copiedFeature, setCopiedFeature] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!data) return null;

  const {
    catalog = 'Catálogo XML',
    pricelists = [{ code: 'P1', currency: 'USD' }],
    features = [],
    note = '',
    exampleIntro = '',
    examplePrompt = '',
    tipText = ''
  } = data;

  // Filtrado reactivo de características
  const filteredFeatures = useMemo(() => {
    if (!searchTerm) return features;
    const q = searchTerm.toLowerCase();
    return features.filter(f => {
      const matchCode = f.featureCode && f.featureCode.toLowerCase().includes(q);
      const matchDesc = f.description && f.description.toLowerCase().includes(q);
      const matchOpts = (f.options || []).some(
        opt =>
          (opt.code && opt.code.toLowerCase().includes(q)) ||
          (opt.description && opt.description.toLowerCase().includes(q)) ||
          (opt.price && opt.price.toLowerCase().includes(q))
      );
      return matchCode || matchDesc || matchOpts;
    });
  }, [features, searchTerm]);

  const handleCopyExample = () => {
    if (!examplePrompt) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(examplePrompt);
      setCopiedExample(true);
      setTimeout(() => setCopiedExample(false), 2000);
    }
  };

  const handleCopyCode = (code) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedFeature(code);
      setTimeout(() => setCopiedFeature(null), 1800);
    }
  };

  const handleUsePrompt = (promptText) => {
    if (onCommandSelect && promptText) {
      onCommandSelect(promptText);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3.5 my-2.5 text-left font-sans rounded-none">
      {/* ── BARRA SUPERIOR DE CONTEXTO DEL CATÁLOGO & LISTAS DE PRECIOS ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1 rounded-none">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-none ${isDarkMode ? 'bg-white/10 text-white' : 'bg-zinc-900/10 text-zinc-900'} flex items-center justify-center`}>
            <Database size={13} />
          </div>
          <span className={`text-[12px] font-bold tracking-tight ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
            Resumen de Catálogo & Listas de Precios • CET Designer
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {catalog && (
            <span className={`px-2.5 py-0.5 rounded-none text-[10px] font-mono font-bold ${
              isDarkMode ? 'bg-white/10 text-zinc-100 border border-white/15' : 'bg-slate-200 text-slate-800'
            }`}>
              Catálogo: {catalog}
            </span>
          )}

          {pricelists && pricelists.length > 0 && (
            <div className="flex items-center gap-1.5">
              {pricelists.map((pl, plIdx) => (
                <span
                  key={plIdx}
                  className={`px-2.5 py-0.5 rounded-none text-[10px] font-semibold flex items-center gap-1.5 ${
                    isDarkMode ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 animate-pulse" />
                  Lista: <span className="font-mono font-bold">{pl.code}</span> ({pl.currency || 'USD'})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CONTENEDOR PRINCIPAL: CARACTERÍSTICAS CON RECARGO ── */}
      <div
        className={`w-full rounded-none border transition-all overflow-hidden ${
          isDarkMode
            ? 'bg-[#09090b]/80 border-white/10 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Cabecera de la sección de características */}
        <div className={`p-4 sm:px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-2.5 rounded-none ${
          isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/70'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-none ${isDarkMode ? 'bg-white/10 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
              <Sparkles size={13} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
                  Características con Recargo (Up-charge)
                </span>
                <span className={`px-2 py-0.5 rounded-none text-[10.5px] font-mono font-bold ${
                  isDarkMode ? 'bg-white/10 text-zinc-300 border border-white/10' : 'bg-slate-200 text-slate-700'
                }`}>
                  {features.length}
                </span>
              </div>
            </div>
          </div>

          {/* Buscador reactivo si hay más de 2 features */}
          {features.length > 2 && (
            <div className="relative">
              <Search size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por código u opción..."
                className={`text-[11px] pl-7 pr-3 py-1 rounded-none border focus:outline-none transition-colors w-44 sm:w-56 ${
                  isDarkMode
                    ? 'bg-black/40 border-white/15 text-zinc-100 placeholder-zinc-500 focus:border-white/40'
                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                }`}
              />
            </div>
          )}
        </div>

        {/* Tabla de Características y Opciones con Recargo */}
        {features.length > 0 ? (
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto rounded-none">
            <table className="w-full border-collapse text-left text-xs rounded-none">
              <thead className={`sticky top-0 z-10 text-[10.5px] uppercase font-bold tracking-wider rounded-none ${
                isDarkMode ? 'bg-[#09090b] text-zinc-400 border-b border-white/10' : 'bg-slate-100 text-slate-600 border-b border-slate-200'
              }`}>
                <tr>
                  <th className="py-2.5 px-4 font-semibold w-40 sm:w-48">Código Característica</th>
                  <th className="py-2.5 px-4 font-semibold w-36 sm:w-44">Descripción</th>
                  <th className="py-2.5 px-4 font-semibold">Opciones con Recargo (Código • Descripción • Precio)</th>
                  <th className="py-2.5 px-4 text-right font-semibold w-24">Acción</th>
                </tr>
              </thead>
              <tbody className={`divide-y rounded-none ${isDarkMode ? 'divide-white/[0.05]' : 'divide-slate-100'}`}>
                {filteredFeatures.length > 0 ? (
                  filteredFeatures.map((feat, fIdx) => (
                    <tr
                      key={fIdx}
                      className={`transition-colors rounded-none ${
                        isDarkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Código de Feature */}
                      <td className="py-3 px-4 align-top rounded-none">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`font-mono text-[11.5px] font-bold px-2 py-0.5 rounded-none ${
                            isDarkMode ? 'bg-white/10 text-white border border-white/15' : 'bg-slate-200 text-slate-900'
                          }`}>
                            {feat.featureCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(feat.featureCode)}
                            title="Copiar código"
                            className={`p-1 rounded-none text-zinc-400 hover:text-white transition-colors cursor-pointer ${
                              isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-200'
                            }`}
                          >
                            {copiedFeature === feat.featureCode ? (
                              <Check size={11} className="text-emerald-400" />
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Descripción de Feature */}
                      <td className={`py-3 px-4 align-top font-medium rounded-none ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
                        {feat.description || 'Sin descripción'}
                      </td>

                      {/* Desglose de Opciones con Recargo */}
                      <td className="py-3 px-4 align-top rounded-none">
                        <div className="flex flex-col gap-1.5">
                          {feat.options && feat.options.length > 0 ? (
                            feat.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`flex items-center justify-between flex-wrap gap-2 px-2.5 py-1.5 rounded-none border text-xs transition-colors ${
                                  isDarkMode
                                    ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-wrap">
                                  {opt.code && (
                                    <span className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-none ${
                                      isDarkMode ? 'bg-white/15 text-white' : 'bg-slate-200 text-slate-800'
                                    }`}>
                                      {opt.code}
                                    </span>
                                  )}
                                  <span className={`text-[12px] ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`}>
                                    {opt.description}
                                  </span>
                                </div>

                                {opt.price && (
                                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-none ${
                                    isDarkMode
                                      ? 'bg-white/15 text-white border border-white/20'
                                      : 'bg-zinc-900 text-white'
                                  }`}>
                                    +{opt.price}
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-zinc-500 italic text-[11px]">No registra recargos</span>
                          )}
                        </div>
                      </td>

                      {/* Botón de acción para actualizar */}
                      <td className="py-3 px-4 align-top text-right rounded-none">
                        {onCommandSelect && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUsePrompt(
                                `Actualizar recargo ${feat.featureCode} ${feat.options?.[0]?.code || ''} a $`
                              )
                            }
                            className={`px-2.5 py-1 rounded-none text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer border ${
                              isDarkMode
                                ? 'bg-white/10 text-white hover:bg-white/20 border-white/15'
                                : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300'
                            }`}
                            title="Actualizar recargo de esta característica"
                          >
                            <Edit3 size={11} />
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-zinc-500">
                      No se encontraron características que coincidan con "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* ── NOTA DE INTEGRIDAD DEL CATÁLOGO ── */}
        {note && (
          <div className={`p-3.5 sm:px-5 border-t flex items-start gap-2.5 text-xs rounded-none ${
            isDarkMode ? 'border-white/10 bg-white/[0.01] text-zinc-300' : 'border-slate-100 bg-slate-50 text-slate-600'
          }`}>
            <Info size={14} className={`shrink-0 mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`} />
            <p className="leading-relaxed">
              <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Nota: </strong>
              {note.replace(/^nota:\s*/i, '')}
            </p>
          </div>
        )}
      </div>

      {/* ── BLOQUE DE EJEMPLO LISTO PARA COPIAR O ENVIAR ── */}
      {examplePrompt && (
        <div
          className={`w-full rounded-none border transition-all overflow-hidden p-4 sm:p-5 ${
            isDarkMode
              ? 'bg-[#09090b]/80 border-white/10 backdrop-blur-xl shadow-lg'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5 rounded-none">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-none ${isDarkMode ? 'bg-white/10 text-white' : 'bg-zinc-900/10 text-zinc-900'}`}>
                <Copy size={13} />
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
                Ejemplo de Solicitud Listo para Aplicar
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyExample}
                className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isDarkMode
                    ? 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95'
                    : 'bg-zinc-900 text-white hover:bg-black active:scale-95'
                }`}
              >
                {copiedExample ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copiedExample ? 'Copiado al portapapeles' : 'Copiar Solicitud'}
              </button>

              {onCommandSelect && (
                <button
                  type="button"
                  onClick={() => handleUsePrompt(examplePrompt)}
                  className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isDarkMode
                      ? 'bg-white/10 text-white hover:bg-white/20 border-white/15 active:scale-95'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300 active:scale-95'
                  }`}
                >
                  <Send size={11} />
                  Cargar en Chat
                </button>
              )}
            </div>
          </div>

          {exampleIntro && (
            <p className={`text-xs mb-2.5 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              {exampleIntro}
            </p>
          )}

          {/* Caja con el texto del prompt en mono */}
          <div className="relative group rounded-none">
            <pre
              className={`p-3.5 rounded-none text-xs font-mono leading-relaxed whitespace-pre-wrap select-all border ${
                isDarkMode
                  ? 'bg-black/60 border-white/10 text-zinc-200 shadow-inner'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              {examplePrompt}
            </pre>
          </div>
        </div>
      )}

      {/* ── CARD DE TIP AMIGABLE Y SUGERENCIAS DE CONSULTA ── */}
      {tipText && (
        <div
          className={`w-full rounded-none border p-4 sm:p-5 flex items-start gap-3 transition-all ${
            isDarkMode
              ? 'bg-gradient-to-r from-amber-500/[0.07] via-amber-500/[0.03] to-transparent border-amber-500/25 text-amber-200/90'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}
        >
          <div className={`p-2 rounded-none shrink-0 mt-0.5 ${isDarkMode ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
            <Lightbulb size={16} />
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                Tip de Consulta
              </span>
            </div>

            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'}`}>
              {tipText}
            </p>

            {/* Chips de sugerencias interactivas de consulta */}
            {features.length > 0 && onCommandSelect && (
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <span className={`text-[10.5px] uppercase font-bold tracking-wider mr-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Consultar:
                </span>
                {features.slice(0, 3).map((f, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => handleUsePrompt(`dame info sobre ${f.featureCode}`)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-none border transition-all flex items-center gap-1 cursor-pointer ${
                      isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    <span>{f.featureCode}</span>
                    <ArrowRight size={10} className="opacity-70" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
