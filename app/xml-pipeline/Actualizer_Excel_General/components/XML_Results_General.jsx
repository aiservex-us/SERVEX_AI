'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase, resolveXmlContent, upsertGeneralProcessRecord } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Filter, 
  AlertCircle,
  Download,
  X,
  Search
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { recordClientAction } from '@/app/lib/trackingClient';

const BASE_HEADERS = ["Model #", "List Price", "Weight", "Classic/ Premium", "Model Name"];

// ── Utilidades de Estilizado Nativo OpenXML (.xlsx) en Cliente (Sin dependencias extra) ──
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

const computeCrc32 = (bytes) => {
  let c = -1;
  for (let i = 0; i < bytes.length; i++) {
    c = (c >>> 8) ^ CRC32_TABLE[(c ^ bytes[i]) & 0xff];
  }
  return (c ^ -1) >>> 0;
};

const colLettersToIndex = (letters) => {
  let col = 0;
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }
  return col - 1;
};

const CUSTOM_EXCEL_STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="7">
    <font><sz val="10"/><color rgb="FF334155"/><name val="Calibri"/></font>
    <font><b/><sz val="10.5"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="10.5"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF0F172A"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF047857"/><name val="Calibri"/></font>
    <font><sz val="9.5"/><color rgb="FF475569"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><color rgb="FF1E40AF"/><name val="Calibri"/></font>
  </fonts>
  <fills count="10">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E3A8A"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE2E8F0"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFECFDF5"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFD1FAE5"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEFF6FF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="3">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FF334155"/></left>
      <right style="thin"><color rgb="FF334155"/></right>
      <top style="thin"><color rgb="FF0F172A"/></top>
      <bottom style="medium"><color rgb="FF0F172A"/></bottom>
      <diagonal/>
    </border>
    <border>
      <left style="thin"><color rgb="FFE2E8F0"/></left>
      <right style="thin"><color rgb="FFE2E8F0"/></right>
      <top style="thin"><color rgb="FFE2E8F0"/></top>
      <bottom style="thin"><color rgb="FFE2E8F0"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="15">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="5" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="6" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="7" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="0" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="5" fillId="8" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="8" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="9" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="9" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="8" borderId="2" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;

