"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { marked } from "marked";
import { supabase, resolveStorageContent, uploadToCatalogsStorage } from '@/app/lib/supabaseClient';
import {
  Plus, Mic, MicOff, ChevronDown, Database, Sparkles,
  Check, Settings, HelpCircle, Zap, SendHorizonal,
  Brain, Shield, Activity, Cpu, BarChart2, Trash2, RefreshCw, Search, BrainCircuit, CheckCircle2,
  Download, User, X, ChevronRight, UploadCloud, Table, CheckCheck, FileCode2, Paperclip, AlertCircle,
  Layers, Box, Tag, Palette
} from 'lucide-react';
import CatalogProcessConsole from '@/app/cet-ai-engine/components/CatalogProcessConsole.jsx';
import AiCatalogIngestionReport from '@/app/cet-ai-engine/components/AiCatalogIngestionReport.jsx';
import AlysaWordmark from './AlysaWordmark.jsx';
import ProductInspectionCard from './ProductInspectionCard.jsx';
import CatalogSummaryCard from './CatalogSummaryCard.jsx';
import CatalogAnalyticsCard from './CatalogAnalyticsCard.jsx';
import AiComparisonReportCard from './AiComparisonReportCard.jsx';
import AiAnomalyReportCard from './AiAnomalyReportCard.jsx';
import AiAuditExplanationCard from './AiAuditExplanationCard.jsx';
import UserStructuredMessage, { parseUserMessage } from './UserStructuredMessage.jsx';
import { recordClientAction } from '@/app/lib/trackingClient';
import { saveGeneralProcessChat, loadGeneralProcessChat } from '@/app/lib/chatStorageClient';

const CONTEXTS = ['Servex US', 'Servex LATAM', 'General HQ'];

const SLASH_COMMANDS = [
  { id: 'exportCETcsv', icon: Download, label: '/exportCETcsv', desc: 'Export processed CET CSV', phase: 4, category: 'Export Data From CET or Client' },
  { id: 'compareCET', icon: Sparkles, label: '/compareCET', desc: 'Compare CET XML against Base', phase: 4, category: 'Export Data From CET or Client' },

  { id: 'import', icon: Database, label: '/importBase', desc: 'Import Base excel & XML', phase: 1, category: 'Step 1: Data Ingestion' },
  { id: 'deleteData', icon: Trash2, label: '/deleteData', desc: 'Delete Tenant Data', phase: 2, category: 'Step 1: Data Ingestion' },

  { id: 'execute', icon: Cpu, label: '/executeProcess', desc: 'Restructure XML and compare catalog (Step 2)', phase: 3, category: 'Step 2: XML ETL Engine' }
];

// Cache en memoria para evitar re-parsear el mismo XML con DOMParser más de una vez
const xmlMatrixCache = new Map();

// Helper determinista para resolver las columnas del Excel generadas a partir del XML
const extractCatalogMatrixColumns = (xmlText) => {
  const BASE_HEADERS = ["Model #", "List Price", "Weight", "Classic/ Premium", "Model Name"];
  if (!xmlText || typeof xmlText !== 'string' || !xmlText.includes('<')) {
    return { baseHeaders: BASE_HEADERS, commercialColumns: [], allHeaders: BASE_HEADERS };
  }
  const cacheKey = `${xmlText.length}_${xmlText.slice(0, 100)}`;
  if (xmlMatrixCache.has(cacheKey)) {
    return xmlMatrixCache.get(cacheKey);
  }
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const globalFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
    const featureMap = new Map();
    for (const f of globalFeatures) {
      const fCode = f.getElementsByTagName("Code")[0]?.textContent;
      if (fCode) featureMap.set(fCode, f);
    }
    const featureCache = new Map();
    const getProductFeatureCodes = (pNode) => {
      const directRefs = Array.from(pNode.getElementsByTagName("FeatureRef")).map(r => r.textContent?.trim()).filter(Boolean);
      const cacheKey = directRefs.join('|');
      if (featureCache.has(cacheKey)) return featureCache.get(cacheKey);
      const resolved = [];
      const visited = new Set();
      const traverse = (fCode) => {
        if (!fCode || visited.has(fCode)) return;
        visited.add(fCode);
        resolved.push(fCode);
        const fNode = featureMap.get(fCode);
        if (fNode) {
          const subRefs = Array.from(fNode.getElementsByTagName("FeatureRef"));
          for (const sub of subRefs) {
            const subCode = sub.textContent?.trim();
            if (subCode) traverse(subCode);
          }
        }
      };
      for (const code of directRefs) traverse(code);
      featureCache.set(cacheKey, resolved);
      return resolved;
    };
    const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
    const optionMap = new Map();
    for (let i = 0; i < productsXML.length; i++) {
      const p = productsXML[i];
      const featureCodes = getProductFeatureCodes(p);
      for (const fCode of featureCodes) {
        const featureNode = featureMap.get(fCode);
        if (featureNode) {
          const options = Array.from(featureNode.getElementsByTagName("Option"));
          for (const opt of options) {
            const optCode = opt.getElementsByTagName("Code")[0]?.textContent?.trim();
            const optDesc = opt.getElementsByTagName("Description")[0]?.textContent?.trim();
            const optPriceElem = opt.querySelector("OptionPrice > Value");
            if (optPriceElem && optCode) {
              const optPrice = parseFloat(optPriceElem.textContent || "0");
              const label = optDesc
                ? (optDesc.toLowerCase().includes(optCode.toLowerCase()) ? optDesc : `${optCode} (${optDesc})`)
                : optCode;
              const existing = optionMap.get(optCode);
              if (!existing) {
                optionMap.set(optCode, { optCode, label, maxPrice: optPrice, featureCode: fCode });
              } else {
                if (optPrice > existing.maxPrice) existing.maxPrice = optPrice;
                if (!existing.label || existing.label === optCode) existing.label = label;
              }
            }
          }
        }
      }
    }
    const validColumns = Array.from(optionMap.values()).filter(c => c.maxPrice > 0);
    const dynamicHeaders = validColumns.map(c => c.label);
    const result = {
      baseHeaders: BASE_HEADERS,
      commercialColumns: validColumns,
      allHeaders: [...BASE_HEADERS, ...dynamicHeaders]
    };
    xmlMatrixCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn("Could not extract matrix columns:", err);
    return { baseHeaders: BASE_HEADERS, commercialColumns: [], allHeaders: BASE_HEADERS };
  }
};

const getCatalogExcelColumns = (summary, fallbackCsvRaw = null, fallbackXmlRaw = null) => {
  const DEFAULT_BASE_COLUMNS = [
    { code: "Model #", label: "Model #", type: "Identificador SKU", desc: "Código de modelo del producto base" },
    { code: "List Price", label: "List Price", type: "Precio Base (USD)", desc: "Precio de lista estándar sin recargos" },
    { code: "Weight", label: "Weight", type: "Especificación", desc: "Peso físico del producto (N/A si no aplica)" },
    { code: "Classic/ Premium", label: "Classic/ Premium", type: "Clasificación", desc: "Gama o categoría de producto" },
    { code: "Model Name", label: "Model Name", type: "Descripción", desc: "Nombre y descripción comercial del modelo" }
  ];

  let safeSummary = (typeof summary === 'object' && summary !== null) ? summary : {};
  let safeCsvRaw = fallbackCsvRaw;
  let safeXmlRaw = fallbackXmlRaw;

  if (typeof summary === 'string') {
    if (summary.trim().startsWith('<')) {
      safeXmlRaw = summary;
    } else if (summary.includes(',') || summary.includes(';')) {
      safeCsvRaw = summary;
    }
  }

  // 0. FAST PATH ABSOLUTO (0ms): Columnas provistas directamente por el backend
  if (safeSummary?.base_columns && safeSummary?.commercial_columns) {
    return {
      baseColumns: safeSummary.base_columns,
      commercialColumns: safeSummary.commercial_columns,
      totalColumns: safeSummary.total_columns || (safeSummary.base_columns.length + safeSummary.commercial_columns.length)
    };
  }

  if (safeSummary?.commercial_columns && Array.isArray(safeSummary.commercial_columns)) {
    return {
      baseColumns: safeSummary.base_columns || DEFAULT_BASE_COLUMNS,
      commercialColumns: safeSummary.commercial_columns,
      totalColumns: (safeSummary.base_columns || DEFAULT_BASE_COLUMNS).length + safeSummary.commercial_columns.length
    };
  }

  // 1. PRIORIDAD SECUNDARIA: Si existe csv_raw (almacenado en DB o en memoria tras convertir el XML a Excel)
  const csvSource = safeSummary?.csv_raw || safeCsvRaw;
  if (csvSource && typeof csvSource === 'string' && csvSource.trim()) {
    try {
      const firstLine = csvSource.trim().split(/\r?\n/)[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';
      const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, '')).filter(Boolean);

      if (headers.length > 0) {
        const baseLabels = ["Model #", "List Price", "Weight", "Classic/ Premium", "Model Name"];
        const baseCols = [];
        const commCols = [];

        headers.forEach((h, idx) => {
          const matchBase = DEFAULT_BASE_COLUMNS.find(b => b.code.toLowerCase() === h.toLowerCase() || b.label.toLowerCase() === h.toLowerCase());
          if (matchBase) {
            baseCols.push(matchBase);
          } else if (idx < 5 && baseLabels.some(bl => bl.toLowerCase().includes(h.toLowerCase()))) {
            baseCols.push({
              code: h,
              label: h,
              type: "Campo Base",
              desc: `Columna estándar #${idx + 1}`
            });
          } else {
            let code = h;
            let desc = h;
            const parenMatch = h.match(/^([^(]+)\s*\((.+)\)$/);
            if (parenMatch) {
              code = parenMatch[1].trim();
              desc = parenMatch[2].trim();
            }

            const matchedOpt = (safeSummary?.commercial_options_list || safeSummary?.price_options_list || [])
              .find(o => (o.code && o.code.toLowerCase() === code.toLowerCase()) || (o.name && o.name.toLowerCase() === desc.toLowerCase()));

            commCols.push({
              code: code,
              label: h,
              price: matchedOpt?.price || (matchedOpt?.prices ? matchedOpt.prices.join(' / ') : 'Recargo'),
              featureName: matchedOpt?.feature_name || matchedOpt?.feature_code || 'Opción Comercial Activa'
            });
          }
        });

        const finalBase = baseCols.length > 0 ? baseCols : DEFAULT_BASE_COLUMNS;
        return {
          baseColumns: finalBase,
          commercialColumns: commCols,
          totalColumns: headers.length
        };
      }
    } catch (e) {
      console.warn("Error resolviendo columnas desde csv_raw:", e);
    }
  }

  // 2. Columnas provistas directamente por el motor backend desde el XML real
  if (safeSummary?.base_columns && safeSummary?.commercial_columns) {
    return {
      baseColumns: safeSummary.base_columns,
      commercialColumns: safeSummary.commercial_columns,
      totalColumns: safeSummary.total_columns || (safeSummary.base_columns.length + safeSummary.commercial_columns.length)
    };
  }

  if (safeSummary?.commercial_columns && Array.isArray(safeSummary.commercial_columns)) {
    return {
      baseColumns: safeSummary.base_columns || DEFAULT_BASE_COLUMNS,
      commercialColumns: safeSummary.commercial_columns,
      totalColumns: (safeSummary.base_columns || DEFAULT_BASE_COLUMNS).length + safeSummary.commercial_columns.length
    };
  }

  // 3. Parseo en tiempo real del XML nativo
  const xmlSource = safeSummary?.xml_raw || safeSummary?.XM_CET_import || safeXmlRaw;
  if (xmlSource && typeof xmlSource === 'string' && xmlSource.includes('<')) {
    const parsed = extractCatalogMatrixColumns(xmlSource);
    if (parsed && parsed.allHeaders && parsed.allHeaders.length > 0) {
      const commCols = (parsed.commercialColumns || []).map(c => ({
        code: c.optCode,
        label: c.label,
        price: String(c.maxPrice),
        featureName: c.featureCode || 'Opción Comercial'
      }));
      return {
        baseColumns: DEFAULT_BASE_COLUMNS,
        commercialColumns: commCols,
        totalColumns: DEFAULT_BASE_COLUMNS.length + commCols.length
      };
    }
  }

  // 4. Mapeo de listas de opciones extraídas del XML
  let commCols = [];
  if (safeSummary?.commercial_options_list && safeSummary.commercial_options_list.length > 0) {
    commCols = safeSummary.commercial_options_list.map(opt => ({
      code: opt.code,
      label: opt.label || (opt.name && !opt.name.includes(opt.code) ? `${opt.code} (${opt.name})` : (opt.name || opt.code)),
      price: opt.price || (opt.prices ? opt.prices.join(' / ') : '0'),
      featureName: opt.feature_name || opt.feature_code || 'Opción Comercial'
    }));
  } else if (safeSummary?.price_options_list && safeSummary.price_options_list.some(p => p.has_upcharge || parseFloat(p.price || 0) > 0)) {
    commCols = safeSummary.price_options_list
      .filter(p => p.has_upcharge || parseFloat(p.price || 0) > 0)
      .map(opt => ({
        code: opt.code,
        label: opt.label || (opt.name && !opt.name.includes(opt.code) ? `${opt.code} (${opt.name})` : (opt.name || opt.code)),
        price: opt.price,
        featureName: opt.feature_name || opt.feature_code || 'Opción Comercial'
      }));
  }

  // IMPORTANTE: Si el catálogo no tiene recargos, retorna commCols vacío [] (cero recargos, 100% real sin datos ficticios)
  return {
    baseColumns: DEFAULT_BASE_COLUMNS,
    commercialColumns: commCols,
    totalColumns: DEFAULT_BASE_COLUMNS.length + commCols.length
  };
};

const QUICK_PROMPTS = [
  {
    icon: Database,
    label: "CET XML Conversion",
    q: "How does the AI autonomously convert any CET XML catalog into an import-ready structured matrix without manual effort?"
  },
  {
    icon: Cpu,
    label: "Catalog Auto-Update",
    q: "How does Alysa automatically update the entire XML catalog once I simply upload my file?"
  },
  {
    icon: BarChart2,
    label: "Compare Discrepancies",
    q: "How does the AI audit and reconcile pricing deltas and product codes autonomously in seconds?"
  },
  {
    icon: Shield,
    label: "Autonomous AI Pipeline",
    q: "Explain how the AI compresses weeks of manual engineering into seconds—I only upload the file and Alysa does everything."
  },
];

const AI_GUIDE_QUESTIONS = [
  {
    category: "Ingestion & Upload",
    tag: "Zero Effort",
    q: "What do I need to do as a user to start processing in the XML Pipeline?",
    desc: "The user only uploads the file; Alysa autonomously handles 100% of the extraction, relational mapping, and analysis without manual intervention."
  },
  {
    category: "Ingestion & Upload",
    tag: "File Formats",
    q: "What file formats can I upload (Master XML, CSV, XLSX, CET export)?",
    desc: "Native compatibility and autonomous parsing of manufacturer XML schemas, CSV price matrices, and update spreadsheets."
  },
  {
    category: "Ingestion & Upload",
    tag: "Auto-Detection",
    q: "How does the AI recognize file schema and manufacturer structures without setup?",
    desc: "Intelligent heuristic classification that instantly detects node hierarchies, pricing attributes, and product SKUs upon upload."
  },
  {
    category: "Ingestion & Upload",
    tag: "Auto-Repair",
    q: "What happens if the original XML file has broken syntax or missing nodes?",
    desc: "The AI automatically heals, closes broken tags, and normalizes the XML schema, guaranteeing total data integrity without human repair."
  },
  {
    category: "Ingestion & Upload",
    tag: "Large Catalogs",
    q: "Can the pipeline process massive enterprise catalogs with thousands of references?",
    desc: "High-throughput parallel ingestion engine optimized to parse and transform enterprise catalogs in seconds."
  },
  {
    category: "XML Conversion",
    tag: "Structure",
    q: "How does Alysa convert raw XML into a clean, structured relational matrix?",
    desc: "Autonomous multi-node breakdown of SKUs, dynamic variable options, and commercial product rules executed entirely by AI."
  },
  {
    category: "XML Conversion",
    tag: "CET Designer",
    q: "How does the AI generate a catalog ready to import directly into CET Designer?",
    desc: "Autonomous generation of CET 3D-compliant schemas, graphical placement rules validation, and verified manufacturer part numbers."
  },
  {
    category: "XML Conversion",
    tag: "20/20 & BIM",
    q: "Is the converted catalog compatible with 20/20 Design environments and BIM standards?",
    desc: "Standardized normalization tailored for architectural specification software, CAD libraries, and commercial procurement systems."
  },
  {
    category: "XML Conversion",
    tag: "Download",
    q: "How do I download the updated, restructured XML result file?",
    desc: "Use direct instant download from the report cards once the autonomous engine finishes processing."
  },
  {
    category: "XML Conversion",
    tag: "Dynamic Options",
    q: "How does the AI handle dynamic product options, finishes, and dimensional modifiers?",
    desc: "Self-healing option tree reconciliation matching finishes, tier surcharges, and fabric codes against official manufacturer specifications."
  },
  {
    category: "AI Comparison",
    tag: "Process",
    q: "How does the AI cross-reference the base XML against the new catalog update?",
    desc: "Autonomous algorithmic comparison that identifies price updates, added items, discontinued SKUs, and substitutions in seconds."
  },
  {
    category: "AI Comparison",
    tag: "Discrepancies",
    q: "How does Alysa detect and audit list price discrepancies and margins?",
    desc: "Item-by-item audit engine with instant percentage delta calculation, anomaly flagging, and error margin verification rendered in the chat cards."
  },
  {
    category: "AI Comparison",
    tag: "Tolerances",
    q: "Does the AI classify pricing discrepancies by financial impact or tolerance thresholds?",
    desc: "Predictive risk segmentation separating critical margin variances, minor price index shifts, and structural design updates."
  },
  {
    category: "Autonomous Pipeline",
    tag: "Weeks to Seconds",
    q: "Why does the pipeline compress 3 weeks of manual engineering into seconds?",
    desc: "Full end-to-end automation: the user only uploads the file, and AI runs the entire extraction, comparison, reconciliation, and XML rebuilding."
  },
  {
    category: "Autonomous Pipeline",
    tag: "Slash Commands",
    q: "What slash commands ('/') are available to navigate and control the pipeline?",
    desc: "Interactive command suite: /importBase, /executeProcess, /compareCET, and /exportCETcsv."
  },
  {
    category: "Autonomous Pipeline",
    tag: "Telemetry & Graphs",
    q: "How can I view graphical analytics and catalog performance metrics?",
    desc: "Interactive dashboard displaying parsing speed, node volume distribution, price variance histograms, and sync health telemetry."
  },
  {
    category: "Autonomous Pipeline",
    tag: "Audit History",
    q: "Is there a persistent historical record of versions and AI-applied transformations?",
    desc: "Full chronological traceability with cryptographically sound audit logs stored in the database for compliance and quality control."
  },
  {
    category: "Autonomous Pipeline",
    tag: "Architecture",
    q: "How does the proprietary AI architecture developed by GLYNNE S.A.S. operate?",
    desc: "Proprietary high-throughput multi-agent architecture and data streaming pipeline engineered by GLYNNE S.A.S."
  }
];

