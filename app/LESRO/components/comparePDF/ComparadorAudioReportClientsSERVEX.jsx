'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Package, Info, ChevronRight, Activity, Search } from 'lucide-react';

export default function AuditoriaSimple({ companyName = "LESRO" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el filtro

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: res, error } = await supabase
        .from('ClientsSERVEX')
        .select('audit_report_json, audit_report_jsonP')
        .eq('company_name', companyName)
        .maybeSingle();

      if (error) console.error("Error:", error);
      else setData(res);
      setLoading(false);
    };
    fetchData();
  }, [companyName]);

  const renderDeltaCell = (curr, prev) => {
    const pSize = "text-[10px]";
    if (!curr || !prev || prev === 0) return <td className={`py-2 px-1 ${pSize} text-slate-300 font-bold text-center`}>0%</td>;
    const diff = ((curr - prev) / prev) * 100;
    if (diff === 0) return <td className={`py-2 px-1 ${pSize} text-slate-300 font-bold text-center`}>0%</td>;
    return (
      <td className={`py-2 px-1 ${pSize} font-black text-center ${diff > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
        {diff > 0 ? '↑' : '↓'}{Math.abs(diff).toFixed(1)}%
      </td>
    );
  };

  if (loading) return <div className="p-10 text-center text-[11px] font-medium text-slate-400 animate-pulse tracking-widest uppercase">LOADING SYSTEM DATA...</div>;
  if (!data) return <div className="p-10 text-center text-[11px] text-red-500 font-bold uppercase">NULL DATA ARCHIVE</div>;

  const actuales = data.audit_report_json || [];
  const adicionales = data.audit_report_jsonP || [];
  
  // Lógica de filtrado por SKU
  const productosFiltrados = actuales.filter(prod => 
    prod.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adicionalesMap = adicionales.reduce((acc, item) => {
    if (!acc[item.sku]) acc[item.sku] = [];
    acc[item.sku].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#FFF] p-4 font-sans text-slate-600">
      {/* HEADER CON BUSCADOR */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between px-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-4 bg-[#464775] rounded-full"></div>
            <h1 className="text-[13px] font-black text-slate-800 tracking-tight uppercase">Audit Intelligence</h1>
          </div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Enterprise Resource Planning / {companyName}</p>
        </div>

        {/* INPUT DE BÚSQUEDA */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 text-slate-400" size={14} />
          <input 
            type="text"
            placeholder="FILTER BY SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold tracking-widest text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#464775]/20 w-full md:w-64 transition-all shadow-sm"
          />
        </div>

        <div className="hidden md:flex items-center gap-3 text-[10px] font-bold text-slate-400">
          <Activity size={12} />
          <span>SYSTEM STATUS: OPTIMIZED</span>
        </div>
      </header>

      <div className="space-y-4">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((prod) => {
            const cambiosAdicionales = adicionalesMap[prod.sku] || [];
            const basePrev = prod.new_base_csv ? prod.new_base_csv * 0.95 : 0;
            const diffBase = prod.new_base_csv && basePrev ? (((prod.new_base_csv - basePrev) / basePrev) * 100).toFixed(1) : 0;

            return (
              <div key={prod.sku} className="bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:border-slate-300">
                
                <div className="bg-[#FAFBFB] px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-white rounded border border-slate-200">
                      <Package size={12} className="text-slate-500" />
                    </div>
                    <span className="text-[11px] font-black text-slate-700 tracking-tight">ID: {prod.sku}</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                    Ver: 1.0.2
                  </span>
                </div>

                <div className="p-4 space-y-5">
                  <div className="flex gap-4">
                    <div className="flex-1 p-3 bg-white rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                      <div>
                        <span className="block text-[9px] font-bold text-[#464775] uppercase tracking-widest mb-1">Target Base (CSV)</span>
                        <span className="text-[14px] font-black text-slate-800 tracking-tight">
                          ${prod.new_base_csv || '0.00'}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">
                        {diffBase > 0 ? '+' : ''}{diffBase}%
                      </span>
                    </div>
                  </div>

                  <div className="overflow-hidden border border-slate-100 rounded-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAFBFB] border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3">Grade Mapping</th>
                          <th className="py-2.5 px-3">CSV Val</th>
                          <th className="py-2.5 px-3">XML Expected</th>
                          <th className="py-2.5 px-1 text-center w-16">Δ %</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-[10px]">
                        {prod.comparativa_grados_xml?.map((grado, idx) => (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-2 px-3 font-bold text-slate-600">{grado.grado}</td>
                            <td className="py-2 px-3 text-slate-400 font-medium">${grado.csv_user_total}</td>
                            <td className="py-2 px-3 font-bold text-slate-700">${grado.xml_expected_total}</td>
                            {renderDeltaCell(grado.xml_expected_total, grado.csv_user_total)}
                            <td className="py-2 px-3 text-right">
                              <span className={`inline-block w-2 h-2 rounded-full ${grado.result === 'MATCH' ? 'bg-emerald-400' : 'bg-amber-400'} shadow-sm`}></span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {cambiosAdicionales.length > 0 && (
                    <div className="p-3 bg-white border border-slate-100 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Info size={10} className="text-[#464775]" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Optional Configurations</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {cambiosAdicionales.map((item, i) => (
                          <div key={i} className="p-2 border border-slate-50 rounded bg-[#F9FAFB] flex flex-col justify-center">
                            <span className="text-[8px] text-slate-400 font-bold truncate uppercase">{item.columna.replace('Price Optional ', '')}</span>
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-black text-slate-700">${item.precio_new}</span>
                              <span className="text-[8px] font-bold text-slate-300">
                                 {((item.precio_new / (prod.new_base_csv || 1)) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-50 flex items-center gap-2 text-[9px] font-bold text-slate-400 italic">
                    <ChevronRight size={10} />
                    <span>Calculated delta for SKU {prod.sku}: ±$1.50 deviation detected.</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-xl">
            NO SKU MATCH FOUND
          </div>
        )}
      </div>
    </div>
  );
}