'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as PH from "@phosphor-icons/react";
import { ChevronRight, Cpu, Boxes, Search, Package } from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';

// --- SUBCOMPONENT: STAT ITEM (ACCORDION) ---
const StatItem = ({ icon, label, value, description, isOpen, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white px-4 py-3 rounded-xl shadow-sm border cursor-pointer transition-all
      ${isOpen ? 'border-[#6264A7]/40' : 'border-slate-100 hover:border-[#6264A7]/30'}
    `}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-slate-50 text-[#6264A7] p-2 rounded-lg">
          {icon}
        </div>
        <div className="leading-tight">
          <p className="text-[9px] uppercase font-semibold text-slate-400 tracking-wider">
            {label}
          </p>
          <p className="font-semibold text-[13px] text-slate-700">
            {value}
          </p>
        </div>
      </div>
      <ChevronRight
        size={14}
        className={`transition-all text-slate-300
          ${isOpen ? 'rotate-90 text-[#6264A7]' : ''}
        `}
      />
    </div>
    <div
      className={`overflow-hidden transition-all duration-300
        ${isOpen ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'}
      `}
    >
      <p className="text-[11px] text-slate-500 leading-snug">
        {description}
      </p>
    </div>
  </div>
);

const SidebarTeams = () => {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  // --- HELPER: PARSE CSV CELL BY CELL ---
  // Esta función separa por celdas reales, ignorando comas dentro de comillas
  const parseCSVLine = (line) => {
    const result = [];
    let curVal = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(curVal.trim());
        curVal = "";
      } else {
        curVal += char;
      }
    }
    result.push(curVal.trim());
    return result;
  };

  useEffect(() => {
    const fetchCSV = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('ClientsSERVEX')
        .select('csv_raw')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data?.csv_raw) {
        const lines = data.csv_raw.replace(/\r\n/g, '\n').trim().split('\n');
        
        // Procesar encabezados por celdas
        const h = parseCSVLine(lines[0]);
        
        // Procesar filas por celdas
        const r = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          return h.reduce((acc, curr, i) => ({ ...acc, [curr]: values[i] }), {});
        });

        setHeaders(h);
        setRows(r);
      }
      setLoading(false);
    };
    fetchCSV();
  }, []);

  const filteredResult = useMemo(() => {
    if (!searchQuery || rows.length === 0) return null;
    
    const nameCol = headers.find(h => /nombre|name|producto|product/i.test(h)) || headers[0];
    const priceCol = headers.find(h => /precio|price|costo|cost/i.test(h));
    
    const found = rows.find(r => 
      r[nameCol]?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) return { name: found[nameCol], price: found[priceCol] };
    return null;
  }, [searchQuery, rows, headers]);

  if (loading) return (
    <aside className="w-[320px] bg-white border-l flex items-center justify-center h-full">
      <PH.CircleNotch size={24} className="animate-spin text-[#6264A7]" />
    </aside>
  );

  return (
    <aside className="w-[320px] bg-[#FFF] border-l border-[#EDEBE9] flex flex-col h-full font-sans text-[#242424] overflow-hidden">
      
      {/* HEADER */}
      <div className="p-4 bg-white border-b border-[#EDEBE9]">
        <div className="flex items-center gap-2 mb-1">
          <PH.ChartBarHorizontal size={20} weight="fill" className="text-[#6264A7]" />
          <h2 className="text-[14px] font-bold text-slate-700">Intelligence Panel</h2>
        </div>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Total: {rows.length} Records</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        
        {/* 1. FILTER CONTAINER */}
        <section className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Catalog Filter</h2>
            <Search size={14} className="text-slate-300" />
          </div>
          
          <div className="relative">
            <input 
              type="text"
              placeholder="Search for a product..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[12px] focus:ring-2 focus:ring-[#6264A7]/20 outline-none transition-all"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredResult ? (
            <div className="bg-[#EEF2FF] border border-[#C7D2FE] p-3 rounded-lg animate-in fade-in slide-in-from-top-1">
              <div className="flex items-start gap-2">
                <Package size={14} className="text-[#6264A7] mt-0.5" />
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-[#4338CA] leading-tight mb-1">
                    {filteredResult.name}
                  </p>
                  <div className="inline-block bg-white px-2 py-1 rounded border border-[#C7D2FE] shadow-sm">
                     <p className="text-[13px] font-black text-[#1E1B4B]">
                       ${filteredResult.price || '0.00'}
                     </p>
                  </div>
                </div>
              </div>
            </div>
          ) : searchQuery && (
            <p className="text-[10px] text-center text-slate-400 italic">No matches found</p>
          )}
        </section>

        {/* 2. INTERACTIVE STATS */}
        <div className="space-y-2">
          <StatItem
            icon={<Boxes size={16} />}
            label="CET Catalog Creator"
            value="Analyze · Structure · Edit"
            description="Specialized AI model to analyze, compare, and bulk edit CET Designer content for technical catalog management."
            isOpen={openIndex === 0}
            onClick={() => setOpenIndex(openIndex === 0 ? null : 0)}
          />
          <StatItem
            icon={<Cpu size={16} />}
            label="AI Specialist Model"
            value="CET Designer Assistance"
            description="Intelligent assistance to optimize processes within the CET ecosystem, ensuring industry standard compliance."
            isOpen={openIndex === 1}
            onClick={() => setOpenIndex(openIndex === 1 ? null : 1)}
          />
        </div>

        {/* 3. TECHNICAL SUPPORT */}
        <section>
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm flex flex-col items-center text-center">
            <div className="mb-4 relative">
              <div className="absolute inset-0 bg-[#6264A7] opacity-10 blur-xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-[#F5F6FF] to-[#EBEDFF] w-12 h-12 rounded-2xl flex items-center justify-center border border-[#6264A7]/10">
                <PH.Headset size={24} weight="duotone" className="text-[#6264A7]" />
              </div>
            </div>
            <h2 className="text-[14px] font-bold text-slate-800 leading-tight">Need technical help?</h2>
            <p className="text-slate-400 text-[10px] mt-1 mb-4">Personalized assistance for your catalogs.</p>
            <button className="bg-[#6264A7] text-white w-full py-2.5 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2">
              Contact Support <ChevronRight size={12} />
            </button>
          </div>
        </section>

        {/* 4. MAIN CTA */}
        <section className="bg-white border border-[#6264A7]/20 rounded-xl p-5 text-center shadow-sm">
          <h3 className="text-slate-800 font-bold text-[11px] mb-1 uppercase tracking-tight">Svx Copilot Pro</h3>
          <p className="text-slate-400 mb-4 text-[9px]">Scale your catalog creation now.</p>
          <button className="bg-[#F8F9FA] text-slate-700 border border-slate-200 w-full py-2 rounded-lg font-bold text-[10px] hover:bg-slate-100 transition-colors">
            Upgrade Plan
          </button>
        </section>
      </div>
    </aside>
  );
};

export default SidebarTeams;