'use client';
import { supabase } from '@/app/lib/supabaseClient';
import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Database, BrainCircuit, Activity, PlusCircle, MinusCircle, FileText, ArrowRight, Search, TrendingUp, TrendingDown, AlertTriangle, Layers, AlertOctagon, ShieldAlert } from 'lucide-react';

export default function AuditReportViewer({ isDarkMode = true }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [activeTab, setActiveTab] = useState('changes');
  const [searchTerm, setSearchTerm] = useState(''); // 'changes' | 'inventory_flux'
  const [listSubTab, setListSubTab] = useState('all');
  const [optionSubTab, setOptionSubTab] = useState('all');

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
      // Apuntando de manera precisa a la tabla de la entidad General Process
      const { data } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .select('id, company_name, audit_report_json, created_at')
        .order('created_at', { ascending: false });
      
      setRecords(data || []);
      if (data?.length > 0) setSelectedRecordId(data[0].id);
      setLoading(false);
    }
    fetchAuditData();
  }, []);

  const activeRecord = records.find(r => r.id === selectedRecordId);
  
  // Estructura JSON (Auditoría Ciega / Inyección XML)
  const reportDataP = activeRecord?.audit_report_json || activeRecord?.audit_report_jsonP;
  const metricsP = reportDataP?.summary_metrics || reportDataP?.summary;
  const changesP = reportDataP?.xml_injection_manifest || reportDataP?.detected_changes || [];

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

  const parseDiffNum = (c) => {
    if (!c) return 0;
    if (c.old_value === '[VACÍO]' || c.old_value === '---' || c.old_value === 'N/A') return 0;
    if (c.financial_impact !== undefined && c.financial_impact !== null && c.financial_impact !== '---' && c.financial_impact !== 'N/A') {
      const str = String(c.financial_impact).replace('%', '').replace('+', '').trim();
      const num = parseFloat(str);
      if (!isNaN(num)) return num;
    }
    const o = parseFloat(c.old_value);
    const n = parseFloat(c.new_value);
    if (!isNaN(o) && !isNaN(n) && o !== 0) {
      return ((n - o) / Math.abs(o)) * 100;
    }
    return 0;
  };

  const isZeroAnomaly = (c) => {
    const diff = parseDiffNum(c);
    const isVacative = (c.old_value === '[VACÍO]' || c.old_value === '---' || c.old_value === 'N/A' || !c.old_value);
    return diff === 0 || isVacative;
  };

  // List Price Categorization
  const listIncreases = filteredListPriceChanges.filter(c => !isZeroAnomaly(c) && parseDiffNum(c) > 0 && parseDiffNum(c) <= 12);
  const listDecreases = filteredListPriceChanges.filter(c => !isZeroAnomaly(c) && parseDiffNum(c) < 0);
  const listZeroAnomalies = filteredListPriceChanges.filter(c => isZeroAnomaly(c));
  const listRangeAnomalies = filteredListPriceChanges.filter(c => !isZeroAnomaly(c) && parseDiffNum(c) > 12 && parseDiffNum(c) < 100);
  const listExtremeAnomalies = filteredListPriceChanges.filter(c => !isZeroAnomaly(c) && parseDiffNum(c) >= 100);

  // Option Price Categorization
  const optionIncreases = filteredOptionPriceChanges.filter(c => !isZeroAnomaly(c) && parseDiffNum(c) > 0 && parseDiffNum(c) <= 12);
  const optionDecreases = filteredOptionPriceChanges.filter(c => !isZeroAnomaly(c) && parseDiffNum(c) < 0);
  const optionZeroAnomalies = filteredOptionPriceChanges.filter(c => isZeroAnomaly(c));
  const optionRangeAnomalies = filteredOptionPriceChanges.filter(c => !isZeroAnomaly(c) && parseDiffNum(c) > 12 && parseDiffNum(c) < 100);
  const optionExtremeAnomalies = filteredOptionPriceChanges.filter(c => !isZeroAnomaly(c) && parseDiffNum(c) >= 100);

  const renderSubTable = (title, icon, items, emptyText) => {
    return (
      <div className={`backdrop-blur-md rounded-xl border shadow-sm overflow-hidden flex flex-col w-full mb-3 ${
        isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className={`px-4 py-2.5 border-b flex items-center justify-between ${
          isDarkMode ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            {icon}
            <h3 className={`text-xs font-bold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>{title}</h3>
          </div>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-semibold ${
            isDarkMode ? 'bg-white/5 text-zinc-300 border-white/15' : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {items.length} {items.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <div className="w-full overflow-x-auto max-h-[350px] overflow-y-auto custom-scrollbar">
          <table className="table-fixed border-collapse text-left text-xs w-full">
            <thead className={`sticky top-0 z-10 shadow-sm border-b ${
              isDarkMode ? 'bg-[#121215]/95 border-white/10' : 'bg-slate-100/95 border-slate-200'
            }`}>
              <tr>
                {['#', 'Model ID', 'Column', 'Original Value', 'New Value', '% Diff'].map(h => (
                  <th key={h} className={`px-4 py-2.5 text-[10px] font-bold border-b uppercase tracking-wider ${
                    isDarkMode ? 'text-zinc-400 border-white/10' : 'text-slate-700 border-slate-200'
                  }`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y bg-transparent ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'}`}>
              {items.map((c, i) => {
                const diff = parseDiffNum(c);
                const pillColor = diff > 0 
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                  : diff < 0 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                    : isDarkMode ? 'bg-white/5 text-zinc-400 border-white/10' : 'bg-slate-100 text-slate-500 border-slate-200';

                return (
                  <tr key={i} className={`transition-colors ${isDarkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50/80'}`}>
                    <td className={`px-4 py-2.5 text-[10px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>{i + 1}</td>
                    <td className={`px-4 py-2.5 font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.model_id}</td>
                    <td className={`px-4 py-2.5 text-[11px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{c.column_name}</td>
                    <td className={`px-4 py-2.5 line-through font-mono ${isDarkMode ? 'text-zinc-500 decoration-zinc-600' : 'text-slate-400 decoration-slate-400'}`}>{c.old_value}</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-600 font-mono">{c.new_value}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${pillColor}`}>
                        {c.financial_impact || '0%'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    <p className="text-xs text-zinc-500 italic">{emptyText}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[70vh] bg-transparent text-xs font-semibold text-zinc-400 font-sans">
      <div className="flex items-center gap-2">
        <RefreshCw size={14} className="animate-spin text-zinc-300" />
        Loading audit metrics...
      </div>
    </div>
  );

  return (
    <div className="min-h-[85vh] bg-transparent p-2 md:p-4 text-zinc-100 font-sans antialiased w-full">
      <div className="w-full">

        {/* Data Map / Information Section */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="bg-[#09090b]/80 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col gap-2 hover:border-white/20 transition-all relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
             <div className="flex items-center gap-2 text-white">
                <Zap size={16} className="text-zinc-300" />
                <h3 className="font-semibold text-[13px] tracking-tight">List Price Variations</h3>
             </div>
             <p className="text-[11.5px] text-zinc-400 leading-relaxed font-normal">
               Monitors all direct changes to the base list price of each SKU. Essential for tracking baseline profitability and primary cost updates.
             </p>
          </div>
          <div className="bg-[#09090b]/80 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col gap-2 hover:border-white/20 transition-all relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
             <div className="flex items-center gap-2 text-white">
                <Database size={16} className="text-zinc-300" />
                <h3 className="font-semibold text-[13px] tracking-tight">Option Price Variations</h3>
             </div>
             <p className="text-[11.5px] text-zinc-400 leading-relaxed font-normal">
               Tracks modifications in secondary pricing matrices, finishes, and optional upgrades that affect the complex pricing structure.
             </p>
          </div>
          <div className="bg-[#09090b]/80 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col gap-2 hover:border-white/20 transition-all relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
             <div className="flex items-center gap-2 text-white">
                <Activity size={16} className="text-zinc-300" />
                <h3 className="font-semibold text-[13px] tracking-tight">Additions & Deletions</h3>
             </div>
             <p className="text-[11.5px] text-zinc-400 leading-relaxed font-normal">
               Identifies newly introduced models and discontinued items from the catalog. Maps structural expansions or reductions in the product line.
             </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full">

          {/* Contenido: Module 1 - Variaciones de List Prices */}
          <div className="bg-[#09090b]/85 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden flex flex-col w-full">
            <div className="px-4 py-3 bg-white/[0.03] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-zinc-300" />
                <h2 className="text-sm font-bold text-white">List Price Variations ({filteredListPriceChanges.length})</h2>
              </div>

              {/* Category Sub-Tabs */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-[11px] font-medium flex-wrap">
                <button 
                  onClick={() => setListSubTab('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${listSubTab === 'all' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Layers size={11} className={listSubTab === 'all' ? 'text-zinc-950' : 'text-zinc-400'} /> All ({filteredListPriceChanges.length})
                </button>
                <button 
                  onClick={() => setListSubTab('increases')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${listSubTab === 'increases' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <TrendingUp size={11} className={listSubTab === 'increases' ? 'text-zinc-950' : 'text-zinc-400'} /> Increases {'≤'}12% ({listIncreases.length})
                </button>
                <button 
                  onClick={() => setListSubTab('decreases')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${listSubTab === 'decreases' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <TrendingDown size={11} className={listSubTab === 'decreases' ? 'text-zinc-950' : 'text-zinc-400'} /> Decreases ({listDecreases.length})
                </button>
                <button 
                  onClick={() => setListSubTab('zero_anomalies')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${listSubTab === 'zero_anomalies' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <AlertTriangle size={11} className={listSubTab === 'zero_anomalies' ? 'text-zinc-950' : 'text-zinc-400'} /> 0% Anomalies ({listZeroAnomalies.length})
                </button>
                <button 
                  onClick={() => setListSubTab('range_anomalies')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${listSubTab === 'range_anomalies' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <AlertOctagon size={11} className={listSubTab === 'range_anomalies' ? 'text-zinc-950' : 'text-zinc-400'} /> Range {'>'}12% ({listRangeAnomalies.length})
                </button>
                <button 
                  onClick={() => setListSubTab('extreme_anomalies')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${listSubTab === 'extreme_anomalies' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <ShieldAlert size={11} className={listSubTab === 'extreme_anomalies' ? 'text-zinc-950' : 'text-zinc-400'} /> Outliers {'≥'}100% ({listExtremeAnomalies.length})
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col p-4 gap-4">
              <div className="px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl flex items-center gap-2">
                 <Search size={14} className="text-zinc-400" />
                 <input 
                   type="text" 
                   placeholder="Filter List Prices..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full md:w-1/3 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all"
                 />
              </div>

              {/* Table 1: Increases */}
              {(listSubTab === 'all' || listSubTab === 'increases') && renderSubTable(
                "Standard Price Increases (≤ 12%)",
                <TrendingUp size={15} className="text-zinc-300" />,
                listIncreases,
                "No standard price increases recorded (≤ 12%)."
              )}

              {/* Table 2: Decreases */}
              {(listSubTab === 'all' || listSubTab === 'decreases') && renderSubTable(
                "Price Decreases (< 0%)",
                <TrendingDown size={15} className="text-zinc-300" />,
                listDecreases,
                "No price decreases recorded."
              )}

              {/* Table 3: Zero Anomalies */}
              {(listSubTab === 'all' || listSubTab === 'zero_anomalies') && renderSubTable(
                "0% Anomalies & Unchanged ([EMPTY] / 0%)",
                <AlertTriangle size={15} className="text-zinc-300" />,
                listZeroAnomalies,
                "No 0% anomalies or empty records found."
              )}

              {/* Table 4: Range Anomalies */}
              {(listSubTab === 'all' || listSubTab === 'range_anomalies') && renderSubTable(
                "High Range Anomalies (> 12% to < 100%)",
                <AlertOctagon size={15} className="text-zinc-300" />,
                listRangeAnomalies,
                "No high range anomalies found (> 12%)."
              )}

              {/* Table 5: Extreme Anomalies */}
              {(listSubTab === 'all' || listSubTab === 'extreme_anomalies') && renderSubTable(
                "Extreme Outliers & Price Errors (≥ 100%)",
                <ShieldAlert size={15} className="text-zinc-300" />,
                listExtremeAnomalies,
                "No extreme outliers or price errors detected (≥ 100%)."
              )}
            </div>
          </div>

          {/* Contenido: Module 1.5 - Variaciones de Opciones */}
          <div className="bg-[#09090b]/85 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden flex flex-col w-full">
            <div className="px-4 py-3 bg-white/[0.03] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-zinc-300" />
                <h2 className="text-sm font-bold text-white">Option Price Variations ({filteredOptionPriceChanges.length})</h2>
              </div>

              {/* Option Category Sub-Tabs */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-[11px] font-medium flex-wrap">
                <button 
                  onClick={() => setOptionSubTab('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${optionSubTab === 'all' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Layers size={11} className={optionSubTab === 'all' ? 'text-zinc-950' : 'text-zinc-400'} /> All ({filteredOptionPriceChanges.length})
                </button>
                <button 
                  onClick={() => setOptionSubTab('increases')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${optionSubTab === 'increases' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <TrendingUp size={11} className={optionSubTab === 'increases' ? 'text-zinc-950' : 'text-zinc-400'} /> Increases {'≤'}12% ({optionIncreases.length})
                </button>
                <button 
                  onClick={() => setOptionSubTab('decreases')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${optionSubTab === 'decreases' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <TrendingDown size={11} className={optionSubTab === 'decreases' ? 'text-zinc-950' : 'text-zinc-400'} /> Decreases ({optionDecreases.length})
                </button>
                <button 
                  onClick={() => setOptionSubTab('zero_anomalies')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${optionSubTab === 'zero_anomalies' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <AlertTriangle size={11} className={optionSubTab === 'zero_anomalies' ? 'text-zinc-950' : 'text-zinc-400'} /> 0% Anomalies ({optionZeroAnomalies.length})
                </button>
                <button 
                  onClick={() => setOptionSubTab('range_anomalies')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${optionSubTab === 'range_anomalies' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <AlertOctagon size={11} className={optionSubTab === 'range_anomalies' ? 'text-zinc-950' : 'text-zinc-400'} /> Range {'>'}12% ({optionRangeAnomalies.length})
                </button>
                <button 
                  onClick={() => setOptionSubTab('extreme_anomalies')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${optionSubTab === 'extreme_anomalies' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  <ShieldAlert size={11} className={optionSubTab === 'extreme_anomalies' ? 'text-zinc-950' : 'text-zinc-400'} /> Outliers {'≥'}100% ({optionExtremeAnomalies.length})
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col p-4 gap-4">
              <div className="px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl flex items-center gap-2">
                 <Search size={14} className="text-zinc-400" />
                 <input 
                   type="text" 
                   placeholder="Filter Option Prices..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full md:w-1/3 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all"
                 />
              </div>

              {/* Table 1: Increases */}
              {(optionSubTab === 'all' || optionSubTab === 'increases') && renderSubTable(
                "Standard Option Price Increases (≤ 12%)",
                <TrendingUp size={15} className="text-zinc-300" />,
                optionIncreases,
                "No standard option price increases recorded (≤ 12%)."
              )}

              {/* Table 2: Decreases */}
              {(optionSubTab === 'all' || optionSubTab === 'decreases') && renderSubTable(
                "Option Price Decreases (< 0%)",
                <TrendingDown size={15} className="text-zinc-300" />,
                optionDecreases,
                "No option price decreases recorded."
              )}

              {/* Table 3: Zero Anomalies */}
              {(optionSubTab === 'all' || optionSubTab === 'zero_anomalies') && renderSubTable(
                "0% Option Anomalies & Unchanged ([EMPTY] / 0%)",
                <AlertTriangle size={15} className="text-zinc-300" />,
                optionZeroAnomalies,
                "No 0% option anomalies or empty records found."
              )}

              {/* Table 4: Range Anomalies */}
              {(optionSubTab === 'all' || optionSubTab === 'range_anomalies') && renderSubTable(
                "High Range Option Anomalies (> 12% to < 100%)",
                <AlertOctagon size={15} className="text-zinc-300" />,
                optionRangeAnomalies,
                "No high range option anomalies found (> 12%)."
              )}

              {/* Table 5: Extreme Anomalies */}
              {(optionSubTab === 'all' || optionSubTab === 'extreme_anomalies') && renderSubTable(
                "Extreme Option Outliers & Errors (≥ 100%)",
                <ShieldAlert size={15} className="text-zinc-300" />,
                optionExtremeAnomalies,
                "No extreme option outliers detected (≥ 100%)."
              )}
            </div>
          </div>

          {/* Contenido: Module 2 - Flujo de Inventario (News vs Deleteds de audit_report_json) */}
          <div className="bg-[#09090b]/85 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.08)] overflow-hidden flex flex-col w-full">
            <div className="px-4 py-3 bg-white/[0.03] border-b border-white/10 flex items-center gap-2">
              <RefreshCw size={16} className="text-zinc-300" />
              <h2 className="text-sm font-bold text-white">Additions and Deletions ({ (summaryRaw?.new_models_detected_count || 0) + (summaryRaw?.deleted_models_detected_count || 0) })</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-transparent">
              
              {/* Columna New Models */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-white/[0.03] px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <PlusCircle size={16} className="text-zinc-300" />
                  <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">New Models Detected</span>
                </div>
                <div className="p-3 max-h-[400px] overflow-y-auto space-y-1 custom-scrollbar">
                  {summaryRaw?.new_models_list && summaryRaw.new_models_list.length > 0 ? (
                    summaryRaw.new_models_list.map((model, idx) => (
                      <div key={idx} className="py-2 px-3 flex items-center justify-between font-mono text-xs rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                        <span className="text-zinc-200 font-semibold">{model}</span>
                        <span className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-sans font-semibold">New SKU</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/10">
                        <PlusCircle size={16} className="text-zinc-500" />
                      </div>
                      <p className="text-xs text-zinc-500">No new models were detected at the source.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Deleted Models */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-white/[0.03] px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <MinusCircle size={16} className="text-zinc-300" />
                  <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">Models Removed from Catalog</span>
                </div>
                <div className="p-3 max-h-[400px] overflow-y-auto space-y-1 custom-scrollbar">
                  {summaryRaw?.deleted_models_list && summaryRaw.deleted_models_list.length > 0 ? (
                    summaryRaw.deleted_models_list.map((model, idx) => (
                      <div key={idx} className="py-2 px-3 flex items-center justify-between font-mono text-xs rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors">
                        <span className="text-zinc-400 font-medium line-through decoration-zinc-600">{model}</span>
                        <span className="text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-sans font-medium">Discontinued</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/10">
                        <MinusCircle size={16} className="text-zinc-500" />
                      </div>
                      <p className="text-xs text-zinc-500">No removed models were detected.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Footer del Panel */}
          <div className="bg-white/[0.02] px-4 py-2.5 border border-white/10 rounded-xl text-[10px] font-semibold text-zinc-400 flex justify-between items-center shadow-sm mt-2">
            <span>TOTAL CHANGES INJECTED IN CURRENT STEP: <strong className="text-white">{changesP.length}</strong></span>
            <span className="uppercase text-white font-bold tracking-wider">
              {reportDataP?.pipeline_metadata?.company_processed || activeRecord?.company_name || 'SERVEX US'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}