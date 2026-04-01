'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

const CatalogTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Nombres de las columnas según tu requerimiento
  const headers = [
    "Price Guide Sequence", "Product Line", "Product Name", "SKU",
    "Price (Non UPH)", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G12", "G13",
    "Opt. Poly Arm", "Opt. Solid Arm", "Casters", "Swivel Tablet", "Chrome", "Ganging", "Power", "Bevel", "Shelf", "Origin"
  ];

  const fetchAndParseXML = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('ClientsSERVEX').select('xml_raw').eq('user_id', user?.id).single();

      if (!data?.xml_raw) return;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.xml_raw, "text/xml");
      
      // Mapeo rápido de Features para búsqueda relacional
      const allFeatures = Array.from(xmlDoc.getElementsByTagName("Feature")).reduce((acc, feat) => {
        acc[feat.getElementsByTagName("Code")[0]?.textContent] = feat;
        return acc;
      }, {});

      const productNodes = xmlDoc.getElementsByTagName("Product");
      const extracted = [];

      for (let i = 0; i < productNodes.length; i++) {
        const p = productNodes[i];
        const code = p.getElementsByTagName("Code")[0]?.textContent || "";
        const desc = p.getElementsByTagName("Description")[0]?.textContent || "";
        const basePrice = parseFloat(p.getElementsByTagName("Value")[0]?.textContent || "0");
        
        // Inicializar objeto de fila
        let row = {
          sequence: i + 1,
          line: p.getElementsByTagName("ClassificationRef")[0]?.textContent || "General",
          name: desc,
          sku: code,
          nonUph: basePrice,
          grades: {}, // G02-G13
          options: { poly: 0, solid: 0, casters: 0, tablet: 0, chrome: 0, ganging: 0, power: 0, bevel: 0, shelf: 0 },
          origin: "USA"
        };

        // Buscar en las Features del producto
        const pFeatures = p.getElementsByTagName("FeatureRef");
        for (let f = 0; f < pFeatures.length; f++) {
          const fRef = pFeatures[f].textContent;
          const featureNode = allFeatures[fRef];

          if (featureNode) {
            const options = featureNode.getElementsByTagName("Option");
            for (let o = 0; o < options.length; o++) {
              const opt = options[o];
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent || "";
              const optVal = parseFloat(opt.getElementsByTagName("Value")[0]?.textContent || "0");

              // 1. Lógica de Grados (Suma al base price)
              if (optCode.includes("GRADE")) {
                const gradeNum = optCode.match(/\d+/)?.[0]?.padStart(2, '0');
                if (gradeNum) row.grades[`G${gradeNum}`] = basePrice + optVal;
              }

              // 2. Lógica de Opcionales (Diferenciales puros)
              const optDesc = opt.getElementsByTagName("Description")[0]?.textContent?.toLowerCase() || "";
              if (optDesc.includes("polyurethane")) row.options.poly = optVal;
              if (optDesc.includes("solid surface")) row.options.solid = optVal;
              if (optDesc.includes("caster")) row.options.casters = optVal;
              if (optDesc.includes("tablet")) row.options.tablet = optVal;
              if (optDesc.includes("chrome")) row.options.chrome = optVal;
              if (optDesc.includes("ganging")) row.options.ganging = optVal;
              if (optDesc.includes("power")) row.options.power = optVal;
              if (optDesc.includes("bevel")) row.options.bevel = optVal;
              if (optDesc.includes("shelf")) row.options.shelf = optVal;
            }
          }
        }
        extracted.push(row);
      }
      setProducts(extracted);
    } catch (err) {
      console.error("Parsing error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAndParseXML(); }, []);

  const filtered = useMemo(() => 
    products.filter(p => p.sku.toLowerCase().includes(searchTerm.toLowerCase()) || p.name.toLowerCase().includes(searchTerm.toLowerCase())), 
  [products, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Mini Header de búsqueda */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h1 className="text-sm font-bold text-gray-700 uppercase tracking-tighter">Lesro Price Matrix</h1>
        <input 
          type="text" 
          placeholder="Filtrar por SKU o Nombre..." 
          className="text-xs border border-gray-300 rounded px-3 py-1.5 w-64 focus:ring-1 focus:ring-[#6264A7] outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-[10px] border-collapse min-w-[2500px]">
          <thead className="sticky top-0 z-10 bg-[#464775] text-white">
            <tr>
              {headers.map(h => (
                <th key={h} className="border border-[#5B5FC7] px-2 py-2 text-left font-semibold uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={27} className="text-center py-10 text-sm font-medium">Procesando matriz XML...</td></tr>
            ) : filtered.map((p, i) => (
              <tr key={i} className="hover:bg-blue-50 transition-colors">
                <td className="px-2 py-1.5 border border-gray-100 text-gray-400">{p.sequence}</td>
                <td className="px-2 py-1.5 border border-gray-100 font-bold text-gray-600">{p.line}</td>
                <td className="px-2 py-1.5 border border-gray-100 truncate max-w-xs">{p.name}</td>
                <td className="px-2 py-1.5 border border-gray-100 font-mono text-[#6264A7] font-bold">{p.sku}</td>
                <td className="px-2 py-1.5 border border-gray-100 text-right bg-gray-50">${p.nonUph}</td>
                
                {/* Grados 02-13 */}
                {[...Array(12)].map((_, idx) => {
                  const gKey = `G${(idx + 2).toString().padStart(2, '0')}`;
                  return <td key={gKey} className="px-2 py-1.5 border border-gray-100 text-right font-medium">{p.grades[gKey] ? `$${p.grades[gKey]}` : "-"}</td>;
                })}

                {/* Opcionales */}
                <td className="px-2 py-1.5 border border-gray-100 text-right text-red-600">+{p.options.poly}</td>
                <td className="px-2 py-1.5 border border-gray-100 text-right text-red-600">+{p.options.solid}</td>
                <td className="px-2 py-1.5 border border-gray-100 text-right text-blue-600">+{p.options.casters}</td>
                <td className="px-2 py-1.5 border border-gray-100 text-right text-blue-600">+{p.options.tablet}</td>
                <td className="px-2 py-1.5 border border-gray-100 text-right">+{p.options.chrome}</td>
                <td className="px-2 py-1.5 border border-gray-100 text-right">+{p.options.ganging}</td>
                <td className="px-2 py-1.5 border border-gray-100 text-right">+{p.options.power}</td>
                <td className="px-2 py-1.5 border border-gray-100 text-right">+{p.options.bevel}</td>
                <td className="px-2 py-1.5 border border-gray-100 text-right">+{p.options.shelf}</td>
                <td className="px-2 py-1.5 border border-gray-100 text-center font-bold">{p.origin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogTable;