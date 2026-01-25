import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, FiCheck, FiZap, FiShield, FiCpu, FiX, 
  FiSearch, FiAlertTriangle, FiArrowRight, FiCheckCircle 
} from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

const SVXUnifiedEnterprise = () => {
  const [data, setData] = useState([]); 
  const [masterDataRows, setMasterDataRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null); 
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [xmlDoc, setXmlDoc] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState("");
  const [loadingXML, setLoadingXML] = useState(true);
  const [selectedConfigs, setSelectedConfigs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const dropdownRef = useRef(null);

  // --- LOGICA DE DATOS (Mantenida igual para funcionalidad) ---
  useEffect(() => {
    const fetchXML = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setLoadingXML(false);
        const { data, error } = await supabase.from('ClientsSERVEX').select('xml_raw').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
        if (data?.xml_raw) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.xml_raw, "text/xml");
          setXmlDoc(doc);
          setProducts([...doc.getElementsByTagName("Product")].map(p => p.getElementsByTagName("Code")[0]?.textContent).filter(Boolean));
        }
      } catch (err) { console.error(err); } finally { setLoadingXML(false); }
    };
    fetchXML();
  }, []);

  const processCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return;
    const delimiter = lines[0].includes(';') ? ';' : ',';
    setData(lines.map(line => line.split(delimiter).map(cell => cell.trim())));
    setAlert({ show: true, message: "CSV cargado correctamente", type: 'success' });
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (ev) => processCSV(ev.target.result);
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    if (data.length === 0) return;
    setIsAnalyzing(true);
    try {
      const { data: dbRows } = await supabase.from('ClientsSERVEX').select('csv_raw').not('csv_raw', 'is', null).limit(1);
      if (!dbRows[0]) return;
      const dbLines = dbRows[0].csv_raw.split(/\r?\n/).filter(l => l.trim() !== "");
      const dbMatrix = dbLines.map(line => line.split(dbLines[0].includes(';') ? ';' : ',').map(c => c.trim()));
      
      const header = data[0];
      const skuColIndex = header.findIndex(h => ['SKU', 'ID', 'PRODUCT'].includes(h.toUpperCase()));
      const discrepancies = data.slice(1).map((row, idx) => ({ row, mRow: dbMatrix[idx + 1] || [], isDiff: JSON.stringify(row) !== JSON.stringify(dbMatrix[idx + 1]) })).filter(d => d.isDiff);

      if (discrepancies.length === 0) {
        setMatchStatus('match');
      } else {
        setMatchStatus('mismatch');
        setMasterDataRows(discrepancies.map(d => d.mRow));
        setData([header, ...discrepancies.map(d => d.row)]);
        if (skuColIndex !== -1) discrepancies.forEach(d => handleSearch(d.row[skuColIndex], true));
      }
    } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
  };

  const handleSearch = (sku, isAuto = false) => {
    if (!xmlDoc || !sku || selectedConfigs.find(c => c.sku === sku)) return;
    const pNode = [...xmlDoc.getElementsByTagName("Product")].find(p => p.getElementsByTagName("Code")[0]?.textContent === sku);
    if (!pNode) return;

    const feats = [...pNode.getElementsByTagName("Feature"), ...pNode.getElementsByTagName("FeatureRef")].map(f => {
      let detail = f.tagName === "FeatureRef" ? [...xmlDoc.getElementsByTagName("Feature")].find(x => x.getElementsByTagName("Code")[0]?.textContent === f.textContent.trim()) : f;
      if (!detail) return null;
      const options = [...detail.getElementsByTagName("Option")].map(o => ({
        code: o.getElementsByTagName("Code")[0]?.textContent,
        desc: o.querySelector("Description")?.textContent || "Opción",
        price: parseFloat(o.querySelector("OptionPrice > Value")?.textContent || 0)
      })).filter(o => o.price > 0);
      return options.length > 0 ? { id: detail.getElementsByTagName("Code")[0]?.textContent, name: detail.querySelector("Description")?.textContent || "Característica", options } : null;
    }).filter(Boolean);

    setSelectedConfigs(prev => [{ sku, name: pNode.querySelector("Description")?.textContent || sku, basePrice: parseFloat(pNode.querySelector("Price > Value")?.textContent || 0), selections: {}, features: feats }, ...prev]);
    if (!isAuto) { setExpandedIndex(0); setSelectedSKU(""); setShowDropdown(false); }
  };

  if (loadingXML) return <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-white text-[10px] font-bold text-[#464775] uppercase tracking-widest">Iniciando Motor Intel SVX...</div>;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-[#F8F9FA] overflow-hidden text-[#201F1E]">
      
      {/* ALERTA FLOTANTE */}
      <AnimatePresence>
        {alert.show && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-2 bg-white shadow-xl rounded-full border border-[#EDEBE9]">
            <FiCheckCircle className="text-[#237B4B]" />
            <span className="text-[10px] font-bold uppercase">{alert.message}</span>
            <button onClick={() => setAlert({ ...alert, show: false })}><FiX size={14}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PANEL IZQUIERDO: AUDITORÍA (65%) */}
      <section className="flex-[0.65] min-h-0 flex flex-col border-r border-[#EDEBE9]">
        <header className="p-4 bg-white border-b flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#464775] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#464775]/20">
              <FiCpu />
            </div>
            <div>
              <h1 className="text-[11px] font-black uppercase tracking-wider">SVX Auditor Delta</h1>
              <p className="text-[9px] text-gray-400 font-medium">Sincronización de Datos Maestros</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setData([]); setMatchStatus(null); setSelectedConfigs([]); }} 
              className="px-3 py-1.5 text-[9px] font-bold hover:bg-gray-100 rounded transition-colors uppercase">Limpiar</button>
            <button onClick={handleAnalyze} disabled={data.length === 0 || isAnalyzing}
              className={`px-4 py-1.5 rounded text-[9px] font-black flex items-center gap-2 shadow-sm transition-all ${data.length > 0 ? 'bg-[#464775] text-white hover:scale-105' : 'bg-gray-100 text-gray-400'}`}>
              {isAnalyzing ? "PROCESANDO..." : "ANALIZAR DELTA"} <FiZap />
            </button>
          </div>
        </header>

        <main className="flex-grow p-4 min-h-0">
          {data.length === 0 ? (
            <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
              className={`w-full h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${isDragging ? "bg-[#F3F2F1] border-[#464775]" : "bg-white border-[#EDEBE9]"}`}>
              <div className="p-6 bg-[#FAF9F8] rounded-full mb-4"><FiUploadCloud size={32} className="text-[#464775] opacity-40" /></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arrastre reporte CSV aquí</p>
            </div>
          ) : (
            <div className="w-full h-full bg-white border border-[#EDEBE9] rounded-xl overflow-hidden flex flex-col shadow-sm">
              <div className="overflow-auto flex-grow">
                <table className="w-full text-[10px] border-collapse">
                  <thead className="sticky top-0 bg-[#FAF9F8] z-10 shadow-sm">
                    <tr>
                      {data[0].map((h, i) => (
                        <th key={i} className="p-3 text-left font-black text-[#464775] border-b border-[#EDEBE9] uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F2F1]">
                    {data.slice(1).map((row, ri) => (
                      <tr key={ri} className="hover:bg-[#F9FAFB] transition-colors group">
                        {row.map((cell, ci) => {
                          const mCell = masterDataRows[ri] ? masterDataRows[ri][ci] : null;
                          const isDiff = mCell !== null && cell !== mCell;
                          return (
                            <td key={ci} className={`p-3 transition-colors ${isDiff ? 'bg-orange-50/50' : ''}`}>
                              {isDiff ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[8px] text-red-400 line-through font-medium opacity-60">{mCell}</span>
                                  <span className="text-[#237B4B] font-bold flex items-center gap-1"><FiArrowRight size={10}/>{cell}</span>
                                </div>
                              ) : <span className="text-gray-500 font-medium">{cell}</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </section>

      {/* PANEL DERECHO: PIM / CONFIGURADOR (35%) */}
      <aside className="flex-[0.35] min-h-0 flex flex-col bg-[#FAF9F8]">
        <header className="p-4 bg-white border-b shrink-0">
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center bg-[#F3F2F1] rounded-lg border border-transparent focus-within:border-[#464775] focus-within:bg-white transition-all px-3">
              <FiSearch className="text-gray-400" />
              <input type="text" placeholder="BUSCAR EN CATÁLOGO PIM..." className="w-full p-2.5 bg-transparent outline-none text-[10px] font-bold uppercase"
                value={selectedSKU} onChange={(e) => { setSelectedSKU(e.target.value.toUpperCase()); setShowDropdown(true); }} />
            </div>
            <AnimatePresence>
              {showDropdown && selectedSKU && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute w-full mt-2 bg-white shadow-2xl rounded-xl border border-[#EDEBE9] z-[50] max-h-64 overflow-auto py-2">
                  {products.filter(p => p.includes(selectedSKU)).slice(0, 10).map(p => (
                    <button key={p} onClick={() => handleSearch(p)} className="w-full text-left px-4 py-2 hover:bg-[#F3F2F1] text-[10px] font-bold text-[#464775] flex items-center justify-between">
                      {p} <FiArrowRight className="opacity-0 group-hover:opacity-100" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 min-h-0">
          {selectedConfigs.length > 0 ? (
            selectedConfigs.map((config, pIdx) => (
              <motion.div layout key={config.sku} className="bg-white border border-[#EDEBE9] rounded-xl shadow-sm overflow-hidden border-l-4 border-l-[#464775]">
                <div onClick={() => setExpandedIndex(expandedIndex === pIdx ? null : pIdx)}
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-[#464775] truncate">{config.sku}</p>
                    <p className="text-[12px] font-black mt-0.5">${(config.basePrice + Object.values(config.selections).reduce((a, b) => a + b.price, 0)).toLocaleString()}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedConfigs(prev => prev.filter((_, i) => i !== pIdx)); }} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors"><FiX /></button>
                </div>
                
                <AnimatePresence>
                  {expandedIndex === pIdx && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-[#F3F2F1]">
                      <div className="p-4 space-y-4 bg-[#FCFCFC]">
                        {config.features.map(feat => (
                          <div key={feat.id} className="space-y-2">
                            <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{feat.name}</label>
                            <div className="flex flex-col gap-1.5">
                              {feat.options.map((opt, i) => (
                                <button key={i} onClick={() => {
                                  const nc = [...selectedConfigs];
                                  nc[pIdx].selections[feat.id] = opt;
                                  setSelectedConfigs(nc);
                                }} className={`w-full p-3 text-left text-[9px] rounded-lg border transition-all flex justify-between items-center ${config.selections[feat.id]?.code === opt.code ? 'border-[#464775] bg-white shadow-md ring-1 ring-[#464775]' : 'border-transparent bg-gray-100 hover:bg-gray-200'}`}>
                                  <span className="font-bold text-gray-700">{opt.desc}</span>
                                  <span className="font-black text-[#464775]">+$ {opt.price}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-40">
              <FiShield size={48} className="mb-4 text-[#464775]" />
              <h3 className="text-[11px] font-black uppercase mb-2">Monitor PIM Inactivo</h3>
              <p className="text-[9px] leading-relaxed font-medium">Las discrepancias detectadas se inyectarán aquí automáticamente para su re-configuración técnica.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default SVXUnifiedEnterprise;