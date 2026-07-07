'use client';
import { supabase } from '@/app/lib/supabaseClient';
import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Database, BrainCircuit, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuditReportViewer() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  
  // Estado para controlar la paginación de los cambios
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

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
        .from('ClientsSERVEX_WBG')
        .select('id, company_name, audit_report_jsonP, created_at')
        .order('created_at', { ascending: false });
      
      setRecords(data || []);
      if (data?.length > 0) setSelectedRecordId(data[0].id);
      setLoading(false);
    }
    fetchAuditData();
  }, []);

  // Reiniciar a la página 1 si cambia el registro seleccionado
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRecordId]);

  const activeRecord = records.find(r => r.id === selectedRecordId);
  const reportData = activeRecord?.audit_report_jsonP;
  const metrics = reportData?.summary_metrics;
  const changes = reportData?.xml_injection_manifest || [];

  // Lógica de segmentación para la paginación
  const totalPages = Math.ceil(changes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentChanges = changes.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <div className="p-10 text-sm text-[#616161]">Loading audit...</div>;

  return (
    <div className="min-h-[85vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        <div className="mb-6 bg-white rounded-md p-6 border border-slate-200 shadow-sm relative overflow-hidden">
           <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <BrainCircuit className="text-[#4F46E5]" size={28} />
            Development Analysis Center: {reportData?.pipeline_metadata?.system_engine}
           </h1>
        </div>



        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          <div className="bg-white border-b border-slate-200 p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-slate-50 rounded-full text-[#464775] ring-1 ring-slate-100"><Database size={18} /></div>
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Evaluated</p>
                <p className="text-lg font-bold text-slate-800">{metrics?.evaluated_common_models || 0}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Modelos procesados</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-slate-50 rounded-full text-[#464775] ring-1 ring-slate-100"><Activity size={18} /></div>
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Cambios en Celdas</p>
                <p className="text-lg font-bold text-slate-800">{metrics?.total_cell_changes || 0}</p>
                <p className="text-[10px] text-[#464775] mt-0.5 font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Actualizaciones exitosas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-slate-50 rounded-full text-slate-400 ring-1 ring-slate-100"><Zap size={18} /></div>
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Target</p>
                <p className="text-lg font-bold text-slate-800">{reportData?.pipeline_metadata?.execution_target || 'N/A'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Sistema de destino</p>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
            <table className="table-fixed border-collapse text-left text-xs w-full">
              <thead className="bg-slate-50/95 sticky top-0 z-[1] backdrop-blur-sm shadow-sm">
                <tr>
                  {['#', 'Model ID', 'Nodo', 'Original Value', 'New Value', '% Diff'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentChanges.map((c, i) => {
                  const actualIndex = indexOfFirstItem + i;
                  const diff = calculatePercentage(c.injected_value_old, c.injected_value_new);
                  return (
                    <tr key={actualIndex} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">{actualIndex + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">{c.model_id}</td>
                      <td className="px-4 py-3 text-slate-600 text-[11px]">{c.target_node}</td>
                      <td className="px-4 py-3 text-slate-400 line-through decoration-slate-300 font-mono">{c.injected_value_old}</td>
                      <td className="px-4 py-3 font-semibold text-[#464775] font-mono">{c.injected_value_new}</td>
                      <td className="px-4 py-3">
                         <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${parseFloat(diff) > 0 ? 'bg-[#464775]/10 text-[#464775]' : 'bg-slate-100 text-slate-500'}`}>
                           {diff ? (parseFloat(diff) > 0 ? `+${diff}` : diff) : 'N/A'}
                         </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Original conservado con Controles de Paginación limpios añadidos */}
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-3 border-t border-[#E0E0E0] text-[10px] font-semibold text-[#616161] flex flex-col sm:flex-row justify-between items-center gap-3">
            <span>TOTAL CAMBIOS APLICADOS: {changes.length}</span>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-[#E0E0E0] shadow-sm">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded text-[#5B5FC7] hover:bg-[#F3F2F1] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="font-mono px-1">
                  Pág. {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded text-[#5B5FC7] hover:bg-[#F3F2F1] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            <span className="uppercase text-[#5B5FC7] font-bold">{reportData?.pipeline_metadata?.company_processed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}