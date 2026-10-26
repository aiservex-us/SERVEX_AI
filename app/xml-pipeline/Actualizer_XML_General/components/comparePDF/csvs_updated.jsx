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

export default function DataViewer({ isDarkMode = true }) {
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
    <div className={`flex items-center justify-center py-10 bg-transparent text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-sans`}>
      <div className="flex items-center gap-2">
        <RefreshCw size={14} className={`animate-spin ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`} />
        Retrieving master data matrix...
      </div>
    </div>
  );

  if (!data) return (
    <div className={`p-2.5 max-w-sm mx-auto my-3 border rounded-lg text-xs font-sans text-center ${
      isDarkMode ? 'bg-white/5 border-white/10 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
    }`}>
      <span className="font-semibold text-rose-400">Database notice:</span> No active catalog records found.
    </div>
  );

  return (
    <div className="w-full max-w-full min-w-0 flex flex-col bg-transparent font-sans antialiased">
      {/* ── Compact Header Toolbar (Transparent) ── */}
      <div className={`w-full flex flex-wrap items-center justify-between gap-2 py-2 px-1 border-b ${
        isDarkMode ? 'border-white/10 text-zinc-200' : 'border-slate-200 text-slate-800'
      } bg-transparent`}>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-wide uppercase`}>{data.company_name} Catalog</span>
          <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('csv_new_raw')}
              className={`px-2 py-0.5 rounded text-[9.5px] font-semibold transition-all ${
                activeTab === 'csv_new_raw' || activeTab === 'csv_raw'
                  ? isDarkMode ? 'bg-white text-zinc-950 shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                  : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manual Sync
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('csvpdf_raw')}
              className={`px-2 py-0.5 rounded text-[9.5px] font-semibold transition-all ${
                activeTab === 'csvpdf_raw'
                  ? isDarkMode ? 'bg-white text-zinc-950 shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                  : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PDF Source
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search size={11} className={`absolute left-2.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'} pointer-events-none`} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`rounded-lg pl-7 pr-2.5 py-1 text-[11px] transition-all w-[130px] sm:w-[160px] focus:outline-none ${
                isDarkMode
                  ? 'bg-white/5 border border-white/15 text-white placeholder:text-zinc-500 focus:border-white/30 focus:bg-white/10'
                  : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white shadow-xs'
              }`}
            />
          </div>

          <button 
            onClick={fetchLatestData}
            type="button"
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 border border-white/10 hover:bg-white/15 text-zinc-300 hover:text-white'
                : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-xs'
            }`}
            title="Refresh data"
          >
            <RefreshCw size={12} className={loading ? `animate-spin ${isDarkMode ? 'text-white' : 'text-slate-900'}` : ""} />
          </button>

          <button 
            type="button"
            onClick={handleDownloadCSV}
            disabled={filteredData.length === 0}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-40 ${
              isDarkMode ? 'bg-white hover:bg-zinc-200 text-zinc-950' : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Download size={11} /> <span>CSV</span>
          </button>
        </div>
      </div>

      {/* ── Table Area (Transparent Container) ── */}
      {paginatedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-transparent">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 border ${
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <Search className={`w-4 h-4 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`} />
          </div>
          <h4 className={`text-[11px] font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>No data found in catalog</h4>
          <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'} max-w-xs mt-0.5`}>
            No records matched current search filter or catalog is empty.
          </p>
        </div>
      ) : (
        <div className={`w-full max-w-full min-w-0 overflow-x-auto relative custom-scrollbar max-h-[380px] rounded-lg border ${
          isDarkMode ? 'border-white/10 bg-transparent' : 'border-slate-200 bg-white/90 shadow-xs'
        } my-1.5`}>
          <table className="table-auto border-collapse text-left text-[10px] w-full min-w-[700px] bg-transparent">
            <thead className={`sticky top-0 z-20 backdrop-blur-md border-b ${
              isDarkMode ? 'bg-zinc-900/80 border-white/10' : 'bg-slate-100/95 border-slate-200'
            }`}>
              <tr>
                <th className={`w-9 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider sticky left-0 z-30 border-r border-b select-none ${
                  isDarkMode
                    ? 'text-zinc-400 bg-zinc-900/80 border-white/10'
                    : 'text-slate-500 bg-slate-100/95 border-slate-200'
                }`}>
                  #
                </th>
                {Object.keys(currentCsvData[0]).map((header) => (
                  <th
                    key={header}
                    className={`px-3 py-2 text-[10px] font-bold border-r border-b whitespace-nowrap truncate uppercase tracking-wider select-none bg-transparent ${
                      isDarkMode ? 'text-zinc-300 border-white/10' : 'text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{header}</span>
                      <Filter size={8} className={isDarkMode ? 'text-zinc-500' : 'text-slate-400'} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className={`divide-y ${isDarkMode ? 'divide-white/5' : 'divide-slate-100'} bg-transparent`}>
              {paginatedData.map((row, relativeIdx) => {
                const absoluteIdx = startIndex + relativeIdx;
                return (
                  <tr key={absoluteIdx} className={`transition-colors group bg-transparent ${
                    isDarkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50/80'
                  }`}>
                    <td className={`px-2 py-1.5 text-center text-[9.5px] font-bold border-r border-b sticky left-0 z-10 font-mono select-none ${
                      isDarkMode
                        ? 'text-zinc-400 border-white/5 bg-zinc-900/80 group-hover:bg-zinc-800/80'
                        : 'text-slate-500 border-slate-100 bg-slate-50/95 group-hover:bg-slate-100'
                    }`}>
                      {absoluteIdx + 1}
                    </td>

                    {Object.keys(currentCsvData[0]).map((header) => {
                      const cellValue = row[header];
                      const isModelOrPrice = header.toLowerCase().includes('model') || header.toLowerCase().includes('price') || header.toLowerCase().includes('sku');
                      return (
                        <td key={header} className={`p-0 border-r border-b ${isDarkMode ? 'text-zinc-200 border-white/5' : 'text-slate-700 border-slate-100'} bg-transparent`}>
                          <div 
                            className={`px-3 py-1.5 font-sans text-[10px] whitespace-nowrap truncate ${
                              isModelOrPrice 
                                ? isDarkMode ? 'font-bold text-white font-mono' : 'font-bold text-slate-900 font-mono'
                                : isDarkMode ? 'font-medium text-zinc-300' : 'font-medium text-slate-700'
                            }`}
                            title={cellValue?.toString() || ''}
                          >
                            {cellValue !== null && cellValue !== undefined && cellValue !== '---' ? (
                              Array.isArray(cellValue) ? cellValue.join(', ') : cellValue.toString()
                            ) : (
                              <span className={`italic text-[9px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>N/A</span>
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

      {/* ── Compact Transparent Footer ── */}
      <div className={`w-full flex items-center justify-between py-1.5 px-1 bg-transparent border-t text-[10px] font-medium select-none ${
        isDarkMode ? 'border-white/10 text-zinc-400' : 'border-slate-200 text-slate-500'
      }`}>
        <div className="flex items-center gap-2">
          <span>Attrs: <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{currentCsvData.length > 0 ? Object.keys(currentCsvData[0]).length : 0}</strong></span>
          <span className={isDarkMode ? 'text-white/20' : 'text-slate-300'}>•</span>
          <span>Showing <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</strong> of <strong className={isDarkMode ? 'text-zinc-200' : 'text-slate-700'}>{filteredData.length}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className={`px-2 py-0.5 rounded font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-zinc-300'
                : 'bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-600 shadow-xs'
            }`}
          >
            Prev
          </button>
          
          <span className={`font-mono px-1 text-[10px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className={`px-2 py-0.5 rounded font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-zinc-300'
                : 'bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-600 shadow-xs'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}