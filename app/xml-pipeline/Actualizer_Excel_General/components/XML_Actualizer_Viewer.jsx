'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  supabase,
  resolveStorageContent,
  getActiveTenantKey,
  getActiveTenantKeySync
} from '@/app/lib/supabaseClient';
import { recordClientAction } from '@/app/lib/trackingClient';
import {
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  SlidersHorizontal,
  Layers,
  Check,
  X,
  ChevronDown,
  FileCode2,
  Table,
  Code2,
  Download,
  Copy,
  Sparkles,
  SendHorizonal,
  Tag,
  Filter,
  Eye,
  Info,
  Zap,
  Paperclip,
  Mic,
  HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AlysaWordmark from '@/app/xml-pipeline/Actualizer_XML_General/components/comparePDF/REPORT/components/AlysaWordmark';
import { getProductTypology, PRODUCT_TYPOLOGY_RULES } from './Catalog_Editor_General.jsx';

const BASE_HEADERS = ["Model #", "List Price", "Weight", "Classic/ Premium", "Model Name"];
const ROW_HEIGHT = 38;
const OVERSCAN = 12;

// Sanitizador de texto: Elimina cualquier emoji del chat (política estricta Servex)
const stripEmojis = (str) => {
  if (!str) return '';
  return String(str)
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2300}-\u{23FF}\u{200D}\u{FE0F}]/gu,
      ''
    )
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};

