import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, 
  FiCheck, 
  FiZap, 
  FiShield, 
  FiCpu, 
  FiX, 
  FiSearch, 
  FiAlertTriangle, 
  FiArrowRight, 
  FiCheckCircle, 
  FiInfo, 
  FiXCircle 
} from 'react-icons/fi';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';
import { supabase } from '../../lib/supabaseClient';

const SVXUnifiedEnterprise = () => {
  // --- ESTADOS DE AUDITORÍA (CSV) ---
  const [data, setData] = useState([]); 
  const [masterDataRows, setMasterDataRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null); 
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  // --- ESTADOS DE CONFIGURADOR (XML/PIM) ---
  const [xmlDoc, setXmlDoc] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState("");
  const [loadingXML, setLoadingXML] = useState(true);
  const [selectedConfigs, setSelectedConfigs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const dropdownRef = useRef(null);

  // ============================
  // 1. CARGA INICIAL DE CATÁLOGO XML
  // ============================
  useEffect(() => {
    const fetchXML = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setLoadingXML(false);

        const { data, error } = await supabase
          .from('ClientsSERVEX_WBT')
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
      } catch (err) { console.error("Error XML:", err); }
      finally { setLoadingXML(false); }
    };
    fetchXML();
  }, []);

  // ============================
  // 2. LÓGICA DE AUDITORÍA CSV
  // ============================
  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
  };

  const processCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return;
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const matrix = lines.map(line => line.split(delimiter).map(cell => cell.trim()));
    setData(matrix);
    setMatchStatus(null);
    setMasterDataRows([]);
    showAlert("File CSV cargado", "success");
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => processCSV(ev.target.result);
      reader.readAsText(file);
    }
  }, []);

  const handleAnalyze = async () => {
    if (data.length === 0) return;
    setIsAnalyzing(true);
    try {
      const { data: dbRows, error } = await supabase
        .from('ClientsSERVEX')
        .select('csv_raw').not('csv_raw', 'is', null).limit(1);

      if (error || !dbRows[0]) throw new Error("No master data");

      const dbLines = dbRows[0].csv_raw.split(/\r?\n/).filter(l => l.trim() !== "");
      const dbDelimiter = dbLines[0].includes(';') ? ';' : ',';
      const dbMatrix = dbLines.map(line => line.split(dbDelimiter).map(c => c.trim()));

      const headerIndex = data.findIndex(row => 
        row.join('').toUpperCase().includes('ID') || 
        row.join('').toUpperCase().includes('PRODUCT') || 
        row.join('').toUpperCase().includes('SKU')
      );
      const header = data[headerIndex] || data[0];
      
      const skuColIndex = header.findIndex(h => 
        h.toUpperCase() === 'SKU' || 
        h.toUpperCase() === 'ID' || 
        h.toUpperCase() === 'PRODUCT'
      );

      const auditResults = data.slice(headerIndex + 1).map((row, idx) => {
        const mRow = dbMatrix[headerIndex + 1 + idx] || [];
        const isDifferent = JSON.stringify(row) !== JSON.stringify(mRow);
        return { row, mRow, isDifferent };
      });

      const discrepancies = auditResults.filter(item => item.isDifferent);

      if (discrepancies.length === 0) {
        setMatchStatus('match');
        showAlert("Integridad Total Confirmada", "success");
      } else {
        setMatchStatus('mismatch');
        setMasterDataRows(discrepancies.map(d => d.mRow));
        setData([header, ...discrepancies.map(d => d.row)]);
        
        if (skuColIndex !== -1) {
          discrepancies.forEach(d => {
            const skuToSearch = d.row[skuColIndex];
            if (skuToSearch) handleSearch(skuToSearch, true);
          });
          showAlert(`Detectadas ${discrepancies.length} discrepancias. Sincronizando...`, "warning");
        }
      }
    } catch (err) { showAlert("Error en auditoría", "error"); }
    finally { setIsAnalyzing(false); }
  };

  const handleSearch = (sku, isAuto = false) => {
    if (!xmlDoc || !sku) return;
    setSelectedConfigs(prev => {
        if (prev.find(c => c.sku === sku)) return prev;

        const productNode = [...xmlDoc.getElementsByTagName("Product")].find(
            p => p.getElementsByTagName("Code")[0]?.textContent === sku
        );

        if (!productNode) return prev;

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
            sku,
            name: productNode.querySelector("Description")?.textContent || "Modelo",
            basePrice: parseFloat(productNode.querySelector("Price > Value")?.textContent || 0),
            selections: {},
            features: resolvedFeatures
        };

        if (!isAuto) {
            setExpandedIndex(0);
            setShowDropdown(false);
            setSelectedSKU("");
        }
        return [newConfig, ...prev];
    });
  };

  const calculateProductTotal = (config) => {
    const selectionsTotal = Object.values(config.selections).reduce((a, b) => a + b.price, 0);
    return config.basePrice + selectionsTotal;
  };

  if (loadingXML) return <div className="h-screen flex items-center justify-center bg-[#FDFDFD] text-[10px] font-bold text-[#464775]">LOADING SVX ECOSYSTEM...</div>;

  return (
    // AJUSTE: h-screen y w-screen con overflow-hidden
    <div className="flex flex-col lg:flex-row h-screen w-[100%] bg-[#FDFDFD] font-sans text-[#242424] overflow-hidden">
      
      <AnimatePresence>
        {alert.show && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border bg-white border-[#EDEBE9] min-w-[300px]">
            <div className={`p-2 rounded-md text-white ${alert.type === 'success' ? 'bg-[#237B4B]' : alert.type === 'error' ? 'bg-[#A4262C]' : 'bg-[#D83B01]'}`}>
              {alert.type === 'success' ? <FiCheckCircle /> : <FiAlertTriangle />}
            </div>
            <p className="text-[11px] font-bold flex-grow">{alert.message}</p>
            <button onClick={() => setAlert({ ...alert, show: false })}><FiX /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECCIÓN CSV (65%) */}
      <div className="flex-[0.65] flex flex-col border-r border-[#EDEBE9] overflow-hidden h-full">
        <div className="p-4 border-b bg-[#FAF9F8] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-[#464775] p-1.5 rounded text-white"><FiCpu size={14}/></div>
            <h2 className="text-xs font-black uppercase tracking-widest text-[#464775]">Master Audit</h2>
          </div>
          <div className="flex gap-4">
            <Step icon={<FiCheck size={10}/>} title="Data" active={data.length > 0} />
            <Step icon={<FiZap size={10}/>} title="Delta" active={matchStatus} isLast />
          </div>
        </div>

        <div className="flex-grow p-4 overflow-hidden flex flex-col min-h-0">
          {data.length === 0 ? (
            <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
              className={`flex-grow border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${isDragging ? "bg-[#F3F2F1] border-[#464775]" : "bg-[#FAF9F8] border-[#EDEBE9]"}`}>
              <FiUploadCloud size={40} className="text-[#464775] mb-4 opacity-20" />
              <p className="text-xs font-bold text-gray-400">DRAG CSV TO COMPARE</p>
            </div>
          ) : (
            // AJUSTE: w-full y overflow-auto para scroll de tabla
            <div className="flex-grow overflow-auto border rounded-lg bg-white w-full">
              <table className="min-w-full text-[10px]">
                <thead className="bg-[#FAF9F8] sticky top-0 z-10 border-b">
                  <tr>
                    {data[0].map((h, i) => (
                      <th key={i} className="p-3 text-left font-black text-[#464775] uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(1).map((row, ri) => (
                    <tr key={ri} className="border-b hover:bg-gray-50 transition-colors">
                      {row.map((cell, ci) => {
                        const mCell = masterDataRows[ri] ? masterDataRows[ri][ci] : null;
                        const isDiff = mCell !== null && cell !== mCell;
                        return (
                          <td key={ci} className={`p-3 border-r border-[#F3F2F1] whitespace-nowrap ${isDiff ? 'bg-orange-50/50' : ''}`}>
                            {isDiff ? (
                              <div className="flex flex-col">
                                <span className="text-red-400 line-through text-[8px] opacity-70">{mCell || '(vacío)'}</span>
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
          )}
        </div>

        <div className="p-4 border-t bg-white flex justify-end gap-3 shrink-0">
          <button onClick={() => { setData([]); setMatchStatus(null); setSelectedConfigs([]); }} 
            className="px-4 py-2 text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase">Reset</button>
          <button onClick={handleAnalyze} disabled={data.length === 0 || isAnalyzing}
            className={`px-6 py-2 rounded-md text-[10px] font-black flex items-center gap-2 transition-all shadow-lg ${data.length > 0 ? 'bg-[#464775] text-white hover:brightness-110' : 'bg-gray-100 text-gray-300'}`}>
            {isAnalyzing ? "AUDITANDO..." : "EJECUTAR SINCRONIZACIÓN"} <FiZap size={12}/>
          </button>
        </div>
      </div>

      {/* SECCIÓN XML (35%) */}
      {/* AJUSTE: h-full y overflow-hidden para scroll interno de productos */}
      <div className="flex-[0.35] h-full bg-[#F9F9F9] flex flex-col shadow-2xl border-l border-[#EDEBE9] overflow-hidden">
        <div className="p-4 bg-white border-b shrink-0" ref={dropdownRef}>
          <div className="relative">
            <div className="flex items-center bg-[#F3F2F1] rounded px-3 border-b-2 border-transparent focus-within:border-[#464775] transition-all">
              <FiSearch className="text-gray-400" size={14}/>
              <input type="text" placeholder="AÑADIR SKU..." className="w-full p-2.5 bg-transparent outline-none text-[11px] font-bold uppercase"
                value={selectedSKU} onChange={(e) => { setSelectedSKU(e.target.value.toUpperCase()); setShowDropdown(true); }} />
            </div>
            {showDropdown && selectedSKU && (
              <div className="absolute w-full mt-1 bg-white shadow-2xl rounded border z-50 max-h-60 overflow-auto border-[#EDEBE9]">
                {products.filter(p => p.includes(selectedSKU)).slice(0, 8).map(p => (
                  <div key={p} onClick={() => handleSearch(p)} className="p-3 hover:bg-[#F3F2F1] cursor-pointer text-[10px] font-black border-b last:border-none text-[#464775]">
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-3 space-y-3">
          {selectedConfigs.length > 0 ? (
            selectedConfigs.map((config, pIdx) => (
              <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={pIdx} className="bg-white border border-[#EDEBE9] rounded-lg shadow-sm overflow-hidden">
                <div onClick={() => setExpandedIndex(expandedIndex === pIdx ? null : pIdx)}
                  className={`p-3 flex justify-between items-center cursor-pointer transition-colors ${expandedIndex === pIdx ? 'bg-[#464775] text-white' : 'hover:bg-gray-50'}`}>
                  <div>
                    <p className="text-[10px] font-black leading-none">{config.sku}</p>
                    <p className={`text-[9px] mt-1 font-bold ${expandedIndex === pIdx ? 'text-white/70' : 'text-[#464775]'}`}>
                      ${calculateProductTotal(config).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedConfigs(prev => prev.filter((_, i) => i !== pIdx)); }} className="p-1 hover:bg-black/10 rounded"><FiX size={12}/></button>
                  </div>
                </div>
                {expandedIndex === pIdx && (
                  <div className="p-3 space-y-4 border-t border-[#EDEBE9] bg-white">
                    {config.features.map(feat => (
                      <div key={feat.id} className="space-y-1">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{feat.name}</span>
                        <div className="grid gap-1">
                          {feat.options.map((opt, i) => (
                            <button key={i} onClick={() => {
                              const nc = [...selectedConfigs];
                              nc[pIdx].selections[feat.id] = opt;
                              setSelectedConfigs(nc);
                            }} className={`p-2.5 text-left text-[9px] rounded border transition-all flex justify-between items-center ${config.selections[feat.id]?.code === opt.code ? 'border-[#464775] bg-[#F3F2F1] font-bold shadow-sm' : 'border-[#F0F0F0] hover:bg-gray-50'}`}>
                              <span className="pr-2">{opt.desc}</span>
                              <span className="text-[#464775] font-black">+$ {opt.price}</span>
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
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-10">
              <FiShield size={40} className="mb-4 text-[#464775]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#464775]">Empty PIM Panel</p>
              <p className="text-[9px] mt-2 font-medium">CSV discrepancies will appear here to be re-configured.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Step = ({ icon, title, active, isLast }) => (
  <div className="flex items-center gap-2">
    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${active ? 'bg-[#464775] border-[#464775] text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'text-[#464775]' : 'text-gray-300'}`}>{title}</span>
    {!isLast && <div className="w-4 h-[1px] bg-gray-200" />}
  </div>
);

export default SVXUnifiedEnterprise;