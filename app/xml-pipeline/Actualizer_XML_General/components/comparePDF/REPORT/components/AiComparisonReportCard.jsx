'use client';

import React, { useState, useMemo } from 'react';
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  MinusCircle,
  Search,
  Download,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Table,
  Copy,
  Check
} from 'lucide-react';
import Papa from 'papaparse';

/**
 * Componente AiComparisonReportCard
 * Renderiza de forma ejecutiva, moderna y 100% armónica con la paleta de Servex AI
 * la auditoría comparativa matricial celda por celda entre catálogos.
 *
 * Paleta monocromática de lujo (blanco y negro / escala de grises zinc)
 * con esquinas angulares rectas (sin border-radius):
 * COLOR RESERVADO EXCLUSIVAMENTE PARA LOS PORCENTAJES DE VARIACIÓN (+% / -%).
 */
export default function AiComparisonReportCard({
  data,
  onCommandSelect,
  isDarkMode = true
}) {
  const [activeTab, setActiveTab] = useState('changes'); // 'changes' | 'added' | 'deleted'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedSku, setCopiedSku] = useState(null);
  const itemsPerPage = 6;

  if (!data) return null;

  const changes = data.detected_changes || [];
  const added = data.added_products || data.summary?.added_products_detailed || [];
  const deleted = data.deleted_products || [];
  const newModelsList = data.summary?.new_models_list || [];
  const deletedModelsList = data.summary?.deleted_models_list || [];

  const totalEvaluated = data.total_evaluated ?? (data.summary?.total_common_models_evaluated || 0);
  const changesCount = data.changes_detected_count ?? changes.length;
  const newCount = data.new_models_count ?? (data.summary?.new_models_detected_count || added.length || newModelsList.length);
  const deletedCount = data.deleted_models_count ?? (data.summary?.deleted_models_detected_count || deleted.length || deletedModelsList.length);

  // Copiado interactivo de SKU
  const handleCopySku = (sku) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && sku) {
      navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 1800);
    }
  };

  // Filtrado de cambios de celdas
  const filteredChanges = useMemo(() => {
    if (!searchTerm.trim()) return changes;
    const q = searchTerm.toLowerCase().trim();
    return changes.filter(c => 
      String(c.model_id || '').toLowerCase().includes(q) ||
      String(c.column_name || '').toLowerCase().includes(q) ||
      String(c.original_column_name || '').toLowerCase().includes(q) ||
      String(c.old_value || '').toLowerCase().includes(q) ||
      String(c.new_value || '').toLowerCase().includes(q)
    );
  }, [changes, searchTerm]);

  // Paginación de cambios
  const totalPages = Math.ceil(filteredChanges.length / itemsPerPage) || 1;
  const paginatedChanges = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredChanges.slice(start, start + itemsPerPage);
  }, [filteredChanges, currentPage]);

  // Helper para formatear valores monetarios
  const formatVal = (val) => {
    if (val === null || val === undefined || val === '') return '---';
    const num = parseFloat(String(val).replace(/[\$,\s]/g, ''));
    if (!isNaN(num) && isFinite(num) && !isNaN(val)) {
      return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return String(val);
  };

  // Helper para impacto porcentual
  const getImpact = (c) => {
    if (c.financial_impact) return c.financial_impact;
    try {
      const o = parseFloat(String(c.old_value).replace(/[\$,\s]/g, ''));
      const n = parseFloat(String(c.new_value).replace(/[\$,\s]/g, ''));
      if (!isNaN(o) && !isNaN(n) && o !== 0) {
        const pct = ((n - o) / Math.abs(o)) * 100;
        return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
      }
    } catch (_) {}
    return '---';
  };

  // Descarga de las diferencias en CSV
  const handleDownloadDiffCsv = () => {
    if (!changes.length) return;
    const csvData = changes.map(c => ({
      'Model #': c.model_id,
      'Field / Option': c.column_name || c.original_column_name,
      'Old Value': c.old_value,
      'New Value': c.new_value,
      'Impact %': getImpact(c)
    }));
    const csv = Papa.unparse(csvData, { delimiter: ';' });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Catalog_Audit_Diffs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`mt-3 space-y-3 font-sans text-left text-[13px] md:text-[13.5px] leading-relaxed rounded-none ${
      isDarkMode ? 'text-zinc-100' : 'text-gray-800'
    }`}>
      {/* ── TARJETA PRINCIPAL GLASSMORPHIC CON ESQUINAS RECTAS ── */}
      <div
        className={`w-full rounded-none border transition-colors overflow-hidden ${
          isDarkMode
            ? 'bg-[#09090b]/80 border-white/10 text-zinc-100 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]'
            : 'bg-white/90 border-slate-200/90 text-gray-800 shadow-sm backdrop-blur-md'
        }`}
      >
        {/* Cabecera ejecutiva integrada */}
        <div className={`p-4 border-b rounded-none ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-none ${isDarkMode ? 'bg-white/10 text-white' : 'bg-zinc-900/10 text-zinc-900'} flex items-center justify-center shrink-0`}>
                  <Sliders size={13} />
                </div>
                <h3 className={`text-[13.5px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Auditoría Comparativa Matricial
                </h3>
                <span className={`px-2 py-0.5 rounded-none text-[9.5px] font-mono font-bold ${
                  isDarkMode ? 'bg-white/10 text-zinc-100 border border-white/15' : 'bg-slate-200 text-slate-800'
                }`}>
                  <ShieldCheck size={11} className="inline mr-1 opacity-70" /> XML Intacto
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Cotejo celda por celda entre catálogo base original y catálogo actualizado.
              </p>
            </div>

            <button
              onClick={handleDownloadDiffCsv}
              disabled={!changes.length}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs ${
                isDarkMode
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200 border-white'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900'
              }`}
              title="Descargar solo las diferencias detectadas en CSV"
            >
              <Download size={13} />
              <span>Exportar Discrepancias (.csv)</span>
            </button>
          </div>
        </div>

        {/* ── KPIS / CONTADORES MÉTRICOS EN ESCALA ARMONIOSA ── */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-3.5 border-b rounded-none ${
          isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`p-2.5 rounded-none border text-center transition-all ${
            isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]' : 'bg-white border-slate-200'
          }`}>
            <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Precios / Celdas
            </span>
            <span className={`text-base sm:text-[17px] font-mono font-extrabold mt-0.5 block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              {changesCount}
            </span>
            <span className={`text-[9.5px] font-medium block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Modificaciones
            </span>
          </div>

          <div className={`p-2.5 rounded-none border text-center transition-all ${
            isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]' : 'bg-white border-slate-200'
          }`}>
            <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Nuevos Productos
            </span>
            <span className={`text-base sm:text-[17px] font-mono font-extrabold mt-0.5 block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              +{newCount}
            </span>
            <span className={`text-[9.5px] font-medium block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Altas de catálogo
            </span>
          </div>

          <div className={`p-2.5 rounded-none border text-center transition-all ${
            isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]' : 'bg-white border-slate-200'
          }`}>
            <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Descatalogados
            </span>
            <span className={`text-base sm:text-[17px] font-mono font-extrabold mt-0.5 block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              -{deletedCount}
            </span>
            <span className={`text-[9.5px] font-medium block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Bajas de catálogo
            </span>
          </div>

          <div className={`p-2.5 rounded-none border text-center transition-all ${
            isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]' : 'bg-white border-slate-200'
          }`}>
            <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Modelos Evaluados
            </span>
            <span className={`text-base sm:text-[17px] font-mono font-extrabold mt-0.5 block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              {totalEvaluated}
            </span>
            <span className={`text-[9.5px] font-medium block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Catálogo común
            </span>
          </div>
        </div>

        {/* ── BARRA DE PESTAÑAS Y BUSCADOR MONOCROMÁTICA RECTA ── */}
        <div className={`px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 border-b rounded-none ${
          isDarkMode ? 'border-white/10 bg-white/[0.01]' : 'border-slate-200 bg-slate-50/60'
        }`}>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setActiveTab('changes'); setCurrentPage(1); }}
              className={`px-2.5 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'changes'
                  ? isDarkMode
                    ? 'bg-white text-zinc-950 border-white shadow-2xs font-bold'
                    : 'bg-zinc-900 text-white border-zinc-900 shadow-2xs font-bold'
                  : isDarkMode
                  ? 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'
                  : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-100 border-transparent'
              }`}
            >
              <Table size={13} />
              <span>Discrepancias ({changesCount})</span>
            </button>

            <button
              onClick={() => { setActiveTab('added'); setCurrentPage(1); }}
              className={`px-2.5 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'added'
                  ? isDarkMode
                    ? 'bg-white text-zinc-950 border-white shadow-2xs font-bold'
                    : 'bg-zinc-900 text-white border-zinc-900 shadow-2xs font-bold'
                  : isDarkMode
                  ? 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'
                  : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-100 border-transparent'
              }`}
            >
              <PlusCircle size={13} />
              <span>Altas (+{newCount})</span>
            </button>

            <button
              onClick={() => { setActiveTab('deleted'); setCurrentPage(1); }}
              className={`px-2.5 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                activeTab === 'deleted'
                  ? isDarkMode
                    ? 'bg-white text-zinc-950 border-white shadow-2xs font-bold'
                    : 'bg-zinc-900 text-white border-zinc-900 shadow-2xs font-bold'
                  : isDarkMode
                  ? 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'
                  : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-100 border-transparent'
              }`}
            >
              <MinusCircle size={13} />
              <span>Bajas (-{deletedCount})</span>
            </button>
          </div>

          {activeTab === 'changes' && changes.length > 0 && (
            <div className="relative flex items-center">
              <Search size={12} className={`absolute left-2.5 pointer-events-none ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Buscar SKU o columna..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className={`rounded-none pl-7 pr-2.5 py-1 text-xs font-medium transition-all w-[160px] sm:w-[190px] border focus:outline-none ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/30 focus:bg-white/10'
                    : 'bg-slate-100 border-slate-200 text-zinc-900 placeholder:text-slate-400 focus:border-zinc-400 focus:bg-white'
                }`}
              />
            </div>
          )}
        </div>

        {/* ── CONTENIDO PRINCIPAL: TABLA O LISTAS ── */}
        <div className="rounded-none">
          {activeTab === 'changes' && (
            <div className="rounded-none">
              {filteredChanges.length === 0 ? (
                <div className={`py-10 text-center text-xs rounded-none ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  <CheckCircle2 size={22} className="mx-auto mb-2 opacity-60" />
                  No se detectaron discrepancias en precios ni opciones para este filtro.
                </div>
              ) : (
                <div className="w-full overflow-x-auto rounded-none">
                  <table className="w-full text-left border-collapse min-w-[540px] rounded-none">
                    <thead>
                      <tr className={`border-b text-[11px] font-bold uppercase tracking-wider select-none rounded-none ${
                        isDarkMode
                          ? 'border-white/10 bg-white/[0.04] text-zinc-400'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}>
                        <th className="py-2.5 px-3.5">Model # (SKU)</th>
                        <th className="py-2.5 px-3.5">Campo / Opción</th>
                        <th className="py-2.5 px-3.5 text-right">Base Anterior</th>
                        <th className="py-2.5 px-3.5 text-right">Nuevo Valor</th>
                        <th className="py-2.5 px-3.5 text-center">Variación</th>
                      </tr>
                    </thead>
                    <tbody
                      key={`changes-page-${currentPage}-${searchTerm}`}
                      className={`divide-y text-xs rounded-none ${
                      isDarkMode ? 'divide-white/[0.06] text-zinc-200' : 'divide-slate-100 text-slate-700'
                    }`}>
                      {paginatedChanges.map((c, idx) => {
                        const impact = getImpact(c);
                        const isPositive = impact.startsWith('+');
                        const isNegative = impact.startsWith('-');
                        return (
                          <tr
                            key={`${c.model_id}-${c.column_name}-${idx}`}
                            className={`transition-colors duration-150 rounded-none ${
                              isDarkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'
                            }`}
                          >
                            {/* Model # (SKU) */}
                            <td className="py-2.5 px-3.5 whitespace-nowrap rounded-none">
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-none tracking-wide ${
                                  isDarkMode
                                    ? 'bg-white text-zinc-950 shadow-2xs'
                                    : 'bg-zinc-900 text-white'
                                }`}>
                                  {c.model_id}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopySku(c.model_id)}
                                  title="Copiar SKU"
                                  className={`p-1 rounded-none transition-colors cursor-pointer ${
                                    isDarkMode
                                      ? 'text-zinc-500 hover:text-white hover:bg-white/10'
                                      : 'text-zinc-400 hover:text-zinc-900 hover:bg-slate-200'
                                  }`}
                                >
                                  {copiedSku === c.model_id ? (
                                    <Check size={11} className={isDarkMode ? 'text-white' : 'text-zinc-900'} />
                                  ) : (
                                    <Copy size={11} />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Campo / Opción */}
                            <td className="py-2.5 px-3.5 rounded-none">
                              <span className={`inline-block px-2 py-0.5 rounded-none text-xs font-medium border ${
                                isDarkMode
                                  ? 'bg-white/5 border-white/10 text-zinc-300'
                                  : 'bg-slate-100 border-slate-200 text-slate-700'
                              }`}>
                                {c.column_name || c.original_column_name || 'List Price'}
                              </span>
                            </td>

                            {/* Base Anterior */}
                            <td className={`py-2.5 px-3.5 font-mono text-xs text-right rounded-none ${
                              isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                            }`}>
                              {formatVal(c.old_value)}
                            </td>

                            {/* Nuevo Valor */}
                            <td className={`py-2.5 px-3.5 font-mono font-bold text-xs text-right rounded-none ${
                              isDarkMode ? 'text-white' : 'text-zinc-900'
                            }`}>
                              {formatVal(c.new_value)}
                            </td>

                            {/* Variación */}
                            <td className="py-2.5 px-3.5 text-center rounded-none">
                              <span className={`px-2 py-0.5 rounded-none text-xs font-mono font-bold inline-flex items-center gap-1 border shadow-2xs ${
                                isPositive
                                  ? isDarkMode
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isNegative
                                  ? isDarkMode
                                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isDarkMode
                                  ? 'bg-white/5 text-zinc-400 border-white/10'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {isPositive && <TrendingUp size={11} />}
                                {isNegative && <TrendingDown size={11} />}
                                {impact}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Paginación monocromática recta */}
              {totalPages > 1 && (
                <div className={`flex items-center justify-between px-3.5 py-2.5 border-t text-xs select-none rounded-none ${
                  isDarkMode ? 'border-white/10 text-zinc-400' : 'border-slate-200 text-slate-500'
                }`}>
                  <span>
                    Mostrando <strong className={isDarkMode ? 'text-white' : 'text-zinc-900'}>{paginatedChanges.length}</strong> de <strong className={isDarkMode ? 'text-white' : 'text-zinc-900'}>{filteredChanges.length}</strong> discrepancias
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      className={`p-1 rounded-none border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-zinc-700'
                      }`}
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <span className={`font-mono px-2 text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      className={`p-1 rounded-none border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        isDarkMode
                          ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-zinc-700'
                      }`}
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'added' && (
            <div className="p-3.5 space-y-2 rounded-none">
              {newCount === 0 ? (
                <div className={`text-xs text-center py-8 rounded-none ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  <CheckCircle2 size={22} className="mx-auto mb-1.5 opacity-60" />
                  No se agregaron nuevos modelos en esta versión.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto custom-scrollbar p-0.5 rounded-none alysa-item-stagger">
                  {(added.length > 0 ? added : newModelsList).map((item, i) => {
                    const modelId = typeof item === 'object' ? (item.model_id || item['Model #']) : item;
                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-none border flex items-center justify-between ${
                          isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <PlusCircle size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
                          <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-none ${
                            isDarkMode ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
                          }`}>
                            {modelId}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-none text-xs font-medium border ${
                          isDarkMode ? 'bg-white/5 text-zinc-300 border-white/10' : 'bg-white text-slate-700 border-slate-200'
                        }`}>
                          Nuevo SKU
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'deleted' && (
            <div className="p-3.5 space-y-2 rounded-none">
              {deletedCount === 0 ? (
                <div className={`text-xs text-center py-8 rounded-none ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  <CheckCircle2 size={22} className="mx-auto mb-1.5 opacity-60" />
                  No se eliminó ningún modelo del catálogo base.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto custom-scrollbar p-0.5 rounded-none alysa-item-stagger">
                  {(deleted.length > 0 ? deleted : deletedModelsList).map((item, i) => {
                    const modelId = typeof item === 'object' ? (item.model_id || item['Model #']) : item;
                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-none border flex items-center justify-between ${
                          isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MinusCircle size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
                          <span className={`font-mono font-bold text-xs line-through ${
                            isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                          }`}>
                            {modelId}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-none text-xs font-medium border ${
                          isDarkMode ? 'bg-white/5 text-zinc-400 border-white/10' : 'bg-white text-slate-500 border-slate-200'
                        }`}>
                          Descatalogado
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER DE AYUDA CONVERSACIONAL MONOCROMÁTICO RECTO ── */}
        <div className={`px-3.5 py-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-xs rounded-none ${
          isDarkMode ? 'border-white/10 bg-black/40 text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'
        }`}>
          <span>
            Auditoría comparativa matricial completada celda por celda.
          </span>
          <span className="text-[11px] font-medium">
            Motor de Cotejo: <strong className={isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}>SERVEX Deterministic Engine</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
