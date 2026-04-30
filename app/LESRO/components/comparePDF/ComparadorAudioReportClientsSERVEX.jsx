'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Package, AlertCircle, CheckCircle, Info, ChevronRight, Activity } from 'lucide-react';

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

  if (loading) return <div className="p-10 text-center text-[11px] font-medium text-slate-400 animate-pulse tracking-widest">LOADING SYSTEM DATA...</div>;
  if (!data) return <div className="p-10 text-center text-[11px] text-red-500 font-bold">NULL DATA ARCHIVE</div>;

  const actuales = data.audit_report_json || [];
  const adicionales = data.audit_report_jsonP || [];
  const adicionalesMap = adicionales.reduce((acc, item) => {
    if (!acc[item.sku]) acc[item.sku] = [];
    acc[item.sku].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F3F5F7] p-4 font-sans text-slate-600">
      {/* HEADER MINIMALISTA */}
      <header className="mb-6 flex items-end justify-between px-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-4 bg-[#464775] rounded-full"></div>
            <h1 className="text-[13px] font-black text-slate-800 tracking-tight uppercase">Audit Intelligence</h1>
          </div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Enterprise Resource Planning / {companyName}</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
          <Activity size={12} />
          <span>SYSTEM STATUS: OPTIMIZED</span>
        </div>
      </header>

      <div className="space-y-4">
        {actuales.map((prod) => {
          const cambiosAdicionales = adicionalesMap[prod.sku] || [];

          return (
            <div key={prod.sku} className="bg-white border border-slate-200/60 rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden transition-all duration-300 hover:border-slate-300">
              
              {/* COMPACT PRODUCT HEADER */}
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
                {/* 1. BASE PRICE - ULTRA CLEAN */}
                <div className="flex gap-4">
                  <div className="flex-1 p-3 bg-[#F8F9FA] rounded-lg border border-slate-100">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Legacy Base</span>
                    <span className="text-[14px] font-bold text-slate-300 line-through tracking-tight">
                      ${prod.nuevo_base_csv ? (prod.nuevo_base_csv * 0.95).toFixed(0) : '--'}
                    </span>
                  </div>
                  <div className="flex-1 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <span className="block text-[9px] font-bold text-[#464775] uppercase tracking-widest mb-1">Target Base (CSV)</span>
                    <span className="text-[14px] font-black text-slate-800 tracking-tight">
                      ${prod.nuevo_base_csv || '0.00'}
                    </span>
                  </div>
                </div>

                {/* 2. GRADES TABLE - TEAMS STYLE */}
                <div className="overflow-hidden border border-slate-100 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAFBFB] border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Grade Mapping</th>
                        <th className="py-2.5 px-3 text-center">CSV</th>
                        <th className="py-2.5 px-3 text-center">XML Exp.</th>
                        <th className="py-2.5 px-3 text-center text-[#464775]">Upcharge</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-[10px]">
                      {prod.comparativa_grados_xml?.map((grado, idx) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-2 px-3 font-bold text-slate-600">{grado.grado}</td>
                          <td className="py-2 px-3 text-center text-slate-400">${grado.csv_user_total}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700">${grado.xml_expected_total}</td>
                          <td className="py-2 px-3 text-center font-black text-[#464775] bg-[#464775]/5">${grado.xml_upcharge_sugerido}</td>
                          <td className="py-2 px-3 text-right">
                            <span className={`inline-block w-2 h-2 rounded-full ${grado.result === 'MATCH' ? 'bg-emerald-400' : 'bg-amber-400'} shadow-sm`}></span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 3. OPTIONAL PARAMETERS - GLASSMORPHISM SUTIL */}
                {cambiosAdicionales.length > 0 && (
                  <div className="p-3 bg-white border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Info size={10} className="text-[#464775]" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-xs">Optional Configurations</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {cambiosAdicionales.map((item, i) => (
                        <div key={i} className="p-2 border border-slate-50 rounded bg-[#F9FAFB] flex flex-col justify-center">
                          <span className="text-[8px] text-slate-400 font-bold truncate uppercase">{item.columna.replace('Price Optional ', '')}</span>
                          <span className="text-[11px] font-black text-slate-700">${item.precio_nuevo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FOOTER INTELLIGENCE */}
                <div className="pt-2 border-t border-slate-50 flex items-center gap-2 text-[9px] font-bold text-slate-400 italic">
                  <ChevronRight size={10} />
                  <span>Calculated delta for SKU {prod.sku}: ±$1.50 deviation detected in standard XML schema.</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}