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
  Zap
} from 'lucide-react';
import Papa from 'papaparse';

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

  // Filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'modified' | 'new_deleted'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

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
          .select('csv_raw, csv_edit_raw, xml_name, file_name')
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
        }
      } catch (_) {}

      if (!rawBaseCsv && typeof window !== 'undefined') {
        rawBaseCsv = sessionStorage.getItem('csv_raw') || '';
      }
      if (!rawEditCsv && typeof window !== 'undefined') {
        rawEditCsv = sessionStorage.getItem('csv_edit_raw') || localStorage.getItem('csv_edit_raw_General_Procces') || '';
      }

      setCatalogName(detectedName);

      if (!rawBaseCsv || !rawBaseCsv.trim()) {
        throw new Error('No se encontró la matriz base (csv_raw). Abre primero "Export Data Client" para generar la matriz.');
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

  // Filtrado de filas según búsqueda y pestaña activa
  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return editRows
      .map((row, originalIdx) => ({ row, originalIdx }))
      .filter(({ row }) => {
        const sku = String(row['Model #'] || '').trim();
        const isDeleted = deletedSkus.has(sku);
        const isNew = !!row._isNewRow || !baseRowMap.has(sku);
        const isMod = diffMetrics.modifiedSkuSet.has(sku);

        if (filterMode === 'modified' && !isMod && !isDeleted) return false;
        if (filterMode === 'new_deleted' && !isNew && !isDeleted) return false;

        if (!q) return true;
        return (
          sku.toLowerCase().includes(q) ||
          String(row['Model Name'] || '').toLowerCase().includes(q) ||
          String(row['Classic/ Premium'] || '').toLowerCase().includes(q)
        );
      });
  }, [editRows, searchTerm, filterMode, deletedSkus, baseRowMap, diffMetrics.modifiedSkuSet]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMode]);

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

  const handleCellKeyDown = (e, pagePosIdx, colIdx) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setActiveCell(null);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      commitCellEdit(activeCell, cellDraft, true);
      const nextPageRow = paginatedRows[pagePosIdx + 1];
      if (nextPageRow) {
        const colKey = headers[colIdx];
        startCellEdit(
          nextPageRow.originalIdx,
          colKey,
          nextPageRow.row[colKey],
          deletedSkus.has(String(nextPageRow.row['Model #'] || '').trim())
        );
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
      const currentRowObj = paginatedRows[pagePosIdx];
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
    setCurrentPage(1);
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

  // Aplicar ajuste masivo sobre las filas filtradas actualmente
  const handleApplyBulkUpdate = () => {
    const numVal = parseFloat(bulkValue);
    if (Number.isNaN(numVal)) return;

    const targetIndices = new Set(filteredRows.map((item) => item.originalIdx));
    const currentList = editRowsRef.current;
    const next = currentList.map((row, idx) => {
      if (!targetIndices.has(idx)) return row;
      const sku = String(row['Model #'] || '').trim();
      if (deletedSkusRef.current.has(sku)) return row;

      const currentRaw = row[bulkColumn];
      const currentNum = parseFloat(currentRaw || '0') || 0;
      let updatedNum = currentNum;

      if (bulkMode === 'percent') {
        if (currentNum <= 0) return row;
        updatedNum = Math.round(currentNum * (1 + numVal / 100) * 100) / 100;
      } else if (bulkMode === 'add') {
        if (currentNum <= 0 && numVal <= 0) return row;
        updatedNum = Math.round((currentNum + numVal) * 100) / 100;
      } else if (bulkMode === 'set') {
        updatedNum = Math.round(numVal * 100) / 100;
      }

      return {
        ...row,
        [bulkColumn]: updatedNum > 0 ? updatedNum : ''
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
      description: `Ajuste masivo (${bulkMode}: ${bulkValue}) aplicado en columna "${bulkColumn}" sobre ${targetIndices.size} productos.`
    });
    setBulkValue('');
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
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <RefreshCw size={16} className="animate-spin text-emerald-400" />
          <span className="text-xs font-semibold tracking-wide">
            Sincronizando matriz base (<code className="font-mono text-emerald-400">csv_raw</code> ➔ <code className="font-mono text-amber-300">csv_edit_raw</code>)...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-12 px-4 text-center font-sans">
        <AlertCircle className="text-rose-400 mb-2" size={28} />
        <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-1`}>
          Matriz Base No Disponible
        </h3>
        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} max-w-md mb-4`}>{error}</p>
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                isDarkMode ? 'bg-white/10 hover:bg-white/15 text-white border-white/15' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
              }`}
            >
              <ArrowLeft size={13} /> Volver
            </button>
          )}
          <button
            onClick={loadEditorData}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer"
          >
            <RefreshCw size={13} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col font-sans antialiased select-none ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
      {/* ── BARRA SUPERIOR ARQUITECTÓNICA DEL EDITOR ── */}
      <div
        className={`w-full flex flex-wrap items-center justify-between gap-2.5 px-3 sm:px-5 py-2.5 border-b backdrop-blur-2xl ${
          isDarkMode ? 'bg-[#09090b]/85 border-white/10' : 'bg-white/90 border-slate-200 shadow-xs'
        }`}
      >
        {/* Izquierda: Regreso + Título + Estado csv_edit_raw */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              type="button"
              onClick={() => {
                if (activeCell) commitCellEdit(activeCell, cellDraft);
                onBack();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
              title="Volver al panel principal"
            >
              <ArrowLeft size={13} />
              <span>Volver</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
              isDarkMode ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <FileSpreadsheet size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xs sm:text-sm font-bold tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Catalog Matrix Live Editor
                </h2>
                <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                  isDarkMode ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  csv_edit_raw
                </span>
              </div>
              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Catálogo: <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{catalogName}</strong> · Haz clic en cualquier celda para editar precios u opciones en tiempo real
              </p>
            </div>
          </div>

          {/* Indicador de autoguardado en csv_edit_raw */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
              syncStatus === 'saving'
                ? isDarkMode
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
                : isDarkMode
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {syncStatus === 'saving' ? (
              <>
                <RefreshCw size={10} className="animate-spin" />
                <span>Guardando en csv_edit_raw...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={11} />
                <span>Sincronizado en csv_edit_raw {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
              </>
            )}
          </div>
        </div>

        {/* Derecha: Resumen de cambios + Botón Ejecutar Comparación */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Píldora contadora de cambios */}
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
            diffMetrics.totalChanges > 0
              ? isDarkMode
                ? 'bg-amber-500/15 border-amber-500/35 text-amber-200'
                : 'bg-amber-50 border-amber-300 text-amber-900'
              : isDarkMode
                ? 'bg-white/5 border-white/10 text-zinc-400'
                : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <span>
              <strong>{diffMetrics.modifiedCellsCount}</strong> celdas editadas
            </span>
            {(diffMetrics.newProductsCount > 0 || diffMetrics.deletedCount > 0) && (
              <span className="opacity-80">
                · <strong>+{diffMetrics.newProductsCount}</strong> / <strong>-{diffMetrics.deletedCount}</strong> filas
              </span>
            )}
          </div>

          {/* Botón Guardar Ahora */}
          <button
            type="button"
            onClick={() => {
              if (activeCell) commitCellEdit(activeCell, cellDraft);
              persistCsvEditRaw(editRows, deletedSkus, headers, true);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
            }`}
            title="Forzar guardado inmediato en csv_edit_raw"
          >
            <Save size={12} />
            <span className="hidden sm:inline">Guardar</span>
          </button>

          {/* Botón Principal: Ejecutar Comparación (csv_raw vs csv_edit_raw) */}
          <button
            type="button"
            disabled={isRunningAudit}
            onClick={handleExecuteComparison}
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
              isDarkMode
                ? 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'bg-[#18181b] hover:bg-slate-800 text-white'
            } disabled:opacity-50`}
          >
            {isRunningAudit ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>Ejecutando Auditoría...</span>
              </>
            ) : (
              <>
                <Zap size={13} className={isDarkMode ? 'text-amber-600 fill-amber-500' : 'text-amber-400 fill-amber-400'} />
                <span>Ejecutar Comparación y Actualizar</span>
                {diffMetrics.totalChanges > 0 && (
                  <span className={`ml-0.5 px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                    isDarkMode ? 'bg-zinc-900 text-amber-300' : 'bg-white/20 text-white'
                  }`}>
                    {diffMetrics.totalChanges}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── SUB-BARRA DE HERRAMIENTAS: BÚSQUEDA, FILTROS Y ACCIONES RÁPIDAS ── */}
      <div
        className={`w-full flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-2 border-b ${
          isDarkMode ? 'bg-[#09090b]/60 border-white/10' : 'bg-slate-50/90 border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Buscador */}
          <div className="relative flex items-center">
            <Search size={12} className={`absolute left-2.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'} pointer-events-none`} />
            <input
              type="text"
              placeholder="Buscar por Model # o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-lg pl-7 pr-7 py-1 text-[11px] w-[180px] sm:w-[240px] focus:outline-none border transition-all ${
                isDarkMode
                  ? 'bg-white/5 border-white/15 text-white placeholder:text-zinc-500 focus:border-white/35 focus:bg-white/10'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400'
              }`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Pestañas de filtro */}
          <div className={`flex items-center p-0.5 rounded-lg border ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-200/70 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? isDarkMode
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'bg-white text-slate-900 shadow-xs'
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
              className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === 'modified'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                  : isDarkMode
                    ? 'text-zinc-400 hover:text-amber-300'
                    : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <span>Modificados ({diffMetrics.modifiedRowsCount})</span>
            </button>
            {(diffMetrics.newProductsCount > 0 || diffMetrics.deletedCount > 0) && (
              <button
                type="button"
                onClick={() => setFilterMode('new_deleted')}
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold transition-all cursor-pointer ${
                  filterMode === 'new_deleted'
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow-xs'
                    : isDarkMode
                      ? 'text-zinc-400 hover:text-emerald-300'
                      : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Altas / Bajas ({diffMetrics.newProductsCount + diffMetrics.deletedCount})
              </button>
            )}
          </div>
        </div>

        {/* Acciones de matriz: Nuevo Producto, Ajuste Masivo, Restaurar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleAddNewProduct}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}
          >
            <Plus size={12} />
            <span>Nuevo Producto</span>
          </button>

          <button
            type="button"
            onClick={() => setShowBulkBar((v) => !v)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
              showBulkBar
                ? isDarkMode
                  ? 'bg-white text-zinc-950 border-white'
                  : 'bg-slate-900 text-white border-slate-900'
                : isDarkMode
                  ? 'bg-white/5 hover:bg-white/15 text-zinc-200 border-white/15'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <SlidersHorizontal size={12} />
            <span>Ajuste en Lote</span>
          </button>

          {diffMetrics.totalChanges > 0 && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/25'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              }`}
              title="Descartar todos los cambios y restaurar desde csv_raw"
            >
              <RotateCcw size={11} />
              <span className="hidden sm:inline">Restaurar Base</span>
            </button>
          )}
        </div>
      </div>

      {/* ── BARRA DESPLEGABLE DE EDICIÓN MASIVA (BULK EDIT) ── */}
      {showBulkBar && (
        <div
          className={`w-full px-3 sm:px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 ${
            isDarkMode ? 'bg-white/[0.04] border-white/10' : 'bg-amber-50/60 border-amber-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-bold uppercase tracking-wider text-[10px] opacity-80">
              Aplicar a {filteredRows.length} productos visibles:
            </span>

            <select
              value={bulkColumn}
              onChange={(e) => setBulkColumn(e.target.value)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold focus:outline-none ${
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
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold focus:outline-none ${
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
              className={`w-28 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold focus:outline-none ${
                isDarkMode ? 'bg-[#09090b] border-white/20 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />

            <button
              type="button"
              onClick={handleApplyBulkUpdate}
              disabled={bulkValue === ''}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all disabled:opacity-40 ${
                isDarkMode ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              Aplicar
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowBulkBar(false)}
            className="text-[11px] opacity-70 hover:opacity-100 cursor-pointer flex items-center gap-1"
          >
            <X size={13} /> Cerrar
          </button>
        </div>
      )}

      {/* ── MODAL DE CONFIRMACIÓN PARA RESTAURAR MATRIZ BASE ── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className={`max-w-sm w-full rounded-2xl p-5 border shadow-2xl ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  isDarkMode ? 'border-white/15 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-slate-100'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetAllToBase}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
              >
                Sí, restaurar todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ÁREA DE LA HOJA DE CÁLCULO INTERACTIVA (EXCEL-LIKE GRID) ── */}
      <div className="flex-1 w-full min-h-0 overflow-auto relative custom-scrollbar px-2 sm:px-4 py-2">
        {paginatedRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className={`w-7 h-7 mb-2 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
            <p className="text-xs font-semibold">No se encontraron productos con el filtro actual</p>
            {filterMode !== 'all' && (
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className="mt-2 text-[11px] font-bold text-emerald-400 underline cursor-pointer"
              >
                Mostrar todos los productos
              </button>
            )}
          </div>
        ) : (
          <div
            className={`w-full rounded-xl border overflow-x-auto custom-scrollbar ${
              isDarkMode ? 'border-white/10 bg-[#09090b]/70' : 'border-slate-200 bg-white shadow-xs'
            }`}
          >
            <table className="w-full border-collapse text-left text-[11px]">
              <thead
                className={`sticky top-0 z-20 backdrop-blur-xl border-b ${
                  isDarkMode ? 'bg-[#121215]/95 border-white/15 text-zinc-200' : 'bg-slate-900 text-white border-slate-800'
                }`}
              >
                <tr>
                  {/* Columna de acción (Baja / Estado) */}
                  <th className="py-2.5 px-2.5 text-center font-bold uppercase text-[9.5px] tracking-wider w-12 border-r border-white/10">
                    Acción
                  </th>
                  {headers.map((h, idx) => {
                    const isBase = idx < 5;
                    const isSkuCol = idx === 0;
                    return (
                      <th
                        key={h}
                        className={`py-2.5 px-3 font-bold uppercase text-[9.5px] tracking-wider whitespace-nowrap border-r ${
                          isDarkMode ? 'border-white/10' : 'border-slate-700'
                        } ${
                          isSkuCol
                            ? isDarkMode
                              ? 'sticky left-0 z-30 bg-[#121215] text-white shadow-[2px_0_6px_rgba(0,0,0,0.4)]'
                              : 'sticky left-0 z-30 bg-slate-900 text-white'
                            : isBase
                              ? ''
                              : isDarkMode
                                ? 'bg-sky-950/50 text-sky-200'
                                : 'bg-sky-900 text-sky-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{h}</span>
                          {!isSkuCol && (
                            <span className="text-[8px] font-normal opacity-55 lowercase">(editable)</span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-200'}`}>
                {paginatedRows.map(({ row, originalIdx }, pagePosIdx) => {
                  const sku = String(row['Model #'] || '').trim();
                  const isRowDeleted = deletedSkus.has(sku);
                  const isNewRow = !!row._isNewRow;
                  const baseRow = baseRowMap.get(sku);

                  return (
                    <tr
                      key={`${sku}-${originalIdx}`}
                      className={`transition-colors ${
                        isRowDeleted
                          ? isDarkMode
                            ? 'bg-rose-950/25 opacity-55 line-through'
                            : 'bg-rose-50 opacity-60 line-through'
                          : isNewRow
                            ? isDarkMode
                              ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                              : 'bg-emerald-50/60 hover:bg-emerald-50'
                            : pagePosIdx % 2 === 1
                              ? isDarkMode
                                ? 'bg-white/[0.015] hover:bg-white/[0.04]'
                                : 'bg-slate-50/70 hover:bg-slate-100/70'
                              : isDarkMode
                                ? 'hover:bg-white/[0.04]'
                                : 'hover:bg-slate-100/70'
                      }`}
                    >
                      {/* Celda de Acción (Eliminar / Restaurar fila) */}
                      <td className={`py-1.5 px-2 text-center border-r ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        <button
                          type="button"
                          onClick={() => handleToggleDeleteRow(originalIdx)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            isRowDeleted
                              ? 'text-amber-400 hover:bg-amber-500/20'
                              : 'text-zinc-500 hover:text-rose-400 hover:bg-rose-500/15'
                          }`}
                          title={isRowDeleted ? 'Restaurar producto al catálogo' : 'Dar de baja este producto en csv_edit_raw'}
                        >
                          {isRowDeleted ? <Undo2 size={12} /> : <Trash2 size={12} />}
                        </button>
                      </td>

                      {headers.map((colKey, colIdx) => {
                        const isSkuCol = colIdx === 0;
                        const isPriceCol = colIdx === 1;
                        const isOptionCol = colIdx >= 5;
                        const isNumeric = isPriceCol || isOptionCol;

                        const currentVal = row[colKey];
                        const origVal = baseRow ? baseRow[colKey] : '';
                        const cellChanged = !isRowDeleted && !isSkuCol && isCellModified(row, colKey);
                        const isEditingThis =
                          activeCell?.rowIdx === originalIdx && activeCell?.colKey === colKey;

                        return (
                          <td
                            key={colKey}
                            onClick={() => startCellEdit(originalIdx, colKey, currentVal, isRowDeleted)}
                            className={`py-1.5 px-2.5 whitespace-nowrap border-r relative group transition-all ${
                              isDarkMode ? 'border-white/5' : 'border-slate-100'
                            } ${
                              isSkuCol
                                ? isDarkMode
                                  ? 'sticky left-0 z-10 bg-[#0d0d10] font-mono font-bold text-white shadow-[2px_0_6px_rgba(0,0,0,0.35)]'
                                  : 'sticky left-0 z-10 bg-slate-50 font-mono font-bold text-slate-900'
                                : 'cursor-text'
                            } ${
                              cellChanged
                                ? isDarkMode
                                  ? 'bg-amber-500/15 text-amber-200 font-bold ring-1 ring-inset ring-amber-400/40'
                                  : 'bg-amber-50 text-amber-900 font-bold ring-1 ring-inset ring-amber-300'
                                : isPriceCol
                                  ? isDarkMode
                                    ? 'bg-emerald-500/[0.06] text-emerald-300 font-mono font-semibold'
                                    : 'bg-emerald-50/50 text-emerald-800 font-mono font-semibold'
                                  : isOptionCol && currentVal !== '' && Number(currentVal) > 0
                                    ? isDarkMode
                                      ? 'bg-sky-500/[0.07] text-sky-300 font-mono font-semibold'
                                      : 'bg-sky-50/60 text-sky-800 font-mono font-semibold'
                                    : ''
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
                                onKeyDown={(e) => handleCellKeyDown(e, pagePosIdx, colIdx)}
                                className={`w-full min-w-[75px] px-1.5 py-0.5 rounded text-[11px] font-mono focus:outline-none ring-2 ${
                                  isDarkMode
                                    ? 'bg-[#09090b] text-white ring-emerald-400'
                                    : 'bg-white text-slate-950 ring-slate-900'
                                }`}
                              />
                            ) : (
                              <div className="flex items-center justify-between gap-1.5 min-h-[20px]">
                                <div className="flex items-center gap-1.5 truncate">
                                  {isSkuCol && isNewRow && (
                                    <span className="px-1 py-0.2 rounded text-[8.5px] font-extrabold bg-emerald-500 text-zinc-950 uppercase">
                                      NEW
                                    </span>
                                  )}
                                  <span className={colKey === 'Model Name' ? 'max-w-[230px] truncate block' : ''}>
                                    {currentVal !== '' && currentVal !== undefined && currentVal !== null ? (
                                      isNumeric && !Number.isNaN(Number(currentVal)) && Number(currentVal) > 0 ? (
                                        `$${Number(currentVal).toLocaleString('en-US', {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 2
                                        })}`
                                      ) : (
                                        String(currentVal)
                                      )
                                    ) : (
                                      <span className="opacity-20">—</span>
                                    )}
                                  </span>
                                </div>

                                {/* Si la celda fue modificada respecto a csv_raw, mostrar valor previo y botón revertir */}
                                {cellChanged && !isNewRow && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span
                                      className={`text-[9px] font-mono line-through opacity-65 ${
                                        isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                                      }`}
                                      title={`Valor original en csv_raw: ${origVal !== '' ? origVal : 'Vacío'}`}
                                    >
                                      {origVal !== '' && origVal !== undefined && origVal !== null
                                        ? isNumeric
                                          ? `$${origVal}`
                                          : String(origVal).slice(0, 10)
                                        : 'vacío'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => revertSingleCell(originalIdx, colKey, e)}
                                      className={`p-0.5 rounded hover:bg-black/20 transition-colors cursor-pointer ${
                                        isDarkMode ? 'text-amber-300 hover:text-white' : 'text-amber-800 hover:text-black'
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
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── FOOTER DE PAGINACIÓN Y ESTADO ── */}
      <div
        className={`w-full flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-2 border-t text-[11px] ${
          isDarkMode ? 'bg-[#09090b]/90 border-white/10 text-zinc-400' : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <span>
            Mostrando <strong>{paginatedRows.length}</strong> de <strong>{filteredRows.length}</strong> productos
          </span>
          <span className="hidden sm:inline opacity-60">|</span>
          <span className="hidden sm:inline">
            Navegación rápida: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono">Click</kbd> editar ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono">Enter</kbd> bajar ·{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono">Tab</kbd> siguiente columna
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(1)}
            className="p-1 rounded border border-white/10 disabled:opacity-30 cursor-pointer hover:bg-white/10"
          >
            <ChevronsLeft size={13} />
          </button>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded border border-white/10 disabled:opacity-30 cursor-pointer hover:bg-white/10"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="px-2.5 font-semibold">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded border border-white/10 disabled:opacity-30 cursor-pointer hover:bg-white/10"
          >
            <ChevronRight size={13} />
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="p-1 rounded border border-white/10 disabled:opacity-30 cursor-pointer hover:bg-white/10"
          >
            <ChevronsRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

