'use client';

import React, { useEffect, useState, useMemo } from 'react';
import * as PH from "@phosphor-icons/react";
import { supabase } from '@/app/lib/supabaseClient';

const SidebarRight = () => {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // Controla qué item está abierto

  useEffect(() => {
    const fetchCSV = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('ClientsSERVEX')
        .select('csv_raw, created_at')
        .order('created_at', { ascending: false })
        .single();

      if (error || !data?.csv_raw) {
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

  const parseCSV = (csv) => {
    if (!csv) return [];
    const lines = csv.replace(/\r\n/g, '\n').trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
      return {
        id: `item-${index}`,
        data: headers.reduce((acc, h, i) => {
          acc[h] = values[i] ?? '';
          return acc;
        }, {})
      };
    });
  };

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    return rows.filter(r =>
      Object.values(r.data).some(val =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [rows, search]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <aside className="w-full sm:w-64 lg:w-80 bg-[#FFFFFF] border-l border-[#EDEBE9] flex flex-col h-full overflow-hidden font-sans">
      
      {/* HEADER TIPO TEAMS */}
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-[12px] font-bold text-[#242424] flex items-center gap-2">
          <PH.Package weight="bold" className="text-[#464775]" />
          Catálogo de Productos
        </h3>
        <span className="text-[10px] bg-[#F3F2F1] px-2 py-0.5 rounded text-[#605E5C] font-medium">
          {filteredRows.length}
        </span>
      </div>

      {/* SEARCH BAR */}
      <div className="px-4 pb-4">
        <div className="relative group">
          <PH.MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#605E5C] group-focus-within:text-[#464775]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por código..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF9F8] border-b border-[#EDEBE9] focus:border-[#464775] text-[12px] outline-none transition-all placeholder:text-[#A19F9D]"
          />
        </div>
      </div>

      {/* LISTA DINÁMICA */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <PH.CircleNotch size={20} className="animate-spin text-[#464775]" />
          </div>
        ) : (
          filteredRows.map((row) => {
            const isExpanded = expandedId === row.id;
            const entries = Object.entries(row.data);
            const productCode = entries[0][1]; // Asumimos que la primera columna es el código

            return (
              <div 
                key={row.id}
                className={`group rounded-md border transition-all duration-200 ${
                  isExpanded ? 'border-[#464775]/30 bg-[#FAF9F8]' : 'border-transparent hover:bg-[#F3F2F1]'
                }`}
              >
                {/* CABECERA DEL ITEM (SIEMPRE VISIBLE) */}
                <button
                  onClick={() => toggleExpand(row.id)}
                  className="w-full flex items-center gap-3 p-2.5 text-left"
                >
                  <PH.CaretRight 
                    size={12} 
                    weight="bold"
                    className={`text-[#605E5C] transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[#464775]' : ''}`} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] font-semibold truncate ${isExpanded ? 'text-[#464775]' : 'text-[#242424]'}`}>
                      {productCode}
                    </p>
                  </div>
                  {!isExpanded && (
                    <PH.Info size={14} className="opacity-0 group-hover:opacity-100 text-[#A19F9D]" />
                  )}
                </button>

                {/* CONTENIDO DESPLEGABLE */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="h-[1px] bg-[#EDEBE9] mb-2" />
                    {entries.slice(1).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-wider text-[#605E5C] font-bold">
                          {key}
                        </span>
                        <span className="text-[11px] text-[#242424] break-words">
                          {value || '—'}
                        </span>
                      </div>
                    ))}
                    <button className="w-full mt-2 py-1.5 bg-[#464775] text-white text-[10px] font-semibold rounded hover:bg-[#3b3c63] transition-colors flex items-center justify-center gap-2">
                      <PH.Copy size={12} />
                      Copiar Referencia
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 bg-[#F3F2F1]/50 border-t border-[#EDEBE9]">
        <div className="flex items-start gap-2">
          <PH.Lightbulb size={16} className="text-[#464775] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#605E5C] leading-relaxed">
            Haz clic en un código para ver los detalles técnicos y disponibilidad.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default SidebarRight;