import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, FiCheck, FiZap, FiSearch, FiX, FiAlertCircle, 
  FiFileText, FiLayers, FiSettings, FiChevronRight, FiDatabase,
  FiFilter, FiRefreshCw
} from 'react-icons/fi';
import { supabase } from '../../lib/supabaseClient';

const SVXModernEnterprise = () => {
  // --- Lógica de Estados (Se mantiene idéntica) ---
  const [data, setData] = useState([]); 
  const [masterDataRows, setMasterDataRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null); 
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [xmlDoc, setXmlDoc] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState("");
  const [loadingXML, setLoadingXML] = useState(true);
  const [selectedConfigs, setSelectedConfigs] = useState([]);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [activeConfigIndex, setActiveConfigIndex] = useState(null);

  // --- Efectos y Fetching (Lógica original preservada) ---
  useEffect(() => {
    const fetchXML = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setLoadingXML(false);
        const { data, error } = await supabase.from('ClientsSERVEX').select('xml_raw').eq('user_id', user.id).limit(1).single();
        if (data?.xml_raw) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.xml_raw, "text/xml");
          setXmlDoc(doc);
          setProducts([...doc.getElementsByTagName("Product")].map(p => p.getElementsByTagName("Code")[0]?.textContent).filter(Boolean));
        }
      } catch (err) { console.error(err); }
      finally { setLoadingXML(false); }
    };
    fetchXML();
  }, []);

  const processCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length === 0) return;
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const matrix = lines.map(line => line.split(delimiter).map(cell => cell.trim()));
    setData(matrix);
    setMatchStatus(null);
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
      const { data: dbRows } = await supabase.from('ClientsSERVEX').select('csv_raw').not('csv_raw', 'is', null).limit(1);
      const dbLines = dbRows[0].csv_raw.split(/\r?\n/).filter(l => l.trim() !== "");
      const dbDelimiter = dbLines[0].includes(';') ? ';' : ',';
      const dbMatrix = dbLines.map(line => line.split(dbDelimiter).map(c => c.trim()));

      const headerIndex = data.findIndex(row => row.join('').toUpperCase().includes('SKU'));
      const header = data[headerIndex] || data[0];
      const skuColIndex = header.findIndex(h => h.toUpperCase() === 'SKU' || h.toUpperCase() === 'ID');

      const auditResults = data.slice(headerIndex + 1).map((row, idx) => {
        const mRow = dbMatrix[headerIndex + 1 + idx] || [];
        const isDifferent = JSON.stringify(row) !== JSON.stringify(mRow);
        return { row, mRow, isDifferent };
      });

      const discrepancies = auditResults.filter(item => item.isDifferent);
      if (discrepancies.length === 0) {
        setMatchStatus('match');
      } else {
        setMatchStatus('mismatch');
        setMasterDataRows(discrepancies.map(d => d.mRow));
        setData([header, ...discrepancies.map(d => d.row)]);
        if (skuColIndex !== -1) {
          discrepancies.forEach(d => handleSearch(d.row[skuColIndex], true));
          setShowConfigPanel(true);
        }
      }
    } catch (err) { console.error(err); }
    finally { setIsAnalyzing(false); }
  };

  const handleSearch = (sku, isAuto = false) => {
    if (!xmlDoc || !sku) return;
    const productNode = [...xmlDoc.getElementsByTagName("Product")].find(p => p.getElementsByTagName("Code")[0]?.textContent === sku);
    if (!productNode) return;

    const resolvedFeatures = [...productNode.getElementsByTagName("Feature"), ...productNode.getElementsByTagName("FeatureRef")].map(node => {
        let fDetail = node.tagName === "FeatureRef" 
            ? [...xmlDoc.getElementsByTagName("Feature")].find(f => f.getElementsByTagName("Code")[0]?.textContent === node.textContent.trim())
            : node;
        if (!fDetail) return null;
        const options = [...fDetail.getElementsByTagName("Option")].map(o => ({
            code: o.getElementsByTagName("Code")[0]?.textContent,
            desc: o.querySelector("Description")?.textContent || "Opción",
            price: parseFloat(o.querySelector("OptionPrice > Value")?.textContent || 0)
        })).filter(opt => opt.price > 0);
        return options.length > 0 ? { id: fDetail.getElementsByTagName("Code")[0]?.textContent, name: fDetail.querySelector("Description")?.textContent, options } : null;
    }).filter(Boolean);

    const newConfig = { sku, name: productNode.querySelector("Description")?.textContent, basePrice: parseFloat(productNode.querySelector("Price > Value")?.textContent || 0), selections: {}, features: resolvedFeatures };
    setSelectedConfigs(prev => [newConfig, ...prev.filter(c => c.sku !== sku)]);
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR DE NAVEGACIÓN (ESTILO CRM) */}
      <aside className="w-20 border-r border-slate-200 bg-white flex flex-col items-center py-6 gap-8 shrink-0">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
          <FiLayers size={20} />
        </div>
        <nav className="flex flex-col gap-6">
          <button className="p-3 text-indigo-600 bg-indigo-50 rounded-xl"><FiDatabase size={20}/></button>
          <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"><FiSearch size={20}/></button>
          <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"><FiSettings size={20}/></button>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER SUPERIOR */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-slate-900 tracking-tight">Data Auditor <span className="text-slate-400 font-normal">v2.1</span></h1>
            {fileName && <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{fileName}</span>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.reload()} className="p-2 text-slate-400 hover:text-slate-600"><FiRefreshCw size={18}/></button>
            <button 
              onClick={handleAnalyze}
              disabled={data.length === 0 || isAnalyzing}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm
                ${data.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              {isAnalyzing ? 'Procesando...' : 'Sincronizar Maestro'}
              <FiZap size={14}/>
            </button>
          </div>
        </header>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-grow overflow-y-auto p-8 bg-slate-50/50">
          
          {data.length === 0 ? (
            /* DROPZONE MINIMALISTA */
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
              className={`h-full border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all
                ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-white'}`}
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <FiUploadCloud size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Importar Archivo Maestro</h3>
              <p className="text-slate-500 text-sm mt-1">Arrastra tu archivo CSV aquí para iniciar la auditoría</p>
            </motion.div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-6">
              
              {/* STATUS CARDS */}
              <div className="grid grid-cols-3 gap-6">
                <StatusCard title="Registros Totales" value={data.length - 1} icon={<FiFileText/>} color="blue" />
                <StatusCard 
                    title="Estado de Integridad" 
                    value={matchStatus === 'match' ? 'Limpio' : matchStatus === 'mismatch' ? 'Discrepancia' : 'Pendiente'} 
                    icon={<FiCheck/>} 
                    color={matchStatus === 'match' ? 'green' : matchStatus === 'mismatch' ? 'amber' : 'slate'} 
                />
                <StatusCard title="Conflictos PIM" value={selectedConfigs.length} icon={<FiFilter/>} color="indigo" />
              </div>

              {/* LISTA DE DISCREPANCIAS (EN LUGAR DE TABLA GIGANTE) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Resultados del Análisis</h3>
                  <span className="text-xs font-medium text-slate-400">Mostrando discrepancias detectadas</span>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                      <tr>
                        {data[0].map((h, i) => <th key={i} className="px-6 py-4">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.slice(1).map((row, ri) => (
                        <tr key={ri} className="hover:bg-slate-50/50 transition-colors group">
                          {row.map((cell, ci) => {
                            const mCell = masterDataRows[ri] ? masterDataRows[ri][ci] : null;
                            const isDiff = mCell !== null && cell !== mCell;
                            return (
                              <td key={ci} className="px-6 py-4 text-sm">
                                {isDiff ? (
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-rose-400 line-through mb-1">{mCell}</span>
                                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block w-fit">
                                      {cell}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-600">{cell}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* PANEL LATERAL DE CONFIGURACIÓN (PIM) - SOLO APARECE SI ES NECESARIO */}
      <AnimatePresence>
        {showConfigPanel && (
          <motion.aside 
            initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
            className="w-[400px] bg-white border-l border-slate-200 shadow-2xl flex flex-col shrink-0"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900">Configurador PIM</h2>
                <p className="text-xs text-slate-500">Ajuste de parámetros XML</p>
              </div>
              <button onClick={() => setShowConfigPanel(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <FiX />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {selectedConfigs.map((config, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <div 
                    onClick={() => setActiveConfigIndex(activeConfigIndex === idx ? null : idx)}
                    className="p-4 bg-white cursor-pointer hover:bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-indigo-600">{config.sku}</h4>
                      <p className="text-[11px] text-slate-400">{config.name}</p>
                    </div>
                    <FiChevronRight className={`transition-transform ${activeConfigIndex === idx ? 'rotate-90' : ''}`} />
                  </div>
                  
                  {activeConfigIndex === idx && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
                      {config.features.map(feat => (
                        <div key={feat.id} className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">{feat.name}</label>
                          <div className="grid grid-cols-1 gap-2">
                            {feat.options.map((opt, i) => (
                              <button 
                                key={i}
                                onClick={() => {
                                  const nc = [...selectedConfigs];
                                  nc[idx].selections[feat.id] = opt;
                                  setSelectedConfigs(nc);
                                }}
                                className={`flex justify-between items-center p-3 text-xs rounded-lg border transition-all
                                  ${config.selections[feat.id]?.code === opt.code 
                                    ? 'border-indigo-600 bg-white text-indigo-600 shadow-sm' 
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}
                              >
                                <span>{opt.desc}</span>
                                <span className="font-bold">+${opt.price}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-900 text-white shrink-0">
              <div className="flex justify-between items-end mb-4">
                <span className="text-slate-400 text-xs">Total Estimado</span>
                <span className="text-xl font-bold">
                  ${selectedConfigs.reduce((acc, curr) => {
                    const selections = Object.values(curr.selections).reduce((a, b) => a + b.price, 0);
                    return acc + curr.basePrice + selections;
                  }, 0).toLocaleString()}
                </span>
              </div>
              <button className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                <FiCheckCircle size={18}/> Confirmar Sincronización
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

/* COMPONENTES ATÓMICOS */
const StatusCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100'
  };
  return (
    <div className={`p-5 rounded-2xl border bg-white flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl ${colors[color]} border`}>{icon}</div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{title}</p>
        <p className="text-lg font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
};

const FiCheckCircle = ({size}) => <FiCheck size={size}/>;

export default SVXModernEnterprise;