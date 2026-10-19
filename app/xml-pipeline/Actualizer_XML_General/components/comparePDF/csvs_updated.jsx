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
    <div className="flex items-center justify-center py-10 bg-transparent text-xs font-semibold text-zinc-400 font-sans">
      <div className="flex items-center gap-2">
        <RefreshCw size={14} className="animate-spin text-zinc-300" />
        Retrieving master data matrix...
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-2.5 max-w-sm mx-auto my-3 bg-white/5 border border-white/10 text-zinc-300 rounded-lg text-xs font-sans text-center">
      <span className="font-semibold text-rose-400">Database notice:</span> No active catalog records found.
    </div>
  );

  return (
    <div className="w-full max-w-full min-w-0 flex flex-col bg-transparent font-sans antialiased">
      {/* ── Compact Header Toolbar (Transparent) ── */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 py-2 px-1 border-b border-white/10 bg-transparent text-zinc-200">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white tracking-wide uppercase">{data.company_name} Catalog</span>
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('csv_new_raw')}
              className={`px-2 py-0.5 rounded text-[9.5px] font-semibold transition-all ${
                activeTab === 'csv_new_raw' || activeTab === 'csv_raw' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Manual Sync
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('csvpdf_raw')}
              className={`px-2 py-0.5 rounded text-[9.5px] font-semibold transition-all ${
                activeTab === 'csvpdf_raw' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-400 hover:text-white'
              }`}
            >
              PDF Source
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <Search size={11} className="absolute left-2.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-white/5 border border-white/15 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all w-[130px] sm:w-[160px]"
            />
          </div>

          <button 
            onClick={fetchLatestData}
            type="button"
            className="p-1.5 bg-white/5 border border-white/10 hover:bg-white/15 rounded-lg text-zinc-300 hover:text-white transition-all cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw size={12} className={loading ? "animate-spin text-white" : ""} />
          </button>

          <button 
            type="button"
            onClick={handleDownloadCSV}
            disabled={filteredData.length === 0}
            className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-zinc-950 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-40"
          >
            <Download size={11} /> <span>CSV</span>
          </button>
        </div>
      </div>

      {/* ── Table Area (Transparent Container) ── */}
      {paginatedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-transparent">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center mb-2 border border-white/10">
            <Search className="w-4 h-4 text-zinc-400" />
          </div>
          <h4 className="text-[11px] font-semibold text-zinc-200">No data found in catalog</h4>
          <p className="text-[10px] text-zinc-500 max-w-xs mt-0.5">
            No records matched current search filter or catalog is empty.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-full min-w-0 overflow-x-auto relative custom-scrollbar max-h-[380px] rounded-lg border border-white/10 bg-transparent my-1.5">
          <table className="table-auto border-collapse text-left text-[10px] w-full min-w-[700px] bg-transparent">
            <thead className="sticky top-0 z-20 bg-zinc-900/80 backdrop-blur-md border-b border-white/10">
              <tr>
                <th className="w-9 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-wider text-zinc-400 sticky left-0 z-30 bg-zinc-900/80 border-r border-b border-white/10 select-none">
                  #
                </th>
                {Object.keys(currentCsvData[0]).map((header) => (
                  <th
                    key={header}
                    className="px-3 py-2 text-[10px] font-bold text-zinc-300 border-r border-b border-white/10 whitespace-nowrap truncate uppercase tracking-wider select-none bg-transparent"
                  >
                    <div className="flex items-center gap-1">
                      <span>{header}</span>
                      <Filter size={8} className="text-zinc-500" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 bg-transparent">
              {paginatedData.map((row, relativeIdx) => {
                const absoluteIdx = startIndex + relativeIdx;
                return (
                  <tr key={absoluteIdx} className="hover:bg-white/[0.04] transition-colors group bg-transparent">
                    <td className="px-2 py-1.5 text-center text-[9.5px] font-bold text-zinc-400 border-r border-b border-white/5 sticky left-0 z-10 bg-zinc-900/80 group-hover:bg-zinc-800/80 font-mono select-none">
                      {absoluteIdx + 1}
                    </td>

                    {Object.keys(currentCsvData[0]).map((header) => {
                      const cellValue = row[header];
                      const isModelOrPrice = header.toLowerCase().includes('model') || header.toLowerCase().includes('price') || header.toLowerCase().includes('sku');
                      return (
                        <td key={header} className="p-0 text-zinc-200 border-r border-b border-white/5 bg-transparent">
                          <div 
                            className={`px-3 py-1.5 font-sans text-[10px] whitespace-nowrap truncate ${isModelOrPrice ? 'font-bold text-white font-mono' : 'font-medium text-zinc-300'}`}
                            title={cellValue?.toString() || ''}
                          >
                            {cellValue !== null && cellValue !== undefined && cellValue !== '---' ? (
                              Array.isArray(cellValue) ? cellValue.join(', ') : cellValue.toString()
                            ) : (
                              <span className="text-zinc-500 italic text-[9px]">N/A</span>
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
      <div className="w-full flex items-center justify-between py-1.5 px-1 bg-transparent border-t border-white/10 text-[10px] font-medium text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <span>Attrs: <strong className="text-zinc-200">{currentCsvData.length > 0 ? Object.keys(currentCsvData[0]).length : 0}</strong></span>
          <span className="text-white/20">•</span>
          <span>Showing <strong className="text-zinc-200">{startIndex + 1}-{Math.min(endIndex, filteredData.length)}</strong> of <strong className="text-zinc-200">{filteredData.length}</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-2 py-0.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white rounded text-zinc-300 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer"
          >
            Prev
          </button>
          
          <span className="text-zinc-300 font-mono px-1 text-[10px]">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-2 py-0.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white rounded text-zinc-300 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}