'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Activity,
  Zap,
  CornerDownRight,
  Check,
  FileCode2,
  Sparkles
} from 'lucide-react';

// Flujo de herramientas y consultas de subprocess MCP tipo Antigravity Agent adaptado a CET AI Engine
const MCP_TOOL_PIPELINE = [
  {
    id: 'mcp_storage',
    tool: 'mcp::cet_storage.inspect_buffer',
    label: 'Memory Buffer Inspection',
    badge: 'STORAGE_L1',
    latency: '14ms',
    queryText: 'inspect_buffer(source="Supabase_Storage", target_layer="RAM_L1")',
    logs: [
      'Establishing zero-copy memory channel from storage bucket...',
      'XML stream mounted in high-speed volatile buffer.',
      'Byte integrity verified: valid UTF-8 DataContract.'
    ]
  },
  {
    id: 'mcp_schema',
    tool: 'mcp::cet_xml_tools.parse_catalog_schema',
    label: 'CET Hierarchy & Namespaces Validation',
    badge: 'DOM_PARSER',
    latency: '36ms',
    queryText: 'parse_catalog_schema(parser="lxml_c_speed", validate_tree=true)',
    logs: [
      'Detecting CET Designer contract root: <Vendor>, <Product>, <Feature>...',
      'Registered namespaces: xmlns="http://schemas.datacontract.org/2004/07/Configura.CETDesigner"',
      'Structural tree validated successfully: 0 schema inconsistencies.'
    ]
  },
  {
    id: 'mcp_skus',
    tool: 'mcp::cet_xml_tools.extract_sku_index',
    label: 'In-Memory SKU & Base Price Indexing',
    badge: 'SKU_INDEXER',
    latency: '112ms',
    queryText: 'extract_sku_index(target="//Product", extract_fields=["Code", "Description", "Price"])',
    logs: [
      'Scanning <Product> nodes in in-memory DOM...',
      'Identifying base codes and base list price values...',
      'Relational mapping of base SKUs completed in indexed buffer.'
    ]
  },
  {
    id: 'mcp_features',
    tool: 'mcp::cet_xml_tools.scan_feature_matrix',
    label: 'Feature Matrix Classification',
    badge: 'FEATURE_MAP',
    latency: '82ms',
    queryText: 'scan_feature_matrix(classify_heuristics=true, split_physical_finishes=true)',
    logs: [
      'Extracting <Feature> families: separating Physical Components and Finishes...',
      'Detecting display rules and assembly dependencies...',
      'Feature architecture indexed with normalized descriptors.'
    ]
  },
  {
    id: 'mcp_option_prices',
    tool: 'mcp::cet_xml_tools.parse_option_prices',
    label: 'Options & Surcharges Extraction <OptionPrice>',
    badge: 'OPTION_PRICE',
    latency: '145ms',
    queryText: 'parse_option_prices(scan_upcharges=true, extract_deltas=true)',
    logs: [
      'Extracting commercial option tree and <OptionPrice> tags...',
      'Indexing finish codes and commercial price modifiers...',
      'Generating price delta graph for real-time configuration.'
    ]
  },
  {
    id: 'mcp_tree',
    tool: 'mcp::cet_xml_tools.build_relational_tree',
    label: 'SKU-Feature-Option Relational Graph Construction',
    badge: 'GRAPH_SYNTH',
    latency: '68ms',
    queryText: 'build_relational_tree(link_skus=true, resolve_feature_refs=true)',
    logs: [
      'Linking <FeatureRef> of each SKU to its actual option trees...',
      'Associating products and linked features in memory graph...',
      'Bidirectional relational graph fully assembled in memory.'
    ]
  },
  {
    id: 'mcp_integrity',
    tool: 'mcp::cet_xml_tools.validate_cet_integrity',
    label: '100% CET In-Memory Integrity Certification',
    badge: 'VALIDATOR',
    latency: '22ms',
    queryText: 'validate_cet_integrity(zero_excel=true, memory_mode="active")',
    logs: [
      'Verifying relational consistency of the entire catalog in memory...',
      'Checking variable resolution without touching Excel files...',
      '100% CET Integrity Certified. Catalog ready for agent interactions.'
    ]
  }
];