const applyExcelVisualStyling = (xlsxArrayBuffer) => {
  const bytes = new Uint8Array(xlsxArrayBuffer);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8');

  const entries = [];
  let offset = 0;

  while (offset + 30 <= bytes.length) {
    const sig = view.getUint32(offset, true);
    if (sig !== 0x04034b50) break;

    const ver = view.getUint16(offset + 4, true);
    const flag = view.getUint16(offset + 6, true);
    const method = view.getUint16(offset + 8, true);
    const time = view.getUint16(offset + 10, true);
    const date = view.getUint16(offset + 12, true);
    const crc = view.getUint32(offset + 14, true);
    const compSize = view.getUint32(offset + 18, true);
    const uncompSize = view.getUint32(offset + 22, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);

    const nameBytes = bytes.subarray(offset + 30, offset + 30 + nameLen);
    const name = decoder.decode(nameBytes);
    const extraBytes = bytes.subarray(offset + 30 + nameLen, offset + 30 + nameLen + extraLen);
    const dataStart = offset + 30 + nameLen + extraLen;
    const rawData = bytes.subarray(dataStart, dataStart + compSize);

    if (name === 'xl/styles.xml' && method === 0) {
      const newBytes = encoder.encode(CUSTOM_EXCEL_STYLES_XML);
      entries.push({
        ver, flag, method: 0, time, date,
        crc: computeCrc32(newBytes),
        compSize: newBytes.length,
        uncompSize: newBytes.length,
        nameBytes,
        extraBytes,
        dataBytes: newBytes
      });
    } else if (name === 'xl/worksheets/sheet1.xml' && method === 0) {
      let sheetXml = decoder.decode(rawData);

      // Congelar fila superior de encabezados y primera columna (Model #)
      sheetXml = sheetXml.replace(
        '<sheetView workbookViewId="0"/>',
        '<sheetView workbookViewId="0"><pane xSplit="1" ySplit="1" topLeftCell="B2" activePane="bottomRight" state="frozen"/><selection pane="bottomRight" activeCell="B2" sqref="B2"/></sheetView>'
      );

      // Asignar estilos por columna, fila zebra y celdas con valor
      sheetXml = sheetXml.replace(/<row r="(\d+)"([^>]*)>([\s\S]*?)<\/row>/g, (m, rStr, rowAttrs, inner) => {
        const rowNum = parseInt(rStr, 10);
        const isHeader = rowNum === 1;
        const isEvenData = rowNum % 2 === 1;

        const styledCells = inner.replace(/<c r="([A-Z]+)\d+"([^>]*)>([\s\S]*?)<\/c>/g, (cm, colStr, cAttrs, cInner) => {
          const colIdx = colLettersToIndex(colStr);
          const hasVal = cAttrs.includes('t="n"') && cInner.includes('<v>') && !cInner.includes('<v></v>');
          let sIdx = 0;

          if (isHeader) {
            sIdx = colIdx < 5 ? 1 : 2;
          } else {
            if (colIdx === 0) sIdx = isEvenData ? 4 : 3;
            else if (colIdx === 1) sIdx = isEvenData ? 6 : 5;
            else if (colIdx === 2 || colIdx === 3) sIdx = isEvenData ? 8 : 7;
            else if (colIdx === 4) sIdx = isEvenData ? 10 : 9;
            else {
              if (hasVal) sIdx = isEvenData ? 12 : 11;
              else sIdx = isEvenData ? 14 : 13;
            }
          }
          return `<c r="${colStr}${rowNum}"${cAttrs} s="${sIdx}">${cInner}</c>`;
        });

        return `<row r="${rowNum}"${rowAttrs}>${styledCells}</row>`;
      });

      const newBytes = encoder.encode(sheetXml);
      entries.push({
        ver, flag, method: 0, time, date,
        crc: computeCrc32(newBytes),
        compSize: newBytes.length,
        uncompSize: newBytes.length,
        nameBytes,
        extraBytes,
        dataBytes: newBytes
      });
    } else {
      entries.push({
        ver, flag, method, time, date, crc, compSize, uncompSize,
        nameBytes, extraBytes, dataBytes: rawData
      });
    }

    offset = dataStart + compSize;
  }

  // Reconstruir contenedor ZIP (.xlsx)
  let totalLocalSize = 0;
  let totalCentralSize = 0;
  for (const e of entries) {
    totalLocalSize += 30 + e.nameBytes.length + e.extraBytes.length + e.dataBytes.length;
    totalCentralSize += 46 + e.nameBytes.length + e.extraBytes.length;
  }

  const out = new Uint8Array(totalLocalSize + totalCentralSize + 22);
  const outView = new DataView(out.buffer);
  let pos = 0;
  const localOffsets = [];

  for (const e of entries) {
    localOffsets.push(pos);
    outView.setUint32(pos, 0x04034b50, true);
    outView.setUint16(pos + 4, e.ver, true);
    outView.setUint16(pos + 6, e.flag, true);
    outView.setUint16(pos + 8, e.method, true);
    outView.setUint16(pos + 10, e.time, true);
    outView.setUint16(pos + 12, e.date, true);
    outView.setUint32(pos + 14, e.crc, true);
    outView.setUint32(pos + 18, e.compSize, true);
    outView.setUint32(pos + 22, e.uncompSize, true);
    outView.setUint16(pos + 26, e.nameBytes.length, true);
    outView.setUint16(pos + 28, e.extraBytes.length, true);
    pos += 30;
    out.set(e.nameBytes, pos); pos += e.nameBytes.length;
    out.set(e.extraBytes, pos); pos += e.extraBytes.length;
    out.set(e.dataBytes, pos); pos += e.dataBytes.length;
  }

  const centralDirOffset = pos;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    outView.setUint32(pos, 0x02014b50, true);
    outView.setUint16(pos + 4, e.ver, true);
    outView.setUint16(pos + 6, e.ver, true);
    outView.setUint16(pos + 8, e.flag, true);
    outView.setUint16(pos + 10, e.method, true);
    outView.setUint16(pos + 12, e.time, true);
    outView.setUint16(pos + 14, e.date, true);
    outView.setUint32(pos + 16, e.crc, true);
    outView.setUint32(pos + 20, e.compSize, true);
    outView.setUint32(pos + 24, e.uncompSize, true);
    outView.setUint16(pos + 28, e.nameBytes.length, true);
    outView.setUint16(pos + 30, e.extraBytes.length, true);
    outView.setUint16(pos + 32, 0, true);
    outView.setUint16(pos + 34, 0, true);
    outView.setUint16(pos + 36, 0, true);
    outView.setUint32(pos + 38, 0, true);
    outView.setUint32(pos + 42, localOffsets[i], true);
    pos += 46;
    out.set(e.nameBytes, pos); pos += e.nameBytes.length;
    out.set(e.extraBytes, pos); pos += e.extraBytes.length;
  }

  outView.setUint32(pos, 0x06054b50, true);
  outView.setUint16(pos + 4, 0, true);
  outView.setUint16(pos + 6, 0, true);
  outView.setUint16(pos + 8, entries.length, true);
  outView.setUint16(pos + 10, entries.length, true);
  outView.setUint32(pos + 12, totalCentralSize, true);
  outView.setUint32(pos + 16, centralDirOffset, true);
  outView.setUint16(pos + 20, 0, true);

  return out;
};

