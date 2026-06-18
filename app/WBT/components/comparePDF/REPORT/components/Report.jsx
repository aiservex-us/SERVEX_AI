'use client';
import { supabase } from '@/app/lib/supabaseClient';
import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuditReportViewer() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const { data } = await supabase
        .from('ClientsSERVEX_WBT')
        .select('id, company_name, audit_report_jsonP, created_at')
        .order('created_at', { ascending: false });
      setRecords(data || []);
      if (data?.length > 0) setSelectedRecordId(data[0].id);
      setLoading(false);
    }
    fetchAuditData();
  }, []);

  const activeRecord = records.find(r => r.id === selectedRecordId);
  const reportData = activeRecord?.audit_report_jsonP;

  if (loading) return <div className="p-10 text-sm text-[#616161]">Cargando auditoría...</div>;

  return (
    <div className="min-h-[90vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          {/* Header de Operaciones */}
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#242424]">{activeRecord?.company_name || 'Seleccione Empresa'}</span>
                <span className="text-[9px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-1.5 py-0.5 rounded-sm uppercase tracking-tight border border-[#5B5FC7]/10">Audit Log</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select 
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-1 text-[11px] outline-none"
                value={selectedRecordId || ''} 
                onChange={(e) => setSelectedRecordId(Number(e.target.value))}
              >
                {records.map((rec) => <option key={rec.id} value={rec.id}>{rec.company_name}</option>)}
              </select>
              <button className="p-1 bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] rounded-sm text-[#616161]"><RefreshCw size={13} /></button>
            </div>
          </div>

          {/* Tabla de Auditoría */}
          <div className="w-full overflow-x-auto">
            <table className="table-fixed border-collapse text-left text-xs w-full">
              <thead className="bg-gradient-to-b from-white to-[#FCFAFF]">
                <tr>
                  {['Index', 'Model ID', 'Nodo', 'Valor Original', 'Nuevo Valor', '% Dif'].map(h => (
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
                    <tr key={i} className="hover:bg-[#F7F5FA]">
                      <td className="px-3 py-2 font-mono text-[#616161]">{c.positional_index}</td>
                      <td className="px-3 py-2 font-mono font-bold text-[#5B5FC7]">{c.model_id}</td>
                      <td className="px-3 py-2">{c.column_name}</td>
                      <td className="px-3 py-2 text-[#A4262C] line-through decoration-red-300 font-mono">{c.old_value}</td>
                      <td className="px-3 py-2 font-semibold text-[#107C10] font-mono">{c.new_value}</td>
                      <td className="px-3 py-2">
                         <span className={parseFloat(diff) >= 0 ? "text-[#107C10]" : "text-[#A4262C]"}>{diff || 'N/A'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer de Auditoría */}
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] text-[10px] font-semibold text-[#616161] flex justify-between">
            <span>TOTAL CAMBIOS DETECTADOS: {reportData?.detected_changes?.length || 0}</span>
            <div className="bg-[#5B5FC7]/10 px-2.5 py-0.5 rounded border border-[#5B5FC7]/20 text-[#5B5FC7] uppercase">Sistema de Integridad SERVEX_AI</div>
          </div>
        </div>
      </div>
    </div>
  );
}