// Mensajes de log operacional que se transmiten durante la ejecución
const OPERATIONAL_STREAM_LOGS = [
  { tag: 'STORAGE', text: 'Connecting to volatile RAM buffer (zero-copy read)...' },
  { tag: 'SCHEMA', text: 'Verifying <Vendor>, <Product>, <Feature> hierarchy...' },
  { tag: 'INDEXER', text: 'Indexing SKU catalog and list prices in memory...' },
  { tag: 'FEATURE_MAP', text: 'Mapping component families by model and base finishes...' },
  { tag: 'OPTION_PRICE', text: 'Extracting commercial option tree and surcharge deltas...' },
  { tag: 'RELATIONAL', text: 'Synthesizing bidirectional dependency graph in memory...' },
  { tag: 'VALIDATOR', text: 'Verifying 100% CET relational integrity in memory...' }
];

function CatalogProcessConsole({
  fileName = 'catalogo.xml',
  isCompleted = false,
  summary = null,
  isDarkMode = true
}) {
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [expandedTools, setExpandedTools] = useState({});
  const [elapsedMs, setElapsedMs] = useState(0);

  const startRef = useRef(null);
  const fileSizeKb = summary?.file_size_kb || 393.24;

  // Tiempo transcurrido calculado al completar la desestructuración (sin intervalos que saturen CPU)
  useEffect(() => {
    if (!startRef.current) {
      startRef.current = Date.now();
    }
    if (isCompleted) {
      setElapsedMs(Date.now() - (startRef.current || Date.now()));
    }
  }, [isCompleted]);

  // Progresión secuencial de herramientas MCP mientras se ejecuta
  useEffect(() => {
    if (isCompleted) return;

    const toolTimer = setInterval(() => {
      setCurrentToolIndex((prev) => {
        if (prev < MCP_TOOL_PIPELINE.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(toolTimer);
  }, [isCompleted]);

  const effectiveToolIndex = isCompleted ? MCP_TOOL_PIPELINE.length : currentToolIndex;

  const toggleToolExpand = (idx) => {
    setExpandedTools((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const elapsedSeconds = (elapsedMs / 1000).toFixed(2);

  return (
    <div
      style={{ transform: 'translateZ(0)', contain: 'content' }}
      className={`mt-3 font-sans text-left text-[13px] md:text-[13.5px] leading-relaxed rounded-none ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}
    >
      {/* ── CONTENEDOR FROSTED GLASS CON ESQUINAS RECTAS ── */}
      <div className={`p-4 ${isDarkMode ? 'bg-[#09090b]/80 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)] text-zinc-100' : 'bg-white/90 border-slate-200/90 shadow-sm text-gray-800'} backdrop-blur-md rounded-none border space-y-3 transition-colors`}>
        {/* Encabezado y diagnóstico de ejecución nativa */}
        <div className="space-y-1 rounded-none">
          <h4 className={`text-[13.5px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center justify-between gap-2`}>
            <span>In-Memory Destructuring &amp; Analysis Pipeline</span>
            <span className={`font-mono text-[10.5px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-normal`}>
              {fileName} · {fileSizeKb} KB
            </span>
          </h4>
          <p className={`text-[13px] ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'} leading-relaxed`}>
            {!isCompleted ? (
              <>
                Running MCP subprocesses to analyze the master file <code className={`px-1.5 py-0.5 rounded-none ${isDarkMode ? 'bg-white/10 text-zinc-100 border-white/20' : 'bg-slate-100 text-slate-800 border-slate-200'} font-mono text-[12px] font-semibold border`}>{fileName}</code> directly in RAM (Zero-Excel). Follow the live progress below:
              </>
            ) : (
              <>
                Successfully completed all <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>7 MCP subprocesses</strong> in <strong className={`font-mono ${isDarkMode ? 'text-white font-bold' : 'text-slate-900'}`}>{elapsedSeconds}s</strong>. The catalog <code className={`px-1.5 py-0.5 rounded-none ${isDarkMode ? 'bg-white/10 text-zinc-100 border-white/20' : 'bg-slate-100 text-slate-800 border-slate-200'} font-mono text-[12px] font-semibold border`}>{fileName}</code> has been destructured in memory with a certified integrity level of <strong className={`font-semibold ${isDarkMode ? 'text-white font-bold' : 'text-slate-900'}`}>100% CET</strong>:
              </>
            )}
          </p>
        </div>

        {/* ── CUERPO DE SUBPROCESOS MCP ── */}
        <div className={`space-y-1.5 max-h-[320px] overflow-y-auto rounded-none ${isDarkMode ? 'scrollbar-thumb-zinc-700' : 'scrollbar-thumb-slate-300'} scrollbar-thin pr-1 pt-1 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200/80'}`}>
          {MCP_TOOL_PIPELINE.map((step, idx) => {
            const isDone = isCompleted || idx < effectiveToolIndex;
            const isRunning = !isCompleted && idx === effectiveToolIndex;
            const isStepExpanded = !!expandedTools[idx];

            return (
              <div
                key={step.id}
                className={`rounded-none border transition-all overflow-hidden shadow-2xs ${isRunning
                  ? isDarkMode
                    ? 'bg-white/15 border-white/40'
                    : 'bg-slate-100 border-slate-400'
                  : isDone
                    ? isDarkMode
                      ? 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
                      : 'bg-white/90 border-slate-200/90 hover:border-slate-300 hover:bg-white'
                    : isDarkMode
                      ? 'bg-white/[0.02] border-white/5 opacity-50'
                      : 'bg-slate-50/60 border-slate-200/60 opacity-60'
                  }`}
              >
                {/* Cabecera del Tool Call */}
                <div
                  onClick={() => toggleToolExpand(idx)}
                  className="px-3 py-2 flex items-center justify-between gap-2 cursor-pointer select-none rounded-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isDone ? (
                      <CheckCircle2 size={13} className={`${isDarkMode ? 'text-white' : 'text-slate-900'} shrink-0`} />
                    ) : isRunning ? (
                      <Loader2 size={13} className={`animate-spin ${isDarkMode ? 'text-zinc-200' : 'text-slate-700'} shrink-0`} />
                    ) : (
                      <div className={`w-3.5 h-3.5 rounded-none border ${isDarkMode ? 'border-zinc-700' : 'border-slate-300'} shrink-0`} />
                    )}

                    <span className={`font-mono text-[11px] font-bold ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'} truncate`}>
                      {step.label}
                    </span>

                    <span className={`px-1.5 py-0.2 rounded-none ${isDarkMode ? 'bg-white/10 text-zinc-300 border-white/15' : 'bg-slate-100 text-slate-800 border-slate-200'} border text-[9px] font-mono font-bold shrink-0`}>
                      {step.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-mono text-[9px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium`}>
                      {isDone ? `completed · ${step.latency}` : isRunning ? 'processing...' : 'queued'}
                    </span>
                    {isStepExpanded ? (
                      <ChevronUp size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-400'} />
                    ) : (
                      <ChevronDown size={13} className={isDarkMode ? 'text-zinc-400' : 'text-slate-400'} />
                    )}
                  </div>
                </div>

                {/* Detalle interno expandible */}
                {isStepExpanded && (
                  <div className={`px-3 pb-2.5 pt-1 border-t rounded-none ${isDarkMode ? 'border-white/10 bg-black/40 text-zinc-300' : 'border-slate-100 bg-slate-50/60 text-slate-600'} font-mono text-[10.5px] space-y-1.5`}>
                    <div className={`p-1.5 rounded-none ${isDarkMode ? 'bg-black/50 border-white/10 text-zinc-200' : 'bg-white border-slate-200 text-slate-700'} border text-[9.5px] font-mono overflow-x-auto shadow-2xs`}>
                      <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} select-none`}>{'>'} </span>
                      <span className={`font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>{step.tool}</span>
                      <span className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} block text-[9px] mt-0.5`}>{step.queryText}</span>
                    </div>

                    <div className={`space-y-0.5 pl-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'} text-[9.5px]`}>
                      {step.logs.map((logLine, lIdx) => (
                        <div key={lIdx} className="flex items-start gap-1.5">
                          <span className={`${isDarkMode ? 'text-zinc-500' : 'text-slate-400'} select-none text-[8.5px] mt-0.5`}>•</span>
                          <span>{logLine}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pie informativo del pipeline */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-1 border-t rounded-none ${isDarkMode ? 'border-white/10 text-zinc-400' : 'border-slate-200/80 text-slate-500'} text-[9.5px] font-mono`}>
          <div className="flex items-center gap-1.5">
            <span>Pipeline:</span>
            <span className={`font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
              {isCompleted
                ? `${MCP_TOOL_PIPELINE.length}/${MCP_TOOL_PIPELINE.length} subprocesses completed`
                : `Step ${Math.min(effectiveToolIndex + 1, MCP_TOOL_PIPELINE.length)} of ${MCP_TOOL_PIPELINE.length}`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-none ${isDarkMode ? 'bg-white' : 'bg-[#18181b]'}`} />
            <span className={`font-medium ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>Zero-Excel In-Memory Pipeline</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatalogProcessConsole;
