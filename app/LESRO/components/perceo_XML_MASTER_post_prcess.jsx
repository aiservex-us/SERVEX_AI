'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
  Database, 
  Search, 
  RefreshCw, 
  Table as TableIcon, 
  Filter, 
  Layout,
  Download // Importado para el botón de descarga
} from 'lucide-react';

const LesroPricingMaster = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rawXmlContent, setRawXmlContent] = useState(""); // Estado para guardar el XML crudo

  const headers = [
    "SKU", "Product Name", "Product Line", "Base Price",
    "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10",
    "Poly Arm", "Solid Arm", "Casters", "Tablet", "Chrome", "Power"
  ];

  const downloadXML = () => {
    if (!rawXmlContent) return;
    
    // Generar número aleatorio para el nombre
    const randomNum = Math.floor(Math.random() * 10000);
    const fileName = `LES${randomNum}.XML`;
    
    const blob = new Blob([rawXmlContent], { type: 'text/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const processXML = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { data } = await supabase
        .from('ClientsSERVEX')
        .select('xml_updated_raw')
        .eq('user_id', user?.id)
        .single();

      if (!data?.xml_updated_raw) {
        console.warn("No se encontró contenido en xml_updated_raw");
        setProducts([]);
        return;
      }

      setRawXmlContent(data.xml_updated_raw); // Guardamos el contenido para la descarga

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.xml_updated_raw, "text/xml");
      const features = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));

      const extracted = [];

      for (let p of productsXML) {
        const sku = p.getElementsByTagName("Code")[0]?.textContent || "";
        const name = p.getElementsByTagName("Description")[0]?.textContent || "";
        const line = p.getElementsByTagName("ClassificationRef")[0]?.textContent || "N/A";
        const basePrice = parseInt(p.querySelector("Price Value")?.textContent || "0");

        let row = {
          sku,
          name,
          line,
          basePrice,
          grades: {},
          opts: {
            poly: 0,
            solid: 0,
            casters: 0,
            tablet: 0,
            chrome: 0,
            power: 0
          }
        };

        const gradeFeature = features.find(f => {
          const code = f.querySelector("Code")?.textContent || "";
          return code === `UPH-AVERAGE-${sku}`;
        });

        if (gradeFeature) {
          const options = Array.from(gradeFeature.getElementsByTagName("Option"));
          options.forEach(opt => {
            const code = opt.querySelector("Code")?.textContent || "";
            const val = parseInt(opt.querySelector("Value")?.textContent || "0");
            if (code.startsWith("GRD")) {
              const num = code.replace("GRD", "").padStart(2, "0");
              const key = `G${num}`;
              row.grades[key] = basePrice + val;
            }
          });
        }

        const relatedFeatures = features.filter(f => {
          const code = f.querySelector("Code")?.textContent || "";
          return code.endsWith(`-${sku}`) && !code.includes("UPH-AVERAGE");
        });

        relatedFeatures.forEach(f => {
          const fCode = f.querySelector("Code")?.textContent?.toLowerCase() || "";
          const options = Array.from(f.getElementsByTagName("Option"));
          options.forEach(opt => {
            const optCode = opt.querySelector("Code")?.textContent?.toUpperCase() || "";
            const val = parseInt(opt.querySelector("Value")?.textContent || "0");
            if (["AXX", "NONE", "STANDARD", "PXX"].some(x => optCode.includes(x))) return;
            if (val <= 0) return;
            if (fCode.includes("armpad")) {
              if (optCode.includes("APU")) row.opts.poly = val;
              if (optCode.includes("SS")) row.opts.solid = val;
            }
            if (fCode.includes("caster")) row.opts.casters = val;
            if (fCode.includes("tablet")) row.opts.tablet = val;
            if (fCode.includes("chrome")) row.opts.chrome = val;
            if (fCode.includes("power")) row.opts.power = val;
          });
        });
        extracted.push(row);
      }
      setProducts(extracted);
    } catch (err) {
      console.error("Error al procesar el XML:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    processXML();
  }, []);

  const filtered = useMemo(() => 
    products.filter(p => 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [products, searchTerm]);

  const stats = {
    total: products.length,
    filtered: filtered.length,
    avgPrice: Math.round(
      products.reduce((acc, p) => acc + p.basePrice, 0) / (products.length || 1)
    )
  };

  if (loading) return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#FFF] p-6">
      <RefreshCw className="animate-spin text-[#5B5FC7] mb-4" size={40} />
      <span className="text-sm font-semibold text-[#242424] text-center px-4">Calculando matrices desde versión actualizada...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full max-w-full bg-[#FFF] font-sans text-[#242424] overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-white px-4 md:px-6 py-3 border-b border-[#EDEBE9] shadow-sm z-20 shrink-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-[#5B5FC7] p-2 rounded-lg shadow-md shrink-0">
              <Layout size={20} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base md:text-lg font-extrabold tracking-tight text-[#242424] truncate">
                  LESRO Pricing Master
                </h2>
                <span className="text-[9px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-2 py-0.5 rounded-full uppercase shrink-0">
                  Updated XML
                </span>
              </div>
              <p className="text-[10px] text-[#616161] truncate">
                Intelligence Engine & Automated Quoting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 sm:self-center self-start">
            {[
              { label: "Products", value: stats.total },
              { label: "Avg Base", value: `$${stats.avgPrice}` }
            ].map((s, i) => (
              <div key={i} className="bg-[#F0F0F0] px-3 py-1 rounded-md border border-[#EDEBE9]">
                <p className="text-[8px] uppercase font-bold text-[#616161] leading-none mb-1">{s.label}</p>
                <p className="text-[11px] font-extrabold text-[#242424] leading-none">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white px-4 md:px-6 py-2 flex items-center justify-between gap-3 border-b border-[#EDEBE9] shrink-0 w-full">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={12} />
          <input 
            type="text"
            placeholder="Search SKU or product name..."
            className="w-full pl-9 pr-4 py-1.5 bg-[#F0F0F0] border-transparent border-b-2 focus:border-[#5B5FC7] focus:bg-white transition-all outline-none text-[11px] rounded-t-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Botón de Descarga añadido aquí */}
            <button 
                onClick={downloadXML} 
                className="p-2 hover:bg-[#F0F0F0] rounded-full text-[#2D884D] transition-colors" 
                title="Download XML File"
            >
                <Download size={14} />
            </button>
            <button 
                onClick={processXML} 
                className="p-2 hover:bg-[#F0F0F0] rounded-full text-[#616161] transition-colors" 
                title="Reload from xml_updated_raw"
            >
                <RefreshCw size={14} />
            </button>
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="flex-1 m-2 md:m-3 bg-white rounded-lg shadow-sm border border-[#EDEBE9] flex flex-col overflow-hidden">
        {filtered.length > 0 ? (
          <div className="flex-1 overflow-auto custom-scrollbar w-full">
            <table className="min-w-full border-separate border-spacing-0 text-[10px]">
              <thead>
                <tr className="bg-[#FAF9F8]">
                  {headers.map((header) => (
                    <th key={header} className="px-4 py-2 text-left font-bold text-[#242424] sticky top-0 bg-[#FAF9F8] z-10 whitespace-nowrap border-b border-r border-[#EDEBE9]">
                      <div className="flex items-center gap-1.5 uppercase tracking-wider text-[9px]">
                        {header}
                        <Filter size={8} className="text-[#5B5FC7] opacity-40" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filtered.map((p, idx) => (
                  <motion.tr 
                    key={idx} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group hover:bg-[#F5F5F7] transition-colors"
                  >
                    <td className="px-4 py-2 font-bold text-[#5B5FC7] border-r border-[#F0F0F0]/50 whitespace-nowrap">{p.sku}</td>
                    <td className="px-4 py-2 text-[#242424] border-r border-[#F0F0F0]/50 whitespace-nowrap font-medium">{p.name}</td>
                    <td className="px-4 py-2 text-[#616161] border-r border-[#F0F0F0]/50 whitespace-nowrap">{p.line}</td>
                    <td className="px-4 py-2 font-extrabold text-[#242424] border-r border-[#F0F0F0]/50 bg-[#F9F9F9]/50">${p.basePrice}</td>

                    {["G02","G03","G04","G05","G06","G07","G08","G09","G10"].map(g => (
                      <td key={g} className="px-4 py-2 text-[#424242] border-r border-[#F0F0F0]/50 whitespace-nowrap">
                        {p.grades[g] ? <span className="font-semibold">${p.grades[g]}</span> : <span className="text-[#BDBDBD]">—</span>}
                      </td>
                    ))}

                    {Object.values(p.opts).map((v, i) => (
                      <td key={i} className="px-4 py-2 text-[#424242] border-r border-[#F0F0F0]/50 last:border-none whitespace-nowrap">
                        {v ? <span className="text-[#2D884D] font-bold">+${v}</span> : <span className="text-[#BDBDBD]">—</span>}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-10 px-4 text-center">
            <TableIcon size={32} className="text-[#D1D1D1] mb-2" />
            <p className="text-xs font-semibold text-[#616161]">No products found in the updated XML</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-4 py-2 bg-white border-t border-[#EDEBE9] flex sm:flex-row flex-col justify-between items-center gap-2 text-[9px] font-medium text-[#616161] shrink-0 w-full">
        <div className="flex items-center gap-2 order-2 sm:order-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span>Source: xml_updated_raw | {filtered.length} Results</span>
        </div>
        <div className="bg-[#5B5FC7]/10 px-2 py-0.5 rounded text-[#5B5FC7] font-bold uppercase text-[8px] order-1 sm:order-2 self-end sm:self-center">
          XML Updated Engine
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D1D1; border-radius: 10px; border: 2px solid #FFF; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F5F5F5; }
        
        table { 
          table-layout: auto !important; 
          width: max-content !important; 
        }
      `}</style>
    </div>
  );
};

export default LesroPricingMaster;