'use client';
import { supabase } from '@/app/lib/supabaseClient';
import React, { useState, useEffect } from 'react';

export default function AuditReportViewer() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const calculatePercentage = (oldVal, newVal) => {
    const oldNum = parseFloat(oldVal);
    const newNum = parseFloat(newVal);
    if (isNaN(oldNum) || isNaN(newNum) || oldNum === 0) return null;
    const diff = ((newNum - oldNum) / Math.abs(oldNum)) * 100;
    return diff.toFixed(1) + '%';
  };

  useEffect(() => {
    async function fetchAuditData() {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('ClientsSERVEX_WBT')
          .select('id, company_name, audit_report_jsonP')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setRecords(data || []);
        if (data?.length > 0) setSelectedRecordId(data[0].id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAuditData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px] text-[#464775]" style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}>
      <div className="w-6 h-6 border-2 border-[#464775] border-t-transparent rounded-full animate-spin mr-3"></div>
      <span className="text-sm font-medium">Cargando reporte...</span>
    </div>
  );

  const activeRecord = records.find(r => r.id === selectedRecordId);
  const reportData = activeRecord?.audit_report_jsonP;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-[#FFF] min-h-[90vh] text-[#323130]" style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-[#201F1E] mb-1">Centro de Auditoría SERVEX_AI</h1>
        <div className="flex items-center gap-4 text-sm text-[#605E5C]">
          <span>Dashboard de Pipeline de Datos</span>
          <span className="w-[1px] h-4 bg-[#EDEBE9]"></span>
          <select 
            className="bg-transparent border-none font-semibold text-[#464775] cursor-pointer hover:underline focus:outline-none"
            value={selectedRecordId || ''} 
            onChange={(e) => setSelectedRecordId(Number(e.target.value))}
          >
            {records.map((rec) => <option key={rec.id} value={rec.id}>{rec.company_name}</option>)}
          </select>
        </div>
      </header>

      {/* Grid de KPIs simplificado */}
      {reportData?.summary_metrics && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Cambios totales', value: reportData.summary_metrics.total_cell_changes },
            { label: 'Updates XML validados', value: reportData.summary_metrics.xml_successful_updates },
            { label: 'Modelos en evaluación', value: reportData.summary_metrics.evaluated_common_models }
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-4 border border-[#E1DFDD] hover:border-[#464775] transition-colors">
              <p className="text-[10px] uppercase font-bold text-[#605E5C] tracking-wide">{kpi.label}</p>
              <p className="text-2xl font-semibold text-[#201F1E] mt-1">{kpi.value}</p>
            </div>
          ))}
        </section>
      )}

      {/* Contenedor informativo adicional */}
      <div className="mb-8 p-4 bg-[#EDF2FB] border-l-4 border-[#464775] text-[#323130] shadow-sm">
        <h3 className="font-semibold text-sm mb-1">Nota de Sistema: Auditoría Proactiva</h3>
        <p className="text-xs text-[#464775]">
          El motor SERVEX_AI ha completado la validación de integridad. Las métricas mostradas reflejan los cambios detectados en el último ciclo de pipeline contra el modelo base definido en el manifiesto corporativo.
        </p>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white border border-[#E1DFDD] shadow-sm">
        <div className="p-4 border-b border-[#E1DFDD]">
          <h2 className="font-semibold text-[#323130]">Historial de Modificaciones</h2>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-[#F8F9FA] text-[#605E5C]">
            <tr>
              {['Model ID', 'Nodo', 'Valor Original', 'Nuevo Valor', '% Dif', 'Index'].map(h => (
                <th key={h} className="p-3 font-medium uppercase text-[11px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1DFDD]">
            {reportData?.detected_changes?.map((c, i) => {
              const diff = calculatePercentage(c.old_value, c.new_value);
              return (
                <tr key={i} className="hover:bg-[#F3F2F1]">
                  <td className="p-3 font-mono font-bold text-[#464775]">{c.model_id}</td>
                  <td className="p-3">{c.column_name}</td>
                  <td className="p-3 text-[#A4262C] line-through">{c.old_value}</td>
                  <td className="p-3 font-semibold text-[#107C10]">{c.new_value}</td>
                  <td className="p-3 font-medium text-[#323130]">
                    {diff ? (
                      <span className={parseFloat(diff) >= 0 ? "text-[#107C10]" : "text-[#A4262C]"}>
                        {diff}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-[#605E5C]">{c.positional_index}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}