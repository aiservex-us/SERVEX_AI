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
  Layout 
} from 'lucide-react';

const LesroPricingMaster = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const headers = [
    "SKU", "Product Name", "Product Line", "Base Price",
    "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10",
    "Poly Arm", "Solid Arm", "Casters", "Tablet", "Chrome", "Power"
  ];

  const processXML = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // 2. Consultar el campo correcto: xml_updated_raw
      const { data, error } = await supabase
        .from('ClientsSERVEX')
        .select('xml_updated_raw')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (!data?.xml_updated_raw) {
        console.warn("No XML data found in xml_updated_raw");
        setProducts([]);
        return;
      }

      // 3. Parsear el XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.xml_updated_raw, "text/xml");
      
      // 4. Indexar Features para alto rendimiento (O(1) lookup)
      const allFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const featuresMap = new Map();
      allFeatures.forEach(f => {
        const code = f.querySelector("Code")?.textContent || "";
        featuresMap.set(code, f);
      });

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
          opts: { poly: 0, solid: 0, casters: 0, tablet: 0, chrome: 0, power: 0 }
        };

        // 5. Procesar Grados (UPH-AVERAGE-SKU)
        const gradeFeature = featuresMap.get(`UPH-AVERAGE-${sku}`);
        if (gradeFeature) {
          const options = Array.from(gradeFeature.getElementsByTagName("Option"));
          options.forEach(opt => {
            const code = opt.querySelector("Code")?.textContent || "";
            const val = parseInt(opt.querySelector("Value")?.textContent || "0");
            if (code.startsWith("GRD")) {
              const num = code.replace("GRD", "").padStart(2, "0");
              row.grades[`G${num}`] = basePrice + val;
            }
          });
        }

        // 6. Procesar Opciones adicionales (Iteración filtrada por rendimiento)
        // Buscamos features que terminen en -SKU
        allFeatures.forEach(f => {
          const fCode = f.querySelector("Code")?.textContent || "";
          if (fCode.endsWith(`-${sku}`) && !fCode.includes("UPH-AVERAGE")) {
            const lowerFCode = fCode.toLowerCase();
            const options = Array.from(f.getElementsByTagName("Option"));
            
            options.forEach(opt => {
              const optCode = opt.querySelector("Code")?.textContent?.toUpperCase() || "";
              const val = parseInt(opt.querySelector("Value")?.textContent || "0");
              
              if (["AXX", "NONE", "STANDARD", "PXX"].some(x => optCode.includes(x))) return;
              if (val <= 0) return;

              if (lowerFCode.includes("armpad")) {
                if (optCode.includes("APU")) row.opts.poly = val;
                if (optCode.includes("SS")) row.opts.solid = val;
              }
              if (lowerFCode.includes("caster")) row.opts.casters = val;
              if (lowerFCode.includes("tablet")) row.opts.tablet = val;
              if (lowerFCode.includes("chrome")) row.opts.chrome = val;
              if (lowerFCode.includes("power")) row.opts.power = val;
            });
          }
        });

        extracted.push(row);
      }
      setProducts(extracted);
    } catch (err) {
      console.error("Master Pricing Error:", err.message);
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
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white p-6">
      <RefreshCw className="animate-spin text-[#5B5FC7] mb-4" size={40} />
      <span className="text-sm font-semibold text-[#242424]">Sincronizando Base de Datos XML...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-white font-sans text-[#242424] overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="bg-white px-6 py-4 border-b border-[#EDEBE9] shadow-sm z-20 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#5B5FC7] p-2.5 rounded-xl shadow-lg">
              <Database size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-[#242424]">
                  LESRO Pricing Master
                </h1>
                <span className="text-[10px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-2.5 py-0.5 rounded-full uppercase">
                  Live Matrix
                </span>
              </div>
              <p className="text-xs text-[#616161] font-medium">
                Engine de Inteligencia de Precios para Servex US
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {[
              { label: "Total SKUs", value: stats.total },
              { label: "Avg Price", value: `$${stats.avgPrice}` }
            ].map((s, i) => (
              <div key={i} className="bg-[#F3F2F1] px-4 py-2 rounded-lg border border-[#EDEBE9]">
                <p className="text-[9px] uppercase font-bold text-[#616161] mb-0.5">{s.label}</p>
                <p className="text-sm font-black text-[#242424]">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white px-6 py-3 flex items-center justify-between gap-4 border-b border-[#EDEBE9] shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={14} />
          <input 
            type="text"
            placeholder="Buscar por SKU o Nombre de Producto..."
            className="w-full pl-10 pr-4 py-2 bg-[#F3F2F1] border-none focus:ring-2 focus:ring-[#5B5FC7] focus:bg-white transition-all outline-none text-xs rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          onClick={processXML} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D1D1D1] hover:bg-[#F3F2F1] rounded-lg text-xs font-bold text-[#242424] transition-all active:scale-95"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar Datos
        </button>
      </div>

      {/* TABLE AREA */}
      <div className="flex-1 overflow-hidden m-4 border border-[#EDEBE9] rounded-xl shadow-inner bg-[#FAF9F8]">
        {filtered.length > 0 ? (
          <div className="h-full overflow-auto custom-scrollbar">
            <table className="w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="px-4 py-3 text-left font-bold text-[#242424] sticky top-0 bg-[#FAF9F8] z-30 border-b border-r border-[#EDEBE9] whitespace-nowrap">
                      <div className="flex items-center gap-2 uppercase tracking-tighter text-[10px]">
                        {header}
                        <Filter size={10} className="text-[#5B5FC7] opacity-30" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#EDEBE9]">
                {filtered.map((p, idx) => (
                  <motion.tr 
                    key={p.sku} 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    className="hover:bg-[#F5F5F7] transition-colors group"
                  >
                    <td className="px-4 py-2.5 font-bold text-[#5B5FC7] border-r border-[#EDEBE9] sticky left-0 bg-white group-hover:bg-[#F5F5F7] z-20 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">{p.sku}</td>
                    <td className="px-4 py-2.5 text-[#242424] border-r border-[#EDEBE9] font-semibold whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-2.5 text-[#616161] border-r border-[#EDEBE9] text-[10px]">{p.line}</td>
                    <td className="px-4 py-2.5 font-black text-[#242424] border-r border-[#EDEBE9] bg-[#F9F9F9] group-hover:bg-[#F0F0F0]">${p.basePrice}</td>

                    {/* GRADES RENDERING */}
                    {["G02","G03","G04","G05","G06","G07","G08","G09","G10"].map(g => (
                      <td key={g} className="px-4 py-2.5 text-[#424242] border-r border-[#EDEBE9] text-center font-medium">
                        {p.grades[g] ? <span className="text-[#242424]">${p.grades[g]}</span> : <span className="text-[#D1D1D1]">—</span>}
                      </td>
                    ))}

                    {/* OPTIONS RENDERING */}
                    {Object.values(p.opts).map((v, i) => (
                      <td key={i} className="px-4 py-2.5 text-center border-r border-[#EDEBE9] last:border-r-0">
                        {v ? <span className="text-[#2D884D] font-bold text-[10px]">+${v}</span> : <span className="text-[#D1D1D1]">—</span>}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="bg-[#F3F2F1] p-6 rounded-full mb-4">
               <TableIcon size={48} className="text-[#D1D1D1]" />
            </div>
            <h3 className="text-lg font-bold text-[#242424]">No se encontraron resultados</h3>
            <p className="text-sm text-[#616161]">Prueba con otro SKU o término de búsqueda</p>
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      <div className="px-6 py-2.5 bg-white border-t border-[#EDEBE9] flex justify-between items-center text-[10px] font-bold text-[#616161] shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#2D884D]"></div>
            Visto: {filtered.length} productos
          </span>
          <span className="text-[#D1D1D1]">|</span>
          <span>Database: ClientsSERVEX</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#5B5FC7] text-white px-2 py-0.5 rounded text-[9px]">ENGINE V2.0</span>
          <span className="uppercase tracking-widest opacity-60">Architect & Engineering Edition</span>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; height: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D1D1; border-radius: 20px; border: 3px solid #FAF9F8; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #5B5FC7; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #FAF9F8; }
        
        table { border-collapse: separate; width: max-content !important; }
      `}</style>
    </div>
  );
};

export default LesroPricingMaster;