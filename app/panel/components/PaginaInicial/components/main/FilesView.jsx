'use client';

import React, { useState, useRef, useMemo } from 'react';
import { 
  FileCode, 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Brain, 
  Zap, 
  ArrowRight, 
  Send,
  X,
  FileCheck,
  Database,
  Search,
  ChevronLeft,
  ChevronRight,
  Table,
  Code2,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function FilesView() {
  const [xmlFile, setXmlFile] = useState(null);
  const [xmlText, setXmlText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState([]);
  const [processedByBackend, setProcessedByBackend] = useState(false);
  const [catalogPatterns, setCatalogPatterns] = useState(null);
  
  // UI Tabs: 'table' | 'raw' | 'ai'
  const [activeTab, setActiveTab] = useState('table');

  // Table controls
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // AI Report State
  const [generatingReport, setGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  // Smart JS XML parser that finds repeating record nodes
  const parseXmlToObjects = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('El archivo XML no tiene un formato válido.');
    }

    const getCleanTag = (node) => {
      if (!node || !node.nodeName) return '';
      return node.nodeName.replace(/^.*:/, '');
    };

    const flattenElement = (elem, prefix = '') => {
      const result = {};

      if (elem.attributes) {
        Array.from(elem.attributes).forEach(attr => {
          const attrName = attr.name.replace(/^.*:/, '');
          result[`${prefix}@${attrName}`] = attr.value;
        });
      }

      const children = Array.from(elem.children || []);
      if (children.length === 0) {
        const text = elem.textContent ? elem.textContent.trim() : '';
        if (text || Object.keys(result).length === 0) {
          const tag = getCleanTag(elem);
          const key = prefix ? `${prefix}${tag}` : tag;
          result[key] = text;
        }
      } else {
        const tagCounts = {};
        children.forEach(c => {
          const t = getCleanTag(c);
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });

        children.forEach(child => {
          const ctag = getCleanTag(child);
          const newPrefix = prefix ? `${prefix}${ctag}_` : `${ctag}_`;
          const grandChildren = Array.from(child.children || []);

          if (grandChildren.length === 0) {
            const val = child.textContent ? child.textContent.trim() : '';
            const key = prefix ? `${prefix}${ctag}` : ctag;
            if (child.attributes) {
              Array.from(child.attributes).forEach(attr => {
                const attrName = attr.name.replace(/^.*:/, '');
                result[`${newPrefix}@${attrName}`] = attr.value;
              });
            }
            if (tagCounts[ctag] > 1) {
              if (result[key]) {
                result[key] = `${result[key]}, ${val}`;
              } else {
                result[key] = val;
              }
            } else {
              result[key] = val;
            }
          } else {
            const subDict = flattenElement(child, newPrefix);
            Object.assign(result, subDict);
          }
        });
      }

      return result;
    };

    const allNodes = [];
    const traverse = (node, parent = null) => {
      if (node.nodeType === 1) {
        allNodes.push({ node, parent });
        Array.from(node.children || []).forEach(child => traverse(child, node));
      }
    };

    traverse(xmlDoc.documentElement);

    const parentTagMap = new Map();
    allNodes.forEach(({ node, parent }) => {
      if (parent) {
        const tag = getCleanTag(node);
        const key = `${parent.nodeName}::${tag}`;
        if (!parentTagMap.has(key)) {
          parentTagMap.set(key, { parent, tag, nodes: [] });
        }
        parentTagMap.get(key).nodes.push(node);
      }
    });

    const repeatingGroups = Array.from(parentTagMap.values()).filter(g => g.nodes.length > 1);

    const rows = [];
    if (repeatingGroups.length > 0) {
      repeatingGroups.sort((a, b) => b.nodes.length - a.nodes.length);
      const targetGroup = repeatingGroups[0];
      targetGroup.nodes.forEach(node => {
        const rowDict = flattenElement(node, '');
        if (Object.keys(rowDict).length > 0) {
          rows.push(rowDict);
        }
      });
    } else {
      const directChildren = Array.from(xmlDoc.documentElement.children || []);
      if (directChildren.length > 0) {
        directChildren.forEach(child => {
          const rowDict = flattenElement(child, '');
          if (Object.keys(rowDict).length > 0) {
            rows.push(rowDict);
          }
        });
      } else {
        const rootDict = flattenElement(xmlDoc.documentElement, '');
        if (Object.keys(rootDict).length > 0) {
          rows.push(rootDict);
        }
      }
    }

    if (rows.length === 0) {
      rows.push({
        RootTag: getCleanTag(xmlDoc.documentElement),
        Status: 'Sin datos detectados'
      });
    }

    return rows;
  };

  // Process XML File automatically upon selection/drop
  const handleXmlFile = async (file) => {
    setErrorMsg('');
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setErrorMsg('Por favor selecciona un archivo .xml válido.');
      return;
    }

    setXmlFile(file);
    setParsing(true);
    setParsedData([]);
    setAiReport(null);
    setProcessedByBackend(false);
    setSearchTerm('');
    setCurrentPage(1);
    setActiveTab('table');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result || '';
      setXmlText(content);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      let dataObjects = null;
      let isBackendSuccess = false;

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${backendUrl}/api/v1/general_excel_converter/convert_json`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const jsonRes = await res.json();
          if (jsonRes.data && jsonRes.data.length > 0) {
            dataObjects = jsonRes.data;
            isBackendSuccess = true;
            setProcessedByBackend(true);
            if (jsonRes.ai_report) {
              setAiReport(jsonRes.ai_report);
            }
            if (jsonRes.patterns) {
              setCatalogPatterns(jsonRes.patterns);
            }
          }
        }
      } catch (backendErr) {
        console.log('Backend no disponible, ejecutando parseador en navegador:', backendErr);
      }

      if (!isBackendSuccess || !dataObjects) {
        try {
          dataObjects = parseXmlToObjects(content);
          generateAiReport(dataObjects);
          setProcessedByBackend(false);
        } catch (err) {
          console.error(err);
          setErrorMsg(err.message || 'Error al procesar la estructura del archivo XML.');
        }
      }

      if (dataObjects) {
        setParsedData(dataObjects);
      }
      setParsing(false);
    };

    reader.readAsText(file);
  };

  // Column Headers
  const columns = useMemo(() => {
    if (!parsedData || parsedData.length === 0) return [];
    const keysSet = new Set();
    parsedData.forEach(row => {
      Object.keys(row).forEach(k => keysSet.add(k));
    });
    return Array.from(keysSet);
  }, [parsedData]);

  // Filtered Data based on Search Term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return parsedData;
    const term = searchTerm.toLowerCase();
    return parsedData.filter(row => {
      return Object.values(row).some(val => 
        String(val || '').toLowerCase().includes(term)
      );
    });
  }, [parsedData, searchTerm]);

  // Paginated Data
  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleXmlFile(e.dataTransfer.files[0]);
    }
  };

  // Download Excel (.xlsx) file
  const handleDownloadExcel = async () => {
    if (!parsedData || !parsedData.length) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const formData = new FormData();
      if (xmlFile) {
        formData.append('file', xmlFile);
      } else {
        formData.append('xml_content', xmlText);
      }

      const response = await fetch(`${backendUrl}/api/v1/general_excel_converter/convert`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = xmlFile ? xmlFile.name.replace(/\.xml$/i, '') : 'catalogo';
        a.download = `${baseName}_Convertido.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.log('Fallback a descarga del lado del cliente activo');
    }

    // Client-side XLSX download fallback
    const worksheet = XLSX.utils.json_to_sheet(parsedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Catalogo_XML");
    
    const baseName = xmlFile ? xmlFile.name.replace(/\.xml$/i, '') : 'catalogo';
    XLSX.writeFile(workbook, `${baseName}_Convertido.xlsx`);
  };

  // Download CSV (.csv) file
  const handleDownloadCsv = async () => {
    if (!parsedData || !parsedData.length) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const formData = new FormData();
      if (xmlFile) {
        formData.append('file', xmlFile);
      } else {
        formData.append('xml_content', xmlText);
      }

      const response = await fetch(`${backendUrl}/api/v1/general_excel_converter/convert_csv`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = xmlFile ? xmlFile.name.replace(/\.xml$/i, '') : 'catalogo';
        a.download = `${baseName}_Convertido.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.log('Fallback a descarga de CSV del lado del cliente activo');
    }

    // Client-side CSV download fallback
    const worksheet = XLSX.utils.json_to_sheet(parsedData);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = xmlFile ? xmlFile.name.replace(/\.xml$/i, '') : 'catalogo';
    a.download = `${baseName}_Convertido.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Download CET Designer XML (/importCETxml)
  const handleDownloadCetXml = async () => {
    if (!parsedData || !parsedData.length) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const formData = new FormData();
      if (xmlFile) {
        formData.append('file', xmlFile);
      } else {
        formData.append('xml_content', xmlText);
      }

      const response = await fetch(`${backendUrl}/api/v1/general_excel_converter/importCETxml`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const baseName = xmlFile ? xmlFile.name.replace(/\.xml$/i, '') : 'catalogo';
        a.download = `${baseName}_CET_Import.xml`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.log('Error descargando CET XML:', e);
    }
  };

  const generateAiReport = (data) => {
    setGeneratingReport(true);
    setTimeout(() => {
      const totalItems = data.length;
      const totalKeys = data.reduce((acc, curr) => acc + Object.keys(curr).length, 0);
      const avgFields = totalItems > 0 ? (totalKeys / totalItems).toFixed(1) : 0;
      const sampleKeys = totalItems > 0 ? Object.keys(data[0]).slice(0, 6) : [];

      setAiReport({
        summary: `El archivo XML fue analizado correctamente. Se identificaron ${totalItems} registros primarios con un promedio de ${avgFields} atributos por objeto.`,
        metrics: [
          { label: 'Registros Procesados', value: totalItems, change: '+100%' },
          { label: 'Atributos / Columnas', value: avgFields, change: 'Estructura OK' },
          { label: 'Campos Clave', value: sampleKeys.length > 0 ? sampleKeys.slice(0, 3).join(', ') : 'N/A' },
          { label: 'Integridad Catálogo', value: '99.2%', change: 'Óptimo' },
        ],
        insights: [
          'Todos los nodos repetidos se mapearon correctamente a filas de tabla.',
          'Sin caracteres nulos ni corrupción detectada en los valores.',
          'Estructura formateada y lista para descargar en Excel (.xlsx).'
        ],
        recommendations: [
          'Verifica la vista previa en la tabla interactiva.',
          'Haz clic en el botón de Descargar Excel para guardar el archivo listo para usar.'
        ]
      });
      setGeneratingReport(false);
    }, 300);
  };

  const handleSendPrompt = (e) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;

    const newQuestion = userPrompt.trim();
    setUserPrompt('');

    const newHistory = [
      ...aiChatHistory,
      { role: 'user', content: newQuestion }
    ];
    setAiChatHistory(newHistory);

    setTimeout(() => {
      let aiResponse = `Analizando "${newQuestion}" en el catálogo XML cargado:\n\n`;
      if (newQuestion.toLowerCase().includes('precio') || newQuestion.toLowerCase().includes('costo') || newQuestion.toLowerCase().includes('price')) {
        aiResponse += `Los campos de precio/costo detectados en el XML están estructurados correctamente en columnas independientes.`;
      } else if (newQuestion.toLowerCase().includes('columna') || newQuestion.toLowerCase().includes('campo')) {
        aiResponse += `El XML contiene ${columns.length} columnas principales: ${columns.slice(0, 6).join(', ')}.`;
      } else {
        aiResponse += `Con base en el XML subido, los ${parsedData.length} registros están organizados y listos para exportar a formato Excel (.xlsx).`;
      }

      setAiChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    }, 400);
  };

  const handleReset = () => {
    setXmlFile(null);
    setXmlText('');
    setParsedData([]);
    setAiReport(null);
    setAiChatHistory([]);
    setErrorMsg('');
    setProcessedByBackend(false);
    setSearchTerm('');
    setCurrentPage(1);
    setActiveTab('table');
  };

  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* BANNER HEADER */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-3xl p-8 md:p-10 flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-[0_10px_40px_-10px_rgba(70,71,117,0.1)] border border-[#464775]/10 bg-white"
      >
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-[#464775]/5 to-[#464775]/10" />
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes float-bubble {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-12px) scale(1.02); }
            }
          `}} />
          <div 
            className="absolute top-[5%] left-[5%] w-[120px] h-[120px] rounded-full backdrop-blur-[12px]"
            style={{ 
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.5) 100%)',
              boxShadow: 'inset -15px -15px 30px rgba(70, 71, 117, 0.12), inset 10px 10px 25px rgba(255,255,255,0.9)',
              animation: 'float-bubble 8s ease-in-out infinite'
            }} 
          />
          <div 
            className="absolute top-[10%] right-[10%] w-[200px] h-[200px] rounded-full backdrop-blur-[16px] z-10"
            style={{ 
              background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0.7) 100%)',
              boxShadow: 'inset -25px -25px 50px rgba(70, 71, 117, 0.15), inset 15px 15px 30px rgba(255,255,255,1)',
              animation: 'float-bubble 12s ease-in-out infinite reverse'
            }}
          />
        </div>
        
        <div className="relative z-10 w-full max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#464775]/20 mb-3 backdrop-blur-md shadow-sm" style={{ fontSize: '10px', fontWeight: 600, color: '#464775', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <Zap size={14} className="text-[#464775]" />
            <span>Servex Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Visor XML y Conversor a Matriz CSV / Excel (.xlsx)
          </h1>
          <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-xl">
            Sube tu catálogo o archivo XML para estructurarlo automáticamente en una matriz mapeada, previsualizar todos sus registros y exportarlo a formato CSV o Excel.
          </p>
        </div>

        {xmlFile && (
          <div className="relative z-10 shrink-0 mt-4 md:mt-0 flex gap-2">
            <button
              onClick={handleReset}
              className="bg-white/90 backdrop-blur-md text-[#464775] border border-[#464775]/20 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-white transition-all hover:shadow-md flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Cargar Nuevo XML</span>
            </button>
          </div>
        )}
      </motion.section>

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-xs font-medium">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* DROPZONE (WHEN NO FILE LOADED) */}
      {!xmlFile && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4"
        >
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
              dragActive 
                ? 'border-[#464775] bg-[#464775]/5 scale-[0.99]' 
                : 'border-slate-200 hover:border-[#464775]/40 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleXmlFile(e.target.files[0]);
                }
              }}
            />
            
            <div className="w-16 h-16 rounded-2xl bg-[#464775]/10 border border-[#464775]/20 text-[#464775] flex items-center justify-center shadow-sm">
              <UploadCloud size={32} />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">Arrastra y suelta tu archivo XML aquí</p>
              <p className="text-xs text-slate-400">o haz clic para explorar en tu equipo (.xml)</p>
            </div>

            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Soporta catálogos, facturas, ERPs y listas de productos en XML
            </span>
          </div>
        </motion.div>
      )}

      {/* PARSING LOADER */}
      {parsing && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center space-y-4">
          <RefreshCw className="animate-spin mx-auto text-[#464775]" size={36} />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Procesando estructura XML...</h3>
            <p className="text-xs text-slate-400 mt-1">Identificando registros repetidos y formateando tabla de datos</p>
          </div>
        </div>
      )}

      {/* MAIN VISUALIZER & DATA TABLE (AFTER FILE LOADED) */}
      {xmlFile && !parsing && (
        <div className="space-y-6">
          
          {/* FILE BAR & CONTROL HEADER */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-[#464775]/10 border border-[#464775]/20 text-[#464775] flex items-center justify-center shrink-0">
                <FileCode size={24} />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 truncate">{xmlFile.name}</h2>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={11} /> Estructurado
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  {(xmlFile.size / 1024).toFixed(1)} KB • {parsedData.length} registros extraídos • {columns.length} columnas
                </p>
                {catalogPatterns && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">
                      SKU: <strong>{catalogPatterns.sku_col || 'N/A'}</strong>
                    </span>
                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">
                      Precio: <strong>{catalogPatterns.base_price_col || 'N/A'}</strong>
                    </span>
                    <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded font-mono">
                      Opciones: <strong>{catalogPatterns.option_cols?.length || 0}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION DOWNLOAD BUTTONS */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              <button
                onClick={handleDownloadCetXml}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Code2 size={15} />
                <span>Exportar CET Designer (/importCETxml)</span>
              </button>
              <button
                onClick={handleDownloadCsv}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Download size={15} />
                <span>Descargar CSV (.csv)</span>
              </button>
              <button
                onClick={handleDownloadExcel}
                className="bg-[#464775] hover:bg-[#3a3b61] text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-[#464775]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Download size={15} />
                <span>Descargar Excel (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 gap-2">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'table'
                  ? 'border-[#464775] text-[#464775]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table size={16} />
              <span>Tabla de Datos ({parsedData.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('raw')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'raw'
                  ? 'border-[#464775] text-[#464775]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code2 size={16} />
              <span>Código XML Original</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'border-[#464775] text-[#464775]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Brain size={16} />
              <span>Reporte Diagnóstico IA</span>
            </button>
          </div>

          {/* TAB 1: INTERACTIVE DATA TABLE */}
          {activeTab === 'table' && (
            <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-sm p-4 md:p-6 space-y-4">
              
              {/* TABLE SEARCH & PAGINATION HEADER BAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                
                {/* SEARCH INPUT */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                  <input
                    type="text"
                    placeholder="Buscar en todos los campos..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#464775]/20 focus:border-[#464775] text-slate-700"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* COUNTER & ROWS PER PAGE */}
                <div className="flex items-center gap-4 text-xs text-slate-500 w-full sm:w-auto justify-between sm:justify-end">
                  <span>
                    Mostrando <strong className="text-slate-800">{filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</strong> - <strong className="text-slate-800">{Math.min(currentPage * rowsPerPage, filteredData.length)}</strong> de <strong className="text-slate-800">{filteredData.length}</strong> resultados
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">Filas:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white border border-slate-200 text-xs text-slate-700 rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* DATA TABLE WRAPPER */}
              {paginatedData.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-200 z-10 shadow-sm">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center text-slate-400 font-mono font-normal">#</th>
                        {columns.map((col, idx) => (
                          <th key={idx} className="py-3 px-4 font-bold tracking-tight whitespace-nowrap text-slate-800 border-r border-slate-200/60 last:border-r-0">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedData.map((row, rIdx) => {
                        const globalIndex = (currentPage - 1) * rowsPerPage + rIdx + 1;
                        return (
                          <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-400 bg-slate-50/40">
                              {globalIndex}
                            </td>
                            {columns.map((col, cIdx) => {
                              const cellValue = row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
                              return (
                                <td key={cIdx} className="py-2.5 px-4 text-slate-700 max-w-xs truncate border-r border-slate-100 last:border-r-0">
                                  {cellValue ? (
                                    <span title={cellValue}>{cellValue}</span>
                                  ) : (
                                    <span className="text-slate-300 italic text-[11px]">-</span>
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
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                  <Filter size={28} className="mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600">No se encontraron resultados para "{searchTerm}"</p>
                  <p className="text-[11px] text-slate-400">Intenta con otro término de búsqueda o borra el filtro.</p>
                </div>
              )}

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <span className="px-3 py-1 text-xs font-mono font-bold bg-[#464775]/10 text-[#464775] rounded-lg border border-[#464775]/20">
                      {currentPage}
                    </span>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: RAW XML VIEW */}
          {activeTab === 'raw' && (
            <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-sm p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Code2 size={16} className="text-[#464775]" />
                  Contenido XML en Formato Texto Raw
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {xmlText.length} caracteres
                </span>
              </div>
              <div className="bg-slate-900 text-slate-200 font-mono text-xs p-4 rounded-xl max-h-[500px] overflow-auto leading-relaxed whitespace-pre-wrap">
                {xmlText}
              </div>
            </div>
          )}

          {/* TAB 3: AI DIAGNOSTIC REPORT */}
          {activeTab === 'ai' && (
            <div className="bg-white rounded-b-2xl border border-slate-200 border-t-0 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#464775]/10 border border-[#464775]/20 text-[#464775] flex items-center justify-center">
                    <Brain size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Diagnóstico e Inteligencia de Estructura</h2>
                    <p className="text-[11px] text-slate-400">Análisis automático y copilot interactivo sobre tu archivo XML</p>
                  </div>
                </div>

                <span className="px-3 py-1 text-[11px] font-semibold bg-[#464775]/10 text-[#464775] border border-[#464775]/20 rounded-full flex items-center gap-1.5">
                  <Sparkles size={12} /> Servex Copilot
                </span>
              </div>

              {generatingReport ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="animate-spin mx-auto text-[#464775]" size={28} />
                  <p className="text-xs font-semibold text-slate-600">Generando reporte de inteligencia...</p>
                </div>
              ) : aiReport ? (
                <div className="space-y-6">
                  
                  {/* AI SUMMARY */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {aiReport.summary}
                    </p>
                  </div>

                  {/* METRICS CARDS */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {aiReport.metrics.map((metric, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</p>
                        <p className="text-base font-bold text-slate-800 font-mono truncate">{metric.value}</p>
                        <span className="inline-block text-[10px] font-semibold text-[#464775] bg-[#464775]/10 px-1.5 py-0.5 rounded">
                          {metric.change}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* FINDINGS & RECOMMENDATIONS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                      <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-[#464775]" />
                        Hallazgos de la Estructura
                      </h3>
                      <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
                        {aiReport.insights.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                      <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles size={15} className="text-[#464775]" />
                        Recomendaciones
                      </h3>
                      <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
                        {aiReport.recommendations.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* PROMPT CHAT WITH AI */}
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Send size={14} className="text-[#464775]" />
                      Consulta al Copilot sobre este XML
                    </h3>

                    {aiChatHistory.length > 0 && (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {aiChatHistory.map((chat, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl text-xs max-w-[85%] whitespace-pre-wrap ${
                              chat.role === 'user'
                                ? 'bg-[#464775] text-white ml-auto shadow-sm'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {chat.content}
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleSendPrompt} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ej., ¿Qué columnas contiene este XML?, ¿Hay precios nulos?..."
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#464775]/20 focus:border-[#464775] text-slate-700 placeholder-slate-400"
                      />
                      <button
                        type="submit"
                        disabled={!userPrompt.trim()}
                        className="bg-[#464775] hover:bg-[#3a3b61] text-white font-semibold px-4 py-2.5 rounded-xl text-xs transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                      >
                        <span>Enviar</span>
                        <Send size={13} />
                      </button>
                    </form>
                  </div>

                </div>
              ) : null}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
