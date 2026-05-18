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
        .select('company_name, csv_raw, csvpdf_raw, created_at')
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

  const parseCSV = (csvString, type) => {
    if (!csvString || csvString === '---') return [];
    
    const lines = csvString.trim().split('\n');
    if (lines.length < 1) return [];

    const delimiter = type === 'csv_raw' ? ';' : ',';
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

  const currentCsvData = data ? parseCSV(data[activeTab], activeTab) : [];
  
  const filteredData = currentCsvData.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#FFF] p-6">
      <RefreshCw className="animate-spin text-[#5B5FC7] mb-4" size={40} />
      <span className="text-sm font-semibold text-[#242424]">Synchronizing with SERVEX SYSTEM DATA...</span>
    </div>
  );

  if (!data) return (
    <div className="flex h-full w-full items-center justify-center p-6 bg-[#FFF]">
      <div className="max-w-sm w-full text-center p-8 bg-white rounded-xl shadow-lg border border-[#EDEBE9]">
        <AlertCircle className="mx-auto mb-4 text-[#C4314B]" size={48} />
        <h3 className="text-lg font-bold">No Data Connection</h3>
        <p className="text-sm text-[#616161] mt-2">No records were found in the database.</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-screen bg-[#FFF] font-sans text-[#242424] overflow-hidden">
      
      {/* COMPACT ALIGNED HEADER */}
      <div className="bg-white px-6 py-3 border-b border-[#EDEBE9] shadow-sm z-20 shrink-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-[#5B5FC7] p-2.5 rounded-lg shadow-md shrink-0">
              <Database size={18} className="text-white" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-extrabold tracking-tight text-[#242424] truncate">
                  {data.company_name}
                </h2>
                <span className="text-[9px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-2 py-0.5 rounded-full uppercase shrink-0 border border-[#5B5FC7]/10">
                  Read Only
                </span>
              </div>
              <p className="text-[10px] text-[#616161] font-medium truncate">
                Last updated: {new Date(data.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#F0F0F0] p-1 rounded-lg shrink-0 border border-[#EDEBE9]">
            <button
              onClick={() => setActiveTab('csv_raw')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                activeTab === 'csv_raw' ? 'bg-white text-[#5B5FC7] shadow-sm' : 'text-[#616161] hover:text-[#5B5FC7]'
              }`}
            >
              <FileSpreadsheet size={12} />
              <span>Manual Sync</span>
            </button>
            <button
              onClick={() => setActiveTab('csvpdf_raw')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                activeTab === 'csvpdf_raw' ? 'bg-white text-[#5B5FC7] shadow-sm' : 'text-[#616161] hover:text-[#5B5FC7]'
              }`}
            >
              <FileText size={12} />
              <span>PDF Intelligence</span>
            </button>
          </div>
        </div>
      </div>

      {/* REFINED TOOLBAR */}
      <div className="bg-white px-6 py-2.5 flex items-center justify-between gap-4 border-b border-[#EDEBE9] shrink-0 w-full">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={13} />
          <input 
            type="text"
            placeholder="Search records in table..."
            className="w-full pl-9 pr-4 py-2 bg-[#F0F0F0] border-transparent border-b-2 focus:border-[#5B5FC7] focus:bg-white transition-all outline-none text-[12px] rounded-t-md font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={fetchLatestData} 
              className="p-2 hover:bg-[#F0F0F0] rounded-full text-[#616161] transition-colors"
              title="Refresh data"
            >
                <RefreshCw size={15} />
            </button>
            <div className="h-6 w-[1px] bg-[#EDEBE9] mx-1"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-[#616161] border border-[#D1D1D1] rounded bg-white hover:bg-[#F5F5F5] transition-shadow shadow-sm">
                <Download size={13} /> <span>Export CSV</span>
            </button>
        </div>
      </div>

      {/* TABLE AREA - "MASTER" STYLE */}
      <div className="flex-1 m-4 bg-white rounded-xl shadow-sm border border-[#EDEBE9] flex flex-col overflow-hidden">
        {filteredData.length > 0 ? (
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="min-w-full border-separate border-spacing-0 text-[11px]">
              <thead>
                <tr className="bg-[#FAF9F8]">
                  {Object.keys(currentCsvData[0]).map((header) => (
                    <th key={header} className="px-4 py-2.5 text-left font-bold text-[#242424] sticky top-0 bg-[#FAF9F8] z-10 whitespace-nowrap border-b border-r border-[#EDEBE9]">
                      <div className="flex items-center gap-1.5 uppercase tracking-wider text-[9px]">
                        {header}
                        <Filter size={8} className="text-[#5B5FC7] opacity-40" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="group hover:bg-[#F5F5F7] transition-colors">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-4 py-2.5 text-[#424242] border-r border-[#F0F0F0]/30 last:border-none whitespace-nowrap">
                        {val && val !== '---' ? (
                          <span className="font-medium">{val}</span>
                        ) : (
                          <span className="text-[#BDBDBD] italic text-[10px]">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <TableIcon size={40} className="text-[#D1D1D1] mb-3" />
            <p className="text-sm font-bold text-[#616161]">No matches found</p>
            <p className="text-xs text-[#919191]">Try using different search terms</p>
          </div>
        )}
      </div>

      {/* REFINED FOOTER */}
      <div className="px-6 py-2 bg-white border-t border-[#EDEBE9] flex justify-between items-center text-[10px] font-bold text-[#616161] shrink-0 w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="uppercase tracking-tight">{filteredData.length} Records Loaded</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#5B5FC7]/10 px-3 py-1 rounded border border-[#5B5FC7]/20 text-[#5B5FC7] font-extrabold uppercase text-[9px]">
            {activeTab === 'csv_raw' ? 'Source: ERP Manual' : 'Source: AI PDF Extraction'}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D1D1; border-radius: 10px; border: 2px solid #FFF; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #A1A1A1; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F5F5F5; }
        
        table { 
          table-layout: auto !important; 
          width: max-content !important; 
        }
      `}</style>
    </div>
  );
}