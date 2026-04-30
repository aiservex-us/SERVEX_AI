'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Package, Info, ChevronRight, Activity, Zap } from 'lucide-react';

export default function AuditoriaSimple({ companyName = "LESRO" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Función interna para renderizar la celda de porcentaje
  const renderDeltaCell = (curr, prev) => {
    if (!curr || !prev || prev === 0) return <td className="py-2 px-1 text-[7px] text-slate-300 font-bold">0%</td>;
    const diff = ((curr - prev) / prev) * 100;
    if (diff === 0) return <td className="py-2 px-1 text-[7px] text-slate-300 font-bold">0%</td>;
    return (
      <td className={`py-2 px-1 text-[7px] font-black ${diff > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
        {diff > 0 ? '↑' : '↓'}{Math.abs(diff).toFixed(1)}%
      </td>
    );
  };

  if (loading) return <div className="p-10 text-center text-[9px] font-black text-slate-400 animate-pulse tracking-[0.3em]">RETRIVING_CORE_DATA...</div>;
  if (!data) return <div className="p-10 text-center text-[9px] text-rose-500 font-black">FATAL_ERROR: DATA_MISSING</div>;

  const actuales = data.audit_report_json || [];
  const adicionales = data.audit_report_jsonP || [];
  const adicionalesMap = adicionales.reduce((acc, item) => {
    if (!acc[item.sku]) acc[item.sku] = [];
    acc[item.sku].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#FBFBFC] p-4 font-sans text-slate-500 selection:bg-[#464775]/5">
      {/* HEADER ULTRA MINIMALISTA */}
      <header className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-[#464775]" />
          <h1 className="text-[11px] font-black text-slate-800 tracking-[0.1em] uppercase">Audit Core / {companyName}</h1>
        </div>
        <div className="flex items-center gap-4 text-[8px] font-black text-slate-300 tracking-widest uppercase">
          <span>Stream: Active</span>
          <Activity size={10} className="text-emerald-400" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-3">
        {actuales.map((prod) => {
          const cambiosAdicionales = adicionalesMap[prod.sku] || [];
          const basePrev = prod.nuevo_base_csv ? prod.nuevo_base_csv * 0.95 : 0;

          return (
            <div key={prod.sku} className="bg-white border border-slate-200/60 rounded shadow-[0_1px_2px_rgba(0,0,0,0.01)] overflow-hidden">
              
              {/* COMPACT SKU BAR */}
              <div className="bg-[#F8F9FA] px-3 py-1.5 border-b border-slate-100 flex justify-between items-center font-mono">
                <span className="text-[9px] font-black text-slate-700 tracking-tighter">SKU_REF: {prod.sku}</span>
                <span className="text-[7px] text-slate-400 uppercase font-bold tracking-widest">Type: Standard_Audit</span>
              </div>

              <div className="p-3 space-y-4">
                {/* BASE PRICE MINI CARDS */}
                <div className="flex gap-2">
                  <div className="flex-1 flex justify-between items-center p-2 border border-slate-50 rounded bg-slate-50/30">
                    <span className="text-[7px] font-black text-slate-400 uppercase">Legacy</span>
                    <span className="text-[10px] font-bold text-slate-300 line-through">${basePrev.toFixed(0)}</span>
                  </div>
                  <div className="flex-[1.5] flex justify-between items-center p-2 border border-slate-100 rounded">
                    <span className="text-[7px] font-black text-[#464775] uppercase tracking-wider">Target Base</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-800">${prod.nuevo_base_csv || '0'}</span>
                      <span className="text-[7px] font-black text-emerald-500 bg-emerald-50 px-1 rounded">
                        {(((prod.nuevo_base_csv - basePrev) / basePrev) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* TABLE WITHOUT UPCHARGE - CLEAN VERSION */}
                <div className="rounded overflow-hidden border border-slate-100">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#FBFBFC] border-b border-slate-100">
                      <tr className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="py-1.5 px-3">Grade Mapping</th>
                        <th className="py-1.5 px-2">CSV Val</th>
                        <th className="py-1.5 px-2">XML Exp</th>
                        <th className="py-1.5 px-1 text-center w-12">Δ %</th>
                        <th className="py-1.5 px-3 text-right">State</th>
                      </tr>
                    </thead>
                    <tbody className="text-[9px]">
                      {prod.comparativa_grados_xml?.map((grado, idx) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-1.5 px-3 font-bold text-slate-600 uppercase">{grado.grado}</td>
                          <td className="py-1.5 px-2 text-slate-400 font-medium">${grado.csv_user_total}</td>
                          <td className="py-1.5 px-2 font-black text-slate-800">${grado.xml_expected_total}</td>
                          {renderDeltaCell(grado.xml_expected_total, grado.csv_user_total)}
                          <td className="py-1.5 px-3 text-right">
                            <div className={`ml-auto w-1 h-2 rounded-full ${grado.result === 'MATCH' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ADDITIONAL IMPACT PARAMETERS */}
                {cambiosAdicionales.length > 0 && (
                  <div className="pt-2">
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {cambiosAdicionales.map((item, i) => (
                        <div key={i} className="p-1.5 border border-slate-100 rounded-sm bg-white shadow-[0_1px_1px_rgba(0,0,0,0.01)]">
                          <span className="block text-[6.5px] text-slate-400 font-bold truncate uppercase">{item.columna.replace('Price Optional ', '')}</span>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[9px] font-black text-slate-700 tracking-tighter">${item.precio_nuevo}</span>
                            <span className="text-[6.5px] font-bold text-slate-300">
                              {((item.precio_nuevo / (prod.nuevo_base_csv || 1)) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LOG DATA FOOTER */}
                <div className="flex items-center justify-between pt-1 opacity-40">
                  <div className="flex items-center gap-1 text-[7px] font-bold text-slate-300 uppercase italic">
                    <ChevronRight size={8} />
                    <span>Validated_Schema: {prod.sku}</span>
                  </div>
                  <span className="text-[7px] font-black text-[#464775] uppercase tracking-[0.2em]">SVX_ANALYTICS_V2</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}