const DynamicDataMatrix = ({ isDarkMode = true }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [matrixHeaders, setMatrixHeaders] = useState(BASE_HEADERS);
  const [xmlBaseName, setXmlBaseName] = useState("");
  
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const processedXmlRef = useRef(null);
  const [processedIndex, setProcessedIndex] = useState(0);
  const [totalProductsInXml, setTotalProductsInXml] = useState(0);
  const [isExportingFull, setIsExportingFull] = useState(false);

  const yieldToMainThread = () => new Promise(resolve => setTimeout(resolve, 0));

  const recordTrackingEvent = async (eventType, description, title, details = {}) => {
    recordClientAction({
      companyName: 'General_Procces',
      eventType,
      title,
      description,
      details
    });
  };

  const extractProductRows = (p, featureMap, getProductFeatureCodes, validColumns, computedHeaders) => {
    const sku = p.getElementsByTagName("Code")[0]?.textContent || "";
    const description = p.getElementsByTagName("Description")[0]?.textContent || "";
    const classification = p.getElementsByTagName("ClassificationRef")[0]?.getElementsByTagName("Code")[0]?.textContent 
      || p.getElementsByTagName("ClassificationRef")[0]?.textContent 
      || "Standard";
    
    const priceElement = p.getElementsByTagName("Price")[0];
    const basePrice = priceElement ? parseFloat(priceElement.getElementsByTagName("Value")[0]?.textContent || "0") : 0;
    const weight = p.getElementsByTagName("Weight")[0]?.textContent || "N/A";

    const featureCodes = getProductFeatureCodes(p);
    const productOptionPrices = {};
    
    for (const fCode of featureCodes) {
      const featureNode = featureMap.get(fCode);
      if (featureNode) {
        const options = Array.from(featureNode.getElementsByTagName("Option"));
        for (const opt of options) {
          const optCode = opt.getElementsByTagName("Code")[0]?.textContent?.trim();
          const optPriceElem = opt.querySelector("OptionPrice > Value");
          if (optPriceElem && optCode) {
            const optPrice = parseFloat(optPriceElem.textContent || "0");
            if (productOptionPrices[optCode] === undefined || optPrice > productOptionPrices[optCode]) {
              productOptionPrices[optCode] = optPrice;
            }
          }
        }
      }
    }

    const createRow = (baseSku) => {
      const row = {};
      computedHeaders.forEach(h => row[h] = "");

      row["Model #"] = baseSku;
      row["List Price"] = basePrice;
      row["Weight"] = weight;
      row["Classic/ Premium"] = classification;
      row["Model Name"] = description;

      validColumns.forEach(col => {
        const optVal = productOptionPrices[col.optCode];
        if (optVal !== undefined && Number(optVal) > 0) {
          row[col.label] = optVal;
        } else {
          row[col.label] = "";
        }
      });

      return row;
    };

    return [createRow(sku)];
  };

  const processXML = async () => {
    try {
      setLoading(true);
      setError(null);
      setProducts([]);
      setProcessedIndex(0);

      let rawXmlStr = '';
      let existingCsvRaw = '';

      let record = null;
      const { data, error: dbError } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .select('XM_CET_import, xml_raw, csv_raw, xml_name, file_name')
        .eq('company_name', 'General_Procces')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        record = data;
      } else {
        const { data: fallbackData } = await supabase
          .from('ClientsSERVEX_General_Procces')
          .select('XM_CET_import, xml_raw, csv_raw, xml_name, file_name')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (fallbackData) record = fallbackData;
      }

      if (record) {
        existingCsvRaw = record.csv_raw || '';
        rawXmlStr = await resolveXmlContent(record.XM_CET_import || record.xml_raw);
      }

      let detectedBaseName = (record?.xml_name || record?.file_name || '').replace(/\.xml$/i, '').trim();
      if (!detectedBaseName && rawXmlStr) {
        const commentMatch = String(rawXmlStr).match(/<!--\s*filename:\s*(.*?)\s*-->/i);
        if (commentMatch && commentMatch[1]) {
          detectedBaseName = commentMatch[1].replace(/\.xml$/i, '').trim();
        } else {
          const catalogMatch = String(rawXmlStr).match(/<Catalog[^>]*\bName=["']([^"']+)["']/i)
            || String(rawXmlStr).match(/<Catalog[^>]*>[\s\S]*?<Name>([^<]+)<\/Name>/i);
          if (catalogMatch && catalogMatch[1]) {
            detectedBaseName = catalogMatch[1].replace(/\.xml$/i, '').trim();
          }
        }
      }
      if (detectedBaseName) {
        setXmlBaseName(detectedBaseName);
      }

      // Fallback 1: Si no hay XML pero existe csv_raw en la BD, desglosar e inicializar la matriz al instante
      if (!rawXmlStr && existingCsvRaw && existingCsvRaw.trim()) {
        const parsedCsv = Papa.parse(existingCsvRaw.trim(), { header: true, skipEmptyLines: true });
        if (parsedCsv.data && parsedCsv.data.length > 0) {
          const headers = parsedCsv.meta.fields || Object.keys(parsedCsv.data[0]);
          const sanitizedRows = parsedCsv.data.map(r => {
            const clean = { ...r };
            headers.forEach(h => {
              if (!BASE_HEADERS.includes(h) && (clean[h] === 0 || clean[h] === '0')) {
                clean[h] = '';
              }
            });
            return clean;
          });
          setMatrixHeaders(headers);
          setProducts(sanitizedRows);
          setTotalProductsInXml(sanitizedRows.length);
          setProcessedIndex(sanitizedRows.length);
          setLoading(false);
          return;
        }
      }

      // Fallback 2: Intentar recuperar el XML activo directamente del backend en memoria
      if (!rawXmlStr) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://servex-ai-back.onrender.com';
          const backRes = await fetch(`${backendUrl}/api/v1/General_Procces/agent/download-xml`);
          if (backRes.ok) {
            const fetchedXml = await backRes.text();
            if (fetchedXml && fetchedXml.trim().startsWith('<')) {
              rawXmlStr = fetchedXml;
              if (!detectedBaseName) {
                const commentMatch = String(rawXmlStr).match(/<!--\s*filename:\s*(.*?)\s*-->/i);
                if (commentMatch && commentMatch[1]) {
                  detectedBaseName = commentMatch[1].replace(/\.xml$/i, '').trim();
                } else {
                  const catalogMatch = String(rawXmlStr).match(/<Catalog[^>]*\bName=["']([^"']+)["']/i)
                    || String(rawXmlStr).match(/<Catalog[^>]*>[\s\S]*?<Name>([^<]+)<\/Name>/i);
                  if (catalogMatch && catalogMatch[1]) {
                    detectedBaseName = catalogMatch[1].replace(/\.xml$/i, '').trim();
                  }
                }
                if (detectedBaseName) setXmlBaseName(detectedBaseName);
              }
            }
          }
        } catch (_) {}
      }

      if (!rawXmlStr) {
        if (existingCsvRaw && existingCsvRaw.trim()) {
          const parsedCsv = Papa.parse(existingCsvRaw.trim(), { header: true, skipEmptyLines: true });
          if (parsedCsv.data && parsedCsv.data.length > 0) {
            const headers = parsedCsv.meta.fields || Object.keys(parsedCsv.data[0]);
            const sanitizedRows = parsedCsv.data.map(r => {
              const clean = { ...r };
              headers.forEach(h => {
                if (!BASE_HEADERS.includes(h) && (clean[h] === 0 || clean[h] === '0')) {
                  clean[h] = '';
                }
              });
              return clean;
            });
            setMatrixHeaders(headers);
            setProducts(sanitizedRows);
            setTotalProductsInXml(sanitizedRows.length);
            setProcessedIndex(sanitizedRows.length);
            setLoading(false);
            return;
          }
        }
        setProducts([]);
        setMatrixHeaders(BASE_HEADERS);
        setLoading(false);
        return;
      }

      await yieldToMainThread();

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(rawXmlStr, "text/xml");
      
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) throw new Error("Error parsing XML structure");

      const globalFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const featureMap = new Map();

      for (const f of globalFeatures) {
        const fCode = f.getElementsByTagName("Code")[0]?.textContent;
        if (fCode) {
          featureMap.set(fCode, f);
        }
      }

      const featureCache = new Map();
      const getProductFeatureCodes = (pNode) => {
        const directRefs = Array.from(pNode.getElementsByTagName("FeatureRef")).map(r => r.textContent?.trim()).filter(Boolean);
        const cacheKey = directRefs.join('|');
        if (featureCache.has(cacheKey)) {
          return featureCache.get(cacheKey);
        }

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

        for (const code of directRefs) {
          traverse(code);
        }

        featureCache.set(cacheKey, resolved);
        return resolved;
      };

      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
      setTotalProductsInXml(productsXML.length);

      const optionMap = new Map();

      for (let i = 0; i < productsXML.length; i++) {
        if (i > 0 && i % 200 === 0) {
          await yieldToMainThread();
        }
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
                  optionMap.set(optCode, { optCode, label, maxPrice: optPrice });
                } else {
                  if (optPrice > existing.maxPrice) {
                    existing.maxPrice = optPrice;
                  }
                  if (!existing.label || existing.label === optCode) {
                    existing.label = label;
                  }
                }
              }
            }
          }
        }
      }

      const validColumns = Array.from(optionMap.values()).filter(c => c.maxPrice > 0);
      const dynamicOptionHeaders = validColumns.map(c => c.label);
      const computedHeaders = [...BASE_HEADERS, ...dynamicOptionHeaders];
      
      setMatrixHeaders(computedHeaders);

      // Guardar referencia en el ref para carga bajo demanda
      processedXmlRef.current = {
        productsXML,
        featureMap,
        getProductFeatureCodes,
        validColumns,
        computedHeaders
      };

      // Cargar TODOS los productos en memoria para búsqueda, paginación completa y exportación instantánea
      const allRows = [];
      for (let i = 0; i < productsXML.length; i++) {
        if (i > 0 && i % 300 === 0) {
          await yieldToMainThread();
        }
        const rows = extractProductRows(productsXML[i], featureMap, getProductFeatureCodes, validColumns, computedHeaders);
        allRows.push(...rows);
      }

      setProducts(allRows);
      setTotalProductsInXml(allRows.length);
      setProcessedIndex(productsXML.length);
      setLoading(false);
      setCurrentPage(1); 

      // Registrar evento de apertura en seguimiento_client
      recordTrackingEvent(
        'OPEN_EXCEL_EXPORT',
        `El usuario abrió el componente para visualizar y exportar la matriz Excel (${allRows.length} productos).`,
        'Apertura de Módulo de Exportación',
        { total_products: allRows.length }
      );

      // Sincronizar en segundo plano la matriz completa en csv_raw en la base de datos
      syncMatrixCsvToDb(allRows, computedHeaders);
    } catch (err) {
      console.error("Error processing catalog XML data matrix:", err);
      setError(err.message || "Error processing catalog information.");
      setLoading(false);
    }
  };

  const syncMatrixCsvToDb = async (rowsData, headers) => {
    try {
      if (!rowsData || rowsData.length === 0 || !headers) return;
      const csvString = Papa.unparse(rowsData, {
        columns: headers,
        delimiter: ";"
      });
      if (csvString) {
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem('csv_raw', csvString);
          } catch (_) {}
          window.dispatchEvent(new CustomEvent('catalogMatrixUpdated', {
            detail: { headers, csvRaw: csvString }
          }));
        }

        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://servex-ai-back.onrender.com';
          const fdBase = new FormData();
          fdBase.append('company_name', 'General_Procces');
          fdBase.append('csv_raw', csvString);
          fetch(`${backendUrl}/api/v1/General_Procces/pipeline/cache-csv-base`, {
            method: 'POST',
            body: fdBase
          }).catch(() => {});
        } catch (_) {}

        await upsertGeneralProcessRecord(
          { company_name: 'General_Procces', csv_raw: csvString },
          'General_Procces'
        );
      }
    } catch (err) {
      console.warn('⚠️ Error guardando csv_raw de la matriz:', err);
    }
  };

  const loadAllForExport = async () => {
    return products;
  };

  useEffect(() => {
    processXML();
  }, []);

  const filtered = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    if (!cleanSearch) return products;
    return products.filter(p => 
      String(p["Model #"] || "").toLowerCase().includes(cleanSearch) ||
      String(p["Model Name"] || "").toLowerCase().includes(cleanSearch)
    );
  }, [products, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filtered.length / itemsPerPage) || 1;
  }, [filtered]);

  const stats = useMemo(() => {
    const total = products.length;
    const avgPrice = total 
      ? Math.round(products.reduce((acc, p) => acc + (p["List Price"] || 0), 0) / total) 
      : 0;
    return { total, filtered: filtered.length, avgPrice };
  }, [products, filtered]);

  const cleanRowsZeroValues = (rows) => {
    if (!rows || !Array.isArray(rows)) return [];
    return rows.map(row => {
      const cleanRow = {};
      matrixHeaders.forEach(h => {
        const val = row[h];
        if (!BASE_HEADERS.includes(h)) {
          cleanRow[h] = (val !== undefined && val !== null && val !== '' && Number(val) > 0) ? val : '';
        } else if (h === 'List Price') {
          cleanRow[h] = (val !== undefined && val !== null && val !== '' && Number(val) > 0) ? val : '';
        } else {
          cleanRow[h] = val !== undefined && val !== null ? val : '';
        }
      });
      return cleanRow;
    });
  };

  const exportToCSV = () => {
    try {
      const rawRowsToExport = filtered && filtered.length > 0 ? filtered : products;
      if (!rawRowsToExport || rawRowsToExport.length === 0) {
        alert("No hay productos disponibles en la matriz para exportar. Asegúrate de haber cargado el catálogo.");
        return;
      }
      const rowsToExport = cleanRowsZeroValues(rawRowsToExport);
      
      recordTrackingEvent(
        'DOWNLOAD_CSV',
        `El usuario descargó la matriz de catálogo en formato CSV (${rowsToExport.length} productos).`,
        'Descarga de Matriz CSV',
        { total_products: rowsToExport.length, format: 'csv' }
      );

      const csv = Papa.unparse(rowsToExport, {
        columns: matrixHeaders,
        delimiter: ";"
      });
      
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const cleanPrefix = (xmlBaseName || "Catalog").replace(/\.xml$/i, '').trim();
      link.setAttribute('download', `${cleanPrefix}-Editable-ALYSAsistemai-${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 150);
    } catch (err) {
      console.error('Error al exportar a CSV:', err);
      alert('Error al generar el archivo CSV: ' + (err.message || err));
    }
  };

  const exportToExcel = () => {
    try {
      const rawRowsToExport = filtered && filtered.length > 0 ? filtered : products;
      if (!rawRowsToExport || rawRowsToExport.length === 0) {
        alert("No hay productos disponibles en la matriz para exportar. Asegúrate de haber cargado el catálogo.");
        return;
      }
      const rowsToExport = cleanRowsZeroValues(rawRowsToExport);
      
      recordTrackingEvent(
        'DOWNLOAD_EXCEL',
        `El usuario descargó la matriz de catálogo en formato Excel (.xlsx) (${rowsToExport.length} productos).`,
        'Descarga de Matriz Excel',
        { total_products: rowsToExport.length, format: 'xlsx' }
      );

      const worksheet = XLSX.utils.json_to_sheet(rowsToExport, { header: matrixHeaders });

      // Configurar anchos de columna inteligentes, alto de filas y autofiltro
      worksheet['!cols'] = matrixHeaders.map((h, idx) => {
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
      XLSX.utils.book_append_sheet(workbook, worksheet, "Catalog Data");
      
      const cleanPrefix = (xmlBaseName || "Catalog").replace(/\.xml$/i, '').trim();
      const fileName = `${cleanPrefix}-Editable-ALYSAsistemai-${new Date().toISOString().slice(0,10)}.xlsx`;

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
      console.error('Error al exportar a Excel:', err);
      alert('Error al generar el archivo Excel: ' + (err.message || err));
    }
  };

  if (loading) return (
    <div className={`flex items-center justify-center py-6 bg-transparent text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-sans`}>
      <div className="flex items-center gap-2">
        <RefreshCw size={13} className={`animate-spin ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`} />
        Retrieving master data matrix from Engine...
      </div>
    </div>
  );

  if (error) return (
    <div className="flex w-full flex-col items-center justify-center bg-transparent py-5 text-center font-sans">
      <AlertCircle className="text-rose-400 mb-1.5" size={22} />
      <h3 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-0.5`}>Engine Synchronization Error</h3>
      <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} max-w-md mb-2`}>{error}</p>
      <button 
        onClick={processXML} 
        className={`flex items-center gap-1.5 px-3 py-1 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white border-white/15' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'} text-[11px] font-semibold rounded-lg border transition-all cursor-pointer`}
      >
        <RefreshCw size={11} /> Retry Loading
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-full min-w-0 flex flex-col bg-transparent font-sans antialiased">
      {/* ── Compact Header Toolbar (Transparent) ── */}
      <div className={`w-full flex flex-wrap items-center justify-between gap-2 py-2 px-1 border-b ${isDarkMode ? 'border-white/10 text-zinc-200' : 'border-slate-200 text-slate-800'} bg-transparent`}>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-wide uppercase`}>Export Data Client</span>
          <span className={`text-[9px] font-medium ${isDarkMode ? 'text-zinc-400 bg-white/5 border-white/10' : 'text-slate-600 bg-slate-100 border-slate-200'} border px-2 py-0.5 rounded-md`}>
            {stats.filtered} items
          </span>
          {isExportingFull && (
            <span className={`text-[9px] font-medium ${isDarkMode ? 'text-white bg-white/10 border-white/20' : 'text-slate-800 bg-slate-200 border-slate-300'} border px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse select-none`}>
              <RefreshCw size={8} className={`animate-spin ${isDarkMode ? 'text-white' : 'text-slate-800'}`} />
              Preparing ({products.length} / {totalProductsInXml})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search size={11} className={`absolute left-2.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'} pointer-events-none`} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-lg pl-7 pr-2.5 py-1 text-[11px] transition-all w-[130px] sm:w-[160px] focus:outline-none ${
                isDarkMode
                  ? 'bg-white/5 border border-white/15 text-white placeholder:text-zinc-500 focus:border-white/30 focus:bg-white/10'
                  : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white shadow-xs'
              }`}
            />
          </div>

          <button 
            onClick={processXML}
            type="button"
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 border border-white/10 hover:bg-white/15 text-zinc-300 hover:text-white'
                : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-xs'
            }`}
            title="Recalculate matrix"
          >
            <RefreshCw size={12} className={loading ? `animate-spin ${isDarkMode ? 'text-white' : 'text-slate-900'}` : ""} />
          </button>

          <button 
            onClick={exportToCSV}
            type="button"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs border ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
            title="Descargar matriz en formato CSV"
          >
            <Download size={11} />
            <span>CSV</span>
          </button>

          <button 
            onClick={exportToExcel}
            type="button"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
              isDarkMode
                ? 'bg-white hover:bg-zinc-200 text-zinc-950'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
            title="Descargar matriz en formato Excel (.xlsx)"
          >
            <Download size={11} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* ── Table Area (Transparent Container) ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-transparent">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 border ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <Search className={`w-4 h-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`} />
          </div>
          <h4 className={`text-[11px] font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>No data found in matrix</h4>
          <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'} max-w-xs mt-0.5`}>
            No records matched current search filter or catalog XML is empty.
          </p>
        </div>
      ) : (
        <div className={`w-full max-w-full min-w-0 overflow-x-auto relative custom-scrollbar max-h-[380px] rounded-lg border ${
          isDarkMode ? 'border-white/10 bg-transparent' : 'border-slate-200 bg-white/90 shadow-xs'
        } my-1.5`}>
          <table className="table-auto border-collapse text-left text-[10px] w-full min-w-[700px] bg-transparent">
            <thead className={`sticky top-0 z-20 backdrop-blur-md border-b ${
              isDarkMode ? 'bg-zinc-900/80 border-white/10' : 'bg-slate-100/95 border-slate-200'
            }`}>
              <tr>
                <th className={`w-9 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider sticky left-0 z-30 border-r border-b select-none ${
                  isDarkMode
                    ? 'text-zinc-400 bg-zinc-900/80 border-white/10'
                    : 'text-slate-500 bg-slate-100/95 border-slate-200'
                }`}>
                  #
                </th>
                {matrixHeaders.map((header, i) => (
                  <th
                    key={header + i}
                    className={`px-3 py-2 text-[10px] font-bold border-r border-b whitespace-nowrap truncate uppercase tracking-wider select-none bg-transparent ${
                      isDarkMode ? 'text-zinc-300 border-white/10' : 'text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{header || "(Empty)"}</span>
                      <Filter size={8} className={isDarkMode ? 'text-zinc-500' : 'text-slate-400'} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className={`bg-transparent divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
              {paginatedProducts.map((p, idx) => {
                const realIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                
                return (
                  <tr 
                    key={`${p["Model #"] || 'prod'}-${realIndex}`}
                    className={`transition-colors group bg-transparent ${
                      isDarkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className={`px-2 py-1.5 text-center text-[9.5px] font-bold border-r border-b sticky left-0 z-10 font-mono select-none ${
                      isDarkMode
                        ? 'text-zinc-400 border-white/5 bg-zinc-900/80 group-hover:bg-zinc-800/80'
                        : 'text-slate-500 border-slate-100 bg-slate-50/95 group-hover:bg-slate-100'
                    }`}>
                      {realIndex}
                    </td>

                    {matrixHeaders.map((header, i) => {
                      let value = p[header];
                      if (!BASE_HEADERS.includes(header) && (value === 0 || value === "0")) {
                        value = "";
                      }
                      if (header === "List Price") {
                        const numPrice = Number(p["List Price"] || 0);
                        value = numPrice > 0 ? `$${numPrice.toLocaleString()}` : "";
                      }
                      
                      const isHighlight = header === 'Model #' || header === 'List Price';
                      return (
                        <td key={header + i} className={`p-0 border-r border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'} bg-transparent`}>
                          <div 
                            className={`px-3 py-1.5 text-[10.5px] whitespace-nowrap truncate ${
                              isHighlight
                                ? isDarkMode ? 'font-bold text-white font-mono' : 'font-bold text-slate-900 font-mono'
                                : isDarkMode ? 'font-medium text-zinc-300' : 'font-medium text-slate-700'
                            }`} 
                            title={value}
                          >
                            {value !== undefined && value !== null ? String(value) : ""}
                          </div>
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

      {/* ── Compact Transparent Footer ── */}
      <div className={`w-full flex items-center justify-between py-1.5 px-1 bg-transparent border-t text-[10px] font-medium select-none ${
        isDarkMode ? 'border-white/10 text-zinc-400' : 'border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center gap-2">
          <span>Cols: <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{matrixHeaders.length}</strong></span>
          <span className={isDarkMode ? 'text-white/20' : 'text-slate-300'}>•</span>
          <span>Showing <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{filtered.length}</strong> of <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{products.length}</strong></span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className={`px-2 py-0.5 rounded font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-zinc-300'
                : 'bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-600 shadow-xs'
            }`}
          >
            Prev
          </button>
          
          <span className={`font-mono px-1 text-[10px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className={`px-2 py-0.5 rounded font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-zinc-300'
                : 'bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-600 shadow-xs'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* ── EXCEL SCALABILITY WARNING MODAL ── */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className={`absolute inset-0 backdrop-blur-md transition-opacity ${
              isDarkMode ? 'bg-black/80' : 'bg-slate-900/40'
            }`}
            onClick={() => setShowWarningModal(false)}
          />
          <div className={`relative w-full max-w-md rounded-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden font-sans z-10 border ${
            isDarkMode
              ? 'bg-[#09090b]/95 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] border-white/15 text-zinc-100'
              : 'bg-white shadow-2xl border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${
              isDarkMode ? 'border-white/10' : 'border-slate-100'
            }`}>
              <span className={`text-[14px] font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Export Matrix Data</span>
              <button 
                onClick={() => setShowWarningModal(false)} 
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-6 flex gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                isDarkMode ? 'bg-white/10 border-white/15 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}>
                <Download size={20} />
              </div>
              <div className="flex-1">
                <p className={`text-[12.5px] leading-relaxed mb-2.5 ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
                  Exporting dynamic XML catalog data matrix with <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{matrixHeaders.length} total columns</strong>.
                </p>
                <p className={`text-[11.5px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Select your preferred download format for full multi-tenant compatibility.
                </p>
              </div>
            </div>
            <div className={`px-6 py-4 flex justify-end gap-2.5 rounded-b-2xl border-t ${
              isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-100'
            }`}>
              <button 
                onClick={() => setShowWarningModal(false)} 
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  isDarkMode
                    ? 'text-zinc-300 bg-white/5 hover:bg-white/10 border-white/10'
                    : 'text-slate-600 bg-white hover:bg-slate-100 border-slate-200 shadow-2xs'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowWarningModal(false);
                  exportToCSV();
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
                  isDarkMode
                    ? 'text-zinc-950 bg-white hover:bg-zinc-200'
                    : 'text-slate-800 bg-slate-200 hover:bg-slate-300'
                }`}
              >
                Download CSV
              </button>
              <button 
                onClick={() => {
                  setShowWarningModal(false);
                  exportToExcel();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer"
              >
                Download Excel (.xlsx)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicDataMatrix;
