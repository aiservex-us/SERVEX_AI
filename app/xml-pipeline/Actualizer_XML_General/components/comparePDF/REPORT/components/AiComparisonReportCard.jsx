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
  AlertCircle,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Table
} from 'lucide-react';
import Papa from 'papaparse';

/**
 * AiComparisonReportCard
 * Componente interactivo y conversacional que muestra los resultados de la
 * auditoría comparativa matricial (csv_raw vs csv_new_raw) directamente
 * dentro del flujo de chat de Servex AI Copilot.
 */
export default function AiComparisonReportCard({
  data,
  onCommandSelect,
  isDarkMode = true
}) {
  const [activeTab, setActiveTab] = useState('changes'); // 'changes' | 'added' | 'deleted'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
    <div className={`mt-3 w-full border rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl transition-all ${
      isDarkMode 
        ? 'border-white/10 bg-[#09090b]/85 text-zinc-100' 
        : 'border-slate-200 bg-white/95 text-slate-800'
    }`}>
      {/* ── HEADER DE LA TARJETA ── */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        isDarkMode 
          ? 'bg-gradient-to-r from-white/[0.06] via-transparent to-transparent border-white/10' 
          : 'bg-gradient-to-r from-slate-100/80 via-transparent to-transparent border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sliders size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider font-sans text-white">
                Auditoría Comparativa Matricial
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <ShieldCheck size={10} className="inline mr-1" /> XML Intacto
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Cotejo celda por celda entre catálogo base original y catálogo actualizado.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadDiffCsv}
          disabled={!changes.length}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white/10 hover:bg-white/15 border border-white/15 text-zinc-200 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          title="Descargar solo las diferencias detectadas en CSV"
        >
          <Download size={12} />
          <span>Exportar Discrepancias (.csv)</span>
        </button>
      </div>

      {/* ── KPIS / CONTADORES MÉTRICOS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-white/[0.02] border-b border-white/10 text-center">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Precios / Celdas</span>
          <span className="text-lg font-mono font-bold text-amber-400 mt-0.5 block">{changesCount}</span>
          <span className="text-[9px] text-zinc-400 font-medium">Modificaciones</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Nuevos Productos</span>
          <span className="text-lg font-mono font-bold text-emerald-400 mt-0.5 block">+{newCount}</span>
          <span className="text-[9px] text-zinc-400 font-medium">Altas de catálogo</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Descatalogados</span>
          <span className="text-lg font-mono font-bold text-rose-400 mt-0.5 block">-{deletedCount}</span>
          <span className="text-[9px] text-zinc-400 font-medium">Bajas de catálogo</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Modelos Evaluados</span>
          <span className="text-lg font-mono font-bold text-white mt-0.5 block">{totalEvaluated}</span>
          <span className="text-[9px] text-zinc-400 font-medium">Catálogo común</span>
        </div>
      </div>

      {/* ── BARRA DE PESTAÑAS Y BUSCADOR ── */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/[0.01]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setActiveTab('changes'); setCurrentPage(1); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'changes'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Table size={12} />
            <span>Discrepancias ({changesCount})</span>
          </button>

          <button
            onClick={() => { setActiveTab('added'); setCurrentPage(1); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'added'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PlusCircle size={12} className="text-emerald-400" />
            <span>Altas (+{newCount})</span>
          </button>

          <button
            onClick={() => { setActiveTab('deleted'); setCurrentPage(1); }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'deleted'
                ? 'bg-white text-zinc-950 shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MinusCircle size={12} className="text-rose-400" />
            <span>Bajas (-{deletedCount})</span>
          </button>
        </div>

        {activeTab === 'changes' && changes.length > 0 && (
          <div className="relative flex items-center">
            <Search size={11} className="absolute left-2.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar SKU o columna..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-white/5 border border-white/15 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all w-[150px] sm:w-[180px]"
            />
          </div>
        )}
      </div>

      {/* ── CONTENIDO PRINCIPAL: TABLA O LISTAS ── */}
      <div className="p-3">
        {activeTab === 'changes' && (
          <div>
            {filteredChanges.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-xs">
                <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-1.5" />
                No se detectaron discrepancias en precios ni opciones para este filtro.
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse text-[11px] min-w-[500px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-zinc-400 uppercase text-[9.5px] font-bold tracking-wider">
                      <th className="py-2 px-3">Model # (SKU)</th>
                      <th className="py-2 px-3">Campo / Opción</th>
                      <th className="py-2 px-3 text-right">Base Anterior</th>
                      <th className="py-2 px-3 text-right">Nuevo Valor</th>
                      <th className="py-2 px-3 text-center">Variación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {paginatedChanges.map((c, idx) => {
                      const impact = getImpact(c);
                      const isPositive = impact.startsWith('+');
                      const isNegative = impact.startsWith('-');
                      return (
                        <tr key={`${c.model_id}-${c.column_name}-${idx}`} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-2 px-3 font-mono font-bold text-white">
                            {c.model_id}
                          </td>
                          <td className="py-2 px-3 text-zinc-300">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-medium">
                              {c.column_name || c.original_column_name || 'List Price'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-zinc-400 text-right">
                            {formatVal(c.old_value)}
                          </td>
                          <td className="py-2 px-3 font-mono font-semibold text-white text-right">
                            {formatVal(c.new_value)}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded-full text-[9.5px] inline-flex items-center gap-0.5 ${
                              isPositive 
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                                : isNegative 
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' 
                                : 'bg-white/5 text-zinc-400 border border-white/10'
                            }`}>
                              {isPositive && <TrendingUp size={10} />}
                              {isNegative && <TrendingDown size={10} />}
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

            {/* Paginación interna */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-3 text-[10.5px] text-zinc-400 select-none">
                <span>
                  Mostrando <strong className="text-zinc-200">{paginatedChanges.length}</strong> de <strong className="text-zinc-200">{filteredChanges.length}</strong> discrepancias
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="font-mono text-zinc-200 px-1">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'added' && (
          <div className="space-y-2">
            {newCount === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-6">No se agregaron nuevos modelos en esta versión.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                {(added.length > 0 ? added : newModelsList).map((item, i) => {
                  const modelId = typeof item === 'object' ? (item.model_id || item['Model #']) : item;
                  return (
                    <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlusCircle size={14} className="text-emerald-400 shrink-0" />
                        <span className="font-mono font-bold text-xs text-white">{modelId}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold border border-emerald-500/20">
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
          <div className="space-y-2">
            {deletedCount === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-6">No se eliminó ningún modelo del catálogo base.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                {(deleted.length > 0 ? deleted : deletedModelsList).map((item, i) => {
                  const modelId = typeof item === 'object' ? (item.model_id || item['Model #']) : item;
                  return (
                    <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MinusCircle size={14} className="text-rose-400 shrink-0" />
                        <span className="font-mono font-bold text-xs text-zinc-300 line-through">{modelId}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 text-[10px] font-semibold border border-rose-500/20">
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

      {/* ── FOOTER DE AYUDA CONVERSACIONAL ── */}
      <div className="px-4 py-2.5 border-t border-white/10 bg-white/[0.02] flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-zinc-400">
        <span>
          ¿Deseas profundizar en las métricas visuales? Usa <button onClick={() => onCommandSelect && onCommandSelect('/graphicsDashboard')} className="font-mono font-bold text-white underline cursor-pointer hover:text-zinc-200">/graphicsDashboard</button>
        </span>
        <span className="text-[10px] text-zinc-400">
          Motor de Cotejo: <strong>SERVEX Deterministic Engine</strong>
        </span>
      </div>
    </div>
  );
}
