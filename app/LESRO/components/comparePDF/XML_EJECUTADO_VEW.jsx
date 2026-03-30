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
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ClientsSERVEX',
          filter: 'company_name=eq.LESRO',
        },
        (payload) => {
          if (payload.new?.xml_updated_raw) {
            setXmlString(payload.new.xml_updated_raw);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200 rounded-xl">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }} className="text-[#464775] mb-4">
          <Database size={40} />
        </motion.div>
        <p className="text-slate-600 font-bold">Iniciando Auditoría de Precios Lesro...</p>
      </div>
    );
  }

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
      const allOptions = Array.from(xmlDoc.getElementsByTagName("Option"));

      console.log(`📊 Total Productos: ${productNodes.length} | Total Opciones: ${allOptions.length}`);

      return productNodes.map((prod, idx) => {
        const sku = prod.getElementsByTagName("Code")[0]?.textContent?.trim() || "N/A";
        const description = prod.getElementsByTagName("Description")[0]?.textContent?.trim() || "No Description";

        // Base Price (Non-UPH)
        const basePriceNode = prod.querySelector("Price > Value");
        const basePrice = parseFloat(basePriceNode?.textContent || "0");

        const rowData = {
          id: idx,
          sku,
          description,
          basePrice: basePrice > 0 ? basePrice.toFixed(2) : "N/A",
          grades: {},
          optionals: {
            polyArm: "N/A",
            solidArm: "N/A",
            casters: "N/A",
            tablet: "N/A",
            chrome: "N/A",
            ganging: "N/A",
            power: "N/A",
            bevel: "N/A",
            shelf: "N/A"
          },
          coo: "US"
        };

        // ==================== PROCESAR TODAS LAS OPCIONES (ESTRUCTURA OFDA) ====================
        allOptions.forEach((opt) => {
          const optCode = (opt.getElementsByTagName("Code")[0]?.textContent || "").toUpperCase().trim();
          const optDesc = (opt.getElementsByTagName("Description")[0]?.textContent || "").toUpperCase().trim();

          const priceNode = opt.querySelector("OptionPrice > Value") || opt.querySelector("Price > Value");
          const priceStr = priceNode?.textContent?.trim();
          if (!priceStr) return;

          const priceValue = parseFloat(priceStr);
          if (isNaN(priceValue) || priceValue <= 0) return;

          const fullText = `${optCode} ${optDesc}`;

          // === GRADES → Precio TOTAL (como en tu CSV) ===
          const gradeMatch = optCode.match(/GR(?:ADE|D)?(\d+)/i);
          if (gradeMatch) {
            const num = parseInt(gradeMatch[1]);
            if (num >= 2 && num <= 13) {
              const key = `g${num.toString().padStart(2, '0')}`;
              rowData.grades[key] = priceValue.toFixed(2);
            }
            return;
          }

          // === OPCIONES FIJAS (matching robusto según estructura OFDA) ===
          if (
            fullText.includes("POLY") ||
            fullText.includes("URETHANE") ||
            (fullText.includes("ARM") && fullText.includes("POLY"))
          ) {
            rowData.optionals.polyArm = priceValue.toFixed(2);
          }
          else if (
            fullText.includes("SOLID") ||
            fullText.includes("CORIAN") ||
            fullText.includes("SURFACE") ||
            (fullText.includes("ARM") && fullText.includes("SOLID"))
          ) {
            rowData.optionals.solidArm = priceValue.toFixed(2);
          }
          else if (fullText.includes("CASTER") || optCode.includes("CASTER")) {
            rowData.optionals.casters = priceValue.toFixed(2);
          }
          else if (
            fullText.includes("TABLET") ||
            fullText.includes("SWIVEL") ||
            optCode.includes("TABLET")
          ) {
            rowData.optionals.tablet = priceValue.toFixed(2);
          }
          else if (fullText.includes("CHROME") || optCode.includes("CHROME")) {
            rowData.optionals.chrome = priceValue.toFixed(2);
          }
          else if (fullText.includes("GANGING")) rowData.optionals.ganging = priceValue.toFixed(2);
          else if (fullText.includes("POWER") || fullText.includes("UNIT")) rowData.optionals.power = priceValue.toFixed(2);
          else if (fullText.includes("BEVEL")) rowData.optionals.bevel = priceValue.toFixed(2);
          else if (fullText.includes("SHELF")) rowData.optionals.shelf = priceValue.toFixed(2);
        });

        // Debug específico para AS1101 (quítalo después si quieres)
        if (sku === "AS1101") {
          console.log("🔍 AS1101 PROCESADO:", {
            basePrice: rowData.basePrice,
            PolyArmpad: rowData.optionals.polyArm,
            SolidSurface: rowData.optionals.solidArm,
            Casters: rowData.optionals.casters,
            Tablet: rowData.optionals.tablet,
            Chrome: rowData.optionals.chrome,
            Grades: rowData.grades
          });
        }

        return rowData;
      });
    } catch (err) {
      console.error("XML Engine Error:", err);
      return [];
    }
  }, [xmlString]);

  const filteredData = useMemo(() => 
    catalogData.filter(p => p.sku.toLowerCase().includes(searchTerm.toLowerCase())), 
    [catalogData, searchTerm]
  );

  const displayData = useMemo(() => 
    filteredData.slice(0, visibleCount), 
    [filteredData, visibleCount]
  );

  const handleLoadMore = () => setVisibleCount(prev => prev + 30);

  if (catalogData.length === 0) {
    return <div className="p-10 text-center text-slate-400">No se encontraron datos disponibles en Supabase.</div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#F3F2F1] text-[#242424] overflow-hidden font-sans">
      {/* Header igual que antes */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#464775] flex items-center justify-center text-white">
            <TableIcon size={18} />
          </div>
          <div>
            <h2 className="font-bold text-[13px]">SERVEX_AI: Lesro Catalog Master</h2>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Live Database Sync Active
            </span>
          </div>
        </div>

        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text"
            placeholder="Filter by SKU (e.g. AS1101)..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(30); }}
            className="pl-9 pr-4 py-1.5 bg-[#F3F2F1] border-transparent focus:bg-white focus:border-[#464775] rounded text-[11px] w-72 transition-all outline-none"
          />
        </div>
      </div>

      {/* Tabla con formato exacto al CSV */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-white">
        <table className="w-full text-left border-collapse table-fixed min-w-[2400px]">
          <thead className="sticky top-0 z-20 shadow-sm">
            <tr className="bg-[#FAF9F8] text-[10px] text-[#464775] font-black uppercase tracking-wider border-b border-slate-200">
              <th className="p-3 w-32 sticky left-0 bg-[#FAF9F8] border-r border-slate-200">ID (SKU)</th>
              <th className="p-3 w-64 border-r border-slate-200">Description</th>
              <th className="p-3 w-28 text-center border-r border-slate-200 bg-[#F1F3F9]">List Price (Non-UPH)</th>
              {Array.from({ length: 12 }, (_, i) => i + 2).map(g => (
                <th key={g} className="p-3 w-24 text-center border-r border-slate-200">Grade {g.toString().padStart(2, '0')}</th>
              ))}
              <th className="p-3 w-32 text-center border-r border-slate-200">Poly Armpad</th>
              <th className="p-3 w-32 text-center border-r border-slate-200">Solid Surface</th>
              <th className="p-3 w-24 text-center border-r border-slate-200">Casters</th>
              <th className="p-3 w-24 text-center border-r border-slate-200">Tablet</th>
              <th className="p-3 w-24 text-center border-r border-slate-200">Chrome</th>
              <th className="p-3 w-24 text-center border-r border-slate-200">Power</th>
              <th className="p-3 w-24 text-center border-r border-slate-200">Bevel</th>
              <th className="p-3 w-24 text-center border-r border-slate-200">Shelf</th>
              <th className="p-3 w-16 text-center">COO</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {displayData.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                <td className="p-3 font-black text-[#464775] sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-200">{p.sku}</td>
                <td className="p-3 text-slate-500 border-r border-slate-200 truncate">{p.description}</td>
                <td className="p-3 text-center border-r border-slate-200 font-bold bg-[#F1F3F9]/30">
                  {p.basePrice === "N/A" ? "N/A" : `$${p.basePrice}`}
                </td>

                {/* Grades - Precios TOTALES */}
                {Array.from({ length: 12 }, (_, i) => (i + 2).toString().padStart(2, '0')).map(num => {
                  const val = p.grades[`g${num}`];
                  return (
                    <td key={num} className="p-3 text-center border-r border-slate-200 font-mono text-emerald-600 font-bold">
                      {val ? `$${val}` : "—"}
                    </td>
                  );
                })}

                {/* Optionals */}
                <td className="p-3 text-center border-r border-slate-200 font-mono text-blue-600 font-bold">{p.optionals.polyArm !== "N/A" ? `$${p.optionals.polyArm}` : "N/A"}</td>
                <td className="p-3 text-center border-r border-slate-200 font-mono text-blue-600 font-bold">{p.optionals.solidArm !== "N/A" ? `$${p.optionals.solidArm}` : "N/A"}</td>
                <td className="p-3 text-center border-r border-slate-200 font-mono">{p.optionals.casters !== "N/A" ? `$${p.optionals.casters}` : "N/A"}</td>
                <td className="p-3 text-center border-r border-slate-200 font-mono">{p.optionals.tablet !== "N/A" ? `$${p.optionals.tablet}` : "N/A"}</td>
                <td className="p-3 text-center border-r border-slate-200 font-mono">{p.optionals.chrome !== "N/A" ? `$${p.optionals.chrome}` : "N/A"}</td>
                <td className="p-3 text-center border-r border-slate-200 font-mono">{p.optionals.power !== "N/A" ? `$${p.optionals.power}` : "N/A"}</td>
                <td className="p-3 text-center border-r border-slate-200 font-mono">{p.optionals.bevel !== "N/A" ? `$${p.optionals.bevel}` : "N/A"}</td>
                <td className="p-3 text-center border-r border-slate-200 font-mono">{p.optionals.shelf !== "N/A" ? `$${p.optionals.shelf}` : "N/A"}</td>
                <td className="p-3 text-center text-slate-400 font-bold">{p.coo}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length > visibleCount && (
          <div className="p-6 flex justify-center bg-white">
            <button onClick={handleLoadMore} className="flex items-center gap-2 px-6 py-2 bg-[#464775] text-white rounded-md text-xs font-bold hover:bg-[#3b3c63]">
              <FiPlusCircle /> Mostrar más items ({visibleCount} de {filteredData.length})
            </button>
          </div>
        )}
      </div>

      <div className="h-10 bg-white border-t border-slate-200 flex items-center justify-between px-6 text-[10px] text-slate-400 font-bold">
        <div className="flex gap-4 uppercase">
          <span><FiPackage className="text-[#464775]" /> {filteredData.length} SKUs Catalogued</span>
          <span className="text-emerald-500"><FiCheckCircle /> Actualización en Tiempo Real Activa</span>
        </div>
        <span>LESRO_PRICE_MATRIX_V1.6</span>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 10px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F3F2F1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #C8C6C4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #464775; }
      `}</style>
    </div>
  );
};

export default IndependentLESROVisualizer;