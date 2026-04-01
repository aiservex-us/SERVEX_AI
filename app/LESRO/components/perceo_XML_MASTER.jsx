'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

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
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('ClientsSERVEX')
        .select('xml_raw')
        .eq('user_id', user?.id)
        .single();

      if (!data?.xml_raw) return;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.xml_raw, "text/xml");
      
      // 1. Indexar Features (Igual que tu feature_map en Python)
      const features = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const featureMap = features.reduce((acc, f) => {
        const code = f.getElementsByTagName("Code")[0]?.textContent;
        if (code) acc[code] = f;
        return acc;
      }, {});

      const productNodes = xmlDoc.getElementsByTagName("Product");
      const extracted = [];

      for (let i = 0; i < productNodes.length; i++) {
        const p = productNodes[i];
        const sku = p.getElementsByTagName("Code")[0]?.textContent || "";
        const name = p.getElementsByTagName("Description")[0]?.textContent || "";
        const line = p.getElementsByTagName("ClassificationRef")[0]?.textContent || "N/A";
        const basePrice = parseInt(p.getElementsByTagName("Value")[0]?.textContent || "0");

        let row = {
          sku, name, line, basePrice,
          grades: {}, // G02 - G10
          opts: { poly: 0, solid: 0, casters: 0, tablet: 0, chrome: 0, power: 0 }
        };

        // 2. Buscar Features relacionadas al SKU (Lógica: sku in f_code)
        Object.keys(featureMap).forEach(fCode => {
          if (fCode.includes(sku)) {
            const fElem = featureMap[fCode];
            const options = Array.from(fElem.getElementsByTagName("Option"));

            options.forEach(opt => {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent?.toUpperCase() || "";
              const val = parseInt(opt.getElementsByTagName("Value")[0]?.textContent || "0");

              // Lógica de Grados (UPH / GRD)
              if (fCode.includes("UPH") || fCode.includes("GRADE") || optCode.includes("GRD")) {
                const match = optCode.match(/\d+/);
                if (match) {
                  const gNum = `G${match[0].padStart(2, '0')}`;
                  row.grades[gNum] = basePrice + val;
                }
              }

              // Lógica de Opcionales (Omitiendo base AXX, NONE, STANDARD)
              const isBase = ["AXX", "NONE", "STANDARD", "PXX"].some(x => optCode.includes(x));
              if (!isBase && val > 0) {
                const fCodeLower = fCode.toLowerCase();
                if (fCodeLower.includes("armpad") || fCodeLower.includes("poly")) row.opts.poly = val;
                if (fCodeLower.includes("solid")) row.opts.solid = val;
                if (fCodeLower.includes("caster")) row.opts.casters = val;
                if (fCodeLower.includes("tablet")) row.opts.tablet = val;
                if (fCodeLower.includes("chrome")) row.opts.chrome = val;
                if (fCodeLower.includes("power")) row.opts.power = val;
              }
            });
          }
        });
        extracted.push(row);
      }
      setProducts(extracted);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { processXML(); }, []);

  const filtered = useMemo(() => 
    products.filter(p => p.sku.toLowerCase().includes(searchTerm.toLowerCase()) || p.name.toLowerCase().includes(searchTerm.toLowerCase())),
  [products, searchTerm]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Search Bar */}
      <div className="p-4 border-b border-[#EDEBE9] bg-[#FAF9F8] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/logo2.png" alt="LESRO" className="h-8 object-contain" />
          <h1 className="text-sm font-bold text-[#464775]">PRICE MASTER AUDIT</h1>
        </div>
        <input 
          type="text" 
          placeholder="Search SKU or Name..." 
          className="text-xs border border-[#EDEBE9] rounded-sm px-3 py-2 w-80 focus:border-[#6264A7] outline-none shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto p-4">
        <div className="border border-[#EDEBE9] rounded-sm shadow-sm overflow-hidden">
          <table className="w-full text-[11px] border-collapse min-w-[2000px]">
            <thead className="bg-[#464775] text-white sticky top-0">
              <tr>
                {headers.map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold border-r border-[#5B5FC7] last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEBE9]">
              {loading ? (
                <tr><td colSpan={headers.length} className="text-center py-20 text-sm font-semibold animate-pulse">Synchronizing with PIM Database...</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={i} className="hover:bg-[#F3F2F1] transition-colors group">
                  <td className="px-3 py-2 font-mono font-bold text-[#6264A7] border-r border-[#EDEBE9]">{p.sku}</td>
                  <td className="px-3 py-2 font-semibold text-[#242424] border-r border-[#EDEBE9]">{p.name}</td>
                  <td className="px-3 py-2 text-[#605E5C] border-r border-[#EDEBE9]">{p.line}</td>
                  <td className="px-3 py-2 text-right font-bold bg-[#FAF9F8] border-r border-[#EDEBE9]">${p.basePrice}</td>
                  
                  {/* Grados 02-10 */}
                  {["G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10"].map(g => (
                    <td key={g} className="px-3 py-2 text-right border-r border-[#EDEBE9] group-hover:bg-blue-50/50">
                      {p.grades[g] ? `$${p.grades[g]}` : "—"}
                    </td>
                  ))}

                  {/* Opcionales */}
                  <td className="px-3 py-2 text-right text-red-700 font-medium border-r border-[#EDEBE9]">{p.opts.poly > 0 ? `+$${p.opts.poly}` : "—"}</td>
                  <td className="px-3 py-2 text-right text-red-700 font-medium border-r border-[#EDEBE9]">{p.opts.solid > 0 ? `+$${p.opts.solid}` : "—"}</td>
                  <td className="px-3 py-2 text-right text-blue-700 font-medium border-r border-[#EDEBE9]">{p.opts.casters > 0 ? `+$${p.opts.casters}` : "—"}</td>
                  <td className="px-3 py-2 text-right text-blue-700 font-medium border-r border-[#EDEBE9]">{p.opts.tablet > 0 ? `+$${p.opts.tablet}` : "—"}</td>
                  <td className="px-3 py-2 text-right border-r border-[#EDEBE9]">{p.opts.chrome > 0 ? `+$${p.opts.chrome}` : "—"}</td>
                  <td className="px-3 py-2 text-right">{p.opts.power > 0 ? `+$${p.opts.power}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LesroPricingMaster;