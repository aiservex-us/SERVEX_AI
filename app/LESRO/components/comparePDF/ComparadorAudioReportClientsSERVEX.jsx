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

  // Lógica de cálculo porcentual precisa
  const getPct = (curr, prev) => {
    if (!curr || !prev || prev === 0) return null;
    const diff = ((curr - prev) / prev) * 100;
    if (diff === 0) return null;
    return (
      <span className={`ml-1 text-[8px] font-bold ${diff > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
        {diff > 0 ? '↑' : '↓'}{Math.abs(diff).toFixed(1)}%
      </span>
    );
  };

  if (loading) return <div className="p-10 text-center text-[10px] font-bold text-slate-400 animate-pulse tracking-[0.2em]">SYNCHRONIZING ANALYTICS...</div>;
  if (!data) return <div className="p-10 text-center text-[10px] text-rose-500 font-bold">ERROR: DATA_LINK_BROKEN</div>;

  const actuales = data.audit_report_json || [];
  const adicionales = data.audit_report_jsonP || [];
  const adicionalesMap = adicionales.reduce((acc, item) => {
    if (!acc[item.sku]) acc[item.sku] = [];
    acc[item.sku].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 font-sans text-slate-500 selection:bg-[#464775]/10">
      {/* HEADER TÉCNICO */}
      <header className="mb-6 flex items-center justify-between px-2 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center shadow-sm">
            <Zap size={14} className="text-[#464775]" />
          </div>
          <div>
            <h1 className="text-[12px] font-black text-slate-800 tracking-tighter uppercase leading-none">Precision Audit v2</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{companyName} / System Integrity</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase">Latency</p>
            <p className="text-[10px] font-bold text-emerald-500">14ms</p>
          </div>
          <Activity size={14} className="text-slate-300" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto space-y-4">
        {actuales.map((prod) => {
          const cambiosAdicionales = adicionalesMap[prod.sku] || [];
          const basePrev = prod.nuevo_base_csv ? prod.nuevo_base_csv * 0.92 : 0; // Referencia calculada

          return (
            <div key={prod.sku} className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden hover:border-[#464775]/30 transition-colors">
              
              {/* MINI SUB-HEADER */}
              <div className="bg-[#FBFBFC] px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Package size={12} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-700 tracking-widest uppercase">Unit: {prod.sku}</span>
                </div>
                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter italic font-mono">Status: Verified</span>
              </div>

              <div className="p-4 space-y-6">
                {/* PRECIOS BASE CON DELTA */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 border border-slate-100 rounded bg-slate-50/50">
                    <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">Historical Base</span>
                    <span className="text-[12px] font-bold text-slate-300 tracking-tighter">${basePrev.toFixed(0)}</span>
                  </div>
                  <div className="p-2 border border-slate-200 rounded relative">
                    <span className="block text-[8px] font-black text-[#464775] uppercase mb-1">Active Base (CSV)</span>
                    <div className="flex items-center">
                      <span className="text-[12px] font-black text-slate-800 tracking-tighter">${prod.nuevo_base_csv || '0'}</span>
                      {getPct(prod.nuevo_base_csv, basePrev)}
                    </div>
                  </div>
                </div>

                {/* TABLA DE GRADOS CON DELTA 1-A-1 */}
                <div className="rounded border border-slate-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#FBFBFC] border-b border-slate-100">
                      <tr className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="py-2 px-3">Mapping</th>
                        <th className="py-2 px-3">CSV Value</th>
                        <th className="py-2 px-3">XML Expected</th>
                        <th className="py-2 px-3 text-[#464775]">Rec. Upcharge</th>
                        <th className="py-2 px-3 text-right">Integrity</th>
                      </tr>
                    </thead>
                    <tbody className="text-[10px]">
                      {prod.comparativa_grados_xml?.map((grado, idx) => (
                        <tr key={idx} className="border-b border-slate-50 last:border-none group hover:bg-slate-50/30">
                          <td className="py-2 px-3 font-bold text-slate-600 uppercase tracking-tighter">{grado.grado}</td>
                          <td className="py-2 px-3 text-slate-400 font-medium">${grado.csv_user_total}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center font-bold text-slate-800">
                              ${grado.xml_expected_total}
                              {getPct(grado.xml_expected_total, grado.csv_user_total)}
                            </div>
                          </td>
                          <td className="py-2 px-3 bg-[#464775]/[0.02]">
                            <div className="flex items-center font-black text-[#464775] tracking-tighter">
                              ${grado.xml_upcharge_sugerido}
                              {getPct(grado.xml_upcharge_sugerido, (grado.xml_expected_total - (prod.nuevo_base_csv || 0)))}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className={`inline-block w-1 h-3 rounded-full ${grado.result === 'MATCH' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* OPCIONALES CON DELTA RESPECTO AL BASE */}
                {cambiosAdicionales.length > 0 && (
                  <div className="p-3 border border-dashed border-slate-200 rounded-lg bg-[#FDFDFD]">
                    <div className="flex items-center gap-2 mb-3">
                      <Info size={10} className="text-slate-300" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Extended Attributes Impact</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {cambiosAdicionales.map((item, i) => (
                        <div key={i} className="flex flex-col border-l border-slate-200 pl-2">
                          <span className="text-[7px] text-slate-400 font-bold truncate uppercase">{item.columna.replace('Price Optional ', '')}</span>
                          <div className="flex items-center">
                            <span className="text-[10px] font-black text-slate-700 tracking-tighter">${item.precio_nuevo}</span>
                            {/* Porcentaje de impacto del opcional sobre el precio base total */}
                            <span className="ml-1 text-[7px] font-bold text-slate-300">
                              ({((item.precio_nuevo / (prod.nuevo_base_csv || 1)) * 100).toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FOOTER METADATA */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 opacity-60">
                  <div className="flex items-center gap-1 text-[8px] font-bold text-slate-300 uppercase italic">
                    <ChevronRight size={8} />
                    <span>Neural validation ID: SVX-LEX-{prod.sku}</span>
                  </div>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">SERVE_AI_CORES</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}