const AlysaSvgIcon = ({ className = "w-7 h-7 flex-shrink-0", ...props }) => (
  <svg
    viewBox="60 180 870 640"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect x="593" y="197" width="153" height="149" rx="32" fill="#27272a" />
    <rect x="766" y="232" width="106" height="101" rx="22" fill="#a1a1aa" />
    <rect x="740" y="350" width="176" height="174" rx="36" fill="#18181b" />
    <path
      d="M 353 202 L 340 221 L 223 471 L 72 773 L 69 784 L 72 795 L 88 805 L 258 805 L 269 801 L 278 791 L 440 452 L 445 449 L 527 606 L 389 608 L 383 611 L 375 626 L 371 697 L 377 706 L 567 707 L 581 718 L 621 793 L 629 801 L 640 805 L 840 804 L 847 799 L 852 789 L 849 776 L 702 542 L 590 356 L 506 205 L 491 197 L 365 197 Z"
      fill="#18181b"
    />
  </svg>
);

// Motor de puntuación, gramática, acentuación y estandarización corporativa para Speech-to-Text
function formatProfessionalSpeechText(rawText) {
  if (!rawText || !rawText.trim()) return "";

  let text = rawText.trim();

  // 1. Sustituir comandos de puntuación hablados (Español / Inglés)
  const punctuationMap = [
    { regex: /\b(signo de interrogaci[oó]n|question mark)\b/gi, replacement: '?' },
    { regex: /\b(signo de exclamaci[oó]n|exclamation mark)\b/gi, replacement: '!' },
    { regex: /\b(punto y coma|semicolon)\b/gi, replacement: ';' },
    { regex: /\b(dos puntos|colon)\b/gi, replacement: ':' },
    { regex: /\b(punto y aparte|nueva l[ií]nea|new line)\b/gi, replacement: '\n' },
    { regex: /\b(punto seguido|punto final|punto|period|full stop)\b/gi, replacement: '.' },
    { regex: /\b(coma|comma)\b/gi, replacement: ',' },
  ];

  punctuationMap.forEach(({ regex, replacement }) => {
    text = text.replace(regex, replacement);
  });

  // 2. Limpieza de espaciados alrededor de signos
  text = text
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([.,;:!?])(?=[^\s\d])/g, '$1 ')
    .replace(/\s+/g, ' ');

  // 3. Diccionario corporativo y acrónimos clave
  const termsMap = [
    { regex: /\b(servex ai|servex copilot|servex)\b/gi, replacement: 'SERVEX' },
    { regex: /\balysa\b/gi, replacement: 'Alysa' },
    { regex: /\bglynne\b/gi, replacement: 'GLYNNE' },
    { regex: /\bxml\b/gi, replacement: 'XML' },
    { regex: /\bcsv\b/gi, replacement: 'CSV' },
    { regex: /\bpdf\b/gi, replacement: 'PDF' },
    { regex: /\bapi\b/gi, replacement: 'API' },
    { regex: /\bcet designer\b/gi, replacement: 'CET Designer' },
    { regex: /\bcet\b/gi, replacement: 'CET' },
    { regex: /\bxlsx?\b/gi, replacement: 'Excel' },
    { regex: /\bwbs\b/gi, replacement: 'WBS' },
    { regex: /\bwbg\b/gi, replacement: 'WBG' },
    { regex: /\bwbo\b/gi, replacement: 'WBO' },
    { regex: /\bwbd\b/gi, replacement: 'WBD' },
    { regex: /\bwba\b/gi, replacement: 'WBA' },
    { regex: /\bwbt\b/gi, replacement: 'WBT' },
    { regex: /\blesro\b/gi, replacement: 'LESRO' },
    { regex: /\bteknion\b/gi, replacement: 'Teknion' },
  ];

  termsMap.forEach(({ regex, replacement }) => {
    text = text.replace(regex, replacement);
  });

  // 4. Saludos y fórmulas comunes en español
  const accentsMap = [
    { regex: /\b(como estas|como esta)\b/gi, replacement: '¿cómo estás?' },
    { regex: /\b(hola alysa)\b/gi, replacement: '¡Hola Alysa!' },
    { regex: /\b(hola)\b/gi, replacement: '¡Hola!' },
    { regex: /\bque tal\b/gi, replacement: '¿qué tal?' },
    { regex: /\bcatalogo\b/gi, replacement: 'catálogo' },
    { regex: /\bcatalogos\b/gi, replacement: 'catálogos' },
    { regex: /\bauditoria\b/gi, replacement: 'auditoría' },
    { regex: /\bauditorias\b/gi, replacement: 'auditorías' },
    { regex: /\blinea\b/gi, replacement: 'línea' },
    { regex: /\blineas\b/gi, replacement: 'líneas' },
    { regex: /\bcodigo\b/gi, replacement: 'código' },
    { regex: /\bcodigos\b/gi, replacement: 'códigos' },
  ];

  accentsMap.forEach(({ regex, replacement }) => {
    text = text.replace(regex, replacement);
  });

  // 5. División en oraciones y puntuación automática de preguntas y cierres
  const questionStartersEs = [
    'cómo', 'como', 'cuál', 'cual', 'cuáles', 'cuales', 'qué', 'que',
    'por qué', 'quién', 'quien', 'cuándo', 'cuando',
    'dónde', 'donde', 'cuánto', 'cuanto', 'puedes', 'podrías', 'me ayudas', 'ayúdame'
  ];

  const segments = text.split(/(?<=[.!?\n])\s+/);

  const formattedSegments = segments.map(seg => {
    let s = seg.trim();
    if (!s) return "";

    s = s.charAt(0).toUpperCase() + s.slice(1);

    const isQuestionEs = questionStartersEs.some(q => s.toLowerCase().startsWith(q + ' ') || s.toLowerCase() === q);
    const isQuestionEn = /^(how|what|why|when|where|who|can you|could you|is there|are there|will you)\b/i.test(s);

    if ((isQuestionEs || isQuestionEn) && !s.endsWith('?') && !s.endsWith('!')) {
      if (!s.startsWith('¿') && isQuestionEs) {
        s = '¿' + s + '?';
      } else if (!s.endsWith('?')) {
        s = s + '?';
      }
    } else if (!/[.!?]$/.test(s)) {
      s = s + '.';
    }

    s = s.replace(/\?+\./g, '?').replace(/!+\./g, '!').replace(/\.{2,}/g, '.');

    return s;
  });

  let result = formattedSegments.filter(Boolean).join(' ');

  result = result
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([¿¡])\s+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  return result;
}

// Configuración global del renderizador de Marked para estilos premium corporativos en dark theme
const origRenderer = new marked.Renderer();
marked.use({
  renderer: {
    table(token) {
      const orig = origRenderer.table.call(this, token);
      return `<div class="my-4 overflow-x-auto rounded-none border border-white/10 shadow-lg bg-[#09090b]/70 backdrop-blur-md inline-block max-w-full w-full">
        ${orig.replace('<table>', '<table class="w-full text-left text-[12.5px] text-zinc-200">')
          .replace('<thead>', '<thead class="bg-white/[0.06] border-b border-white/10 text-zinc-300 font-bold uppercase tracking-wider text-[11px]">')
          .replace('<tbody>', '<tbody class="divide-y divide-white/[0.06]">')}
      </div>`;
    },
    tablerow(token) {
      const orig = origRenderer.tablerow.call(this, token);
      return orig.replace('<tr>', '<tr class="hover:bg-white/[0.04] transition-colors duration-150">');
    },
    tablecell(token) {
      const orig = origRenderer.tablecell.call(this, token);
      const padding = token.header ? 'px-4 py-3' : 'px-4 py-2.5';
      return orig.replace(/^<(th|td)>/, `<$1 class="${padding} whitespace-nowrap">`);
    },
    list(token) {
      const orig = origRenderer.list.call(this, token);
      const classes = token.ordered
        ? 'list-decimal list-outside ml-5 space-y-2 my-3 text-zinc-200'
        : 'list-disc list-outside ml-5 space-y-2 my-3 text-zinc-200 marker:text-zinc-400';
      return orig.replace(/^<(ul|ol)>/, `<$1 class="${classes}">`);
    },
    listitem(token) {
      const orig = origRenderer.listitem.call(this, token);
      return orig.replace(/^<li>/, '<li class="leading-relaxed pl-1 text-zinc-200">');
    },
    paragraph(token) {
      const orig = origRenderer.paragraph.call(this, token);
      return orig.replace(/^<p>/, '<p class="leading-relaxed mb-3 text-zinc-200">');
    },
    heading(token) {
      const orig = origRenderer.heading.call(this, token);
      const sizes = {
        1: 'text-2xl font-bold mt-6 mb-3 text-white tracking-tight',
        2: 'text-xl font-bold mt-5 mb-2.5 text-white tracking-tight border-b border-white/10 pb-2',
        3: 'text-lg font-semibold mt-4 mb-2 text-white tracking-tight',
        4: 'text-base font-semibold mt-3 mb-1.5 text-zinc-100',
      };
      const cls = sizes[token.depth] || sizes[4];
      return orig.replace(/^<h[1-6]>/, `<h${token.depth} class="${cls}">`);
    },
    codespan(token) {
      const orig = origRenderer.codespan.call(this, token);
      return orig.replace('<code>', '<code class="px-1.5 py-0.5 rounded-none bg-white/10 text-white font-mono text-[11.5px] font-semibold border border-white/15 shadow-sm">');
    },
    code(token) {
      const orig = origRenderer.code.call(this, token);
      return `<div class="my-3 rounded-none overflow-hidden bg-[#09090b]/80 border border-white/10 shadow-md">
            <div class="p-3 overflow-x-auto custom-scrollbar">
              ${orig.replace(/<pre><code[^>]*>/, '<pre class="text-[12.5px] text-zinc-200 font-mono leading-relaxed inline-block"><code class="block">')}
            </div>
          </div>`;
    },
    blockquote(token) {
      const orig = origRenderer.blockquote.call(this, token);
      return orig.replace('<blockquote>', '<blockquote class="border-l-4 border-white/30 bg-white/[0.03] italic py-2.5 px-4 rounded-none my-4 text-zinc-300 shadow-sm">');
    }
  }
});

