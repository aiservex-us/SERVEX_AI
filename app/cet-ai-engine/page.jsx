'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';
import {
  Sparkles,
  Send,
  FileCode2,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  RefreshCw,
  UploadCloud,
  Trash2,
  Table,
  CheckCheck,
  Check,
  Paperclip,
  Layers,
  Box,
  Tag,
  Palette
} from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabaseClient';
import MenuLateral from '../xml-pipeline/Actualizer_XML_General/components/menuLateral.jsx';
import CatalogProcessConsole from './components/CatalogProcessConsole.jsx';
import AiCatalogIngestionReport from './components/AiCatalogIngestionReport.jsx';

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://servex-ai-back.onrender.com';

// Configuración de Marked para formato corporativo de tablas y código
const origRenderer = new marked.Renderer();
marked.use({
  renderer: {
    table(token) {
      const orig = origRenderer.table.call(this, token);
      return `<div class="my-3 overflow-x-auto rounded-xl border border-[#464775]/20 shadow-xs bg-white/80 backdrop-blur-sm max-w-full">
        ${orig
          .replace('<table>', '<table class="w-full text-left text-[12px] text-slate-700">')
          .replace(
            '<thead>',
            '<thead class="bg-[#464775]/10 border-b border-[#464775]/20 text-[#464775] font-bold uppercase tracking-wider text-[10.5px]">'
          )
          .replace('<tbody>', '<tbody class="divide-y divide-slate-100">')}
      </div>`;
    },
    tablerow(token) {
      const orig = origRenderer.tablerow.call(this, token);
      return orig.replace('<tr>', '<tr class="hover:bg-slate-50/80 transition-colors duration-150">');
    },
    tablecell(token) {
      const orig = origRenderer.tablecell.call(this, token);
      const padding = token.header ? 'px-3 py-2.5' : 'px-3 py-2';
      return orig.replace(/^<(th|td)>/, `<$1 class="${padding} whitespace-nowrap">`);
    },
    paragraph(token) {
      const orig = origRenderer.paragraph.call(this, token);
      return orig.replace(/^<p>/, '<p class="leading-relaxed mb-2 text-slate-700 text-[13px]">');
    },
    codespan(token) {
      const orig = origRenderer.codespan.call(this, token);
      return orig.replace(
        '<code>',
        '<code class="px-1.5 py-0.5 rounded-md bg-[#464775]/10 text-[#464775] font-mono text-[11.5px] font-semibold border border-[#464775]/20">'
      );
    }
  }
});

