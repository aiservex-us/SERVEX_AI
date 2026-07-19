'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { 
  Database, 
  FileSpreadsheet, 
  FileText, 
  RefreshCw, 
  Search,
  AlertCircle,
  Table as TableIcon,
  Download,
  Filter
} from 'lucide-react';

export default function DataViewer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('csv_raw'); 
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLatestData();
  }, []);

  const fetchLatestData = async () => {
    setLoading(true);
    try {
      const { data: record, error } = await supabase
        .from('ClientsSERVEX')
        .select('company_name, csv_raw, csv_new_raw, created_at')
        .eq('company_name', 'LESRO')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setData(record);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvString) => {
    if (!csvString || csvString === '---') return [];
    
    const lines = csvString.trim().split('\n');
    if (lines.length < 1) return [];

    // Determinar delimitador dinámicamente contando ocurrencias
    const sampleLine = lines.find(l => (l.match(/;/g) || []).length > 1 || (l.match(/,/g) || []).length > 1) || lines[0];
    const commaCount = (sampleLine.match(/,/g) || []).length;
    const semiCount = (sampleLine.match(/;/g) || []).length;
    const delimiter = semiCount > commaCount ? ';' : ',';
    
    const headers = lines[0].split(delimiter).map(h => h.replace(/"/g, '').trim());
    const dataLines = lines.slice(1);
    
    return dataLines.map(line => {
      const values = line.split(delimiter).map(v => v.replace(/"/g, '').trim());
      return headers.reduce((obj, header, i) => {
        const key = header || `Col_${i}`;
        obj[key] = values[i] || '';
        return obj;
      }, {});
    });
  };

  const currentCsvData = data ? parseCSV(data[activeTab]) : [];
  
  const filteredData = currentCsvData.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[90vh] bg-white text-xs font-semibold text-[#616161] font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#5B5FC7] border-t-transparent rounded-full animate-spin"></div>
        Retrieving master data matrix...
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-4 max-w-[90vw] mx-auto mt-10 bg-[#FDE7E9] border border-[#F3B0B4] text-[#A80007] rounded-sm text-xs font-sans">
      <span className="font-bold">Synchronization error:</span> No records were found in the database.
    </div>
  );

  return (
    <div className="min-h-[90vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          {/* Operations / Filters Header */}
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#242424]">{data.company_name}</span>
                <span className="text-[9px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-1.5 py-0.5 rounded-sm uppercase tracking-tight border border-[#5B5FC7]/10 select-none">
                  Read Only
                </span>
              </div>
              <span className="text-[10px] text-[#616161]">
                Last updated: {new Date(data.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Selector styled as ClientSubmissionsMatrix Controls */}
              <div className="flex items-center gap-1 bg-[#F0F0F0] p-0.5 rounded-sm border border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setActiveTab('csv_raw')}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all ${
                    activeTab === 'csv_raw' ? 'bg-white text-[#5B5FC7] shadow-xs' : 'text-[#616161] hover:text-[#5B5FC7]'
                  }`}
                >
                  Manual Sync
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('csv_new_raw')}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all ${
                    activeTab === 'csv_new_raw' ? 'bg-white text-[#5B5FC7] shadow-xs' : 'text-[#616161] hover:text-[#5B5FC7]'
                  }`}
                >
                  PDF Intelligence
                </button>
              </div>

              {/* Live Search */}
              <input
                type="text"
                placeholder="Search matrix..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] text-[#242424] placeholder-[#616161] focus:border-[#5B5FC7] outline-none transition-all w-[180px]"
              />

              {/* Actions */}
              <button 
                onClick={fetchLatestData}
                type="button"
                className="p-1 bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] rounded-sm text-[#616161] transition-colors"
                title="Refresh data"
              >
                <RefreshCw size={13} />
              </button>

              <button className="bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] text-[#242424] text-[11px] font-medium px-2.5 py-1 rounded-sm transition-all flex items-center gap-1.5 shadow-xs">
                <Download size={12} /> <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center bg-white/40 backdrop-blur-md">
              <div className="w-16 h-16 rounded-2xl bg-[#464775]/5 flex items-center justify-center mb-4 border border-[#464775]/10 shadow-inner">
                <svg className="w-8 h-8 text-[#464775]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1">No data found</h3>
              <p className="text-xs text-slate-500 max-w-sm font-medium">
                We couldn't find any records matching your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300">
              <table className="table-fixed border-collapse text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-semibold text-[#5B5FC7] bg-gradient-to-b from-white to-[#FCFAFF] sticky left-0 z-30 border-r border-b border-[#E0E0E0] select-none">
                      Index
                    </th>
                    {Object.keys(currentCsvData[0]).map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-[#242424] bg-gradient-to-b from-white to-[#FCFAFF] border-r border-b border-[#E0E0E0] min-w-[160px] max-w-[280px] whitespace-nowrap truncate uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-1.5">
                          {header}
                          <Filter size={8} className="text-[#5B5FC7] opacity-40" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#F0F0F0]">
                  {filteredData.map((row, idx) => {
                    return (
                      <tr key={idx} className="hover:bg-[#F7F5FA] transition-colors duration-75">
                        <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#5B5FC7] border-r border-[#E0E0E0] sticky left-0 z-10 bg-white group-hover:bg-[#FCFAFF] border-b border-[#F0F0F0]">
                          {idx + 1}
                        </td>

                        {Object.keys(currentCsvData[0]).map((header) => {
                          const cellValue = row[header];
                          return (
                            <td key={header} className="p-0 text-[#242424] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                              <div 
                                className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate"
                                title={cellValue?.toString() || ''}
                              >
                                {cellValue !== null && cellValue !== undefined && cellValue !== '---' ? (
                                  cellValue.toString()
                                ) : (
                                  <span className="text-[#A19F9D] italic text-[10px]">N/A</span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination/Information Footer */}
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-semibold text-[#616161] select-none">
            <div className="flex gap-4">
              <span className="uppercase tracking-tight">ATTRIBUTES: {currentCsvData.length > 0 ? Object.keys(currentCsvData[0]).length : 0}</span>
              <span className="uppercase tracking-tight">FILTERED RECORDS: {filteredData.length} of {currentCsvData.length}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-[#5B5FC7]/10 px-2.5 py-0.5 rounded border border-[#5B5FC7]/20 text-[#5B5FC7] font-extrabold uppercase text-[9px]">
                {activeTab === 'csv_raw' ? 'Source: ERP Manual' : 'Source: AI PDF Extraction'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}