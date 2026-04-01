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

      const { data } = await supabase
        .from('ClientsSERVEX')
        .select('xml_raw')
        .eq('user_id', user?.id)
        .single();

      if (!data?.xml_raw) return;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.xml_raw, "text/xml");

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

        // ==============================
        // 🎯 1. GRADES (UPH-AVERAGE-SKU)
        // ==============================
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

        // ==============================
        // 🎯 2. OPCIONES (FEATURE-SKU)
        // ==============================
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

            // Ignorar base
            if (["AXX", "NONE", "STANDARD", "PXX"].some(x => optCode.includes(x))) return;

            if (val <= 0) return;

            // Mapping inteligente
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
      console.error("Error:", err);
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

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* HEADER */}
      <div className="p-4 border-b bg-[#FAF9F8] flex justify-between">
        <h1 className="text-sm font-bold text-[#464775]">LESRO MASTER MATRIX</h1>
        <input
          type="text"
          placeholder="Search SKU..."
          className="text-xs border px-3 py-2 w-80"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto p-4">
        <table className="w-full text-[11px] min-w-[2000px] border">
          <thead className="bg-[#464775] text-white sticky top-0">
            <tr>
              {headers.map(h => (
                <th key={h} className="px-2 py-2 border">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="text-center py-20">
                  Loading XML...
                </td>
              </tr>
            ) : filtered.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50">

                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.line}</td>
                <td>${p.basePrice}</td>

                {["G02","G03","G04","G05","G06","G07","G08","G09","G10"].map(g => (
                  <td key={g}>
                    {p.grades[g] ? `$${p.grades[g]}` : "—"}
                  </td>
                ))}

                <td>{p.opts.poly ? `+$${p.opts.poly}` : "—"}</td>
                <td>{p.opts.solid ? `+$${p.opts.solid}` : "—"}</td>
                <td>{p.opts.casters ? `+$${p.opts.casters}` : "—"}</td>
                <td>{p.opts.tablet ? `+$${p.opts.tablet}` : "—"}</td>
                <td>{p.opts.chrome ? `+$${p.opts.chrome}` : "—"}</td>
                <td>{p.opts.power ? `+$${p.opts.power}` : "—"}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LesroPricingMaster;