'use client';

import React, { useEffect, useState, useMemo } from 'react';
import * as PH from "@phosphor-icons/react";
import { ChevronRight, Cpu, Boxes, Search, Package } from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';

// --- SUBCOMPONENT: STAT ITEM (SIEMPRE ABIERTO Y COLOR ACTUALIZADO) ---
const StatItem = ({ icon, label, value, description }) => (
  <div
    className="bg-white px-3 py-3 rounded-lg shadow-sm border border-[#464775]/20 transition-all"
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="bg-[#464775]/10 text-[#464775] p-1.5 rounded-md">
          {React.cloneElement(icon, { size: 14 })}
        </div>
        <div className="leading-tight">
          <p className="text-[8px] uppercase font-semibold text-slate-400 tracking-wider">
            {label}
          </p>
          <p className="font-semibold text-[11px] text-slate-700">
            {value}
          </p>
        </div>
      </div>
      <ChevronRight size={12} className="rotate-90 text-[#464775]/50" />
    </div>
    
    <div className="opacity-100">
      <p className="text-[10px] text-slate-500 leading-snug border-t pt-2 border-slate-50 italic">
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

  const parseCSVLine = (line) => {
    const result = [];
    let curVal = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        result.push(curVal.trim());
        curVal = "";
      } else curVal += char;
    }
    result.push(curVal.trim());
    return result;
  };

  useEffect(() => {
    const fetchCSV = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ClientsSERVEX')
          .select('csv_raw')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && data?.csv_raw) {
          const lines = data.csv_raw.replace(/\r\n/g, '\n').trim().split('\n');
          const h = parseCSVLine(lines[0]);
          const r = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            return h.reduce((acc, curr, i) => ({ ...acc, [curr]: values[i] }), {});
          });
          setHeaders(h);
          setRows(r);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };
    fetchCSV();
  }, []);

  const filteredResult = useMemo(() => {
    if (!searchQuery || rows.length === 0) return null;
    const nameCol = headers.find(h => /nombre|name|producto|product/i.test(h)) || headers[0];
    const found = rows.find(r => r[nameCol]?.toLowerCase().includes(searchQuery.toLowerCase()));
    return found ? { name: found[nameCol] } : null;
  }, [searchQuery, rows, headers]);

  if (loading) return (
    <aside className="w-[230px] bg-white border-l flex items-center justify-center h-full">
      <PH.CircleNotch size={20} className="animate-spin text-[#464775]" />
    </aside>
  );

  return (
    <aside className="w-[230px] bg-[#FFF] border-l border-[#EDEBE9] flex flex-col h-full font-sans text-[#242424] overflow-hidden">
      
      {/* HEADER */}
      <div className="p-3 bg-white border-b border-[#EDEBE9]">
        <div className="flex items-center gap-2 mb-0.5">
          <PH.ChartBarHorizontal size={16} weight="fill" className="text-[#464775]" />
          <h2 className="text-[12px] font-bold text-slate-700">Intelligence</h2>
        </div>
        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tight">{rows.length} Records</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        
        {/* 1. FILTER CONTAINER */}
        <section className="bg-white rounded-lg p-3 shadow-sm border border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Filter</h2>
            <Search size={12} className="text-slate-300" />
          </div>
          
          <input 
            type="text"
            placeholder="Search..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-[11px] outline-none focus:border-[#464775]/50 transition-colors"
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {filteredResult && (
            <div className="bg-[#FAF9F8] border border-[#464775]/20 p-2 rounded-md animate-in fade-in duration-200">
              <div className="flex items-start gap-1.5">
                <Package size={12} className="text-[#464775] mt-0.5" />
                <p className="text-[10px] font-bold text-[#464775] leading-tight truncate">
                  {filteredResult.name}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* 2. INTERACTIVE STATS */}
        <div className="space-y-3">
      
          <StatItem
            icon={<Cpu />}
            label="Specialist"
            value="CET Assistance"
            description="Intelligent assistance to optimize processes within CET."
          />
        </div>

        {/* 3. TECHNICAL SUPPORT */}
        <section>
          <div className="bg-white border border-slate-200 rounded-[1rem] p-4 shadow-sm flex flex-col items-center text-center">
            <div className="mb-2 relative bg-[#FAF9F8] w-9 h-9 rounded-xl flex items-center justify-center border border-[#464775]/10">
              <PH.Headset size={18} weight="duotone" className="text-[#464775]" />
            </div>
            <h2 className="text-[12px] font-bold text-slate-800 leading-tight">Technical help?</h2>
            <p className="text-slate-400 text-[9px] mt-0.5 mb-3">Personalized assistance.</p>
            <button className="bg-[#464775] text-white w-full py-2 rounded-lg font-bold text-[9px] flex items-center justify-center gap-1 hover:bg-[#3b3c63] transition-colors shadow-sm">
              Contact <ChevronRight size={10} />
            </button>
          </div>
        </section>

        {/* 4. MAIN CTA */}
        <section className="bg-white border border-[#464775]/20 rounded-lg p-3 text-center shadow-sm">
          <h3 className="text-slate-800 font-bold text-[10px] mb-0.5 uppercase tracking-tight">Svx Copilot</h3>
          <p className="text-slate-400 mb-2 text-[8px]">Scale your creation.</p>
          <button className="bg-[#F8F9FA] text-[#464775] border border-slate-200 w-full py-1.5 rounded-md font-bold text-[9px] hover:bg-slate-100 transition-colors">
            Upgrade
          </button>
        </section>
      </div>
    </aside>
  );
};

export default SidebarTeams;