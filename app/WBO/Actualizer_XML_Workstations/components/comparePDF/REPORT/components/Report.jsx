'use client';
import { supabase } from '@/app/lib/supabaseClient';
import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Database, BrainCircuit, Activity, PlusCircle, MinusCircle, FileText, ArrowRight , Search } from 'lucide-react';

export default function AuditReportViewer() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [activeTab, setActiveTab] = useState('changes');
  const [searchTerm, setSearchTerm] = useState(''); // 'changes' | 'inventory_flux'

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
      // Apuntando de manera precisa a la tabla de la entidad WBO
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

  const filteredChangesP = changesP.filter(c => 
    (c.model_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.injected_value_old || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.injected_value_new || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estructura JSON Estándar (Auditoría Ciega Completa)
  const reportDataRaw = activeRecord?.audit_report_json;
  const summaryRaw = reportDataRaw?.summary;
  const metadataRaw = reportDataRaw?.metadata;
  const changesRaw = reportDataRaw?.detected_changes || [];

  const listPriceChangesRaw = changesRaw.filter(c => (c.original_column_name || c.column_name || '').toUpperCase() === 'LIST PRICE');
  const optionPriceChangesRaw = changesRaw.filter(c => (c.original_column_name || c.column_name || '').toUpperCase() !== 'LIST PRICE');

  const filteredListPriceChanges = listPriceChangesRaw.filter(c => 
    (c.model_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.old_value || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.new_value || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOptionPriceChanges = optionPriceChangesRaw.filter(c => 
    (c.model_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.column_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.old_value || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.new_value || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-sm text-[#616161]">Loading audit...</div>;

  return (
    <div className="min-h-[85vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        {/* Header Principal */}
        <div className="mb-6 rounded-lg p-10 border border-[#222222] bg-[#0A0A0A] flex flex-col items-center justify-center text-center shadow-lg">
           <h1 className="text-2xl font-light text-[#E0E0E0] tracking-wide">
            Development Analysis Center: <span className="font-normal text-white">{reportDataP?.pipeline_metadata?.system_engine || 'Gateway Engine'}</span>
           </h1>
           <p className="text-xs text-[#888888] mt-3 font-light tracking-[0.15em] uppercase">
             {metadataRaw?.title || 'Monitoring of catalog synchronization and positional reconciliation.'}
           </p>
        </div>

        {/* Sistema de Pestañas (Tabs) de Control Estilo Teams */}
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          <div className="flex border-b border-[#E0E0E0] bg-[#FAF9F8] px-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('changes')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'changes' 
                  ? 'border-[#5B5FC7] text-[#5B5FC7] bg-white font-bold' 
                  : 'border-transparent text-[#616161] hover:text-[#242424] hover:bg-[#F3F2F1]'
              }`}
            >
              <Zap size={14} />
              List Price Variations ({filteredListPriceChanges.length})
            </button>
            <button
              onClick={() => setActiveTab('option_changes')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'option_changes' 
                  ? 'border-[#5B5FC7] text-[#5B5FC7] bg-white font-bold' 
                  : 'border-transparent text-[#616161] hover:text-[#242424] hover:bg-[#F3F2F1]'
              }`}
            >
              <Zap size={14} className={activeTab === 'option_changes' ? "text-[#5B5FC7]" : "text-amber-500"} />
              Option Price Variations ({filteredOptionPriceChanges.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory_flux')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'inventory_flux' 
                  ? 'border-[#5B5FC7] text-[#5B5FC7] bg-white font-bold' 
                  : 'border-transparent text-[#616161] hover:text-[#242424] hover:bg-[#F3F2F1]'
              }`}
            >
              <RefreshCw size={14} />
              Additions and Deletions ({ (summaryRaw?.new_models_detected_count || 0) + (summaryRaw?.deleted_models_detected_count || 0) })
            </button>
          </div>

          {/* Contenido: Module 1 - Variaciones de List Prices */}
          {activeTab === 'changes' && (
            <div className="w-full flex flex-col">
              <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-2">
                 <Search size={14} className="text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Filter List Prices..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full md:w-1/3 text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] transition-all"
                 />
              </div>
            <div className="w-full overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
              <table className="table-fixed border-collapse text-left text-xs w-full">
                <thead className="bg-slate-50/95 sticky top-0 z-[1] backdrop-blur-sm shadow-sm">
                  <tr>
                    {['#', 'Model ID', 'Column', 'Original Value', 'New Value', '% Diff'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredListPriceChanges.map((c, i) => {
                    const diffNum = parseFloat(c.financial_impact || '0');
                    return (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">{i + 1}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-700">{c.model_id}</td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">{c.column_name}</td>
                        <td className="px-4 py-3 text-slate-400 line-through decoration-slate-300 font-mono">{c.old_value}</td>
                        <td className="px-4 py-3 font-semibold text-[#464775] font-mono">{c.new_value}</td>
                        <td className="px-4 py-3">
                           <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${diffNum > 0 ? 'bg-[#464775]/10 text-[#464775]' : diffNum < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                             {c.financial_impact || 'N/A'}
                           </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredListPriceChanges.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                            <Zap size={16} className="text-slate-300" />
                          </div>
                          <p className="text-xs text-slate-400">No List Price variations were recorded.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
          )}

          {/* Contenido: Module 1.5 - Variaciones de Opciones */}
          {activeTab === 'option_changes' && (
            <div className="w-full flex flex-col">
              <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-2">
                 <Search size={14} className="text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Filter Option Prices..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full md:w-1/3 text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#464775] focus:border-[#464775] transition-all"
                 />
              </div>
            <div className="w-full overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
              <table className="table-fixed border-collapse text-left text-xs w-full">
                <thead className="bg-[#464775]/5 sticky top-0 z-[1] backdrop-blur-sm shadow-sm">
                  <tr>
                    {['#', 'Model ID', 'Option Column', 'Original Value', 'New Value', '% Diff'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold text-[#464775] border-b border-[#464775]/20 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOptionPriceChanges.map((c, i) => {
                    const diffNum = parseFloat(c.financial_impact || '0');
                    return (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">{i + 1}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-700">{c.model_id}</td>
                        <td className="px-4 py-3 text-[#464775] font-semibold text-[11px]">{c.column_name}</td>
                        <td className="px-4 py-3 text-slate-400 line-through decoration-slate-300 font-mono">{c.old_value}</td>
                        <td className="px-4 py-3 font-semibold text-[#464775] font-mono">{c.new_value}</td>
                        <td className="px-4 py-3">
                           <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${diffNum > 0 ? 'bg-[#464775]/10 text-[#464775]' : diffNum < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                             {c.financial_impact || 'N/A'}
                           </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredOptionPriceChanges.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                            <Zap size={16} className="text-slate-300" />
                          </div>
                          <p className="text-xs text-slate-400">No Option Price variations were recorded.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            </div>
          )}

          {/* Contenido: Module 2 - Flujo de Inventario (News vs Deleteds de audit_report_json) */}
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

          {/* Footer del Panel */}
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] text-[10px] font-semibold text-[#616161] flex justify-between items-center">
            <span>TOTAL CAMBIOS INYECTADOS EN PASO ACTUAL: {changesP.length}</span>
            <span className="uppercase text-[#5B5FC7] font-bold tracking-wider">
              {reportDataP?.pipeline_metadata?.company_processed || activeRecord?.company_name || 'SERVEX US'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}