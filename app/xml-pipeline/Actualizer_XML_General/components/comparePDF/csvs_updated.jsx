'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { 
  Database, 
  FileSpreadsheet, 
  FileText, 
  RefreshCw, 
  Search,
  AlertCircle,
  Table as TableIcon,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function DataViewer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('csv_new_raw'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- ESTADOS PARA PAGINACIÓN LOCAL ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchLatestData();
  }, []);

  // Resetea la page activa si se cambia de contexto (pestaña)
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Resetea la page activa si cambia el término de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const fetchLatestData = async () => {
    setLoading(true);
    try {
      const { data: record, error } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .select('company_name, created_at, csv_new_raw')
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

  // --- LECTURA DIRECTA DE LA ESTRUCTURA SANEADA EN JSONB ---
  const getSanitizedData = (record, tab) => {
    if (!record || !record[tab]) return [];
    
    if (Array.isArray(record[tab])) {
      return record[tab];
    }
    
    try {
      if (typeof record[tab] === 'string') {
        return JSON.parse(record[tab]);
      }
    } catch (e) {
      console.error("Error interpreting JSONB slot:", e);
    }
    
    return [];
  };

  const currentCsvData = getSanitizedData(data, activeTab);
  
  const filteredData = currentCsvData.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // --- CÁLCULO DE SEGMENTO DE PÁGINA (PAGINACIÓN CLIENT-SIDE) ---
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // --- LOGICA DE DESCARGA E INYECCIÓN EN ARCHIVO CSV ---
  const handleDownloadCSV = () => {
    if (filteredData.length === 0) return;

    const headers = Object.keys(filteredData[0]);
    
    const csvRows = filteredData.map(row => 
      headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) {
          val = '';
        } else if (Array.isArray(val)) {
          val = val.join(', ');
        } else {
          val = String(val);
        }
        
        if (val.includes(';') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(';')
    );

    const csvContent = [headers.join(';'), ...csvRows].join('\n');
    
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const filename = `${data?.company_name || 'Catalog'}_${activeTab}_${new Date().toISOString().slice(0,10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[80vh] min-h-[80vh] bg-transparent text-xs font-semibold text-slate-500 font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
        Retrieving master data matrix...
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-4 max-w-[90vw] mx-auto mt-10 bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 shadow-xl shadow-red-500/10 rounded-xl rounded-sm text-xs font-sans">
      <span className="font-bold">Synchronization error:</span> No records were found in the database.
    </div>
  );

  return (
    <div className="h-[80vh] min-h-[80vh] flex flex-col justify-center items-center bg-transparent relative z-10 p-2 md:p-4 font-sans antialiased">
      <div className="w-full mx-auto">
        
        <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-[#464775]/30 shadow-lg shadow-[#464775]/5 overflow-hidden flex flex-col w-full">
          
          {/* Operations / Filters Header */}
          <div className="px-4 py-2.5 border-b border-[#464775]/15 bg-white/40 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{data.company_name} Catalog</span>
                <span className="text-[9px] font-bold text-[#464775] bg-[#464775]/10 px-2 py-0.5 rounded-full border border-[#464775]/20 select-none">
                  Current Catalog
                </span>
              </div>
              <span className="text-[9.5px] text-slate-500 font-medium">
                Last updated: {new Date(data.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Selector */}
              <div className="flex items-center gap-0.5 bg-[#464775]/5 p-0.5 rounded-lg border border-[#464775]/15">
                <button
                  type="button"
                  onClick={() => setActiveTab('csv_raw')}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                    activeTab === 'csv_new_raw' ? 'bg-white text-[#464775] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Manual Sync
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('csvpdf_raw')}
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                    activeTab === 'csvpdf_raw' ? 'bg-white text-[#464775] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  PDF Source
                </button>
              </div>

              {/* Live Search */}
              <div className="relative flex items-center">
                <Search size={12} className="absolute left-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-white/70 border border-[#464775]/25 rounded-lg pl-7 pr-2.5 py-0.5 text-[10.5px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#464775] focus:bg-white transition-all w-[160px]"
                />
              </div>

              {/* Actions */}
              <button 
                onClick={fetchLatestData}
                type="button"
                className="p-1 bg-white/70 border border-[#464775]/25 hover:bg-[#464775]/10 rounded-lg text-[#464775] transition-all shadow-2xs"
                title="Refresh data"
              >
                <RefreshCw size={12} className={loading ? "animate-spin text-[#464775]" : ""} />
              </button>

              <button 
                type="button"
                onClick={handleDownloadCSV}
                disabled={filteredData.length === 0}
                className="px-2.5 py-1 bg-[#464775] hover:bg-[#3b3c63] disabled:opacity-40 text-white rounded-lg transition-all flex items-center gap-1 text-[10.5px] font-semibold shadow-2xs"
              >
                <Download size={11} /> <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          {paginatedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-white/30 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-[#464775]/10 flex items-center justify-center mb-2.5 border border-[#464775]/20">
                <svg className="w-6 h-6 text-[#464775]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-xs font-bold text-slate-800 mb-0.5">No data found</h3>
              <p className="text-[10px] text-slate-500 max-w-xs font-medium">
                We couldn't find any records matching your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-300 max-h-[58vh]">
              <table className="table-fixed border-collapse text-left text-[10px] w-max min-w-full">
                <thead className="sticky top-0 z-20 bg-[#464775]/10 backdrop-blur-md border-b border-[#464775]/20">
                  <tr>
                    <th className="w-10 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-[#464775] bg-[#464775]/10 backdrop-blur-md sticky left-0 z-30 border-r border-b border-[#464775]/20 select-none">
                      #
                    </th>
                    {Object.keys(currentCsvData[0]).map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[10px] font-bold text-[#464775] bg-[#464775]/10 backdrop-blur-md border-r border-b border-[#464775]/20 min-w-[150px] max-w-[260px] whitespace-nowrap truncate uppercase tracking-wider select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span>{header}</span>
                          <Filter size={9} className="text-[#464775] opacity-50" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white/60 divide-y divide-[#464775]/10">
                  {paginatedData.map((row, relativeIdx) => {
                    const absoluteIdx = startIndex + relativeIdx;
                    return (
                      <tr key={absoluteIdx} className="hover:bg-[#464775]/10 transition-colors">
                        <td className="px-2 py-1.5 text-center text-[9.5px] font-bold text-[#464775] border-r border-[#464775]/10 sticky left-0 z-10 bg-white/90 group-hover:bg-[#464775]/10 border-b border-[#464775]/10 font-mono">
                          {absoluteIdx + 1}
                        </td>

                        {Object.keys(currentCsvData[0]).map((header) => {
                          const cellValue = row[header];
                          const isModelOrPrice = header.toLowerCase().includes('model') || header.toLowerCase().includes('price') || header.toLowerCase().includes('sku');
                          return (
                            <td key={header} className="p-0 text-slate-800 border-r border-b border-[#464775]/10 min-w-[150px] max-w-[260px]">
                              <div 
                                className={`px-3 py-1.5 font-sans text-[10px] whitespace-nowrap truncate ${isModelOrPrice ? 'font-bold text-[#464775] font-mono' : 'font-medium text-slate-700'}`}
                                title={cellValue?.toString() || ''}
                              >
                                {cellValue !== null && cellValue !== undefined && cellValue !== '---' ? (
                                  Array.isArray(cellValue) ? cellValue.join(', ') : cellValue.toString()
                                ) : (
                                  <span className="text-slate-300 italic text-[9px]">N/A</span>
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

          {/* Footer */}
          <div className="bg-white/40 backdrop-blur-md px-4 py-2 border-t border-[#464775]/15 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-medium text-slate-600 select-none">
            <div className="flex items-center gap-3">
              <span>Attributes: <strong className="text-slate-800 font-bold">{currentCsvData.length > 0 ? Object.keys(currentCsvData[0]).length : 0}</strong></span>
              <span className="text-[#464775]/30">|</span>
              <span>Showing <strong className="text-slate-800 font-bold">{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</strong> of <strong className="text-slate-800 font-bold">{filteredData.length}</strong></span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-2.5 py-0.5 bg-white/80 border border-[#464775]/25 hover:bg-[#464775] hover:text-white rounded-md text-[#464775] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[10px]"
              >
                Previous
              </button>
              
              <span className="text-[#464775] font-bold px-1.5 text-[10px]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-0.5 bg-white/80 border border-[#464775]/25 hover:bg-[#464775] hover:text-white rounded-md text-[#464775] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-[10px]"
              >
                Next
              </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}