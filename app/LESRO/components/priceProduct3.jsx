import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, FiCheck, FiZap, FiShield, FiCpu, FiX, FiSearch, 
  FiAlertTriangle, FiArrowRight, FiCheckCircle, FiInfo, FiXCircle 
} from 'react-icons/fi';
import { BsFileEarmarkArrowUp, BsDatabaseFillCheck, BsCpuFill } from 'react-icons/bs';
import { supabase } from '../../lib/supabaseClient';

const SVXUnifiedAuditSystem = () => {
  // --- Estados de Auditoría (CSV) ---
  const [data, setData] = useState([]); 
  const [masterDataRows, setMasterDataRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null); 
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  // --- Estados de Catálogo (XML / PIM) ---
  const [xmlDoc, setXmlDoc] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState("");
  const [selectedConfigs, setSelectedConfigs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loadingPIM, setLoadingPIM] = useState(true);
  
  const dropdownRef = useRef(null);

  // ============================
  // 1. CARGA INICIAL (PIM XML)
  // ============================
  useEffect(() => {
    const fetchPIMData = async () => {
      try {
        setLoadingPIM(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('ClientsSERVEX')
          .select('xml_raw')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data?.xml_raw) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.xml_raw, "text/xml");
          setXmlDoc(doc);
          const codes = [...doc.getElementsByTagName("Product")].map(p => 
            p.getElementsByTagName("Code")[0]?.textContent
          ).filter(Boolean);
          setProductsList(codes);
        }
      } catch (err) {
        console.error("Error PIM:", err);
      } finally {
        setLoadingPIM(false);
      }
    };
    fetchPIMData();
  }, []);

  // ============================
  // 2. LÓGICA DE BÚSQUEDA XML
  // ============================
  const handleSearchXML = (sku) => {
    if (!xmlDoc || !sku) return;
    if (selectedConfigs.find(c => c.sku === sku)) return;

    const productNode = [...xmlDoc.getElementsByTagName("Product")].find(
      p => p.getElementsByTagName("Code")[0]?.textContent === sku
    );

    if (!productNode) return;

    const resolveFeatures = () => {
      const featureNodes = [...productNode.getElementsByTagName("Feature")];
      const featureRefs = [...productNode.getElementsByTagName("FeatureRef")];
      const all = [...featureNodes.map(f => ({ node: f, type: 'direct' })), 
                   ...featureRefs.map(r => ({ code: r.textContent.trim(), type: 'ref' }))];

      return all.map(item => {
        let fDetail = item.type === 'ref' 
          ? [...xmlDoc.getElementsByTagName("Feature")].find(f => f.getElementsByTagName("Code")[0]?.textContent === item.code)
          : item.node;

        if (!fDetail) return null;
        const options = [...fDetail.getElementsByTagName("Option")].map(o => ({
          code: o.getElementsByTagName("Code")[0]?.textContent,
          desc: o.querySelector("Description")?.textContent || "Opción",
          price: parseFloat(o.querySelector("OptionPrice > Value")?.textContent || 0)
        })).filter(opt => opt.price > 0);

        return options.length > 0 ? { 
          id: fDetail.getElementsByTagName("Code")[0]?.textContent, 
          name: fDetail.querySelector("Description")?.textContent || "Feature", 
          options 
        } : null;
      }).filter(Boolean);
    };

    const newConfig = {
      sku: sku,
      name: productNode.querySelector("Description")?.textContent || "Modelo",
      basePrice: parseFloat(productNode.querySelector("Price > Value")?.textContent || 0),
      selections: {},
      features: resolveFeatures()
    };

    setSelectedConfigs(prev => [newConfig, ...prev]);
    setExpandedIndex(0);
    setShowDropdown(false);
    setSelectedSKU("");
  };

  // ============================
  // 3. LÓGICA DE AUDITORÍA CSV
  // ============================
  const processCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const matrix = lines.map(line => line.split(delimiter).map(cell => cell.trim()));
    setData(matrix);
    setMatchStatus(null);
    showAlert("CSV Cargado", "success");
  };

  const handleAnalyze = async () => {
    if (data.length === 0) return;
    setIsAnalyzing(true);
    try {
      const { data: dbRows } = await supabase.from('ClientsSERVEX').select('csv_raw').limit(1);
      if (!dbRows?.[0]) throw new Error("No master data");

      const dbLines = dbRows[0].csv_raw.split(/\r?\n/).filter(l => l.trim() !== "");
      const dbMatrix = dbLines.map(line => line.split(dbLines[0].includes(';') ? ';' : ',').map(c => c.trim()));

      const header = data[0];
      const skuColIndex = header.findIndex(h => h.toUpperCase().includes('ID') || h.toUpperCase().includes('SKU') || h.toUpperCase().includes('CODE'));

      const discrepancies = [];
      data.slice(1).forEach((row, idx) => {
        const mRow = dbMatrix[idx + 1] || [];
        if (JSON.stringify(row) !== JSON.stringify(mRow)) {
          discrepancies.push({ row, mRow });
          // Sincronización automática: Si detecta error y hay SKU, cargar en PIM
          if (skuColIndex !== -1 && row[skuColIndex]) {
            handleSearchXML(row[skuColIndex]);
          }
        }
      });

      if (discrepancies.length === 0) {
        setMatchStatus('match');
        showAlert("Integridad Total", "success");
      } else {
        setMatchStatus('mismatch');
        setMasterDataRows(discrepancies.map(d => d.mRow));
        setData([header, ...discrepancies.map(d => d.row)]);
        showAlert(`${discrepancies.length} Discrepancias encontradas`, "warning");
      }
    } catch (err) {
      showAlert("Error en análisis", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
  };

  return (
    <div className="flex h-screen w-full bg-[#F6F6F7] font-sans overflow-hidden">
      
      {/* ALERTAS */}
      <AnimatePresence>
        {alert.show && (
          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}
            className="fixed top-6 right-6 z-[999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl bg-white border border-[#EDEBE9]">
            <div className={`p-2 rounded-lg text-white ${alert.type === 'success' ? 'bg-[#237B4B]' : 'bg-[#A4262C]'}`}>
              {alert.type === 'success' ? <FiCheckCircle /> : <FiAlertTriangle />}
            </div>
            <p className="text-xs font-bold text-[#242424]">{alert.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COLUMNA IZQUIERDA: AUDITORÍA (65%) */}
      <section className="w-[65%] flex flex-col border-r border-[#EDEBE9] bg-white">
        <div className="p-4 border-b flex justify-between items-center bg-[#FAF9F8]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#464775] rounded-lg text-white"><FiCpu size={16}/></div>
            <h1 className="text-sm font-black text-[#464775] uppercase tracking-tighter">SVX Audit Engine</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setData([]); setMatchStatus(null); setSelectedConfigs([]); }} className="text-[10px] font-bold px-3 py-1 hover:bg-gray-100 rounded">RESETEAR</button>
            <button onClick={handleAnalyze} disabled={data.length === 0} className="bg-[#464775] text-white text-[10px] font-bold px-4 py-1.5 rounded-lg shadow-lg hover:brightness-110 disabled:opacity-50">EJECUTAR AUDITORÍA</button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          {data.length === 0 ? (
            <div 
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
              className={`h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${isDragging ? 'border-[#464775] bg-[#F3F2F1]' : 'border-[#EDEBE9] bg-[#FAF9F8]'}`}
            >
              <FiUploadCloud size={48} className="text-[#464775] mb-4 opacity-20" />
              <p className="text-sm font-bold text-[#464775]">Arrastre su reporte CSV aquí</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Protocolo de sincronización activa</p>
            </div>
          ) : (
            <div className="h-full flex flex-col overflow-hidden border rounded-xl shadow-sm">
              <div className="overflow-auto bg-white flex-1">
                <table className="w-full text-[10px]">
                  <thead className="sticky top-0 bg-[#FAF9F8] border-b z-10">
                    <tr>
                      {data[0].map((h, i) => (
                        <th key={i} className="p-3 text-left font-black text-[#464775] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(1).map((row, ri) => (
                      <tr key={ri} className="border-b hover:bg-gray-50">
                        {row.map((cell, ci) => {
                          const mCell = masterDataRows[ri]?.[ci];
                          const diff = mCell !== undefined && mCell !== cell;
                          return (
                            <td key={ci} className={`p-3 border-r last:border-0 ${diff ? 'bg-red-50/50' : ''}`}>
                              {diff ? (
                                <div className="flex flex-col">
                                  <span className="text-red-400 line-through text-[9px]">{mCell}</span>
                                  <span className="text-[#237B4B] font-bold flex items-center gap-1"><FiArrowRight size={8}/>{cell}</span>
                                </div>
                              ) : <span className="text-gray-600">{cell}</span>}
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
        </div>
      </section>

      {/* COLUMNA DERECHA: PIM SYNC (35%) */}
      <section className="w-[35%] flex flex-col bg-[#F9F9F9]">
        <div className="p-4 border-b bg-white" ref={dropdownRef}>
          <label className="text-[9px] font-black text-[#464775] uppercase mb-2 block tracking-widest">Buscador PIM Engine</label>
          <div className="relative">
            <input 
              type="text"
              className="w-full p-2.5 bg-[#FAF9F8] border rounded-lg text-xs font-bold focus:outline-none focus:border-[#464775] transition-all"
              placeholder="Escriba SKU para inspeccionar..."
              value={selectedSKU}
              onChange={(e) => { setSelectedSKU(e.target.value.toUpperCase()); setShowDropdown(true); }}
            />
            {showDropdown && selectedSKU && (
              <div className="absolute w-full mt-1 bg-white shadow-2xl rounded-lg border z-[100] max-h-48 overflow-auto">
                {productsList.filter(p => p.includes(selectedSKU)).slice(0, 8).map(p => (
                  <div key={p} onClick={() => handleSearchXML(p)} className="p-3 hover:bg-[#F3F2F1] cursor-pointer text-[10px] font-bold border-b last:border-0">
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {selectedConfigs.length > 0 ? (
            selectedConfigs.map((config, pIdx) => (
              <div key={pIdx} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div 
                  onClick={() => setExpandedIndex(expandedIndex === pIdx ? null : pIdx)}
                  className={`p-4 cursor-pointer flex justify-between items-center transition-all ${expandedIndex === pIdx ? 'bg-[#464775] text-white' : 'hover:bg-gray-50'}`}
                >
                  <div>
                    <p className="text-[11px] font-black">{config.sku}</p>
                    <p className={`text-[9px] ${expandedIndex === pIdx ? 'text-white/70' : 'text-[#464775] font-bold'}`}>
                      Total: ${(config.basePrice + Object.values(config.selections).reduce((a, b) => a + b.price, 0)).toLocaleString()}
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedConfigs(prev => prev.filter((_, i) => i !== pIdx)); }} className="text-xs opacity-50 hover:opacity-100">✕</button>
                </div>
                
                {expandedIndex === pIdx && (
                  <div className="p-4 bg-white space-y-4">
                    {config.features.map((feat) => (
                      <div key={feat.id}>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{feat.name}</span>
                        <div className="mt-2 space-y-1">
                          {feat.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                const newConfigs = [...selectedConfigs];
                                newConfigs[pIdx].selections[feat.id] = opt;
                                setSelectedConfigs(newConfigs);
                              }}
                              className={`w-full p-2.5 rounded-lg border text-[10px] flex justify-between items-center transition-all ${config.selections[feat.id]?.code === opt.code ? 'border-[#464775] bg-[#F3F2F1] font-bold' : 'border-gray-100 hover:bg-gray-50'}`}
                            >
                              <span>{opt.desc}</span>
                              <span className="text-[#464775] font-black">+$ {opt.price}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-40">
              <BsCpuFill size={40} className="mb-4 text-[#464775]" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Esperando Datos de Auditoría</p>
              <p className="text-[9px] mt-2 leading-relaxed">Las discrepancias del CSV aparecerán aquí automáticamente para validación XML.</p>
            </div>
          )}
        </div>

        {selectedConfigs.length > 0 && (
          <div className="p-4 bg-white border-t">
            <button className="w-full bg-[#237B4B] text-white py-2 rounded-lg text-[10px] font-black shadow-lg">FINALIZAR ACTUALIZACIÓN PIM</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default SVXUnifiedAuditSystem;