export default function XMLActualizerViewer({
  isDarkMode = true,
  onBack = () => {}
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallbackXml, setIsFallbackXml] = useState(false);
  const [catalogName, setCatalogName] = useState('Catalog');

  // Contenido XML crudo
  const [xmlContent, setXmlContent] = useState('');

  // Filas y columnas matriciales
  const [headers, setHeaders] = useState(BASE_HEADERS);
  const [rows, setRows] = useState([]);

  // Modo de visualización: 'matrix' | 'xml'
  const [viewMode, setViewMode] = useState('matrix');

  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [xmlSearchTerm, setXmlSearchTerm] = useState('');
  const [selectedTypologyFilter, setSelectedTypologyFilter] = useState('');
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState('');
  const [mcpActiveSkuFilter, setMcpActiveSkuFilter] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'configurable' | 'base'

  // Copia de XML
  const [copiedXml, setCopiedXml] = useState(false);

  // Redimensionamiento del panel de Alysa (idéntico al Editor hasta 50vw)
  const splitContainerRef = useRef(null);
  const isResizingRef = useRef(false);
  const [isResizingChat, setIsResizingChat] = useState(false);
  const [isLgScreen, setIsLgScreen] = useState(true);
  const [chatWidthPercent, setChatWidthPercent] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('xml_viewer_chat_width_pct');
        if (saved) {
          const val = parseFloat(saved);
          if (!Number.isNaN(val) && val >= 18 && val <= 50) return val;
        }
      } catch (_) {}
    }
    return 28;
  });

  // Chat con Alysa (Solo Lectura y Filtros)
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [expandedSlashCategory, setExpandedSlashCategory] = useState(null);
  const chatBottomRef = useRef(null);

  // Scroll virtualizado de la tabla
  const tableContainerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);
  const scrollRafRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkScreen = () => setIsLgScreen(window.innerWidth >= 1024);
      checkScreen();
      window.addEventListener('resize', checkScreen);
      return () => window.removeEventListener('resize', checkScreen);
    }
  }, []);

  const handleStartResize = useCallback((e) => {
    e.preventDefault();
    setIsResizingChat(true);
    isResizingRef.current = true;
    if (typeof document !== 'undefined') {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    const handleMouseMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const rawWidthPx = rect.right - moveEvent.clientX;
      let newPct = (rawWidthPx / rect.width) * 100;
      if (newPct < 18) newPct = 18;
      if (newPct > 50) newPct = 50;
      setChatWidthPercent(newPct);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      setIsResizingChat(false);
      if (typeof document !== 'undefined') {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setChatWidthPercent((curr) => {
        try {
          sessionStorage.setItem('xml_viewer_chat_width_pct', String(curr.toFixed(1)));
        } catch (_) {}
        return curr;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const handleResetResize = useCallback(() => {
    setChatWidthPercent(28);
    try {
      sessionStorage.setItem('xml_viewer_chat_width_pct', '28');
    } catch (_) {}
  }, []);

  // Cargar xml_actualizer_raw desde Supabase / sessionStorage
  const loadCertifiedXml = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Verificar primero si ya está en sessionStorage en memoria caliente (0ms)
      const localUpdatedXml = typeof window !== 'undefined' ? sessionStorage.getItem('xml_actualizer_raw') : null;
      const localBaseXml = typeof window !== 'undefined' ? (sessionStorage.getItem('xml_raw') || sessionStorage.getItem('XM_CET_import')) : null;

      // 2. Consultar en Supabase buscando el registro exclusivo del usuario/tenant actual
      const tenantKey = await getActiveTenantKey();
      const { data: record } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .select('id, company_name, xml_actualizer_raw, XM_CET_import, xml_raw, xml_name, file_name, created_at')
        .eq('company_name', tenantKey)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      const name = (record?.xml_name || record?.file_name || 'Catalog').replace(/\.xml$/i, '').trim();
      setCatalogName(name);

      let rawXmlSource = record?.xml_actualizer_raw || localUpdatedXml;
      let usedFallback = false;

      if (!rawXmlSource || !String(rawXmlSource).trim()) {
        rawXmlSource = record?.XM_CET_import || record?.xml_raw || localBaseXml;
        usedFallback = true;
      }

      if (!rawXmlSource || !String(rawXmlSource).trim()) {
        throw new Error('No existe ningún archivo XML disponible en la base de datos ni en memoria.');
      }

      setIsFallbackXml(usedFallback);

      const resolvedXml = await resolveStorageContent(rawXmlSource);
      if (!resolvedXml || typeof resolvedXml !== 'string' || !resolvedXml.includes('<')) {
        throw new Error('El contenido recuperado no tiene formato XML válido.');
      }

      setXmlContent(resolvedXml);
      parseXmlToMatrix(resolvedXml);
    } catch (err) {
      console.error('[-] Error cargando xml_actualizer_raw:', err);
      setError(err.message || 'Error al procesar el archivo XML.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertifiedXml();
  }, [loadCertifiedXml]);

  useEffect(() => {
    const handleXmlActualizerUpdate = (event) => {
      const updatedXml = event?.detail?.xml;
      if (updatedXml && typeof updatedXml === 'string') {
        setXmlContent(updatedXml);
        parseXmlToMatrix(updatedXml);
        setIsFallbackXml(false);
      } else {
        loadCertifiedXml();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('xmlActualizerUpdated', handleXmlActualizerUpdate);
      return () => window.removeEventListener('xmlActualizerUpdated', handleXmlActualizerUpdate);
    }
  }, [loadCertifiedXml]);

  // Parsear XML a la matriz de productos
  const parseXmlToMatrix = (xmlText) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'application/xml');

      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Fallo al parsear estructura XML: ' + parseError.textContent.slice(0, 100));
      }

      const globalFeatures = Array.from(doc.getElementsByTagName('Feature'));
      const featureMap = new Map();
      for (const f of globalFeatures) {
        const fCode = f.getElementsByTagName('Code')[0]?.textContent?.trim();
        if (fCode) featureMap.set(fCode, f);
      }

      const getProductFeatureCodes = (pNode) => {
        const codes = [];
        const localFeatures = Array.from(pNode.getElementsByTagName('Feature'));
        for (const lf of localFeatures) {
          const c = lf.getElementsByTagName('Code')[0]?.textContent?.trim();
          if (c) codes.push(c);
        }
        const refs = Array.from(pNode.getElementsByTagName('FeatureRef'));
        for (const r of refs) {
          const c = r.textContent?.trim();
          if (c) codes.push(c);
        }
        return codes;
      };

      const productNodes = Array.from(doc.getElementsByTagName('Product'));
      if (productNodes.length === 0) {
        setRows([]);
        setHeaders(BASE_HEADERS);
        return;
      }

      const dynamicColumnsMap = new Map();
      const parsedRows = [];

      for (let i = 0; i < productNodes.length; i++) {
        const p = productNodes[i];
        const sku = p.getElementsByTagName('Code')[0]?.textContent?.trim() || `SKU-${i + 1}`;
        const description = p.getElementsByTagName('Description')[0]?.textContent?.trim() || '';

        let classification = 'Standard';
        const classRef = p.getElementsByTagName('ClassificationRef')[0];
        if (classRef) {
          classification = classRef.getElementsByTagName('Code')[0]?.textContent?.trim() || classRef.textContent?.trim() || 'Standard';
        }

        const priceEl = p.getElementsByTagName('Price')[0];
        const listPrice = priceEl ? parseFloat(priceEl.getElementsByTagName('Value')[0]?.textContent || '0') : 0;
        const weight = p.getElementsByTagName('Weight')[0]?.textContent?.trim() || 'N/A';

        const featureCodes = getProductFeatureCodes(p);
        const optionPrices = {};

        for (const fCode of featureCodes) {
          const fNode = featureMap.get(fCode);
          if (fNode) {
            const options = Array.from(fNode.getElementsByTagName('Option'));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName('Code')[0]?.textContent?.trim();
              if (optCode === 'C' || optCode === 'P') continue;
              const optDesc = opt.getElementsByTagName('Description')[0]?.textContent?.trim() || optCode;
              const optPriceEl = opt.querySelector('OptionPrice > Value');
              if (optPriceEl && optCode) {
                const optVal = parseFloat(optPriceEl.textContent || '0');
                if (optVal > 0) {
                  const colKey = optDesc || optCode;
                  if (!dynamicColumnsMap.has(colKey)) {
                    dynamicColumnsMap.set(colKey, optDesc);
                  }
                  optionPrices[colKey] = optVal;
                }
              }
            }
          }
        }

        const typology = getProductTypology(description, sku);

        const rowObj = {
          'Model #': sku,
          'List Price': listPrice > 0 ? listPrice : '',
          'Weight': weight,
          'Classic/ Premium': classification,
          'Model Name': description,
          _typology: typology,
          _optionsCount: Object.keys(optionPrices).length,
          ...optionPrices
        };

        parsedRows.push(rowObj);
      }

      const dynCols = Array.from(dynamicColumnsMap.keys()).sort();
      const computedHeaders = [...BASE_HEADERS, ...dynCols];

      setHeaders(computedHeaders);
      setRows(parsedRows);
    } catch (e) {
      console.warn('[-] Error en parseXmlToMatrix:', e);
      setError('Error al procesar el archivo XML a matriz: ' + e.message);
    }
  };

  // Facetas inteligentes (idénticas al Catalog Matrix Live Editor)
  const catalogFacets = useMemo(() => {
    if (!rows || rows.length === 0) {
      return { options: [], familias: [], tipologias: [], calidad: [] };
    }

    const optionCols = headers.filter((h) => !BASE_HEADERS.includes(h));

    const parsedRows = rows.map((r) => {
      const sku = String(r['Model #'] || '').trim();
      const modelName = String(r['Model Name'] || '').trim();
      const price = Number(r['List Price']) || 0;
      const weight = String(r['Weight'] || '').trim();
      const cat = String(r['Classic/ Premium'] || '').trim();

      const activeOpts = [];
      optionCols.forEach((col) => {
        const val = r[col];
        if (val !== undefined && val !== null && String(val).trim() !== '' && Number(val) > 0) {
          activeOpts.push({ col, val: Number(val) });
        }
      });

      let skuFamily = 'Otros';
      if (sku) {
        const match = sku.match(/^([A-Za-z0-9]{2,5})[-_]/);
        if (match) skuFamily = match[1];
      }

      const pType = r._typology || getProductTypology(modelName, sku);

      return {
        sku,
        skuFamily,
        price,
        weight,
        cat,
        modelName,
        pType,
        optsCount: activeOpts.length,
        activeOpts
      };
    });

    // 1. Opciones comerciales XML
    const sinOpciones = parsedRows.filter((r) => r.optsCount === 0).map((r) => r.sku);
    const conOpciones = parsedRows.filter((r) => r.optsCount >= 1).map((r) => r.sku);
    const multiOpciones = parsedRows.filter((r) => r.optsCount >= 2).map((r) => r.sku);

    const optionsFilters = [
      {
        id: 'opt-base',
        label: 'Modelos Base (Sin recargos)',
        prompt: 'Filtra modelos base',
        skus: sinOpciones,
        badge: `${sinOpciones.length} SKUs · Base`
      },
      ...(conOpciones.length > 0
        ? [
            {
              id: 'opt-configurable',
              label: 'Modelos Configurables',
              prompt: 'Filtra modelos configurables',
              skus: conOpciones,
              badge: `${conOpciones.length} SKUs · Opciones`
            }
          ]
        : []),
      ...(multiOpciones.length > 0
        ? [
            {
              id: 'opt-multi',
              label: 'Con múltiples recargos (≥2)',
              prompt: 'Filtra modelos con múltiples recargos',
              skus: multiOpciones,
              badge: `${multiOpciones.length} SKUs · Multi`
            }
          ]
        : [])
    ];

    optionCols.forEach((colName) => {
      const matchingRows = parsedRows.filter((r) => r.activeOpts.some((o) => o.col === colName));
      if (matchingRows.length === 0) return;

      const colSkus = matchingRows.map((r) => r.sku);
      const vals = [];
      matchingRows.forEach((r) => {
        const item = r.activeOpts.find((o) => o.col === colName);
        if (item && item.val > 0) vals.push(item.val);
      });
      vals.sort((a, b) => a - b);
      const minUp = vals.length > 0 ? vals[0] : 0;
      const maxUp = vals.length > 0 ? vals[vals.length - 1] : 0;
      const rangeText =
        vals.length === 0
          ? ''
          : minUp === maxUp
          ? `+$${minUp % 1 === 0 ? minUp.toFixed(0) : minUp.toFixed(2)}`
          : `+$${minUp.toFixed(0)}–$${maxUp.toFixed(0)}`;
      const cleanColName = colName.length > 24 ? colName.slice(0, 22) + '…' : colName;

      optionsFilters.push({
        id: `opt-dyn-${colName}`,
        label: cleanColName,
        targetCol: colName,
        prompt: `Filtra productos con opción "${colName}"`,
        skus: colSkus,
        badge: `${colSkus.length} SKUs${rangeText ? ` · ${rangeText}` : ''}`
      });
    });

    // 2. Tipologías de Producto
    const tipologiaGroups = {};
    parsedRows.forEach((r) => {
      const t = r.pType || 'Otros';
      if (!tipologiaGroups[t]) tipologiaGroups[t] = [];
      tipologiaGroups[t].push(r.sku);
    });

    const TIPOLOGIA_ORDER = [
      'Sillas',
      'Mesas',
      'Escritorios',
      'Almacenamiento',
      'Lounge / Sofás',
      'Taburetes',
      'Bancas',
      'Accesorios & Paneles',
      'Otros'
    ];
    const tipologiasFilters = Object.entries(tipologiaGroups)
      .sort((a, b) => {
        const idxA = TIPOLOGIA_ORDER.indexOf(a[0]);
        const idxB = TIPOLOGIA_ORDER.indexOf(b[0]);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return b[1].length - a[1].length;
      })
      .map(([tipo, skusList]) => ({
        id: `tipo-${tipo.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        label: tipo,
        prompt: `Filtra solo ${tipo.toLowerCase()}`,
        skus: skusList,
        badge: `${skusList.length} SKUs`
      }));

    // 3. Familias de SKU
    const familyGroups = {};
    parsedRows.forEach((r) => {
      if (r.skuFamily && r.skuFamily !== 'Otros') {
        if (!familyGroups[r.skuFamily]) familyGroups[r.skuFamily] = [];
        familyGroups[r.skuFamily].push(r.sku);
      }
    });

    const familiasFilters = Object.entries(familyGroups)
      .filter(([_, skusList]) => skusList.length >= 3)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .map(([fam, skusList]) => ({
        id: `fam-${fam}`,
        label: `Familia ${fam}`,
        prompt: `Filtra familia ${fam}`,
        skus: skusList,
        badge: `${skusList.length} SKUs`
      }));

    // 4. Calidad y salud de esquema
    const sinPrecio = parsedRows.filter((r) => r.price <= 0).map((r) => r.sku);
    const calidadFilters = [];
    if (sinPrecio.length > 0) {
      calidadFilters.push({
        id: 'cal-zero-price',
        label: 'Modelos con precio $0 o nulo',
        prompt: 'Aislar modelos sin precio ($0)',
        skus: sinPrecio,
        badge: `${sinPrecio.length} SKUs`
      });
    }

    return {
      options: optionsFilters,
      familias: familiasFilters,
      tipologias: tipologiasFilters,
      calidad: calidadFilters
    };
  }, [rows, headers]);

  // Filas filtradas de la tabla
  const filteredRows = useMemo(() => {
    let result = rows;

    // Filtro por SKUs aislados
    if (mcpActiveSkuFilter && mcpActiveSkuFilter.skuSet) {
      result = result.filter((r) => {
        const sku = String(r['Model #'] || '').trim();
        return mcpActiveSkuFilter.skuSet.has(sku);
      });
    }

    // Filtro por tipología
    if (selectedTypologyFilter) {
      result = result.filter((r) => {
        const t = r._typology || getProductTypology(r['Model Name'], r['Model #']);
        return t === selectedTypologyFilter;
      });
    }

    // Filtro por familia
    if (selectedFamilyFilter) {
      const famPrefix = selectedFamilyFilter.toLowerCase();
      result = result.filter((r) => {
        const sku = String(r['Model #'] || '').toLowerCase();
        return sku.startsWith(famPrefix);
      });
    }

    // Filtro por modo
    if (filterMode === 'configurable') {
      result = result.filter((r) => r._optionsCount > 0);
    } else if (filterMode === 'base') {
      result = result.filter((r) => !r._optionsCount || r._optionsCount === 0);
    }

    // Búsqueda inteligente
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((r) => {
        const sku = String(r['Model #'] || '').toLowerCase();
        const desc = String(r['Model Name'] || '').toLowerCase();
        const tipo = String(r._typology || '').toLowerCase();
        return sku.includes(q) || desc.includes(q) || tipo.includes(q);
      });
    }

    return result;
  }, [rows, mcpActiveSkuFilter, selectedTypologyFilter, selectedFamilyFilter, filterMode, searchTerm]);

  // Medición de viewport para scroll virtualizado
  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;
    const updateSize = () => {
      setViewportHeight(el.clientHeight || 600);
    };
    updateSize();
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateSize);
      ro.observe(el);
    } else {
      window.addEventListener('resize', updateSize);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', updateSize);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, [viewMode, loading]);

  const handleTableScroll = useCallback((e) => {
    const top = e.currentTarget.scrollTop;
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      setScrollTop(top);
    });
  }, []);

  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = 0;
    }
    setScrollTop(0);
  }, [searchTerm, filterMode, selectedTypologyFilter, selectedFamilyFilter, mcpActiveSkuFilter]);

  const virtualWindow = useMemo(() => {
    const total = filteredRows.length;
    if (total === 0) {
      return { startIdx: 0, endIdx: 0, visibleRows: [], topSpacerHeight: 0, bottomSpacerHeight: 0 };
    }
    const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const endIdx = Math.min(total, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN);

    return {
      startIdx,
      endIdx,
      visibleRows: filteredRows.slice(startIdx, endIdx),
      topSpacerHeight: startIdx * ROW_HEIGHT,
      bottomSpacerHeight: Math.max(0, (total - endIdx) * ROW_HEIGHT)
    };
  }, [filteredRows, scrollTop, viewportHeight]);

  // Copiar XML completo
  const handleCopyXml = async () => {
    if (!xmlContent) return;
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopiedXml(true);
      setTimeout(() => setCopiedXml(false), 2000);
    } catch (_) {}
  };

  // Descargar archivo .xml certificado
  const handleDownloadXml = () => {
    if (!xmlContent) return;
    try {
      const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${catalogName}-xml_actualizer_raw.xml`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 150);

      recordClientAction({
        companyName: getActiveTenantKeySync(),
        eventType: 'DOWNLOAD_RESULT_XML',
        title: 'Descarga XML Certificado desde Visor',
        description: `El usuario descargó el archivo XML actualizado '${catalogName}-xml_actualizer_raw.xml'.`
      });
    } catch (e) {
      alert('Error descargando archivo XML: ' + e.message);
    }
  };

  // Disparar mensaje y filtro interactivo con Alysa
  const handleSendMatrixChat = useCallback(
    (promptText, skusList = null, filterLabel = null, targetCol = null) => {
      const userTxt = promptText || chatInput;
      if (!userTxt || isChatLoading) return;

      const userMsg = {
        id: `usr-${Date.now()}`,
        role: 'user',
        text: stripEmojis(userTxt),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setChatInput('');
      setIsChatLoading(true);

      setTimeout(() => {
        const q = userTxt.toLowerCase().trim();
        let reply = '';
        let matched = skusList;
        let matchedCol = targetCol;

        // Detección de intentos de edición (modo solo lectura estricto)
        if (
          q.includes('cambia') ||
          q.includes('sube') ||
          q.includes('baja') ||
          q.includes('actualiza') ||
          q.includes('edita') ||
          q.includes('precio a ') ||
          q.includes('borra')
        ) {
          reply =
            'Este visor opera exclusivamente en **modo lectura y certificación** para `xml_actualizer_raw`. Para aplicar modificaciones o ajustes por lote, utiliza la sección **Catalog Matrix Live Editor**.';
        } else if (q.includes('quitar') || q.includes('limpiar') || q.includes('todos') || q.includes('reset')) {
          setMcpActiveSkuFilter(null);
          setSelectedTypologyFilter('');
          setSelectedFamilyFilter('');
          setFilterMode('all');
          setSearchTerm('');
          reply = `Filtros restablecidos. Mostrando la totalidad de los **${rows.length} productos** del XML certificado.`;
        } else if (skusList && skusList.length > 0) {
          matched = skusList;
          reply = `He aislado **${skusList.length} productos** correspondientes al filtro "${filterLabel || promptText}".`;
          setMcpActiveSkuFilter({
            label: filterLabel || `${skusList.length} SKUs`,
            targetCol: targetCol || null,
            skuSet: new Set(skusList)
          });
        } else if (q.includes('silla') || q.includes('chair')) {
          const match = rows.filter((r) => (r._typology || getProductTypology(r['Model Name'], r['Model #'])) === 'Sillas');
          matched = match.map((r) => r['Model #']);
          reply = `He aislado **${match.length} sillas** en la matriz.`;
          setMcpActiveSkuFilter({
            label: `Sillas (${match.length} SKUs)`,
            targetCol: null,
            skuSet: new Set(matched)
          });
        } else if (q.includes('mesa') || q.includes('table')) {
          const match = rows.filter((r) => (r._typology || getProductTypology(r['Model Name'], r['Model #'])) === 'Mesas');
          matched = match.map((r) => r['Model #']);
          reply = `He aislado **${match.length} mesas** en la matriz.`;
          setMcpActiveSkuFilter({
            label: `Mesas (${match.length} SKUs)`,
            targetCol: null,
            skuSet: new Set(matched)
          });
        } else if (q.includes('escritorio') || q.includes('desk')) {
          const match = rows.filter((r) => (r._typology || getProductTypology(r['Model Name'], r['Model #'])) === 'Escritorios');
          matched = match.map((r) => r['Model #']);
          reply = `He aislado **${match.length} escritorios** en la matriz.`;
          setMcpActiveSkuFilter({
            label: `Escritorios (${match.length} SKUs)`,
            targetCol: null,
            skuSet: new Set(matched)
          });
        } else {
          setSearchTerm(userTxt);
          reply = `Aplicando filtro de búsqueda por término: "${userTxt}". Revisa las coincidencias en la matriz.`;
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: `aly-${Date.now()}`,
            role: 'assistant',
            text: stripEmojis(reply),
            matchedSkus: matched || undefined,
            filterLabel: filterLabel || undefined,
            targetCol: matchedCol || undefined,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsChatLoading(false);
      }, 350);
    },
    [chatInput, isChatLoading, rows]
  );

  // Herramientas dinámicas (Slash Commands) para el Visor Certificado
  const availableCatalogTools = useMemo(() => {
    const tools = [];

    // 1. Tipologías
    if (Array.isArray(catalogFacets?.tipologias)) {
      catalogFacets.tipologias.forEach((t) => {
        const cleanSlug = t.label
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        tools.push({
          id: `cmd-tipo-${cleanSlug}`,
          label: `/${cleanSlug}`,
          displayName: t.label,
          desc: `${t.skus.length} SKUs`,
          category: 'Tipologías de Producto',
          icon: Layers,
          prompt: `Filtra solo las ${t.label.toLowerCase()}`,
          skus: t.skus,
          filterLabel: `Tipología: ${t.label} (${t.skus.length} SKUs)`,
          targetCol: null
        });
      });
    }

    // 2. Opciones & Recargos
    if (Array.isArray(catalogFacets?.options)) {
      catalogFacets.options.forEach((o) => {
        let cleanSlug = '';
        if (o.id === 'opt-base') cleanSlug = 'modelos-base';
        else if (o.id === 'opt-configurable') cleanSlug = 'configurables';
        else if (o.id === 'opt-multi') cleanSlug = 'multiples-recargos';
        else {
          cleanSlug = (o.targetCol || o.label)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        }
        tools.push({
          id: `cmd-opt-${cleanSlug}`,
          label: `/${cleanSlug}`,
          displayName: o.label,
          desc: o.badge || `${o.skus.length} SKUs`,
          category: 'Opciones & Recargos XML',
          icon: SlidersHorizontal,
          prompt: o.prompt,
          skus: o.skus,
          filterLabel: o.label,
          targetCol: o.targetCol || null
        });
      });
    }

    // 3. Auditoría de Calidad
    if (Array.isArray(catalogFacets?.calidad)) {
      catalogFacets.calidad.forEach((c) => {
        let cleanSlug = '';
        if (c.id === 'audit-price') cleanSlug = 'sin-precio';
        else if (c.id === 'audit-weight') cleanSlug = 'sin-peso';
        else if (c.id === 'audit-cat') cleanSlug = 'sin-categoria';
        else if (c.id === 'audit-name') cleanSlug = 'sin-nombre';
        else cleanSlug = c.id;

        tools.push({
          id: `cmd-audit-${cleanSlug}`,
          label: `/${cleanSlug}`,
          displayName: c.label,
          desc: c.badge || `${c.skus.length} SKUs`,
          category: 'Auditoría Esquema XML',
          icon: AlertCircle,
          prompt: c.prompt,
          skus: c.skus,
          filterLabel: c.label,
          targetCol: null
        });
      });
    }

    // 4. Comandos Globales
    tools.push({
      id: 'cmd-global-todos',
      label: '/todos',
      displayName: 'Ver Catálogo Completo',
      desc: `Restablecer filtros (${rows.length} SKUs)`,
      category: 'Vistas Globales & Inspección',
      icon: Sparkles,
      prompt: 'Muestra todos los productos del catálogo completo',
      skus: rows.map((r) => r['Model #']).filter(Boolean),
      filterLabel: null,
      targetCol: null
    });

    tools.push({
      id: 'cmd-global-resumen',
      label: '/resumen',
      displayName: 'Resumen General del XML',
      desc: 'Métricas de precio, familias y opciones comerciales',
      category: 'Vistas Globales & Inspección',
      icon: Filter,
      prompt: 'Dame un resumen general del catálogo XML certificado',
      skus: [],
      filterLabel: null,
      targetCol: null
    });

    return tools;
  }, [catalogFacets, rows]);

  const filteredSlashCommands = useMemo(() => {
    if (!chatInput.startsWith('/')) return availableCatalogTools;
    const search = chatInput.slice(1).trim().toLowerCase();
    if (!search) return availableCatalogTools;
    return availableCatalogTools.filter((t) =>
      t.label.toLowerCase().includes(search) ||
      t.displayName.toLowerCase().includes(search) ||
      t.category.toLowerCase().includes(search)
    );
  }, [chatInput, availableCatalogTools]);

  const handleToolCommandClick = useCallback(
    (rawCmd) => {
      setShowSlashMenu(false);
      setChatInput('');

      if (!rawCmd) return;

      let tool = null;
      if (typeof rawCmd === 'object' && rawCmd.label) {
        tool = rawCmd;
      } else {
        const normalized = String(rawCmd).trim().toLowerCase();
        const cleanCmd = normalized.startsWith('/') ? normalized : `/${normalized}`;
        tool = availableCatalogTools.find(
          (t) =>
            t.label.toLowerCase() === cleanCmd ||
            t.label.toLowerCase() === normalized ||
            t.id.toLowerCase() === normalized ||
            t.displayName.toLowerCase() === normalized
        );
      }

      if (!tool) {
        handleSendMatrixChat(String(rawCmd));
        return;
      }

      // 1. Aislar de forma reactiva e inmediata en la tabla matriz
      if (tool.label === '/todos') {
        setMcpActiveSkuFilter(null);
        setSelectedTypologyFilter('');
      } else if (Array.isArray(tool.skus) && tool.skus.length > 0) {
        setMcpActiveSkuFilter({
          label: tool.filterLabel || tool.displayName || tool.label,
          targetCol: tool.targetCol || null,
          skuSet: new Set(tool.skus)
        });
        if (tool.category === 'Tipologías de Producto') {
          setSelectedTypologyFilter(tool.displayName);
        }
      }

      // 2. Disparar a Alysa
      handleSendMatrixChat(
        tool.prompt,
        tool.skus,
        tool.filterLabel || tool.displayName || tool.label,
        tool.targetCol
      );
    },
    [availableCatalogTools, handleSendMatrixChat]
  );

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Líneas del XML crudo para el visor de código
  const xmlLines = useMemo(() => {
    if (!xmlContent) return [];
    const lines = xmlContent.split('\n');
    if (!xmlSearchTerm.trim()) {
      return lines.map((l, i) => ({ num: i + 1, text: l, matched: false }));
    }
    const q = xmlSearchTerm.toLowerCase();
    return lines.map((l, i) => ({
      num: i + 1,
      text: l,
      matched: l.toLowerCase().includes(q)
    }));
  }, [xmlContent, xmlSearchTerm]);

  if (loading) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-6 ${isDarkMode ? 'bg-[#09090b] text-zinc-300' : 'bg-slate-50 text-slate-700'}`}>
        <RefreshCw size={24} className="animate-spin text-zinc-400 mb-3" />
        <h3 className="text-sm font-bold tracking-tight">Cargando xml_actualizer_raw...</h3>
        <p className="text-xs text-zinc-500 mt-1">Recuperando el árbol XML certificado y estructurando la matriz de inspección.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-6 text-center ${isDarkMode ? 'bg-[#09090b] text-zinc-300' : 'bg-slate-50 text-slate-700'}`}>
        <AlertCircle size={32} className="text-amber-500 mb-2" />
        <h3 className="text-sm font-bold">No se pudo cargar el XML certificado</h3>
        <p className="text-xs text-zinc-500 max-w-md mt-1 mb-4">{error}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={loadCertifiedXml}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold border cursor-pointer ${
              isDarkMode ? 'bg-white text-zinc-950 border-white hover:bg-zinc-200' : 'bg-[#18181b] text-white border-[#18181b] hover:bg-zinc-800'
            }`}
          >
            <RefreshCw size={12} /> Reintentar
          </button>
          <button
            onClick={onBack}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold border cursor-pointer ${
              isDarkMode ? 'bg-white/10 hover:bg-white/15 text-white border-white/15' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
            }`}
          >
            <ArrowLeft size={12} /> Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col font-sans antialiased select-none ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
      {/* ── CONTENEDOR PRINCIPAL DIVIDIDO (IDÉNTICO A EXPORT DATA CLIENT): IZQUIERDA TABLA / DERECHA CHAT ALYSA RESIZABLE ── */}
      <div
        ref={splitContainerRef}
        className="flex-1 w-full min-h-0 flex flex-col lg:flex-row overflow-hidden relative"
      >
        {/* Overlay invisible durante el resize */}
        {isResizingChat && (
          <div className="fixed inset-0 z-[9999] cursor-col-resize select-none" />
        )}

        {/* ── COLUMNA IZQUIERDA: HERRAMIENTAS, TABLA INTERACTIVA O VISOR XML (IDÉNTICO EN ANCHO Y ESTILOS) ── */}
        <div
          style={isLgScreen ? { width: `${100 - chatWidthPercent}%` } : undefined}
          className="w-full min-w-0 h-full flex flex-col overflow-hidden"
        >
          {/* ── SUB-BARRA DE HERRAMIENTAS: BÚSQUEDA, FILTROS Y ACCIONES (OCUPA EL 100% HASTA EL CHAT) ── */}
          <div
            className={`w-full min-w-full flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b backdrop-blur-md ${
              isDarkMode ? 'bg-zinc-950/70 border-white/10' : 'bg-white/90 border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {/* Buscador inteligente */}
              <div className="relative flex items-center">
                <Search size={11} className={`absolute left-2.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'} pointer-events-none`} />
                <input
                  type="text"
                  placeholder="Buscar por Model #, descripción o tipo (mesas, sillas)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`rounded-md pl-7 pr-6 py-1 text-[10.5px] w-[180px] sm:w-[245px] focus:outline-none border transition-all ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/30 focus:bg-white/10'
                      : 'bg-slate-100/80 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white'
                  }`}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>

              {/* Pestañas de filtro de estado */}
              {viewMode === 'matrix' && (
                <div className={`flex items-center border rounded-md overflow-hidden ${
                  isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer ${
                      filterMode === 'all'
                        ? isDarkMode
                          ? 'bg-white text-zinc-950 font-bold'
                          : 'bg-[#18181b] text-white font-bold'
                        : isDarkMode
                          ? 'text-zinc-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos ({rows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('configurable')}
                    className={`px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer border-l ${
                      isDarkMode ? 'border-white/10' : 'border-slate-200'
                    } ${
                      filterMode === 'configurable'
                        ? isDarkMode
                          ? 'bg-white text-zinc-950 font-bold'
                          : 'bg-[#18181b] text-white font-bold'
                        : isDarkMode
                          ? 'text-zinc-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Configurables ({rows.filter((r) => r._optionsCount > 0).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('base')}
                    className={`px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer border-l ${
                      isDarkMode ? 'border-white/10' : 'border-slate-200'
                    } ${
                      filterMode === 'base'
                        ? isDarkMode
                          ? 'bg-white text-zinc-950 font-bold'
                          : 'bg-[#18181b] text-white font-bold'
                        : isDarkMode
                          ? 'text-zinc-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Base ({rows.filter((r) => !r._optionsCount || r._optionsCount === 0).length})
                  </button>
                </div>
              )}

              {/* Indicador de filtro activo ejecutado por MCP o Tipología */}
              {mcpActiveSkuFilter && (
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 border rounded-md text-[9.5px] font-mono select-none ${
                    isDarkMode
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-slate-900 text-white border-slate-900'
                  }`}
                >
                  <Sparkles size={10} className={`${isDarkMode ? 'text-zinc-300' : 'text-zinc-200'} shrink-0`} />
                  <span>Filtro activo: {mcpActiveSkuFilter.label}</span>
                  {mcpActiveSkuFilter.targetCol && (
                    <span className="opacity-80">
                      · Columna: <strong className="underline underline-offset-2">{mcpActiveSkuFilter.targetCol}</strong>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMcpActiveSkuFilter(null);
                      setSelectedFamilyFilter('');
                      setSelectedTypologyFilter('');
                    }}
                    className="ml-0.5 opacity-70 hover:opacity-100 cursor-pointer"
                    title="Quitar filtro de la tabla"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>

            {/* Acciones de la barra: Switch Vista Matriz / Código XML, Descargar XML, Exportar Excel y Volver */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Botón Switch Modo de Vista */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'matrix' ? 'xml' : 'matrix')}
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
                title={viewMode === 'matrix' ? 'Ver código XML sin procesar' : 'Ver matriz visual de productos'}
              >
                {viewMode === 'matrix' ? <Code2 size={11} /> : <Table size={11} />}
                <span>{viewMode === 'matrix' ? 'Ver Código XML' : 'Ver Matriz'}</span>
              </button>

              {/* Botón Descargar XML oficial */}
              <button
                type="button"
                onClick={handleDownloadXml}
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
                title="Descargar archivo XML certificado"
              >
                <Download size={11} />
                <span>Descargar .xml</span>
              </button>

              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-white/5 hover:bg-white/15 text-zinc-300 border-white/15'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Volver al proceso principal"
                >
                  <ArrowLeft size={11} />
                  <span className="hidden sm:inline">Volver</span>
                </button>
              )}
            </div>
          </div>

          {/* BANNER DE AVISO SI ES FALLBACK */}
          {isFallbackXml && (
            <div className={`w-full px-3 py-1.5 text-[10px] font-mono flex items-center justify-between border-b ${
              isDarkMode ? 'bg-amber-500/10 text-amber-200 border-amber-500/20' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                <Info size={12} className="shrink-0" />
                <span>Catálogo base original mostrado. Ejecuta <strong>/executeProcess</strong> para generar la versión certificada.</span>
              </div>
            </div>
          )}

          {/* ── CUERPO: TABLA MATRICIAL VIRTUALIZADA O VISOR DE CÓDIGO XML ── */}
          {viewMode === 'matrix' ? (
            <div
              ref={tableContainerRef}
              onScroll={handleTableScroll}
              className={`flex-1 min-h-0 w-full overflow-auto custom-scrollbar relative ${
                isDarkMode ? 'bg-transparent' : 'bg-white/40'
              }`}
            >
              {filteredRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Table size={28} className="opacity-30 mb-2" />
                  <p className="text-xs font-semibold opacity-70">No hay productos que coincidan con los filtros aplicados</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setMcpActiveSkuFilter(null);
                      setSelectedTypologyFilter('');
                      setSelectedFamilyFilter('');
                      setFilterMode('all');
                    }}
                    className={`mt-2 px-2.5 py-1 rounded text-[10px] font-semibold border cursor-pointer ${
                      isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white hover:bg-slate-100 border-slate-300'
                    }`}
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                <table className="w-full border-collapse text-left font-mono text-[10.5px]">
                  <thead
                    className={`sticky top-0 z-20 backdrop-blur-md border-b select-none ${
                      isDarkMode
                        ? 'bg-[#09090b]/95 border-white/10 text-zinc-300'
                        : 'bg-white/95 border-slate-200 text-slate-700'
                    }`}
                  >
                    <tr>
                      <th className="py-2 px-2.5 text-[9.5px] font-bold uppercase tracking-wider text-center w-10 border-r border-transparent">
                        #
                      </th>
                      {headers.map((h, colIdx) => (
                        <th
                          key={h}
                          className={`py-2 px-3 text-[9.5px] font-bold uppercase tracking-wider border-r border-transparent ${
                            h === 'List Price' || !BASE_HEADERS.includes(h) ? 'text-right' : 'text-left'
                          } ${colIdx < 5 ? 'font-sans' : 'font-mono text-zinc-400'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {virtualWindow.topSpacerHeight > 0 && (
                      <tr aria-hidden="true" style={{ height: `${virtualWindow.topSpacerHeight}px` }}>
                        <td colSpan={headers.length + 1} className="p-0 border-0" />
                      </tr>
                    )}

                    {virtualWindow.visibleRows.map((row, idx) => {
                      const globalRowIdx = virtualWindow.startIdx + idx + 1;
                      const isEven = globalRowIdx % 2 === 0;

                      return (
                        <tr
                          key={row['Model #'] || globalRowIdx}
                          className={`border-b transition-colors ${
                            isEven
                              ? isDarkMode ? 'bg-white/[0.015]' : 'bg-slate-50/60'
                              : 'bg-transparent'
                          } ${
                            isDarkMode ? 'border-white/5 hover:bg-white/[0.04]' : 'border-slate-100 hover:bg-slate-100/70'
                          }`}
                          style={{ height: `${ROW_HEIGHT}px` }}
                        >
                          {/* Columna de numeración */}
                          <td className="py-1.5 px-2 text-center text-[9px] text-zinc-500 font-mono select-none">
                            {globalRowIdx}
                          </td>

                          {/* Celdas de datos en modo solo lectura */}
                          {headers.map((colKey) => {
                            const val = row[colKey];
                            const isPrice = colKey === 'List Price' || !BASE_HEADERS.includes(colKey);
                            const isModel = colKey === 'Model #';

                            let displayVal = val !== undefined && val !== null ? String(val) : '';
                            if (isPrice && displayVal !== '' && !Number.isNaN(Number(displayVal)) && Number(displayVal) > 0) {
                              displayVal = `$${Number(displayVal).toLocaleString('en-US', { minimumFractionDigits: Number(displayVal) % 1 === 0 ? 0 : 2 })}`;
                            }

                            return (
                              <td
                                key={colKey}
                                className={`py-1.5 px-3 truncate ${
                                  isPrice ? 'text-right font-mono' : 'text-left font-sans'
                                } ${
                                  isModel
                                    ? isDarkMode ? 'font-bold text-white font-mono' : 'font-bold text-slate-900 font-mono'
                                    : colKey === 'List Price'
                                    ? 'text-emerald-400 font-semibold'
                                    : isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                                }`}
                                title={String(val || '')}
                              >
                                {displayVal || '---'}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}

                    {virtualWindow.bottomSpacerHeight > 0 && (
                      <tr aria-hidden="true" style={{ height: `${virtualWindow.bottomSpacerHeight}px` }}>
                        <td colSpan={headers.length + 1} className="p-0 border-0" />
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            /* VISTA DE CÓDIGO XML CRUDO */
            <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
              <div className={`px-3 py-1.5 border-b flex items-center justify-between text-[10.5px] ${
                isDarkMode ? 'bg-zinc-950/70 border-white/10 text-zinc-400' : 'bg-white/90 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <Search size={11} className="absolute left-2.5 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar en XML..."
                      value={xmlSearchTerm}
                      onChange={(e) => setXmlSearchTerm(e.target.value)}
                      className={`rounded-md pl-7 pr-2.5 py-0.5 text-[10px] w-[180px] border transition-colors focus:outline-none ${
                        isDarkMode
                          ? 'bg-zinc-900 border-white/15 text-white placeholder:text-zinc-500 focus:border-white/30'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-400'
                      }`}
                    />
                  </div>
                  <span className="font-mono text-[9.5px]">
                    {xmlLines.length} líneas · {(xmlContent.length / 1024).toFixed(1)} KB
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyXml}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                    copiedXml
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : isDarkMode
                        ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  {copiedXml ? <Check size={11} /> : <Copy size={11} />}
                  <span>{copiedXml ? 'Copiado' : 'Copiar XML'}</span>
                </button>
              </div>

              <div className={`flex-1 overflow-auto font-mono text-[11px] leading-5 p-3 custom-scrollbar ${
                isDarkMode ? 'bg-[#060608] text-zinc-300' : 'bg-slate-900 text-slate-200'
              }`}>
                {xmlLines.map((line) => (
                  <div
                    key={line.num}
                    className={`flex items-start ${
                      line.matched ? (isDarkMode ? 'bg-amber-500/20' : 'bg-amber-500/30') : ''
                    }`}
                  >
                    <span className="w-12 text-right pr-4 text-zinc-600 select-none shrink-0 font-mono text-[10px]">
                      {line.num}
                    </span>
                    <pre className="whitespace-pre overflow-x-visible font-mono">
                      {line.text}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── BARRA DE ESTADO INFERIOR (IDÉNTICA A EXPORT DATA CLIENT) ── */}
          <div
            className={`w-full flex items-center justify-between py-1.5 px-3 bg-transparent border-t text-[10px] font-medium select-none ${
              isDarkMode ? 'border-white/10 text-zinc-400' : 'border-slate-200 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>
                Cols: <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{headers.length}</strong>
              </span>
              <span className={isDarkMode ? 'text-white/20' : 'text-slate-300'}>•</span>
              <span>
                Showing <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{filteredRows.length}</strong> of{' '}
                <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{rows.length}</strong> rows
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[9.5px] opacity-80">
              <span>
                {filteredRows.length > 0
                  ? `${virtualWindow.startIdx + 1}–${virtualWindow.endIdx} rendered`
                  : '0 rendered'}
              </span>
            </div>
          </div>
        </div>

        {/* ── SEPARADOR INTERACTIVO ARRASTRABLE (SPLITTER REDIMENSIONABLE HASTA 50VW) ── */}
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={handleStartResize}
          onDoubleClick={handleResetResize}
          className={`hidden lg:flex flex-col items-center justify-center w-2 relative z-30 shrink-0 cursor-col-resize select-none group transition-colors ${
            isResizingChat
              ? isDarkMode ? 'bg-white/10' : 'bg-slate-300'
              : isDarkMode ? 'bg-transparent hover:bg-white/5' : 'bg-transparent hover:bg-slate-100'
          }`}
          title="Arrastra para redimensionar el panel de Alysa (hasta 50vw). Doble clic para restablecer (28%)."
        >
          <div
            className={`w-px h-full transition-colors ${
              isResizingChat
                ? isDarkMode ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'bg-zinc-900'
                : isDarkMode ? 'bg-white/10 group-hover:bg-white/30' : 'bg-slate-200 group-hover:bg-slate-400'
            }`}
          />
          <div
            className={`absolute w-1 h-9 rounded-full transition-all duration-150 pointer-events-none ${
              isResizingChat
                ? isDarkMode ? 'bg-white scale-y-125' : 'bg-zinc-950 scale-y-125'
                : isDarkMode
                  ? 'bg-zinc-600 group-hover:bg-zinc-300'
                  : 'bg-slate-400 group-hover:bg-slate-700'
            }`}
          />
        </div>

        {/* ── COLUMNA DERECHA: INTERFAZ DE CHAT ALYSA (IDÉNTICO A EXPORT DATA CLIENT, MODO LECTURA Y FILTROS) ── */}
        <aside
          style={isLgScreen ? { width: `${chatWidthPercent}%` } : undefined}
          className={`w-full shrink-0 h-[340px] lg:h-full border-t lg:border-t-0 flex flex-col overflow-hidden relative ${
            isDarkMode ? 'bg-transparent' : 'bg-white/60'
          }`}
        >
          {/* Área de mensajes con scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-4 space-y-3.5 custom-scrollbar select-text cursor-text">
            {/* Mensaje de bienvenida oficial con el avatar SVG de Alysa */}
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 flex items-center justify-center pt-0.5">
                <svg
                  viewBox="60 180 870 640"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 flex-shrink-0 drop-shadow-sm"
                >
                  <rect x="593" y="197" width="153" height="149" rx="32" fill={isDarkMode ? '#d4d4d8' : '#27272a'} />
                  <rect x="766" y="232" width="106" height="101" rx="22" fill="#a1a1aa" />
                  <rect x="740" y="350" width="176" height="174" rx="36" fill={isDarkMode ? '#ffffff' : '#18181b'} />
                  <path
                    d="M 353 202 L 340 221 L 223 471 L 72 773 L 69 784 L 72 795 L 88 805 L 258 805 L 269 801 L 278 791 L 440 452 L 445 449 L 527 606 L 389 608 L 383 611 L 375 626 L 371 697 L 377 706 L 567 707 L 581 718 L 621 793 L 629 801 L 640 805 L 840 804 L 847 799 L 852 789 L 849 776 L 702 542 L 590 356 L 506 205 L 491 197 L 365 197 Z"
                    fill={isDarkMode ? '#ffffff' : '#18181b'}
                  />
                </svg>
              </div>

              <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                <div className="flex items-baseline gap-1.5 px-0.5">
                  <span className={`text-[10px] font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Alysa
                  </span>
                  <span className={`text-[9px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                    xml_actualizer_raw + RAG (Modo Lectura)
                  </span>
                </div>

                <div
                  className={`p-3 border rounded-xl text-[11px] leading-relaxed space-y-2 shadow-sm ${
                    isDarkMode
                      ? 'bg-[#09090b]/80 border-white/10 text-zinc-300 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                      : 'bg-white border-slate-200 text-gray-700 shadow-xs'
                  }`}
                >
                  <p>
                    Bienvenido al visor certificado del archivo <code className={`px-1 py-0.5 text-[10px] font-mono border ${isDarkMode ? 'bg-white/5 border-white/10 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>xml_actualizer_raw</code>. Estoy conectada para asistirte con filtros y consultas de inspección sobre el catálogo final para CET Designer.
                  </p>

                  <div className={`pt-2 border-t text-[10px] font-mono leading-relaxed ${isDarkMode ? 'border-white/10 text-zinc-400' : 'border-slate-200 text-slate-600'}`}>
                    Escribe <strong className={`font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>/</strong> en el chat para desplegar la paleta de herramientas de inspección por tipología, recargo u opciones XML.
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de mensajes dinámicos */}
            {chatMessages.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div
                      className={`max-w-[88%] px-3 py-2 border rounded-xl text-[11px] leading-relaxed ${
                        isDarkMode
                          ? 'bg-white text-zinc-950 border-white font-medium'
                          : 'bg-[#18181b] text-white border-[#18181b] font-medium'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 flex items-center justify-center pt-0.5">
                    <svg
                      viewBox="60 180 870 640"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 flex-shrink-0 drop-shadow-sm"
                    >
                      <rect x="593" y="197" width="153" height="149" rx="32" fill={isDarkMode ? '#d4d4d8' : '#27272a'} />
                      <rect x="766" y="232" width="106" height="101" rx="22" fill="#a1a1aa" />
                      <rect x="740" y="350" width="176" height="174" rx="36" fill={isDarkMode ? '#ffffff' : '#18181b'} />
                      <path
                        d="M 353 202 L 340 221 L 223 471 L 72 773 L 69 784 L 72 795 L 88 805 L 258 805 L 269 801 L 278 791 L 440 452 L 445 449 L 527 606 L 389 608 L 383 611 L 375 626 L 371 697 L 377 706 L 567 707 L 581 718 L 621 793 L 629 801 L 640 805 L 840 804 L 847 799 L 852 789 L 849 776 L 702 542 L 590 356 L 506 205 L 491 197 L 365 197 Z"
                        fill={isDarkMode ? '#ffffff' : '#18181b'}
                      />
                    </svg>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                    <div className="flex items-baseline justify-between gap-1.5 px-0.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-[10px] font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          Alysa
                        </span>
                        <span className={`text-[9px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`p-3 border rounded-xl text-[11px] leading-relaxed space-y-2 shadow-sm overflow-x-auto ${
                        isDarkMode
                          ? 'bg-[#09090b]/80 border-white/10 text-zinc-300 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                          : 'bg-white border-slate-200 text-gray-700 shadow-xs'
                      }`}
                    >
                      <div className="prose prose-xs max-w-none text-[10.5px] leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const text = String(children).trim();
                              if (inline && text.startsWith('/')) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleToolCommandClick(text)}
                                    className={`alysa-cmd-btn font-mono font-bold px-1.5 py-0.5 rounded text-[10px] mx-0.5 transition-all inline-flex items-center gap-1 cursor-pointer border ${
                                      isDarkMode
                                        ? 'bg-white/10 hover:bg-white text-zinc-100 hover:text-zinc-950 border-white/20'
                                        : 'bg-zinc-100 hover:bg-zinc-900 text-zinc-800 hover:text-white border-zinc-300'
                                    }`}
                                    title={`Ejecutar herramienta ${text}`}
                                  >
                                    <span>{text}</span>
                                  </button>
                                );
                              }
                              return (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            a({ node, href, children, ...props }) {
                              if (href && href.startsWith('/')) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleToolCommandClick(href)}
                                    className="alysa-cmd-btn font-mono font-bold underline cursor-pointer mx-0.5"
                                  >
                                    {children}
                                  </button>
                                );
                              }
                              return <a href={href} {...props}>{children}</a>;
                            }
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>

                      {Array.isArray(msg.matchedSkus) && msg.matchedSkus.length > 0 && (
                        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const targetLabel = msg.filterLabel || `${msg.matchedSkus.length} SKUs`;
                              if (mcpActiveSkuFilter?.label === targetLabel) {
                                setMcpActiveSkuFilter(null);
                              } else {
                                setMcpActiveSkuFilter({
                                  label: targetLabel,
                                  targetCol: msg.targetCol || null,
                                  skuSet: new Set(msg.matchedSkus)
                                });
                              }
                            }}
                            className={`px-2 py-0.5 text-[9.5px] font-mono border rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                              mcpActiveSkuFilter?.label === (msg.filterLabel || `${msg.matchedSkus.length} SKUs`)
                                ? isDarkMode
                                  ? 'bg-white text-zinc-950 border-white shadow-sm font-bold'
                                  : 'bg-zinc-900 text-white border-zinc-900 shadow-sm font-bold'
                                : isDarkMode
                                  ? 'bg-white/5 text-zinc-300 border-white/10 hover:text-white hover:bg-white/10'
                                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:text-black hover:bg-zinc-200'
                            }`}
                          >
                            {mcpActiveSkuFilter?.label === (msg.filterLabel || `${msg.matchedSkus.length} SKUs`) ? (
                              <>
                                <Check size={10} className="shrink-0 text-white" />
                                <span>Filtro activo en tabla ({msg.matchedSkus.length} SKUs) · Quitar</span>
                              </>
                            ) : (
                              <>
                                <Filter size={10} className="shrink-0" />
                                <span>Aislar en tabla ({msg.matchedSkus.length} SKUs)</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isChatLoading && (
              <div className="flex items-center gap-2 text-zinc-400 text-[10px] pl-8">
                <RefreshCw size={11} className="animate-spin text-zinc-400" />
                <span className="font-mono">Alysa procesando consulta en xml_actualizer_raw...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* ── BARRA INFERIOR DE INPUT DE CHAT (IDÉNTICA A EXPORT DATA CLIENT) ── */}
          <div
            className={`p-2.5 border-t relative z-10 backdrop-blur-md ${
              isDarkMode ? 'bg-[#09090b]/80 border-white/10' : 'bg-white/90 border-slate-200'
            }`}
          >
            {/* Paleta flotante de Slash Commands cuando el usuario escribe '/' */}
            <AnimatePresence>
              {showSlashMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className={`absolute bottom-[calc(100%+8px)] left-2.5 right-2.5 mx-auto ${
                    isDarkMode
                      ? 'bg-[#09090b]/95 border-white/[0.14] text-white shadow-[0_16px_40px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                      : 'bg-white/95 border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.08)] text-slate-800'
                  } backdrop-blur-2xl border rounded-xl z-50 overflow-hidden`}
                >
                  <div className="p-2 max-h-[290px] overflow-y-auto custom-scrollbar">
                    {filteredSlashCommands.length === 0 ? (
                      <div className="py-3 px-3 text-center text-[10px] font-mono opacity-60">
                        No se encontraron herramientas con &quot;{chatInput}&quot;
                      </div>
                    ) : (
                      Object.entries(
                        filteredSlashCommands.reduce((acc, cmd) => {
                          const cat = cmd.category || 'Otras Herramientas';
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(cmd);
                          return acc;
                        }, {})
                      ).map(([category, commands]) => {
                        const isExpanded = expandedSlashCategory === null || expandedSlashCategory === category;
                        return (
                          <div key={category} className="mb-2 last:mb-0">
                            <button
                              type="button"
                              onClick={() => setExpandedSlashCategory(expandedSlashCategory === category ? '' : category)}
                              className={`w-full flex items-center justify-between px-2 py-1 text-left rounded cursor-pointer transition-colors ${
                                isDarkMode ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span className="text-[9.5px] font-bold uppercase tracking-wider">
                                {category} ({commands.length})
                              </span>
                              <ChevronDown
                                size={11}
                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </button>

                            {isExpanded && (
                              <div className="mt-1 space-y-0.5">
                                {commands.map((cmd) => {
                                  const IconComp = cmd.icon || Sparkles;
                                  return (
                                    <button
                                      key={cmd.id}
                                      type="button"
                                      onClick={() => handleToolCommandClick(cmd)}
                                      className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer group ${
                                        isDarkMode
                                          ? 'hover:bg-white/10 text-zinc-200 hover:text-white'
                                          : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className={`p-1 rounded ${isDarkMode ? 'bg-white/5 text-zinc-300' : 'bg-slate-100 text-slate-600'}`}>
                                          <IconComp size={11} />
                                        </div>
                                        <div className="truncate">
                                          <span className="text-[11px] font-mono font-bold">{cmd.label}</span>
                                          <span className="mx-1.5 opacity-40">·</span>
                                          <span className="text-[10px] opacity-80">{cmd.displayName}</span>
                                        </div>
                                      </div>
                                      <span
                                        className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                          isDarkMode ? 'bg-white/5 text-zinc-400' : 'bg-slate-100 text-slate-500'
                                        }`}
                                      >
                                        {cmd.desc}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatInput.startsWith('/')) {
                  const match =
                    availableCatalogTools.find(
                      (t) => t.label.toLowerCase() === chatInput.trim().toLowerCase()
                    ) || filteredSlashCommands[0];
                  if (match) {
                    handleToolCommandClick(match);
                    return;
                  }
                }
                handleSendMatrixChat();
              }}
              className="flex items-center gap-1.5"
            >
              <div className="flex items-center gap-1 text-zinc-400">
                <button
                  type="button"
                  title="Filtros por voz no disponibles"
                  className="p-1 rounded hover:text-zinc-200 opacity-50 cursor-not-allowed"
                >
                  <Mic size={13} />
                </button>
                <button
                  type="button"
                  title="Adjuntar archivo deshabilitado en modo lectura"
                  className="p-1 rounded hover:text-zinc-200 opacity-50 cursor-not-allowed"
                >
                  <Paperclip size={13} />
                </button>
              </div>

              <input
                type="text"
                placeholder="Escribe / para ver herramientas, o filtra productos..."
                value={chatInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setChatInput(val);
                  if (val.startsWith('/')) {
                    setShowSlashMenu(true);
                  } else {
                    setShowSlashMenu(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSlashMenu(false);
                  }
                }}
                disabled={isChatLoading}
                className={`flex-1 min-w-0 text-[11px] px-3 py-1.5 rounded-lg border transition-all focus:outline-none ${
                  isDarkMode
                    ? 'bg-white/5 border-white/15 text-white placeholder:text-zinc-500 focus:border-white/30 focus:bg-white/10'
                    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white'
                }`}
              />

              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  chatInput.trim() && !isChatLoading
                    ? isDarkMode
                      ? 'bg-white text-zinc-950 border-white hover:bg-zinc-200'
                      : 'bg-[#18181b] text-white border-[#18181b] hover:bg-zinc-800'
                    : 'opacity-40 cursor-not-allowed border-transparent text-zinc-500'
                }`}
              >
                <SendHorizonal size={12} />
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
