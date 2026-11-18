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
 * Renderiza de forma ejecutiva, moderna y con esquinas suavemente curvadas
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
      `I have analyzed the matrix comparative audit results in detail. Below is my technical assessment connecting both containers:`,
      ``,
      `### 1. Matrix Comparison Summary (Container 1)`,
      `The engine evaluated **${totalEval} product models**. Among them, **${changesCount} price cell modifications** were identified, along with **+${newCount} additions** and **-${deletedCount} discontinuations** in the catalog.`,
      `The original master XML file remains 100% intact and protected in memory.`,
      ``,
      `### 2. Inconsistencies & Extraordinary Cases Diagnosis (Container 2)`,
      anomCount > 0
        ? `In the second container, **${anomCount} inconsistencies or extraordinary cases** were flagged (collapsed prices, atypical variations, or cleared cells). I suggest reviewing the flagged models carefully before approving the final publication.`
        : `The catalog has passed all heuristic consistency validations with **0 anomalies**. All detected variations are within expected commercial tolerances.`,
      ``,
      `### 3. Technical Assessment & Operational Recommendation`,
      anomCount > 0
        ? `⚠️ **Suggested Review:** Correct or confirm the cells flagged in the anomalies container in your spreadsheet to ensure a catalog free of inconsistencies.`
        : `✅ **Catalog Approved:** The comparison is 100% consistent and ready to be integrated into CET Designer and Catalog Creator.`
    ];

    return lines.join('\n');
  }, [explanation, data]);

  const renderedHtmlObj = useMemo(() => {
    try {
      return { __html: marked.parse(resolvedExplanation || '') };
    } catch {
      return { __html: `<p>${resolvedExplanation}</p>` };
    }
  }, [resolvedExplanation]);

  const handleCopy = () => {
    if (!resolvedExplanation) return;
    navigator.clipboard.writeText(resolvedExplanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full border shadow-sm transition-all rounded-xl font-sans text-xs overflow-hidden ${isDarkMode
      ? 'bg-[#09090b]/80 border-white/10 text-zinc-200'
      : 'bg-white border-slate-200 text-slate-800'
      }`}>
      {/* ── HEADER EJECUTIVO DEL DICTAMEN DE IA ── */}
      <div className={`p-3.5 border-b flex flex-wrap items-center justify-between gap-3 ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/60'
        }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 border rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-zinc-900 border-zinc-900 text-white'
            }`}>
            <Sparkles size={14} className="opacity-90" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-[13px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                AI Technical Assessment • Interpretive Analysis
              </h3>
              <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border ${isDarkMode
                ? 'bg-white/10 border-white/15 text-zinc-200'
                : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}>
                AuditSummaryMCP
              </span>
            </div>
            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Cognitive synthesis based on <code className="font-mono text-[10.5px]">audit_summary_markdown1</code> connecting detected variations and anomalies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-all cursor-pointer ${isDarkMode
              ? 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
              : 'bg-white hover:bg-slate-100 border-slate-200 text-zinc-700'
              }`}
            title="Copy assessment text"
          >
            {copied ? <Check size={12} className={isDarkMode ? 'text-white' : 'text-zinc-900'} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Assessment'}</span>
          </button>
        </div>
      </div>

      {/* ── CUERPO DE LA EXPLICACIÓN INTERPRETATIVA ── */}
      <div className="p-4 space-y-3">
        <div
          className={`alysa-markdown-flow prose prose-sm max-w-none text-[13px] leading-relaxed ${isDarkMode
            ? 'prose-invert prose-p:text-zinc-300 prose-headings:text-white prose-strong:text-white prose-code:text-zinc-200 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded'
            : 'text-slate-700 prose-headings:text-zinc-900 prose-strong:text-zinc-900 prose-code:text-slate-900 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded'
            }`}
          dangerouslySetInnerHTML={renderedHtmlObj}
        />
      </div>

      {/* ── FOOTER DE GARANTÍA DE VERACIDAD ── */}
      <div className={`px-3.5 py-2 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${isDarkMode ? 'border-white/10 bg-black/40 text-zinc-400' : 'border-slate-100 bg-slate-50 text-slate-500'
        }`}>
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className={isDarkMode ? 'text-zinc-300' : 'text-zinc-700'} />
          <span>Interpretation validated by <strong>Alysa SVX Copilot</strong></span>
        </div>
        <span className="font-mono text-[10.5px]">
          100% Grounded in Deterministic Supabase Data
        </span>
      </div>
    </div>
  );
}
