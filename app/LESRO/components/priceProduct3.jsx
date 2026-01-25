'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, FiCheck, FiZap, FiShield, FiCpu, FiX, FiSearch, 
  FiAlertTriangle, FiArrowRight, FiCheckCircle, FiInfo, FiXCircle 
} from 'react-icons/fi';
import { BsFileEarmarkArrowUp, BsCpuFill } from 'react-icons/bs';
import { supabase } from '../../lib/supabaseClient';

const SVXIntegratorSystem = () => {
  // --- Estados de Auditoría (Lógica Componente 1) ---
  const [data, setData] = useState([]); 
  const [masterDataRows, setMasterDataRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null); 
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  // --- Estados de XML / PIM (Lógica Componente 2) ---
  const [xmlDoc, setXmlDoc] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState("");
  const [selectedConfigs, setSelectedConfigs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const dropdownRef = useRef(null);

  // ============================
  // ✅ CARGA INICIAL XML (PIM)
  // ============================
  useEffect(() => {
    const fetchXMLFromSupabase = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('ClientsSERVEX')
          .select('xml_raw')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        if (data?.xml_raw) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.xml_raw, "text/xml");
          setXmlDoc(doc);
          const codes = [...doc.getElementsByTagName("Product")].map(p => 
            p.getElementsByTagName("Code")[0]?.textContent
          ).filter(Boolean);
          setProducts(codes);
        }
      } catch (err) {
        console.error("Error cargando PIM:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchXMLFromSupabase();
  }, []);

  // ============================
  // ✅ MOTOR DE BÚSQUEDA XML (Lógica Pura Cmp 2)
  // ============================
  const handleSearchXML = useCallback((sku) => {
    if (!xmlDoc || !sku) return;
    // Evitar duplicados en la lista derecha
    if (selectedConfigs.find(c => c.sku === sku)) return;

    const productNode = [...xmlDoc.getElementsByTagName("Product")].find(
      p => p.getElementsByTagName("Code")[0]?.textContent === sku
    );

    if (!productNode) return;

    const featureNodes = [...productNode.getElementsByTagName("Feature")];
    const featureRefs = [...productNode.getElementsByTagName("FeatureRef")];
    const allFeatures = [
      ...featureNodes.map(f => ({ node: f, type: 'direct' })), 
      ...featureRefs.map(r => ({ code: r.textContent.trim(), type: 'ref' }))
    ];

    const resolvedFeatures = allFeatures.map(item => {
      let fDetail = item.type === 'ref' 
        ? [...xmlDoc.getElementsByTagName("Feature")].find(f => f.getElementsByTagName("Code")[0]?.textContent === item.code)
        : item.node;

      if (!fDetail) return null;

      const fCode = fDetail.getElementsByTagName("Code")[0]?.textContent;
      const fName = fDetail.querySelector("Description")?.textContent || fCode;
      
      const options = [...fDetail.getElementsByTagName("Option")].map(o => ({
        code: o.getElementsByTagName("Code")[0]?.textContent,
        desc: o.querySelector("Description")?.textContent || "Opción",
        price: parseFloat(o.querySelector("OptionPrice > Value")?.textContent || 0)
      })).filter(opt => opt.price > 0);

      return options.length > 0 ? { id: fCode, name: fName, options } : null;
    }).filter(Boolean);

    const newConfig = {
      sku: sku,
      name: productNode.querySelector("Description")?.textContent || "Modelo Detectado",
      basePrice: parseFloat(productNode.querySelector("Price > Value")?.textContent || 0),
      selections: {},
      features: resolvedFeatures
    };

    setSelectedConfigs(prev => [newConfig, ...prev]);
    setExpandedIndex(0);
  }, [xmlDoc, selectedConfigs]);

  // ============================
  // ✅ LOGICA DE AUDITORÍA Y CRUCE
  // ============================
  const processCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return;
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const matrix = lines.map(line => line.split(delimiter).map(cell => cell.trim()));

    setData(matrix);
    setMatchStatus(null);
    setMasterDataRows([]);
    showAlert("CSV Cargado Correctamente", "success");
  };

  const handleAnalyze = async () => {
    if (data.length === 0) return;
    setIsAnalyzing(true);
    try {
      const { data: dbRows } = await supabase
        .from('ClientsSERVEX')
        .select('csv_raw')
        .not('csv_raw', 'is', null)
        .limit(1);

      if (!dbRows?.[0]) {
        showAlert("No hay registro maestro en Supabase", "error");
        return;
      }

      const dbLines = dbRows[0].csv_raw.split(/\r?\n/).filter(l => l.trim() !== "");
      const dbDelimiter = dbLines[0].includes(';') ? ';' : ',';
      const dbMatrix = dbLines.map(line => line.split(dbDelimiter).map(c => c.trim()));

      const header = data[0];
      // Identificamos en qué columna está el SKU (ID o Product)
      const skuIndex = header.findIndex(h => h.toUpperCase().includes('ID') || h.toUpperCase().includes('PRODUCT') || h.toUpperCase().includes('CODE'));
      
      const currentRows = data.slice(1);
      const masterRowsOnly = dbMatrix.slice(1);

      const discrepancies = [];
      const skusToLoad = [];

      currentRows.forEach((row, idx) => {
        const mRow = masterRowsOnly[idx] || [];
        const isDifferent = JSON.stringify(row) !== JSON.stringify(mRow);
        
        if (isDifferent) {
          discrepancies.push({ row, mRow });
          // Extraemos el SKU de la fila con error para el XML
          if (skuIndex !== -1 && row[skuIndex]) {
            skusToLoad.push(row[skuIndex]);
          }
        }
      });

      if (discrepancies.length === 0) {
        setMatchStatus('match');
        showAlert("Integridad Total Confirmada", "success");
      } else {
        setMatchStatus('mismatch');
        setMasterDataRows(discrepancies.map(d => d.mRow));
        setData([header, ...discrepancies.map(d => d.row)]);
        
        // 🚀 AUTOMATIZACIÓN: Cargar cada SKU discrepante en el panel derecho
        skusToLoad.forEach(sku => handleSearchXML(sku));
        
        showAlert(`Se detectaron ${discrepancies.length} cambios. Sincronizando con PIM...`, "warning");
      }
    } catch (err) {
      showAlert("Error en comunicación con SVX Cloud", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 5000);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white font-sans text-[#464775]">
      <div className="animate-spin mr-3 text-xl">●</div> Sincronizando Ecosistema ServeX...
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans text-[#242424]">
      
      {/* SECCIÓN IZQUIERDA: AUDITORÍA (65%) */}
      <section className="w-[65%] h-full border-r border-[#EDEBE9] flex flex-col bg-white">
        
        {/* Header Consola */}
        <div className="p-4 border-b border-[#EDEBE9] flex justify-between items-center bg-[#FAF9F8]">
          <div className="flex items-center gap-2">
            <FiCpu className="text-[#464775]" size={18} />
            <h2 className="text-xs font-black uppercase tracking-widest text-[#464775]">SVX Audit Engine</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setData([]); setMatchStatus(null); setSelectedConfigs([]); setFileName(""); }}
              className="px-3 py-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase"
            >
              Resetear
            </button>
            <button 
              onClick={handleAnalyze}
              disabled={data.length === 0 || isAnalyzing}
              className="px-4 py-1.5 bg-[#464775] text-white rounded-md text-[10px] font-black shadow-lg flex items-center gap-2 hover:brightness-110 disabled:opacity-30 transition-all"
            >
              {isAnalyzing ? "PROCESANDO..." : "EJECUTAR ANÁLISIS"} <FiZap size={12} />
            </button>
          </div>
        </div>

        {/* Área de Datos */}
        <div className="flex-1 overflow-hidden p-4">
          <AnimatePresence mode="wait">
            {data.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault(); setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file?.name.endsWith('.csv')) {
                    setFileName(file.name);
                    const reader = new FileReader();
                    reader.onload = (ev) => processCSV(ev.target.result);
                    reader.readAsText(file);
                  }
                }}
                className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${isDragging ? "bg-[#F3F2F1] border-[#464775]" : "bg-[#FAF9F8] border-[#EDEBE9]"}`}
              >
                <FiUploadCloud size={40} className="text-[#464775] mb-4 opacity-20" />
                <p className="text-[11px] font-black text-[#464775]">ARRASTRE EL REPORTE CSV PARA AUDITORÍA</p>
                <p className="text-[9px] text-gray-400 mt-2 uppercase tracking-tighter">Comparación automática contra base de datos</p>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col">
                <div className="overflow-auto border border-[#EDEBE9] rounded-lg h-full shadow-sm bg-white">
                  <table className="w-full text-left text-[10px]">
                    <thead className="bg-[#FAF9F8] sticky top-0 z-10 border-b border-[#EDEBE9]">
                      <tr>
                        {data[0].map((h, i) => (
                          <th key={i} className="p-3 font-black text-[#464775] uppercase whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(1).map((row, ri) => (
                        <tr key={ri} className="border-b border-[#F3F2F1] hover:bg-gray-50 transition-colors">
                          {row.map((cell, ci) => {
                            const masterCell = masterDataRows[ri]?.[ci];
                            const isDiff = masterCell !== undefined && cell !== masterCell;
                            return (
                              <td key={ci} className={`p-3 border-r border-[#F3F2F1] last:border-0 ${isDiff ? 'bg-red-50/30' : ''}`}>
                                {isDiff ? (
                                  <div className="flex flex-col">
                                    <span className="text-red-400 line-through font-medium text-[9px]">{masterCell || '(vacante)'}</span>
                                    <div className="flex items-center gap-1 text-[#237B4B] font-bold">
                                      <FiArrowRight size={10} /><span>{cell}</span>
                                    </div>
                                  </div>
                                ) : <span className="text-[#616161]">{cell}</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Alerta flotante interna */}
        <AnimatePresence>
          {alert.show && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl bg-white border border-[#EDEBE9] z-[100]"
            >
              <div className={`p-2 rounded-full text-white ${alert.type === 'success' ? 'bg-[#237B4B]' : 'bg-[#D83B01]'}`}>
                {alert.type === 'success' ? <FiCheckCircle size={14}/> : <FiAlertTriangle size={14}/>}
              </div>
              <span className="text-[10px] font-bold uppercase">{alert.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* SECCIÓN DERECHA: PIM XML (35%) */}
      <section className="w-[35%] h-full flex flex-col bg-[#F9F9F9] shadow-inner">
        
        {/* Buscador PIM manual */}
        <div className="p-4 bg-white border-b border-[#EDEBE9]" ref={dropdownRef}>
          <div className="relative">
            <div className="flex items-center bg-white rounded border-b-2 border-[#464775]/20 focus-within:border-[#464775] px-3 transition-all">
              <FiSearch size={14} className="text-gray-300 mr-2" />
              <input 
                type="text"
                className="w-full py-3 bg-transparent outline-none text-[11px] font-bold uppercase"
                placeholder="BUSCAR SKU EN XML PIM..."
                value={selectedSKU}
                onChange={(e) => { setSelectedSKU(e.target.value.toUpperCase()); setShowDropdown(true); }}
              />
            </div>
            {showDropdown && selectedSKU && (
              <div className="absolute w-full bg-white shadow-2xl rounded-b-xl border border-[#EDEBE9] z-50 max-h-48 overflow-auto mt-1">
                {products.filter(p => p.includes(selectedSKU)).slice(0, 10).map(p => (
                  <div key={p} onClick={() => { handleSearchXML(p); setSelectedSKU(""); setShowDropdown(false); }} 
                    className="px-4 py-3 hover:bg-[#FAF9F8] cursor-pointer text-[10px] font-black border-b last:border-none text-[#464775]">
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contenido Dinámico de Productos XML */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {selectedConfigs.length > 0 ? (
            selectedConfigs.map((config, pIdx) => (
              <motion.div 
                key={`${config.sku}-${pIdx}`} 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-[#EDEBE9] rounded-lg shadow-sm overflow-hidden"
              >
                <div 
                  className={`p-4 flex justify-between items-center cursor-pointer transition-all ${expandedIndex === pIdx ? 'bg-[#464775] text-white shadow-lg' : 'bg-white text-[#242424] hover:bg-[#F3F2F1]'}`}
                  onClick={() => setExpandedIndex(expandedIndex === pIdx ? null : pIdx)}
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black tracking-tight flex items-center gap-2">
                      <FiShield size={10} className={expandedIndex === pIdx ? "text-white" : "text-[#464775]"} />
                      {config.sku}
                    </span>
                    <span className={`text-[10px] mt-1 font-bold ${expandedIndex === pIdx ? 'text-white/80' : 'text-[#237B4B]'}`}>
                      ${ (config.basePrice + Object.values(config.selections).reduce((a, b) => a + b.price, 0)).toLocaleString() }
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                       onClick={(e) => { e.stopPropagation(); setSelectedConfigs(prev => prev.filter((_, i) => i !== pIdx)); }}
                       className="p-1 hover:bg-black/10 rounded-full"
                    ><FiX size={12} /></button>
                  </div>
                </div>

                {expandedIndex === pIdx && (
                  <div className="p-4 space-y-5 bg-white border-t border-[#EDEBE9]">
                    {config.features.map((feat) => (
                      <div key={feat.id} className="space-y-2">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">{feat.name}</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {feat.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                const newConfigs = [...selectedConfigs];
                                newConfigs[pIdx].selections[feat.id] = opt;
                                setSelectedConfigs(newConfigs);
                              }}
                              className={`w-full p-3 rounded-md flex justify-between items-center text-[10px] border transition-all ${
                                config.selections[feat.id]?.code === opt.code 
                                ? "bg-[#F3F2F1] border-[#464775] font-black shadow-sm" 
                                : "bg-white border-[#EDEBE9] hover:bg-gray-50"
                              }`}
                            >
                              <span className="text-left leading-tight pr-4">{opt.desc}</span>
                              <span className="text-[#464775] font-black whitespace-nowrap">+$ {opt.price}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
               <div className="w-full bg-white border border-[#464775]/10 rounded-2xl p-10 shadow-sm relative overflow-hidden flex flex-col items-center">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><FiCpu size={80} /></div>
                  <BsCpuFill size={40} className="text-[#464775] mb-4 opacity-20" />
                  <h3 className="text-[#464775] font-black text-xs uppercase tracking-[0.2em] mb-3">Sincronización PIM</h3>
                  <p className="text-[#616161] text-[10px] leading-relaxed font-medium">
                    Ejecute el análisis del CSV para cargar automáticamente las discrepancias aquí, o busque un SKU manualmente.
                  </p>
                  <div className="mt-6 flex items-center gap-2 bg-[#FAF9F8] px-4 py-2 rounded-full border">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase">Ready for Sync</span>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Resumen Global Inferior */}
        {selectedConfigs.length > 0 && (
          <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-[#464775] p-4 text-white shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black opacity-60 uppercase tracking-widest">Productos Sincronizados</p>
                <p className="text-sm font-black">{selectedConfigs.length} Items en Proceso</p>
              </div>
              <button 
                className="bg-white text-[#464775] px-4 py-2 rounded-md text-[10px] font-black uppercase shadow-lg hover:bg-gray-100"
                onClick={() => setSelectedConfigs([])}
              >
                Limpiar
              </button>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default SVXIntegratorSystem;