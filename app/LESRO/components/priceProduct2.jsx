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
      const get = (tag) =>
        p.getElementsByTagName(tag)[0]?.textContent?.trim() || "";

      const getPrices = () => {
        const prices = {};
        const options = p.getElementsByTagName("Option");

        for (let o of options) {
          const label =
            o.getElementsByTagName("Description")[0]?.textContent || "";
          const value =
            o.getElementsByTagName("Value")[0]?.textContent || "";

          if (label.toLowerCase().includes("grade")) {
            prices[label] = value;
          }

          if (label.toLowerCase().includes("arm")) prices["Arm"] = value;
          if (label.toLowerCase().includes("caster")) prices["Caster"] = value;
          if (label.toLowerCase().includes("power")) prices["Power"] = value;
          if (label.toLowerCase().includes("chrome")) prices["Chrome"] = value;
        }

        return prices;
      };

      const priceMap = getPrices();

      return {
        id: get("Code"),
        sequence: get("PriceListRef"),
        line: get("ClassificationRef"),
        name: get("Description"),
        basePrice: get("Value"),

        grade02: priceMap["Grade 02"] || "",
        grade03: priceMap["Grade 03"] || "",
        grade04: priceMap["Grade 04"] || "",
        grade05: priceMap["Grade 05"] || "",
        grade06: priceMap["Grade 06"] || "",
        grade07: priceMap["Grade 07"] || "",
        grade08: priceMap["Grade 08"] || "",
        grade09: priceMap["Grade 09"] || "",
        grade10: priceMap["Grade 10"] || "",
        grade11: priceMap["Grade 11"] || "",
        grade12: priceMap["Grade 12"] || "",
        grade13: priceMap["Grade 13"] || "",

        armPoly: priceMap["Arm Polyurethane"] || "",
        armSolid: priceMap["Arm Solid Surface"] || "",
        caster: priceMap["Caster"] || "",
        swivel: priceMap["Swivel"] || "",
        chrome: priceMap["Chrome"] || "",
        ganging: priceMap["Ganging"] || "",
        power: priceMap["Power"] || "",
        bevel: priceMap["Bevel"] || "",
        shelf: priceMap["Shelf"] || "",

        country: get("CountryOfOrigin"),
      };
    });

    setRows(result);
    setLoading(false);
  }

  if (loading)
    return <div className="p-6 text-sm">Loading LESRO pricing…</div>;

  return (
    <div className="overflow-auto p-6">
      <table className="min-w-[1800px] border text-xs">
        <thead className="bg-gray-100">
          <tr>
            {[
              "ID",
              "Seq",
              "Line",
              "Product",
              "Base",
              "G02",
              "G03",
              "G04",
              "G05",
              "G06",
              "G07",
              "G08",
              "G09",
              "G10",
              "G11",
              "G12",
              "G13",
              "Arm PU",
              "Arm Solid",
              "Caster",
              "Swivel",
              "Chrome",
              "Ganging",
              "Power",
              "Bevel",
              "Shelf",
              "Country",
            ].map((h) => (
              <th key={h} className="border px-2 py-1 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td>{r.id}</td>
              <td>{r.sequence}</td>
              <td>{r.line}</td>
              <td>{r.name}</td>
              <td>{r.basePrice}</td>
              <td>{r.grade02}</td>
              <td>{r.grade03}</td>
              <td>{r.grade04}</td>
              <td>{r.grade05}</td>
              <td>{r.grade06}</td>
              <td>{r.grade07}</td>
              <td>{r.grade08}</td>
              <td>{r.grade09}</td>
              <td>{r.grade10}</td>
              <td>{r.grade11}</td>
              <td>{r.grade12}</td>
              <td>{r.grade13}</td>
              <td>{r.armPoly}</td>
              <td>{r.armSolid}</td>
              <td>{r.caster}</td>
              <td>{r.swivel}</td>
              <td>{r.chrome}</td>
              <td>{r.ganging}</td>
              <td>{r.power}</td>
              <td>{r.bevel}</td>
              <td>{r.shelf}</td>
              <td>{r.country}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
