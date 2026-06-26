'use client';
import { supabase } from '@/app/lib/supabaseClient';
import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Database, BrainCircuit, Activity } from 'lucide-react';

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
        .from('ClientsSERVEX_WBD')
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
  const metrics = reportData?.summary_metrics;
  const changes = reportData?.xml_injection_manifest || [];

  if (loading) return <div className="p-10 text-sm text-[#616161]">Cargando auditoría...</div>;

  return (
    <div className="min-h-[85vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        {/* Header - Mismo diseño */}
        <div className="mb-6 bg-white rounded-md p-6 border border-slate-200 shadow-sm relative overflow-hidden">
           {/* ... (Header content igual al anterior) ... */}
           <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <BrainCircuit className="text-[#4F46E5]" size={28} />
            Centro de Análisis de Desarrollo: {reportData?.pipeline_metadata?.system_engine}
           </h1>
        </div>

        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          <div className="bg-[#FDFDFD] border-b border-[#E0E0E0] p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#F3F2F1] rounded-sm text-[#5B5FC7]"><Database size={16} /></div>
              <div>
                <p className="text-[9px] font-bold text-[#616161] uppercase">Total Evaluados</p>
                <p className="text-[10px] text-[#242424]">{metrics?.evaluated_common_models || 0} modelos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#F3F2F1] rounded-sm text-[#5B5FC7]"><Activity size={16} /></div>
              <div>
                <p className="text-[9px] font-bold text-[#616161] uppercase">Cambios en Celdas</p>
                <p className="text-[10px] text-[#242424]">{metrics?.total_cell_changes || 0} actualizaciones exitosas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#F3F2F1] rounded-sm text-[#5B5FC7]"><Zap size={16} /></div>
              <div>
                <p className="text-[9px] font-bold text-[#616161] uppercase">Target</p>
                <p className="text-[10px] text-[#242424]">{reportData?.pipeline_metadata?.execution_target || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="table-fixed border-collapse text-left text-xs w-full">
              <thead className="bg-gradient-to-b from-white to-[#FCFAFF]">
                <tr>
                  {['#', 'Model ID', 'Nodo', 'Valor Original', 'Nuevo Valor', '% Dif'].map(h => (
                    <th key={h} className="px-3 py-2 text-[10px] font-semibold text-[#5B5FC7] border-b border-[#E0E0E0] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {changes.map((c, i) => {
                  const diff = calculatePercentage(c.injected_value_old, c.injected_value_new);
                  return (
                    <tr key={i} className="hover:bg-[#F7F5FA]">
                      <td className="px-3 py-2 text-[10px] text-[#A6A6A6] font-mono">{i + 1}</td>
                      <td className="px-3 py-2 font-mono font-bold text-[#5B5FC7]">{c.model_id}</td>
                      <td className="px-3 py-2">{c.target_node}</td>
                      <td className="px-3 py-2 text-[#A4262C] line-through decoration-red-300 font-mono">{c.injected_value_old}</td>
                      <td className="px-3 py-2 font-semibold text-[#107C10] font-mono">{c.injected_value_new}</td>
                      <td className="px-3 py-2">
                         <span className={parseFloat(diff) >= 0 ? "text-[#107C10]" : "text-[#A4262C]"}>{diff || 'N/A'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] text-[10px] font-semibold text-[#616161] flex justify-between">
            <span>TOTAL CAMBIOS APLICADOS: {changes.length}</span>
            <span className="uppercase text-[#5B5FC7] font-bold">{reportData?.pipeline_metadata?.company_processed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}