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
    <div className="min-h-[90vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        {/* Header Section */}
        <header className="mb-6">
          <h1 className="text-xl font-bold text-[#242424] mb-1">Centro de Auditoría SERVEX_AI</h1>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[#616161]">Pipeline de Datos:</span>
            <select 
              className="bg-[#F0F0F0] border border-[#E0E0E0] rounded-sm px-2 py-0.5 text-[11px] font-semibold text-[#5B5FC7] cursor-pointer outline-none focus:border-[#5B5FC7]"
              value={selectedRecordId || ''} 
              onChange={(e) => setSelectedRecordId(Number(e.target.value))}
            >
              {records.map((rec) => <option key={rec.id} value={rec.id}>{rec.company_name}</option>)}
            </select>
          </div>
        </header>

        {/* Grid de KPIs */}
        {reportData?.summary_metrics && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Cambios totales', value: reportData.summary_metrics.total_cell_changes },
              { label: 'Updates XML validados', value: reportData.summary_metrics.xml_successful_updates },
              { label: 'Modelos en evaluación', value: reportData.summary_metrics.evaluated_common_models }
            ].map((kpi, i) => (
              <div key={i} className="bg-white p-4 border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                <p className="text-[9px] uppercase font-bold text-[#616161] tracking-wider">{kpi.label}</p>
                <p className="text-xl font-bold text-[#242424] mt-1">{kpi.value}</p>
              </div>
            ))}
          </section>
        )}

        {/* Tabla Principal con estilo técnico */}
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF]">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#242424]">Historial de Modificaciones</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-gradient-to-b from-white to-[#FCFAFF] sticky top-0 z-20">
                <tr>
                  {['Model ID', 'Nodo', 'Valor Original', 'Nuevo Valor', '% Dif', 'Index'].map(h => (
                    <th key={h} className="px-3 py-2 text-[10px] font-semibold text-[#5B5FC7] border-b border-[#E0E0E0] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {reportData?.detected_changes?.map((c, i) => {
                  const diff = calculatePercentage(c.old_value, c.new_value);
                  return (
                    <tr key={i} className="hover:bg-[#F7F5FA] transition-colors duration-75">
                      <td className="px-3 py-2 font-mono font-bold text-[#5B5FC7]">{c.model_id}</td>
                      <td className="px-3 py-2 text-[#242424]">{c.column_name}</td>
                      <td className="px-3 py-2 text-[#A4262C] line-through decoration-red-300 font-mono">{c.old_value}</td>
                      <td className="px-3 py-2 font-semibold text-[#107C10] font-mono">{c.new_value}</td>
                      <td className="px-3 py-2 font-medium">
                        {diff ? (
                          <span className={parseFloat(diff) >= 0 ? "text-[#107C10]" : "text-[#A4262C]"}>
                            {diff}
                          </span>
                        ) : <span className="text-[#A19F9D] italic">N/A</span>}
                      </td>
                      <td className="px-3 py-2 text-[#616161] font-mono">{c.positional_index}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}