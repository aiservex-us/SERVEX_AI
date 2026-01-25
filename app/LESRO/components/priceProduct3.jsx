'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiCheckCircle, FiAlertTriangle, FiX, FiZap } from "react-icons/fi";
import { supabase } from "@/app/lib/supabaseClient";

/* ======================================================
   COMPONENTE UNIFICADO CSV + XML AUDIT ENGINE
====================================================== */

export default function SVXAuditEngine() {

  // CSV
  const [csvData, setCsvData] = useState([]);
  const [diffSKUs, setDiffSKUs] = useState([]);

  // XML
  const [xmlDoc, setXmlDoc] = useState(null);
  const [products, setProducts] = useState([]);

  // UI
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  /* ======================================================
     LOAD XML FROM SUPABASE
  ====================================================== */
  useEffect(() => {
    const loadXML = async () => {
      const { data } = await supabase
        .from("ClientsSERVEX")
        .select("xml_raw")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!data?.xml_raw) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(data.xml_raw, "text/xml");
      setXmlDoc(doc);
    };

    loadXML();
  }, []);

  /* ======================================================
     CSV HANDLER
  ====================================================== */
  const processCSV = async (text) => {
    const rows = text.split(/\r?\n/).filter(Boolean);
    const delimiter = rows[0].includes(";") ? ";" : ",";
    const matrix = rows.map(r => r.split(delimiter).map(c => c.trim()));

    setCsvData(matrix);
    await compareWithMaster(matrix);
  };

  const compareWithMaster = async (current) => {
    setLoading(true);

    const { data } = await supabase
      .from("ClientsSERVEX")
      .select("csv_raw")
      .limit(1)
      .single();

    if (!data?.csv_raw) return;

    const dbRows = data.csv_raw.split(/\r?\n/);
    const delimiter = dbRows[0].includes(";") ? ";" : ",";
    const master = dbRows.map(r => r.split(delimiter));

    const header = current[0];
    const skuIndex = header.findIndex(h => h.toLowerCase().includes("sku"));

    const diffs = [];

    current.slice(1).forEach((row, i) => {
      const masterRow = master[i + 1];
      if (!masterRow) return;

      if (JSON.stringify(row) !== JSON.stringify(masterRow)) {
        diffs.push(row[skuIndex]);
      }
    });

    setDiffSKUs([...new Set(diffs)]);
    setLoading(false);
  };

  /* ======================================================
     XML → PRODUCT BUILDER
  ====================================================== */
  useEffect(() => {
    if (!xmlDoc || diffSKUs.length === 0) return;

    const parsed = diffSKUs.map(sku => {
      const productNode = [...xmlDoc.getElementsByTagName("Product")]
        .find(p => p.querySelector("Code")?.textContent === sku);

      if (!productNode) return null;

      const features = [...productNode.getElementsByTagName("Feature")]
        .map(f => ({
          id: f.querySelector("Code")?.textContent,
          name: f.querySelector("Description")?.textContent,
          options: [...f.getElementsByTagName("Option")].map(o => ({
            code: o.querySelector("Code")?.textContent,
            desc: o.querySelector("Description")?.textContent,
            price: parseFloat(o.querySelector("OptionPrice > Value")?.textContent || 0)
          }))
        }));

      return {
        sku,
        name: productNode.querySelector("Description")?.textContent,
        base: parseFloat(productNode.querySelector("Price > Value")?.textContent || 0),
        features
      };
    }).filter(Boolean);

    setProducts(parsed);
  }, [diffSKUs, xmlDoc]);

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className="flex h-screen bg-white">

      {/* CSV SIDE */}
      <section className="w-1/2 p-4 border-r">
        <div
          onDrop={(e) => {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = ev => processCSV(ev.target.result);
            reader.readAsText(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400"
        >
          <FiUploadCloud size={32} />
          <p className="mt-2 text-xs">Arrastra tu CSV aquí</p>
        </div>
      </section>

      {/* XML SIDE */}
      <section className="w-1/2 p-4 overflow-y-auto bg-[#FAFAFA]">

        {products.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p>No hay cambios detectados</p>
          </div>
        ) : (
          products.map((p, i) => (
            <div key={i} className="mb-4 border rounded shadow-sm">
              <div
                className="p-3 bg-[#464775] text-white cursor-pointer"
                onClick={() => setExpandedIndex(i === expandedIndex ? null : i)}
              >
                <strong>{p.sku}</strong> — ${p.base}
              </div>

              {expandedIndex === i && (
                <div className="p-3 bg-white">
                  {p.features.map(f => (
                    <div key={f.id} className="mb-3">
                      <p className="text-xs font-bold">{f.name}</p>
                      {f.options.map(o => (
                        <div key={o.code} className="text-xs flex justify-between border-b py-1">
                          <span>{o.desc}</span>
                          <span>${o.price}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
