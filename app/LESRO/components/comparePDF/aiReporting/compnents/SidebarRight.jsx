'use client';

import React, { useEffect, useState, useMemo } from 'react';
import * as PH from "@phosphor-icons/react";
import { supabase } from '@/app/lib/supabaseClient';

const SidebarRight = () => {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // ===============================
  // FETCH CSV FROM SUPABASE
  // ===============================
  useEffect(() => {
    const fetchCSV = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('ClientsSERVEX')
        .select('csv_raw, created_at')
        .order('created_at', { ascending: false })
        .single(); // ✅ NO limit()

      if (error) {
        console.error('❌ Supabase error:', error);
        setRows([]);
        setLoading(false);
        return;
      }

      if (!data?.csv_raw) {
        console.warn('⚠️ csv_raw está vacío');
        setRows([]);
        setLoading(false);
        return;
      }

      const parsed = parseCSV(data.csv_raw);
      setRows(parsed);
      setLoading(false);
    };

    fetchCSV();
  }, []);

  // ===============================
  // CSV PARSER (ROBUSTO PARA CSV REAL)
  // ===============================
  const parseCSV = (csv) => {
    if (!csv) return [];

    const lines = csv
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim()
      .split('\n');

    if (lines.length <= 1) return [];

    const headers = lines[0]
      .split(',')
      .map(h => h.replace(/^"|"$/g, '').trim());

    return lines.slice(1).map((line, index) => {
      const values = line
        .split(',')
        .map(v => v.replace(/^"|"$/g, '').trim());

      return {
        id: index,
        data: headers.reduce((acc, h, i) => {
          acc[h] = values[i] ?? '';
          return acc;
        }, {})
      };
    });
  };

  // ===============================
  // FILTER
  // ===============================
  const filteredRows = useMemo(() => {
    if (!search) return rows;

    return rows.filter(r =>
      Object.values(r.data).some(val =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [rows, search]);

  return (
    <aside
      className="
        w-full sm:w-64 lg:w-72
        bg-[#FFFFFF] border-l border-[#EDEBE9]
        p-4 flex flex-col h-full
        overflow-hidden
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[11px] uppercase tracking-widest text-[#242424]">
          AI Catalog
        </h3>
        <PH.Database size={16} className="text-[#605E5C]" />
      </div>

      {/* SEARCH */}
      <div className="relative mb-4">
        <PH.MagnifyingGlass
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A19F9D]"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en catálogo..."
          className="
            w-full pl-9 pr-3 py-2
            bg-[#FAF9F8]
            border border-[#EDEBE9]
            focus:border-[#464775]
            rounded-lg text-[11px]
            outline-none transition-all
          "
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-[#605E5C]">
            <PH.CircleNotch size={24} className="animate-spin mb-2" />
            <span className="text-[10px] font-semibold">
              Cargando catálogo…
            </span>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="text-center text-[10px] text-[#A19F9D] py-10">
            No hay resultados
          </div>
        ) : (
          filteredRows.map((row, index) => {
            const primaryValue =
              Object.values(row.data)[0] || 'Registro';

            return (
              <div
                key={row.id}
                onClick={() => setSelectedIndex(index)}
                className={`
                  flex items-center gap-3
                  px-3 py-2 rounded-lg cursor-pointer
                  transition-all
                  ${
                    selectedIndex === index
                      ? 'bg-[#464775]/5 border border-[#464775]/30'
                      : 'hover:bg-[#F3F2F1]'
                  }
                `}
              >
                <div
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center
                    ${
                      selectedIndex === index
                        ? 'bg-[#464775]/10'
                        : 'bg-white border border-[#EDEBE9]'
                    }
                  `}
                >
                  <PH.FileText
                    size={12}
                    className={
                      selectedIndex === index
                        ? 'text-[#464775]'
                        : 'text-[#A19F9D]'
                    }
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[#242424] truncate">
                    {primaryValue}
                  </p>
                  <p className="text-[9px] text-[#605E5C] truncate">
                    {Object.keys(row.data).length} campos
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-4 p-3 bg-[#F3F2F1] rounded-lg border border-[#EDEBE9]">
        <p className="text-[9px] text-[#605E5C] flex gap-2 leading-tight">
          <PH.Info size={12} className="text-[#464775] shrink-0" />
          Selecciona un elemento del catálogo para usarlo como contexto IA.
        </p>
      </div>
    </aside>
  );
};

export default SidebarRight;
