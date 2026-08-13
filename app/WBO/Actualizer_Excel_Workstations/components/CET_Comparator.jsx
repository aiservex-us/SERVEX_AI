'use client';
import { supabase } from '@/app/lib/supabaseClient';
import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, Database, Activity, PlusCircle, MinusCircle, Search, AlertCircle, Play } from 'lucide-react';


export default function CETComparator() {
  const [loading, setLoading] = useState(true);
  const [isComputing, setIsComputing] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const calculatePercentage = (oldVal, newVal) => {
    const oldNum = parseFloat(oldVal);
    const newNum = parseFloat(newVal);
    if (isNaN(oldNum) || isNaN(newNum) || oldNum === 0) return null;
    const diff = ((newNum - oldNum) / Math.abs(oldNum)) * 100;
    return diff.toFixed(1) + '%';
  };

  const fetchRecord = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ClientsSERVEX_WBO')
      .select('id, company_name, xml_actualizer_raw, XM_CET_import, Anormals_raw, created_at')
      .eq('company_name', 'WBO')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching record:", error);
    } else if (data) {
      setActiveRecord(data);
      if (data.Anormals_raw) {
        try {
          const parsed = JSON.parse(data.Anormals_raw);
          setReportData(parsed);
        } catch (e) {
          console.error("Failed to parse Anormals_raw:", e);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecord();
  }, []);

  const parseXMLToMap = (xmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) throw new Error('Invalid XML');

    const globalFeatures = Array.from(doc.getElementsByTagName("Feature"));
    const featureMap = new Map();
    for (const f of globalFeatures) {
      const fCode = f.getElementsByTagName("Code")[0]?.textContent;
      if (fCode) featureMap.set(fCode, f);
    }

    const products = Array.from(doc.getElementsByTagName('Product'));
    const productMap = new Map();

    for (const p of products) {
      const code = p.getElementsByTagName('Code')[0]?.textContent;
      if (!code) continue;

      const priceNode = p.getElementsByTagName('Price')[0];
      const basePrice = priceNode ? parseFloat(priceNode.getElementsByTagName('Value')[0]?.textContent || "0") : 0;
      
      const optionPrices = {};
      const featureRefs = Array.from(p.getElementsByTagName("FeatureRef"));
      
      for (const ref of featureRefs) {
        const refCode = ref.textContent;
        const featureNode = featureMap.get(refCode);
        if (featureNode) {
          const options = Array.from(featureNode.getElementsByTagName("Option"));
          for (const opt of options) {
            const optCode = opt.getElementsByTagName("Code")[0]?.textContent;
            if (optCode !== "C" && optCode !== "P") {
              const optDesc = opt.getElementsByTagName("Description")[0]?.textContent || optCode;
              const optPriceElem = opt.querySelector("OptionPrice > Value");
              const optPrice = optPriceElem ? parseFloat(optPriceElem.textContent || "0") : 0;
              if (optDesc && optPrice > 0) {
                optionPrices[optDesc] = optPrice;
              }
            }
          }
        }
      }
      
      productMap.set(code, {
        basePrice,
        optionPrices
      });
    }

    return productMap;
  };

  const computeComparison = async () => {
    if (!activeRecord) return;
    if (!activeRecord.xml_actualizer_raw) {
      alert("Baseline XML (xml_actualizer_raw) not found.");
      return;
    }
    if (!activeRecord.XM_CET_import) {
      alert("Modified XML (XM_CET_import) not found.");
      return;
    }

    setIsComputing(true);
    

    try {
      // Simulate slight delay for massive XMLs so UI doesn't completely freeze without feedback
      await new Promise(resolve => setTimeout(resolve, 100)); 

      const baseMap = parseXMLToMap(activeRecord.xml_actualizer_raw);
      const modMap = parseXMLToMap(activeRecord.XM_CET_import);

      const listPriceChanges = [];
      const optionPriceChanges = [];
      const newModels = [];
      const deletedModels = [];

      // Check additions and price changes
      for (const [sku, modData] of modMap.entries()) {
        const baseData = baseMap.get(sku);
        if (!baseData) {
          newModels.push(sku);
        } else {
          // Compare Base Price
          if (modData.basePrice !== baseData.basePrice) {
            listPriceChanges.push({
              model_id: sku,
              column_name: "List Price",
              old_value: `$${baseData.basePrice}`,
              new_value: `$${modData.basePrice}`,
              financial_impact: calculatePercentage(baseData.basePrice, modData.basePrice)
            });
          }

          // Compare Option Prices
          for (const [optCode, modPrice] of Object.entries(modData.optionPrices)) {
            const basePrice = baseData.optionPrices[optCode] || 0;
            if (modPrice !== basePrice) {
              optionPriceChanges.push({
                model_id: sku,
                column_name: optCode,
                old_value: `$${basePrice}`,
                new_value: `$${modPrice}`,
                financial_impact: calculatePercentage(basePrice, modPrice)
              });
            }
          }

          // Check if option was deleted (present in base, not in mod)
          for (const [optCode, basePrice] of Object.entries(baseData.optionPrices)) {
            if (modData.optionPrices[optCode] === undefined && basePrice > 0) {
              optionPriceChanges.push({
                model_id: sku,
                column_name: optCode,
                old_value: `$${basePrice}`,
                new_value: `$0`,
                financial_impact: "-100.0%"
              });
            }
          }
        }
      }

      // Check deletions
      for (const sku of baseMap.keys()) {
        if (!modMap.has(sku)) {
          deletedModels.push(sku);
        }
      }

      const reportPayload = {
        summary: {
          new_models_list: newModels,
          deleted_models_list: deletedModels,
          new_models_detected_count: newModels.length,
          deleted_models_detected_count: deletedModels.length
        },
        detected_changes: [...listPriceChanges, ...optionPriceChanges]
      };

      // Guardar en Supabase (Anormals_raw)
      
      
      const { error: updateError } = await supabase
        .from('ClientsSERVEX_WBO')
        .update({ Anormals_raw: JSON.stringify(reportPayload) })
        .eq('id', activeRecord.id);

      if (updateError) throw updateError;

      setReportData(reportPayload);
      alert("Comparison completed and saved successfully!");

    } catch (err) {
      console.error(err);
      alert(`Error during comparison: ${err.message}`);
    } finally {
      setIsComputing(false);
    }
  };

  const listPriceChanges = reportData?.detected_changes?.filter(c => c.column_name === 'List Price') || [];
  const optionPriceChanges = reportData?.detected_changes?.filter(c => c.column_name !== 'List Price') || [];
  const summaryRaw = reportData?.summary;

  const filteredListPriceChanges = listPriceChanges.filter(c => 
    (c.model_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.old_value || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.new_value || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOptionPriceChanges = optionPriceChanges.filter(c => 
    (c.model_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.column_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.old_value || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.new_value || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[85vh] bg-white text-xs font-semibold text-slate-500 font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#7f1d1d] border-t-transparent rounded-full animate-spin"></div>
        Initializing CET Configurator context...
      </div>
    </div>
  );

  return (
    <div className="min-h-[85vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased relative">
      
      <div className="w-full max-w-[90vw] mx-auto">
        
        {/* Header Principal */}
        <div className="mb-6 rounded-lg p-10 border border-[#7f1d1d]/20 bg-gradient-to-tr from-white/90 via-white/80 to-[#7f1d1d]/5 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-[0_2px_15px_rgba(70,71,117,0.05)] relative overflow-hidden">
           <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[200%] rotate-[15deg] bg-gradient-to-b from-[#7f1d1d]/5 to-transparent pointer-events-none" />
           
           <button 
             onClick={computeComparison} 
             disabled={isComputing}
             className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-[#7f1d1d] text-white rounded-md text-xs font-semibold hover:bg-[#34355a] transition-all disabled:opacity-50 z-20 shadow-sm"
           >
             {isComputing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
             {isComputing ? "Computing Deltas..." : "Execute CET Comparison"}
           </button>

           <h1 className="text-2xl font-light text-[#242424] tracking-wide relative z-10">
            CET Matrix Comparator: <span className="font-normal text-[#7f1d1d]">WBO</span>
           </h1>
           <p className="text-xs text-[#616161] mt-3 font-light tracking-[0.15em] uppercase relative z-10">
             1-to-1 analysis between Software Baseline (xml_actualizer_raw) & CET Modified Output (XM_CET_import)
           </p>
        </div>

        {!reportData ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] bg-slate-50/50 border border-slate-100 rounded-xl">
             <AlertCircle size={32} className="text-slate-300 mb-3" />
             <p className="text-sm font-medium text-slate-500">No comparison results found in Anormals_raw.</p>
             <p className="text-xs text-slate-400 mt-1">Click "Execute CET Comparison" to analyze the XML DOMs.</p>
          </div>
        ) : (
          <>
            {/* Data Map / Information Section */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="bg-gradient-to-br from-white to-slate-50/50 p-4 rounded-lg border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-2 hover:shadow-md transition-shadow relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#5B5FC7]/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                 <div className="flex items-center gap-2 text-[#7f1d1d]">
                    <Zap size={16} />
                    <h3 className="font-semibold text-[13px] tracking-tight">List Price Variations</h3>
                 </div>
                 <p className="text-[11.5px] text-slate-500 leading-relaxed font-light">
                   Monitors manual overrides to the base list price of each SKU injected directly in CET Designer.
                 </p>
              </div>
              <div className="bg-gradient-to-br from-white to-slate-50/50 p-4 rounded-lg border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-2 hover:shadow-md transition-shadow relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#5B5FC7]/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                 <div className="flex items-center gap-2 text-[#7f1d1d]">
                    <Database size={16} />
                    <h3 className="font-semibold text-[13px] tracking-tight">Option Price Variations</h3>
                 </div>
                 <p className="text-[11.5px] text-slate-500 leading-relaxed font-light">
                   Tracks modifications to feature options, prices, or newly cloned attributes configured in CET Designer.
                 </p>
              </div>
              <div className="bg-gradient-to-br from-white to-slate-50/50 p-4 rounded-lg border border-slate-200/60 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-2 hover:shadow-md transition-shadow relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#5B5FC7]/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                 <div className="flex items-center gap-2 text-[#7f1d1d]">
                    <Activity size={16} />
                    <h3 className="font-semibold text-[13px] tracking-tight">Additions & Deletions</h3>
                 </div>
                 <p className="text-[11.5px] text-slate-500 leading-relaxed font-light">
                   Identifies newly inserted models and deleted nodes from the source catalog within the CET environment.
                 </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 w-full">

              {/* Module 1 - List Price Variations */}
              <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
                <div className="px-4 py-3 bg-[#FAF9F8] border-b border-[#E0E0E0] flex items-center gap-2">
                  <Zap size={16} className="text-[#5B5FC7]" />
                  <h2 className="text-sm font-bold text-[#242424]">List Price Variations ({filteredListPriceChanges.length})</h2>
                </div>
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
                              <td className="px-4 py-3 font-semibold text-[#7f1d1d] font-mono">{c.new_value}</td>
                              <td className="px-4 py-3">
                                 <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${diffNum > 0 ? 'bg-[#7f1d1d]/10 text-[#7f1d1d]' : diffNum < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
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
                                <p className="text-xs text-slate-400">No List Price variations detected between XMLs.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Module 2 - Option Price Variations */}
              <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
                <div className="px-4 py-3 bg-[#FAF9F8] border-b border-[#E0E0E0] flex items-center gap-2">
                  <Database size={16} className="text-[#5B5FC7]" />
                  <h2 className="text-sm font-bold text-[#242424]">Option Price Variations ({filteredOptionPriceChanges.length})</h2>
                </div>
                <div className="w-full flex flex-col">
                  <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-2">
                     <Search size={14} className="text-slate-400" />
                     <input 
                       type="text" 
                       placeholder="Filter Option Prices..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full md:w-1/3 text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#7f1d1d] focus:border-[#7f1d1d] transition-all"
                     />
                  </div>
                  <div className="w-full overflow-x-auto max-h-[420px] overflow-y-auto custom-scrollbar">
                    <table className="table-fixed border-collapse text-left text-xs w-full">
                      <thead className="bg-[#7f1d1d]/5 sticky top-0 z-[1] backdrop-blur-sm shadow-sm">
                        <tr>
                          {['#', 'Model ID', 'Option Element', 'Baseline Value', 'CET Value', '% Diff'].map(h => (
                            <th key={h} className="px-4 py-3 text-[10px] font-bold text-[#7f1d1d] border-b border-[#7f1d1d]/20 uppercase tracking-wider">
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
                              <td className="px-4 py-3 text-[#7f1d1d] font-semibold text-[11px]">{c.column_name}</td>
                              <td className="px-4 py-3 text-slate-400 line-through decoration-slate-300 font-mono">{c.old_value}</td>
                              <td className="px-4 py-3 font-semibold text-[#7f1d1d] font-mono">{c.new_value}</td>
                              <td className="px-4 py-3">
                                 <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${diffNum > 0 ? 'bg-[#7f1d1d]/10 text-[#7f1d1d]' : diffNum < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
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
                                  <Database size={16} className="text-slate-300" />
                                </div>
                                <p className="text-xs text-slate-400">No Option Price variations detected.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Module 3 - Inventory Flux */}
              <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
                <div className="px-4 py-3 bg-[#FAF9F8] border-b border-[#E0E0E0] flex items-center gap-2">
                  <RefreshCw size={16} className="text-[#5B5FC7]" />
                  <h2 className="text-sm font-bold text-[#242424]">Additions and Deletions ({ (summaryRaw?.new_models_detected_count || 0) + (summaryRaw?.deleted_models_detected_count || 0) })</h2>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FCFCFC]">
                  
                  {/* Columna New Models */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                      <PlusCircle size={16} className="text-[#7f1d1d]" />
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">New Models Added via CET</span>
                    </div>
                    <div className="p-3 max-h-[400px] overflow-y-auto space-y-1">
                      {summaryRaw?.new_models_list && summaryRaw.new_models_list.length > 0 ? (
                        summaryRaw.new_models_list.map((model, idx) => (
                          <div key={idx} className="py-2 px-3 flex items-center justify-between font-mono text-xs rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                            <span className="text-slate-700 font-semibold">{model}</span>
                            <span className="text-[10px] text-[#7f1d1d] bg-[#7f1d1d]/10 px-2 py-0.5 rounded-full font-sans font-semibold">New SKU</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                            <PlusCircle size={16} className="text-slate-300" />
                          </div>
                          <p className="text-xs text-slate-400">No new models detected.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columna Deleted Models */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                      <MinusCircle size={16} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Models Removed in CET</span>
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
                          <p className="text-xs text-slate-400">No removed models detected.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}
