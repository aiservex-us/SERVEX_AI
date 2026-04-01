'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { motion } from 'framer-motion';

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

  const stats = {
    total: products.length,
    filtered: filtered.length,
    avgPrice: Math.round(
      products.reduce((acc, p) => acc + p.basePrice, 0) / (products.length || 1)
    )
  };

  return (
    <div className="h-screen flex flex-col bg-[#F3F4F6]">

      {/* HEADER */}
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-[#242424]">
            LESRO Pricing Matrix
          </h1>
          <p className="text-xs text-slate-500">
            Structured pricing intelligence
          </p>
        </div>

        <input
          type="text"
          placeholder="Search SKU or product..."
          className="text-xs border px-3 py-2 w-72 rounded-lg outline-none focus:ring-2 focus:ring-[#5B5FC7]"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {[
          { label: "Total Products", value: stats.total },
          { label: "Filtered", value: stats.filtered },
          { label: "Avg Price", value: `$${stats.avgPrice}` }
        ].map((s, i) => (
          <div key={i} className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-lg font-semibold text-[#242424]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="flex-1 px-4 pb-4 min-h-0">
        <div className="h-full bg-white border rounded-2xl overflow-hidden">

          <div className="h-full overflow-auto">

            <table className="w-full text-[12px] min-w-[1600px] border-collapse">

              <thead className="bg-[#5B5FC7] text-white sticky top-0 z-10 text-[11px]">
                <tr>
                  {headers.map(h => (
                    <th key={h} className="px-3 py-2 whitespace-nowrap font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={headers.length} className="px-4 py-4">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filtered.map((p, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[#F9FAFB] transition"
                  >
                    <td className="px-3 py-2 font-medium text-[#333]">{p.sku}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2 text-slate-500">{p.line}</td>
                    <td className="px-3 py-2 font-semibold">${p.basePrice}</td>

                    {["G02","G03","G04","G05","G06","G07","G08","G09","G10"].map(g => (
                      <td key={g} className="px-3 py-2">
                        {p.grades[g] ? `$${p.grades[g]}` : "—"}
                      </td>
                    ))}

                    {Object.values(p.opts).map((v, idx) => (
                      <td key={idx} className="px-3 py-2 text-xs">
                        {v ? `+$${v}` : "—"}
                      </td>
                    ))}

                  </motion.tr>
                ))}
              </tbody>

            </table>

          </div>
        </div>
      </div>

    </div>
  );
};

export default LesroPricingMaster;