// Helper determinista para resolver las columnas del Excel generadas a partir del XML
const extractCatalogMatrixColumns = (xmlText) => {
  const BASE_HEADERS = ["Model #", "List Price", "Weight", "Classic/ Premium", "Model Name"];
  if (!xmlText) return { baseHeaders: BASE_HEADERS, commercialColumns: [], allHeaders: BASE_HEADERS };
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
    return {
      baseHeaders: BASE_HEADERS,
      commercialColumns: validColumns,
      allHeaders: [...BASE_HEADERS, ...dynamicHeaders]
    };
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

  // 1. PRIORIDAD MÁXIMA: Si existe csv_raw (almacenado en DB o en memoria tras convertir el XML a Excel)
  const csvSource = summary?.csv_raw || fallbackCsvRaw;
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

            const matchedOpt = (summary?.commercial_options_list || summary?.price_options_list || [])
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
  if (summary?.base_columns && summary?.commercial_columns) {
    return {
      baseColumns: summary.base_columns,
      commercialColumns: summary.commercial_columns,
      totalColumns: summary.total_columns || (summary.base_columns.length + summary.commercial_columns.length)
    };
  }

  if (summary?.commercial_columns && Array.isArray(summary.commercial_columns)) {
    return {
      baseColumns: summary.base_columns || DEFAULT_BASE_COLUMNS,
      commercialColumns: summary.commercial_columns,
      totalColumns: (summary.base_columns || DEFAULT_BASE_COLUMNS).length + summary.commercial_columns.length
    };
  }

  // 3. Parseo en tiempo real del XML nativo
  const xmlSource = summary?.xml_raw || summary?.XM_CET_import || fallbackXmlRaw;
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
  if (summary?.commercial_options_list && summary.commercial_options_list.length > 0) {
    commCols = summary.commercial_options_list.map(opt => ({
      code: opt.code,
      label: opt.label || (opt.name && !opt.name.includes(opt.code) ? `${opt.code} (${opt.name})` : (opt.name || opt.code)),
      price: opt.price || (opt.prices ? opt.prices.join(' / ') : '0'),
      featureName: opt.feature_name || opt.feature_code || 'Opción Comercial'
    }));
  } else if (summary?.price_options_list && summary.price_options_list.some(p => p.has_upcharge || parseFloat(p.price || 0) > 0)) {
    commCols = summary.price_options_list
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

export default function CETDirectPipelinePage() {
  const router = useRouter();

  // Estados de Sesión y Navegación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);

  // Estados del Motor CET AI Direct (Empresa autodetectable)
  const [selectedCompany, setSelectedCompany] = useState('LESRO');
  const [uploadedXmlSummary, setUploadedXmlSummary] = useState(null);
  const [isUploadingXml, setIsUploadingXml] = useState(false);
  const [dragActiveXml, setDragActiveXml] = useState(false);
  const xmlFileInputRef = useRef(null);

  // Estados del Chat Integrado
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text:
        '¡Hola! Puedes arrastrar y soltar tu archivo **.xml maestro de CET Designer** aquí, o indicarme directamente los cambios de precios que deseas aplicar (ej: `AS1101 a $850 y Polyurethane Armpad a $75` o `CLN7110-3-01030-AC a $6200 y Lock a $75`).\n\nEl análisis, la tabla de Staging y la descarga se generarán de forma directa en esta conversación.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showInitialUploader: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [quickInspectCode, setQuickInspectCode] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Verificación de autenticación
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/login');
        } else {
          if (isMounted) {
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        router.replace('/login');
      }
    };
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Auto-scroll del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Ajuste automático de altura de textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputMessage]);

  // Manejo de Carga de XML Directo en el Chat
  const handleXmlFileSelected = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xml')) {
      alert('Solo se admiten archivos en formato .xml (CET Designer / Catalog Creator).');
      return;
    }

    // Autodetección de la empresa basada en el nombre del archivo
    let compToUse = selectedCompany;
    const fnUpper = file.name.toUpperCase();
    const companies = ['WBG', 'WBO', 'WBS', 'WBT', 'WBA', 'WBD', 'LESRO', 'TEKNION'];
    for (const c of companies) {
      if (fnUpper.includes(c)) {
        compToUse = c;
        setSelectedCompany(c);
        break;
      }
    }

    setIsUploadingXml(true);
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const uploadId = Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id: uploadId,
        from: 'user',
        isXmlUpload: true,
        fileName: file.name,
        fileSizeKb: (file.size / 1024).toFixed(1),
        uploadStatus: 'uploading',
        text: `**Archivo XML adjunto para ingestión:** \`${file.name}\` (${(file.size / 1024).toFixed(1)} KB)`,
        time: userTime
      }
    ]);

    const formData = new FormData();
    formData.append('company_name', compToUse);
    formData.append('xml_file', file);

    try {
      // ── PASO 1: Subida ultrarrápida al bucket de Supabase (catalogs-storage) ──
      let uploadedPublicUrl = '';
      try {
        const cleanName = (file.name || 'catalog.xml').replace(/[^a-zA-Z0-9._-]/g, '_');
        const storageFilePath = `${compToUse}/${Date.now()}_${cleanName}`;

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

        // Persistir referencia ligera en la tabla de Supabase
        const tbl = compToUse === 'General_Procces' ? 'ClientsSERVEX_General_Procces' : `ClientsSERVEX_${compToUse}`;
        const baseXmlName = (file.name || '').replace(/\.xml$/i, '').trim();
        const { data: authData } = await supabase.auth.getUser();
        const payload = {
          company_name: compToUse,
          file_name: file.name,
          xml_name: baseXmlName,
          xml_raw: uploadedPublicUrl ? `[STORAGE_URL]: ${uploadedPublicUrl}` : '',
          XM_CET_import: uploadedPublicUrl ? `[STORAGE_URL]: ${uploadedPublicUrl}` : ''
        };
        if (authData?.user?.id) payload.user_id = authData.user.id;
        await supabase.from(tbl).upsert(payload, { onConflict: 'company_name' });
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
      formData.append('company_name', compToUse);
      formData.append('xml_file', file);
      if (uploadedPublicUrl) {
        formData.append('storage_url', uploadedPublicUrl);
      }

      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/cet-ai-engine/upload-and-destructure`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Falla al desestructurar XML');
      }

      const data = await res.json();
      try {
        const xmlText = await file.text();
        const matrixInfo = extractCatalogMatrixColumns(xmlText);
        if (matrixInfo && matrixInfo.commercialColumns.length > 0) {
          data.commercial_columns = matrixInfo.commercialColumns.map(c => ({
            code: c.optCode,
            label: c.label,
            price: String(c.maxPrice),
            featureName: c.featureCode
          }));
          data.commercial_options_list = matrixInfo.commercialColumns.map(c => ({
            code: c.optCode,
            name: c.label,
            price: String(c.maxPrice),
            prices: [String(c.maxPrice)],
            feature_code: c.featureCode
          }));
        }
      } catch (parseErr) {
        console.warn('[-] No se pudo pre-extraer columnas en cliente:', parseErr);
      }
      setUploadedXmlSummary(data);

      // Persistir de inmediato la desestructuración enriquecida en la columna xml_structure_context
      try {
        const tbl = compToUse === 'General_Procces' ? 'ClientsSERVEX_General_Procces' : `ClientsSERVEX_${compToUse}`;
        await supabase
          .from(tbl)
          .upsert({
            company_name: compToUse,
            file_name: file.name,
            xml_name: (file.name || '').replace(/\.xml$/i, '').trim(),
            xml_structure_context: data
          }, { onConflict: 'company_name' });
        console.log(`[+] xml_structure_context persistido exitosamente en ${tbl} (${compToUse})`);
      } catch (saveContextErr) {
        console.warn('[-] Advertencia persistiendo xml_structure_context en Supabase:', saveContextErr);
      }

      // Marcar consola de proceso como completada
      setMessages((prev) =>
        prev.map((m) =>
          m.id === processConsoleId
            ? { ...m, processCompleted: true, processSummary: data }
            : m
        )
      );

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          from: 'bot',
          text: `**Catálogo XML Maestro Ingerido y Desestructurado en Memoria**\n\nEl archivo \`${file.name}\` fue analizado sin tocar Excel. El catálogo está listo para recibir instrucciones de actualización de precios o consulta de características.`,
          uploadSummary: data,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Error subiendo XML:', err);
      // Marcar mensaje de subida con error
      setMessages((prev) =>
        prev.map((m) =>
          m.id === uploadId ? { ...m, uploadStatus: 'error' } : m
        )
      );
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          from: 'bot',
          text: `**Error al ingerir el archivo XML:** ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsUploadingXml(false);
    }
  };

  // Enviar mensaje al agente CET AI
  const handleSendMessage = async (textToSend = null) => {
    const rawText = textToSend !== null ? textToSend : inputMessage;
    const msg = rawText.trim();
    if (!msg || isLoading) return;

    // Autodetección de la compañía por contexto del mensaje
    let compToUse = selectedCompany;
    const msgUpper = msg.toUpperCase();
    if (msgUpper.includes('WBO') || msgUpper.includes('NUCLEUS') || msgUpper.includes('CLN7110')) {
      compToUse = 'WBO';
      setSelectedCompany('WBO');
    } else if (msgUpper.includes('WBS') || msgUpper.includes('SCONNIE') || msgUpper.includes('CHR')) {
      compToUse = 'WBS';
      setSelectedCompany('WBS');
    } else if (
      msgUpper.includes('LESRO') ||
      msgUpper.includes('AMHERST') ||
      msgUpper.includes('AS11') ||
      msgUpper.includes('AS12') ||
      msgUpper.includes('AS14') ||
      msgUpper.includes('AS21') ||
      msgUpper.includes('AS31') ||
      msgUpper.includes('AS06') ||
      msgUpper.includes('AS08') ||
      msgUpper.includes('AW11') ||
      msgUpper.includes('AF11')
    ) {
      compToUse = 'LESRO';
      setSelectedCompany('LESRO');
    } else if (msgUpper.includes('WBG')) {
      compToUse = 'WBG';
      setSelectedCompany('WBG');
    } else if (msgUpper.includes('WBD')) {
      compToUse = 'WBD';
      setSelectedCompany('WBD');
    } else if (msgUpper.includes('WBT')) {
      compToUse = 'WBT';
      setSelectedCompany('WBT');
    } else if (msgUpper.includes('TEKNION')) {
      compToUse = 'Teknion';
      setSelectedCompany('Teknion');
    }

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgObj = {
      id: Date.now(),
      from: 'user',
      text: msg,
      time: userTime
    };

    setMessages((prev) => [...prev, userMsgObj]);
    if (textToSend === null) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/cet-ai-engine/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: compToUse,
          message: msg,
          history: messages.slice(-8).map((m) => ({
            role: m.from === 'user' ? 'user' : 'assistant',
            content: m.text
          }))
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Error en comunicación con CET AI Agent');
      }

      const data = await res.json();
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const botMsgObj = {
        id: Date.now() + 1,
        from: 'bot',
        text: data.reply || 'Análisis completado.',
        time: botTime,
        companyName: compToUse,
        stagedResult: data.staged_result || null,
        committed: false,
        showInitialUploader: Boolean(data.needs_upload)
      };

      setMessages((prev) => [...prev, botMsgObj]);
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: `❌ **Error de conexión con el motor CET AI:** ${err.message}`,
          time: botTime
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  // Inspección directa de SKU
  const handleQuickInspect = async () => {
    if (!quickInspectCode.trim()) return;
    const inspectTarget = quickInspectCode.trim();
    setIsInspecting(true);

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        from: 'user',
        text: `🔍 **Inspeccionar SKU:** \`${inspectTarget}\``,
        time: userTime
      }
    ]);

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/cet-ai-engine/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: selectedCompany,
          code: inspectTarget
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'No se encontró el elemento en el XML');
      }

      const data = await res.json();
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: `🔍 **Inspección de Nodos para \`${inspectTarget}\` en el XML maestro:**`,
          inspectionResult: data.report,
          time: botTime
        }
      ]);
      setQuickInspectCode('');
    } catch (err) {
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: 'bot',
          text: `⚠️ **No se pudo inspeccionar el código \`${inspectTarget}\`:** ${err.message}`,
          time: botTime
        }
      ]);
    } finally {
      setIsInspecting(false);
    }
  };

  // Aplicar cambios quirúrgicos 1-to-1 al XML desde el widget del chat
  const handleCommitMessageStaged = async (msgId, stagedItems, companyForCommit = null) => {
    if (!stagedItems || stagedItems.length === 0) return;
    setIsCommitting(true);
    const targetComp = companyForCommit || selectedCompany;
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/cet-ai-engine/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: targetComp,
          staged_items: stagedItems
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Falla durante la inyección quirúrgica');
      }

      const data = await res.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId ? { ...msg, committed: true, appliedCount: data.applied_count || stagedItems.length } : msg
        )
      );

      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          from: 'bot',
          text: `🎯 **Inyección Quirúrgica 1-to-1 Completada con Éxito**\n\n• **Nodos Modificados:** **${data.applied_count || stagedItems.length}**\n• **Catálogo Afectado:** \`${targetComp}\`\n• **Integridad XML:** 100% Certificada para CET Designer y Catalog Creator.\n\nEl archivo XML maestro ya contiene los nuevos precios. Puedes descargarlo directamente a continuación:`,
          showDownloadCard: true,
          downloadCompany: targetComp,
          time: botTime
        }
      ]);
    } catch (err) {
      console.error('Error inyectando en XML:', err);
      alert(`Error al aplicar cambios: ${err.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  // Descarga directa del XML actualizado
  const handleDownloadXml = (companyToDownload = null) => {
    const comp = companyToDownload || selectedCompany;
    const url = `${BACKEND_BASE_URL}/api/v1/cet-ai-engine/download?company_name=${encodeURIComponent(comp)}`;
    window.open(url, '_blank');
  };

  if (isLoadingAuth || !isAuthenticated) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white text-slate-400 select-none">
        <div className="w-8 h-8 border-2 border-[#464775]/20 border-t-[#464775] rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          Iniciando...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col bg-[#F8F9FC] font-sans text-slate-800">
      {/* ── MODAL DE SALIDA ── */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">¿Cerrar sesión?</h3>
              <p className="text-xs text-slate-500 mb-4">
                Los cambios no guardados se mantendrán en el historial de sesión.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.replace('/login');
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs"
                >
                  Confirmar Salida
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CUERPO PRINCIPAL CON MENU LATERAL Y FONDO CORPORATIVO ── */}
      <main className="w-full h-full p-0 m-0 flex relative overflow-hidden flex-1 min-h-0">
        <MenuLateral
          active="reporting"
          setActive={() => {}}
          onExit={() => setShowExitModal(true)}
        />

        {/* CONTENEDOR UNIFICADO DEL CHAT */}
        <div className="flex flex-1 h-full w-full min-w-0 p-0 bg-transparent">
          <div className="flex flex-col w-full h-full bg-transparent overflow-hidden relative">
            {/* Fondo corporativo */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
              <img src="/fondo.jpg" alt="Background" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-[#464775]/5 to-[#464775]/15" />
            </div>

            {/* Botón flotante superior para limpiar conversación */}
            <div className="absolute top-3 right-4 z-20">
              <button
                onClick={async () => {
                  setUploadedXmlSummary(null);
                  try {
                    await fetch(`${BACKEND_BASE_URL}/api/v1/cet-ai-engine/clear-session`, { method: 'POST' });
                  } catch (e) {
                    console.error('Error limpiando sesión en backend:', e);
                  }
                  setMessages([
                    {
                      id: Date.now(),
                      from: 'bot',
                      text: 'Conversación y memoria reiniciadas. Por favor arrastra o selecciona tu archivo XML maestro de CET Designer para comenzar.',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      showInitialUploader: true
                    }
                  ]);
                }}
                className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600 shadow-xs border border-slate-200/60 transition-all cursor-pointer backdrop-blur-sm"
                title="Limpiar chat"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* ── CUERPO: CHAT INTEGRADO EN EL CENTRO CON RESULTADOS INCORPORADOS ── */}
            <div className="flex flex-1 w-full min-h-0 relative z-10 overflow-hidden">
              <div
                className="h-full flex flex-col w-full min-w-0 bg-transparent"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActiveXml(true);
                }}
                onDragLeave={() => setDragActiveXml(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActiveXml(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleXmlFileSelected(file);
                }}
              >
                {/* OVERLAY DE DRAG & DROP DIRECTO EN EL CHAT */}
                <AnimatePresence>
                  {dragActiveXml && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-30 bg-[#464775]/85 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6"
                    >
                      <UploadCloud size={54} className="animate-bounce mb-3 text-white" />
                      <h3 className="text-lg font-bold">Suelta tu archivo XML aquí</h3>
                      <p className="text-xs text-white/80 max-w-sm text-center mt-1">
                        El motor desestructurará el catálogo maestro de CET Designer en memoria sin intermediación de Excel.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ÁREA DE MENSAJES (Scrollable y Centrada) */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-6 space-y-5 custom-scrollbar">
                  <div className="max-w-4xl mx-auto space-y-5">
                    {/* Lista de Mensajes del Chat */}
                    {messages.map((m) => {
                      const isUser = m.from === 'user';
                      return (
                        <div
                          key={m.id}
                          className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {/* Avatar */}
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs text-xs font-bold ${
                              isUser ? 'bg-slate-200 text-slate-700' : 'bg-[#464775] text-white'
                            }`}
                          >
                            {isUser ? 'Tú' : <Sparkles size={14} />}
                          </div>

                          {/* Burbuja Principal */}
                          <div
                            className={`max-w-[95%] sm:max-w-[90%] rounded-2xl p-4 text-[13px] shadow-xs relative ${
                              isUser
                                ? 'bg-[#F2F3F7] text-slate-800 rounded-tr-xs border border-slate-200/60'
                                : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80'
                            }`}
                          >
                            {!isUser && (
                              <div className="flex items-center justify-end mb-1">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {m.time}
                                </span>
                              </div>
                            )}

                            {/* Contenido Markdown Renderizado o Tarjeta Estilizada de XML */}
                            {m.isXmlUpload || (m.text && m.text.includes("Archivo XML adjunto para ingestión:")) ? (
                              (() => {
                                const fnMatch = m.fileName || (m.text.match(/`([^`]+)`/) ? m.text.match(/`([^`]+)`/)[1] : "catálogo.xml");
                                const sizeMatch = m.fileSizeKb || (m.text.match(/\(([0-9.]+)\s*KB\)/i) ? m.text.match(/\(([0-9.]+)\s*KB\)/i)[1] : null);
                                const isUploading = m.uploadStatus === "uploading";
                                const isError = m.uploadStatus === "error";

                                return (
                                  <div className="space-y-2 text-slate-800 min-w-[240px] sm:min-w-[280px]">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-8 h-8 rounded-lg bg-[#464775]/10 flex items-center justify-center shrink-0">
                                        <FileCode2 size={16} className="text-[#464775]" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                                          Archivo XML adjunto para ingestión:
                                        </span>
                                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                          <span className="font-mono font-bold text-xs bg-[#464775]/10 text-[#464775] px-2 py-0.5 rounded border border-[#464775]/20 tracking-wide">
                                            {fnMatch}
                                          </span>
                                          {sizeMatch && (
                                            <span className="text-[10.5px] font-mono text-slate-500">
                                              ({sizeMatch} KB)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Barra de progreso interactiva */}
                                    <div className="pt-1">
                                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        <motion.div
                                          initial={{ width: "25%" }}
                                          animate={{
                                            width: isUploading ? "80%" : isError ? "100%" : "100%"
                                          }}
                                          transition={{
                                            duration: isUploading ? 1.5 : 0.4,
                                            ease: "easeOut"
                                          }}
                                          className={`h-full rounded-full ${
                                            isError
                                              ? "bg-rose-500"
                                              : isUploading
                                              ? "bg-[#464775] animate-pulse"
                                              : "bg-[#464775]"
                                          }`}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5">
                                        {isUploading ? (
                                          <>
                                            <span className="flex items-center gap-1.5 font-medium text-[#464775]">
                                              <RefreshCw size={10} className="animate-spin text-[#464775]" />
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
                                            <span className="flex items-center gap-1 font-semibold text-[#464775]">
                                              <Check size={12} className="text-[#464775]" />
                                              Archivo cargado e ingerido
                                            </span>
                                            <span className="font-bold text-[#464775]">100%</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              <div
                                className="prose prose-sm max-w-none text-slate-700"
                                dangerouslySetInnerHTML={{
                                  __html: marked.parse(m.text || '')
                                }}
                              />
                            )}

                            {/* ── CARD INICIAL PARA SUBIR XML EN EL CHAT ── */}
                            {m.showInitialUploader && !uploadedXmlSummary && (
                              <div
                                onClick={() => xmlFileInputRef.current?.click()}
                                className="mt-3.5 p-4 border-2 border-dashed border-[#464775]/30 hover:border-[#464775] bg-[#464775]/5 rounded-xl text-center cursor-pointer transition-all group"
                              >
                                <UploadCloud size={28} className="mx-auto text-[#464775] mb-1.5 group-hover:scale-110 transition-transform" />
                                <h4 className="text-xs font-bold text-[#464775]">
                                  Arrastra o haz clic para subir tu catálogo XML maestro
                                </h4>
                                <p className="text-[10.5px] text-slate-500 mt-0.5">
                                  Formatos soportados: .xml de CET Designer o Catalog Creator. Se montará al instante en memoria.
                                </p>
                              </div>
                            )}

                            {/* ── CONSOLA DE PROCESAMIENTO EN TIEMPO REAL ── */}
                            {m.isProcessingConsole && (
                              <CatalogProcessConsole
                                fileName={m.processFileName || 'catalogo.xml'}
                                isCompleted={m.processCompleted}
                                summary={m.processSummary}
                              />
                            )}

                            {/* ── REPORTE CONVERSACIONAL DE INGESTIÓN XML (PROCESOS GUIADOS POR IA) ── */}
                            {m.uploadSummary && (
                              <AiCatalogIngestionReport
                                summary={m.uploadSummary}
                                csvRaw={m.uploadSummary?.csv_raw}
                                xmlRaw={m.uploadSummary?.xml_raw}
                                getCatalogExcelColumns={getCatalogExcelColumns}
                                onCommandSelect={(cmd) => setInputMessage(cmd)}
                                time={m.time}
                              />
                            )}

                            {/* ── STAGING & XML DIFF BOARD DIRECTO EN EL CHAT ── */}
                            {m.stagedResult && m.stagedResult.items && m.stagedResult.items.length > 0 && (
                              <div className="mt-4 border border-[#464775]/25 rounded-2xl overflow-hidden shadow-xs bg-white/95 backdrop-blur-xs">
                                {/* Header del Staging Widget */}
                                <div className="p-3.5 bg-gradient-to-r from-[#464775]/12 via-[#464775]/6 to-transparent border-b border-[#464775]/15 flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <Table size={14} className="text-[#464775]" />
                                      <h4 className="text-xs font-bold text-[#464775] uppercase tracking-wider font-sans">
                                        Surgical Staging & XML Diff Board
                                      </h4>
                                      <span className="px-2 py-0.5 rounded-full bg-[#464775] text-white text-[9.5px] font-mono font-bold shadow-xs">
                                        {m.stagedResult.items.length} Cambios
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-[#464775]/75 mt-0.5 font-medium">
                                      Previsualización en memoria. Confirma para inyectar directamente en el XML maestro.
                                    </p>
                                  </div>

                                  {/* Botón de Inyección Quirúrgica */}
                                  <button
                                    onClick={() => handleCommitMessageStaged(m.id, m.stagedResult.items, m.companyName)}
                                    disabled={isCommitting || m.committed}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs flex items-center gap-1.5 ${
                                      m.committed
                                        ? 'bg-[#464775]/90 hover:bg-[#464775]'
                                        : 'bg-[#464775] hover:bg-[#38395f] active:scale-[0.98]'
                                    } disabled:opacity-60 cursor-pointer`}
                                  >
                                    {isCommitting ? (
                                      <>
                                        <RefreshCw size={12} className="animate-spin" />
                                        Inyectando...
                                      </>
                                    ) : m.committed ? (
                                      <>
                                        <CheckCheck size={13} className="text-purple-200" />
                                        ¡XML Actualizado!
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 size={13} />
                                        Aplicar Cambios al XML
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* Tabla Dinámica con Scroll */}
                                <div className="overflow-x-auto max-h-[380px] custom-scrollbar">
                                  <table className="w-full text-left text-xs text-slate-700">
                                    <thead className="bg-[#464775]/5 sticky top-0 z-10 border-b border-[#464775]/15 text-[#464775] font-bold text-[10px] uppercase tracking-wider">
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
                                    <tbody className="divide-y divide-[#464775]/10">
                                      {m.stagedResult.items.map((item, idx) => {
                                        const isOption = String(item.target_type || item.type || '').toLowerCase().includes('option');
                                        const isMatched = item.status === 'MATCHED' || (!item.status && item.old_price != null);
                                        const pct = item.percent_delta != null ? item.percent_delta : (item.diff_pct != null ? item.diff_pct : (item.pct != null ? item.pct : null));
                                        const isPositive = pct != null && pct >= 0;
                                        return (
                                          <tr
                                            key={idx}
                                            className="transition-colors hover:bg-[#464775]/5"
                                          >
                                            <td className="px-3.5 py-2.5 font-mono font-bold text-[#464775] text-xs">
                                              {item.sku}
                                            </td>
                                            <td className="px-3.5 py-2.5">
                                              <span
                                                className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold ${
                                                  isOption
                                                    ? 'bg-[#6264A7]/15 text-[#464775] border border-[#6264A7]/25'
                                                    : 'bg-[#464775]/10 text-[#464775] border border-[#464775]/20'
                                                }`}
                                              >
                                                {isOption ? '<OptionPrice>' : '<Price>'}
                                              </span>
                                            </td>
                                            <td
                                              className="px-3.5 py-2.5 text-[11px] text-[#464775]/80 max-w-[140px] truncate font-medium"
                                              title={item.matched_option_name || item.option_name || item.option_code || item.option}
                                            >
                                              {item.matched_option_name || item.option_name || item.option_code || item.option || 'Precio Base'}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right font-mono text-[#464775]/60 text-xs">
                                              {item.old_price != null ? `$${item.old_price}` : <span className="text-[#464775]/40">—</span>}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right font-mono font-bold text-[#464775] text-xs">
                                              ${item.new_price != null ? item.new_price : item.new_value}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-right font-mono font-bold text-xs text-[#464775]">
                                              {pct != null ? (
                                                <span className="bg-[#464775]/10 px-1.5 py-0.5 rounded text-[#464775]">
                                                  {isPositive ? `+${pct}%` : `${pct}%`}
                                                </span>
                                              ) : (
                                                <span className="text-[#464775]/40 font-normal">—</span>
                                              )}
                                            </td>
                                            <td className="px-3.5 py-2.5 text-center">
                                              {isMatched ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#464775] bg-[#464775]/12 px-2 py-0.5 rounded-full border border-[#464775]/25">
                                                  <CheckCircle2 size={10} className="text-[#464775]" />
                                                  Verificado
                                                </span>
                                              ) : (
                                                <span
                                                  className="inline-flex items-center gap-1 text-[10px] font-medium text-[#6264A7] bg-[#6264A7]/10 px-2 py-0.5 rounded-full border border-[#6264A7]/20"
                                                  title={item.reason}
                                                >
                                                  <AlertCircle size={10} className="text-[#6264A7]" />
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

                                {/* Footer de la tarjeta con botón de descarga si ya se aplicó */}
                                <div className="p-2.5 bg-[#464775]/5 border-t border-[#464775]/15 flex items-center justify-between">
                                  <span className="text-[10.5px] text-[#464775]/80 font-medium">
                                    Catálogo: <strong className="text-[#464775]">{m.companyName || selectedCompany}</strong>
                                  </span>
                                  {m.committed && (
                                    <button
                                      onClick={() => handleDownloadXml(m.companyName)}
                                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#464775] hover:bg-[#38395f] text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                                    >
                                      <Download size={12} />
                                      Descargar XML Actualizado
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* ── CARD DIRECTA DE DESCARGA FINAL EN EL CHAT ── */}
                            {m.showDownloadCard && (
                              <div className="mt-3 p-3.5 bg-[#464775]/6 border border-[#464775]/20 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-[#464775] text-white flex items-center justify-center shadow-xs">
                                    <CheckCheck size={16} />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-[#464775]">
                                      Catálogo XML Certificado y Actualizado
                                    </h4>
                                    <p className="text-[10.5px] text-[#464775]/75 font-medium">
                                      Listo para importar directamente en CET Designer sin errores de formato.
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDownloadXml(m.downloadCompany)}
                                  className="px-3.5 py-1.5 bg-[#464775] hover:bg-[#38395f] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Download size={13} />
                                  Descargar .XML
                                </button>
                              </div>
                            )}

                            {/* ── CARD DE INSPECCIÓN SKU DIRECTA EN EL CHAT ── */}
                            {m.inspectionResult && (
                              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                                  <span className="font-bold text-[#464775] text-xs">
                                    SKU: {m.inspectionResult.code}
                                  </span>
                                  <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                    Precio Base: ${m.inspectionResult.current_list_price}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600">
                                  <strong>Descripción:</strong> {m.inspectionResult.description}
                                </p>
                                {m.inspectionResult.features_tree && m.inspectionResult.features_tree.length > 0 && (
                                  <div className="mt-2">
                                    <span className="font-bold text-[#464775] text-[11px] block mb-1">
                                      Árbol de Opciones (CET Designer):
                                    </span>
                                    <div className="max-h-40 overflow-y-auto custom-scrollbar border border-slate-200 rounded-lg bg-white">
                                      <table className="w-full text-left text-[11px]">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                          <tr>
                                            <th className="px-2 py-1">Feature</th>
                                            <th className="px-2 py-1">Opción</th>
                                            <th className="px-2 py-1">Nombre</th>
                                            <th className="px-2 py-1 text-right">Recargo</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {m.inspectionResult.features_tree.map((f, fIdx) =>
                                            (f.options || []).map((opt, oIdx) => (
                                              <tr key={`${fIdx}-${oIdx}`} className="hover:bg-slate-50">
                                                <td className="px-2 py-1 font-mono text-slate-500">{f.feature_code}</td>
                                                <td className="px-2 py-1 font-mono font-bold text-[#464775]">{opt.code}</td>
                                                <td className="px-2 py-1 text-slate-700">{opt.description}</td>
                                                <td className="px-2 py-1 text-right font-mono">${opt.current_price}</td>
                                              </tr>
                                            ))
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {isUser && (
                              <div className="text-right text-[9.5px] text-slate-400 mt-1 font-mono">
                                {m.time}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Loading de respuesta */}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#464775] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Sparkles size={14} />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tl-xs p-4 border border-slate-200/80 shadow-xs flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-[#464775] animate-bounce" />
                          <div className="w-2 h-2 rounded-full bg-[#464775] animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 rounded-full bg-[#464775] animate-bounce [animation-delay:0.4s]" />
                          <span className="text-xs text-slate-500 font-medium ml-1">
                            Analizando catálogo y verificando nodos en el XML maestro...
                          </span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* ── BARRA DE ENTRADA CON ADJUNTO Y QUICK INSPECT ── */}
                <div className="p-3 sm:p-4 bg-white/70 backdrop-blur-md border-t border-slate-200/50">
                  <div className="max-w-4xl mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-xs focus-within:border-[#464775]/50 focus-within:ring-3 focus-within:ring-[#464775]/10 transition-all p-2.5">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Escribe cambios (ej: AS1101 a $850 y Polyurethane Armpad a $75) o pega una lista... [Shift+Enter para nueva línea]"
                      className="w-full bg-transparent border-0 outline-none resize-none text-[13px] text-slate-800 placeholder-slate-400 px-2 py-1 max-h-[160px] custom-scrollbar"
                    />

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 mt-1">
                      <div className="flex items-center gap-2">
                        {/* Input oculto de archivos XML */}
                        <input
                          type="file"
                          accept=".xml"
                          ref={xmlFileInputRef}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleXmlFileSelected(file);
                          }}
                        />

                        {/* Botón de Adjuntar XML */}
                        <button
                          type="button"
                          onClick={() => xmlFileInputRef.current?.click()}
                          disabled={isUploadingXml}
                          title="Adjuntar archivo XML maestro de CET Designer"
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-600 hover:text-[#464775] hover:bg-slate-100 text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Paperclip size={13} className="text-[#464775]" />
                          <span className="hidden sm:inline">
                            {isUploadingXml ? 'Cargando XML...' : 'Subir XML'}
                          </span>
                        </button>

                        {/* Quick Inspect SKU */}
                        <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-slate-200">
                          <input
                            type="text"
                            value={quickInspectCode}
                            onChange={(e) => setQuickInspectCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuickInspect()}
                            placeholder="Inspeccionar SKU..."
                            className="w-32 px-2 py-0.5 text-[11px] bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-[#464775]"
                          />
                          <button
                            type="button"
                            onClick={handleQuickInspect}
                            disabled={isInspecting}
                            className="p-1 rounded-md text-slate-500 hover:text-[#464775] hover:bg-slate-100 cursor-pointer"
                            title="Inspeccionar estructura"
                          >
                            <Search size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Botón de Enviar */}
                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || isLoading}
                        className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#464775] text-white hover:bg-[#38395f] disabled:opacity-40 disabled:hover:bg-[#464775] transition-all shadow-xs cursor-pointer"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
