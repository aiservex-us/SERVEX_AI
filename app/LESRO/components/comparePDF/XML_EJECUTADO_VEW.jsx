"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { FiSearch, FiCheckCircle, FiPackage, FiPlusCircle } from 'react-icons/fi';
import { Database, Table as TableIcon } from "lucide-react";
import { supabase } from '../../../lib/supabaseClient';

const IndependentLESROVisualizer = () => {
  const [xmlString, setXmlString] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data, error } = await supabase
          .from('ClientsSERVEX')
          .select('xml_updated_raw')
          .eq('company_name', 'LESRO')
          .single();

        if (error) throw error;
        if (data?.xml_updated_raw) setXmlString(data.xml_updated_raw);
      } catch (err) {
        console.error("Error fetching initial XML:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    const channel = supabase
      .channel('lesro-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ClientsSERVEX', filter: 'company_name=eq.LESRO' },
        (payload) => {
          if (payload.new?.xml_updated_raw) setXmlString(payload.new.xml_updated_raw);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200 rounded-xl">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-[#464775] mb-4">
        <Database size={40} />
      </motion.div>
      <p className="text-slate-600 font-bold">Sincronizando Matriz de Precios Lesro...</p>
    </div>
  );

  return <TeamsOFDAVisualizer xmlString={xmlString} />;
};

const TeamsOFDAVisualizer = ({ xmlString }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(30);

  const catalogData = useMemo(() => {
    if (!xmlString) return [];

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const productNodes = Array.from(xmlDoc.getElementsByTagName("Product"));

      return productNodes.map((prod, idx) => {
        const sku = prod.getElementsByTagName("Code")[0]?.textContent?.trim() || "N/A";
        const description = prod.getElementsByTagName("Description")[0]?.textContent?.trim() || "No Description";

        // Precio Base (Solo se usa si NO es tapizado)
        const basePriceNode = prod.querySelector("Price > Value");
        const directPrice = basePriceNode ? parseFloat(basePriceNode.textContent).toFixed(2) : "N/A";

        const rowData = {
          id: idx,
          sku,
          description,
          basePrice: directPrice,
          grades: {},
          optionals: { poly: "N/A", solid: "N/A", casters: "N/A", tablet: "N/A", chrome: "N/A" },
          coo: "US"
        };

        // --- PROCESAR OPCIONES DEL PRODUCTO ---
        const options = Array.from(prod.getElementsByTagName("Option"));
        let hasGrades = false;

        options.forEach((opt) => {
          const optCode = (opt.getElementsByTagName("Code")[0]?.textContent || "").toUpperCase().trim();
          const optDesc = (opt.getElementsByTagName("Description")[0]?.textContent || "").toUpperCase().trim();
          const valNode = opt.querySelector("OptionPrice > Value") || opt.querySelector("Value");
          const price = valNode ? parseFloat(valNode.textContent).toFixed(2) : null;

          if (price === null) return;

          // 1. Detectar Grades (AS1101 tiene GR02, GR03, etc.)
          const gradeMatch = optCode.match(/GR(?:ADE|D|D0)?(\d+)/i);
          if (gradeMatch) {
            const num = parseInt(gradeMatch[1]);
            if (num >= 2 && num <= 13) {
              rowData.grades[`g${num.toString().padStart(2, '0')}`] = price;
              hasGrades = true;
            }
          }

          // 2. Detectar Opcionales (Upcharges)
          const searchTxt = `${optCode} ${optDesc}`;
          if (searchTxt.includes("POLY") || searchTxt.includes("APU")) rowData.optionals.poly = price;
          else if (searchTxt.includes("SOLID SURFACE") || searchTxt.includes("ASS")) rowData.optionals.solid = price;
          else if (searchTxt.includes("CASTER")) rowData.optionals.casters = price;
          else if (searchTxt.includes("TABLET")) rowData.optionals.tablet = price;
          else if (searchTxt.includes("CHROME")) rowData.optionals.chrome = price;
        });

        // REGLA DE ORO: Si tiene grados, el precio base en el CSV es N/A
        if (hasGrades) rowData.basePrice = "N/A";

        return rowData;
      });
    } catch (err) {
      console.error("XML Error:", err);
      return [];
    }
  }, [xmlString]);

  const filteredData = useMemo(() => 
    catalogData.filter(p => p.sku.toLowerCase().includes(searchTerm.toLowerCase())), 
    [catalogData, searchTerm]
  );

  const displayData = useMemo(() => filteredData.slice(0, visibleCount), [filteredData, visibleCount]);

  return (
    <div className="w-full h-full flex flex-col bg-[#F3F2F1] text-[#242424] overflow-hidden font-sans">
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#464775] flex items-center justify-center text-white">
            <TableIcon size={18} />
          </div>
          <div>
            <h2 className="font-bold text-[13px]">SERVEX_AI: Lesro Catalog Master</h2>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> DB Sincronizada
            </div>
          </div>
        </div>
        <input 
          type="text"
          placeholder="Filtrar por SKU..."
          className="pl-4 pr-4 py-1.5 bg-[#F3F2F1] rounded text-[11px] w-64 outline-none border border-transparent focus:border-[#464775]"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-auto bg-white custom-scrollbar">
        <table className="w-full text-left border-collapse table-fixed min-w-[2400px]">
          <thead className="sticky top-0 z-20 shadow-sm">
            <tr className="bg-[#FAF9F8] text-[10px] text-[#464775] font-black uppercase border-b border-slate-200">
              <th className="p-3 w-32 sticky left-0 bg-[#FAF9F8] border-r">ID (SKU)</th>
              <th className="p-3 w-64 border-r">Description</th>
              <th className="p-3 w-32 text-center border-r bg-[#F1F3F9]">Price (Non UPH)</th>
              {Array.from({ length: 12 }, (_, i) => i + 2).map(g => (
                <th key={g} className="p-3 w-24 text-center border-r">Grade {g.toString().padStart(2, '0')}</th>
              ))}
              <th className="p-3 w-32 text-center border-r">Poly Armpad</th>
              <th className="p-3 w-32 text-center border-r">Solid Surface</th>
              <th className="p-3 w-24 text-center border-r">Casters</th>
              <th className="p-3 w-24 text-center">COO</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {displayData.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-black text-[#464775] sticky left-0 bg-white border-r">{p.sku}</td>
                <td className="p-3 text-slate-500 border-r truncate">{p.description}</td>
                <td className="p-3 text-center border-r font-bold bg-[#F1F3F9]/30">{p.basePrice === "N/A" ? "N/A" : `$${p.basePrice}`}</td>
                {Array.from({ length: 12 }, (_, i) => (i + 2).toString().padStart(2, '0')).map(num => (
                  <td key={num} className="p-3 text-center border-r font-mono text-emerald-700 font-bold">
                    {p.grades[`g${num}`] ? `$${p.grades[`g${num}`]}` : "—"}
                  </td>
                ))}
                <td className="p-3 text-center border-r font-mono text-blue-600">
                  {p.optionals.poly !== "N/A" ? `$${p.optionals.poly}` : "N/A"}
                </td>
                <td className="p-3 text-center border-r font-mono text-blue-600">
                  {p.optionals.solid !== "N/A" ? `$${p.optionals.solid}` : "N/A"}
                </td>
                <td className="p-3 text-center border-r font-mono">
                  {p.optionals.casters !== "N/A" ? `$${p.optionals.casters}` : "N/A"}
                </td>
                <td className="p-3 text-center text-slate-400 font-bold">{p.coo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="h-10 bg-white border-t px-6 flex items-center text-[10px] text-slate-400 font-bold">
        <FiPackage className="mr-2" /> {filteredData.length} SKUs Identificados
      </div>
    </div>
  );
};

export default IndependentLESROVisualizer;