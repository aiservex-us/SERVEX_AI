'use client';
import { useState, useEffect, useRef } from "react";
import UploadFileCmpare from "./comparePDF/UploadFileCmpare";

export default function PriceProduct2() {
  const [xmlDoc, setXmlDoc] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedSKU, setSelectedSKU] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedConfigs, setSelectedConfigs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch('/LES-012626.xml')
      .then(res => res.text())
      .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/xml");
        setXmlDoc(doc);
        const codes = [...doc.getElementsByTagName("Product")].map(p => 
          p.getElementsByTagName("Code")[0]?.textContent
        ).filter(Boolean);
        setProducts(codes);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando catálogo:", err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (sku) => {
    if (!xmlDoc || !sku) return;
    if (selectedConfigs.find(c => c.sku === sku)) {
      setShowDropdown(false);
      return;
    }

    const productNode = [...xmlDoc.getElementsByTagName("Product")].find(
      p => p.getElementsByTagName("Code")[0]?.textContent === sku
    );

    if (!productNode) return;

    const featureNodes = [...productNode.getElementsByTagName("Feature")];
    const featureRefs = [...productNode.getElementsByTagName("FeatureRef")];
    const allFeatures = [...featureNodes.map(f => ({ node: f, type: 'direct' })), 
                         ...featureRefs.map(r => ({ code: r.textContent.trim(), type: 'ref' }))];

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

      if (options.length === 0) return null;
      return { id: fCode, name: fName, options };
    }).filter(Boolean);

    const newConfig = {
      sku: sku,
      name: productNode.querySelector("Description")?.textContent || "Modelo Seleccionado",
      basePrice: parseFloat(productNode.querySelector("Price > Value")?.textContent || 0),
      selections: {},
      features: resolvedFeatures
    };

    setSelectedConfigs(prev => [newConfig, ...prev]);
    setExpandedIndex(0);
    setShowDropdown(false);
    setSelectedSKU("");
  };

  const handleOptionSelect = (productIndex, featureId, option) => {
    const newConfigs = [...selectedConfigs];
    newConfigs[productIndex].selections[featureId] = option;
    setSelectedConfigs(newConfigs);
  };

  const calculateProductTotal = (config) => {
    const selectionsTotal = Object.values(config.selections).reduce((a, b) => a + b.price, 0);
    return config.basePrice + selectionsTotal;
  };

  const removeProduct = (index) => {
    setSelectedConfigs(prev => prev.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F5F5F5] font-['Segoe_UI'] text-[#464775]">
      <div className="animate-spin mr-2">●</div> Cargando Entorno ServeX...
    </div>
  );

  return (
    <div className="flex h-[100%] w-full bg-[#FFF] font-['Segoe_UI',-apple-system,sans-serif] overflow-hidden">
      
      {/* SECCIÓN IZQUIERDA (65%) */}
      <section className="w-[65%] h-[100%] border-r border-[#D1D1D1] bg-white flex flex-col">
        <div className="h-2/3 w-full overflow-auto border-b border-[#D1D1D1]">
          <UploadFileCmpare />
        </div>
        <div className="h-1/3 w-full overflow-auto bg-white">
          <div className="p-4 text-xs text-gray-400 font-bold uppercase tracking-widest">Panel de Análisis Secundario</div>
        </div>
      </section>

      {/* SECCIÓN DERECHA XML (35%) */}
      <section className="w-[35%] h-full flex flex-col bg-[#F9F9F9] shadow-inner">
        
        {/* Buscador PIM */}
        <div className="p-4 bg-white border-b border-[#E1E1E1]" ref={dropdownRef}>
          <div className="relative">
            <div className="flex items-center bg-[#FFF] rounded border-b-2 border-[#464775]/20 focus-within:border-[#464775] px-3 shadow-sm transition-all">
              <span className="text-xs opacity-50 mr-2">🔍</span>
              <input 
                type="text"
                className="w-full py-2 bg-transparent outline-none text-xs font-semibold"
                placeholder="Añadir producto por SKU..."
                value={selectedSKU}
                onChange={(e) => {
                  setSelectedSKU(e.target.value.toUpperCase());
                  setShowDropdown(true);
                }}
              />
            </div>
            {showDropdown && selectedSKU && (
              <div className="absolute w-full bg-white shadow-2xl rounded-b border border-[#E1E1E1] z-50 max-h-40 overflow-auto">
                {products.filter(p => p.includes(selectedSKU)).slice(0, 10).map(p => (
                  <div key={p} onClick={() => handleSearch(p)} 
                    className="px-4 py-2 hover:bg-[#F5F5F5] cursor-pointer text-[11px] font-bold border-b last:border-none text-[#242424]">
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contenido Dinámico */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {selectedConfigs.length > 0 ? (
            selectedConfigs.map((config, pIdx) => (
              <div key={`${config.sku}-${pIdx}`} className="bg-white border border-[#E1E1E1] rounded shadow-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div 
                  className={`p-3 flex justify-between items-center cursor-pointer transition-all ${expandedIndex === pIdx ? 'bg-[#464775] text-white shadow-lg' : 'bg-white text-[#242424] hover:bg-[#F3F2F1]'}`}
                  onClick={() => setExpandedIndex(expandedIndex === pIdx ? null : pIdx)}
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black leading-none tracking-tight">{config.sku}</span>
                    <span className={`text-[9px] mt-1 ${expandedIndex === pIdx ? 'text-white/80' : 'text-[#464775] font-bold'}`}>
                      ${calculateProductTotal(config).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                       onClick={(e) => { e.stopPropagation(); removeProduct(pIdx); }}
                       className={`text-[10px] p-1 rounded-full transition-colors ${expandedIndex === pIdx ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-200 text-gray-400'}`}
                    >✕</button>
                    <span className="text-[8px] opacity-50">{expandedIndex === pIdx ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expandedIndex === pIdx && (
                  <div className="p-3 space-y-4 bg-white border-t border-[#E1E1E1]">
                    {config.features.map((feat) => (
                      <div key={feat.id} className="space-y-1">
                        <span className="text-[9px] font-black text-[#616161] uppercase tracking-tighter block mb-1">{feat.name}</span>
                        <div className="space-y-1">
                          {feat.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleOptionSelect(pIdx, feat.id, opt)}
                              className={`w-full p-2.5 rounded flex justify-between items-center text-[10px] border transition-all ${
                                config.selections[feat.id]?.code === opt.code 
                                ? "bg-[#F3F2F1] border-[#464775] font-bold shadow-sm" 
                                : "bg-white border-[#EDEBE9] hover:bg-[#F3F2F1]"
                              }`}
                            >
                              <span className="text-left leading-tight pr-4">{opt.desc}</span>
                              <span className="text-[#464775] font-bold whitespace-nowrap">+$ {opt.price}</span>
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
            /* BANNER PUBLICITARIO - FONDO BLANCO, DETALLES MORADOS (#464775) */
            <div className="h-full flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
              <div className="w-full bg-white border border-[#464775]/20 rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group flex flex-col items-center text-center">
                
                {/* Decoración de fondo */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#464775]/5 rounded-full blur-3xl group-hover:bg-[#464775]/10 transition-all"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  {/* LOGO CENTRADO Y GRANDE */}
                  <div className="w-32 h-32 mb-6 drop-shadow-sm transition-transform duration-500 group-hover:scale-105">
                    <img 
                      src="/logo.png" 
                      alt="ServeX Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <h3 className="text-[#464775] font-black text-base leading-tight mb-3 tracking-tighter">
                    OPTIMIZA TU COTIZACIÓN CON PIM ENGINE
                  </h3>
                  
                  <p className="text-[#616161] text-[11px] leading-relaxed mb-6 font-medium max-w-[240px]">
                    Compara múltiples configuraciones de productos en tiempo real. Selecciona un SKU en el buscador superior para desbloquear las opciones.
                  </p>
                  
                  <div className="flex items-center gap-3 bg-[#464775]/5 px-4 py-1.5 rounded-full border border-[#464775]/10">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    <span className="text-[10px] text-[#464775] font-black uppercase tracking-widest">Sincronización Activa</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 opacity-40">
                <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">
                  ServeX Ecosystem
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Resumen Global */}
        {selectedConfigs.length > 0 && (
          <div className="bg-white border-t border-[#E1E1E1] p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center px-1">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-[#616161] uppercase">Productos en lista</span>
                <span className="text-xs font-bold text-[#464775]">{selectedConfigs.length} Seleccionados</span>
              </div>
              <button 
                className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                onClick={() => setSelectedConfigs([])}
              >
                LIMPIAR LISTA
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}