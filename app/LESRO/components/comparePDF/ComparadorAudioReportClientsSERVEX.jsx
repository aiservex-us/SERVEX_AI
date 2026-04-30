'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

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

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando reporte de auditoría...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">No hay datos para {companyName}</div>;

  const actuales = data.audit_report_json || [];
  const previos = data.audit_report_jsonP || [];

  // Convertimos el previo en un mapa para buscar rápido por SKU
  const previosMap = new Map(previos.map(p => [p.sku, p]));

  return (
    <div className="p-6 bg-white font-sans text-slate-800">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">Reporte de Auditoría: {companyName}</h1>
        <p className="text-slate-500 text-sm">Comparativa de cambios en precios base y grados</p>
      </header>

      <div className="space-y-10">
        {actuales.map((prod) => {
          const previo = previosMap.get(prod.sku) || {};

          return (
            <div key={prod.sku} className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              {/* Encabezado del Producto */}
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <span className="font-bold text-lg text-[#464775]">SKU: {prod.sku}</span>
                <span className="text-xs font-semibold bg-white border px-2 py-1 rounded uppercase tracking-wider text-slate-400">
                  Resumen de Cambios
                </span>
              </div>

              <div className="p-4 space-y-6">
                {/* Comparación de Precio Base */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">Precio Base Anterior</span>
                    <span className="text-xl font-bold text-slate-400 line-through">
                      ${previo.nuevo_base_csv || 'N/D'}
                    </span>
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-100">
                    <span className="block text-[10px] text-green-600 font-bold uppercase">Precio Base Nuevo</span>
                    <span className="text-xl font-bold text-green-700">
                      ${prod.nuevo_base_csv || previo.nuevo_base_csv || 'Sin cambio'}
                    </span>
                  </div>
                </div>

                {/* Tabla de Grados */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b text-[11px] uppercase text-slate-400 tracking-wider">
                        <th className="py-2 px-2">Grado / Variación</th>
                        <th className="py-2 px-2">Total Anterior</th>
                        <th className="py-2 px-2">Nuevo Total (CSV)</th>
                        <th className="py-2 px-2 text-blue-600">Esperado (XML)</th>
                        <th className="py-2 px-2">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {prod.comparativa_grados_xml?.map((grado, idx) => {
                        // Buscar el grado equivalente en el JSON previo
                        const gradoPrevio = previo.comparativa_grados_xml?.find(g => g.grado === grado.grado);
                        
                        return (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-2 font-semibold text-slate-700">{grado.grado}</td>
                            <td className="py-3 px-2 text-slate-400">${gradoPrevio?.csv_user_total || 'N/D'}</td>
                            <td className="py-3 px-2 font-bold text-slate-700">${grado.csv_user_total}</td>
                            <td className="py-3 px-2 font-bold text-blue-600 bg-blue-50/30">${grado.xml_expected_total}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                grado.result === 'MATCH' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                              }`}>
                                {grado.result}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Sugerencia de Ajuste */}
                <div className="bg-[#464775]/5 p-3 rounded-lg flex items-center justify-between border border-[#464775]/10">
                  <span className="text-xs font-medium text-slate-600 italic">
                    💡 El sistema sugiere revisar los Upcharges según el nuevo XML esperado.
                  </span>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase text-slate-400">Upcharge Sugerido (Promedio)</span>
                    <span className="font-bold text-[#464775]">
                      ${prod.comparativa_grados_xml?.[0]?.xml_upcharge_sugerido || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}