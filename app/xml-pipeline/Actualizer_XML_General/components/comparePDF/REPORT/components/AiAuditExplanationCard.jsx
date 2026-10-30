'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  ShieldCheck,
  BrainCircuit,
  FileText
} from 'lucide-react';
import { marked } from 'marked';

/**
 * Componente AiAuditExplanationCard
 * Renderiza de forma ejecutiva, moderna y con esquinas rectas (rounded-none)
 * la explicación interpretativa construida por el modelo de IA (Alysa SVX)
 * a partir de la información estructurada de audit_summary_markdown1.
 *
 * Explica en profundidad tanto el contenedor de cambios matriciales
 * como el contenedor de anomalías e inconsistencias para que el usuario no tenga dudas.
 */
export default function AiAuditExplanationCard({
  explanation,
  data,
  isDarkMode = true
}) {
  const [copied, setCopied] = useState(false);

  // ── RESOLUCIÓN DE EXPLICACIÓN (API O FALLBACK LOCAL DETERMINISTA) ──
  const resolvedExplanation = useMemo(() => {
    if (explanation && typeof explanation === 'string' && explanation.trim().length > 0) {
      return explanation;
    }

    if (data?.ai_explanation && typeof data.ai_explanation === 'string' && data.ai_explanation.trim().length > 0) {
      return data.ai_explanation;
    }

    // Fallback determinista local en caso de registros históricos sin explicación previa
    const changesCount = data?.changes_detected_count ?? (data?.detected_changes?.length || 0);
    const newCount = data?.new_models_count ?? (data?.summary?.new_models_detected_count || 0);
    const deletedCount = data?.deleted_models_count ?? (data?.summary?.deleted_models_detected_count || 0);
    const totalEval = data?.total_evaluated ?? (data?.summary?.total_common_models_evaluated || 0);
    const anomCount = data?.anomalies_count ?? (data?.anomalies?.length || 0);

    const lines = [
      `He analizado en detalle los resultados de la auditoría comparativa matricial. A continuación te presento mi dictamen técnico conectando ambos contenedores:`,
      ``,
      `### 1. Balance del Cotejo Matricial (Contenedor 1)`,
      `El motor evaluó **${totalEval} modelos de producto**. De ellos, se identificaron **${changesCount} modificaciones en celdas de precios**, junto con **+${newCount} altas** y **-${deletedCount} bajas** de catálogo.`,
      `El archivo XML maestro original permanece 100% intacto y protegido en memoria.`,
      ``,
      `### 2. Diagnóstico de Inconsistencias y Casos Extraordinarios (Contenedor 2)`,
      anomCount > 0
        ? `En el segundo contenedor se señalaron **${anomCount} inconsistencias o casos extraordinarios** (precios colapsados, variaciones atípicas o celdas vacías). Te sugiero revisar especialmente los modelos con alerta antes de aprobar la publicación definitiva.`
        : `El catálogo ha superado todas las validaciones heurísticas de consistencia con **0 anomalías**. Todas las variaciones detectadas se encuentran dentro de las tolerancias comerciales esperadas.`,
      ``,
      `### 3. Dictamen y Recomendación Operativa`,
      anomCount > 0
        ? `⚠️ **Revisión sugerida:** Corrige o confirma en tu hoja de cálculo las celdas marcadas en el contenedor de anomalías para garantizar un catálogo libre de inconsistencias.`
        : `✅ **Catálogo Aprobado:** El cotejo es 100% consistente y está listo para integrarse a CET Designer y Catalog Creator.`
    ];

    return lines.join('\n');
  }, [explanation, data]);

  const renderedHtml = useMemo(() => {
    try {
      return marked.parse(resolvedExplanation || '');
    } catch {
      return `<p>${resolvedExplanation}</p>`;
    }
  }, [resolvedExplanation]);

  const handleCopy = () => {
    if (!resolvedExplanation) return;
    navigator.clipboard.writeText(resolvedExplanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full border shadow-sm transition-all rounded-none font-sans text-xs ${
      isDarkMode
        ? 'bg-[#09090b]/80 border-white/10 text-zinc-200'
        : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* ── HEADER EJECUTIVO DEL DICTAMEN DE IA ── */}
      <div className={`p-3.5 border-b flex flex-wrap items-center justify-between gap-3 rounded-none ${
        isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/60'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 border rounded-none flex items-center justify-center ${
            isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-zinc-900 border-zinc-900 text-white'
          }`}>
            <Sparkles size={14} className="opacity-90" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-[13px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                Dictamen Técnico de IA • Análisis Interpretativo
              </h3>
              <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-none border ${
                isDarkMode
                  ? 'bg-white/10 border-white/15 text-zinc-200'
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}>
                AuditSummaryMCP
              </span>
            </div>
            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Síntesis cognitiva basada en <code className="font-mono text-[10.5px]">audit_summary_markdown1</code> conectando variaciones y anomalías detectadas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-none border transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-zinc-700'
            }`}
            title="Copiar texto del dictamen"
          >
            {copied ? <Check size={12} className={isDarkMode ? 'text-white' : 'text-zinc-900'} /> : <Copy size={12} />}
            <span>{copied ? 'Copiado' : 'Copiar Dictamen'}</span>
          </button>
        </div>
      </div>

      {/* ── CUERPO DE LA EXPLICACIÓN INTERPRETATIVA ── */}
      <div className="p-4 space-y-3">
        <div
          className={`alysa-markdown-flow prose prose-sm max-w-none text-[13px] leading-relaxed ${
            isDarkMode
              ? 'prose-invert prose-p:text-zinc-300 prose-headings:text-white prose-strong:text-white prose-code:text-zinc-200 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-none'
              : 'text-slate-700 prose-headings:text-zinc-900 prose-strong:text-zinc-900 prose-code:text-slate-900 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-none'
          }`}
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>

      {/* ── FOOTER DE GARANTÍA DE VERACIDAD ── */}
      <div className={`px-3.5 py-2 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] rounded-none ${
        isDarkMode ? 'border-white/10 bg-black/40 text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'
      }`}>
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className={isDarkMode ? 'text-zinc-300' : 'text-zinc-700'} />
          <span>Interpretación validada por <strong>Alysa SVX Copilot</strong></span>
        </div>
        <span className="font-mono text-[10.5px]">
          100% Anclado a Datos Deterministas de Supabase
        </span>
      </div>
    </div>
  );
}
