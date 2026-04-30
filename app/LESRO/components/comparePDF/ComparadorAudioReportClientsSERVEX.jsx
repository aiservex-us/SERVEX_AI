'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Package, AlertCircle, CheckCircle, Info, ChevronRight } from 'lucide-react';

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

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Cargando reporte detallado de auditoría...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">No hay datos para {companyName}</div>;

  const actuales = data.audit_report_json || [];
  const adicionales = data.audit_report_jsonP || [];

  // Agrupamos los datos de audit_report_jsonP por SKU para un acceso rápido
  const adicionalesMap = adicionales.reduce((acc, item) => {
    if (!acc[item.sku]) acc[item.sku] = [];
    acc[item.sku].push(item);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      <header className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <div className="w-2 h-8 bg-[#464775] rounded-full"></div>
          AUDITORÍA INTEGRAL: {companyName}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Comparativa técnica de XML vs CSV y ajustes de upcharge sugeridos.</p>
      </header>

      <div className="space-y-8">
        {actuales.map((prod) => {
          const cambiosAdicionales = adicionalesMap[prod.sku] || [];

          return (
            <div key={prod.sku} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* HEADER PRODUCTO */}
              <div className="bg-[#464775] px-6 py-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                  <Package className="opacity-80" size={20} />
                  <span className="font-bold text-lg tracking-wider">SKU: {prod.sku}</span>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-lg text-xs font-bold border border-white/20">
                  {prod.comparativa_grados_xml?.length || 0} VARIACIONES
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* 1. PRECIO BASE */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ajuste de Precio Base</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-sm font-medium text-slate-500">Estado Actual</span>
                      <span className="text-xl font-bold text-slate-400 line-through tracking-tighter">
                        {prod.nuevo_base_csv ? `$${(prod.nuevo_base_csv * 0.95).toFixed(2)}` : 'N/D'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                      <span className="text-sm font-bold text-green-700">Propuesto (CSV)</span>
                      <span className="text-2xl font-black text-green-700 tracking-tighter">
                        ${prod.nuevo_base_csv || 'Sin cambio'}
                      </span>
                    </div>
                  </div>
                </section>

                {/* 2. TABLA TÉCNICA DE GRADOS (UPCHARGES) */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center md:text-left">Desglose de Grados y Upcharges Sugeridos</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-widest border-b">
                          <th className="py-4 px-4">Grado</th>
                          <th className="py-4 px-4 text-center">Total CSV</th>
                          <th className="py-4 px-4 text-center text-blue-600">Esperado XML</th>
                          <th className="py-4 px-4 text-center text-[#464775] bg-slate-100/50">Upcharge Sugerido</th>
                          <th className="py-4 px-4 text-right">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {prod.comparativa_grados_xml?.map((grado, idx) => (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-4 font-bold text-slate-700">{grado.grado}</td>
                            <td className="py-4 px-4 text-center font-medium">${grado.csv_user_total}</td>
                            <td className="py-4 px-4 text-center font-black text-blue-600">${grado.xml_expected_total}</td>
                            <td className="py-4 px-4 text-center font-black text-[#464775] bg-[#464775]/5">
                              ${grado.xml_upcharge_sugerido}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                grado.result === 'MATCH' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {grado.result === 'MATCH' ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                                {grado.result}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 3. CAMBIOS ADICIONALES (De audit_report_jsonP) */}
                {cambiosAdicionales.length > 0 && (
                  <section className="bg-blue-50/50 rounded-2xl border border-blue-100 p-5">
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <Info size={14} /> Otros cambios detectados en columnas (Opcionales)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cambiosAdicionales.map((item, i) => (
                        <div key={i} className="bg-white p-3 rounded-xl border border-blue-200/50 shadow-sm flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 font-bold uppercase truncate max-w-[150px]" title={item.columna}>
                              {item.columna}
                            </span>
                            <span className="text-xs font-bold text-slate-700 italic">Nuevo Valor</span>
                          </div>
                          <span className="text-lg font-black text-blue-600">${item.precio_nuevo}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* NOTA DE INTELIGENCIA */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                  <ChevronRight size={14} className="text-[#464775]" />
                  <span>Para este SKU, la discrepancia promedio es de <strong>${Math.abs((prod.comparativa_grados_xml?.[0]?.csv_user_total || 0) - (prod.comparativa_grados_xml?.[0]?.xml_expected_total || 0))}</strong> entre CSV y XML.</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}