'use client';

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import Papa from 'papaparse';

/**
 * Componente AiAnomalyReportCard
 * Renderiza de forma ejecutiva, moderna y con esquinas angulares rectas (sin border-radius)
 * la detección heurística de anomalías comerciales (precios disparados, caídas drásticas,
 * precios a $0, celdas vaciadas y altas sin precio).
 *
 * Mantiene perfecta armonía tipográfica (text-xs para datos, text-base para métricas)
 * y el diseño monocromático con acentos semánticos reservados para la severidad.
 */
export default function AiAnomalyReportCard({
  data,
  onCommandSelect,
  isDarkMode = true
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'critical' | 'warning'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedSku, setCopiedSku] = useState(null);
  const itemsPerPage = 4;

  if (!data) return null;

  // ── EXTRACCIÓN Y DETECCIÓN HEURÍSTICA DE ANOMALÍAS ──
  const anomalies = useMemo(() => {
    // 1. Si el backend ya calculó anomalías estructuradas, priorizarlas
    if (Array.isArray(data.anomalies) && data.anomalies.length > 0) {
      return data.anomalies;
    }

    // 2. Cálculo heurístico de respaldo en el cliente
    const detected = [];
    const changes = data.detected_changes || [];
    const added = data.added_products || data.summary?.added_products_detailed || [];

    // Inspeccionar modificaciones de celdas
    for (const c of changes) {
      const m = String(c.model_id || '').trim();
      const col = String(c.column_name || c.original_column_name || 'List Price').trim();
      const oldVal = String(c.old_value ?? '').trim();
      const newVal = String(c.new_value ?? '').trim();

      const cleanOld = oldVal.replace(/[\$,\s]/g, '');
      const cleanNew = newVal.replace(/[\$,\s]/g, '');

      const ov = parseFloat(cleanOld);
      const nv = parseFloat(cleanNew);

      // Anomalía 1: Precio negativo
      if (!isNaN(nv) && nv < 0) {
        detected.push({
          model_id: m,
          column_name: col,
          old_value: oldVal,
          new_value: newVal,
          pct_change: null,
          severity: 'CRITICAL',
          type: 'NEGATIVE_PRICE',
          title: 'Precio Negativo Inválido',
          description: `El valor resultante (${newVal}) es un número negativo, lo cual es comercialmente inválido.`
        });
        continue;
      }

      // Anomalía 2: Precio colapsado a $0.00
      if (!isNaN(nv) && nv === 0 && !isNaN(ov) && ov > 0) {
        detected.push({
          model_id: m,
          column_name: col,
          old_value: oldVal,
          new_value: newVal,
          pct_change: -100.0,
          severity: 'CRITICAL',
          type: 'ZERO_PRICE',
          title: 'Precio Colapsado a $0.00',
          description: `El precio de '${col}' cayó a $0.00 desde ${oldVal}. Posible omisión involuntaria al guardar en Excel.`
        });
        continue;
      }

      // Anomalía 3: Variaciones extremas de precio
      if (!isNaN(ov) && !isNaN(nv) && ov > 0) {
        const pct = ((nv - ov) / ov) * 100;
        if (pct > 100) {
          detected.push({
            model_id: m,
            column_name: col,
            old_value: oldVal,
            new_value: newVal,
            pct_change: Number(pct.toFixed(1)),
            severity: pct >= 300 ? 'CRITICAL' : 'WARNING',
            type: 'EXTREME_INCREASE',
            title: `Aumento Drástico (+${pct.toFixed(1)}%)`,
            description: `El precio subió de ${oldVal} a ${newVal} (+${pct.toFixed(1)}%), superando con creces el rango de incremento comercial normal.`
          });
        } else if (pct < -40) {
          detected.push({
            model_id: m,
            column_name: col,
            old_value: oldVal,
            new_value: newVal,
            pct_change: Number(pct.toFixed(1)),
            severity: pct <= -60 ? 'CRITICAL' : 'WARNING',
            type: 'EXTREME_DECREASE',
            title: `Reducción Drástica (${pct.toFixed(1)}%)`,
            description: `El precio cayó de ${oldVal} a ${newVal} (${pct.toFixed(1)}%). Verifique si este descuento abrupto es intencional para evitar pérdida de margen.`
          });
        }
      } else if (oldVal && !newVal) {
        // Celda vaciada
        detected.push({
          model_id: m,
          column_name: col,
          old_value: oldVal,
          new_value: '--- (Vacío)',
          pct_change: null,
          severity: 'WARNING',
          type: 'CLEARED_CELL',
          title: 'Celda Vaciada o Nula',
          description: `La columna '${col}' tenía el valor '${oldVal}' en el catálogo original y ahora quedó vacía.`
        });
      }
    }

    // Inspeccionar altas sin precio
    for (const p of added) {
      const m = String(p.model_id || p['Model #'] || '').trim();
      const fields = p.fields || p;
      let lpVal = null;
      for (const [k, v] of Object.entries(fields)) {
        if (String(k).toUpperCase().includes('LIST') && String(k).toUpperCase().includes('PRICE')) {
          lpVal = String(v ?? '').trim();
          break;
        }
      }
      if (lpVal !== null) {
        const flp = parseFloat(lpVal.replace(/[\$,\s]/g, ''));
        if (flp === 0 || lpVal === '$0' || lpVal === '$0.00') {
          detected.push({
            model_id: m,
            column_name: 'List Price',
            old_value: 'N/A (Alta)',
            new_value: lpVal || '$0.00',
            pct_change: null,
            severity: 'WARNING',
            type: 'NEW_PRODUCT_ZERO_PRICE',
            title: 'Alta de SKU con Precio $0.00',
            description: `El nuevo producto '${m}' fue añadido al catálogo pero tiene precio de lista en $0.00.`
          });
        }
      }
    }

    return detected;
  }, [data]);

  // Contadores por severidad
  const criticalCount = useMemo(() => anomalies.filter(a => a.severity === 'CRITICAL').length, [anomalies]);
  const warningCount = useMemo(() => anomalies.filter(a => a.severity === 'WARNING').length, [anomalies]);

  // Filtrado por pestaña y búsqueda
  const filteredAnomalies = useMemo(() => {
    let list = anomalies;
    if (activeTab === 'critical') list = list.filter(a => a.severity === 'CRITICAL');
    if (activeTab === 'warning') list = list.filter(a => a.severity === 'WARNING');

    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase().trim();
    return list.filter(a =>
      String(a.model_id || '').toLowerCase().includes(q) ||
      String(a.column_name || '').toLowerCase().includes(q) ||
      String(a.title || '').toLowerCase().includes(q) ||
      String(a.description || '').toLowerCase().includes(q)
    );
  }, [anomalies, activeTab, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredAnomalies.length / itemsPerPage) || 1;
  const paginatedAnomalies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAnomalies.slice(start, start + itemsPerPage);
  }, [filteredAnomalies, currentPage]);

  const handleCopySku = (sku) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && sku) {
      navigator.clipboard.writeText(sku);
      setCopiedSku(sku);
      setTimeout(() => setCopiedSku(null), 1800);
    }
  };

  const handleDownloadAnomaliesCsv = () => {
    if (!anomalies.length) return;
    const csvData = anomalies.map(a => ({
      'Model #': a.model_id,
      'Severity': a.severity,
      'Type': a.type,
      'Title': a.title,
      'Field / Option': a.column_name,
      'Old Value': a.old_value,
      'New Value': a.new_value,
      'Variation %': a.pct_change !== null ? `${a.pct_change}%` : '---',
      'Description': a.description
    }));
    const csv = Papa.unparse(csvData, { delimiter: ';' });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Catalog_Anomalies_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`mt-3 space-y-3 font-sans text-left text-[13px] md:text-[13.5px] leading-relaxed rounded-none ${
      isDarkMode ? 'text-zinc-100' : 'text-gray-800'
    }`}>
      {/* ── TARJETA PRINCIPAL DE ANOMALÍAS CON ESQUINAS RECTAS ── */}
      <div
        className={`w-full rounded-none border transition-colors overflow-hidden ${
          isDarkMode
            ? 'bg-[#09090b]/80 border-white/10 text-zinc-100 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]'
            : 'bg-white/90 border-slate-200/90 text-gray-800 shadow-sm backdrop-blur-md'
        }`}
      >
        {/* Cabecera ejecutiva */}
        {/* Cabecera ejecutiva */}
        <div className={`p-4 border-b rounded-none ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-none ${isDarkMode ? 'bg-white/10 text-white' : 'bg-zinc-900/10 text-zinc-900'} flex items-center justify-center shrink-0`}>
                  {anomalies.length > 0 ? <ShieldAlert size={13} className="opacity-90" /> : <ShieldCheck size={13} className="opacity-80" />}
                </div>
                <h3 className={`text-[13.5px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Detección de Anomalías e Inconsistencias
                </h3>
                <span className={`px-2 py-0.5 rounded-none text-[9.5px] font-mono font-bold border inline-flex items-center ${
                  isDarkMode
                    ? 'bg-white/10 text-zinc-200 border-white/15'
                    : 'bg-slate-200 text-slate-800 border-slate-300'
                }`}>
                  {criticalCount > 0 && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500/80 mr-1.5 shrink-0" />
                  )}
                  {anomalies.length === 0 ? 'Catálogo 100% Seguro' : `${anomalies.length} Casos Inusuales`}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Identificación automática de saltos de precio desmedidos, valores en $0, celdas vacías y posibles errores tipográficos.
              </p>
            </div>

            {anomalies.length > 0 && (
              <button
                onClick={handleDownloadAnomaliesCsv}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  isDarkMode
                    ? 'bg-white text-zinc-950 hover:bg-zinc-200 border-white'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900'
                }`}
                title="Descargar listado de anomalías e inconsistencias en CSV"
              >
                <Download size={13} />
                <span>Exportar Anomalías (.csv)</span>
              </button>
            )}
          </div>
        </div>

        {/* ── KPIS DE ANOMALÍAS EN ESCALA SOBRIA Y ARMONIOSA ── */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 p-3.5 border-b rounded-none ${
          isDarkMode ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`p-2.5 rounded-none border text-center transition-all ${
            isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]' : 'bg-white border-slate-200'
          }`}>
            <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Total Inconsistencias
            </span>
            <span className={`text-base sm:text-[17px] font-mono font-extrabold mt-0.5 block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              {anomalies.length}
            </span>
            <span className={`text-[9.5px] font-medium block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Casos atípicos
            </span>
          </div>

          <div className={`p-2.5 rounded-none border text-center transition-all ${
            isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]' : 'bg-white border-slate-200'
          }`}>
            <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Riesgo Crítico
            </span>
            <span className={`text-base sm:text-[17px] font-mono font-extrabold mt-0.5 inline-flex items-center justify-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              <span>{criticalCount}</span>
              {criticalCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500/80 inline-block" title="Incidencias críticas detectadas" />
              )}
            </span>
            <span className={`text-[9.5px] font-medium block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Precios $0 o caídas &gt; 40%
            </span>
          </div>

          <div className={`p-2.5 rounded-none border text-center transition-all ${
            isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]' : 'bg-white border-slate-200'
          }`}>
            <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Advertencias
            </span>
            <span className={`text-base sm:text-[17px] font-mono font-extrabold mt-0.5 block ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              {warningCount}
            </span>
            <span className={`text-[9.5px] font-medium block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Aumentos &gt; 100% o vacíos
            </span>
          </div>

          <div className={`p-2.5 rounded-none border text-center transition-all ${
            isDarkMode ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]' : 'bg-white border-slate-200'
          }`}>
            <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Dictamen de IA
            </span>
            <span className={`text-xs font-mono font-bold mt-1 block uppercase ${
              isDarkMode ? 'text-zinc-200' : 'text-zinc-800'
            }`}>
              {anomalies.length === 0 ? 'Confiable' : criticalCount > 0 ? 'Requiere Ajuste' : 'Bajo Revisión'}
            </span>
            <span className={`text-[9.5px] font-medium block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Heurística de Catálogo
            </span>
          </div>
        </div>

        {/* ── BARRA DE PESTAÑAS Y BUSCADOR (SI EXISTEN ANOMALÍAS) ── */}
        {anomalies.length > 0 && (
          <div className={`px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 border-b rounded-none ${
            isDarkMode ? 'border-white/10 bg-white/[0.01]' : 'border-slate-200 bg-slate-50/60'
          }`}>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                className={`px-2.5 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeTab === 'all'
                    ? isDarkMode
                      ? 'bg-white text-zinc-950 border-white shadow-2xs font-bold'
                      : 'bg-zinc-900 text-white border-zinc-900 shadow-2xs font-bold'
                    : isDarkMode
                    ? 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'
                    : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-100 border-transparent'
                }`}
              >
                <Filter size={12} />
                <span>Todas ({anomalies.length})</span>
              </button>

              <button
                onClick={() => { setActiveTab('critical'); setCurrentPage(1); }}
                className={`px-2.5 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeTab === 'critical'
                    ? isDarkMode
                      ? 'bg-white text-zinc-950 border-white shadow-2xs font-bold'
                      : 'bg-zinc-900 text-white border-zinc-900 shadow-2xs font-bold'
                    : isDarkMode
                    ? 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'
                    : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-100 border-transparent'
                }`}
              >
                <AlertTriangle size={12} className={criticalCount > 0 ? 'text-rose-400/80' : 'opacity-70'} />
                <span>Críticas ({criticalCount})</span>
              </button>

              <button
                onClick={() => { setActiveTab('warning'); setCurrentPage(1); }}
                className={`px-2.5 py-1.5 rounded-none text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeTab === 'warning'
                    ? isDarkMode
                      ? 'bg-white text-zinc-950 border-white shadow-2xs font-bold'
                      : 'bg-zinc-900 text-white border-zinc-900 shadow-2xs font-bold'
                    : isDarkMode
                    ? 'text-zinc-400 hover:text-white hover:bg-white/5 border-transparent'
                    : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-100 border-transparent'
                }`}
              >
                <AlertCircle size={12} className="opacity-70" />
                <span>Advertencias ({warningCount})</span>
              </button>
            </div>

            <div className="relative flex items-center">
              <Search size={12} className={`absolute left-2.5 pointer-events-none ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Buscar en anomalías..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className={`rounded-none pl-7 pr-2.5 py-1 text-xs font-medium transition-all w-[160px] sm:w-[190px] border focus:outline-none ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/30 focus:bg-white/10'
                    : 'bg-slate-100 border-slate-200 text-zinc-900 placeholder:text-slate-400 focus:border-zinc-400 focus:bg-white'
                }`}
              />
            </div>
          </div>
        )}

        {/* ── CONTENIDO PRINCIPAL: LISTA DE ANOMALÍAS O BANNER DE INTEGRIDAD ── */}
        <div className="p-3.5 space-y-2.5 rounded-none">
          {anomalies.length === 0 ? (
            <div className={`p-6 text-center rounded-none border ${
              isDarkMode
                ? 'bg-white/[0.02] border-white/10 text-zinc-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <CheckCircle2 size={24} className="mx-auto mb-2 text-zinc-300 opacity-80" />
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Auditoría de Integridad Certificada
              </h4>
              <p className={`text-xs mt-1 max-w-xl mx-auto ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                No se detectaron valores anómalos ni inconsistencias comerciales. Todos los precios actualizados, opciones y celdas cumplen con los márgenes y reglas esperadas del catálogo.
              </p>
            </div>
          ) : filteredAnomalies.length === 0 ? (
            <div className={`py-10 text-center text-xs rounded-none ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              <CheckCircle2 size={22} className="mx-auto mb-2 opacity-60" />
              No hay anomalías que coincidan con el filtro seleccionado.
            </div>
          ) : (
            <div key={`anom-${activeTab}-${currentPage}-${searchTerm}`} className="grid grid-cols-1 gap-2 rounded-none alysa-item-stagger">
              {paginatedAnomalies.map((anom, idx) => {
                const isCrit = anom.severity === 'CRITICAL';
                return (
                  <div
                    key={`${anom.model_id}-${anom.column_name}-${idx}`}
                    className={`p-3 rounded-none border transition-all ${
                      isCrit
                        ? isDarkMode
                          ? 'bg-white/[0.02] border-white/10 hover:border-white/20 border-l-2 border-l-rose-500/60'
                          : 'bg-white border-slate-200 hover:border-slate-300 border-l-2 border-l-rose-500/70'
                        : isDarkMode
                        ? 'bg-white/[0.02] border-white/10 hover:border-white/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header de la tarjeta de anomalía */}
                    <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2 rounded-none ${
                      isDarkMode ? 'border-white/10' : 'border-slate-100'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-none text-[9.5px] font-mono font-bold uppercase border tracking-wider inline-flex items-center ${
                          isCrit
                            ? isDarkMode
                              ? 'bg-white/5 text-zinc-200 border-white/15'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                            : isDarkMode
                            ? 'bg-white/5 text-zinc-400 border-white/10'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {isCrit && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500/80 mr-1.5 shrink-0" />
                          )}
                          {isCrit ? 'Crítica' : 'Advertencia'}
                        </span>
                        <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                          {anom.title}
                        </h4>
                      </div>

                      {/* SKU con copiado rápido */}
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-none ${
                          isDarkMode ? 'bg-white text-zinc-950 shadow-2xs' : 'bg-zinc-900 text-white'
                        }`}>
                          {anom.model_id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySku(anom.model_id)}
                          title="Copiar SKU"
                          className={`p-1 rounded-none transition-colors cursor-pointer ${
                            isDarkMode
                              ? 'text-zinc-500 hover:text-white hover:bg-white/10'
                              : 'text-zinc-400 hover:text-zinc-900 hover:bg-slate-200'
                          }`}
                        >
                          {copiedSku === anom.model_id ? (
                            <Check size={11} className={isDarkMode ? 'text-white' : 'text-zinc-900'} />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Descripción en lenguaje natural */}
                    <p className={`text-xs mt-2 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      {anom.description}
                    </p>

                    {/* Comparación de valores en píldoras sobrias */}
                    <div className={`flex flex-wrap items-center gap-2.5 mt-2.5 pt-2 border-t border-dashed ${
                      isDarkMode ? 'border-white/10' : 'border-slate-100'
                    } text-xs`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                          Campo:
                        </span>
                        <span className={`font-mono px-1.5 py-0.5 rounded-none text-xs border ${
                          isDarkMode ? 'bg-white/5 border-white/10 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}>
                          {anom.column_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                          Base Original:
                        </span>
                        <span className={`font-mono text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {anom.old_value || '---'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                          Nuevo Valor:
                        </span>
                        <span className={`font-mono text-xs font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                          {anom.new_value || '---'}
                        </span>
                      </div>

                      {anom.pct_change !== null && (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                            Variación:
                          </span>
                          <span className={`px-2 py-0.5 rounded-none font-mono text-xs font-bold border ${
                            anom.pct_change < 0
                              ? isDarkMode
                                ? 'bg-rose-500/10 text-rose-300/90 border-rose-500/20'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                              : isDarkMode
                              ? 'bg-white/5 text-zinc-200 border-white/10'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            {anom.pct_change > 0 ? `+${anom.pct_change}%` : `${anom.pct_change}%`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-between pt-2 px-1 text-xs select-none rounded-none ${
              isDarkMode ? 'text-zinc-400' : 'text-slate-500'
            }`}>
              <span>
                Mostrando <strong className={isDarkMode ? 'text-white' : 'text-zinc-900'}>{paginatedAnomalies.length}</strong> de <strong className={isDarkMode ? 'text-white' : 'text-zinc-900'}>{filteredAnomalies.length}</strong> inconsistencias
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

        {/* ── FOOTER DE ACCIÓN RECOMENDADA ── */}
        <div className={`px-3.5 py-2.5 border-t flex flex-wrap items-center justify-between gap-2 text-xs rounded-none ${
          isDarkMode ? 'border-white/10 bg-black/40 text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'
        }`}>
          <span>
            {anomalies.length > 0 ? (
              'Se recomienda revisar las inconsistencias detectadas antes de publicar el catálogo.'
            ) : (
              'El catálogo ha superado todas las pruebas de validación heurística con 100% de consistencia.'
            )}
          </span>
          <span className="text-[11px] font-medium">
            Monitor de Integridad: <strong className={isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}>SERVEX Heuristic Engine</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
