'use client';
import { supabase } from '@/app/lib/supabaseClient';
import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Database, BrainCircuit, Activity, PlusCircle, MinusCircle, FileText, ArrowRight } from 'lucide-react';

export default function AuditReportViewer() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [activeTab, setActiveTab] = useState('changes'); // 'changes' | 'inventory_flux'

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
      // Extraemos tanto audit_report_jsonP como audit_report_json de la tabla WBO
      const { data } = await supabase
        .from('ClientsSERVEX_WBO')
        .select('id, company_name, audit_report_jsonP, audit_report_json, created_at')
        .order('created_at', { ascending: false });
      
      setRecords(data || []);
      if (data?.length > 0) setSelectedRecordId(data[0].id);
      setLoading(false);
    }
    fetchAuditData();
  }, []);

  const activeRecord = records.find(r => r.id === selectedRecordId);
  
  // Estructura JSON P (Inyección XML)
  const reportDataP = activeRecord?.audit_report_jsonP;
  const metricsP = reportDataP?.summary_metrics;
  const changesP = reportDataP?.xml_injection_manifest || [];

  // Estructura JSON Estándar (Auditoría Ciega Completa)
  const reportDataRaw = activeRecord?.audit_report_json;
  const summaryRaw = reportDataRaw?.summary;
  const metadataRaw = reportDataRaw?.metadata;

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
                Development Analysis Center: {reportDataP?.pipeline_metadata?.system_engine || 'WBO Gateway Engine'}
              </h1>
              <p className="text-slate-500 text-xs mt-1 max-w-lg leading-relaxed">
                {metadataRaw?.title || 'Advanced intelligence architecture for critical data management in SVX Enterprise Systems.'}
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

        {/* Módulo de Contexto / Metadata de Archivos */}
        {metadataRaw && (
          <div className="mb-4 bg-[#F9FAFB] rounded-md border border-[#E0E0E0] p-3 text-xs flex flex-wrap items-center gap-6 justify-between">
            <div className="flex items-center gap-2 text-[#616161]">
              <FileText size={14} className="text-[#5B5FC7]" />
              <span className="font-semibold">Pipeline Source tracking:</span>
            </div>
            <div className="flex items-center gap-4 flex-1 justify-start ml-2">
              <div className="bg-white px-3 py-1 rounded border border-[#E0E0E0] font-mono text-[11px]">
                <span className="text-[#616161] font-sans mr-1">Base:</span> {metadataRaw.old_file}
              </div>
              <ArrowRight size={14} className="text-[#A6A6A6]" />
              <div className="bg-white px-3 py-1 rounded border border-[#E0E0E0] font-mono text-[11px]">
                <span className="text-[#616161] font-sans mr-1">Entrante:</span> {metadataRaw.new_file}
              </div>
            </div>
            <div className="text-[11px] font-semibold text-[#5B5FC7] bg-[#EFEEFC] px-2 py-0.5 rounded">
              Target: {reportDataP?.pipeline_metadata?.execution_target || 'WBO Engine'}
            </div>
          </div>
        )}

        {/* Bloque de Indicadores (KPIs Métricos Superior) */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 rounded-full text-[#464775] ring-1 ring-slate-100"><Database size={18} /></div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Evaluated</p>
              <p className="text-xl font-bold text-slate-800">{summaryRaw?.total_common_models_evaluated || metricsP?.evaluated_common_models || 0}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Models cross-referenced in matrix</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 rounded-full text-[#464775] ring-1 ring-slate-100"><Activity size={18} /></div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Changes Detected</p>
              <p className="text-xl font-bold text-slate-800">{summaryRaw?.cell_changes_detected_count || metricsP?.total_cell_changes || 0}</p>
              <p className="text-[10px] text-[#464775] mt-0.5 font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {metricsP?.xml_successful_updates || 0} Injected into XML
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 rounded-full text-slate-400 ring-1 ring-slate-100"><MinusCircle size={18} /></div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Deleted Models</p>
              <p className="text-xl font-bold text-slate-800">{summaryRaw?.deleted_models_detected_count || 0}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Removed from source</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 rounded-full text-[#464775] ring-1 ring-slate-100"><PlusCircle size={18} /></div>
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">New Models</p>
              <p className="text-xl font-bold text-slate-800">{summaryRaw?.new_models_detected_count || 0}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">New SKU entries</p>
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
                <p className="text-[10px] text-[#242424]">Processing sources {reportDataP?.source_format || 'XML/CSV'}. Integrity validated via checksums.</p>
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
                <p className="text-[10px] text-[#242424]">Execution in {reportDataP?.execution_time || '0.4s'}. Status: <span className="font-bold text-[#107C10]">OPTIMIZED</span></p>
              </div>
            </div>
          </div>

          {/* Sistema de Pestañas (Tabs) de Control Estilo Teams */}
          <div className="flex border-b border-[#E0E0E0] bg-[#FAF9F8] px-2">
            <button
              onClick={() => setActiveTab('changes')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'changes' 
                  ? 'border-[#5B5FC7] text-[#5B5FC7] bg-white font-bold' 
                  : 'border-transparent text-[#616161] hover:text-[#242424] hover:bg-[#F3F2F1]'
              }`}
            >
              <Zap size={14} />
              List Price Variations ({changesP.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory_flux')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'inventory_flux' 
                  ? 'border-[#5B5FC7] text-[#5B5FC7] bg-white font-bold' 
                  : 'border-transparent text-[#616161] hover:text-[#242424] hover:bg-[#F3F2F1]'
              }`}
            >
              <RefreshCw size={14} />
              Additions and Deletions Flow ({ (summaryRaw?.new_models_detected_count || 0) + (summaryRaw?.deleted_models_detected_count || 0) })
            </button>
          </div>

          {/* Contenido: Módulo 1 - Variaciones de Precios */}
          {activeTab === 'changes' && (
            <div className="w-full overflow-x-auto">
              <table className="table-fixed border-collapse text-left text-xs w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    {['#', 'Model ID', 'Nodo', 'Original Value', 'New Value', '% Diff'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {changesP.map((c, i) => {
                    const diff = calculatePercentage(c.injected_value_old, c.injected_value_new);
                    return (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">{i + 1}</td>
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
                  {changesP.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                            <Zap size={16} className="text-slate-300" />
                          </div>
                          <p className="text-xs text-slate-400">No price variations were recorded.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Contenido: Módulo 2 - Flujo de Inventario (Nuevos vs Eliminados de audit_report_json) */}
          {activeTab === 'inventory_flux' && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FCFCFC]">
              
              {/* Columna New Models */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <PlusCircle size={16} className="text-[#464775]" />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">New Models Detected</span>
                </div>
                <div className="p-3 max-h-[400px] overflow-y-auto space-y-1">
                  {summaryRaw?.new_models_list && summaryRaw.new_models_list.length > 0 ? (
                    summaryRaw.new_models_list.map((model, idx) => (
                      <div key={idx} className="py-2 px-3 flex items-center justify-between font-mono text-xs rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                        <span className="text-slate-700 font-semibold">{model}</span>
                        <span className="text-[10px] text-[#464775] bg-[#464775]/10 px-2 py-0.5 rounded-full font-sans font-semibold">New SKU</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                        <PlusCircle size={16} className="text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-400">No new models were detected at the source.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Deleted Models */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <MinusCircle size={16} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Models Removed from Catalog</span>
                </div>
                <div className="p-3 max-h-[400px] overflow-y-auto space-y-1">
                  {summaryRaw?.deleted_models_list && summaryRaw.deleted_models_list.length > 0 ? (
                    summaryRaw.deleted_models_list.map((model, idx) => (
                      <div key={idx} className="py-2 px-3 flex items-center justify-between font-mono text-xs rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                        <span className="text-slate-400 font-medium line-through decoration-slate-300">{model}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-sans font-medium">Discontinued</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                        <MinusCircle size={16} className="text-slate-300" />
                      </div>
                      <p className="text-xs text-slate-400">No removed models were detected.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Footer de Auditoría */}
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] text-[10px] font-semibold text-[#616161] flex justify-between items-center">
            <span>TOTAL CHANGES DETECTED: {changesP.length || 0}</span>
            <div className="bg-[#5B5FC7]/10 px-2.5 py-0.5 rounded border border-[#5B5FC7]/20 text-[#5B5FC7] uppercase tracking-wide">
              Sistema de Integridad SERVEX_AI — {reportDataP?.pipeline_metadata?.company_processed || activeRecord?.company_name || 'WBO'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}