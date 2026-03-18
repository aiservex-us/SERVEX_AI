import React, { useMemo, useState } from 'react';
import { FiPackage, FiLayers, FiTag, FiChevronDown, FiChevronRight, FiDollarSign } from 'react-icons/fi';

const OFDAxmlVisualizer = ({ xmlString }) => {
  const [expandedProduct, setExpandedProduct] = useState(null);

  const catalogData = useMemo(() => {
    if (!xmlString) return null;
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const productNodes = Array.from(xmlDoc.getElementsByTagName("Product"));

      return productNodes.map((prod, idx) => {
        const code = prod.getElementsByTagName("Code")[0]?.textContent || "N/A";
        const description = prod.getElementsByTagName("Description")[0]?.textContent || "No Description";
        
        // Extraer Features y sus Options (Grados de tela, acabados)
        const featureNodes = Array.from(prod.getElementsByTagName("Feature"));
        const features = featureNodes.map(feat => {
          const featName = feat.getElementsByTagName("Code")[0]?.textContent || "Feature";
          const optionNodes = Array.from(feat.getElementsByTagName("Option"));
          
          const options = optionNodes.map(opt => ({
            code: opt.getElementsByTagName("Code")[0]?.textContent || "N/A",
            price: opt.getElementsByTagName("Value")[0]?.textContent || "0.00",
            desc: opt.getElementsByTagName("Description")[0]?.textContent || ""
          }));

          return { name: featName, options };
        });

        return { id: idx, code, description, features };
      });
    } catch (err) {
      console.error("Error parsing OFDAxml:", err);
      return [];
    }
  }, [xmlString]);

  if (!catalogData) return <div className="p-10 text-center opacity-50">Waiting for LESRO XML Stream...</div>;

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-hidden">
      {/* Header del Visualizador */}
      <div className="bg-white border-b border-[#EDEBE9] p-3 flex justify-between items-center shadow-sm">
        <span className="text-[10px] font-black text-[#464775] uppercase tracking-widest flex items-center gap-2">
          <FiPackage /> Total Products: {catalogData.length}
        </span>
        <span className="text-[9px] bg-[#464775] text-white px-2 py-0.5 rounded-full font-bold">
          OFDAxml Standard 01.04.00
        </span>
      </div>

      {/* Lista de Productos */}
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        {catalogData.map((product) => (
          <div key={product.id} className="bg-white border border-[#EDEBE9] rounded shadow-sm overflow-hidden">
            {/* Fila de Producto (Trigger) */}
            <div 
              onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#F3F2F1] transition-all"
            >
              <div className="flex items-center gap-4">
                {expandedProduct === product.id ? <FiChevronDown /> : <FiChevronRight />}
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-[#444791]">{product.code}</span>
                  <span className="text-[10px] text-gray-500 font-medium">{product.description}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-[9px] font-bold text-gray-400 uppercase border border-gray-200 px-2 py-1 rounded">
                  {product.features.length} Features
                </span>
              </div>
            </div>

            {/* Detalles Expandidos (Features & Options) */}
            {expandedProduct === product.id && (
              <div className="bg-[#FAF9F8] border-t border-[#EDEBE9] p-4 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feat, fIdx) => (
                    <div key={fIdx} className="bg-white border border-[#EDEBE9] rounded p-3">
                      <h4 className="text-[10px] font-black text-[#464775] mb-2 flex items-center gap-2 border-b pb-1 uppercase">
                        <FiLayers size={12} /> {feat.name}
                      </h4>
                      <div className="space-y-1 max-h-[200px] overflow-y-auto pr-2">
                        {feat.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex justify-between items-center text-[10px] p-1.5 hover:bg-gray-50 rounded border-b border-gray-50 last:border-0">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-700">{opt.code}</span>
                              <span className="text-[9px] text-gray-400">{opt.desc}</span>
                            </div>
                            <span className="font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                              +${opt.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OFDAxmlVisualizer;