'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  supabase,
  resolveStorageContent,
  uploadToCatalogsStorage,
  upsertGeneralProcessRecord
} from '@/app/lib/supabaseClient';
import { recordClientAction } from '@/app/lib/trackingClient';
import {
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Plus,
  Trash2,
  Undo2,
  Sparkles,
  ArrowLeft,
  Save,
  SlidersHorizontal,
  Layers,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet,
  Zap,
  Filter,
  Tag,
  Paperclip,
  Mic,
  HelpCircle,
  SendHorizonal,
  Download
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AlysaWordmark from '@/app/xml-pipeline/Actualizer_XML_General/components/comparePDF/REPORT/components/AlysaWordmark';
import { applyExcelVisualStyling } from './XML_Results_General.jsx';

const BASE_HEADERS = ["Model #", "List Price", "Weight", "Classic/ Premium", "Model Name"];

export default function CatalogEditorGeneral({ isDarkMode = true, onBack, onRunComparison }) {
  const [headers, setHeaders] = useState(BASE_HEADERS);
  const [baseRows, setBaseRows] = useState([]);
  const [editRows, setEditRows] = useState([]);
  const [deletedSkus, setDeletedSkus] = useState(() => new Set());
  const [catalogName, setCatalogName] = useState('Catalog');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'saving' | 'error'
  const [lastSavedTime, setLastSavedTime] = useState('');
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  // Filtros y virtualización de scroll continuo
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'modified' | 'new_deleted'
  const tableScrollRef = useRef(null);
  const scrollRafRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(650);
  const ROW_HEIGHT = 29;
  const OVERSCAN = 18;

  // Edición inline de celda: { rowIdx, colKey }
  const [activeCell, setActiveCell] = useState(null);
  const [cellDraft, setCellDraft] = useState('');
  const cellInputRef = useRef(null);

  // Herramienta de edición masiva (Bulk Edit)
  const [showBulkBar, setShowBulkBar] = useState(false);
  const [bulkColumn, setBulkColumn] = useState('List Price');
  const [bulkMode, setBulkMode] = useState('percent'); // 'percent' | 'add' | 'set'
  const [bulkValue, setBulkValue] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [chatInputUi, setChatInputUi] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isMcpThinking, setIsMcpThinking] = useState(false);
  const [mcpActiveSkuFilter, setMcpActiveSkuFilter] = useState(null);
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState('');
  const chatScrollEndRef = useRef(null);
  const lastFilteredSkusRef = useRef([]);

  const apiURL =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'https://servex-ai-back.onrender.com';

  const saveTimerRef = useRef(null);
  const baseCsvRawRef = useRef('');
  const headersRef = useRef(BASE_HEADERS);
  const deletedSkusRef = useRef(new Set());
  const editRowsRef = useRef([]);

  useEffect(() => {
    headersRef.current = headers;
  }, [headers]);

  useEffect(() => {
    deletedSkusRef.current = deletedSkus;
  }, [deletedSkus]);

  useEffect(() => {
    editRowsRef.current = editRows;
  }, [editRows]);

  // Mapa rápido del catálogo original (csv_raw) por Model #
  const baseRowMap = useMemo(() => {
    const map = new Map();
    baseRows.forEach((r) => {
      const sku = String(r['Model #'] || '').trim();
      if (sku) map.set(sku, r);
    });
    return map;
  }, [baseRows]);

  const normalizeVal = (val, colKey) => {
    if (val === undefined || val === null) return '';
    const str = String(val).trim();
    if (!BASE_HEADERS.includes(colKey) && (str === '0' || str === '0.0' || str === '0.00')) {
      return '';
    }
    return str;
  };

  const isCellModified = useCallback(
    (row, colKey) => {
      if (row._isNewRow) return true;
      const sku = String(row['Model #'] || '').trim();
      const baseRow = baseRowMap.get(sku);
      if (!baseRow) return true;
      const curVal = normalizeVal(row[colKey], colKey);
      const origVal = normalizeVal(baseRow[colKey], colKey);
      if (curVal === origVal) return false;
      const curNum = Number(curVal);
      const origNum = Number(origVal);
      if (curVal !== '' && origVal !== '' && !Number.isNaN(curNum) && !Number.isNaN(origNum)) {
        return Math.abs(curNum - origNum) > 0.0001;
      }
      return true;
    },
    [baseRowMap]
  );

  // Métricas en tiempo real de cambios en csv_edit_raw vs csv_raw
  const diffMetrics = useMemo(() => {
    let modifiedCellsCount = 0;
    let modifiedRowsCount = 0;
    let newProductsCount = 0;
    const modifiedSkuSet = new Set();

    editRows.forEach((row) => {
      const sku = String(row['Model #'] || '').trim();
      if (deletedSkus.has(sku)) return;
      if (row._isNewRow || !baseRowMap.has(sku)) {
        newProductsCount++;
        modifiedSkuSet.add(sku);
        return;
      }
      let rowHasChange = false;
      headers.forEach((h) => {
        if (h === 'Model #') return;
        if (isCellModified(row, h)) {
          modifiedCellsCount++;
          rowHasChange = true;
        }
      });
      if (rowHasChange) {
        modifiedRowsCount++;
        modifiedSkuSet.add(sku);
      }
    });

    const deletedCount = deletedSkus.size;
    const totalChanges = modifiedCellsCount + newProductsCount + deletedCount;

    return {
      modifiedCellsCount,
      modifiedRowsCount,
      newProductsCount,
      deletedCount,
      totalChanges,
      modifiedSkuSet
    };
  }, [editRows, headers, baseRowMap, deletedSkus, isCellModified]);

  // Serializar editRows activos a formato CSV (; delimiter) para csv_edit_raw
  const serializeRowsToCsv = useCallback(
    (rowsToSerialize, activeDeletedSkus = deletedSkusRef.current, cols = headersRef.current) => {
      const cleanList = rowsToSerialize
        .filter((r) => {
          const sku = String(r['Model #'] || '').trim();
          return sku && !activeDeletedSkus.has(sku);
        })
        .map((r) => {
          const obj = {};
          cols.forEach((h) => {
            const val = r[h];
            if (!BASE_HEADERS.includes(h)) {
              obj[h] = val !== undefined && val !== null && val !== '' && Number(val) > 0 ? val : '';
            } else if (h === 'List Price') {
              obj[h] = val !== undefined && val !== null && val !== '' && Number(val) > 0 ? val : '';
            } else {
              obj[h] = val !== undefined && val !== null ? val : '';
            }
          });
          return obj;
        });

      return Papa.unparse(cleanList, {
        columns: cols,
        delimiter: ';'
      });
    },
    []
  );

  // Persistir csv_edit_raw directamente en la columna csv_edit_raw de ClientsSERVEX_General_Procces y en memoria local
  const persistCsvEditRaw = useCallback(
    async (rowsSnapshot, deletedSnapshot = deletedSkusRef.current, colsSnapshot = headersRef.current, immediate = false) => {
      const csvString = serializeRowsToCsv(rowsSnapshot, deletedSnapshot, colsSnapshot);
      if (!csvString) return '';

      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('csv_edit_raw', csvString);
          localStorage.setItem('csv_edit_raw_General_Procces', csvString);
        } catch (_) {}
      }

      const runCloudSave = async () => {
        setSyncStatus('saving');
        try {
          await supabase
            .from('ClientsSERVEX_General_Procces')
            .update({ csv_edit_raw: csvString })
            .eq('company_name', 'General_Procces');

          setSyncStatus('synced');
          setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } catch (err) {
          console.warn('⚠️ Advertencia guardando csv_edit_raw en Supabase:', err);
          setSyncStatus('synced');
        }
      };

      if (immediate) {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        await runCloudSave();
      } else {
        setSyncStatus('saving');
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(runCloudSave, 500);
      }

      return csvString;
    },
    [serializeRowsToCsv]
  );

  const sanitizeParsedRows = (rawRows, cols) => {
    return (rawRows || []).map((r) => {
      const clean = {};
      cols.forEach((h) => {
        const v = r[h];
        if (!BASE_HEADERS.includes(h)) {
          clean[h] = v !== undefined && v !== null && v !== '' && Number(v) > 0 ? v : '';
        } else if (h === 'List Price') {
          clean[h] = v !== undefined && v !== null && v !== '' && Number(v) > 0 ? v : '';
        } else {
          clean[h] = v !== undefined && v !== null ? v : '';
        }
      });
      return clean;
    });
  };

  // Parser auxiliar de respaldo para convertir catálogo XML nativo a CSV si no se ha generado csv_raw previamente
  const parseCatalogXmlToCsv = (rawXmlStr) => {
    if (!rawXmlStr) return '';
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(rawXmlStr, 'text/xml');
      if (xmlDoc.querySelector('parsererror')) return '';

      const globalFeatures = Array.from(xmlDoc.getElementsByTagName('Feature'));
      const featureMap = new Map();
      for (const f of globalFeatures) {
        const fCode = f.getElementsByTagName('Code')[0]?.textContent?.trim();
        if (fCode) featureMap.set(fCode, f);
      }

      const featureCache = new Map();
      const getProductFeatureCodes = (pNode) => {
        const directRefs = Array.from(pNode.getElementsByTagName('FeatureRef'))
          .map((r) => r.textContent?.trim())
          .filter(Boolean);
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
            const subRefs = Array.from(fNode.getElementsByTagName('FeatureRef'));
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

      const productsXML = Array.from(xmlDoc.getElementsByTagName('Product'));
      if (productsXML.length === 0) return '';

      const optionMap = new Map();
      for (const p of productsXML) {
        const featureCodes = getProductFeatureCodes(p);
        for (const fCode of featureCodes) {
          const featureNode = featureMap.get(fCode);
          if (featureNode) {
            const options = Array.from(featureNode.getElementsByTagName('Option'));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName('Code')[0]?.textContent?.trim();
              const optDesc = opt.getElementsByTagName('Description')[0]?.textContent?.trim();
              const optPriceElem = opt.querySelector('OptionPrice > Value');
              if (optPriceElem && optCode) {
                const optPrice = parseFloat(optPriceElem.textContent || '0');
                const label = optDesc
                  ? optDesc.toLowerCase().includes(optCode.toLowerCase())
                    ? optDesc
                    : `${optCode} (${optDesc})`
                  : optCode;
                const existing = optionMap.get(optCode);
                if (!existing) {
                  optionMap.set(optCode, { optCode, label, maxPrice: optPrice });
                } else if (optPrice > existing.maxPrice) {
                  existing.maxPrice = optPrice;
                }
              }
            }
          }
        }
      }

      const validColumns = Array.from(optionMap.values()).filter((c) => c.maxPrice > 0);
      const dynamicOptionHeaders = validColumns.map((c) => c.label);
      const computedHeaders = [...BASE_HEADERS, ...dynamicOptionHeaders];

      const allRows = productsXML.map((p) => {
        const model =
          p.getElementsByTagName('ModelNumber')[0]?.textContent?.trim() ||
          p.getElementsByTagName('Code')[0]?.textContent?.trim() ||
          '';
        const priceElem = p.querySelector('Price > Value');
        const listPrice = priceElem ? parseFloat(priceElem.textContent || '0') : 0;
        const weightElem = p.getElementsByTagName('Weight')[0];
        const weight = weightElem ? weightElem.textContent?.trim() || 'N/A' : 'N/A';
        const catElem = p.getElementsByTagName('Category')[0];
        const category = catElem ? catElem.textContent?.trim() || 'Standard' : 'Standard';
        const descElem = p.getElementsByTagName('Description')[0];
        const modelName = descElem ? descElem.textContent?.trim() || '' : '';

        const row = {
          'Model #': model,
          'List Price': listPrice > 0 ? listPrice : '',
          'Weight': weight,
          'Classic/ Premium': category,
          'Model Name': modelName
        };

        const pOptionCodes = new Map();
        const pFeatureCodes = getProductFeatureCodes(p);
        for (const fCode of pFeatureCodes) {
          const featureNode = featureMap.get(fCode);
          if (featureNode) {
            const options = Array.from(featureNode.getElementsByTagName('Option'));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName('Code')[0]?.textContent?.trim();
              const optPriceElem = opt.querySelector('OptionPrice > Value');
              if (optCode && optPriceElem) {
                pOptionCodes.set(optCode, parseFloat(optPriceElem.textContent || '0'));
              }
            }
          }
        }

        for (const col of validColumns) {
          if (pOptionCodes.has(col.optCode)) {
            const val = pOptionCodes.get(col.optCode);
            row[col.label] = val > 0 ? val : '';
          } else {
            row[col.label] = '';
          }
        }

        return row;
      });

      return Papa.unparse(allRows, { columns: computedHeaders, delimiter: ';' });
    } catch (e) {
      console.warn('Error en parseCatalogXmlToCsv:', e);
      return '';
    }
  };

  // Inicializar editor cargando csv_raw y copiando/sincronizando en csv_edit_raw de ClientsSERVEX_General_Procces
  const loadEditorData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let rawBaseCsv = '';
      let rawEditCsv = '';
      let detectedName = 'Catalog';
      let hasEditInDb = false;

      try {
        const { data: dbRecord, error: dbErr } = await supabase
          .from('ClientsSERVEX_General_Procces')
          .select('csv_raw, csv_edit_raw, xml_name, file_name, XM_CET_import, xml_raw')
          .eq('company_name', 'General_Procces')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!dbErr && dbRecord) {
          detectedName = (dbRecord.xml_name || dbRecord.file_name || 'Catalog').replace(/\.xml$/i, '').trim();
          if (dbRecord.csv_raw && String(dbRecord.csv_raw).trim()) {
            rawBaseCsv = await resolveStorageContent(dbRecord.csv_raw);
          }
          if (dbRecord.csv_edit_raw && String(dbRecord.csv_edit_raw).trim()) {
            rawEditCsv = await resolveStorageContent(dbRecord.csv_edit_raw);
            hasEditInDb = true;
          }
          if (!rawBaseCsv && !rawEditCsv && (dbRecord.XM_CET_import || dbRecord.xml_raw)) {
            const rawXml = await resolveStorageContent(dbRecord.XM_CET_import || dbRecord.xml_raw);
            if (rawXml && rawXml.trim().startsWith('<')) {
              const parsedXmlCsv = parseCatalogXmlToCsv(rawXml);
              if (parsedXmlCsv) {
                rawBaseCsv = parsedXmlCsv;
                rawEditCsv = parsedXmlCsv;
                upsertGeneralProcessRecord(
                  {
                    company_name: 'General_Procces',
                    csv_raw: parsedXmlCsv,
                    csv_edit_raw: parsedXmlCsv
                  },
                  'General_Procces'
                ).catch(() => {});
              }
            }
          }
        }
      } catch (_) {}

      if (!rawBaseCsv && typeof window !== 'undefined') {
        rawBaseCsv = sessionStorage.getItem('csv_raw') || '';
      }
      if (!rawEditCsv && typeof window !== 'undefined') {
        rawEditCsv = sessionStorage.getItem('csv_edit_raw') || localStorage.getItem('csv_edit_raw_General_Procces') || '';
      }

      if (!rawBaseCsv && rawEditCsv) {
        rawBaseCsv = rawEditCsv;
      }
      if (!rawEditCsv && rawBaseCsv) {
        rawEditCsv = rawBaseCsv;
      }

      setCatalogName(detectedName);

      if (!rawBaseCsv || !rawBaseCsv.trim()) {
        throw new Error('No se encontró catálogo procesado. Asegúrate de haber cargado el catálogo XML en el proceso.');
      }

      baseCsvRawRef.current = rawBaseCsv;
      const parsedBase = Papa.parse(rawBaseCsv.trim(), { header: true, skipEmptyLines: true });
      const baseCols = parsedBase.meta?.fields || Object.keys(parsedBase.data?.[0] || {});
      const cleanBaseRows = sanitizeParsedRows(parsedBase.data, baseCols);

      headersRef.current = baseCols;
      setHeaders(baseCols);
      setBaseRows(cleanBaseRows);

      // Validar si existe csv_edit_raw coherente con el catálogo actual; si no, copiar csv_raw -> csv_edit_raw
      let shouldCloneFromBase = !rawEditCsv || !rawEditCsv.trim();
      let cleanEditRows = [];

      if (!shouldCloneFromBase) {
        const parsedEdit = Papa.parse(rawEditCsv.trim(), { header: true, skipEmptyLines: true });
        if (parsedEdit.data && parsedEdit.data.length > 0) {
          const baseSkuSet = new Set(cleanBaseRows.map((r) => String(r['Model #'] || '').trim()));
          const commonCount = parsedEdit.data.filter((r) => baseSkuSet.has(String(r['Model #'] || '').trim())).length;
          if (commonCount === 0 && cleanBaseRows.length > 0) {
            shouldCloneFromBase = true;
          } else {
            cleanEditRows = sanitizeParsedRows(parsedEdit.data, baseCols).map((r) => {
              const sku = String(r['Model #'] || '').trim();
              return baseSkuSet.has(sku) ? r : { ...r, _isNewRow: true };
            });
          }
        } else {
          shouldCloneFromBase = true;
        }
      }

      if (shouldCloneFromBase) {
        cleanEditRows = cleanBaseRows.map((r) => ({ ...r }));
        const emptySet = new Set();
        deletedSkusRef.current = emptySet;
        setDeletedSkus(emptySet);
        await persistCsvEditRaw(cleanEditRows, emptySet, baseCols, true);
      } else {
        const editSkuSet = new Set(cleanEditRows.map((r) => String(r['Model #'] || '').trim()));
        const restoredDeleted = new Set();
        const mergedRows = [...cleanEditRows];
        cleanBaseRows.forEach((bRow) => {
          const sku = String(bRow['Model #'] || '').trim();
          if (sku && !editSkuSet.has(sku)) {
            restoredDeleted.add(sku);
            mergedRows.push({ ...bRow });
          }
        });
        deletedSkusRef.current = restoredDeleted;
        setDeletedSkus(restoredDeleted);
        cleanEditRows = mergedRows;
        if (!hasEditInDb) {
          await persistCsvEditRaw(cleanEditRows, restoredDeleted, baseCols, true);
        } else {
          setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }

      editRowsRef.current = cleanEditRows;
      setEditRows(cleanEditRows);
      setLoading(false);
    } catch (err) {
      console.error('Error cargando el Editor de Catálogo:', err);
      setError(err.message || 'No se pudo cargar la matriz editable.');
      setLoading(false);
    }
  }, [persistCsvEditRaw]);

  useEffect(() => {
    loadEditorData();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [loadEditorData]);

  useEffect(() => {
    if (activeCell && cellInputRef.current) {
      cellInputRef.current.focus();
      cellInputRef.current.select();
    }
  }, [activeCell]);

  // Generación reactiva de facetas y filtros MCP inteligentes sobre la matriz activa
  const catalogFacets = useMemo(() => {
    if (!editRows || editRows.length === 0) {
      return {
        options: [],
        familias: [],
        precios: [],
        categorias: [],
        calidad: []
      };
    }

    // Columnas dinámicas de recargo comercial del XML (todas aquellas fuera de los 5 campos fijos)
    const optionCols = headers.filter(
      (h) => !BASE_HEADERS.includes(h) && !h.startsWith('_')
    );

    const activeRows = editRows.filter((r) => {
      const sku = String(r['Model #'] || '').trim();
      return sku && !deletedSkus.has(sku);
    });

    const parsedRows = activeRows.map((r) => {
      const sku = String(r['Model #'] || '').trim();
      const price = parseFloat(String(r['List Price'] || '').replace(/[^0-9.-]/g, '')) || 0;
      const weight = parseFloat(String(r['Weight'] || '').replace(/[^0-9.-]/g, '')) || 0;
      const cat = String(r['Classic/ Premium'] || '').trim();
      const modelName = String(r['Model Name'] || '').trim();

      const activeOpts = [];
      optionCols.forEach((col) => {
        const val = parseFloat(String(r[col] || '').replace(/[^0-9.-]/g, ''));
        if (!isNaN(val) && val > 0) {
          activeOpts.push({ col, val });
        }
      });

      // Extracción determinista de la Familia XML a partir de Col #1 Model #
      let skuFamily = 'GENERAL';
      const cleanSku = sku.toUpperCase();
      if (cleanSku.includes('-')) {
        const parts = cleanSku.split('-');
        if (parts[0].length <= 3 && parts.length > 1 && parts[1].length <= 3 && !/^\d+$/.test(parts[1])) {
          skuFamily = `${parts[0]}-${parts[1]}`;
        } else {
          skuFamily = parts[0];
        }
      } else {
        const match = cleanSku.match(/^([A-Z0-9]{2,8})/);
        if (match) skuFamily = match[1];
      }

      const lowerName = modelName.toLowerCase();
      let pType = 'Otros';
      if (/chair|seating|seat|task|guest|stacker|silla/.test(lowerName)) pType = 'Sillas';
      else if (/stool|taburete/.test(lowerName)) pType = 'Taburetes';
      else if (/bench|benching|banca/.test(lowerName)) pType = 'Bancas';
      else if (/desk|workstation|credenza|escritorio/.test(lowerName)) pType = 'Escritorios';
      else if (/table|mesa|conference/.test(lowerName)) pType = 'Mesas';
      else if (/lounge|sofa|settee|ottoman/.test(lowerName)) pType = 'Lounge / Sofás';
      else if (/storage|cabinet|pedestal|bookcase|file|lateral|almacenamiento/.test(lowerName)) pType = 'Almacenamiento';

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

    // 1. OPCIONES COMERCIALES XML (Columnas dinámicas de recargo activo desestructuradas del XML)
    const sinOpciones = parsedRows.filter((r) => r.optsCount === 0).map((r) => r.sku);
    const conOpciones = parsedRows.filter((r) => r.optsCount >= 1).map((r) => r.sku);
    const multiOpciones = parsedRows.filter((r) => r.optsCount >= 2).map((r) => r.sku);

    const optionsFilters = [
      {
        id: 'opt-base',
        label: 'Modelos Base (Sin recargos)',
        prompt: 'Filtra modelos base estándar del catálogo XML que operan exclusivamente con precio fijo sin recargos comerciales',
        skus: sinOpciones,
        badge: `${sinOpciones.length} SKUs · Base`,
        toolCall: { name: 'mcp::csv_edit_matrix.advanced_filter', parameters: { max_options: 0 } }
      },
      ...(conOpciones.length > 0 ? [{
        id: 'opt-configurable',
        label: 'Modelos Configurables',
        prompt: 'Filtra productos configurables del catálogo XML que admiten recargos de opciones comerciales activas',
        skus: conOpciones,
        badge: `${conOpciones.length} SKUs · Opciones`,
        toolCall: { name: 'mcp::csv_edit_matrix.advanced_filter', parameters: { min_options: 1 } }
      }] : []),
      ...(multiOpciones.length > 0 ? [{
        id: 'opt-multi',
        label: 'Con múltiples recargos (≥2)',
        prompt: 'Filtra productos que combinan dos o más opciones comerciales activas en el esquema XML',
        skus: multiOpciones,
        badge: `${multiOpciones.length} SKUs · Multi`,
        toolCall: { name: 'mcp::csv_edit_matrix.advanced_filter', parameters: { min_options: 2 } }
      }] : [])
    ];

    // Opciones comerciales dinámicas del XML desglosadas por tiers exactos de recargo
    optionCols.forEach((colName) => {
      const matchingRows = parsedRows.filter((r) => r.activeOpts.some((o) => o.col === colName));
      if (matchingRows.length === 0) return;

      const colSkus = matchingRows.map((r) => r.sku);

      // Agrupar por valor exacto de recargo (price points / tiers)
      const valueGroups = {};
      matchingRows.forEach((r) => {
        const item = r.activeOpts.find((o) => o.col === colName);
        if (item && item.val > 0) {
          const valNum = Math.round(item.val * 100) / 100;
          if (!valueGroups[valNum]) valueGroups[valNum] = [];
          valueGroups[valNum].push(r.sku);
        }
      });
      const distinctVals = Object.keys(valueGroups).map(Number).sort((a, b) => a - b);
      const cleanColName = colName.length > 24 ? colName.slice(0, 22) + '…' : colName;

      if (distinctVals.length > 1) {
        // Opción general (todos los tiers combinados)
        const minUp = distinctVals[0];
        const maxUp = distinctVals[distinctVals.length - 1];
        const rangeText = `+$${minUp.toFixed(0)}–$${maxUp.toFixed(0)}`;
        optionsFilters.push({
          id: `opt-dyn-${colName}-all`,
          label: `${cleanColName} (Todos)`,
          prompt: `Filtra todos los productos con la opción de recargo "${colName}" (${rangeText})`,
          skus: colSkus,
          badge: `${colSkus.length} SKUs · ${rangeText}`,
          toolCall: { name: 'mcp::csv_edit_matrix.advanced_filter', parameters: { options_any: [colName] } }
        });

        // Tiers individuales exactos (ej. -$FG = $11, -$FG = $12)
        distinctVals.forEach((val) => {
          const tierSkus = valueGroups[val];
          const valFormatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(2);
          optionsFilters.push({
            id: `opt-dyn-${colName}-tier-${val}`,
            label: `${cleanColName} = +$${valFormatted}`,
            prompt: `Filtra productos con la opción "${colName}" con recargo exacto de $${val.toFixed(2)}`,
            skus: tierSkus,
            badge: `${tierSkus.length} SKUs`,
            toolCall: {
              name: 'mcp::csv_edit_matrix.advanced_filter',
              parameters: {
                option_col: colName,
                option_val: val,
                options_any: [colName]
              }
            }
          });
        });
      } else if (distinctVals.length === 1) {
        // Un único valor de recargo para toda la opción (ej. PRM a +$150)
        const val = distinctVals[0];
        const valFormatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(2);
        optionsFilters.push({
          id: `opt-dyn-${colName}`,
          label: cleanColName,
          prompt: `Filtra productos que incorporan la opción comercial "${colName}" (+${valFormatted})`,
          skus: colSkus,
          badge: `${colSkus.length} SKUs · +$${valFormatted}`,
          toolCall: {
            name: 'mcp::csv_edit_matrix.advanced_filter',
            parameters: {
              option_col: colName,
              option_val: val,
              options_any: [colName]
            }
          }
        });
      }
    });

    // 2. FAMILIAS DE MODELO XML (Col #1 Model #) para selector compacto
    const familyGroups = {};
    parsedRows.forEach((r) => {
      const fam = r.skuFamily || 'GENERAL';
      if (!familyGroups[fam]) familyGroups[fam] = [];
      familyGroups[fam].push(r.sku);
    });

    const familiasFilters = Object.entries(familyGroups)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([fam, skus]) => ({
        id: `fam-${fam}`,
        label: `Familia ${fam}`,
        prompt: `Filtra los productos pertenecientes a la familia de modelos "${fam}" del catálogo XML`,
        skus,
        badge: `${skus.length} SKUs`,
        toolCall: { name: 'mcp::csv_edit_matrix.advanced_filter', parameters: { families: [fam], sku_prefix: fam.toLowerCase() } }
      }));

    // 3. AUDITORÍA ESQUEMA XML (Validación contra las 5 columnas base y recargos)
    const sinPrecio = parsedRows.filter((r) => r.price <= 0).map((r) => r.sku);
    const sinPeso = parsedRows.filter((r) => r.weight <= 0).map((r) => r.sku);
    const sinCat = parsedRows.filter((r) => !r.cat).map((r) => r.sku);
    const sinNombre = parsedRows.filter((r) => !r.modelName).map((r) => r.sku);

    const calidadFilters = [
      ...(sinPrecio.length > 0 ? [{
        id: 'audit-price',
        label: 'Sin List Price ($0 o vacío)',
        prompt: 'Auditoría XML: Lista productos que no tienen List Price base asignado en el catálogo',
        skus: sinPrecio,
        badge: `${sinPrecio.length} SKUs · Alerta`,
        isAudit: true,
        toolCall: { name: 'mcp::csv_edit_matrix.advanced_filter', parameters: { missing: ['price'] } }
      }] : []),
      ...(sinPeso.length > 0 ? [{
        id: 'audit-weight',
        label: 'Sin peso registrado (Weight)',
        prompt: 'Auditoría XML: Lista productos sin especificación de peso estructural (Col #3 Weight vacía)',
        skus: sinPeso,
        badge: `${sinPeso.length} SKUs · Alerta`,
        isAudit: true,
        toolCall: { name: 'mcp::csv_edit_matrix.advanced_filter', parameters: { missing: ['weight'] } }
      }] : []),
      ...(sinCat.length > 0 ? [{
        id: 'audit-cat',
        label: 'Sin gama / categoría comercial',
        prompt: 'Auditoría XML: Productos sin valor en Col #4 Classic/ Premium',
        skus: sinCat,
        badge: `${sinCat.length} SKUs · Alerta`,
        isAudit: true,
        toolCall: { name: 'mcp::csv_edit_matrix.advanced_filter', parameters: { missing: ['category'] } }
      }] : []),
      ...(sinNombre.length > 0 ? [{
        id: 'audit-name',
        label: 'Sin Model Name / Descripción',
        prompt: 'Auditoría XML: Productos con descripción comercial vacía en el catálogo',
        skus: sinNombre,
        badge: `${sinNombre.length} SKUs · Alerta`,
        isAudit: true,
        toolCall: { name: 'mcp::csv_edit_matrix.advanced_filter', parameters: { missing: ['name'] } }
      }] : [])
    ];

    return {
      options: optionsFilters.filter((f) => f.skus.length > 0),
      familias: familiasFilters.filter((f) => f.skus.length > 0),
      calidad: calidadFilters.filter((f) => f.skus.length > 0)
    };
  }, [editRows, headers, deletedSkus]);

  // Filtrado de filas según búsqueda, pestaña activa y filtro MCP devuelto por el backend
  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return editRows
      .map((row, originalIdx) => ({ row, originalIdx }))
      .filter(({ row }) => {
        const sku = String(row['Model #'] || '').trim();
        const isDeleted = deletedSkus.has(sku);
        const isNew = !!row._isNewRow || !baseRowMap.has(sku);
        const isMod = diffMetrics.modifiedSkuSet.has(sku);

        if (mcpActiveSkuFilter?.skuSet && !mcpActiveSkuFilter.skuSet.has(sku)) {
          return false;
        }

        if (filterMode === 'modified' && !isMod && !isDeleted) return false;
        if (filterMode === 'new_deleted' && !isNew && !isDeleted) return false;

        if (!q) return true;
        return (
          sku.toLowerCase().includes(q) ||
          String(row['Model Name'] || '').toLowerCase().includes(q) ||
          String(row['Classic/ Premium'] || '').toLowerCase().includes(q)
        );
      });
  }, [editRows, searchTerm, filterMode, deletedSkus, baseRowMap, diffMetrics.modifiedSkuSet, mcpActiveSkuFilter]);

  // Enviar mensaje al servidor MCP + RAG del backend (`/api/v1/General_Procces/matrix-editor/mcp-chat`)
  const handleSendMatrixChat = useCallback(
    async (overridePrompt = null, explicitToolCall = null, precomputedSkus = null, filterLabelOverride = null) => {
      const rawText = overridePrompt !== null ? overridePrompt : chatInputUi;
      const query = String(rawText || '').trim();
      if (!query || isMcpThinking) return;

      const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const userMsg = {
        id: `mcp-u-${Date.now()}`,
        role: 'user',
        text: query,
        time: userTime
      };

      setChatMessages((prev) => [...prev, userMsg]);
      if (overridePrompt === null) setChatInputUi('');
      setIsMcpThinking(true);

      try {
        const currentCsvEditRaw = serializeRowsToCsv(
          editRowsRef.current,
          deletedSkusRef.current,
          headersRef.current
        );

        let data = null;

        const activeSkusToSend =
          mcpActiveSkuFilter?.skuSet && mcpActiveSkuFilter.skuSet.size > 0
            ? Array.from(mcpActiveSkuFilter.skuSet)
            : (lastFilteredSkusRef.current && lastFilteredSkusRef.current.length > 0
                ? lastFilteredSkusRef.current
                : []);

        // 1. Intentar endpoint dedicado del nuevo MCP en el backend
        try {
          const res = await fetch(`${apiURL}/api/v1/General_Procces/matrix-editor/mcp-chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: query,
              company_name: 'General_Procces',
              history: chatMessages.slice(-6).map((m) => ({
                role: m.role,
                content: m.text
              })),
              csv_edit_raw: currentCsvEditRaw,
              tool_call: explicitToolCall || undefined,
              active_skus: activeSkusToSend
            })
          });

          if (res.ok) {
            data = await res.json();
          }
        } catch (_) {}

        // 2. Si el endpoint dedicado aún no responde (o en despliegue), usar el endpoint unificado con sección del editor
        if (!data || !data.reply) {
          const fallbackRes = await fetch(`${apiURL}/api/v1/General_Procces/agent/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [
                ...chatMessages.slice(-6).map((m) => ({
                  role: m.role,
                  content: m.text
                })),
                { role: 'user', content: query }
              ],
              company_name: 'General_Procces',
              current_section: 'catalog_matrix_live_editor'
            })
          });

          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            data = {
              reply: fallbackData?.reply || 'Respuesta generada por el agente.',
              matched_skus: fallbackData?.matched_skus || [],
              mcp_traces: fallbackData?.mcp_traces || []
            };
          } else {
            throw new Error('No se pudo conectar con el servidor MCP en el backend');
          }
        }

        const backendSkus = Array.isArray(data?.matched_skus) ? data.matched_skus : [];
        const matchedSkus = backendSkus.length > 0
          ? backendSkus
          : (Array.isArray(precomputedSkus) && precomputedSkus.length > 0 ? precomputedSkus : []);

        if (matchedSkus.length > 0) {
          lastFilteredSkusRef.current = matchedSkus;
        }

        const mcpTraces = Array.isArray(data?.mcp_traces) ? data.mcp_traces : [];
        const primaryFilter = mcpTraces.find(
          (t) =>
            t.tool === 'mcp::csv_edit_matrix.filter_by_price' ||
            t.tool === 'mcp::csv_edit_matrix.filter_by_category' ||
            t.tool === 'mcp::csv_edit_matrix.filter_products' ||
            t.tool === 'mcp::csv_edit_matrix.advanced_filter' ||
            t.tool === 'mcp::csv_edit_matrix.batch_update_matrix'
        );

        // Si se ejecutó una herramienta de actualización masiva MCP (batch_update_matrix), aplicar sincronización en la matriz
        const batchTrace = mcpTraces.find((t) => t.tool === 'mcp::csv_edit_matrix.batch_update_matrix');
        if (batchTrace || data?.applied_batch_update) {
          const batchInfo = batchTrace?.params || data?.applied_batch_update || {};
          const targetSkus =
            batchTrace?.affected_skus ||
            data?.affected_skus ||
            (mcpActiveSkuFilter?.skuSet && mcpActiveSkuFilter.skuSet.size > 0
              ? Array.from(mcpActiveSkuFilter.skuSet)
              : lastFilteredSkusRef.current);
          const targetCol = batchTrace?.applied_column || batchInfo.target_column || 'List Price';
          const targetMode = batchTrace?.mode || batchInfo.mode || 'percent';
          const targetVal =
            batchTrace?.value !== undefined ? batchTrace.value : batchInfo.value;

          if (targetSkus.length > 0 && targetVal !== undefined && targetVal !== null) {
            handleApplyBulkUpdate(targetSkus, targetCol, targetMode, targetVal);
          }
        }

        // Si el usuario solicitó filtrar o aislar los productos en la tabla, activar filtro automáticamente
        const qLower = query.toLowerCase();
        if (
          matchedSkus.length > 0 &&
          /\b(filtra|filtrar|filtro|muestra|muestrame|mostrar|tabla|solo\s+los|deja\s+solo|aislar)\b/.test(qLower)
        ) {
          const filterTag = filterLabelOverride || (primaryFilter
            ? `${primaryFilter.tool.replace('mcp::csv_edit_matrix.', '')} (${matchedSkus.length})`
            : `${matchedSkus.length} SKUs`);
          setMcpActiveSkuFilter({
            label: filterTag,
            skuSet: new Set(matchedSkus)
          });
        }

        const botMsg = {
          id: `mcp-b-${Date.now()}`,
          role: 'assistant',
          text: data?.reply || 'Consulta procesada sobre `csv_edit_raw`.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mcpTraces,
          matchedSkus,
          filterLabel: filterLabelOverride || (primaryFilter
            ? `${primaryFilter.tool.replace('mcp::csv_edit_matrix.', '')} (${matchedSkus.length} SKUs)`
            : `${matchedSkus.length} SKUs`)
        };

        setChatMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `mcp-err-${Date.now()}`,
            role: 'assistant',
            text: `❌ Error consultando el MCP en el backend: ${err?.message || 'Fallo de red'}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mcpTraces: [],
            matchedSkus: []
          }
        ]);
      } finally {
        setIsMcpThinking(false);
        setTimeout(() => {
          chatScrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      }
    },
    [chatInputUi, isMcpThinking, apiURL, chatMessages, serializeRowsToCsv]
  );

  // Medición de viewport y scroll virtualizado con requestAnimationFrame
  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return undefined;
    const updateSize = () => {
      if (tableScrollRef.current) {
        setViewportHeight(tableScrollRef.current.clientHeight || 650);
      }
    };
    updateSize();
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateSize);
      ro.observe(el);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateSize);
    }
    return () => {
      if (ro) ro.disconnect();
      else if (typeof window !== 'undefined') window.removeEventListener('resize', updateSize);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, [loading]);

  const handleTableScroll = useCallback((e) => {
    const top = e.currentTarget.scrollTop;
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      setScrollTop(top);
    });
  }, []);

  useEffect(() => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
    setScrollTop(0);
  }, [searchTerm, filterMode]);

  // Ventana virtualizada para renderizar únicamente las filas visibles + overscan
  const virtualWindow = useMemo(() => {
    const total = filteredRows.length;
    if (total === 0) {
      return { startIdx: 0, endIdx: 0, visibleRows: [], topSpacerHeight: 0, bottomSpacerHeight: 0 };
    }
    let startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    let endIdx = Math.min(total, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN);

    // Garantizar que la celda activa en edición nunca se desmonte al hacer scroll
    if (activeCell) {
      const activeFilteredIdx = filteredRows.findIndex((r) => r.originalIdx === activeCell.rowIdx);
      if (activeFilteredIdx !== -1) {
        startIdx = Math.min(startIdx, Math.max(0, activeFilteredIdx - 2));
        endIdx = Math.max(endIdx, Math.min(total, activeFilteredIdx + 3));
      }
    }

    return {
      startIdx,
      endIdx,
      visibleRows: filteredRows.slice(startIdx, endIdx),
      topSpacerHeight: startIdx * ROW_HEIGHT,
      bottomSpacerHeight: Math.max(0, (total - endIdx) * ROW_HEIGHT),
    };
  }, [filteredRows, scrollTop, viewportHeight, activeCell]);

  const markLiveEditActive = () => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('has_active_live_edits', 'true');
      } catch (_) {}
    }
  };

  // Guardar valor de celda editada directamente en csv_edit_raw
  const commitCellEdit = useCallback(
    (targetCell = activeCell, valueToSave = cellDraft, immediate = true) => {
      if (!targetCell) return;
      const { rowIdx, colKey } = targetCell;
      const isNumericCol = colKey === 'List Price' || !BASE_HEADERS.includes(colKey);

      let finalVal = String(valueToSave ?? '').trim();
      if (isNumericCol) {
        const cleanNumberStr = finalVal.replace(/[$,\s]/g, '');
        if (cleanNumberStr === '' || Number(cleanNumberStr) <= 0 || Number.isNaN(Number(cleanNumberStr))) {
          finalVal = '';
        } else {
          finalVal = Number(cleanNumberStr);
        }
      }

      const currentList = editRowsRef.current;
      if (!currentList || !currentList[rowIdx]) return;

      const next = [...currentList];
      next[rowIdx] = { ...next[rowIdx], [colKey]: finalVal };
      editRowsRef.current = next;
      setEditRows(next);
      markLiveEditActive();
      persistCsvEditRaw(next, deletedSkusRef.current, headersRef.current, immediate);
    },
    [activeCell, cellDraft, persistCsvEditRaw]
  );

  const handleCellDraftChange = (newVal) => {
    setCellDraft(newVal);
    if (activeCell) {
      commitCellEdit(activeCell, newVal, false);
    }
  };

  const startCellEdit = (rowIdx, colKey, currentVal, isRowDeleted) => {
    if (isRowDeleted) return;
    if (colKey === 'Model #' && !editRows[rowIdx]?._isNewRow) return;
    if (activeCell && (activeCell.rowIdx !== rowIdx || activeCell.colKey !== colKey)) {
      commitCellEdit(activeCell, cellDraft, true);
    }
    setActiveCell({ rowIdx, colKey });
    setCellDraft(currentVal !== undefined && currentVal !== null ? String(currentVal) : '');
  };

  const handleCellKeyDown = (e, filteredIdx, colIdx) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setActiveCell(null);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      commitCellEdit(activeCell, cellDraft, true);
      const nextFilteredRow = filteredRows[filteredIdx + 1];
      if (nextFilteredRow) {
        const colKey = headers[colIdx];
        startCellEdit(
          nextFilteredRow.originalIdx,
          colKey,
          nextFilteredRow.row[colKey],
          deletedSkus.has(String(nextFilteredRow.row['Model #'] || '').trim())
        );
        if (tableScrollRef.current) {
          const targetBottom = (filteredIdx + 2) * ROW_HEIGHT;
          const currentBottom = tableScrollRef.current.scrollTop + tableScrollRef.current.clientHeight - 36;
          if (targetBottom > currentBottom) {
            tableScrollRef.current.scrollTop += ROW_HEIGHT;
          }
        }
      } else {
        setActiveCell(null);
      }
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      commitCellEdit(activeCell, cellDraft, true);
      const dir = e.shiftKey ? -1 : 1;
      let nextColIdx = colIdx + dir;
      const currentRowObj = filteredRows[filteredIdx];
      if (!currentRowObj) {
        setActiveCell(null);
        return;
      }
      const minCol = currentRowObj.row._isNewRow ? 0 : 1;
      if (nextColIdx >= minCol && nextColIdx < headers.length) {
        const nextColKey = headers[nextColIdx];
        startCellEdit(currentRowObj.originalIdx, nextColKey, currentRowObj.row[nextColKey], false);
      } else {
        setActiveCell(null);
      }
    }
  };

  // Revertir una celda individual a su valor en csv_raw
  const revertSingleCell = (rowIdx, colKey, e) => {
    if (e) e.stopPropagation();
    const currentList = editRowsRef.current;
    const row = currentList[rowIdx];
    if (!row) return;
    const sku = String(row['Model #'] || '').trim();
    const baseRow = baseRowMap.get(sku);
    if (!baseRow) return;

    const origVal = baseRow[colKey] !== undefined && baseRow[colKey] !== null ? baseRow[colKey] : '';
    const next = [...currentList];
    next[rowIdx] = { ...next[rowIdx], [colKey]: origVal };
    editRowsRef.current = next;
    setEditRows(next);
    markLiveEditActive();
    persistCsvEditRaw(next, deletedSkusRef.current, headersRef.current, true);

    if (activeCell?.rowIdx === rowIdx && activeCell?.colKey === colKey) {
      setActiveCell(null);
    }
  };

  // Descarga directa de la matriz editada en formato Excel (.xlsx) con estilos de cliente
  const exportToExcel = useCallback(() => {
    try {
      const activeRows = editRowsRef.current.filter((r) => {
        const sku = String(r['Model #'] || '').trim();
        return sku && !deletedSkusRef.current.has(sku);
      });

      const rowsToUse = filteredRows && filteredRows.length > 0 && (searchTerm || mcpActiveSkuFilter || filterMode !== 'all')
        ? filteredRows.map((item) => item.row)
        : activeRows;

      if (!rowsToUse || rowsToUse.length === 0) {
        alert('No hay productos disponibles en la matriz para exportar.');
        return;
      }

      const currentHeaders = headersRef.current && headersRef.current.length > 0 ? headersRef.current : BASE_HEADERS;

      const rowsToExport = rowsToUse.map((row) => {
        const cleanRow = {};
        currentHeaders.forEach((h) => {
          const val = row[h];
          if (!BASE_HEADERS.includes(h)) {
            cleanRow[h] = val !== undefined && val !== null && val !== '' && Number(val) > 0 ? Number(val) : '';
          } else if (h === 'List Price') {
            cleanRow[h] = val !== undefined && val !== null && val !== '' && Number(val) > 0 ? Number(val) : '';
          } else {
            cleanRow[h] = val !== undefined && val !== null ? val : '';
          }
        });
        return cleanRow;
      });

      recordClientAction(
        'DOWNLOAD_EXCEL',
        `El usuario descargó la matriz editable en formato Excel (.xlsx) (${rowsToExport.length} productos).`,
        'Descarga de Matriz Excel desde Editor',
        { total_products: rowsToExport.length, format: 'xlsx' }
      );

      const worksheet = XLSX.utils.json_to_sheet(rowsToExport, { header: currentHeaders });

      worksheet['!cols'] = currentHeaders.map((h, idx) => {
        if (idx === 0) return { wch: 16 }; // Model #
        if (idx === 1) return { wch: 14 }; // List Price
        if (idx === 2) return { wch: 12 }; // Weight
        if (idx === 3) return { wch: 18 }; // Classic/ Premium
        if (idx === 4) return { wch: 36 }; // Model Name
        return { wch: Math.max(String(h || '').length + 5, 15) };
      });
      worksheet['!rows'] = [
        { hpt: 28 },
        ...rowsToExport.map(() => ({ hpt: 20 }))
      ];
      if (worksheet['!ref']) {
        worksheet['!autofilter'] = { ref: worksheet['!ref'] };
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Catalog Data');

      const cleanPrefix = (catalogName || 'Catalog').replace(/\.xml$/i, '').trim();
      const fileName = `${cleanPrefix}-Editable-ALYSAsistemai-${new Date().toISOString().slice(0, 10)}.xlsx`;

      const rawExcelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      let finalExcelBytes;
      try {
        finalExcelBytes = applyExcelVisualStyling(rawExcelBuffer);
      } catch (styleErr) {
        console.warn('Fallback a Excel sin estilos adicionales:', styleErr);
        finalExcelBytes = rawExcelBuffer;
      }

      const blob = new Blob([finalExcelBytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 150);
    } catch (err) {
      console.error('Error al exportar a Excel desde el editor:', err);
      alert('Error al generar el archivo Excel: ' + (err.message || err));
    }
  }, [filteredRows, searchTerm, mcpActiveSkuFilter, filterMode, catalogName]);

  // Agregar nuevo producto a csv_edit_raw
  const handleAddNewProduct = () => {
    const currentList = editRowsRef.current;
    const newSku = `NEW-SKU-${currentList.filter((r) => r._isNewRow).length + 1}`;
    const newRow = { _isNewRow: true };
    headersRef.current.forEach((h) => {
      if (h === 'Model #') newRow[h] = newSku;
      else if (h === 'List Price') newRow[h] = 100;
      else if (h === 'Weight') newRow[h] = 'N/A';
      else if (h === 'Classic/ Premium') newRow[h] = 'Standard';
      else if (h === 'Model Name') newRow[h] = 'Nuevo Producto Editable';
      else newRow[h] = '';
    });

    const next = [newRow, ...currentList];
    editRowsRef.current = next;
    setEditRows(next);
    markLiveEditActive();
    persistCsvEditRaw(next, deletedSkusRef.current, headersRef.current, true);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollTop = 0;
    }
    setScrollTop(0);
    setTimeout(() => {
      startCellEdit(0, 'Model #', newSku, false);
    }, 60);
  };

  // Marcar / desmarcar baja de producto o eliminar fila nueva
  const handleToggleDeleteRow = (rowIdx) => {
    const currentList = editRowsRef.current;
    const targetRow = currentList[rowIdx];
    if (!targetRow) return;
    const sku = String(targetRow['Model #'] || '').trim();

    if (targetRow._isNewRow) {
      const next = currentList.filter((_, idx) => idx !== rowIdx);
      editRowsRef.current = next;
      setEditRows(next);
      markLiveEditActive();
      persistCsvEditRaw(next, deletedSkusRef.current, headersRef.current, true);
      return;
    }

    const nextDeleted = new Set(deletedSkusRef.current);
    if (nextDeleted.has(sku)) nextDeleted.delete(sku);
    else nextDeleted.add(sku);
    deletedSkusRef.current = nextDeleted;
    setDeletedSkus(nextDeleted);
    markLiveEditActive();
    persistCsvEditRaw(currentList, nextDeleted, headersRef.current, true);
  };

  // Aplicar ajuste masivo sobre las filas filtradas actualmente o sobre un lote de SKUs específico
  const handleApplyBulkUpdate = (overrideSkus = null, overrideCol = null, overrideMode = null, overrideVal = null) => {
    let activeCol = overrideCol || bulkColumn;
    if (overrideCol) {
      const match = (headersRef.current || []).find(
        (h) =>
          h.toLowerCase() === overrideCol.toLowerCase() ||
          h.toLowerCase().includes(overrideCol.toLowerCase()) ||
          overrideCol.toLowerCase().includes(h.toLowerCase())
      );
      if (match) activeCol = match;
    }
    const activeMode = overrideMode || bulkMode;
    const rawVal = overrideVal !== null && overrideVal !== undefined ? overrideVal : bulkValue;
    const numVal = parseFloat(rawVal);
    if (Number.isNaN(numVal)) return false;

    let targetIndices;
    if (overrideSkus && Array.isArray(overrideSkus) && overrideSkus.length > 0) {
      const skuSet = new Set(overrideSkus.map((s) => String(s).trim().toLowerCase()));
      targetIndices = new Set();
      editRowsRef.current.forEach((row, idx) => {
        const sku = String(row['Model #'] || '').trim().toLowerCase();
        if (skuSet.has(sku)) targetIndices.add(idx);
      });
    } else {
      targetIndices = new Set(filteredRows.map((item) => item.originalIdx));
    }

    if (targetIndices.size === 0) return false;

    const currentList = editRowsRef.current;
    const next = currentList.map((row, idx) => {
      if (!targetIndices.has(idx)) return row;
      const sku = String(row['Model #'] || '').trim();
      if (deletedSkusRef.current.has(sku)) return row;

      const currentRaw = row[activeCol];
      const currentNum = parseFloat(currentRaw || '0') || 0;
      let updatedNum = currentNum;

      if (activeMode === 'percent') {
        if (currentNum <= 0) return row;
        updatedNum = Math.round(currentNum * (1 + numVal / 100) * 100) / 100;
      } else if (activeMode === 'add') {
        if (currentNum <= 0 && numVal <= 0) return row;
        updatedNum = Math.round((currentNum + numVal) * 100) / 100;
      } else if (activeMode === 'set') {
        updatedNum = Math.round(numVal * 100) / 100;
      }

      return {
        ...row,
        [activeCol]: updatedNum > 0 ? updatedNum : ''
      };
    });

    editRowsRef.current = next;
    setEditRows(next);
    markLiveEditActive();
    persistCsvEditRaw(next, deletedSkusRef.current, headersRef.current, true);

    recordClientAction({
      companyName: 'General_Procces',
      eventType: 'BULK_EDIT_MATRIX',
      title: 'Edición Masiva en Matriz (csv_edit_raw)',
      description: `Ajuste masivo (${activeMode}: ${rawVal}) aplicado en columna "${activeCol}" sobre ${targetIndices.size} productos.`
    });
    if (!overrideSkus) {
      setBulkValue('');
    }
    return true;
  };

  // Restaurar toda la matriz csv_edit_raw al estado original de csv_raw
  const handleResetAllToBase = async () => {
    const resetRows = baseRows.map((r) => ({ ...r }));
    const emptyDeleted = new Set();
    setActiveCell(null);
    deletedSkusRef.current = emptyDeleted;
    editRowsRef.current = resetRows;
    setDeletedSkus(emptyDeleted);
    setEditRows(resetRows);
    setShowResetConfirm(false);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('has_active_live_edits');
      } catch (_) {}
    }
    await persistCsvEditRaw(resetRows, emptyDeleted, headersRef.current, true);
  };

  // Ejecutar proceso de comparación final (csv_raw vs csv_edit_raw)
  const handleExecuteComparison = async () => {
    if (activeCell) {
      commitCellEdit(activeCell, cellDraft);
      setActiveCell(null);
    }

    setIsRunningAudit(true);
    try {
      const finalEditedCsv = await persistCsvEditRaw(editRows, deletedSkus, headers, true);
      const baseCsv = baseCsvRawRef.current || serializeRowsToCsv(baseRows, new Set(), headers);

      // Sincronizar también con csv_new_raw para que todo el pipeline (/executeProcess, /applyChanges, reportes) opere de forma nativa
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('csv_edit_raw', finalEditedCsv);
          sessionStorage.setItem('csv_new_raw', finalEditedCsv);
          window.dispatchEvent(new CustomEvent('catalogCsvNewUpdated', { detail: { csvNewRaw: finalEditedCsv } }));
        } catch (_) {}
      }

      // Enviar al caché en memoria del backend
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        'https://servex-ai-back.onrender.com';

      try {
        const fd = new FormData();
        fd.append('company_name', 'General_Procces');
        fd.append('csv_new_raw', finalEditedCsv);
        await fetch(`${backendUrl}/api/v1/General_Procces/pipeline/cache-csv-new`, {
          method: 'POST',
          body: fd
        });
      } catch (_) {}

      // Guardar directamente el texto CSV en Supabase (csv_edit_raw, csv_new_raw, CSV_final)
      await supabase
        .from('ClientsSERVEX_General_Procces')
        .update({
          csv_edit_raw: finalEditedCsv,
          csv_new_raw: finalEditedCsv,
          CSV_final: finalEditedCsv
        })
        .eq('company_name', 'General_Procces');

      recordClientAction({
        companyName: 'General_Procces',
        eventType: 'EXECUTE_COMPARISON_FROM_EDITOR',
        title: 'Auditoría Comparativa desde Editor en Vivo',
        description: `El usuario finalizó la edición en csv_edit_raw (${diffMetrics.totalChanges} cambios) y ejecutó la comparación contra csv_raw.`
      });

      if (typeof onRunComparison === 'function') {
        onRunComparison({
          csvRaw: baseCsv,
          csvEditRaw: finalEditedCsv,
          metrics: diffMetrics
        });
      } else if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('executeComparisonFromEditor', {
            detail: {
              csvRaw: baseCsv,
              csvEditRaw: finalEditedCsv,
              metrics: diffMetrics
            }
          })
        );
      }
    } catch (err) {
      console.error('Error ejecutando comparación desde el editor:', err);
      alert('Error al preparar la comparación: ' + (err.message || err));
    } finally {
      setIsRunningAudit(false);
    }
  };

  if (loading) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center py-16 font-sans ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
        <div className={`flex items-center gap-3 px-5 py-3 rounded-none border backdrop-blur-xl ${
          isDarkMode ? 'border-white/10 bg-[#09090b]/80 text-zinc-200' : 'border-slate-200 bg-white text-slate-800'
        }`}>
          <RefreshCw size={15} className="animate-spin" />
          <span className="text-xs font-semibold tracking-wide">
            Sincronizando matriz (<code className="font-mono">csv_raw</code> ➔ <code className="font-mono">csv_edit_raw</code>)...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-12 px-4 text-center font-sans">
        <AlertCircle className={isDarkMode ? 'text-zinc-400 mb-2' : 'text-slate-500 mb-2'} size={28} />
        <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-1`}>
          Matriz Base No Disponible
        </h3>
        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} max-w-md mb-4`}>{error}</p>
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-none text-xs font-semibold border cursor-pointer ${
                isDarkMode ? 'bg-white/10 hover:bg-white/15 text-white border-white/15' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
              }`}
            >
              <ArrowLeft size={13} /> Volver
            </button>
          )}
          <button
            onClick={loadEditorData}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-none text-xs font-semibold border cursor-pointer ${
              isDarkMode ? 'bg-white text-zinc-950 border-white hover:bg-zinc-200' : 'bg-[#18181b] text-white border-[#18181b] hover:bg-zinc-800'
            }`}
          >
            <RefreshCw size={13} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col font-sans antialiased select-none ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
      {/* ── CONTENEDOR PRINCIPAL DIVIDIDO: IZQUIERDA TABLA EDITABLE (70-72%) / DERECHA INTERFAZ CHAT ALYSA (28-30%) ── */}
      <div className="flex-1 w-full min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* ── COLUMNA IZQUIERDA: HERRAMIENTAS, TABLA INTERACTIVA Y PAGINACIÓN ── */}
        <div className="w-full lg:w-[70%] xl:w-[72%] min-w-0 h-full flex flex-col overflow-hidden">
          {/* ── SUB-BARRA DE HERRAMIENTAS: BÚSQUEDA, FILTROS Y ACCIONES RÁPIDAS ── */}
          <div
            className={`w-full flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b ${
              isDarkMode ? 'bg-transparent border-white/10' : 'bg-white/80 border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {/* Buscador */}
              <div className="relative flex items-center">
                <Search size={11} className={`absolute left-2.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'} pointer-events-none`} />
                <input
                  type="text"
                  placeholder="Buscar por Model # o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`rounded-none pl-7 pr-6 py-1 text-[10.5px] w-[170px] sm:w-[220px] focus:outline-none border transition-all ${
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

              {/* Pestañas de filtro */}
              <div className={`flex items-center border rounded-none ${
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-none text-[10px] font-semibold transition-all cursor-pointer ${
                    filterMode === 'all'
                      ? isDarkMode
                        ? 'bg-white text-zinc-950 font-bold'
                        : 'bg-[#18181b] text-white font-bold'
                      : isDarkMode
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos ({editRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('modified')}
                  className={`px-2.5 py-1 rounded-none text-[10px] font-semibold transition-all cursor-pointer border-l ${
                    isDarkMode ? 'border-white/10' : 'border-slate-200'
                  } ${
                    filterMode === 'modified'
                      ? isDarkMode
                        ? 'bg-white text-zinc-950 font-bold'
                        : 'bg-[#18181b] text-white font-bold'
                      : isDarkMode
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Modificados ({diffMetrics.modifiedRowsCount})</span>
                </button>
                {(diffMetrics.newProductsCount > 0 || diffMetrics.deletedCount > 0) && (
                  <button
                    type="button"
                    onClick={() => setFilterMode('new_deleted')}
                    className={`px-2.5 py-1 rounded-none text-[10px] font-semibold transition-all cursor-pointer border-l ${
                      isDarkMode ? 'border-white/10' : 'border-slate-200'
                    } ${
                      filterMode === 'new_deleted'
                        ? isDarkMode
                          ? 'bg-white text-zinc-950 font-bold'
                          : 'bg-[#18181b] text-white font-bold'
                        : isDarkMode
                          ? 'text-zinc-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Altas / Bajas ({diffMetrics.newProductsCount + diffMetrics.deletedCount})
                  </button>
                )}
              </div>

              {/* Indicador de filtro activo ejecutado por el MCP */}
              {mcpActiveSkuFilter && (
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 border rounded-none text-[9.5px] font-mono select-none ${
                    isDarkMode
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-slate-900 text-white border-slate-900'
                  }`}
                >
                  <Sparkles size={10} className="text-amber-400 shrink-0" />
                  <span>Filtro MCP: {mcpActiveSkuFilter.label}</span>
                  <button
                    type="button"
                    onClick={() => setMcpActiveSkuFilter(null)}
                    className="ml-0.5 opacity-70 hover:opacity-100 cursor-pointer"
                    title="Quitar filtro MCP de la tabla"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>

            {/* Acciones de matriz: Nuevo Producto, Ajuste Masivo, Restaurar */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleAddNewProduct}
                className={`px-2.5 py-1 rounded-none text-[10.5px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <Plus size={11} />
                <span>Nuevo Producto</span>
              </button>

              <button
                type="button"
                onClick={() => setShowBulkBar((v) => !v)}
                className={`px-2.5 py-1 rounded-none text-[10.5px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                  showBulkBar
                    ? isDarkMode
                      ? 'bg-white text-zinc-950 border-white'
                      : 'bg-[#18181b] text-white border-[#18181b]'
                    : isDarkMode
                      ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <SlidersHorizontal size={11} />
                <span>Ajuste en Lote</span>
              </button>

              {/* Botón oficial de Exportar a Excel (.xlsx) */}
              <button
                type="button"
                onClick={exportToExcel}
                className={`px-2.5 py-1 rounded-none text-[10.5px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isDarkMode
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700'
                }`}
                title="Descargar matriz en formato Excel (.xlsx)"
              >
                <Download size={11} />
                <span>Export Excel</span>
              </button>

              {diffMetrics.totalChanges > 0 && (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className={`px-2.5 py-1 rounded-none text-[10.5px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                    isDarkMode
                      ? 'bg-white/5 hover:bg-white/15 text-zinc-300 border-white/15'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Descartar todos los cambios y restaurar desde csv_raw"
                >
                  <RotateCcw size={11} />
                  <span className="hidden sm:inline">Restaurar Base</span>
                </button>
              )}

              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className={`px-2.5 py-1 rounded-none text-[10.5px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
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

          {/* ── BARRA DESPLEGABLE DE EDICIÓN MASIVA (BULK EDIT) ── */}
          {showBulkBar && (
            <div
              className={`w-full px-3 py-2 border-b flex flex-wrap items-center justify-between gap-2 ${
                isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                <span className="font-bold uppercase tracking-wider text-[9.5px] opacity-80">
                  Aplicar a {filteredRows.length} productos:
                </span>

                <select
                  value={bulkColumn}
                  onChange={(e) => setBulkColumn(e.target.value)}
                  className={`px-2 py-1 rounded-none border text-[10.5px] font-semibold focus:outline-none ${
                    isDarkMode ? 'bg-[#09090b] border-white/15 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="List Price">List Price (Precio Base)</option>
                  {headers
                    .filter((h) => !BASE_HEADERS.includes(h))
                    .map((optCol) => (
                      <option key={optCol} value={optCol}>
                        Opción: {optCol}
                      </option>
                    ))}
                </select>

                <select
                  value={bulkMode}
                  onChange={(e) => setBulkMode(e.target.value)}
                  className={`px-2 py-1 rounded-none border text-[10.5px] font-semibold focus:outline-none ${
                    isDarkMode ? 'bg-[#09090b] border-white/15 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="percent">Incremento / Descuento (%)</option>
                  <option value="add">Sumar / Restar Monto ($)</option>
                  <option value="set">Fijar Precio Exacto ($)</option>
                </select>

                <input
                  type="number"
                  step="any"
                  placeholder={bulkMode === 'percent' ? 'Ej: 5 o -10' : 'Ej: 45'}
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  className={`w-24 px-2 py-1 rounded-none border text-[10.5px] font-mono font-bold focus:outline-none ${
                    isDarkMode ? 'bg-[#09090b] border-white/20 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />

                <button
                  type="button"
                  onClick={handleApplyBulkUpdate}
                  disabled={bulkValue === ''}
                  className={`px-3 py-1 rounded-none text-[10.5px] font-bold cursor-pointer transition-all disabled:opacity-40 ${
                    isDarkMode ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-[#18181b] text-white hover:bg-zinc-800'
                  }`}
                >
                  Aplicar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowBulkBar(false)}
                className="text-[10.5px] opacity-70 hover:opacity-100 cursor-pointer flex items-center gap-1"
              >
                <X size={12} /> Cerrar
              </button>
            </div>
          )}

          {/* ── MODAL DE CONFIRMACIÓN PARA RESTAURAR MATRIZ BASE ── */}
          {showResetConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <div
                className={`max-w-sm w-full rounded-none p-5 border shadow-2xl ${
                  isDarkMode ? 'bg-[#09090b] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <h4 className="text-sm font-bold mb-1.5">¿Restaurar matriz a valores originales?</h4>
                <p className={`text-xs leading-relaxed mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Se descartarán las <strong>{diffMetrics.totalChanges} modificaciones</strong> actuales en{' '}
                  <code className="font-mono">csv_edit_raw</code> y volverá a ser idéntica a <code className="font-mono">csv_raw</code>.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className={`px-3 py-1.5 rounded-none text-xs font-semibold border cursor-pointer ${
                      isDarkMode ? 'border-white/15 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-100'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAllToBase}
                    className={`px-3 py-1.5 rounded-none text-xs font-bold cursor-pointer ${
                      isDarkMode ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-[#18181b] text-white hover:bg-zinc-800'
                    }`}
                  >
                    Sí, restaurar todo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ÁREA DE LA TABLA INTERACTIVA CON SCROLL CONTINUO VIRTUALIZADO ── */}
          <div
            ref={tableScrollRef}
            onScroll={handleTableScroll}
            className={`flex-1 w-full min-h-0 overflow-auto relative custom-scrollbar ${
              isDarkMode ? 'bg-transparent' : 'bg-white/90'
            }`}
          >
            {filteredRows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-transparent">
                <div className={`w-9 h-9 rounded-none flex items-center justify-center mb-2 border ${
                  isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
                }`}>
                  <Search className={`w-4 h-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`} />
                </div>
                <h4 className={`text-[11px] font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                  No se encontraron productos con el filtro actual
                </h4>
                {filterMode !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`mt-2 text-[10.5px] font-bold underline cursor-pointer ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Mostrar todos los productos
                  </button>
                )}
              </div>
            ) : (
              <table className="table-auto border-collapse text-left text-[10px] w-full min-w-[700px] bg-transparent">
                <thead
                  className={`sticky top-0 z-20 backdrop-blur-md border-b ${
                    isDarkMode ? 'bg-zinc-900/95 border-white/10' : 'bg-slate-100/95 border-slate-200'
                  }`}
                >
                  <tr>
                    {/* Columna de acción (Baja / Estado) */}
                    <th
                      className={`w-10 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider sticky left-0 z-30 border-r border-b select-none ${
                        isDarkMode
                          ? 'text-zinc-400 bg-zinc-900/95 border-white/10'
                          : 'text-slate-500 bg-slate-100/95 border-slate-200'
                      }`}
                    >
                      #
                    </th>
                    {headers.map((h) => (
                      <th
                        key={h}
                        className={`px-3 py-2 text-[10px] font-bold border-r border-b whitespace-nowrap truncate uppercase tracking-wider select-none bg-transparent ${
                          isDarkMode ? 'text-zinc-300 border-white/10' : 'text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span>{h || '(Empty)'}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className={`bg-transparent divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
                  {virtualWindow.topSpacerHeight > 0 && (
                    <tr aria-hidden="true" style={{ height: `${virtualWindow.topSpacerHeight}px` }}>
                      <td colSpan={headers.length + 1} className="p-0 border-0" />
                    </tr>
                  )}

                  {virtualWindow.visibleRows.map(({ row, originalIdx }, localIdx) => {
                    const filteredIdx = virtualWindow.startIdx + localIdx;
                    const sku = String(row['Model #'] || '').trim();
                    const isRowDeleted = deletedSkus.has(sku);
                    const isNewRow = !!row._isNewRow;
                    const baseRow = baseRowMap.get(sku);

                    return (
                      <tr
                        key={`${sku}-${originalIdx}`}
                        style={{ height: `${ROW_HEIGHT}px` }}
                        className={`transition-colors group bg-transparent ${
                          isRowDeleted
                            ? 'opacity-40 line-through'
                            : isDarkMode
                              ? 'hover:bg-white/[0.04]'
                              : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Celda de Acción (Eliminar / Restaurar fila) */}
                        <td
                          className={`px-2 py-1 text-center text-[9.5px] font-bold border-r border-b sticky left-0 z-10 font-mono select-none ${
                            isDarkMode
                              ? 'text-zinc-400 border-white/5 bg-zinc-900/95 group-hover:bg-zinc-800/95'
                              : 'text-slate-500 border-slate-100 bg-slate-50/95 group-hover:bg-slate-100'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleDeleteRow(originalIdx)}
                            className={`p-0.5 rounded-none transition-colors cursor-pointer ${
                              isDarkMode
                                ? 'text-zinc-400 hover:text-white'
                                : 'text-slate-400 hover:text-slate-900'
                            }`}
                            title={isRowDeleted ? 'Restaurar producto al catálogo' : 'Dar de baja este producto en csv_edit_raw'}
                          >
                            {isRowDeleted ? <Undo2 size={11} /> : <Trash2 size={11} />}
                          </button>
                        </td>

                        {headers.map((colKey, colIdx) => {
                          const isSkuCol = colIdx === 0;
                          const isPriceCol = colIdx === 1;
                          const isOptionCol = colIdx >= 5;
                          const isNumeric = isPriceCol || isOptionCol;
                          const isHighlight = colKey === 'Model #' || colKey === 'List Price';

                          const currentVal = row[colKey];
                          const origVal = baseRow ? baseRow[colKey] : '';
                          const cellChanged = !isRowDeleted && !isSkuCol && isCellModified(row, colKey);
                          const isEditingThis =
                            activeCell?.rowIdx === originalIdx && activeCell?.colKey === colKey;

                          return (
                            <td
                              key={colKey}
                              onClick={() => startCellEdit(originalIdx, colKey, currentVal, isRowDeleted)}
                              className={`p-0 border-r border-b whitespace-nowrap relative transition-all ${
                                isDarkMode ? 'border-white/5' : 'border-slate-100'
                              } ${
                                isSkuCol ? '' : 'cursor-text'
                              } ${
                                cellChanged
                                  ? isDarkMode
                                    ? 'bg-white/[0.08] ring-1 ring-inset ring-white/25'
                                  : 'bg-slate-100 ring-1 ring-inset ring-slate-300'
                                : 'bg-transparent'
                              }`}
                            >
                              {isEditingThis ? (
                                <input
                                  ref={cellInputRef}
                                  type={isNumeric ? 'number' : 'text'}
                                  step="any"
                                  value={cellDraft}
                                  onChange={(e) => handleCellDraftChange(e.target.value)}
                                  onBlur={() => {
                                    commitCellEdit(activeCell, cellDraft, true);
                                    setActiveCell(null);
                                  }}
                                  onKeyDown={(e) => handleCellKeyDown(e, filteredIdx, colIdx)}
                                  className={`w-full min-w-[75px] px-2.5 py-1 rounded-none text-[10.5px] font-mono focus:outline-none ring-1 ${
                                    isDarkMode
                                      ? 'bg-[#09090b] text-white ring-white'
                                      : 'bg-white text-slate-950 ring-slate-900'
                                  }`}
                                />
                              ) : (
                                <div
                                  className={`px-3 py-1 text-[10.5px] flex items-center justify-between gap-1.5 h-[28px] ${
                                    isHighlight || cellChanged
                                      ? isDarkMode
                                        ? 'font-bold text-white font-mono'
                                        : 'font-bold text-slate-900 font-mono'
                                      : isDarkMode
                                        ? 'font-medium text-zinc-300'
                                        : 'font-medium text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    {isSkuCol && isNewRow && (
                                      <span
                                        className={`px-1 py-0.2 rounded-none text-[8px] font-extrabold uppercase ${
                                          isDarkMode ? 'bg-white text-zinc-950' : 'bg-[#18181b] text-white'
                                        }`}
                                      >
                                        NEW
                                      </span>
                                    )}
                                    <span className={colKey === 'Model Name' ? 'max-w-[230px] truncate block' : ''}>
                                      {currentVal !== '' && currentVal !== undefined && currentVal !== null ? (
                                        isPriceCol && !Number.isNaN(Number(currentVal)) && Number(currentVal) > 0 ? (
                                          `$${Number(currentVal).toLocaleString()}`
                                        ) : (
                                          String(currentVal)
                                        )
                                      ) : (
                                        ''
                                      )}
                                    </span>
                                  </div>

                                  {/* Si la celda fue modificada respecto a csv_raw, mostrar valor previo y botón revertir */}
                                  {cellChanged && !isNewRow && (
                                    <div className="flex items-center gap-1 shrink-0">
                                      <span
                                        className={`text-[9px] font-mono line-through opacity-55 ${
                                          isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                                        }`}
                                        title={`Valor original en csv_raw: ${origVal !== '' ? origVal : 'Vacío'}`}
                                      >
                                        {origVal !== '' && origVal !== undefined && origVal !== null
                                          ? isPriceCol
                                            ? `$${origVal}`
                                            : String(origVal).slice(0, 10)
                                          : 'vacío'}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => revertSingleCell(originalIdx, colKey, e)}
                                        className={`p-0.5 rounded-none transition-colors cursor-pointer ${
                                          isDarkMode ? 'text-zinc-300 hover:text-white' : 'text-slate-600 hover:text-black'
                                        }`}
                                        title="Restaurar celda al valor original de csv_raw"
                                      >
                                        <RotateCcw size={10} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
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

          {/* ── BARRA DE ESTADO INFERIOR (SIN PAGINACIÓN, CON RESUMEN DE FILAS) ── */}
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
                <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{editRows.length}</strong> rows
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

        {/* ── COLUMNA DERECHA (28-30%): INTERFAZ DE CHAT ALYSA COMPACTA ── */}
        <aside
          className={`w-full lg:w-[30%] xl:w-[28%] shrink-0 h-[340px] lg:h-full border-t lg:border-t-0 lg:border-l flex flex-col overflow-hidden relative ${
            isDarkMode ? 'bg-transparent border-white/10' : 'bg-white/60 border-slate-200'
          }`}
        >
          {/* Área de mensajes del chat conectado al MCP del Backend */}
          {/* `select-text` anula el `select-none` del contenedor raíz para permitir seleccionar y copiar mensajes */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-4 space-y-3.5 custom-scrollbar select-text cursor-text">
            <div className="flex items-start gap-2.5">
              {/* Avatar oficial de Alysa */}
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

              {/* Contenido del mensaje inicial de Alysa con contenedor tipo mensaje */}
              <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                <div className="flex items-baseline gap-1.5 px-0.5">
                  <span className={`text-[10px] font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Alysa
                  </span>
                  <span className={`text-[9px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                    mcp::csv_edit_matrix + RAG
                  </span>
                </div>

                <div
                  className={`p-3 border rounded-none text-[11px] leading-relaxed space-y-2 shadow-sm ${
                    isDarkMode
                      ? 'bg-[#09090b]/80 border-white/10 text-zinc-300 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                      : 'bg-white border-slate-200 text-gray-700 shadow-xs'
                  }`}
                >
                  <p>
                    Bienvenido al <strong className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>Catalog Matrix Live Editor</strong>. Estoy conectada mediante RAG y el servidor <code className={`px-1 py-0.5 text-[10px] font-mono border ${isDarkMode ? 'bg-white/5 border-white/10 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>CsvEditMatrixMCP</code> exclusivamente sobre <code className={`px-1 py-0.5 text-[10px] font-mono border ${isDarkMode ? 'bg-white/5 border-white/10 text-zinc-200' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>csv_edit_raw</code>.
                  </p>

                  <p className={`text-[10px] font-bold uppercase tracking-wider pt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Funciones MCP activas en este panel:
                  </p>

                  <ul className="space-y-1.5 pl-3.5 list-disc text-[10.5px]">
                    <li>
                      <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Filtrar por precios:</strong> Consulta precios mayores, menores, rangos o rankings (ej. <em>&ldquo;productos mayores a $500&rdquo;</em> o <em>&ldquo;los 10 más baratos&rdquo;</em>).
                    </li>
                    <li>
                      <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Filtrar por categoría:</strong> Filtra por <code className="font-mono text-[9.5px]">Classic/ Premium</code>, línea de SKU o tipo de mueble.
                    </li>
                    <li>
                      <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>Búsqueda RAG de SKUs:</strong> Consulta cualquier <code className="font-mono text-[9.5px]">Model #</code> o descripción en tiempo real.
                    </li>
                  </ul>

                  {/* Selector interactivo y categorizado de herramientas y filtros MCP */}
                  <div className="pt-2 space-y-2 border-t border-white/10">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
                        <SlidersHorizontal size={11} />
                        Opciones de Recargo & Tiers XML
                        <span className="opacity-60 text-[9px]">({(catalogFacets.options || []).length} filtros)</span>
                      </span>

                      {/* Selector compacto de Familias de Modelo XML */}
                      {Array.isArray(catalogFacets.familias) && catalogFacets.familias.length > 0 && (
                        <div className="flex items-center gap-1">
                          <label className="text-[9px] font-mono opacity-60">Familia:</label>
                          <select
                            value={selectedFamilyFilter}
                            onChange={(e) => {
                              const famVal = e.target.value;
                              setSelectedFamilyFilter(famVal);
                              if (!famVal) {
                                if (mcpActiveSkuFilter?.label?.startsWith('Familia ')) {
                                  setMcpActiveSkuFilter(null);
                                }
                              } else {
                                const targetFam = catalogFacets.familias.find((f) => f.label === `Familia ${famVal}`);
                                if (targetFam) {
                                  handleSendMatrixChat(targetFam.prompt, targetFam.toolCall, targetFam.skus, targetFam.label);
                                }
                              }
                            }}
                            className={`px-1.5 py-0.5 text-[9px] font-mono border rounded-none cursor-pointer outline-none transition-colors ${
                              isDarkMode
                                ? 'bg-zinc-900 border-white/20 text-zinc-200 hover:border-white/40'
                                : 'bg-white border-slate-300 text-slate-800 hover:border-slate-500'
                            }`}
                          >
                            <option value="">Todas las familias ({catalogFacets.familias.length})</option>
                            {catalogFacets.familias.map((f) => {
                              const cleanName = f.label.replace('Familia ', '');
                              return (
                                <option key={f.id} value={cleanName}>
                                  {cleanName} ({f.badge})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Banner de Auditoría de Esquema XML: Alerta preventiva o indicador de salud */}
                    {Array.isArray(catalogFacets.calidad) && catalogFacets.calidad.length > 0 ? (
                      <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[9.5px] font-mono flex flex-wrap items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <AlertCircle size={11} className="text-amber-400 shrink-0" />
                          <span className="font-bold">Inconsistencias XML detectadas:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1">
                          {catalogFacets.calidad.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => handleSendMatrixChat(f.prompt, f.toolCall, f.skus, f.label)}
                              className="px-1.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/35 border border-amber-500/40 text-amber-100 text-[8.5px] cursor-pointer flex items-center gap-1"
                            >
                              <span>{f.label}</span>
                              <span className="font-bold">({f.badge})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400/90 pt-0.5">
                        <CheckCircle2 size={10.5} className="text-emerald-400 shrink-0" />
                        <span>Esquema XML 100% íntegro (Precios base, pesos y descripciones validados)</span>
                      </div>
                    )}

                    {/* Chips inteligentes: Modelos Base, Configurables y Tiers de Recargo de cada Opción */}
                    <div className="flex flex-wrap gap-1.5 pt-1 max-h-[190px] overflow-y-auto custom-scrollbar pr-0.5">
                      {(catalogFacets.options || []).length === 0 ? (
                        <div className="text-[10px] font-mono opacity-60 italic py-1">
                          No hay columnas de opciones comerciales en esta matriz.
                        </div>
                      ) : (
                        (catalogFacets.options || []).map((f) => {
                          const isCurrentlyApplied = mcpActiveSkuFilter?.label === f.label;
                          return (
                            <div
                              key={f.id}
                              className={`inline-flex items-center border rounded-none text-[9.5px] font-mono transition-all ${
                                isCurrentlyApplied
                                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                                  : isDarkMode
                                    ? 'bg-white/5 border-white/10 text-zinc-300 hover:border-white/30'
                                    : 'bg-slate-100 border-slate-200 text-slate-800 hover:border-slate-400'
                              }`}
                            >
                              {/* Botón principal: Consulta MCP + Análisis RAG */}
                              <button
                                type="button"
                                onClick={() => handleSendMatrixChat(f.prompt, f.toolCall, f.skus, f.label)}
                                title={`Consultar análisis MCP: "${f.prompt}"`}
                                className="px-2 py-1 flex items-center gap-1.5 cursor-pointer hover:underline"
                              >
                                {f.isAudit && <AlertCircle size={9.5} className="text-amber-400 shrink-0" />}
                                <span>{f.label}</span>
                                <span
                                  className={`px-1 py-0.2 rounded-none text-[8.5px] ${
                                    isCurrentlyApplied
                                      ? 'bg-emerald-500 text-zinc-950 font-bold'
                                      : isDarkMode
                                        ? 'bg-white/10 text-zinc-200'
                                        : 'bg-slate-200 text-slate-700 font-semibold'
                                  }`}
                                >
                                  {f.badge}
                                </span>
                              </button>

                              {/* Botón secundario: Aplicar directo en tabla (0ms) */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isCurrentlyApplied) {
                                    setMcpActiveSkuFilter(null);
                                  } else {
                                    setMcpActiveSkuFilter({
                                      label: f.label,
                                      skuSet: new Set(f.skus)
                                    });
                                  }
                                }}
                                title={isCurrentlyApplied ? 'Quitar filtro de la tabla' : `Aislar ${f.badge} directamente en la tabla`}
                                className={`px-1.5 py-1 border-l transition-colors cursor-pointer flex items-center gap-0.5 ${
                                  isCurrentlyApplied
                                    ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                                    : isDarkMode
                                      ? 'border-white/10 hover:bg-white/20 text-zinc-300 hover:text-white'
                                      : 'border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-black'
                                }`}
                              >
                                {isCurrentlyApplied ? <Check size={10} /> : <Zap size={10} />}
                                <span className="text-[8.5px] font-sans uppercase font-bold tracking-wider">
                                  {isCurrentlyApplied ? 'Activo' : 'Tabla'}
                                </span>
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de mensajes dinámicos del MCP + RAG */}
            {chatMessages.map((msg) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div
                      className={`max-w-[88%] px-3 py-2 border rounded-none text-[11px] leading-relaxed ${
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
                      className={`p-3 border rounded-none text-[11px] leading-relaxed space-y-2 shadow-sm overflow-x-auto ${
                        isDarkMode
                          ? 'bg-[#09090b]/80 border-white/10 text-zinc-300 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
                          : 'bg-white border-slate-200 text-gray-700 shadow-xs'
                      }`}
                    >
                      {/* Badges de trazabilidad de herramientas MCP ejecutadas en el backend */}
                      {Array.isArray(msg.mcpTraces) && msg.mcpTraces.length > 0 && (
                        <div className="flex flex-wrap gap-1 pb-1 border-b border-white/10">
                          {msg.mcpTraces.map((tr, idx) => (
                            <span
                              key={`${tr.tool}-${idx}`}
                              className={`px-1.5 py-0.5 text-[9px] font-mono border rounded-none ${
                                isDarkMode
                                  ? 'bg-white/5 border-white/10 text-zinc-300'
                                  : 'bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                            >
                              {tr.tool.replace('mcp::csv_edit_matrix.', '')} · {tr.total_matches} hits ({tr.latency_ms}ms)
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="prose prose-xs max-w-none text-[10.5px] leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>

                      {/* Control MCP limpio y profesional para aislar o ver productos en tabla */}
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
                                  skuSet: new Set(msg.matchedSkus)
                                });
                              }
                            }}
                            className={`px-2 py-0.5 text-[9.5px] font-mono border rounded-none transition-all cursor-pointer flex items-center gap-1.5 ${
                              mcpActiveSkuFilter?.label === (msg.filterLabel || `${msg.matchedSkus.length} SKUs`)
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
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

                          <span className="text-[9px] font-mono opacity-50 italic">
                            💡 Pídele a Alysa: &quot;Súbele 5%&quot;, &quot;Cambia ese precio a $14&quot; o &quot;+$2 a -FG&quot;
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isMcpThinking && (
              <div className="flex items-center gap-2 px-1 py-1 text-[10px] font-mono opacity-75">
                <RefreshCw size={11} className="animate-spin" />
                <span>Ejecutando MCP + RAG sobre csv_edit_raw en backend...</span>
              </div>
            )}

            <div ref={chatScrollEndRef} />
          </div>

          {/* Footer con el Input compacto acoplado en la parte inferior */}
          <footer className="relative z-20 flex-shrink-0 px-3 pt-1 pb-2.5 bg-transparent border-t-0 w-full">
            <div
              className={`w-full ${
                isDarkMode
                  ? 'bg-[#09090b]/55 border-white/[0.12] text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)] focus-within:border-white/35 focus-within:bg-[#09090b]/70 focus-within:ring-2 focus-within:ring-white/[0.06]'
                  : 'bg-white/80 border-slate-200/80 text-gray-800 shadow-md focus-within:border-[#18181b]/50 focus-within:ring-2 focus-within:ring-[#18181b]/10'
              } backdrop-blur-2xl border rounded-none relative transition-all duration-300`}
            >
              {/* Área de Texto e Ícono */}
              <div className="flex flex-col px-2.5 pt-2 pb-0.5 w-full">
                <div className="flex items-start gap-2 w-full">
                  <Sparkles
                    size={12}
                    className={`mt-1 flex-shrink-0 transition-colors ${
                      isDarkMode ? 'text-zinc-300' : 'text-[#18181b]/60'
                    }`}
                  />
                  <textarea
                    rows={1}
                    value={chatInputUi}
                    onChange={(e) => setChatInputUi(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMatrixChat();
                      }
                    }}
                    placeholder="Filtra productos, precios > / < o categorías en csv_edit_raw…"
                    className={`flex-1 bg-transparent border-none outline-none resize-none text-[11px] ${
                      isDarkMode
                        ? 'text-zinc-100 placeholder-zinc-500 caret-white'
                        : 'text-gray-800 placeholder-gray-400 caret-[#18181b]'
                    } leading-relaxed min-h-[28px] max-h-[90px] overflow-y-auto font-sans`}
                  />
                </div>
              </div>

              {/* Barra inferior de acciones del Input */}
              <div className="flex items-center justify-between px-2.5 py-1.5">
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    title="Adjuntar referencia"
                    className={`w-6 h-6 rounded-none flex items-center justify-center transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-[#18181b]'
                    }`}
                  >
                    <Paperclip size={12} />
                  </button>
                  <button
                    type="button"
                    title="Voice Recording (Speech-to-Text)"
                    className={`w-6 h-6 rounded-none flex items-center justify-center transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-[#18181b]'
                    }`}
                  >
                    <Mic size={12} />
                  </button>
                  <button
                    type="button"
                    title="AI Guide & FAQ"
                    className={`w-6 h-6 rounded-none flex items-center justify-center transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-[#18181b]'
                    }`}
                  >
                    <HelpCircle size={12} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {chatInputUi.length > 0 && (
                    <span
                      className={`text-[9px] font-medium ${
                        isDarkMode
                          ? 'text-zinc-300 bg-white/5 border-white/10'
                          : 'text-gray-500 bg-white/80 border-gray-200/60'
                      } border px-1.5 py-0.5 rounded-none`}
                    >
                      {chatInputUi.length} chars
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSendMatrixChat()}
                    disabled={!chatInputUi.trim() || isMcpThinking}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-none text-[10px] font-semibold transition-all duration-200 ${
                      chatInputUi.trim() && !isMcpThinking
                        ? isDarkMode
                          ? 'bg-white text-zinc-950 shadow-sm hover:bg-zinc-200 font-bold cursor-pointer'
                          : 'bg-[#18181b] text-white shadow-sm hover:bg-[#27272a] cursor-pointer'
                        : isDarkMode
                          ? 'bg-white/10 text-zinc-500 border border-white/10 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <span>Send</span>
                    <SendHorizonal size={11} />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-center mt-1.5 text-[9px] text-gray-400 tracking-wide">
              © 2026 GLYNNE S.A.S. All rights reserved.
            </p>
          </footer>
        </aside>
      </div>
    </div>
  );
}

