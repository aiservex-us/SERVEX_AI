'use client';
import { supabase } from '@/app/lib/supabaseClient';
import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Database, BrainCircuit } from 'lucide-react';

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
        .from('ClientsSERVEX_WBA')
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

  if (loading) return <div className="p-10 text-sm text-[#616161]">Loading audit...</div>;

  return (
    <div className="min-h-[85vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
       {/* Header de Centro de Análisis Avanzado - Tema Claro */}
<div className="mb-6 bg-white rounded-md p-6 border border-slate-200 shadow-sm relative overflow-hidden">
  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 opacity-50 rounded-full blur-3xl pointer-events-none" />
  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
        <BrainCircuit className="text-[#4F46E5]" size={28} />
        Development Analysis Center
      </h1>
      <p className="text-slate-500 text-xs mt-1 max-w-lg leading-relaxed">
        Advanced intelligence architecture for critical data management in <span className="text-slate-800 font-semibold">SVX Enterprise Systems</span>. 
        Audit, traceability and real-time optimization modules.
      </p>
    </div>
    
    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-sm border border-slate-200">
      <div className="flex -space-x-2">
        <div className="w-6 h-6 rounded-full bg-indigo-600 border border-white flex items-center justify-center text-[8px] text-white font-bold">AI</div>
        <div className="w-6 h-6 rounded-full bg-emerald-600 border border-white flex items-center justify-center text-[8px] text-white font-bold">ETL</div>
      </div>
      <div className="h-6 w-[1px] bg-slate-200 mx-1" />
      <div className="flex flex-col">
        <span className="text-[9px] text-slate-400 uppercase tracking-wider">Server Status.</span>
        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
          </span>
          OPERATING
        </span>
      </div>
    </div>
  </div>
</div>

        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          {/* Header de Operaciones */}
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#242424]">{activeRecord?.company_name || 'Select Company'}</span>
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
              <button className="p-1 bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] rounded-sm text-[#616161]">
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* Contenedor de Insights de Procesamiento */}
          <div className="bg-[#FDFDFD] border-b border-[#E0E0E0] p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#F3F2F1] rounded-sm text-[#5B5FC7]"><Database size={16} /></div>
              <div>
                <p className="text-[9px] font-bold text-[#616161] uppercase">Pipeline ETL</p>
                <p className="text-[10px] text-[#242424]">Processing sources {reportData?.source_format || 'XML/CSV'}. Integrity validated via checksums.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#F3F2F1] rounded-sm text-[#5B5FC7]"><BrainCircuit size={16} /></div>
              <div>
                <p className="text-[9px] font-bold text-[#616161] uppercase">AI Analysis</p>
                <p className="text-[10px] text-[#242424]">Deviation detection via SERVEX_AI inference models. Adjustments applied.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#F3F2F1] rounded-sm text-[#5B5FC7]"><Zap size={16} /></div>
              <div>
                <p className="text-[9px] font-bold text-[#616161] uppercase">Synchronization Status</p>
                <p className="text-[10px] text-[#242424]">Execution in {reportData?.execution_time || '0.4s'}. Status: <span className="font-bold text-[#107C10]">OPTIMIZED</span></p>
              </div>
            </div>
          </div>

          {/* Tabla de Auditoría */}
          <div className="w-full overflow-x-auto">
            <table className="table-fixed border-collapse text-left text-xs w-full">
              <thead className="bg-gradient-to-b from-white to-[#FCFAFF]">
                <tr>
                  {['#', 'Model ID', 'Nodo', 'Original Value', 'New Value', '% Diff'].map(h => (
                    <th key={h} className={`px-3 py-2 text-[10px] font-semibold text-[#5B5FC7] border-b border-[#E0E0E0] uppercase tracking-wider ${h === '#' ? 'w-10' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {reportData?.xml_injection_manifest?.map((c, i) => {
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

          {/* Footer de Auditoría */}
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] text-[10px] font-semibold text-[#616161] flex justify-between">
            <span>TOTAL CHANGES DETECTED: {reportData?.xml_injection_manifest?.length || 0}</span>
            <div className="bg-[#5B5FC7]/10 px-2.5 py-0.5 rounded border border-[#5B5FC7]/20 text-[#5B5FC7] uppercase">SERVEX_AI Integrity System.</div>
          </div>
        </div>
      </div>
    </div>
  );
}