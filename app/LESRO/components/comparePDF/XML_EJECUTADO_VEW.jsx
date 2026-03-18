import React, { useMemo, useState } from 'react';
import { FiPackage, FiLayers, FiCheckCircle, FiChevronDown, FiChevronRight, FiDollarSign, FiSettings } from 'react-icons/fi';

const OFDAxmlVisualizer = ({ xmlString }) => {
  const [expandedProduct, setExpandedProduct] = useState(null);

  const catalogData = useMemo(() => {
    if (!xmlString) return null;
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      
      // 1. Mapeo global de Features (Igual que feature_map en tu Python)
      const allFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const productNodes = Array.from(xmlDoc.getElementsByTagName("Product"));

      return productNodes.map((prod, idx) => {
        const sku = prod.getElementsByTagName("Code")[0]?.textContent || "N/A";
        const description = prod.getElementsByTagName("Description")[0]?.textContent || "No Description";
        const basePriceNode = prod.querySelector("Price > Value");
        const basePrice = parseFloat(basePriceNode?.textContent || "0");

        // 2. Vincular Features que pertenecen a este SKU (Lógica: if sku in f_code)
        const relatedFeatures = allFeatures.filter(f => {
          const fCode = f.getElementsByTagName("Code")[0]?.textContent || "";
          return fCode.includes(sku);
        });

        // 3. Procesar Opciones (Grados vs Opcionales)
        const processedFeatures = relatedFeatures.map(f => {
          const fName = f.getElementsByTagName("Code")[0]?.textContent || "Feature";
          const optionNodes = Array.from(f.getElementsByTagName("Option"));

          const options = optionNodes.map(opt => {
            const optCode = opt.getElementsByTagName("Code")[0]?.textContent || "";
            const upchargeNode = opt.querySelector("OptionPrice > Value");
            const upcharge = parseFloat(upchargeNode?.textContent || "0");
            const optDesc = opt.getElementsByTagName("Description")[0]?.textContent || "";

            // Identificar si es Grado de tela (GRD) o Opcional
            const isGrade = optCode.toUpperCase().includes("GRD");

            return {
              code: optCode,
              upcharge: upcharge,
              total: basePrice + upcharge,
              desc: optDesc,
              isGrade
            };
          });

          return { name: fName, options };
        });

        return { 
          id: idx, 
          sku, 
          description, 
          basePrice, 
          features: processedFeatures 
        };
      });
    } catch (err) {
      console.error("Error parsing OFDAxml:", err);
      return [];
    }
  }, [xmlString]);

  if (!catalogData) return <div className="p-10 text-center opacity-50 font-mono text-xs">INITIALIZING SVX_AUDIT_ENGINE...</div>;

  return (
    <div className="flex flex-col h-full bg-[#F4F5F7] overflow-hidden font-sans">
      {/* Header Estilo Dashboard Técnico */}
      <div className="bg-[#1E1E2E] border-b border-[#313244] p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-1.5 rounded text-white"><FiPackage size={16}/></div>
          <div>
            <h1 className="text-white text-xs font-black tracking-tighter uppercase">SVX Copilot: PIM Visualizer</h1>
            <p className="text-[9px] text-gray-400 font-mono">Status: Connected to Supabase Master</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-right">
            <p className="text-[9px] text-gray-400 uppercase font-bold">Total SKUs</p>
            <p className="text-white text-xs font-black font-mono">{catalogData.length}</p>
          </div>
        </div>
      </div>

      {/* Lista de Productos Auditados */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {catalogData.map((product) => (
          <div key={product.id} className="bg-white border border-[#E0E0E0] rounded-lg shadow-sm overflow-hidden transition-all hover:border-blue-300">
            {/* Fila Principal */}
            <div 
              onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className={expandedProduct === product.id ? "text-blue-600" : "text-gray-300"}>
                  {expandedProduct === product.id ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-black text-[#1E1E2E]">{product.sku}</span>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold font-mono">
                      Base: ${product.basePrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 font-medium">{product.description}</p>
                </div>
              </div>
              <div className="text-[9px] font-black text-gray-400 border px-3 py-1 rounded-full bg-gray-50 uppercase tracking-widest">
                {product.features.length} Features Linked
              </div>
            </div>

            {/* Panel de Relaciones (Features y Upcharges) */}
            {expandedProduct === product.id && (
              <div className="bg-[#F8F9FB] border-t border-[#EEE] p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                {product.features.map((feat, fIdx) => (
                  <div key={fIdx} className="bg-white border border-[#E0E0E0] rounded shadow-sm">
                    <div className="flex justify-between items-center bg-[#F1F3F9] p-2 border-b">
                      <span className="text-[9px] font-black text-[#464775] flex items-center gap-2">
                        <FiLayers size={12}/> {feat.name}
                      </span>
                    </div>
                    <div className="p-1 max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[8px] text-gray-400 uppercase border-b">
                            <th className="p-2">Code / Option</th>
                            <th className="p-2 text-right">Upcharge</th>
                            <th className="p-2 text-right">Total PIM</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {feat.options.map((opt, oIdx) => (
                            <tr key={oIdx} className="hover:bg-blue-50 transition-colors group">
                              <td className="p-2">
                                <div className="flex flex-col">
                                  <span className={`text-[10px] font-bold ${opt.isGrade ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {opt.code}
                                  </span>
                                  <span className="text-[9px] text-gray-400 truncate max-w-[150px]">{opt.desc}</span>
                                </div>
                              </td>
                              <td className="p-2 text-right text-[10px] font-mono text-gray-500">
                                +${opt.upcharge.toFixed(2)}
                              </td>
                              <td className="p-2 text-right">
                                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded">
                                  ${opt.total.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                {product.features.length === 0 && (
                  <div className="col-span-2 py-10 text-center text-gray-400 text-[10px] italic border-2 border-dashed rounded-lg">
                    No features matched for this SKU in the current XML fragment.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OFDAxmlVisualizer;