'use client';

import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

/* ===========================
   PARSER XML LESRO
=========================== */
const parseLesroXML = (xmlString) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, "text/xml");

  const products = [];
  const productNodes = xml.getElementsByTagName("Product");

  for (let i = 0; i < productNodes.length; i++) {
    const p = productNodes[i];

    const get = (tag) =>
      p.getElementsByTagName(tag)[0]?.textContent?.trim() || "";

    const product = {
      id: get("Code"),
      name: get("Description"),
      productLine: get("ClassificationRef"),
      country: get("CountryOfOrigin"),
      basePrice: 0,
      grades: {},
      options: {}
    };

    const options = p.getElementsByTagName("Option");

    for (let j = 0; j < options.length; j++) {
      const opt = options[j];
      const label =
        opt.getElementsByTagName("Description")[0]?.textContent || "";
      const value = parseFloat(
        opt.getElementsByTagName("Value")[0]?.textContent || "0"
      );

      if (!value) continue;

      if (label.toLowerCase().includes("grade")) {
        product.grades[label] = value;
      } else if (label.toLowerCase().includes("arm")) {
        product.options["Arm Option"] = value;
      } else if (label.toLowerCase().includes("caster")) {
        product.options["Casters"] = value;
      } else if (label.toLowerCase().includes("power")) {
        product.options["Power Unit"] = value;
      } else if (label.toLowerCase().includes("chrome")) {
        product.options["Chrome Finish"] = value;
      } else if (label.toLowerCase().includes("shelf")) {
        product.options["Shelf"] = value;
      }
    }

    product.basePrice =
      product.grades["Grade 01"] ||
      Object.values(product.grades)[0] ||
      0;

    products.push(product);
  }

  return products;
};

/* ===========================
   COMPONENTE PRINCIPAL
=========================== */
export default function PanelLesro() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadXML = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("ClientsSERVEX")
        .select("xml_raw")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data?.xml_raw) {
        const parsed = parseLesroXML(data.xml_raw);
        setProducts(parsed);
      }

      setLoading(false);
    };

    loadXML();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-sm font-semibold text-gray-600">
          Loading LESRO Catalog...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white">
      <h1 className="text-xl font-bold mb-4">LESRO Product Catalog</h1>

      <div className="overflow-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Line</th>
              <th className="p-2 text-left">Base Price</th>
              <th className="p-2 text-left">Grades</th>
              <th className="p-2 text-left">Options</th>
              <th className="p-2 text-left">Country</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 font-mono text-xs">{p.id}</td>
                <td className="p-2 font-semibold">{p.name}</td>
                <td className="p-2">{p.productLine}</td>
                <td className="p-2 font-bold">${p.basePrice}</td>

                <td className="p-2 text-xs">
                  {Object.entries(p.grades).map(([k, v]) => (
                    <div key={k}>
                      {k}: <b>${v}</b>
                    </div>
                  ))}
                </td>

                <td className="p-2 text-xs">
                  {Object.entries(p.options).map(([k, v]) => (
                    <div key={k}>
                      {k}: <b>${v}</b>
                    </div>
                  ))}
                </td>

                <td className="p-2">{p.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
