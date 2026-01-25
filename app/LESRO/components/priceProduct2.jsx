'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function LesroPricingTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadXML();
  }, []);

  async function loadXML() {
    const { data } = await supabase
      .from("ClientsSERVEX")
      .select("xml_raw")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!data?.xml_raw) return;
    parseXML(data.xml_raw);
  }

  function parseXML(xmlString) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "text/xml");
    const products = [...xml.getElementsByTagName("Product")];

    const result = products.map((p) => {
      // Helper para obtener texto de un tag directo
      const getTagText = (node, tag) => node.getElementsByTagName(tag)[0]?.textContent?.trim() || "";

      // 1. Datos básicos del Producto
      const id = getTagText(p, "Code");
      const name = getTagText(p, "Description");
      
      // Limpiar Classification para sacar la "Línea de Producto"
      const rawClass = getTagText(p, "ClassificationRef");
      const line = rawClass.split('\n').pop().trim().replace('aoSeat', ''); 

      // 2. Extraer Precios (Grados y Opciones)
      const prices = {};
      const features = p.getElementsByTagName("Feature");

      for (let f of features) {
        const options = f.getElementsByTagName("Option");
        for (let o of options) {
          const optDesc = getTagText(o, "Description");
          // Buscamos el valor dentro de OptionPrice -> Value
          const optPrice = o.getElementsByTagName("OptionPrice")[0];
          const val = optPrice ? getTagText(optPrice, "Value") : "";

          if (!val) continue;

          // Mapeo por palabras clave según las columnas del CSV
          const desc = optDesc.toLowerCase();
          
          if (desc.includes("grade")) {
            const gradeNum = desc.match(/\d+/)?.[0] || ""; // Extrae el número del grado
            if (gradeNum) prices[`grade${gradeNum.padStart(2, '0')}`] = val;
          } 
          else if (desc.includes("polyurethane")) prices["armPoly"] = val;
          else if (desc.includes("solid surface")) prices["armSolid"] = val;
          else if (desc.includes("caster")) prices["caster"] = val;
          else if (desc.includes("tablet")) prices["swivel"] = val;
          else if (desc.includes("chrome")) prices["chrome"] = val;
          else if (desc.includes("ganging")) prices["ganging"] = val;
          else if (desc.includes("power")) prices["power"] = val;
          else if (desc.includes("bevel")) prices["bevel"] = val;
          else if (desc.includes("shelf")) prices["shelf"] = val;
        }
      }

      // 3. Retornar el objeto plano (como una fila de Excel)
      return {
        id,
        sequence: p.getElementsByTagName("PriceListRef")[0]?.getAttribute("Default") || "1",
        line: line || "General",
        name,
        basePrice: getTagText(p, "Value"), // Para productos sin grados

        // Grados 02 al 13
        ...Array.from({ length: 12 }, (_, i) => {
          const g = (i + 2).toString().padStart(2, '0');
          return { [`grade${g}`]: prices[`grade${g}`] || "" };
        }).reduce((acc, curr) => ({ ...acc, ...curr }), {}),

        armPoly: prices["armPoly"] || "",
        armSolid: prices["armSolid"] || "",
        caster: prices["caster"] || "",
        swivel: prices["swivel"] || "",
        chrome: prices["chrome"] || "",
        ganging: prices["ganging"] || "",
        power: prices["power"] || "",
        bevel: prices["bevel"] || "",
        shelf: prices["shelf"] || "",
        country: "US" // Valor por defecto común en Lesro
      };
    });

    setRows(result);
    setLoading(false);
  }

  if (loading) return <div className="p-6 text-sm">Cargando matriz de precios Lesro...</div>;

  // Columnas idénticas al orden del CSV
  const headers = [
    "ID", "Seq", "Línea", "Producto", "Base", 
    "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G12", "G13",
    "Arm PU", "Arm Solid", "Casters", "Tablet", "Chrome", "Ganging", "Power", "Bevel", "Shelf", "Origen"
  ];

  return (
    <div className="overflow-auto p-6 bg-white">
      <h1 className="text-lg font-bold mb-4">Master Pricing (XML to Flat Matrix)</h1>
      <table className="min-w-[2200px] border-collapse text-[11px]">
        <thead className="bg-gray-800 text-white">
          <tr>
            {headers.map((h) => (
              <th key={h} className="border border-gray-600 px-2 py-2 text-left uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border px-2 py-1 font-bold text-blue-700">{r.id}</td>
              <td className="border px-2 py-1 text-center">{r.sequence}</td>
              <td className="border px-2 py-1">{r.line}</td>
              <td className="border px-2 py-1">{r.name}</td>
              <td className="border px-2 py-1 text-right bg-yellow-50">{r.basePrice}</td>
              {/* Celdas de Grados */}
              {[2,3,4,5,6,7,8,9,10,11,12,13].map(g => (
                <td key={g} className="border px-2 py-1 text-right">
                  {r[`grade${g.toString().padStart(2, '0')}`]}
                </td>
              ))}
              <td className="border px-2 py-1 text-right">{r.armPoly}</td>
              <td className="border px-2 py-1 text-right">{r.armSolid}</td>
              <td className="border px-2 py-1 text-right">{r.caster}</td>
              <td className="border px-2 py-1 text-right">{r.swivel}</td>
              <td className="border px-2 py-1 text-right">{r.chrome}</td>
              <td className="border px-2 py-1 text-right">{r.ganging}</td>
              <td className="border px-2 py-1 text-right">{r.power}</td>
              <td className="border px-2 py-1 text-right">{r.bevel}</td>
              <td className="border px-2 py-1 text-right">{r.shelf}</td>
              <td className="border px-2 py-1 text-center">{r.country}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}