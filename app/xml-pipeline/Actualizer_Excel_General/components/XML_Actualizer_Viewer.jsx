'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  supabase,
  resolveStorageContent
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
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import AlysaWordmark from '@/app/xml-pipeline/Actualizer_XML_General/components/comparePDF/REPORT/components/AlysaWordmark';
import { applyExcelVisualStyling } from './XML_Results_General.jsx';
import { getProductTypology, PRODUCT_TYPOLOGY_RULES } from './Catalog_Editor_General.jsx';

const BASE_HEADERS = ["Model #", "List Price", "Weight", "Classic/ Premium", "Model Name"];

const ROW_HEIGHT = 38;
const OVERSCAN = 12;

// Formateador de moneda profesional
const formatCurrency = (val) => {
  if (val === undefined || val === null || val === '') return '---';
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(num);
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
  
  // Datos matriciales extraídos del XML
  const [matrixHeaders, setMatrixHeaders] = useState(BASE_HEADERS);
  const [optionColumns, setOptionColumns] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Modos de visualización: 'matrix' | 'xml'
  const [viewMode, setViewMode] = useState('matrix');
  
  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [xmlSearchTerm, setXmlSearchTerm] = useState('');
  const [selectedTypology, setSelectedTypology] = useState('ALL');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeFilterBadge, setActiveFilterBadge] = useState(null);
  const [filteredSkusSet, setFilteredSkusSet] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  // Copia de XML al portapapeles
  const [copiedXml, setCopiedXml] = useState(false);
  
  // Panel de Alysa Copilot (Solo Lectura / Filtros)
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState([
    {
      id: 'init-msg',
      from: 'alysa',
      text: 'Visualizador del archivo **xml_actualizer_raw** certificado para CET Designer. Este panel opera en modo lectura e inspección. Puedes solicitar filtros por tipología ("filtra sillas", "mesas"), rango de precios o buscar modelos específicos.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const chatBottomRef = useRef(null);

  // Virtualización de la tabla
  const tableContainerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);
  const scrollRafRef = useRef(null);

  // Cargar xml_actualizer_raw desde Supabase
  const loadCertifiedXml = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: record, error: dbErr } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .select('id, xml_actualizer_raw, XM_CET_import, xml_raw, xml_name, file_name, created_at')
        .eq('company_name', 'General_Procces')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbErr) throw new Error(dbErr.message);
      if (!record) {
        throw new Error('No se encontró registro del catálogo en la base de datos.');
      }

      const name = (record.xml_name || record.file_name || 'Catalog').replace(/\.xml$/i, '').trim();
      setCatalogName(name);

      let rawXmlSource = record.xml_actualizer_raw;
      let usedFallback = false;

      if (!rawXmlSource || !String(rawXmlSource).trim()) {
        rawXmlSource = record.XM_CET_import || record.xml_raw;
        usedFallback = true;
      }

      if (!rawXmlSource || !String(rawXmlSource).trim()) {
        throw new Error('No existe ningún archivo XML (ni xml_actualizer_raw, XM_CET_import ni xml_raw) disponible.');
      }

      setIsFallbackXml(usedFallback);

      // Resolver contenido si es [STORAGE_URL]: o http
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

  // Parsear XML a matriz de productos de CET Designer
  const parseXmlToMatrix = (xmlText) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'application/xml');

      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        throw new Error('Fallo al parsear estructura XML: ' + parseError.textContent.slice(0, 100));
      }

      // 1. Extraer características y opciones globales
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

      // 2. Extraer todos los productos
      const productNodes = Array.from(doc.getElementsByTagName('Product'));
      if (productNodes.length === 0) {
        setProducts([]);
        setMatrixHeaders(BASE_HEADERS);
        return;
      }

      // 3. Mapear columnas dinámicas de recargo
      const dynamicColumnsMap = new Map();
      const parsedProducts = [];

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

        parsedProducts.push({
          sku,
          modelName: description,
          listPrice,
          weight,
          classification,
          typology,
          optionPrices,
          optionsCount: Object.keys(optionPrices).length
        });
      }

      const dynCols = Array.from(dynamicColumnsMap.keys()).sort();
      const allHeaders = [...BASE_HEADERS, ...dynCols];

      setOptionColumns(dynCols);
      setMatrixHeaders(allHeaders);
      setProducts(parsedProducts);
    } catch (e) {
      console.warn('[-] Error en parseXmlToMatrix:', e);
      setError('Error al procesar el archivo XML a matriz: ' + e.message);
    }
  };

  // Estadísticas del catálogo
  const stats = useMemo(() => {
    if (!products || products.length === 0) {
      return { total: 0, avgPrice: 0, minPrice: 0, maxPrice: 0, configurable: 0, typologies: {} };
    }
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    let configurable = 0;
    const typologies = {};

    products.forEach((p) => {
      const price = Number(p.listPrice) || 0;
      sum += price;
      if (price < min) min = price;
      if (price > max) max = price;
      if (p.optionsCount > 0) configurable++;

      const t = p.typology || 'Otros';
      typologies[t] = (typologies[t] || 0) + 1;
    });

    return {
      total: products.length,
      avgPrice: sum / products.length,
      minPrice: min === Infinity ? 0 : min,
      maxPrice: max === -Infinity ? 0 : max,
      configurable,
      typologies
    };
  }, [products]);

  // Filas filtradas
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filtro por SKUs aislados (desde Alysa o facetas)
    if (filteredSkusSet) {
      result = result.filter((p) => filteredSkusSet.has(p.sku));
    }

    // Filtro por tipología
    if (selectedTypology && selectedTypology !== 'ALL') {
      result = result.filter((p) => p.typology === selectedTypology);
    }

    // Filtro por rango de precio
    if (priceRange.min !== '') {
      const minVal = parseFloat(priceRange.min);
      if (!Number.isNaN(minVal)) {
        result = result.filter((p) => (Number(p.listPrice) || 0) >= minVal);
      }
    }
    if (priceRange.max !== '') {
      const maxVal = parseFloat(priceRange.max);
      if (!Number.isNaN(maxVal)) {
        result = result.filter((p) => (Number(p.listPrice) || 0) <= maxVal);
      }
    }

    // Búsqueda en texto
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.sku.toLowerCase().includes(q) ||
          p.modelName.toLowerCase().includes(q) ||
          (p.typology && p.typology.toLowerCase().includes(q))
      );
    }

    return result;
  }, [products, filteredSkusSet, selectedTypology, priceRange, searchTerm]);

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

  const virtualWindow = useMemo(() => {
    const total = filteredProducts.length;
    if (total === 0) {
      return { startIdx: 0, endIdx: 0, visibleRows: [], topSpacerHeight: 0, bottomSpacerHeight: 0 };
    }
    const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const endIdx = Math.min(total, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN);

    return {
      startIdx,
      endIdx,
      visibleRows: filteredProducts.slice(startIdx, endIdx),
      topSpacerHeight: startIdx * ROW_HEIGHT,
      bottomSpacerHeight: Math.max(0, (total - endIdx) * ROW_HEIGHT)
    };
  }, [filteredProducts, scrollTop, viewportHeight]);

  // Copiar XML completo
  const handleCopyXml = async () => {
    if (!xmlContent) return;
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopiedXml(true);
      setTimeout(() => setCopiedXml(false), 2000);
    } catch (_) {}
  };

  // Descargar archivo .xml
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
        companyName: 'General_Procces',
        eventType: 'DOWNLOAD_RESULT_XML',
        title: 'Descarga XML Certificado desde Visor',
        description: `El usuario descargó el archivo XML actualizado '${catalogName}-xml_actualizer_raw.xml'.`
      });
    } catch (e) {
      alert('Error descargando archivo XML: ' + e.message);
    }
  };

  // Exportar matriz a Excel (.xlsx)
  const handleExportExcel = () => {
    if (!filteredProducts || filteredProducts.length === 0) {
      alert('No hay productos para exportar.');
      return;
    }
    try {
      const rowsForExcel = filteredProducts.map((p) => {
        const row = {
          'Model #': p.sku,
          'List Price': p.listPrice,
          'Weight': p.weight,
          'Classic/ Premium': p.classification,
          'Model Name': p.modelName
        };
        optionColumns.forEach((col) => {
          row[col] = p.optionPrices[col] || '';
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(rowsForExcel, { header: matrixHeaders });
      worksheet['!cols'] = matrixHeaders.map((h, idx) => {
        if (idx === 0) return { wch: 16 };
        if (idx === 1) return { wch: 14 };
        if (idx === 2) return { wch: 12 };
        if (idx === 3) return { wch: 18 };
        if (idx === 4) return { wch: 38 };
        return { wch: Math.max(String(h || '').length + 5, 15) };
      });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Certified Matrix');

      const rawBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      let finalBytes = rawBuffer;
      try {
        finalBytes = applyExcelVisualStyling(rawBuffer);
      } catch (_) {}

      const blob = new Blob([finalBytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${catalogName}-Certified-Matrix.xlsx`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 150);
    } catch (e) {
      alert('Error exportando matriz: ' + e.message);
    }
  };

  // Motor de Consultas y Filtros de Alysa (Solo Lectura)
  const handleCopilotSend = () => {
    const rawTxt = copilotInput.trim();
    if (!rawTxt || copilotLoading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      from: 'user',
      text: rawTxt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCopilotMessages((prev) => [...prev, userMsg]);
    setCopilotInput('');
    setCopilotLoading(true);

    setTimeout(() => {
      const q = rawTxt.toLowerCase();
      let reply = '';
      let newFilteredSet = null;
      let badgeLabel = null;

      // Intento de edición detectado: recordatorio de solo lectura
      if (
        q.includes('cambia') ||
        q.includes('sube') ||
        q.includes('baja') ||
        q.includes('actualiza') ||
        q.includes('edita') ||
        q.includes('agrega') ||
        q.includes('elimina') ||
        q.includes('precio a ')
      ) {
        reply = 'Este visor opera en modo de **sola lectura y certificación** para `xml_actualizer_raw`. Para aplicar modificaciones o ajustes por lote, utiliza el **Catalog Matrix Live Editor** en la barra lateral.';
      } else if (q.includes('quitar') || q.includes('limpiar') || q.includes('todos') || q.includes('reset')) {
        setSelectedTypology('ALL');
        setFilteredSkusSet(null);
        setActiveFilterBadge(null);
        setPriceRange({ min: '', max: '' });
        setSearchTerm('');
        reply = `Filtros restablecidos. Mostrando la totalidad de los **${products.length} productos** del XML certificado.`;
      } else if (q.includes('silla') || q.includes('chair') || q.includes('seating')) {
        setSelectedTypology('Sillas');
        const count = stats.typologies['Sillas'] || 0;
        reply = `Filtro activado: **Sillas** (${count} SKUs detectados). Tabla sincronizada en modo lectura.`;
      } else if (q.includes('mesa') || q.includes('table')) {
        setSelectedTypology('Mesas');
        const count = stats.typologies['Mesas'] || 0;
        reply = `Filtro activado: **Mesas** (${count} SKUs detectados). Tabla sincronizada en modo lectura.`;
      } else if (q.includes('escritorio') || q.includes('desk') || q.includes('workstation')) {
        setSelectedTypology('Escritorios');
        const count = stats.typologies['Escritorios'] || 0;
        reply = `Filtro activado: **Escritorios** (${count} SKUs detectados).`;
      } else if (q.includes('almacen') || q.includes('storage') || q.includes('archiv')) {
        setSelectedTypology('Almacenamiento');
        const count = stats.typologies['Almacenamiento'] || 0;
        reply = `Filtro activado: **Almacenamiento** (${count} SKUs detectados).`;
      } else if (q.includes('lounge') || q.includes('sofa')) {
        setSelectedTypology('Lounge / Sofás');
        const count = stats.typologies['Lounge / Sofás'] || 0;
        reply = `Filtro activado: **Lounge / Sofás** (${count} SKUs detectados).`;
      } else if (q.includes('taburete') || q.includes('stool')) {
        setSelectedTypology('Taburetes');
        const count = stats.typologies['Taburetes'] || 0;
        reply = `Filtro activado: **Taburetes** (${count} SKUs detectados).`;
      } else if (q.includes('precio 0') || q.includes('sin precio') || q.includes('cero')) {
        const matching = products.filter((p) => (Number(p.listPrice) || 0) === 0);
        newFilteredSet = new Set(matching.map((p) => p.sku));
        badgeLabel = `Sin Precio ($0) · ${matching.length} SKUs`;
        setFilteredSkusSet(newFilteredSet);
        setActiveFilterBadge(badgeLabel);
        reply = `He aislado **${matching.length} productos** con precio de lista en $0.`;
      } else if (q.includes('recargo') || q.includes('opcion') || q.includes('configurable')) {
        const matching = products.filter((p) => p.optionsCount > 0);
        newFilteredSet = new Set(matching.map((p) => p.sku));
        badgeLabel = `Configurables · ${matching.length} SKUs`;
        setFilteredSkusSet(newFilteredSet);
        setActiveFilterBadge(badgeLabel);
        reply = `He aislado **${matching.length} modelos configurables** que cuentan con opciones comerciales o recargos en el XML.`;
      } else if (q.includes('cuanto') || q.includes('total') || q.includes('metrica') || q.includes('resumen')) {
        reply = `El catálogo certificado cuenta con **${stats.total} productos**.\nPrecio Promedio: **${formatCurrency(stats.avgPrice)}** | Rango: **${formatCurrency(stats.minPrice)}** a **${formatCurrency(stats.maxPrice)}**.\nModelos configurables: **${stats.configurable}**.`;
      } else {
        // Búsqueda genérica
        setSearchTerm(rawTxt);
        reply = `Aplicando búsqueda por término: "${rawTxt}". Revisa las coincidencias en la matriz.`;
      }

      setCopilotMessages((prev) => [
        ...prev,
        {
          id: `aly-${Date.now()}`,
          from: 'alysa',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setCopilotLoading(false);
    }, 400);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages]);

  // Líneas del XML para el visor de código con numeración y búsqueda
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
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
            }`}
          >
            Reintentar
          </button>
          <button
            onClick={onBack}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              isDarkMode ? 'bg-transparent hover:bg-white/5 text-zinc-400 border-white/10' : 'bg-transparent hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden font-sans select-none ${isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-[#fafafa] text-slate-900'}`}>
      {/* ── TOP HEADER TOOLBAR ── */}
      <header className={`w-full flex-shrink-0 flex items-center justify-between px-3.5 py-2 border-b transition-colors z-20 ${
        isDarkMode ? 'bg-[#09090b]/95 border-white/10 shadow-[0_1px_15px_rgba(0,0,0,0.5)]' : 'bg-white/95 border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
              isDarkMode ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Volver a la vista principal"
          >
            <ArrowLeft size={12} />
            <span className="hidden sm:inline">Volver</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[12px] font-bold tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Visualizador XML Certificado
            </span>
            <span className="hidden md:inline-block text-[10px] text-zinc-500">·</span>
            <span className="hidden md:inline-block text-[11px] font-mono text-zinc-400 truncate max-w-[140px]">
              {catalogName}.xml
            </span>

            {isFallbackXml ? (
              <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
                isDarkMode ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Base Original
              </span>
            ) : (
              <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                isDarkMode ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                xml_actualizer_raw Certificado
              </span>
            )}
          </div>
        </div>

        {/* CONTROLES CENTRALES: SWITCH MATRIZ / XML CRUDO */}
        <div className="flex items-center gap-2">
          <div className={`p-0.5 rounded-lg border flex items-center gap-0.5 ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? isDarkMode
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'bg-white text-slate-900 shadow-sm'
                  : isDarkMode
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Table size={12} />
              <span>Matriz de Productos</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('xml')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'xml'
                  ? isDarkMode
                    ? 'bg-white text-zinc-950 shadow-sm'
                    : 'bg-white text-slate-900 shadow-sm'
                  : isDarkMode
                    ? 'text-zinc-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Code2 size={12} />
              <span>Código XML</span>
            </button>
          </div>

          {/* BOTONES DE EXPORTACIÓN */}
          <button
            type="button"
            onClick={handleDownloadXml}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isDarkMode ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
            }`}
            title="Descargar archivo xml_actualizer_raw oficial"
          >
            <Download size={12} />
            <span className="hidden sm:inline">Descargar .xml</span>
          </button>

          {viewMode === 'matrix' && (
            <button
              type="button"
              onClick={handleExportExcel}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                isDarkMode ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
              }`}
              title="Exportar matriz estructurada a Excel (.xlsx)"
            >
              <Table size={12} />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>
          )}

          {/* TOGGLE ALYSA COPILOT */}
          <button
            type="button"
            onClick={() => setIsCopilotOpen((prev) => !prev)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isCopilotOpen
                ? isDarkMode
                  ? 'bg-white/15 text-white border-white/30'
                  : 'bg-slate-200 text-slate-900 border-slate-300'
                : isDarkMode
                  ? 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                  : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
            title="Mostrar / Ocultar Alysa Copilot (Filtros y consultas)"
          >
            <Sparkles size={12} className={isCopilotOpen ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-zinc-400'} />
            <span className="hidden md:inline">Alysa Filtros</span>
          </button>
        </div>
      </header>

      {/* ── BANNER INFORMATIVO SI ES FALLBACK ── */}
      {isFallbackXml && (
        <div className={`w-full px-4 py-1.5 text-[11px] flex items-center justify-between border-b ${
          isDarkMode ? 'bg-amber-500/10 text-amber-200 border-amber-500/20' : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            <Info size={13} className="shrink-0" />
            <span>
              Aún no se ha ejecutado <strong>/executeProcess</strong> en esta sesión. Mostrando el catálogo base original mientras tanto.
            </span>
          </div>
        </div>
      )}

      {/* ── CUERPO PRINCIPAL DIVIDIDO: MATRIZ / XML + ALYSA COPILOT ── */}
      <div className="w-full flex-1 min-h-0 flex overflow-hidden relative">
        {/* ÁREA CENTRAL: VISTA MATRIZ O CÓDIGO XML */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {viewMode === 'matrix' ? (
            <>
              {/* TOOLBAR SECUNDARIA DE FILTROS EN MATRIZ */}
              <div className={`flex-shrink-0 w-full flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-b ${
                isDarkMode ? 'bg-white/[0.02] border-white/10 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  {/* Selector rápido de Tipología */}
                  <div className="flex items-center gap-1.5">
                    <Tag size={12} className="text-zinc-400" />
                    <select
                      value={selectedTypology}
                      onChange={(e) => setSelectedTypology(e.target.value)}
                      className={`text-[11px] font-semibold rounded-md px-2 py-1 border transition-colors focus:outline-none cursor-pointer ${
                        isDarkMode
                          ? 'bg-zinc-900 border-white/15 text-zinc-200 focus:border-white/30'
                          : 'bg-white border-slate-300 text-slate-800 focus:border-slate-400 shadow-xs'
                      }`}
                    >
                      <option value="ALL">Todas las tipologías ({stats.total})</option>
                      {Object.entries(stats.typologies).map(([typKey, count]) => (
                        <option key={typKey} value={typKey}>
                          {typKey} ({count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Badges de filtros activos */}
                  {activeFilterBadge && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isDarkMode ? 'bg-white/10 text-zinc-200 border-white/20' : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}>
                      <span>{activeFilterBadge}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFilterBadge(null);
                          setFilteredSkusSet(null);
                        }}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}

                  {selectedTypology !== 'ALL' && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isDarkMode ? 'bg-white/10 text-zinc-200 border-white/20' : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}>
                      <span>Tipología: {selectedTypology}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedTypology('ALL')}
                        className="hover:opacity-75 cursor-pointer ml-0.5"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}

                  <span className="text-[11px] text-zinc-500">
                    {filteredProducts.length} de {stats.total} SKUs
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Buscador en vivo */}
                  <div className="relative flex items-center">
                    <Search size={11} className="absolute left-2.5 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar SKU o nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`rounded-md pl-7 pr-2.5 py-1 text-[11px] w-[160px] sm:w-[200px] border transition-colors focus:outline-none ${
                        isDarkMode
                          ? 'bg-zinc-900 border-white/15 text-white placeholder:text-zinc-500 focus:border-white/30'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 shadow-xs'
                      }`}
                    />
                  </div>

                  {/* Botón Filtros Drawer */}
                  <button
                    type="button"
                    onClick={() => setIsFilterDrawerOpen((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isFilterDrawerOpen
                        ? isDarkMode
                          ? 'bg-white/15 text-white border-white/30'
                          : 'bg-slate-200 text-slate-900 border-slate-300'
                        : isDarkMode
                          ? 'bg-white/5 text-zinc-300 border-white/15 hover:bg-white/10'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <SlidersHorizontal size={11} />
                    <span>Filtros</span>
                  </button>
                </div>
              </div>

              {/* DRAWER COLAPSABLE DE FILTROS AVANZADOS */}
              {isFilterDrawerOpen && (
                <div className={`flex-shrink-0 w-full p-3 border-b flex flex-wrap items-center gap-4 text-xs ${
                  isDarkMode ? 'bg-[#121215] border-white/10 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[11px]">Rango de Precio:</span>
                    <input
                      type="number"
                      placeholder="Min $"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
                      className={`w-20 px-2 py-0.5 rounded text-[11px] border ${
                        isDarkMode ? 'bg-zinc-900 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max $"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
                      className={`w-20 px-2 py-0.5 rounded text-[11px] border ${
                        isDarkMode ? 'bg-zinc-900 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const matching = products.filter((p) => p.optionsCount === 0);
                        setFilteredSkusSet(new Set(matching.map((p) => p.sku)));
                        setActiveFilterBadge(`Solo Modelos Base (${matching.length})`);
                      }}
                      className={`px-2 py-1 rounded text-[10.5px] font-semibold border ${
                        isDarkMode ? 'bg-white/5 hover:bg-white/15 border-white/15' : 'bg-white hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      Solo Modelos Base (Sin recargos)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const matching = products.filter((p) => p.optionsCount > 0);
                        setFilteredSkusSet(new Set(matching.map((p) => p.sku)));
                        setActiveFilterBadge(`Con Recargos XML (${matching.length})`);
                      }}
                      className={`px-2 py-1 rounded text-[10.5px] font-semibold border ${
                        isDarkMode ? 'bg-white/5 hover:bg-white/15 border-white/15' : 'bg-white hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      Con Recargos XML (&gt;0)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPriceRange({ min: '', max: '' });
                        setFilteredSkusSet(null);
                        setActiveFilterBadge(null);
                        setSelectedTypology('ALL');
                        setSearchTerm('');
                      }}
                      className="text-[10.5px] text-zinc-400 hover:text-white underline ml-2"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}

              {/* TABLA VIRTUALIZADA DE PRODUCTOS (SOLO LECTURA) */}
              <div
                ref={tableContainerRef}
                onScroll={handleTableScroll}
                className="w-full flex-1 overflow-auto custom-scrollbar relative"
              >
                <table className="w-full border-collapse text-left text-[11px]">
                  <thead className={`sticky top-0 z-10 text-[10.5px] font-bold uppercase tracking-wider border-b ${
                    isDarkMode ? 'bg-[#121215] text-zinc-400 border-white/10' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <tr>
                      <th className="py-2 px-3 w-12 text-center border-r border-transparent">#</th>
                      <th className="py-2 px-3 min-w-[130px] border-r border-transparent">Model # (SKU)</th>
                      <th className="py-2 px-3 min-w-[110px] text-right border-r border-transparent">List Price</th>
                      <th className="py-2 px-3 min-w-[80px] border-r border-transparent">Weight</th>
                      <th className="py-2 px-3 min-w-[130px] border-r border-transparent">Tipología</th>
                      <th className="py-2 px-3 min-w-[240px] border-r border-transparent">Model Name</th>
                      {optionColumns.map((col) => (
                        <th key={col} className="py-2 px-3 min-w-[110px] text-right font-mono text-[10px] border-r border-transparent">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Espaciador superior virtual */}
                    {virtualWindow.topSpacerHeight > 0 && (
                      <tr style={{ height: `${virtualWindow.topSpacerHeight}px` }}>
                        <td colSpan={6 + optionColumns.length} />
                      </tr>
                    )}

                    {virtualWindow.visibleRows.length === 0 ? (
                      <tr>
                        <td colSpan={6 + optionColumns.length} className="py-12 text-center text-zinc-500">
                          No se encontraron productos que coincidan con los filtros actuales.
                        </td>
                      </tr>
                    ) : (
                      virtualWindow.visibleRows.map((prod, idx) => {
                        const globalIdx = virtualWindow.startIdx + idx + 1;
                        const isEven = globalIdx % 2 === 0;
                        return (
                          <tr
                            key={prod.sku}
                            className={`border-b transition-colors ${
                              isEven
                                ? isDarkMode
                                  ? 'bg-white/[0.015]'
                                  : 'bg-slate-50/60'
                                : 'bg-transparent'
                            } ${
                              isDarkMode
                                ? 'border-white/5 hover:bg-white/[0.04]'
                                : 'border-slate-100 hover:bg-slate-100/70'
                            }`}
                            style={{ height: `${ROW_HEIGHT}px` }}
                          >
                            <td className="py-1.5 px-3 text-center text-zinc-500 text-[10px]">
                              {globalIdx}
                            </td>
                            <td className="py-1.5 px-3 font-mono font-semibold text-zinc-200">
                              {prod.sku}
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono font-semibold text-emerald-400">
                              {formatCurrency(prod.listPrice)}
                            </td>
                            <td className="py-1.5 px-3 text-zinc-400">
                              {prod.weight}
                            </td>
                            <td className="py-1.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[9.5px] font-semibold border ${
                                isDarkMode ? 'bg-white/5 text-zinc-300 border-white/10' : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {prod.typology || 'Otros'}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-zinc-300 max-w-[320px] truncate" title={prod.modelName}>
                              {prod.modelName || '---'}
                            </td>
                            {optionColumns.map((col) => {
                              const val = prod.optionPrices[col];
                              return (
                                <td key={col} className="py-1.5 px-3 text-right font-mono text-[10px] text-zinc-400">
                                  {val !== undefined ? formatCurrency(val) : '---'}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    )}

                    {/* Espaciador inferior virtual */}
                    {virtualWindow.bottomSpacerHeight > 0 && (
                      <tr style={{ height: `${virtualWindow.bottomSpacerHeight}px` }}>
                        <td colSpan={6 + optionColumns.length} />
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER METRICAS MATRIZ */}
              <footer className={`flex-shrink-0 px-3.5 py-1.5 border-t text-[10.5px] flex items-center justify-between ${
                isDarkMode ? 'bg-[#09090b] border-white/10 text-zinc-400' : 'bg-white border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-3">
                  <span>Total: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{stats.total}</strong> SKUs</span>
                  <span>·</span>
                  <span>Promedio: <strong className="text-emerald-400">{formatCurrency(stats.avgPrice)}</strong></span>
                  <span>·</span>
                  <span>Rango: {formatCurrency(stats.minPrice)} – {formatCurrency(stats.maxPrice)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono">Modo Solo Lectura · Inyección Verificada</span>
                </div>
              </footer>
            </>
          ) : (
            /* VISTA DE CÓDIGO XML CRUDO */
            <div className="w-full flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Barra de herramientas para XML crudo */}
              <div className={`flex-shrink-0 px-3.5 py-2 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-white/[0.02] border-white/10 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <Search size={11} className="absolute left-2.5 text-zinc-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar en XML..."
                      value={xmlSearchTerm}
                      onChange={(e) => setXmlSearchTerm(e.target.value)}
                      className={`rounded-md pl-7 pr-2.5 py-1 text-[11px] w-[200px] border transition-colors focus:outline-none ${
                        isDarkMode
                          ? 'bg-zinc-900 border-white/15 text-white placeholder:text-zinc-500 focus:border-white/30'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 shadow-xs'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {xmlLines.length} líneas · {(xmlContent.length / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyXml}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedXml
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isDarkMode
                          ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    {copiedXml ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedXml ? 'Copiado' : 'Copiar XML'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadXml}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                      isDarkMode ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    }`}
                  >
                    <Download size={12} />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>

              {/* Visor de código con scroll y numeración */}
              <div className={`w-full flex-1 overflow-auto font-mono text-[11px] leading-5 p-3 custom-scrollbar ${
                isDarkMode ? 'bg-[#060608] text-zinc-300' : 'bg-slate-900 text-slate-200'
              }`}>
                {xmlLines.map((line) => (
                  <div
                    key={line.num}
                    className={`flex items-start ${
                      line.matched ? (isDarkMode ? 'bg-amber-500/20' : 'bg-amber-500/30') : ''
                    }`}
                  >
                    <span className="w-12 text-right pr-4 text-zinc-600 select-none shrink-0">
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
        </div>

        {/* ── PANEL LATERAL DE ALYSA COPILOT (SOLO LECTURA Y FILTROS) ── */}
        {isCopilotOpen && (
          <aside className={`w-[320px] sm:w-[350px] flex-shrink-0 h-full flex flex-col border-l transition-all z-10 ${
            isDarkMode ? 'bg-[#0d0d10] border-white/10' : 'bg-white border-slate-200'
          }`}>
            {/* Header del Chat */}
            <div className={`px-3.5 py-2.5 border-b flex items-center justify-between ${
              isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2">
                <AlysaWordmark size={14} isDarkMode={isDarkMode} />
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-widest ${
                  isDarkMode ? 'bg-white/10 text-zinc-300 border-white/20' : 'bg-slate-200 text-slate-800 border-slate-300'
                }`}>
                  Filtros &amp; RAG
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCopilotOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
                title="Cerrar panel"
              >
                <X size={14} />
              </button>
            </div>

            {/* Mensajes del Chat */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar text-[11px]">
              {copilotMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-2.5 rounded-lg border leading-relaxed ${
                      msg.from === 'user'
                        ? isDarkMode
                          ? 'bg-white text-zinc-950 font-medium border-white'
                          : 'bg-slate-900 text-white font-medium border-slate-900'
                        : isDarkMode
                          ? 'bg-white/[0.04] text-zinc-200 border-white/10'
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
              {copilotLoading && (
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] pl-1">
                  <RefreshCw size={10} className="animate-spin" />
                  <span>Alysa procesando consulta...</span>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chips de Sugerencia Rápida */}
            <div className={`p-2 border-t flex flex-wrap gap-1 ${
              isDarkMode ? 'border-white/10 bg-white/[0.01]' : 'border-slate-200 bg-slate-50'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setCopilotInput('filtra solo las sillas');
                }}
                className={`text-[9.5px] px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Sillas
              </button>
              <button
                type="button"
                onClick={() => {
                  setCopilotInput('filtra mesas');
                }}
                className={`text-[9.5px] px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Mesas
              </button>
              <button
                type="button"
                onClick={() => {
                  setCopilotInput('muestra modelos con recargo');
                }}
                className={`text-[9.5px] px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Con recargo
              </button>
              <button
                type="button"
                onClick={() => {
                  setCopilotInput('limpiar filtros');
                }}
                className={`text-[9.5px] px-2 py-0.5 rounded-md border cursor-pointer transition-colors ${
                  isDarkMode ? 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Restablecer
              </button>
            </div>

            {/* Input de Consulta */}
            <div className={`p-2.5 border-t ${
              isDarkMode ? 'border-white/10 bg-[#09090b]' : 'border-slate-200 bg-white'
            }`}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCopilotSend();
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  placeholder="Pídele a Alysa: 'filtra mesas', 'resumen'..."
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  className={`flex-1 text-[11px] px-2.5 py-1.5 rounded-md border focus:outline-none transition-colors ${
                    isDarkMode
                      ? 'bg-zinc-900 border-white/15 text-white placeholder:text-zinc-500 focus:border-white/30'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!copilotInput.trim() || copilotLoading}
                  className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                    copilotInput.trim() && !copilotLoading
                      ? isDarkMode
                        ? 'bg-white text-zinc-950 border-white font-bold'
                        : 'bg-slate-900 text-white border-slate-900 font-bold'
                      : 'opacity-40 cursor-not-allowed border-transparent text-zinc-500'
                  }`}
                >
                  <SendHorizonal size={12} />
                </button>
              </form>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

