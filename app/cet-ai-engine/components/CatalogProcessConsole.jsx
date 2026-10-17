'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle2, Loader2, ChevronDown, ChevronUp, Cpu, Activity } from 'lucide-react';

const STATIC_STEPS = [
  { tag: 'STORAGE', text: 'Catálogo montado en buffer de memoria desde Supabase Storage' },
  { tag: 'DOM_PARSER', text: 'Analizando jerarquía XML DataContract nativa de CET Designer (lxml C-speed)...' },
  { tag: 'SCHEMA', text: 'Árbol raíz verificado: <Vendor>, <Product>, <Feature> [OK]' },
  { tag: 'SKU_INDEXER', text: 'Indexando catálogo de productos base y precios de lista en memoria...' },
  { tag: 'FEATURE_MAP', text: 'Mapeando familias de modificadores y componentes por modelo...' },
  { tag: 'OPTION_PRICE', text: 'Extrayendo árbol de opciones comerciales y deltas de recargo <OptionPrice>...' },
  { tag: 'VALIDATOR', text: 'Verificando integridad relacional CET 100% en memoria...' }
];

export default function CatalogProcessConsole({
  fileName = 'catalogo.xml',
  isCompleted = false,
  summary = null
}) {
  const [visibleStepsCount, setVisibleStepsCount] = useState(1);
  const [isExpanded, setIsExpanded] = useState(true);
  const [elapsedMs, setElapsedMs] = useState(0);
  const terminalRef = useRef(null);
  const startRef = useRef(Date.now());

  // Timer para tiempo transcurrido
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Progresión secuencial de logs en vivo mientras se procesa
  useEffect(() => {
    if (isCompleted) {
      setVisibleStepsCount(STATIC_STEPS.length + 1);
      return;
    }
    const stepInterval = setInterval(() => {
      setVisibleStepsCount((prev) => {
        if (prev < STATIC_STEPS.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 320);

    return () => clearInterval(stepInterval);
  }, [isCompleted]);

  // Auto-scroll al final del terminal cuando se agrega una línea
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleStepsCount, isCompleted]);

  const elapsedSeconds = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-[#464775]/25 shadow-xs bg-[#181926] text-slate-200">
      {/* Barra Superior estilo Terminal / Subprocess Monitor */}
      <div className="px-3 py-2 bg-[#202234] border-b border-[#464775]/20 flex items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          {/* Botones estilo ventana macOS */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80 block" />
          </div>

          <div className="flex items-center gap-1.5 ml-1 text-slate-300">
            <Terminal size={12} className="text-[#a5b4fc]" />
            <span className="text-[11px] font-mono font-bold tracking-tight text-slate-200">
              CET_MEMORY_ENGINE
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              · {fileName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge de Estado en Vivo */}
          {!isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[9.5px] font-bold">
              <Loader2 size={10} className="animate-spin text-amber-400" />
              <span>PROCESANDO EN VIVO · {elapsedSeconds}s</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[9.5px] font-bold">
              <CheckCircle2 size={10} className="text-emerald-400" />
              <span>DESESTRUCTURADO EN {elapsedSeconds}s</span>
            </span>
          )}

          {/* Botón Contraer / Expandir */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title={isExpanded ? 'Contraer consola' : 'Expandir consola'}
          >
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Cuerpo del Terminal */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              ref={terminalRef}
              className="p-3 font-mono text-[11px] leading-relaxed max-h-[170px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 space-y-1.5 text-slate-300 select-text"
            >
              {STATIC_STEPS.slice(0, visibleStepsCount).map((step, idx) => {
                const isStepFinished = isCompleted || idx < visibleStepsCount - 1;
                return (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500 select-none text-[10px] mt-0.5">
                      {`00:${String(idx + 1).padStart(2, '0')}`}
                    </span>
                    <span className="px-1 py-0.2 rounded bg-indigo-500/20 text-[#a5b4fc] border border-indigo-500/30 text-[9.5px] font-bold select-none shrink-0">
                      {step.tag}
                    </span>
                    <span className="flex-1 text-slate-300">
                      {idx === 0
                        ? `Catálogo montado en buffer de memoria desde Supabase Storage (${fileName})`
                        : step.text}
                    </span>
                    <span className="shrink-0">
                      {isStepFinished ? (
                        <span className="text-emerald-400 font-bold select-none text-[10px]">✔</span>
                      ) : (
                        <Loader2 size={10} className="animate-spin text-amber-400 inline" />
                      )}
                    </span>
                  </div>
                );
              })}

              {/* Paso Final al Completar */}
              {isCompleted && (
                <div className="flex items-start gap-2 pt-1 border-t border-white/10 text-emerald-300 font-bold">
                  <span className="text-slate-500 select-none text-[10px] mt-0.5">
                    {`00:${String(STATIC_STEPS.length + 1).padStart(2, '0')}`}
                  </span>
                  <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9.5px] select-none shrink-0">
                    READY
                  </span>
                  <span className="flex-1">
                    {summary
                      ? `Extracción finalizada: ${summary.total_products?.toLocaleString() || summary.products?.length || 0} SKUs, ${summary.total_features || summary.features_count || 0} Features y ${summary.total_options?.toLocaleString() || summary.options?.length || 0} Opciones listas en memoria.`
                      : 'Extracción y desestructuración finalizada exitosamente en memoria.'}
                  </span>
                  <span className="text-emerald-400 select-none text-[10px]">✔</span>
                </div>
              )}

              {/* Cursor parpadeante si sigue procesando */}
              {!isCompleted && (
                <div className="flex items-center gap-2 text-indigo-400">
                  <span className="text-slate-500 select-none text-[10px]">
                    {`00:${String(visibleStepsCount + 1).padStart(2, '0')}`}
                  </span>
                  <span className="text-indigo-400 font-bold">&gt;</span>
                  <span className="inline-block w-2 h-3.5 bg-indigo-400 animate-pulse ml-0.5" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
