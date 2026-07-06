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

  if (loading) return <div className="p-10 text-sm text-[#616161]">Cargando auditoría...</div>;

  return (
    <div className="min-h-[85vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        <div className="mb-6 bg-white rounded-md p-6 border border-slate-200 shadow-sm relative overflow-hidden">
           <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <BrainCircuit className="text-[#4F46E5]" size={28} />
            Centro de Análisis de Desarrollo: {reportData?.pipeline_metadata?.system_engine}
           </h1>
        </div>

        {/* Contenido: Módulo 2 - Flujo de Inventario */}
        {activeTab === 'inventory_flux' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FCFCFC] mb-6 rounded-xl border border-slate-100">
            
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <PlusCircle size={16} className="text-[#464775]" />
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Modelos Nuevos Detectados</span>
              </div>
              <div className="p-3 max-h-[400px] overflow-y-auto space-y-1">
                {summaryRaw?.new_models_list && summaryRaw.new_models_list.length > 0 ? (
                  summaryRaw.new_models_list.map((model, idx) => (
                    <div key={idx} className="py-2 px-3 flex items-center justify-between font-mono text-xs rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                      <span className="text-slate-700 font-semibold">{model}</span>
                      <span className="text-[10px] text-[#464775] bg-[#464775]/10 px-2 py-0.5 rounded-full font-sans font-semibold">Nuevo SKU</span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                      <PlusCircle size={16} className="text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400">No se detectaron nuevos modelos en el origen.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <MinusCircle size={16} className="text-slate-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Modelos Removidos del Catálogo</span>
              </div>
              <div className="p-3 max-h-[400px] overflow-y-auto space-y-1">
                {summaryRaw?.deleted_models_list && summaryRaw.deleted_models_list.length > 0 ? (
                  summaryRaw.deleted_models_list.map((model, idx) => (
                    <div key={idx} className="py-2 px-3 flex items-center justify-between font-mono text-xs rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                      <span className="text-slate-400 font-medium line-through decoration-slate-300">{model}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-sans font-medium">Descontinuado</span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                      <MinusCircle size={16} className="text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400">No se detectaron modelos removidos.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                {currentChanges.map((c, i) => {
                  const actualIndex = indexOfFirstItem + i;
                  const diff = calculatePercentage(c.injected_value_old, c.injected_value_new);
                  return (
                    <tr key={actualIndex} className="hover:bg-[#F7F5FA]">
                      <td className="px-3 py-2 text-[10px] text-[#A6A6A6] font-mono">{actualIndex + 1}</td>
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