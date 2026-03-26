"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPackage, FiChevronDown, FiChevronRight, 
  FiDollarSign, FiFilter, FiCheckCircle, FiSearch 
} from 'react-icons/fi';
import { Box, Database, Download, Table as TableIcon } from "lucide-react";

const TeamsOFDAVisualizer = ({ xmlString }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const catalogData = useMemo(() => {
    if (!xmlString) return null;
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const productNodes = Array.from(xmlDoc.getElementsByTagName("Product"));
      const allFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));

      return productNodes.map((prod, idx) => {
        const sku = prod.getElementsByTagName("Code")[0]?.textContent || "N/A";
        const description = prod.getElementsByTagName("Description")[0]?.textContent || "No Description";
        const basePriceNode = prod.querySelector("Price > Value");
        const basePrice = parseFloat(basePriceNode?.textContent || "0");

        // Helper para extraer precios de opciones específicas por keywords
        const getOptionPrice = (featureKeyword, optionCode) => {
          const feat = allFeatures.find(f => {
            const fCode = f.getElementsByTagName("Code")[0]?.textContent || "";
            return fCode.includes(sku) && fCode.toUpperCase().includes(featureKeyword.toUpperCase());
          });
          if (!feat) return "N/A";
          const opt = Array.from(feat.getElementsByTagName("Option")).find(o => 
            o.getElementsByTagName("Code")[0]?.textContent === optionCode
          );
          return opt ? opt.querySelector("OptionPrice > Value")?.textContent || "0" : "N/A";
        };

        // Mapeo de columnas solicitado
        return {
          id: idx,
          sku,
          description,
          basePrice: basePrice > 0 ? basePrice.toFixed(2) : "N/A",
          // Grados (Buscamos en features que contengan UPH o GRADE)
          grades: {
            g02: getOptionPrice("GRADE", "GRD2") || getOptionPrice("GRADE", "GRADE2"),
            g03: getOptionPrice("GRADE", "GRD3") || getOptionPrice("GRADE", "GRADE3"),
            g04: getOptionPrice("GRADE", "GRD4") || getOptionPrice("GRADE", "GRADE4"),
            g05: getOptionPrice("GRADE", "GRD5") || getOptionPrice("GRADE", "GRADE5"),
            g06: getOptionPrice("GRADE", "GRD6") || getOptionPrice("GRADE", "GRADE6"),
            g07: getOptionPrice("GRADE", "GRD7") || getOptionPrice("GRADE", "GRADE7"),
            g08: getOptionPrice("GRADE", "GRD8") || getOptionPrice("GRADE", "GRADE8"),
            g09: getOptionPrice("GRADE", "GRD9") || getOptionPrice("GRADE", "GRADE9"),
            g10: getOptionPrice("GRADE", "GRD10") || getOptionPrice("GRADE", "GRADE10"),
            g11: getOptionPrice("GRADE", "GRD11") || getOptionPrice("GRADE", "GRADE11"),
            g12: getOptionPrice("GRADE", "GRD12") || getOptionPrice("GRADE", "GRADE12"),
            g13: getOptionPrice("GRADE", "GRD13") || getOptionPrice("GRADE", "GRADE13"),
          },
          // Opciones Especiales
          options: {
            polyArm: getOptionPrice("ARMPAD", "APU") || getOptionPrice("ARMCAP", "APU"),
            solidArm: getOptionPrice("ARMPAD", "SS") || getOptionPrice("ARMCAP", "SS"),
            casters: getOptionPrice("CASTER", "CSTR"),
            tablet: getOptionPrice("TABLET", "TAB"),
            power: getOptionPrice("POWER", "PWR"),
          },
          origin: "US"
        };
      });
    } catch (err) {
      console.error("XML Parse Error:", err);
      return [];
    }
  }, [xmlString]);

  const filteredData = useMemo(() => {
    return catalogData?.filter(p => p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [catalogData, searchTerm]);

  if (!catalogData) return (
    <div className="flex flex-col items-center justify-center p-20 bg-white rounded-xl border border-[#EDEBE9]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }} className="text-[#464775] mb-4">
        <Database size={40} strokeWidth={1.5} />
      </motion.div>
      <p className="text-[#242424] font-bold text-sm">Parsing LESRO XML Structure...</p>
      <p className="text-gray-400 text-[11px] mt-1">Extracting pricing matrix and upholstery grades</p>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-[#F3F2F1] text-[#242424] font-sans overflow-hidden">
      
      {/* HEADER TIPO EXCEL/TEAMS */}
      <div className="h-14 bg-white border-b border-[#EDEBE9] flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#464775] flex items-center justify-center text-white shadow-sm">
            <TableIcon size={18} />
          </div>
          <div>
            <h2 className="font-bold text-[13px] text-[#242424] uppercase tracking-tight">XML Audit Matrix: LESRO</h2>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Dynamic PIM Mapping Active
            </p>
          </div>
        </div>

        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text"
            placeholder="Search SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-[#F3F2F1] border border-transparent focus:bg-white focus:border-[#464775] rounded text-[11px] w-64 transition-all outline-none font-medium"
          />
        </div>
      </div>

      {/* TABLA MAESTRA */}
      <div className="flex-1 overflow-auto bg-white custom-scrollbar">
        <table className="w-full text-left border-collapse table-fixed min-w-[1800px]">
          <thead className="sticky top-0 z-20">
            <tr className="bg-[#FAF9F8] text-[10px] font-black text-[#464775] border-b border-[#EDEBE9] uppercase tracking-wider">
              <th className="p-3 w-32 sticky left-0 bg-[#FAF9F8] border-r border-[#EDEBE9]">ID (SKU)</th>
              <th className="p-3 w-64 border-r border-[#EDEBE9]">Product Description</th>
              <th className="p-3 w-28 text-center border-r border-[#EDEBE9] bg-[#F1F3F9]">Base Price</th>
              {/* Grados */}
              {[2,3,4,5,6,7,8,9,10,11,12,13].map(g => (
                <th key={g} className="p-3 w-24 text-center border-r border-[#EDEBE9]">Grade {g < 10 ? `0${g}` : g}</th>
              ))}
              {/* Opciones */}
              <th className="p-3 w-32 text-center border-r border-[#EDEBE9]">Opt. Poly Arm</th>
              <th className="p-3 w-32 text-center border-r border-[#EDEBE9]">Opt. Solid Arm</th>
              <th className="p-3 w-28 text-center border-r border-[#EDEBE9]">Casters</th>
              <th className="p-3 w-28 text-center border-r border-[#EDEBE9]">Power</th>
              <th className="p-3 w-20 text-center">COO</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {filteredData.map((p) => (
              <tr key={p.id} className="border-b border-[#F3F2F1] hover:bg-[#F9F9F9] transition-colors group">
                <td className="p-3 font-black text-[#464775] sticky left-0 bg-white group-hover:bg-[#F9F9F9] border-r border-[#EDEBE9]">
                  {p.sku}
                </td>
                <td className="p-3 text-gray-500 font-medium border-r border-[#EDEBE9] truncate">
                  {p.description}
                </td>
                <td className="p-3 text-center border-r border-[#EDEBE9] font-bold bg-[#F1F3F9]/30">
                  {p.basePrice !== "N/A" ? `$${p.basePrice}` : "N/A"}
                </td>
                {/* Render de Grados */}
                {Object.values(p.grades).map((val, i) => (
                  <td key={i} className={`p-3 text-center border-r border-[#EDEBE9] font-mono ${val === "N/A" ? 'text-gray-300' : 'text-emerald-600 font-bold'}`}>
                    {val !== "N/A" ? (val === "0" ? "Incl." : `+$${val}`) : "—"}
                  </td>
                ))}
                {/* Opciones Especiales */}
                <td className="p-3 text-center border-r border-[#EDEBE9] font-mono text-blue-600 font-semibold">
                   {p.options.polyArm !== "N/A" ? `+$${p.options.polyArm}` : "—"}
                </td>
                <td className="p-3 text-center border-r border-[#EDEBE9] font-mono text-blue-600 font-semibold">
                   {p.options.solidArm !== "N/A" ? `+$${p.options.solidArm}` : "—"}
                </td>
                <td className="p-3 text-center border-r border-[#EDEBE9] font-mono">
                   {p.options.casters !== "N/A" ? `+$${p.options.casters}` : "—"}
                </td>
                <td className="p-3 text-center border-r border-[#EDEBE9] font-mono">
                   {p.options.power !== "N/A" ? `+$${p.options.power}` : "—"}
                </td>
                <td className="p-3 text-center text-gray-400 font-bold">
                  {p.origin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="h-10 bg-white border-t border-[#EDEBE9] flex items-center justify-between px-6 shrink-0 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><FiPackage className="text-[#464775]" /> {filteredData.length} Products in Matrix</span>
          <span className="flex items-center gap-2"><FiCheckCircle className="text-emerald-500" /> Audit Ready</span>
        </div>
        <div className="flex items-center gap-2 text-[#464775]">
          <Database size={12} /> SUPABASE SYNCED
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F3F2F1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #C8C6C4; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #464775; }
      `}</style>
    </div>
  );
};

export default TeamsOFDAVisualizer;