// Parser inteligente para detectar y estructurar respuestas de filtrado de productos CET Designer
const parseProductInspection = (text, inspectionReport = null) => {
  // Fast path: Si el backend ya devolvió el reporte estructurado en JSON
  if (inspectionReport && Array.isArray(inspectionReport) && inspectionReport.length > 0) {
    const catMatch = text?.match(/Cat[aá]logo Activo:\s*\**([^\*|\n]+?)\**\s*(?:\||$)/i);
    const catalog = catMatch ? catMatch[1].trim() : 'XML';
    const matchCount = text?.match(/Coincidencias Exactas:\s*\**([^\*|\n]+?)\**(?:\s*consultados|\n|$)/i);
    const matchesStr = matchCount ? matchCount[1].trim() : `${inspectionReport.length} de ${inspectionReport.length}`;

    const products = inspectionReport.map(p => {
      const options = [];
      if (p.features && Array.isArray(p.features)) {
        p.features.forEach(feat => {
          const fName = feat.feature_name || feat.feature_code || '';
          const fCode = feat.feature_code || '';
          const fLabel = fName && fName !== fCode ? `${fCode} (${fName})` : fCode;
          (feat.options || []).forEach(opt => {
            let surcharge = opt.current_price !== undefined ? String(opt.current_price) : '0.00';
            if (!surcharge.startsWith('$')) surcharge = `$${surcharge}`;
            options.push({
              feature: fLabel,
              optionCode: opt.code,
              description: opt.description,
              surcharge: surcharge
            });
          });
        });
      }
      let price = p.list_price || '';
      if (price && !price.startsWith('$')) price = `$${price} USD`;
      return {
        sku: p.code || p.query_sku,
        description: p.description,
        price: price,
        featuresCount: p.features_count || (p.features ? p.features.length : 0),
        options
      };
    });

    return { catalog, matches: matchesStr, products };
  }

  if (!text || typeof text !== 'string') return null;
  const isInspection =
    text.includes('Filtrado de Productos') ||
    text.includes('Desglose de Opciones y Recargos') ||
    (text.includes('Producto:') && (text.includes('Precio Base') || text.includes('Recargo')));

  if (!isInspection) return null;

  try {
    const catMatch = text.match(/Cat[aá]logo Activo:\s*\**([^\*|\n]+?)\**\s*(?:\||$)/i);
    const catalog = catMatch ? catMatch[1].trim() : 'XML';

    const matchCount = text.match(/Coincidencias Exactas:\s*\**([^\*|\n]+?)\**(?:\s*consultados|\n|$)/i);
    const matchesStr = matchCount ? matchCount[1].trim() : '';

    const products = [];
    const prodBlocks = text.split(/(?:####\s*Producto:|\bProducto:)\s*/i);

    if (prodBlocks.length > 1) {
      for (let i = 1; i < prodBlocks.length; i++) {
        const block = prodBlocks[i];
        const lines = block.split('\n');
        const sku = lines[0].replace(/[`*]/g, '').trim();
        const body = lines.slice(1).join('\n');

        const descM = body.match(/(?:^|\n)\s*(?:-\s*)?(?:\*\*|__)?(?:Descripci[oó]n|Estado)(?:\*\*|__)?\s*:?\s*(?:\*\*|__)?([^\n]+)/i);
        const priceM = body.match(/(?:^|\n)\s*(?:-\s*)?(?:\*\*|__)?Precio Base(?: de Lista)?(?:\*\*|__)?\s*:?\s*(?:\*\*|__)?([^\n]+)/i);
        const featCountM = body.match(/(?:^|\n)\s*(?:-\s*)?(?:\*\*|__)?Total Caracter[ií]sticas Vinculadas(?:\*\*|__)?\s*:?\s*(?:\*\*|__)?([^\n]+)/i);

        const options = [];
        const bodyLines = body.split('\n');
        for (const line of bodyLines) {
          const trimmed = line.trim();
          if (
            trimmed.startsWith('|') &&
            !trimmed.toLowerCase().includes('| feature') &&
            !trimmed.includes(':---') &&
            !trimmed.includes('---|')
          ) {
            const parts = trimmed.split('|').slice(1, -1).map(p => p.replace(/[`*]/g, '').trim());
            if (parts.length >= 4) {
              options.push({
                feature: parts[0],
                optionCode: parts[1],
                description: parts[2],
                surcharge: parts[3]
              });
            }
          } else if (trimmed.includes('\t') && !trimmed.toLowerCase().includes('feature\t')) {
            const parts = trimmed.split('\t').map(p => p.replace(/[`*]/g, '').trim()).filter(Boolean);
            if (parts.length >= 4) {
              options.push({
                feature: parts[0],
                optionCode: parts[1],
                description: parts[2],
                surcharge: parts[3]
              });
            }
          } else if (!trimmed.startsWith('|') && !trimmed.toLowerCase().startsWith('feature') && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
            const parts = trimmed.split(/\s{2,}/).map(p => p.replace(/[`*]/g, '').trim()).filter(Boolean);
            if (parts.length >= 4) {
              options.push({
                feature: parts[0],
                optionCode: parts[1],
                description: parts[2],
                surcharge: parts[3]
              });
            }
          }
        }

        products.push({
          sku,
          description: descM ? descM[1].replace(/[`*]/g, '').trim() : '',
          price: priceM ? priceM[1].replace(/[`*]/g, '').trim() : '',
          featuresCount: featCountM ? featCountM[1].replace(/[`*]/g, '').trim() : '',
          options
        });
      }
    }

    return products.length > 0 ? { catalog, matches: matchesStr, products } : null;
  } catch {
    return null;
  }
};

// Parser inteligente para detectar y estructurar resúmenes de catálogo y características con recargo
const parseCatalogSummary = (text, catalogData = null) => {
  // Fast path: Si el backend envió catalog_data estructurado
  if (catalogData && typeof catalogData === 'object' && catalogData.features) {
    const catalog = catalogData.company || catalogData.catalog || 'Catálogo XML';
    const pricelists = (catalogData.pricelists && catalogData.pricelists.length > 0)
      ? catalogData.pricelists.map(pl => ({ code: pl.code, currency: pl.currency || 'USD' }))
      : [{ code: 'P1', currency: 'USD' }];

    const features = (catalogData.features || []).map(f => {
      const options = (f.options || [])
        .filter(o => o.has_upcharge || (o.price && parseFloat(o.price) > 0))
        .map(o => ({
          code: o.code,
          description: o.description,
          price: o.price ? (String(o.price).startsWith('$') ? String(o.price) : `$${o.price}`) : ''
        }));
      return {
        featureCode: f.feature_code || f.code,
        description: f.feature_description || f.description || '',
        options
      };
    }).filter(f => f.options.length > 0);

    let examplePrompt = '';
    let exampleIntro = '';
    let tipText = '';
    let note = '';
    if (text && typeof text === 'string') {
      const exMatch = text.match(/(?:📋\s*)?Ejemplo(?: listo para copiar)?[\s\S]*?(?=💡\s*Tip|###|$)/i);
      if (exMatch) {
        const promptM = exMatch[0].match(/(Hola,\s*por favor[\s\S]*?)(?=\n\s*(?:Solo copia|💡|Tip|$))/i);
        if (promptM) examplePrompt = promptM[1].trim();
        const introM = exMatch[0].match(/Si deseas aplicar[\s\S]*?:/i);
        if (introM) exampleIntro = introM[0].trim();
      }
      const tipM = text.match(/(?:💡\s*)?Tip(?: amigable)?[\s\S]*$/i);
      if (tipM) tipText = tipM[0].replace(/^(?:💡\s*)?Tip(?: amigable)?\s*/i, '').trim();
      const noteM = text.match(/Nota:\s*([^\n]+(?:\n(?!📋|💡|✨)[^\n]+)*)/i);
      if (noteM) note = noteM[1].trim();
    }

    return {
      catalog,
      pricelists,
      features,
      note,
      exampleIntro,
      examplePrompt,
      tipText
    };
  }

  if (!text || typeof text !== 'string') return null;

  const isSummary =
    text.includes('Resumen de Catálogo & Listas de Precios') ||
    text.includes('Resumen de Catalogo & Listas de Precios') ||
    text.includes('Características con recargo') ||
    text.includes('Caracteristicas con recargo') ||
    text.includes('up‑charge') ||
    text.includes('up-charge') ||
    (text.includes('Lista de precios activa') && (text.includes('Código de característica') || text.includes('Codigo de caracteristica')));

  if (!isSummary) return null;

  try {
    const catM = text.match(/cat[aá]logo\s+([A-Za-z0-9_\-]+)/i) || text.match(/cat[aá]logo\s*[`*]+([A-Za-z0-9_\-]+)[`*]+/i);
    const catalog = catM ? catM[1].trim() : 'Catálogo XML';

    const pricelists = [];
    const plBlockM = text.match(/Lista(?:s)? de precios activa(?:s)?[\s\S]*?(?=✨|Características|Caracteristicas|Código de característica|Codigo de caracteristica|$)/i);
    if (plBlockM) {
      const plLines = plBlockM[0].split('\n');
      for (const line of plLines) {
        const trimmed = line.trim();
        if (trimmed.includes('\t') && !trimmed.toLowerCase().includes('moneda')) {
          const parts = trimmed.split('\t').map(p => p.trim());
          if (parts.length >= 2) {
            pricelists.push({ code: parts[0], currency: parts[1] });
          }
        } else if (trimmed.includes('|') && !trimmed.toLowerCase().includes('moneda') && !trimmed.includes('---')) {
          const parts = trimmed.split('|').slice(1, -1).map(p => p.trim());
          if (parts.length >= 2) {
            pricelists.push({ code: parts[0], currency: parts[1] });
          }
        } else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          const m = trimmed.match(/[•\-]\s*[`*]*([A-Za-z0-9_\-]+)[`*]*\s*(?:[—–-]\s*Moneda:\s*[`*]*([A-Za-z0-9_\-]+)[`*]*)?/i);
          if (m && m[1] && !m[1].toLowerCase().includes('lista')) {
            pricelists.push({ code: m[1], currency: m[2] || 'USD' });
          }
        }
      }
    }
    if (pricelists.length === 0) {
      pricelists.push({ code: 'P1', currency: 'USD' });
    }

    const features = [];
    let featSection = '';
    const featSectionM = text.match(/(?:Caracter[ií]sticas con recargo[\s\S]*?)(?=📋\s*Ejemplo|💡\s*Tip|###|$)/i);
    if (featSectionM) {
      featSection = featSectionM[0];
    } else {
      featSection = text;
    }

    let note = '';
    const noteM = featSection.match(/Nota:\s*([^\n]+(?:\n(?!📋|💡|✨)[^\n]+)*)/i);
    if (noteM) {
      note = noteM[1].trim();
    }

    const lines = featSection.split('\n');
    let inTable = false;
    let currentFeature = null;

    const parseOptionsInto = (feat, rawStr) => {
      const optLines = rawStr.split(/(?:<br\s*\/?>|\n)/);
      for (const ol of optLines) {
        const cleanOl = ol.trim();
        if (!cleanOl) continue;
        const optM = cleanOl.match(/[•\-*]?\s*([A-Za-z0-9_\-]+)\s*[—–-]\s*([^\–—\-]+?)\s*[—–-]\s*(\$?\d+(?:\.\d{2})?(?:\s*USD)?)/i);
        if (optM) {
          let price = optM[3].trim();
          if (!price.startsWith('$')) price = `$${price}`;
          feat.options.push({
            code: optM[1].trim(),
            description: optM[2].trim(),
            price: price
          });
        } else {
          const simpleM = cleanOl.match(/[•\-*]?\s*([^\–—\-]+)/);
          if (simpleM && simpleM[1].trim()) {
            feat.options.push({
              code: '',
              description: simpleM[1].trim(),
              price: ''
            });
          }
        }
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.toLowerCase().includes('código de característica') || trimmed.toLowerCase().includes('codigo de caracteristica')) {
        inTable = true;
        continue;
      }
      if (!inTable) continue;
      if (trimmed.toLowerCase().startsWith('nota:') || trimmed.startsWith('📋') || trimmed.startsWith('💡')) {
        inTable = false;
        break;
      }

      if (trimmed.includes('\t')) {
        const parts = trimmed.split('\t').map(p => p.trim());
        if (parts.length >= 2) {
          const fCode = parts[0];
          const fDesc = parts[1];
          const optStr = parts[2] || '';

          currentFeature = {
            featureCode: fCode,
            description: fDesc,
            options: []
          };
          features.push(currentFeature);

          if (optStr) {
            parseOptionsInto(currentFeature, optStr);
          }
        }
      } else if (trimmed.startsWith('|') && !trimmed.includes('---')) {
        const parts = trimmed.split('|').slice(1, -1).map(p => p.trim());
        if (parts.length >= 2) {
          const fCode = parts[0].replace(/[`*]/g, '');
          const fDesc = parts[1].replace(/[`*]/g, '');
          const optStr = parts[2] ? parts[2].replace(/[`*]/g, '') : '';

          currentFeature = {
            featureCode: fCode,
            description: fDesc,
            options: []
          };
          features.push(currentFeature);

          if (optStr) {
            parseOptionsInto(currentFeature, optStr);
          }
        }
      } else if (currentFeature && (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*'))) {
        parseOptionsInto(currentFeature, trimmed);
      }
    }

    let examplePrompt = '';
    let exampleIntro = '';
    const exMatch = text.match(/(?:📋\s*)?Ejemplo(?: listo para copiar)?[\s\S]*?(?=💡\s*Tip|###|$)/i);
    if (exMatch) {
      const exBlock = exMatch[0];
      const promptM = exBlock.match(/(Hola,\s*por favor[\s\S]*?)(?=\n\s*(?:Solo copia|💡|Tip|$))/i);
      if (promptM) {
        examplePrompt = promptM[1].trim();
      }
      const introM = exBlock.match(/Si deseas aplicar[\s\S]*?:/i);
      if (introM) {
        exampleIntro = introM[0].trim();
      }
    }

    let tipText = '';
    const tipM = text.match(/(?:💡\s*)?Tip(?: amigable)?[\s\S]*$/i);
    if (tipM) {
      tipText = tipM[0].replace(/^(?:💡\s*)?Tip(?: amigable)?\s*/i, '').trim();
    }

    if (!features || features.length === 0) {
      return null;
    }

    return {
      catalog,
      pricelists,
      features,
      note,
      exampleIntro,
      examplePrompt,
      tipText
    };
  } catch {
    return null;
  }
};

// Parser inteligente para detectar y estructurar respuestas analíticas del catálogo CET
const parseCatalogAnalytics = (text) => {
  if (!text || typeof text !== 'string') return null;

  const isAnalytics =
    (text.includes('Total de Modelos') || text.includes('SKU / Modelo') || text.includes('Precio de Lista Base')) &&
    (text.includes('Primeros') || text.includes('Últimos') || text.includes('Ultimos') || text.includes('Top') || text.includes('Productos del Catálogo') || text.includes('Productos con Precio') || text.includes('Resumen General de Productos') || text.includes('📋'));

  if (!isAnalytics) return null;

  try {
    // 1. Extraer Título y Empresa
    let title = "Exploración de Productos del Catálogo";
    let company = "";

    const titleMatch = text.match(/(?:###\s*)?📋\s*([^\n(]+)(?:\(([^)]+)\))?/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/[`*#]/g, '').trim();
      if (titleMatch[2]) company = titleMatch[2].replace(/[`*#]/g, '').trim();
    }

    // 2. Extraer KPIs
    let totalSkus = "";
    const totalMatch = text.match(/Total de Modelos(?: en Cat[aá]logo)?\s*[*:]+\s*[`*]*([0-9]+(?:\s*[^\n•`*]+)?)/i);
    if (totalMatch) {
      totalSkus = totalMatch[1].replace(/[`*]/g, '').trim();
    }

    let priceRange = "";
    let minPrice = "";
    let maxPrice = "";
    const minM = text.match(/M[ií]nimo\s*[`*]*\$?([0-9,.]+(?:\s*USD)?)[`*]*/i);
    const maxM = text.match(/M[aá]ximo\s*[`*]*\$?([0-9,.]+(?:\s*USD)?)[`*]*/i);
    if (minM) minPrice = minM[1].includes('$') ? minM[1] : `$${minM[1]}`;
    if (maxM) maxPrice = maxM[1].includes('$') ? maxM[1] : `$${maxM[1]}`;
    if (minPrice && !minPrice.includes('USD')) minPrice += ' USD';
    if (maxPrice && !maxPrice.includes('USD')) maxPrice += ' USD';
    if (minPrice && maxPrice) {
      priceRange = `${minPrice} — ${maxPrice}`;
    }

    let avgPrice = "";
    const avgM = text.match(/Precio de Lista Promedio\s*[*:]+\s*[`*]*\$?([0-9,.]+(?:\s*USD)?)[`*]*/i);
    if (avgM) {
      avgPrice = avgM[1].includes('$') ? avgM[1] : `$${avgM[1]}`;
      if (!avgPrice.includes('USD')) avgPrice += ' USD';
    }

    let filterBadge = "";
    const filterM = text.match(/Filtro Aplicado\s*[*:]+\s*[`*]*([^\n`*•]+)[`*]*/i);
    if (filterM) {
      filterBadge = filterM[1].replace(/[`*]/g, '').trim();
    }

    // 3. Extraer Productos
    const products = [];
    const lines = text.split('\n');
    let inTable = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.includes('SKU / Modelo') || (trimmed.startsWith('#') && trimmed.includes('SKU'))) {
        inTable = true;
        continue;
      }
      if (trimmed.includes('---')) continue;
      if (trimmed.startsWith('💡') || trimmed.toLowerCase().startsWith('nota:')) {
        inTable = false;
        continue;
      }

      if (inTable) {
        let cols = [];
        if (trimmed.includes('\t')) {
          cols = trimmed.split('\t').map(c => c.trim());
        } else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          cols = trimmed.split('|').slice(1, -1).map(c => c.trim());
        }

        if (cols.length >= 4) {
          const idx = cols[0].replace(/[`*]/g, '').trim();
          const sku = cols[1].replace(/[`*]/g, '').trim();
          const desc = cols[2].replace(/[`*]/g, '').trim();
          let price = cols[3].replace(/[`*]/g, '').trim();
          if (price && !price.startsWith('$')) price = `$${price}`;
          const feat = cols[4] ? cols[4].replace(/[`*]/g, '').trim() : 'Base Estándar';

          if (sku && sku !== 'SKU / Modelo') {
            products.push({
              index: idx,
              sku,
              description: desc,
              price,
              features: feat
            });
          }
        }
      }
    }

    // 4. Extraer Tip / Sugerencia
    let tipText = "";
    const tipM = text.match(/💡\s*\*?(?:Puedes indicarme[^:\n]*:)?([^\n*]+(?:\n[^\n*]+)*)\*?/i);
    if (tipM) {
      tipText = tipM[0].replace(/💡\s*\*?/g, '').replace(/\*?$/g, '').trim();
    }

    // 5. Sugerencias interactivas
    const suggestions = [];
    const isFirstN = title.toLowerCase().includes('primeros') || (filterBadge && filterBadge.toLowerCase().includes('posición 1'));
    if (isFirstN) {
      suggestions.push({
        label: 'Ver siguientes 5',
        command: 'ver los siguientes 5 productos del catálogo'
      });
    }
    suggestions.push({
      label: 'Los más caros',
      command: 'mostrar los 5 productos más caros del catálogo'
    });
    suggestions.push({
      label: 'Los más económicos',
      command: 'mostrar los 5 productos más económicos del catálogo'
    });
    if (products.length > 0 && products[0].sku) {
      suggestions.push({
        label: `Opciones de ${products[0].sku}`,
        command: `consultar opciones del modelo ${products[0].sku}`
      });
    }

    return {
      title,
      company: company || 'Catálogo XML',
      totalSkus: totalSkus || `${products.length} SKUs`,
      priceRange,
      minPrice,
      maxPrice,
      avgPrice,
      filterBadge: filterBadge || `${products.length} productos mostrados`,
      products,
      tipText,
      suggestions
    };
  } catch {
    return null;
  }
};

const BotMessage = React.memo(({ text, inspectionReport, catalogData, onCommandSelect, isDarkMode = true }) => {
  // 1. Detectar si el texto corresponde a una ficha técnica / inspección de producto
  const productInspection = useMemo(() => {
    return parseProductInspection(text, inspectionReport);
  }, [text, inspectionReport]);

  if (productInspection) {
    return (
      <ProductInspectionCard
        data={productInspection}
        onCommandSelect={onCommandSelect}
        isDarkMode={isDarkMode}
      />
    );
  }

  // 2. Detectar si el texto corresponde a un resumen de catálogo / características con recargo
  const catalogSummary = useMemo(() => {
    return parseCatalogSummary(text, catalogData);
  }, [text, catalogData]);

  if (catalogSummary) {
    return (
      <CatalogSummaryCard
        data={catalogSummary}
        onCommandSelect={onCommandSelect}
        isDarkMode={isDarkMode}
      />
    );
  }

  // 3. Detectar si el texto corresponde a analítica de catálogo / exploración de productos
  const catalogAnalytics = useMemo(() => {
    return parseCatalogAnalytics(text);
  }, [text]);

  if (catalogAnalytics) {
    return (
      <CatalogAnalyticsCard
        data={catalogAnalytics}
        onCommandSelect={onCommandSelect}
        isDarkMode={isDarkMode}
      />
    );
  }

  const processedText = useMemo(() => {
    if (!text) return "";
    let finalStr = text;
    if (text.includes('\t') && !text.includes('|---')) {
      const lines = text.split('\n');
      let inTable = false;
      let newText = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('\t')) {
          const cols = line.split('\t').map(c => c.trim().replace(/\|/g, '-'));
          const mdRow = '| ' + cols.join(' | ') + ' |';
          if (!inTable) {
            inTable = true;
            newText.push(mdRow);
            newText.push('|' + cols.map(() => '---|').join(''));
          } else {
            newText.push(mdRow);
          }
        } else if (inTable && (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))) {
          // Continuación de celda en la fila anterior (ej. lista de viñetas en la última columna)
          if (newText.length > 0) {
            const lastIdx = newText.length - 1;
            newText[lastIdx] = newText[lastIdx].replace(/\s*\|\s*$/, ' <br> ' + line.trim() + ' |');
          }
        } else {
          inTable = false;
          newText.push(line);
        }
      }
      finalStr = newText.join('\n');
    }
    return finalStr;
  }, [text]);

  const htmlContent = useMemo(() => {
    let html = "";
    if (typeof processedText === 'string') {
      html = marked.parse(processedText);
    } else {
      html = marked.parse(String(processedText || ""));
    }

    // Inyectar botones interactivos para comandos de barra después del markdown
    const COMMANDS_REGEX = /(\/(?:SaveXMLcet|exportCETcsv|exportExcel|downloadExcel|compareCET|importBase|saveCatalog|deleteData|executeProcess))\b/gi;
    const btnClass = isDarkMode
      ? 'text-zinc-100 hover:text-white font-semibold underline cursor-pointer inline-flex items-center mx-0.5 alysa-cmd-btn bg-transparent p-0 border-none shadow-none'
      : 'text-[#18181b] hover:text-[#27272a] font-semibold hover:underline cursor-pointer inline-flex items-center mx-0.5 alysa-cmd-btn bg-transparent p-0 border-none shadow-none';

    html = html.replace(COMMANDS_REGEX, `<button class="${btnClass}" data-cmd="$1">$1</button>`);
    html = html.replace(/<code[^>]*>(\s*<button[^>]*alysa-cmd-btn[^>]*>.*?<\/button>\s*)<\/code>/gi, '$1');
    html = html.replace(/<pre[^>]*>(\s*<button[^>]*alysa-cmd-btn[^>]*>.*?<\/button>\s*)<\/pre>/gi, '$1');
    html = html.replace(/<pre[^>]*>\s*<code[^>]*>(\s*<button[^>]*alysa-cmd-btn[^>]*>.*?<\/button>\s*)<\/code>\s*<\/pre>/gi, '$1');
    return html;
  }, [processedText, isDarkMode]);

  const handleClick = (e) => {
    const btn = e.target.closest('.alysa-cmd-btn');
    if (btn && onCommandSelect) {
      const cmd = btn.getAttribute('data-cmd');
      onCommandSelect(cmd);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`text-sm font-sans flex flex-col gap-2 w-full max-w-full overflow-x-auto overflow-y-hidden ${isDarkMode
          ? `text-zinc-100 
             [&_p]:text-zinc-100 [&_p]:leading-relaxed [&_p]:my-1.5
             [&_strong]:text-white [&_strong]:font-bold
             [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-white [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:tracking-tight
             [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-3.5 [&_h2]:mb-2 [&_h2]:tracking-tight
             [&_h3]:text-[14px] [&_h3]:font-bold [&_h3]:text-zinc-100 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:tracking-tight
             [&_h4]:text-[13px] [&_h4]:font-semibold [&_h4]:text-zinc-200 [&_h4]:mt-2.5 [&_h4]:mb-1
             [&_ul]:my-2 [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:list-disc
             [&_ol]:my-2 [&_ol]:space-y-1 [&_ol]:pl-5 [&_ol]:list-decimal
             [&_li]:text-zinc-200 [&_li]:text-[13px] [&_li]:leading-relaxed
             [&_a]:text-blue-400 [&_a]:underline hover:[&_a]:text-blue-300
             [&_code]:font-mono [&_code]:text-[11.5px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-none [&_code]:bg-white/10 [&_code]:text-white [&_code]:border [&_code]:border-white/15
             [&_pre]:bg-[#09090b]/80 [&_pre]:border [&_pre]:border-white/10 [&_pre]:rounded-none [&_pre]:p-3 [&_pre]:my-2.5 [&_pre]:overflow-x-auto
             [&_hr]:border-white/10 [&_hr]:my-3
             [&_table]:w-full [&_table]:border-collapse [&_table]:my-3.5 [&_table]:rounded-none [&_table]:overflow-hidden [&_table]:border [&_table]:border-white/10 [&_table]:bg-[#09090b]/60 [&_table]:backdrop-blur-md [&_table]:shadow-md
             [&_thead]:bg-white/[0.06] [&_thead]:border-b [&_thead]:border-white/10
             [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-zinc-300 [&_th]:border-b [&_th]:border-white/10
             [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:text-xs [&_td]:text-zinc-300 [&_td]:border-b [&_td]:border-white/[0.05]
             [&_tr:last-child_td]:border-b-0
             [&_tbody_tr]:transition-colors hover:[&_tbody_tr]:bg-white/[0.04]`
          : `text-gray-800
             [&_p]:text-gray-800 [&_p]:leading-relaxed [&_p]:my-1.5
             [&_strong]:text-gray-900 [&_strong]:font-bold
             [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mt-4 [&_h1]:mb-2
             [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-3.5 [&_h2]:mb-2
             [&_h3]:text-[14px] [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-3 [&_h3]:mb-1.5
             [&_h4]:text-[13px] [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mt-2.5 [&_h4]:mb-1
             [&_ul]:my-2 [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:list-disc
             [&_ol]:my-2 [&_ol]:space-y-1 [&_ol]:pl-5 [&_ol]:list-decimal
             [&_li]:text-gray-700 [&_li]:text-[13px] [&_li]:leading-relaxed
             [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-700
             [&_code]:font-mono [&_code]:text-[11.5px] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-none [&_code]:bg-slate-100 [&_code]:text-slate-900 [&_code]:border [&_code]:border-slate-200
             [&_pre]:bg-slate-100 [&_pre]:border [&_pre]:border-slate-200 [&_pre]:rounded-none [&_pre]:p-3 [&_pre]:my-2.5 [&_pre]:overflow-x-auto
             [&_hr]:border-slate-200 [&_hr]:my-3
             [&_table]:w-full [&_table]:border-collapse [&_table]:my-3.5 [&_table]:rounded-none [&_table]:overflow-hidden [&_table]:border [&_table]:border-slate-200 [&_table]:bg-white [&_table]:shadow-sm
             [&_thead]:bg-slate-50 [&_thead]:border-b [&_thead]:border-slate-200
             [&_th]:px-3.5 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-slate-700 [&_th]:border-b [&_th]:border-slate-200
             [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:text-xs [&_td]:text-slate-700 [&_td]:border-b [&_td]:border-slate-100
             [&_tr:last-child_td]:border-b-0
             [&_tbody_tr]:transition-colors hover:[&_tbody_tr]:bg-slate-50`
        }`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
});

export default function TeamsAgentChat({ currentSection, renderTool, onOpenToolPanel, isDarkMode = true }) {
  const [selectedAgent] = useState({ agent_name: "Alysa", role: "AI Engine" });

  const getInitialPhase = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('alysa_phase_' + window.location.pathname.split('/')[1]);
      if (stored) return parseInt(stored, 10);
    }
    return 1;
  };
  const [unlockedPhase, setUnlockedPhase] = useState(getInitialPhase);

  const updatePhase = (newPhase) => {
    setUnlockedPhase(newPhase);
    if (typeof window !== 'undefined') {
      localStorage.setItem('alysa_phase_' + window.location.pathname.split('/')[1], newPhase);
    }
  };

  useEffect(() => {
    const checkDbPhase = async () => {
      try {
        const modName = (typeof window !== 'undefined' && window.location.pathname.split('/')[1]) || 'xml-pipeline';
        const tableName = 'ClientsSERVEX_General_Procces';

        const { data } = await supabase
          .from(tableName)
          .select('xml_raw, XM_CET_import, csv_raw, csv_new_raw, xml_actualizer_raw, file_name, xml_name')
          .eq('company_name', 'General_Procces')
          .maybeSingle();

        if (data) {
          const fname = data.file_name || data.xml_name;
          if (fname) {
            setActiveCatalogName(fname);
            activeCatalogRef.current = fname;
          }
          if (data.csv_raw && String(data.csv_raw).trim()) {
            setDbCsvRaw(data.csv_raw);
          }
          const rawXml = (data.XM_CET_import && String(data.XM_CET_import).trim()) || (data.xml_raw && String(data.xml_raw).trim());
          if (rawXml) {
            setDbXmlRaw(rawXml);
          }

          const hasXml = !!((data.xml_raw && String(data.xml_raw).trim()) || (data.XM_CET_import && String(data.XM_CET_import).trim()));
          const hasCsvBase = !!(data.csv_raw && String(data.csv_raw).trim());
          const hasCsvNew = !!(data.csv_new_raw && String(data.csv_new_raw).trim());
          const hasFinalXml = !!(data.xml_actualizer_raw && String(data.xml_actualizer_raw).trim());

          if (hasFinalXml) {
            setUnlockedPhase(4);
            localStorage.setItem('alysa_phase_' + modName, 4);
          } else if (hasXml && hasCsvBase && hasCsvNew) {
            setUnlockedPhase(3);
            localStorage.setItem('alysa_phase_' + modName, 3);
          } else if (hasXml) {
            setUnlockedPhase(2);
            localStorage.setItem('alysa_phase_' + modName, 2);
          } else {
            setUnlockedPhase(1);
            localStorage.setItem('alysa_phase_' + modName, 1);
          }
        }
      } catch (err) {
        console.error("Error validando la fase en DB:", err);
      }
    };
    checkDbPhase();
  }, []);

  const [dbCsvRaw, setDbCsvRaw] = useState(null);
  const [dbXmlRaw, setDbXmlRaw] = useState(null);

  // Sincronización en tiempo real al modificarse o generarse la matriz Excel/CSV
  useEffect(() => {
    const handleMatrixUpdate = (e) => {
      const { csvRaw } = e.detail || {};
      if (csvRaw) {
        setDbCsvRaw(csvRaw);
      }
    };
    window.addEventListener('catalogMatrixUpdated', handleMatrixUpdate);
    return () => window.removeEventListener('catalogMatrixUpdated', handleMatrixUpdate);
  }, []);

  const [dbCsvNewRaw, setDbCsvNewRaw] = useState(null);

  // Sincronización en tiempo real al cargarse el CSV actualizado (csv_new_raw)
  useEffect(() => {
    const handleCsvNewUpdate = (e) => {
      const { csvNewRaw } = e.detail || {};
      if (csvNewRaw) {
        setDbCsvNewRaw(csvNewRaw);
      }
    };
    window.addEventListener('catalogCsvNewUpdated', handleCsvNewUpdate);
    return () => window.removeEventListener('catalogCsvNewUpdated', handleCsvNewUpdate);
  }, []);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState('Servex US');
  const [activeCatalogName, setActiveCatalogName] = useState('General Process.xml');
  const activeCatalogRef = useRef('General Process.xml');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Estados de Guía IA y Micrófono STT
  const [showAiGuideModal, setShowAiGuideModal] = useState(false);
  const [guideSearch, setGuideSearch] = useState("");
  const [guideCategory, setGuideCategory] = useState("all");
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef(null);
  const ignoreSpeechRef = useRef(false);
  const speechBaseTextRef = useRef("");
  const currentTranscriptRef = useRef("");

  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const xmlFileInputRef = useRef(null);

  const [isCommitting, setIsCommitting] = useState(false);
  const [isUploadingXml, setIsUploadingXml] = useState(false);
  const [dragActiveXml, setDragActiveXml] = useState(false);

  const apiURL =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://servex-ai-back.onrender.com';

  // Listener para el botón "Guía IA" ubicado en el header de page.jsx
  useEffect(() => {
    const handleOpenAiGuide = () => setShowAiGuideModal(true);
    window.addEventListener('openAiGuide', handleOpenAiGuide);
    return () => window.removeEventListener('openAiGuide', handleOpenAiGuide);
  }, []);

  // Filtro de preguntas de la Guía IA
  const filteredGuideQuestions = useMemo(() => {
    return AI_GUIDE_QUESTIONS.filter(item => {
      const matchesCat = guideCategory === "all" || item.category === guideCategory;
      const matchesSearch = !guideSearch.trim() ||
        item.q.toLowerCase().includes(guideSearch.toLowerCase()) ||
        item.desc.toLowerCase().includes(guideSearch.toLowerCase()) ||
        item.tag.toLowerCase().includes(guideSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [guideCategory, guideSearch]);

  // Listener de mensajes globales y pasos de importación
  useEffect(() => {
    const handleGlobalMessage = (e) => {
      const { from, text, toolId } = e.detail;
      setMessages(prev => [...prev, { from, text, toolId, isNew: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 350);
    };
    window.addEventListener('globalChatMessage', handleGlobalMessage);

    const handleGeneralImportStep = (e) => {
      const { step } = e.detail;
      if (step === 'csv_base') {
        setMessages(prev => [
          ...prev,
          { from: 'bot', text: 'XML saved successfully. Base CSV is already registered in the system. Now, please upload the Updated CSV file.', isNew: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { from: 'tool', toolId: 'incert_wbs_csv_new' }
        ]);
      } else if (step === 'csv_new') {
        setMessages(prev => [
          ...prev,
          { from: 'bot', text: 'Base CSV saved successfully. Finally, please upload the Updated CSV file.', isNew: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { from: 'tool', toolId: 'incert_wbs_csv_new' }
        ]);
      } else if (step === 'done') {
        setMessages(prev => [
          ...prev,
          { from: 'bot', text: 'All files have been saved successfully. The Ingestion process is complete.', isNew: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        updatePhase(3);
      }
      setTimeout(() => scrollToBottom(true), 100);
    };
    window.addEventListener('wbsImportStep', handleGeneralImportStep);

    return () => {
      window.removeEventListener('globalChatMessage', handleGlobalMessage);
      window.removeEventListener('wbsImportStep', handleGeneralImportStep);
    };
  }, []);

  // Carga de historial
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // 1. Cargar directamente desde Supabase 'ClientsSERVEX_General_Procces.general_procces_chat'
        const { history: dbHistory, catalogName: dbCat } = await loadGeneralProcessChat();
        if (dbHistory && dbHistory.length > 0) {
          setMessages(dbHistory);
          if (dbCat) {
            setActiveCatalogName(dbCat);
            activeCatalogRef.current = dbCat;
          }
          return;
        }

        // 2. Si no había en BD o estaba vacía, consultar backend como fallback
        const res = await fetch(`${apiURL}/api/v1/General_Procces/agent/history`).catch(() => null);
        if (!res || !res.ok) return;
        const data = await res.json().catch(() => null);
        if (data && data.status === "success" && data.history && Array.isArray(data.history) && data.history.length > 0) {
          setMessages(data.history);
          saveGeneralProcessChat(data.history, activeCatalogRef.current || 'General Process.xml');
        }
      } catch (e) {
        // Silenciosamente ignorar si el backend está offline
      }
    };
    fetchHistory();
  }, [apiURL]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Cleanup de reconocimiento de voz al desmontar
  useEffect(() => {
    return () => {
      ignoreSpeechRef.current = true;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { }
      }
    };
  }, []);

  // Función STT para grabar voz y transcribir directamente al input
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }
      setIsRecording(false);
      if (currentTranscriptRef.current) {
        const polished = formatProfessionalSpeechText(currentTranscriptRef.current);
        currentTranscriptRef.current = polished;
        setInput(polished);
      }
      return;
    }

    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = typeof navigator !== 'undefined' ? (navigator.language || "en-US") : "en-US";

      ignoreSpeechRef.current = false;
      const initialVal = inputRef.current ? inputRef.current.value : input;
      speechBaseTextRef.current = initialVal ? (initialVal.trim() + " ") : "";
      currentTranscriptRef.current = initialVal || "";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        if (ignoreSpeechRef.current) return;

        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += res[0].transcript + " ";
          } else {
            interimTranscript += res[0].transcript;
          }
        }

        if (ignoreSpeechRef.current) return;

        const currentSpoken = (finalTranscript + interimTranscript).trim();
        const newText = speechBaseTextRef.current ? (speechBaseTextRef.current + currentSpoken) : currentSpoken;
        currentTranscriptRef.current = newText;
        setInput(newText);
        if (inputRef.current) {
          inputRef.current.scrollTop = inputRef.current.scrollHeight;
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error !== "no-speech") {
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
        if (!ignoreSpeechRef.current && currentTranscriptRef.current) {
          const polished = formatProfessionalSpeechText(currentTranscriptRef.current);
          currentTranscriptRef.current = polished;
          setInput(polished);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start error:", err);
      setIsRecording(false);
    }
  }, [isRecording, input]);

  const scrollToBottom = useCallback((immediate = false) => {
    if (scrollContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;

      // Si el usuario subió haciendo scroll para leer la información, no interrumpir ni forzar abajo
      if (!isNearBottom && !immediate) return;

      scrollContainerRef.current.scrollTo({
        top: scrollHeight,
        behavior: immediate ? "auto" : "smooth"
      });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    currentTranscriptRef.current = val;
    if (val === "/") {
      setShowSlashMenu(true);
    } else if (showSlashMenu && !val.startsWith("/")) {
      setShowSlashMenu(false);
    }
  };

  const handleCommandSelect = (cmdLabel) => {
    setInput("");
    setShowSlashMenu(false);
    setTimeout(() => {
      sendMessage(cmdLabel);
    }, 50);
  };

  const sendMessage = async (overrideText) => {
    // Interrumpir cualquier captura de voz activa
    ignoreSpeechRef.current = true;
    speechBaseTextRef.current = "";
    currentTranscriptRef.current = "";
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) { }
      recognitionRef.current = null;
    }
    setIsRecording(false);

    const queryToSend = (overrideText || input).trim();
    if (!queryToSend || isLoading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      from: "user",
      role: "user",
      text: queryToSend,
      content: queryToSend,
      time: now,
      timestamp: new Date().toISOString(),
      catalog: activeCatalogRef.current || 'General Process.xml'
    };
    setMessages(prev => {
      const nextList = [...prev, userMsg];
      saveGeneralProcessChat(nextList, activeCatalogRef.current || 'General Process.xml');
      return nextList;
    });
    setInput("");
    setShowSlashMenu(false);
    setIsLoading(true);

    // CONTROLADORES DE HERRAMIENTAS Y COMANDOS DE BARRA
    const qLower = queryToSend.toLowerCase();
    if (qLower === '/importbase' && unlockedPhase < 2) updatePhase(2);
    if (qLower === '/executeprocess' && unlockedPhase < 4) updatePhase(4);
    if (qLower === '/deletedata') updatePhase(1);

    if (qLower === '/deletedata') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Opening tenant data deletion panel...', isNew: true }, { from: 'tool', toolId: 'delete_data' }]);
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }

    if (qLower === '/importcetxml') {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            from: 'bot',
            text: '💡 **Carga Directa de Catálogo XML Maestro**\n\nEl comando `/importCETxml` ha sido retirado. Ahora el catálogo XML se sube y desestructura directamente desde la opción del input (haciendo clic en el icono 📎 o arrastrando y soltando tu archivo `.xml` aquí).',
            needs_upload: true,
            isNew: true
          }
        ]);
        setIsLoading(false);
        scrollToBottom(true);
      }, 300);
      return;
    }

    if (qLower === '/importbase') {
      (async () => {
        try {
          const { data } = await supabase
            .from('ClientsSERVEX_General_Procces')
            .select('xml_raw, xml_name, file_name, XM_CET_import')
            .eq('company_name', 'General_Procces')
            .maybeSingle();

          const xmlContent = data?.xml_raw || data?.XM_CET_import || '';
          const hasXml = !!xmlContent && String(xmlContent).trim().length > 0;

          if (hasXml) {
            let fname = data?.xml_name || data?.file_name || '';
            if (!fname && xmlContent) {
              const m = String(xmlContent).match(/<!--\s*filename:\s*(.*?)\s*-->/i);
              if (m && m[1]) fname = m[1].trim();
              else {
                const m2 = String(xmlContent).match(/<Catalog[^>]*\bName=["']([^"']+)["']/i);
                if (m2 && m2[1]) fname = m2[1].endsWith('.xml') ? m2[1] : `${m2[1]}.xml`;
              }
            }
            if (!fname) fname = 'General Process.xml';

            setMessages(prev => [
              ...prev,
              {
                from: 'bot',
                text: `El archivo maestro XML **(${fname})** está cargado y activo en la base de datos (**File already exists in DB**). El sistema está listo para recibir el CSV de nuevos precios (\`csv_new_raw\`).\n\nPuedes arrastrar tu archivo CSV aquí abajo o a cualquier parte del chat.`,
                isNew: true
              },
              { from: 'tool', toolId: 'incert_wbs_csv_new' }
            ]);
          } else {
            setMessages(prev => [
              ...prev,
              { from: 'bot', text: 'Por favor sube o arrastra el archivo maestro XML de CET Designer para iniciar el proceso.', isNew: true },
              { from: 'tool', toolId: 'incert_delete' }
            ]);
          }
        } catch (e) {
          setMessages(prev => [
            ...prev,
            { from: 'bot', text: 'Por favor sube o arrastra el archivo maestro XML de CET Designer para iniciar el proceso.', isNew: true },
            { from: 'tool', toolId: 'incert_delete' }
          ]);
        }
        setIsLoading(false);
        scrollToBottom(true);
      })();
      return;
    }

    if (qLower === '/exportcetcsv' || qLower === '/downloadexcel' || qLower === '/exportexcel') {
      recordClientAction({
        companyName: 'General_Procces',
        eventType: 'OPEN_XML_MATRIX',
        title: 'Apertura de Matriz de Catálogo',
        description: 'El usuario solicitó abrir la tabla y matriz de exportación del catálogo.'
      });
      if (typeof onOpenToolPanel === 'function') {
        onOpenToolPanel('xml_results');
      }
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { 
            from: 'bot', 
            text: 'Aquí tienes la tabla y matriz de exportación para clientes (**Export Data Client**):\nPuedes descargar el catálogo en formato **Excel (.xlsx)** o **CSV** con un solo clic desde la barra superior de la matriz.', 
            toolId: 'xml_results',
            isNew: true 
          }
        ]);
        setIsLoading(false);
        setTimeout(() => scrollToBottom(true), 150);
      }, 350);
      return;
    }

    if (qLower === '/comparecet') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Deploying CET Comparator on the main panel...', isNew: true }]);
        if (typeof onOpenToolPanel === 'function') onOpenToolPanel('compare_cet');
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }



    if (qLower === '/executeprocess') {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev, 
        { 
          from: "bot", 
          text: "⚙️ **Iniciando auditoría comparativa matricial** (`csv_raw` vs `csv_new_raw`)...\nAnalizando diferencias en catálogo, precios base, opciones, altas y bajas de productos.", 
          time: nowTime 
        }
      ]);

      try {
        // 1. Recopilar de múltiples fuentes locales/estado para garantizar 0 fallas ante RLS
        let csvRawToSend = dbCsvRaw || (typeof window !== 'undefined' ? sessionStorage.getItem('csv_raw') : null) || null;
        let csvNewRawToSend = dbCsvNewRaw || (typeof window !== 'undefined' ? sessionStorage.getItem('csv_new_raw') : null) || null;
        let xmlRawToSend = dbXmlRaw || null;

        // 2. Si falta alguno, enriquecer desde Supabase con la sesión activa del usuario
        try {
          const { data: catData } = await supabase
            .from('ClientsSERVEX_General_Procces')
            .select('csv_raw, csv_new_raw, xml_raw, XM_CET_import')
            .eq('company_name', 'General_Procces')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (catData) {
            if (!csvNewRawToSend && catData.csv_new_raw) csvNewRawToSend = catData.csv_new_raw;
            if (!csvRawToSend && catData.csv_raw) csvRawToSend = catData.csv_raw;
            if (!xmlRawToSend && (catData.xml_raw || catData.XM_CET_import)) {
              xmlRawToSend = catData.xml_raw || catData.XM_CET_import;
            }
          }
        } catch (dbErr) {
          console.warn('[-] Advertencia en consulta Supabase previa a comparación:', dbErr);
        }

        const formData = new FormData();
        formData.append('company_name', 'General_Procces');
        if (csvRawToSend) {
          formData.append('csv_raw', typeof csvRawToSend === 'string' ? csvRawToSend : JSON.stringify(csvRawToSend));
        }
        if (csvNewRawToSend) {
          formData.append('csv_new_raw', typeof csvNewRawToSend === 'string' ? csvNewRawToSend : JSON.stringify(csvNewRawToSend));
        }
        // Solo enviar xml_raw como fallback si no se dispone del csv_raw base
        if (xmlRawToSend && !csvRawToSend) {
          formData.append('xml_raw', typeof xmlRawToSend === 'string' ? xmlRawToSend : JSON.stringify(xmlRawToSend));
        }

        const headers = {};
        try {
          const { data: authData } = await supabase.auth.getSession();
          if (authData?.session?.access_token) {
            headers['Authorization'] = `Bearer ${authData.session.access_token}`;
          }
          if (authData?.session?.user?.id) {
            formData.append('user_id', authData.session.user.id);
          }
        } catch (_) {}

        const response = await fetch(`${apiURL}/api/v1/General_Procces/pipeline/compare-only`, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || 'Comparison engine response failed');
        }

        const resData = await response.json();

        // ── PERSISTENCIA GARANTIZADA DE audit_summary_markdown1 EN SUPABASE ──
        if (resData?.markdown_report_1) {
          (async () => {
            try {
              const { data: authUser } = await supabase.auth.getUser().catch(() => ({ data: {} }));
              const currentUserId = authUser?.user?.id || null;
              const persistencePayload = {
                company_name: 'General_Procces',
                audit_summary_markdown1: resData.markdown_report_1,
                audit_report_json: resData
              };
              if (currentUserId) persistencePayload.user_id = currentUserId;

              // 1. Intentar actualizar registro existente por company_name
              const { data: updData } = await supabase
                .from('ClientsSERVEX_General_Procces')
                .update(persistencePayload)
                .ilike('company_name', 'General_Procces')
                .select('id');

              // 2. Si no había registro previo con ese company_name, buscar el último o hacer upsert
              if (!updData || updData.length === 0) {
                const { data: anyRow } = await supabase
                  .from('ClientsSERVEX_General_Procces')
                  .select('id')
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (anyRow?.id) {
                  await supabase
                    .from('ClientsSERVEX_General_Procces')
                    .update(persistencePayload)
                    .eq('id', anyRow.id);
                } else {
                  await supabase
                    .from('ClientsSERVEX_General_Procces')
                    .upsert(persistencePayload, { onConflict: 'company_name' });
                }
              }
              console.log('[+] audit_summary_markdown1 sincronizado con éxito en ClientsSERVEX_General_Procces');
            } catch (syncErr) {
              console.warn('[-] Advertencia persistiendo audit_summary_markdown1 desde cliente:', syncErr);
            }
          })();
        }

        const changesCount = resData.changes_detected_count ?? (resData.detected_changes?.length || 0);
        const newCount = resData.new_models_count ?? (resData.summary?.new_models_detected_count || 0);
        const deletedCount = resData.deleted_models_count ?? (resData.summary?.deleted_models_detected_count || 0);
        const totalEvaluated = resData.total_evaluated ?? (resData.summary?.total_common_models_evaluated || 0);

        if (unlockedPhase < 4) updatePhase(4);

        const hasDifferences = changesCount > 0 || newCount > 0 || deletedCount > 0;
        const botReplyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const summaryText = hasDifferences
          ? `He completado la **auditoría comparativa matricial** entre el catálogo base (\`csv_raw\`) y el archivo actualizado (\`csv_new_raw\`).\n\nHe identificado **${changesCount} cambios en precios/celdas**, **${newCount} productos nuevos agregados** y **${deletedCount} productos dados de baja** sobre un total de **${totalEvaluated} modelos comunes evaluados**.\n\n*(Nota: El archivo XML maestro permanece 100% intacto y sin modificar).* Puedes revisar las discrepancias celda por celda en la tarjeta interactiva a continuación:`
          : `He completado la **auditoría comparativa matricial**. Ambas matrices de datos son **100% idénticas** (${totalEvaluated} modelos evaluados). No se detectaron discrepancias de precios ni altas/bajas de productos.`;

        setMessages(prev => [
          ...prev,
          {
            id: `comparison-audit-${Date.now()}`,
            from: "bot",
            role: "assistant",
            text: summaryText,
            comparisonReport: resData,
            time: botReplyTime
          }
        ]);
      } catch (err) {
        setMessages(prev => [
          ...prev, 
          { 
            from: "bot", 
            text: `❌ Error durante la comparación de matrices: ${err.message}`, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
        ]);
      }
      setIsLoading(false);
      return;
    }

    // Solicitud ordinaria al agente IA
    try {
      // Optimización de payload: enviar solo los últimos 8 mensajes para evitar latencia de red y sobrecarga de tokens
      const historyPayload = messages.filter(msg => msg.text).slice(-8).map(msg => ({
        role: msg.from === "user" ? "user" : "assistant",
        content: msg.text
      }));
      historyPayload.push({ role: "user", content: queryToSend });

      const { data: chatAuth } = await supabase.auth.getUser().catch(() => ({ data: {} }));
      const chatUserId = chatAuth?.user?.id || null;

      // Asegurar que la fila de sesión existe en Supabase para persistir seguimiento_client y chat (asíncrono, no bloquea el envío)
      (async () => {
        try {
          const checkRow = await supabase
            .from('ClientsSERVEX_General_Procces')
            .select('id')
            .eq('company_name', 'General_Procces')
            .maybeSingle();

          if (!checkRow?.data?.id) {
            const initPayload = {
              company_name: 'General_Procces',
              seguimiento_client: {
                company_name: 'General_Procces',
                created_at: new Date().toISOString(),
                last_updated: new Date().toISOString(),
                total_actions: 0,
                session_summary: 'Sesión iniciada sin acciones registradas aún.',
                events: []
              }
            };
            if (chatUserId) initPayload.user_id = chatUserId;
            await supabase
              .from('ClientsSERVEX_General_Procces')
              .upsert(initPayload, { onConflict: 'company_name' });
          }
        } catch (_) {}
      })();

      const res = await fetch(`${apiURL}/api/v1/General_Procces/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          raw_messages: [...messages.filter(msg => msg.text).slice(-15), { from: "user", text: queryToSend, time: now }],
          company_name: context,
          current_section: currentSection,
          unlocked_phase: unlockedPhase,
          user_id: chatUserId
        }),
      });
      const data = await res.json();
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const botMsg = {
        id: `msg-bot-${Date.now()}`,
        from: "bot",
        role: "assistant",
        text: data?.reply || "No response received.",
        content: data?.reply || "No response received.",
        staged_result: data?.staged_result || null,
        inspection_report: data?.inspection_report || null,
        catalog_data: data?.catalog_data || null,
        can_commit: Boolean(data?.can_commit),
        needs_upload: Boolean(data?.needs_upload),
        committed: false,
        time: botTime,
        timestamp: new Date().toISOString(),
        catalog: activeCatalogRef.current || 'General Process.xml'
      };
      setMessages(prev => {
        const nextList = [...prev, botMsg];
        saveGeneralProcessChat(nextList, activeCatalogRef.current || 'General Process.xml');
        return nextList;
      });
    } catch {
      const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const errMsg = {
        id: `msg-err-${Date.now()}`,
        from: "bot",
        role: "assistant",
        text: "❌ Connection error.",
        content: "❌ Connection error.",
        time: errTime,
        timestamp: new Date().toISOString(),
        catalog: activeCatalogRef.current || 'General Process.xml'
      };
      setMessages(prev => {
        const nextList = [...prev, errMsg];
        saveGeneralProcessChat(nextList, activeCatalogRef.current || 'General Process.xml');
        return nextList;
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Manejo de Carga e Ingesta de XML Directo en el Chat
  const handleXmlFileUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xml')) {
      alert('Solo se admiten archivos en formato .xml (CET Designer / Catalog Creator).');
      return;
    }

    setIsUploadingXml(true);
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const uploadId = `xml-upload-${Date.now()}`;
    activeCatalogRef.current = file.name;
    setActiveCatalogName(file.name);

    // Obtener sesión de usuario al inicio de la función para usarla en todos los pasos
    const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: {} }));
    const currentUser = authData?.user;

    const uploadUserMsg = {
      id: uploadId,
      from: 'user',
      role: 'user',
      isXmlUpload: true,
      fileName: file.name,
      fileSizeKb: (file.size / 1024).toFixed(1),
      uploadStatus: 'uploading',
      text: `**Archivo XML adjunto para ingestión:** \`${file.name}\` (${(file.size / 1024).toFixed(1)} KB)`,
      content: `Archivo XML adjunto para ingestión: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      time: userTime,
      timestamp: new Date().toISOString(),
      catalog: file.name
    };
    setMessages((prev) => {
      const nextList = [...prev, uploadUserMsg];
      saveGeneralProcessChat(nextList, file.name);
      return nextList;
    });

    try {
      const fileText = await file.text().catch(() => '');
      if (fileText) setDbXmlRaw(fileText);

      // ── PASO 1: Subida ultrarrápida al bucket de Supabase (catalogs-storage) ──
      let uploadedPublicUrl = '';
      try {
        const cleanName = (file.name || 'catalog.xml').replace(/[^a-zA-Z0-9._-]/g, '_');
        const storageFilePath = `General_Procces/${Date.now()}_${cleanName}`;

        const { data: storageData, error: storageErr } = await supabase.storage
          .from('catalogs-storage')
          .upload(storageFilePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'application/xml'
          });

        if (!storageErr && storageData) {
          const { data: publicUrlObj } = supabase.storage
            .from('catalogs-storage')
            .getPublicUrl(storageData.path);
          if (publicUrlObj?.publicUrl) {
            uploadedPublicUrl = publicUrlObj.publicUrl;
          }
        }

        // Persistir referencia en la tabla de Supabase sin saturar postgres
        const baseXmlName = (file.name || '').replace(/\.xml$/i, '').trim();
        const payload = {
          company_name: 'General_Procces',
          file_name: file.name,
          xml_name: baseXmlName,
          xml_raw: uploadedPublicUrl ? `[STORAGE_URL]: ${uploadedPublicUrl}` : fileText,
          XM_CET_import: uploadedPublicUrl ? `[STORAGE_URL]: ${uploadedPublicUrl}` : fileText
        };
        if (currentUser?.id) payload.user_id = currentUser.id;

        await supabase
          .from('ClientsSERVEX_General_Procces')
          .upsert(payload, { onConflict: 'company_name' });
      } catch (stgErr) {
        console.warn('[-] Advertencia en almacenamiento primario Supabase:', stgErr);
      }

      // Marcar de inmediato el check en la barra del mensaje del usuario
      setMessages((prev) =>
        prev.map((m) =>
          m.id === uploadId ? { ...m, uploadStatus: 'completed' } : m
        )
      );

      // Respuesta instantánea de confirmación del guardado en Supabase con consola en vivo
      const ackTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const processConsoleId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        {
          id: processConsoleId,
          from: 'bot',
          text: `**Catálogo guardado exitosamente en Supabase Storage.**\n\nEl archivo \`${file.name}\` ha sido respaldado en el bucket seguro. Iniciando ahora la desestructuración y análisis en memoria de sus productos, precios y características...`,
          isProcessingConsole: true,
          processFileName: file.name,
          processCompleted: false,
          time: ackTime
        }
      ]);

      // ── PASO 2: Ingesta y análisis estructural en el motor de memoria ──
      const formData = new FormData();
      formData.append('company_name', 'General_Procces');
      formData.append('xml_file', file);
      if (currentUser?.id) {
        formData.append('user_id', currentUser.id);
      }
      if (uploadedPublicUrl) {
        formData.append('storage_url', uploadedPublicUrl);
      }

      const res = await fetch(`${apiURL}/api/v1/General_Procces/agent/upload-xml`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Falla al desestructurar XML');
      }

      const data = await res.json();
      if (fileText) data.xml_raw = fileText;
      if (dbCsvRaw) data.csv_raw = dbCsvRaw;

      // Persistir de inmediato la desestructuración enriquecida en la columna xml_structure_context
      try {
        const structureToStore = { ...data };
        delete structureToStore.xml_raw; // Evitar duplicar el XML crudo masivo dentro de JSONB
        delete structureToStore.csv_raw;
        delete structureToStore.products;
        delete structureToStore.options;

        const payloadContext = {
          company_name: 'General_Procces',
          file_name: file.name,
          xml_name: (file.name || '').replace(/\.xml$/i, '').trim(),
          xml_structure_context: structureToStore
        };
        if (currentUser?.id) payloadContext.user_id = currentUser.id;

        await supabase
          .from('ClientsSERVEX_General_Procces')
          .upsert(payloadContext, { onConflict: 'company_name' });
        console.log('[+] xml_structure_context persistido exitosamente en ClientsSERVEX_General_Procces');
      } catch (saveContextErr) {
        console.warn('[-] Advertencia persistiendo xml_structure_context en Supabase:', saveContextErr);
      }

      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (unlockedPhase < 2) updatePhase(2);

      // Marcar consola de proceso como completada
      setMessages((prev) =>
        prev.map((m) =>
          m.id === processConsoleId
            ? { ...m, processCompleted: true, processSummary: data }
            : m
        )
      );

      // Emitir mensaje enriquecido con el análisis completo
      const catalogIngestMsg = {
        id: Date.now() + 2,
        from: 'bot',
        role: 'assistant',
        text: `**Catálogo XML Maestro Ingerido y Desestructurado en Memoria**\n\nEl archivo \`${file.name}\` fue analizado sin tocar Excel. El catálogo está listo para recibir instrucciones de actualización de precios o consulta de características.`,
        content: `Catálogo XML Maestro Ingerido y Desestructurado en Memoria: ${file.name}. Listo para recibir instrucciones.`,
        uploadSummary: data,
        time: botTime,
        timestamp: new Date().toISOString(),
        catalog: file.name
      };
      setMessages((prev) => {
        const nextList = [...prev, catalogIngestMsg];
        saveGeneralProcessChat(nextList, file.name);
        return nextList;
      });
    } catch (err) {
      console.error('Error subiendo XML:', err);
      // Marcar mensaje de subida con error
      setMessages((prev) =>
        prev.map((m) =>
          m.id === uploadId ? { ...m, uploadStatus: 'error' } : m
        )
      );
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: `**Error al ingerir el archivo XML:** ${err.message}`,
          time: botTime
        }
      ]);
    } finally {
      setIsUploadingXml(false);
    }
  };

  // Manejo de Carga e Ingesta de CSV Nuevo Directo en el Chat
  const handleCsvFileUpload = async (file) => {
    if (!file) return;
    const isCsvOrExcel = file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
    if (!isCsvOrExcel) {
      alert('Solo se admiten archivos en formato .csv o .xlsx para la matriz de nuevos precios.');
      return;
    }

    setIsUploadingXml(true);
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const uploadId = `csv-upload-${Date.now()}`;

    // Obtener sesión de usuario al inicio de la función
    const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: {} }));
    const currentUser = authData?.user;

    const uploadUserMsg = {
      id: uploadId,
      from: 'user',
      role: 'user',
      isCsvUpload: true,
      fileName: file.name,
      fileSizeKb: (file.size / 1024).toFixed(1),
      uploadStatus: 'uploading',
      text: `**Matriz CSV de Nuevos Precios adjunta:** \`${file.name}\` (${(file.size / 1024).toFixed(1)} KB)`,
      content: `Matriz CSV de Nuevos Precios adjunta: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      time: userTime,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => {
      const nextList = [...prev, uploadUserMsg];
      saveGeneralProcessChat(nextList);
      return nextList;
    });

    try {
      const fileText = await file.text().catch(() => '');
      if (!fileText || !fileText.trim()) {
        throw new Error('El archivo CSV seleccionado está vacío o no pudo ser leído.');
      }

      setDbCsvNewRaw(fileText);

      // Persistir en sessionStorage y dispatch evento
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('csv_new_raw', fileText);
        window.dispatchEvent(new CustomEvent('catalogCsvNewUpdated', { detail: { csvNewRaw: fileText } }));
      }

      let valToStore = fileText;
      // Subir a catalogs-storage si supera 200 KB
      if (file.size > 200 * 1024) {
        try {
          const cleanName = (file.name || 'csv_new.csv').replace(/[^a-zA-Z0-9._-]/g, '_');
          const storageFilePath = `General_Procces/csv_new_${Date.now()}_${cleanName}`;

          const { data: storageData, error: storageErr } = await supabase.storage
            .from('catalogs-storage')
            .upload(storageFilePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type || 'text/csv'
            });

          if (!storageErr && storageData) {
            const { data: publicUrlObj } = supabase.storage
              .from('catalogs-storage')
              .getPublicUrl(storageData.path);
            if (publicUrlObj?.publicUrl) {
              valToStore = `[STORAGE_URL]: ${publicUrlObj.publicUrl}`;
            }
          }
        } catch (stgErr) {
          console.warn('[-] Advertencia en almacenamiento Storage para CSV:', stgErr);
        }
      }

      // Guardar en tabla ClientsSERVEX_General_Procces
      const payload = {
        company_name: 'General_Procces',
        csv_new_raw: valToStore,
        CSV_final: valToStore
      };
      if (currentUser?.id) payload.user_id = currentUser.id;

      await supabase
        .from('ClientsSERVEX_General_Procces')
        .upsert(payload, { onConflict: 'company_name' });

      // Notificar al backend en caché
      try {
        const fd = new FormData();
        fd.append('company_name', 'General_Procces');
        fd.append('csv_new_raw', valToStore);
        fetch(`${apiURL}/api/v1/General_Procces/pipeline/cache-csv-new`, {
          method: 'POST',
          body: fd
        }).catch(() => {});
      } catch (_) {}

      // Desbloquear fase 3 y emitir step 'done'
      window.dispatchEvent(new CustomEvent('wbsImportStep', { detail: { step: 'done' } }));
      if (unlockedPhase < 3) updatePhase(3);

      // Actualizar mensaje de usuario a completed
      setMessages((prev) =>
        prev.map((m) =>
          m.id === uploadId ? { ...m, uploadStatus: 'completed' } : m
        )
      );

      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const botResponseMsg = {
        id: Date.now() + 2,
        from: 'bot',
        role: 'assistant',
        text: `✅ **Matriz de Nuevos Precios Ingerida con Éxito**\n\nEl archivo \`${file.name}\` ha sido respaldado y registrado en la base de datos como \`csv_new_raw\`.\n\nEl catálogo base y la nueva lista de precios están sincronizados y listos para ser auditados.\n\n👉 Ejecuta **/executeProcess** para comparar ambas matrices y calcular la auditoría completa con detección de anomalías.`,
        content: `Matriz de Nuevos Precios Ingerida con Éxito: ${file.name}. Listo para ejecutar /executeProcess.`,
        time: botTime,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => {
        const nextList = [...prev, botResponseMsg];
        saveGeneralProcessChat(nextList);
        return nextList;
      });
    } catch (err) {
      console.error('Error subiendo CSV:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === uploadId ? { ...m, uploadStatus: 'error' } : m
        )
      );
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: `**Error al ingerir el archivo CSV:** ${err.message}`,
          time: botTime
        }
      ]);
    } finally {
      setIsUploadingXml(false);
    }
  };

  // Enrutador universal para archivos arrastrados o adjuntos al chat
  const handleUniversalFileUpload = (file) => {
    if (!file) return;
    const nameLower = file.name.toLowerCase();
    if (nameLower.endsWith('.xml')) {
      handleXmlFileUpload(file);
    } else if (nameLower.endsWith('.csv') || nameLower.endsWith('.xlsx') || nameLower.endsWith('.xls')) {
      handleCsvFileUpload(file);
    } else {
      alert('Formato no soportado. Por favor arrastra un archivo maestro .xml o una matriz de precios en .csv / .xlsx.');
    }
  };

  // Aplicar cambios quirúrgicos al XML desde el Staging Board
  const handleCommitStaged = async (msgIdx, stagedItems) => {
    if (!stagedItems || stagedItems.length === 0) return;
    setIsCommitting(true);
    try {
      const res = await fetch(`${apiURL}/api/v1/General_Procces/agent/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: 'General_Procces',
          staged_items: stagedItems
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Falla durante la inyección en el catálogo');
      }

      const data = await res.json();

      recordClientAction({
        companyName: 'General_Procces',
        eventType: 'COMMIT_XML',
        title: 'Inyección Quirúrgica en XML',
        description: `El usuario confirmó y aplicó ${data.applied_count || stagedItems.length} cambio(s) directo(s) sobre el catálogo XML.`,
        details: { applied_count: data.applied_count || stagedItems.length }
      });

      setMessages((prev) =>
        prev.map((msg, i) =>
          i === msgIdx ? { ...msg, committed: true, appliedCount: data.applied_count || stagedItems.length } : msg
        )
      );

      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const commitConfirmMsg = {
        id: `msg-commit-${Date.now()}`,
        from: 'bot',
        role: 'assistant',
        text: `🎯 **Inyección Quirúrgica 1-to-1 Completada con Éxito**\n\n• **Nodos Modificados:** **${data.applied_count || stagedItems.length}**\n• **Catálogo Afectado:** \`${activeCatalogRef.current || 'General_Procces'}\`\n• **Integridad XML:** 100% Certificada para CET Designer y Catalog Creator.\n\nEl archivo XML maestro ya contiene los nuevos precios. Puedes descargarlo directamente a continuación:`,
        content: `Inyección Quirúrgica 1-to-1 Completada con Éxito. Nodos Modificados: ${data.applied_count || stagedItems.length}. Catálogo: ${activeCatalogRef.current || 'General Process'}`,
        showDownloadCard: true,
        time: botTime,
        timestamp: new Date().toISOString(),
        catalog: activeCatalogRef.current || 'General Process.xml'
      };
      setMessages((prev) => {
        const nextList = [...prev, commitConfirmMsg];
        saveGeneralProcessChat(nextList, activeCatalogRef.current || 'General Process.xml');
        return nextList;
      });
    } catch (err) {
      console.error('Error inyectando en XML:', err);
      alert(`Error al aplicar cambios: ${err.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  // Descarga directa del XML actualizado
  const handleDownloadXml = () => {
    recordClientAction({
      companyName: 'General_Procces',
      eventType: 'DOWNLOAD_RESULT_XML',
      title: 'Descarga de Catálogo XML',
      description: 'El usuario descargó el archivo XML actualizado certificado.'
    });
    const url = `${apiURL}/api/v1/General_Procces/agent/download-xml?company_name=General_Procces`;
    window.open(url, '_blank');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      setShowSlashMenu(false);
    }
    if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  const renderInputCard = (isCentered = false) => {
    return (
      <div
        className={`w-full ${isCentered
          ? (isDarkMode ? 'max-w-[760px] mx-auto shadow-[0_12px_40px_-6px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.14)]' : 'max-w-[760px] mx-auto shadow-[0_12px_40px_-6px_rgba(0,0,0,0.08),0_2px_10px_-2px_rgba(0,0,0,0.04)]')
          : (isDarkMode ? 'max-w-[1000px] mx-auto shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'max-w-[1000px] mx-auto shadow-md')
          } ${isDarkMode
            ? 'bg-[#09090b]/55 border-white/[0.12] text-white focus-within:border-white/35 focus-within:bg-[#09090b]/70 focus-within:ring-4 focus-within:ring-white/[0.06]'
            : 'bg-white/80 border-slate-200/80 text-gray-800 focus-within:border-[#18181b]/50 focus-within:ring-4 focus-within:ring-[#18181b]/10'
          } backdrop-blur-2xl border rounded-none relative transition-all duration-300`}
      >
        {/* Menú de Comandos Slash flotante sobre el Input */}
        <AnimatePresence>
          {showSlashMenu && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={`absolute bottom-[calc(100%+8px)] left-0 right-0 mx-auto max-w-full ${isDarkMode ? 'bg-[#09090b]/80 border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)]' : 'bg-white/95 border-slate-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)]'} backdrop-blur-2xl border rounded-none z-50 overflow-hidden`}
            >
              <div className={`max-h-[280px] overflow-y-auto ${isDarkMode ? 'scrollbar-thumb-zinc-700' : 'custom-scrollbar'} p-2`}>
                {Object.entries(
                  SLASH_COMMANDS.filter(cmd => cmd.phase <= unlockedPhase).reduce((acc, cmd) => {
                    const cat = cmd.category || 'Other Commands';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(cmd);
                    return acc;
                  }, {})
                ).map(([category, commands]) => (
                  <div key={category} className="mb-1.5 last:mb-0">
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors rounded-none text-left`}
                    >
                      <span className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} uppercase tracking-wider`}>
                        {category}
                      </span>
                      <ChevronDown size={14} className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-400'} transition-transform duration-200 ${expandedCategory === category ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {expandedCategory === category && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-1 pl-2 space-y-0.5">
                            {commands.map((cmd) => (
                              <button
                                key={cmd.id}
                                onClick={() => handleCommandSelect(cmd.label)}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-none ${isDarkMode ? 'hover:bg-white/10 hover:text-white' : 'hover:bg-[#18181b]/5 hover:text-[#18181b]'} transition-colors text-left group`}
                              >
                                <div className={`${isDarkMode ? 'text-zinc-400 group-hover:text-white' : 'text-slate-400 group-hover:text-[#18181b]'} transition-colors flex-shrink-0`}>
                                  <cmd.icon size={13} strokeWidth={2} />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className={`text-[11.5px] font-semibold ${isDarkMode ? 'text-zinc-200 group-hover:text-white' : 'text-slate-700 group-hover:text-[#18181b]'} truncate transition-colors`}>{cmd.label}</span>
                                  <span className={`text-[9.5px] ${isDarkMode ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-slate-400 group-hover:text-slate-500'} truncate transition-colors`}>{cmd.desc}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea & Icon - Ocupa directamente el espacio superior del input */}
        <div className="flex flex-col px-4 pt-3.5 pb-1 w-full">
          <div className="flex items-start gap-2.5 w-full">
            <Sparkles size={16} className={`mt-1 flex-shrink-0 transition-colors ${isRecording ? (isDarkMode ? 'text-white animate-pulse' : 'text-[#18181b] animate-pulse') : (isDarkMode ? 'text-zinc-300' : 'text-[#18181b]/60')}`} />
            <textarea
              ref={inputRef}
              rows={1}
              className={`flex-1 bg-transparent border-none outline-none resize-none text-[15px] max-[700px]:text-[14px] ${isDarkMode ? 'text-zinc-100 placeholder-zinc-500 caret-white' : 'text-gray-800 placeholder-gray-400 caret-[#18181b]'} leading-relaxed min-h-[38px] max-h-[140px] overflow-y-auto font-sans`}
              placeholder={isRecording ? "Listening to your voice... Speak now..." : "Indica cambios de precio, consulta productos o features del catálogo, o escribe '/' para comandos…"}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Efecto Studio Audio Mixer a todo lo ancho del input */}
          {isRecording && (
            <div className={`w-full mt-2.5 mb-1 p-2.5 rounded-none ${isDarkMode ? 'bg-white/5 border border-white/15' : 'bg-gradient-to-r from-[#18181b]/5 via-[#18181b]/10 to-[#18181b]/5 border border-[#18181b]/20'} shadow-sm animate-fadeIn`}>
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-none ${isDarkMode ? 'bg-white' : 'bg-[#18181b]'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-none h-2 w-2 ${isDarkMode ? 'bg-white' : 'bg-[#18181b]'}`}></span>
                  </span>
                  <span className={`text-[11.5px] font-bold ${isDarkMode ? 'text-white' : 'text-[#18181b]'} tracking-tight`}>
                    Studio Audio Mixer
                  </span>
                  <span className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} hidden sm:inline font-medium`}>
                    · Capturing and transcribing speech frequencies live
                  </span>
                </div>

                <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-none ${isDarkMode ? 'bg-white/15 text-white border-white/20' : 'bg-[#18181b]/15 text-[#18181b] border border-[#18181b]/20'} border`}>
                  Live Input
                </span>
              </div>

              {/* Espectro completo de barras de audio */}
              <div className="w-full h-8 flex items-end justify-between gap-[2px] md:gap-[3px] px-1 overflow-hidden">
                {Array.from({ length: 48 }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`flex-1 max-w-[5px] min-w-[2px] rounded-none ${isDarkMode ? 'bg-white' : 'bg-[#18181b]'}`}
                    style={{
                      animation: `mixer-bar-bounce 0.85s ease-in-out infinite ${(idx * 0.038).toFixed(2)}s`,
                      opacity: 0.55 + (idx % 4) * 0.14
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions toolbar */}
        <div className="flex items-center justify-between px-3.5 py-2">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={xmlFileInputRef}
              accept=".xml,.csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUniversalFileUpload(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={isUploadingXml}
              title="Adjuntar catálogo XML maestro (.xml) o matriz de precios (.csv/.xlsx)"
              onClick={() => xmlFileInputRef.current?.click()}
              className={`w-8 h-8 rounded-none flex items-center justify-center transition-colors ${isUploadingXml
                ? isDarkMode ? 'bg-white/20 text-white animate-pulse' : 'bg-[#18181b]/10 text-[#18181b] animate-pulse'
                : isDarkMode ? 'text-zinc-400 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-[#18181b]'
                }`}
            >
              {isUploadingXml ? <RefreshCw size={16} className={`animate-spin ${isDarkMode ? 'text-white' : 'text-[#18181b]'}`} /> : <Paperclip size={17} />}
            </button>

            <button
              type="button"
              title={isRecording ? "Stop Recording (Stop STT)" : "Voice Recording (Speech-to-Text)"}
              onClick={toggleRecording}
              className={`w-8 h-8 rounded-none flex items-center justify-center transition-all ${isRecording
                ? isDarkMode
                  ? 'bg-white text-zinc-950 shadow-md ring-2 ring-white/50 animate-pulse'
                  : 'bg-[#18181b] text-white shadow-md shadow-[#18181b]/25 ring-2 ring-[#18181b]/50 animate-pulse'
                : isDarkMode ? 'text-zinc-400 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-[#18181b]'
                }`}
            >
              {isRecording ? <MicOff size={17} /> : <Mic size={17} />}
            </button>

            <button
              type="button"
              title="AI Guide & FAQ"
              onClick={() => setShowAiGuideModal(true)}
              className={`w-8 h-8 rounded-none flex items-center justify-center ${isDarkMode ? 'text-zinc-400 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-[#18181b]'} transition-colors`}
            >
              <HelpCircle size={17} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isRecording ? (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none ${isDarkMode ? 'bg-white/15 border border-white/25 text-white' : 'bg-[#18181b]/10 border border-[#18181b]/25 text-[#18181b]'} text-[11px] font-bold tracking-wide`}>
                <span className={`w-2 h-2 rounded-none ${isDarkMode ? 'bg-white' : 'bg-[#18181b]'} animate-pulse`} />
                <span>Audio Mixer Active</span>
              </div>
            ) : input.length > 0 ? (
              <span className={`text-[10px] font-medium ${isDarkMode ? 'text-zinc-300 bg-white/5 border-white/10' : 'text-gray-500 bg-white/80 border-gray-200/60'} border px-2 py-0.5 rounded-none`}>
                {input.length} chars
              </span>
            ) : null}

            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-none text-[12px] font-semibold transition-all duration-200
                ${input.trim() && !isLoading
                  ? isDarkMode
                    ? 'bg-white text-zinc-950 shadow-md hover:bg-zinc-200 hover:-translate-y-px font-bold cursor-pointer'
                    : 'bg-[#18181b] text-white shadow-md shadow-[#18181b]/25 hover:bg-[#27272a] hover:-translate-y-px cursor-pointer'
                  : isDarkMode
                    ? 'bg-white/10 text-zinc-500 border border-white/10 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                }`}
            >
              {isLoading ? (
                <div className={`w-3.5 h-3.5 border-2 ${isDarkMode ? 'border-zinc-950/30 border-t-zinc-950' : 'border-white/30 border-t-white'} rounded-full animate-spin`} />
              ) : (
                <>
                  <span>Send</span>
                  <SendHorizonal size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActiveXml(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragActiveXml(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setDragActiveXml(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleUniversalFileUpload(file);
      }}
      className="w-full h-full flex flex-col font-sans text-gray-900 overflow-hidden relative bg-transparent"
    >
      {/* Overlay al arrastrar archivo XML o Matriz CSV */}
      {dragActiveXml && (
        <div className="absolute inset-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-2 border-dashed border-white/40 rounded-none flex flex-col items-center justify-center pointer-events-none p-6 animate-fadeIn">
          <UploadCloud size={56} className="text-white animate-bounce mb-3" />
          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">Suelta tu archivo XML maestro o Matriz CSV aquí</h3>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 max-w-md text-center">
            Admite catálogos <strong className="text-white">.xml</strong> de CET Designer o matrices <strong className="text-white">.csv / .xlsx</strong> de nuevos precios (<span className="font-mono text-zinc-200">csv_new_raw</span>)
          </p>
        </div>
      )}

      {/* ── MAIN SCROLLABLE CONTAINER ── */}
      <main
        ref={scrollContainerRef}
        style={{
          WebkitOverflowScrolling: 'touch',
          transform: 'translateZ(0)',
          willChange: 'scroll-position'
        }}
        className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          /* ── HOME (HERO PRESENTATION & CENTERED CARD) ── */
          <div className="w-full max-w-[840px] mx-auto min-h-full flex flex-col justify-center items-center py-8 px-4">
            {/* Hero Presentation Header: Solo Logo SVG */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-8 w-full flex flex-col items-center select-none"
            >
              <div className="flex items-center justify-center transition-transform duration-300 hover:scale-[1.02]">
                <AlysaWordmark className="h-16 sm:h-20 md:h-24 w-auto text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.35)]" />
              </div>
            </motion.div>

            {/* Centered Professional Input Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.5 }}
              className="w-full"
            >
              {renderInputCard(true)}
            </motion.div>

            {/* Quick Prompts below input */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.5 }}
              className="w-full mt-4 flex items-center justify-center gap-2 flex-wrap"
            >
              {QUICK_PROMPTS.map(({ icon: Icon, label, q }) => (
                <button
                  key={label}
                  onClick={() => sendMessage(q)}
                  title={q}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-none ${isDarkMode ? 'bg-[#09090b]/50 border-white/10 hover:border-white/30 hover:bg-white/[0.08] text-zinc-300 hover:text-white shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.08)]' : 'bg-white/70 border-white/80 hover:border-[#18181b]/40 hover:bg-white text-gray-700 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]'} backdrop-blur-xl border hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group text-[12px] cursor-pointer`}
                >
                  <div className={`w-5 h-5 rounded-none ${isDarkMode ? 'bg-white/10 text-white group-hover:bg-white/20' : 'bg-[#18181b]/10 text-[#18181b] group-hover:bg-[#18181b]/20'} flex items-center justify-center transition-colors flex-shrink-0`}>
                    <Icon size={12} />
                  </div>
                  <span className={`font-semibold ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'} whitespace-nowrap`}>{label}</span>
                </button>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className={`text-center mt-6 text-[10.5px] ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'} tracking-wide`}
            >
              © 2026 GLYNNE S.A.S. All rights reserved. Creators and developers of Alysa and its underlying processes.
            </motion.p>
          </div>
        ) : (
          /* ── ACTIVE CHAT STREAM ── */
          <div className="w-full max-w-[1000px] mx-auto flex flex-col px-5 max-[700px]:px-3 min-h-full">
            <div className="flex flex-col gap-6 py-7">
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                  const isUser = msg.from === 'user';
                  const isStructuredUser = isUser && !msg.isXmlUpload && parseUserMessage(msg.text).type !== 'simple';
                  const msgKey = msg.id || `msg-${idx}`;
                  return (
                    <motion.div
                      key={msgKey}
                      initial={{ opacity: 0, y: 14, x: isUser ? 12 : -12 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.23, 1, 0.32, 1]
                      }}
                      style={msg.toolId ? undefined : { contentVisibility: 'auto', containIntrinsicSize: '0 80px' }}
                      className={`flex gap-3 items-start min-w-0 ${isUser ? 'justify-end w-full' : 'w-full'}`}
                    >
                      {msg.from === 'tool' ? (
                        <div className="w-full max-w-full min-w-0 my-2 bg-transparent overflow-hidden relative flex justify-center">
                          <div className="w-full max-w-full min-w-0 h-full relative">
                            {renderTool && renderTool(msg.toolId)}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Avatar: solo para la IA (el usuario no tiene icono) */}
                          {!isUser && (
                            <motion.div
                              whileHover={{ scale: 1.08 }}
                              className="flex-shrink-0 flex items-center justify-center pt-0.5"
                            >
                              <AlysaSvgIcon className="w-7 h-7 drop-shadow-sm" />
                            </motion.div>
                          )}

                          {/* Bubble column */}
                          <div className={`flex flex-col min-w-0 ${msg.uploadSummary || msg.isProcessingConsole || msg.toolId ? 'w-full' : isUser ? isStructuredUser ? 'w-full max-w-[96%] md:max-w-[85%]' : 'max-w-[85%] md:max-w-[75%]' : 'max-w-[90%] md:max-w-[88%]'} gap-1 ${isUser ? 'items-end' : 'items-start flex-1'}`}>
                            {/* Cabecera de mensaje (solo para la IA; el usuario no tiene ni 'You' ni la hora) */}
                            {!isUser && msg.time && (
                              <div className="flex items-baseline gap-2 mb-0.5">
                                <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{msg.time}</span>
                              </div>
                            )}

                            <div
                              className={`text-[13.5px] leading-relaxed relative break-words min-w-0 ${
                                isUser
                                  ? isStructuredUser
                                    ? 'w-full p-0 bg-transparent border-none shadow-none'
                                    : isDarkMode
                                      ? 'px-4 py-2.5 rounded-none shadow-md bg-zinc-100 text-zinc-950 border border-zinc-200 font-medium'
                                      : 'px-4 py-2.5 rounded-none shadow-sm bg-[#18181b] text-white border border-[#18181b]'
                                  : 'w-full space-y-2'
                              }`}
                            >
                              {msg.from === "bot" ? (
                                <>
                                  {/* Mensaje de la IA: contenedor transparente sobre el fondo, sin contenedor negro ni bordes */}
                                  {msg.text && (
                                    <div className={`w-full bg-transparent border-none shadow-none py-0.5 ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>
                                      <BotMessage
                                        text={msg.text}
                                        inspectionReport={msg.inspection_report}
                                        catalogData={msg.catalog_data}
                                        onCommandSelect={handleCommandSelect}
                                        isDarkMode={isDarkMode}
                                      />
                                    </div>
                                  )}

                                  {/* ── COMPONENTE / TABLA INLINE EN RESPUESTA DEL BOT ── */}
                                  {msg.toolId && renderTool && (
                                    <div className="w-full max-w-full min-w-0 my-1.5 bg-transparent overflow-hidden">
                                      {renderTool(msg.toolId)}
                                    </div>
                                  )}

                                  {/* ── CONSOLA DE PROCESAMIENTO EN TIEMPO REAL ── */}
                                  {msg.isProcessingConsole && (
                                    <CatalogProcessConsole
                                      fileName={msg.processFileName || 'catalogo.xml'}
                                      isCompleted={msg.processCompleted}
                                      summary={msg.processSummary}
                                      isDarkMode={isDarkMode}
                                    />
                                  )}

                                  {/* ── REPORTE CONVERSACIONAL DE INGESTIÓN XML (PROCESOS GUIADOS POR IA) ── */}
                                  {msg.uploadSummary && (
                                    <AiCatalogIngestionReport
                                      summary={msg.uploadSummary}
                                      csvRaw={dbCsvRaw || msg.uploadSummary?.csv_raw}
                                      xmlRaw={dbXmlRaw || msg.uploadSummary?.xml_raw}
                                      getCatalogExcelColumns={getCatalogExcelColumns}
                                      onCommandSelect={handleCommandSelect}
                                      time={msg.time}
                                      isDarkMode={isDarkMode}
                                    />
                                  )}

                                  {/* ── REPORTE CONVERSACIONAL DE COMPARACIÓN MATRICIAL (/executeProcess) ── */}
                                  {msg.comparisonReport && (
                                    <div className="space-y-3.5">
                                      <AiComparisonReportCard
                                        data={msg.comparisonReport}
                                        onCommandSelect={handleCommandSelect}
                                        isDarkMode={isDarkMode}
                                      />
                                      <AiAnomalyReportCard
                                        data={msg.comparisonReport}
                                        onCommandSelect={handleCommandSelect}
                                        isDarkMode={isDarkMode}
                                      />
                                      <AiAuditExplanationCard
                                        explanation={msg.comparisonReport.ai_explanation}
                                        data={msg.comparisonReport}
                                        isDarkMode={isDarkMode}
                                      />
                                    </div>
                                  )}

                                  {/* ── UPLOADER INLINE CUANDO SE REQUIERE XML ── */}
                                  {msg.needs_upload && (
                                    <div
                                      onClick={() => xmlFileInputRef.current?.click()}
                                      className={`mt-3 p-4 border-2 border-dashed rounded-none backdrop-blur-xl transition-all text-center cursor-pointer group shadow-sm ${isDarkMode
                                          ? 'border-white/15 hover:border-white/40 bg-[#09090b]/55 hover:bg-[#09090b]/75 text-zinc-200'
                                          : 'border-slate-300 hover:border-slate-800 bg-white/75 hover:bg-white/90 text-slate-800'
                                        }`}
                                    >
                                      <UploadCloud size={28} className={`mx-auto mb-1.5 group-hover:scale-110 transition-transform ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`} />
                                      <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                        Arrastra o haz clic para subir tu catálogo XML maestro
                                      </h4>
                                      <p className={`text-[10.5px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                                        Formatos soportados: .xml de CET Designer o Catalog Creator. Se montará al instante en memoria.
                                      </p>
                                    </div>
                                  )}

                                  {/* ── STAGING BOARD & XML DIFF PREVIEW ── */}
                                  {msg.staged_result && msg.staged_result.items && msg.staged_result.items.length > 0 && (
                                    <div className={`mt-4 border rounded-none overflow-hidden shadow-xs backdrop-blur-xl ${isDarkMode ? 'border-white/10 bg-[#09090b]/80 text-zinc-100' : 'border-[#18181b]/25 bg-white/95 text-slate-700'}`}>
                                      <div className={`p-3.5 border-b flex flex-wrap items-center justify-between gap-2 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gradient-to-r from-[#18181b]/12 via-[#18181b]/6 to-transparent border-[#18181b]/15'}`}>
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <Table size={14} className={isDarkMode ? 'text-white' : 'text-[#18181b]'} />
                                            <h4 className={`text-xs font-bold uppercase tracking-wider font-sans ${isDarkMode ? 'text-white' : 'text-[#18181b]'}`}>
                                              Surgical Staging & XML Diff Board
                                            </h4>
                                            <span className={`px-2 py-0.5 rounded-none text-[9.5px] font-mono font-bold shadow-xs ${isDarkMode ? 'bg-white text-zinc-950' : 'bg-[#18181b] text-white'}`}>
                                              {msg.staged_result.items.length} {msg.staged_result.items.length === 1 ? 'Cambio' : 'Cambios'}
                                            </span>
                                          </div>
                                          <p className={`text-[11px] mt-0.5 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-[#18181b]/75'}`}>
                                            Registro estructurado en memoria de los cambios recopilados durante la conversación.
                                          </p>
                                        </div>

                                        {/* Estado de recopilación en memoria (Sin inyección al XML) */}
                                        <div className={`px-3 py-1.5 rounded-none text-xs font-semibold flex items-center gap-1.5 border shadow-xs ${
                                          isDarkMode ? 'bg-white/10 border-white/15 text-zinc-200' : 'bg-[#18181b]/10 border-[#18181b]/15 text-[#18181b]'
                                        }`}>
                                          <Layers size={13} className={isDarkMode ? 'text-zinc-300' : 'text-[#18181b]'} />
                                          <span>Cambios Recopilados</span>
                                        </div>
                                      </div>

                                      <div className={`overflow-x-auto max-h-[380px] ${isDarkMode ? 'scrollbar-thumb-zinc-700' : 'scrollbar-thin'}`}>
                                        <table className={`w-full text-left text-xs ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
                                          <thead className={`${isDarkMode ? 'bg-white/5 border-white/10 text-zinc-200' : 'bg-[#18181b]/5 border-[#18181b]/15 text-[#18181b]'} sticky top-0 z-10 border-b font-bold text-[10px] uppercase tracking-wider`}>
                                            <tr>
                                              <th className="px-3.5 py-2.5">SKU / Nodo</th>
                                              <th className="px-3.5 py-2.5">Tipo de Nodo</th>
                                              <th className="px-3.5 py-2.5">Detalle / Opción</th>
                                              <th className="px-3.5 py-2.5 text-right">Actual</th>
                                              <th className="px-3.5 py-2.5 text-right">Nuevo</th>
                                              <th className="px-3.5 py-2.5 text-right">Variación</th>
                                              <th className="px-3.5 py-2.5 text-center">Estado</th>
                                            </tr>
                                          </thead>
                                          <tbody className={`divide-y ${isDarkMode ? 'divide-white/10' : 'divide-[#18181b]/10'}`}>
                                            {msg.staged_result.items.map((item, itemIdx) => {
                                              const isOption = String(item.target_type || item.type || '').toLowerCase().includes('option');
                                              const isMatched = item.status === 'MATCHED' || (!item.status && item.old_price != null);
                                              const pct = item.percent_delta != null ? item.percent_delta : (item.diff_pct != null ? item.diff_pct : (item.pct != null ? item.pct : null));
                                              const isPositive = pct != null && pct >= 0;
                                              return (
                                                <tr
                                                  key={itemIdx}
                                                  className={`transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-[#18181b]/5'}`}
                                                >
                                                  <td className={`px-3.5 py-2.5 font-mono font-bold ${isDarkMode ? 'text-white' : 'text-[#18181b]'} text-xs`}>
                                                    {item.sku}
                                                  </td>
                                                  <td className="px-3.5 py-2.5">
                                                    <span
                                                      className={`inline-block px-1.5 py-0.5 rounded-none text-[9.5px] font-mono font-bold ${isOption
                                                        ? isDarkMode ? 'bg-white/15 text-white border border-white/25' : 'bg-[#18181b]/15 text-[#18181b] border border-[#18181b]/25'
                                                        : isDarkMode ? 'bg-white/10 text-zinc-300 border border-white/20' : 'bg-[#18181b]/10 text-[#18181b] border border-[#18181b]/20'
                                                        }`}
                                                    >
                                                      {isOption ? '<OptionPrice>' : '<Price>'}
                                                    </span>
                                                  </td>
                                                  <td
                                                    className={`px-3.5 py-2.5 text-[11px] ${isDarkMode ? 'text-zinc-300' : 'text-[#18181b]/80'} max-w-[140px] truncate font-medium`}
                                                    title={item.matched_option_name || item.option_name || item.option_code || item.option}
                                                  >
                                                    {item.matched_option_name || item.option_name || item.option_code || item.option || 'Precio Base'}
                                                  </td>
                                                  <td className={`px-3.5 py-2.5 text-right font-mono ${isDarkMode ? 'text-zinc-400' : 'text-[#18181b]/60'} text-xs`}>
                                                    {item.old_price != null ? `$${item.old_price}` : <span className={isDarkMode ? 'text-zinc-600' : 'text-[#18181b]/40'}>—</span>}
                                                  </td>
                                                  <td className={`px-3.5 py-2.5 text-right font-mono font-bold ${isDarkMode ? 'text-white' : 'text-[#18181b]'} text-xs`}>
                                                    ${item.new_price != null ? item.new_price : item.new_value}
                                                  </td>
                                                  <td className={`px-3.5 py-2.5 text-right font-mono font-bold text-xs ${isDarkMode ? 'text-white' : 'text-[#18181b]'}`}>
                                                    {pct != null ? (
                                                      <span className={`${isDarkMode ? 'bg-white/15 text-white' : 'bg-[#18181b]/10 text-[#18181b]'} px-1.5 py-0.5 rounded-none`}>
                                                        {isPositive ? `+${pct}%` : `${pct}%`}
                                                      </span>
                                                    ) : (
                                                      <span className={`${isDarkMode ? 'text-zinc-600' : 'text-[#18181b]/40'} font-normal`}>—</span>
                                                    )}
                                                  </td>
                                                  <td className="px-3.5 py-2.5 text-center">
                                                    {isMatched ? (
                                                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${isDarkMode ? 'text-white bg-white/10 border-white/20' : 'text-[#18181b] bg-[#18181b]/12 border-[#18181b]/25'} px-2 py-0.5 rounded-none border`}>
                                                        <CheckCircle2 size={10} className={isDarkMode ? 'text-white' : 'text-[#18181b]'} />
                                                        Verificado
                                                      </span>
                                                    ) : (
                                                      <span
                                                        className={`inline-flex items-center gap-1 text-[10px] font-medium ${isDarkMode ? 'text-zinc-400 bg-white/10 border-white/20' : 'text-[#18181b] bg-[#18181b]/10 border-[#18181b]/20'} px-2 py-0.5 rounded-none border`}
                                                        title={item.reason}
                                                      >
                                                        <AlertCircle size={10} className={isDarkMode ? 'text-zinc-400' : 'text-[#18181b]'} />
                                                        No en XML
                                                      </span>
                                                    )}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>

                                      <div className={`p-2.5 border-t flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-[#18181b]/5 border-[#18181b]/15'}`}>
                                        <span className={`text-[10.5px] ${isDarkMode ? 'text-zinc-300' : 'text-[#18181b]/80'} font-medium`}>
                                          Catálogo: <strong className={isDarkMode ? 'text-white' : 'text-[#18181b]'}>{activeCatalogName || context || 'General Process'}</strong>
                                        </span>
                                        {msg.committed && (
                                          <button
                                            onClick={handleDownloadXml}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-none ${isDarkMode ? 'bg-white text-zinc-950 font-bold hover:bg-zinc-200' : 'bg-[#18181b] hover:bg-[#09090b] text-white'} text-[11px] font-bold shadow-xs transition-all cursor-pointer`}
                                          >
                                            <Download size={12} />
                                            Descargar XML Actualizado
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* ── CARD DIRECTA DE DESCARGA FINAL EN EL CHAT ── */}
                                  {msg.showDownloadCard && (
                                    <div className={`mt-3 p-3.5 border rounded-none flex items-center justify-between ${isDarkMode ? 'bg-[#09090b]/65 border-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)]' : 'bg-[#18181b]/6 border-[#18181b]/20'}`}>
                                      <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-none ${isDarkMode ? 'bg-white text-zinc-950' : 'bg-[#18181b] text-white'} flex items-center justify-center shadow-xs`}>
                                          <CheckCheck size={16} />
                                        </div>
                                        <div>
                                          <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#18181b]'}`}>
                                            Catálogo XML Certificado y Actualizado
                                          </h4>
                                          <p className={`text-[10.5px] ${isDarkMode ? 'text-zinc-400' : 'text-[#18181b]/75'} font-medium`}>
                                            Listo para importar directamente en CET Designer sin errores de formato.
                                          </p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={handleDownloadXml}
                                        className={`px-3.5 py-1.5 ${isDarkMode ? 'bg-white text-zinc-950 font-bold hover:bg-zinc-200' : 'bg-[#18181b] hover:bg-[#09090b] text-white'} text-xs font-bold rounded-none shadow-xs flex items-center gap-1.5 transition-all cursor-pointer`}
                                      >
                                        <Download size={13} />
                                        Descargar .XML
                                      </button>
                                    </div>
                                  )}
                                </>
                              ) : msg.isXmlUpload || (msg.text && msg.text.includes("Archivo XML adjunto para ingestión:")) ? (
                                (() => {
                                  const fnMatch = msg.fileName || (msg.text.match(/`([^`]+)`/) ? msg.text.match(/`([^`]+)`/)[1] : "catálogo.xml");
                                  const sizeMatch = msg.fileSizeKb || (msg.text.match(/\(([0-9.]+)\s*KB\)/i) ? msg.text.match(/\(([0-9.]+)\s*KB\)/i)[1] : null);
                                  const isUploading = msg.uploadStatus === "uploading";
                                  const isError = msg.uploadStatus === "error";

                                  return (
                                    <div className={`space-y-2 ${isDarkMode ? 'text-zinc-950' : 'text-white'} min-w-[240px] sm:min-w-[280px]`}>
                                      <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-none ${isDarkMode ? 'bg-zinc-900/10' : 'bg-white/15'} flex items-center justify-center shrink-0`}>
                                          <FileCode2 size={16} className={isDarkMode ? 'text-zinc-950' : 'text-white'} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <span className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-700' : 'text-white/80'} block leading-tight`}>
                                            Archivo XML adjunto para ingestión:
                                          </span>
                                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                            <span className={`font-mono font-bold text-xs ${isDarkMode ? 'bg-zinc-900/10 text-zinc-950' : 'bg-white/20 text-white'} px-2 py-0.5 rounded-none tracking-wide`}>
                                              {fnMatch}
                                            </span>
                                            {sizeMatch && (
                                              <span className={`text-[10.5px] font-mono ${isDarkMode ? 'text-zinc-600' : 'text-white/75'}`}>
                                                ({sizeMatch} KB)
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Barra de progreso interactiva */}
                                      <div className="pt-1">
                                        <div className={`w-full ${isDarkMode ? 'bg-zinc-900/10' : 'bg-white/20'} rounded-none h-1.5 overflow-hidden`}>
                                          <motion.div
                                            initial={{ width: "25%" }}
                                            animate={{
                                              width: isUploading ? "80%" : isError ? "100%" : "100%"
                                            }}
                                            transition={{
                                              duration: isUploading ? 1.5 : 0.4,
                                              ease: "easeOut"
                                            }}
                                            className={`h-full rounded-none ${isError
                                              ? "bg-rose-500"
                                              : isUploading
                                                ? isDarkMode ? "bg-zinc-900/80 animate-pulse" : "bg-white/80 animate-pulse"
                                                : isDarkMode ? "bg-zinc-950" : "bg-white"
                                              }`}
                                          />
                                        </div>
                                        <div className={`flex items-center justify-between text-[10px] font-mono ${isDarkMode ? 'text-zinc-800' : 'text-white/85'} mt-1.5`}>
                                          {isUploading ? (
                                            <>
                                              <span className="flex items-center gap-1.5 font-medium">
                                                <RefreshCw size={10} className={`animate-spin ${isDarkMode ? 'text-zinc-950' : 'text-white'}`} />
                                                Subiendo e ingiriendo en memoria...
                                              </span>
                                              <span>80%</span>
                                            </>
                                          ) : isError ? (
                                            <>
                                              <span className="text-rose-600 font-medium">Error en la carga</span>
                                              <span>Fallo</span>
                                            </>
                                          ) : (
                                            <>
                                              <span className={`flex items-center gap-1 font-semibold ${isDarkMode ? 'text-zinc-950' : 'text-white'}`}>
                                                <Check size={12} className={isDarkMode ? 'text-zinc-950' : 'text-white'} />
                                                Archivo cargado e ingerido
                                              </span>
                                              <span className={`font-bold ${isDarkMode ? 'text-zinc-950' : 'text-white'}`}>100%</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : (
                                <UserStructuredMessage
                                  text={msg.text}
                                  isDarkMode={isDarkMode}
                                  isInsideBubble={!isStructuredUser}
                                />
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 15, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="flex gap-3 items-start"
                >
                  <div className="flex-shrink-0 flex items-center justify-center pt-0.5">
                    <AlysaSvgIcon className="w-7 h-7 drop-shadow-sm" />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-gray-400'} font-medium`}>Processing...</span>
                    </div>
                    <div className="flex items-center gap-1.5 py-2.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0.3, y: 0 }}
                          animate={{ opacity: 1, y: [-2, 2, -2] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.15
                          }}
                          className={`w-1.5 h-1.5 rounded-none ${isDarkMode ? 'bg-white' : 'bg-[#18181b]'}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        )}
      </main>

      {/* ── INPUT (DOCKED WHEN CHATTING) ── */}
      {messages.length > 0 && (
        <footer className="relative z-20 flex-shrink-0 px-5 max-[700px]:px-2.5 pt-1.5 pb-3.5 bg-transparent border-t-0 animate-fadeIn w-full">
          {renderInputCard(false)}
          <p className="text-center mt-2 text-[10px] text-gray-400 tracking-wide">
            © 2026 GLYNNE S.A.S. All rights reserved. Creators and developers of Alysa and its underlying processes.
          </p>
        </footer>
      )}

      {/* ── MODAL DE GUÍA IA (20 PREGUNTAS ORIENTATIVAS) ── */}
      <AnimatePresence>
        {showAiGuideModal && (
          <div
            onClick={() => setShowAiGuideModal(false)}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-3 md:p-6 backdrop-blur-md bg-transparent"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-3xl max-h-[85vh] rounded-none flex flex-col overflow-hidden shadow-2xl transition-colors ${isDarkMode
                  ? "bg-[#09090b]/85 border border-white/15 text-zinc-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-2xl"
                  : "bg-white border border-slate-200/90 text-slate-800"
                }`}
            >
              {/* Header del Modal */}
              <div className={`px-5 py-4 border-b flex items-center justify-between flex-shrink-0 transition-colors ${isDarkMode
                  ? "bg-gradient-to-r from-white/[0.04] via-transparent to-white/[0.04] border-white/10"
                  : "bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-100"
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-none flex items-center justify-center shadow-sm transition-colors ${isDarkMode
                      ? "bg-white/10 border border-white/20 text-white"
                      : "bg-[#18181b]/10 border border-[#18181b]/20 text-[#18181b]"
                    }`}>
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-[15px] font-bold tracking-tight transition-colors ${isDarkMode ? "text-white" : "text-gray-900"
                        }`}>
                        AI Guidance & Documentation
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none transition-colors ${isDarkMode ? "bg-white text-zinc-950 shadow-sm" : "bg-[#18181b] text-white"
                        }`}>
                        20 Questions
                      </span>
                    </div>
                    <p className={`text-[11.5px] mt-0.5 transition-colors ${isDarkMode ? "text-zinc-400" : "text-gray-500"
                      }`}>
                      Select a key question to query Alysa Copilot and receive instant architectural guidance.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAiGuideModal(false)}
                  className={`w-8 h-8 rounded-none flex items-center justify-center transition-colors ${isDarkMode
                      ? "text-zinc-400 hover:text-white hover:bg-white/10"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Filtro y Búsqueda */}
              <div className={`px-5 py-3 border-b flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between flex-shrink-0 transition-colors ${isDarkMode
                  ? "border-white/10 bg-white/[0.02]"
                  : "border-slate-100 bg-slate-50/50"
                }`}>
                <div className="relative flex-1">
                  <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-zinc-400" : "text-gray-400"}`} />
                  <input
                    type="text"
                    value={guideSearch}
                    onChange={(e) => setGuideSearch(e.target.value)}
                    placeholder="Filter questions by keyword (XML, audit, margins, CET, etc.)..."
                    className={`w-full rounded-none pl-9 pr-3 py-1.5 text-[12.5px] transition-all focus:outline-none ${isDarkMode
                        ? "bg-white/[0.05] border border-white/15 text-white placeholder-zinc-500 focus:border-white/40 focus:ring-2 focus:ring-white/10"
                        : "bg-white border border-slate-200 text-gray-800 placeholder-gray-400 focus:border-[#18181b] focus:ring-2 focus:ring-[#18181b]/10"
                      }`}
                  />
                  {guideSearch && (
                    <button
                      onClick={() => setGuideSearch("")}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] ${isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: "all", label: "All" },
                    { id: "Ingestion & Upload", label: "Ingestion" },
                    { id: "XML Conversion", label: "Conversion" },
                    { id: "AI Comparison", label: "Comparison" },
                    { id: "Autonomous Pipeline", label: "Automation" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setGuideCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-none text-[11px] font-semibold transition-all whitespace-nowrap ${guideCategory === cat.id
                          ? isDarkMode
                            ? "bg-white text-zinc-950 shadow-sm"
                            : "bg-[#18181b] text-white shadow-sm"
                          : isDarkMode
                            ? "bg-white/[0.04] border border-white/10 text-zinc-300 hover:border-white/30 hover:text-white"
                            : "bg-white border border-slate-200 text-gray-600 hover:border-[#18181b]/30 hover:text-[#18181b]"
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Preguntas */}
              <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
                {filteredGuideQuestions.length === 0 ? (
                  <div className={`text-center py-10 ${isDarkMode ? "text-zinc-400" : "text-gray-400"}`}>
                    <p className="text-[13px]">No questions found matching &ldquo;{guideSearch}&rdquo;.</p>
                    <button
                      onClick={() => { setGuideSearch(""); setGuideCategory("all"); }}
                      className={`mt-2 text-[12px] font-semibold underline ${isDarkMode ? "text-white" : "text-[#18181b]"
                        }`}
                    >
                      View all questions
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {filteredGuideQuestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setShowAiGuideModal(false);
                          sendMessage(item.q);
                        }}
                        className={`group flex flex-col justify-between p-3.5 rounded-none transition-all text-left ${isDarkMode
                            ? "bg-white/[0.03] border border-white/10 hover:border-white/30 hover:bg-white/[0.06] hover:shadow-lg"
                            : "bg-white border border-slate-200/90 hover:border-[#18181b]/50 hover:bg-[#18181b]/[0.03] hover:shadow-md"
                          }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none transition-colors ${isDarkMode
                                ? "bg-white/10 text-zinc-300 group-hover:bg-white/20 group-hover:text-white"
                                : "bg-slate-100 text-slate-600 group-hover:bg-[#18181b]/10 group-hover:text-[#18181b]"
                              }`}>
                              {item.category} · {item.tag}
                            </span>
                            <ChevronRight size={14} className={`transition-all ${isDarkMode
                                ? "text-zinc-500 group-hover:text-white group-hover:translate-x-0.5"
                                : "text-gray-300 group-hover:text-[#18181b] group-hover:translate-x-0.5"
                              }`} />
                          </div>
                          <h4 className={`text-[12.5px] font-semibold leading-snug transition-colors ${isDarkMode
                              ? "text-zinc-100 group-hover:text-white"
                              : "text-gray-800 group-hover:text-[#18181b]"
                            }`}>
                            {item.q}
                          </h4>
                        </div>
                        <p className={`text-[11px] mt-2 line-clamp-2 leading-relaxed transition-colors ${isDarkMode ? "text-zinc-400" : "text-gray-500"
                          }`}>
                          {item.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer del Modal */}
              <div className={`px-5 py-3 border-t flex items-center justify-between flex-shrink-0 transition-colors ${isDarkMode
                  ? "bg-white/[0.02] border-white/10"
                  : "bg-slate-50 border-slate-100"
                }`}>
                <span className={`text-[11px] flex items-center gap-1.5 ${isDarkMode ? "text-zinc-400" : "text-gray-500"
                  }`}>
                  <Sparkles size={13} className={isDarkMode ? "text-white" : "text-[#18181b]"} />
                  <span>Click any question to send it directly to the chat.</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAiGuideModal(false)}
                  className={`px-3.5 py-1.5 rounded-none border text-[12px] font-medium transition-colors ${isDarkMode
                      ? "border-white/15 text-zinc-300 hover:bg-white/10 hover:text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Estilos globales y animaciones de keyframes */}
      <style jsx global>{`
        .orb-ring-1 { animation: orb-pulse 3s ease-in-out infinite; }
        .orb-ring-2 { animation: orb-pulse 3s ease-in-out infinite 0.6s; }
        .avatar-pulse { animation: avatar-pulse 2.5s ease-in-out infinite; }
        .dot-bounce   { animation: dot-bounce 1.2s ease-in-out infinite; }

        @keyframes mixer-bar-bounce {
          0%, 100% { height: 4px; }
          25% { height: 26px; }
          50% { height: 7px; }
          75% { height: 20px; }
        }

        @keyframes orb-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.08); }
        }
        @keyframes avatar-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0;   transform: scale(1.25); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0);   opacity: 0.4; }
          40%            { transform: translateY(-6px); opacity: 1; }
        }

        /* Prose markdown */
        .prose-light { font-size: 13.5px; line-height: 1.7; color: #1f2937; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word; }
        .prose-light p  { margin: 0 0 10px; }
        .prose-light p:last-child { margin-bottom: 0; }
        .prose-light strong { color: #27272a; font-weight: 600; }
        .prose-light a  { color: #18181b; text-decoration: underline; text-underline-offset: 2px; }
        .prose-light code:has(.alysa-cmd-btn) { background: transparent !important; border: none !important; padding: 0 !important; font-family: inherit !important; }
        .prose-light code {
          font-size: 12px; font-family: 'JetBrains Mono', monospace;
          background: rgba(24, 24, 27, 0.08); color: #18181b;
          padding: 2px 6px; border-radius: 0px;
          border: 1px solid rgba(24, 24, 27, 0.15);
        }
        .prose-light pre:has(.alysa-cmd-btn) { background: transparent !important; border: none !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
        .prose-light pre {
          background: #f4f4f5; border: 1px solid #e4e4e7;
          padding: 14px; border-radius: 0px; overflow-x: auto; margin: 10px 0;
        }
        .prose-light pre code { background: transparent; border: none; color: #374151; padding: 0; }
        .prose-light ul { list-style: none; padding: 0; margin: 8px 0; }
        .prose-light ul li { padding-left: 16px; position: relative; margin-bottom: 4px; }
        .prose-light ul li::before {
          content: ''; position: absolute; left: 0; top: 9px;
          width: 5px; height: 5px; border-radius: 0px; background: #18181b;
        }
        .prose-light ol { padding-left: 20px; margin: 8px 0; }
        .prose-light h1, .prose-light h2, .prose-light h3 {
          color: #111827; font-weight: 600; margin: 16px 0 8px; letter-spacing: -0.02em;
        }

        .prose-light table {
          width: 100%; max-width: 100%; border-collapse: collapse; margin: 16px 0;
          font-size: 12.5px; border-radius: 0px; overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;
          display: block; overflow-x: auto; white-space: nowrap;
        }
        .prose-light th, .prose-light td {
          border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left;
        }
        .prose-light th {
          background-color: #f9fafb; font-weight: 600; color: #374151; 
          text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;
        }
        .prose-light td {
          background-color: #ffffff; color: #4b5563; white-space: normal; min-width: 120px;
        }
        .prose-light tr:nth-child(even) td {
          background-color: #f9fafb;
        }

        @media (prefers-reduced-motion: reduce) {
          .orb-ring-1, .orb-ring-2, .avatar-pulse, .dot-bounce { animation: none; }
        }
      `}</style>
    </div>
  );
}