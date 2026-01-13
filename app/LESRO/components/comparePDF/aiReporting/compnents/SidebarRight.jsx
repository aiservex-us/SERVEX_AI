'use client';

import React, { useEffect, useState, useMemo } from 'react';
import * as PH from "@phosphor-icons/react";
import { supabase } from '@/app/lib/supabaseClient';

const SidebarTeams = () => {
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [rawCSV, setRawCSV] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [multiplier, setMultiplier] = useState(1);
  const [copied, setCopied] = useState(false);

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
        setRawCSV(data.csv_raw);
        const lines = data.csv_raw.replace(/\r\n/g, '\n').trim().split('\n');
        const h = lines[0].split(',').map(v => v.replace(/^"|"$/g, '').trim());
        const r = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
          return h.reduce((acc, curr, i) => ({ ...acc, [curr]: values[i] }), {});
        });
        setHeaders(h);
        setRows(r);
      }
      setLoading(false);
    };
    fetchCSV();
  }, []);

  const analysis = useMemo(() => {
    if (!rows.length) return null;
    const priceCol = headers.find(h => /precio|price|costo/i.test(h));
    const nameCol = headers.find(h => /nombre|name|producto/i.test(h)) || headers[0];
    const validPrices = rows.map(r => parseFloat(r[priceCol])).filter(p => !isNaN(p));
    const avg = validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
    
    const searchResult = searchQuery 
      ? rows.find(r => r[nameCol]?.toLowerCase().includes(searchQuery.toLowerCase()))
      : null;

    return { priceCol, nameCol, avg, total: rows.length, searchResult };
  }, [rows, headers, searchQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCSV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <aside className="w-[300px] border-l border-[#EDEBE9] bg-[#FFF] flex items-center justify-center h-full">
      <PH.CircleNotch size={24} className="animate-spin text-[#5B5FC7]" />
    </aside>
  );

  return (
    <aside className="w-[300px] bg-[#FFF] border-l border-[#EDEBE9] flex flex-col h-full font-sans text-[#242424]">
      
      {/* HEADER TIPO TEAMS */}
      <div className="p-4 bg-white border-b border-[#EDEBE9]">
        <div className="flex items-center gap-2 mb-3">
          <PH.ChartBarHorizontal size={20} weight="fill" className="text-[#5B5FC7]" />
          <h2 className="text-[14px] font-semibold">Análisis de Catálogo</h2>
        </div>
        
        {/* BUSCADOR FLUENT */}
        <div className="relative group">
          <input 
            type="text"
            placeholder="Buscar en datos..."
            className="w-full pl-3 pr-8 py-1.5 bg-white border border-[#E0E0E0] border-b-[#616161] rounded-sm text-[12px] focus:outline-none focus:border-b-[#5B5FC7] transition-all"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <PH.MagnifyingGlass size={14} className="absolute right-2.5 top-2.5 text-[#616161]" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* RESULTADO DE BÚSQUEDA */}
        {analysis?.searchResult && (
          <div className="bg-white border border-[#EDEBE9] rounded-md p-3 shadow-sm">
            <div className="text-[10px] text-[#616161] uppercase font-bold mb-1">Coincidencia</div>
            <div className="text-[12px] font-semibold truncate">{analysis.searchResult[analysis.nameCol]}</div>
            <div className="text-[14px] font-bold text-[#5B5FC7] mt-1">
              ${parseFloat(analysis.searchResult[analysis.priceCol]).toLocaleString()}
            </div>
          </div>
        )}

        {/* MÉTRICAS RÁPIDAS */}
        <div className="space-y-3">
          <SectionTitle title="Métricas clave" />
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="Registros" value={analysis?.total} />

          </div>
        </div>

        

        {/* INSPECTOR DE CSV RAW (EL CONTENEDOR QUE PEDISTE) */}
        <div className="space-y-2 flex flex-col h-64">
          <div className="flex justify-between items-center">
            <SectionTitle title="Origen de datos (CSV)" />
            <button 
              onClick={handleCopy}
              className="text-[11px] text-[#5B5FC7] hover:bg-[#EBEBEB] px-2 py-0.5 rounded transition-colors flex items-center gap-1"
            >
              {copied ? <PH.CheckCircle size={14} weight="fill" /> : <PH.Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          
          <div className="flex-1 bg-[#FFF] rounded border border-[#3D3D3D] flex flex-col overflow-hidden">
            {/* Header del mini terminal */}
            <div className="bg-[#FFF] px-3 py-1.5 flex items-center justify-between border-b border-[#3D3D3D]">
              <span className="text-[10px] text-[#979696] font-mono">csv_raw_data.log</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#FF5F56]"></div>
                <div className="w-2 h-2 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-2 h-2 rounded-full bg-[#27C93F]"></div>
              </div>
            </div>
            {/* Contenido */}
            <div className="p-3 overflow-auto custom-scrollbar h-full">
              <pre className="text-[11px] font-mono text-[#b3b1b1] leading-relaxed">
                {rawCSV}
              </pre>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-[#EDEBE9] bg-[#F5F5F5]">
        <p className="text-[10px] text-[#616161] text-center">
          Interpretación generada por <strong>IA de ServeX</strong>
        </p>
      </div>
    </aside>
  );
};

// Subcomponente: Títulos de sección estilo Teams
const SectionTitle = ({ title }) => (
  <h4 className="text-[11px] font-bold text-[#616161] uppercase tracking-tight">{title}</h4>
);

// Subcomponente: Cards de métricas
const MetricCard = ({ label, value }) => (
  <div className="bg-white border border-[#EDEBE9] p-2.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
    <div className="text-[10px] text-[#616161] mb-0.5">{label}</div>
    <div className="text-[14px] font-bold text-[#242424]">{value}</div>
  </div>
);

export default SidebarTeams;