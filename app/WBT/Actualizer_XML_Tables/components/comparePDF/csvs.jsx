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
  
  // Mapeado exacto a las columnas reales del DDL de la tabla ClientsSERVEX_WBO
  const [activeTab, setActiveTab] = useState('csv_raw'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- ESTADOS PARA PAGINACIÓN LOCAL ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 35;

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
      // Consulta corregida alineada estrictamente al DDL provisto para la entidad WBT
      const { data: record, error } = await supabase
        .from('ClientsSERVEX_WBT')
        .select('company_name, csv_raw, csvpdf_raw, informa_agent_raw, created_at')
        .eq('company_name', 'WBT')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setData(record);
    } catch (error) {
      console.error('Error fetching WBT data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- LECTURA DIRECTA DE LA ESTRUCTURA SANEADA EN JSONB / TEXT ---
  const getSanitizedData = (record, tab) => {
   if (!record || !record[tab]) return [];
  
  // Caso 1: Supabase ya lo parseó como Array de Objetos (JSONB)
  if (Array.isArray(record[tab])) {
    return record[tab];
  }
  
  const rawContent = record[tab];

  if (typeof rawContent === 'string') {
    const trimmed = rawContent.trim();
    
    // Caso 2: Es un string pero tiene estructura de JSON Array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        console.error("Error parsing JSON formatted string:", e);
      }
    }
    
    // Caso 3: Es un CSV plano en formato String (Fallback)
    try {
      const lines = trimmed.split(/\r?\n/);
      if (lines.length === 0 || lines[0] === '') return [];
      
      // Detectar separador común
      const separator = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(separator).map(h => h.replace(/^"|"$/g, '').trim());
      
      const parsedRows = lines.slice(1).map(line => {
        const values = line.split(separator).map(v => v.replace(/^"|"$/g, '').trim());
        // Create objeto dinámico { header: valor }
        const rowObj = {};
        headers.forEach((header, index) => {
          rowObj[header] = values[index] || '';
        });
        return rowObj;
      });
      
      return parsedRows.filter(row => Object.keys(row).length > 0 && Object.values(row).some(Boolean));
    } catch (csvError) {
      console.error("Error parsing native plain CSV format:", csvError);
    }
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
    const filename = `${data?.company_name || 'WBT'}_${activeTab === 'csv_raw' ? 'Sanitized_Manual' : 'Sanitized_PDF'}_${new Date().toISOString().slice(0,10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[90vh] bg-white text-xs font-semibold text-slate-500 font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
        Retrieving master data matrix for WBT...
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-4 max-w-[90vw] mx-auto mt-10 bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 shadow-xl shadow-red-500/10 rounded-xl rounded-sm text-xs font-sans">
      <span className="font-bold">Synchronization error:</span> 
    </div>
  );

  return (
    <div className="min-h-[90vh] bg-gradient-to-br from-[#F8F9FE] to-white p-6 md:p-8 text-slate-800 font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-2xl shadow-[#464775]/10 overflow-hidden flex flex-col w-full">
          
          {/* Operations / Filters Header */}
          <div className="px-4 py-2 border-b border-slate-100 bg-gradient-to-r from-slate-50/40 to-white flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Entity: {data.company_name}</span>
                <span className="text-[10px] font-bold text-[#464775] bg-[#464775]/10 px-3 py-1 rounded-full uppercase tracking-widest border border-[#464775]/10 select-none">
                  Active Sanitization
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Last data sync: {new Date(data.created_at).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Selector mapeado a las columnas JSONB / Text del DDL */}
              <div className="flex items-center gap-1 bg-[#F0F0F0] p-0.5 rounded-sm border border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('csv_raw')}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all ${
                    activeTab === 'csv_raw' ? 'bg-white text-[#464775] shadow-xs' : 'text-slate-500 hover:text-[#464775]'
                  }`}
                >
                  Manual Optimizer
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('csvpdf_raw')}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all ${
                    activeTab === 'csvpdf_raw' ? 'bg-white text-[#464775] shadow-xs' : 'text-slate-500 hover:text-[#464775]'
                  }`}
                >
                  PDF Intelligence.
                </button>
              </div>

              {/* Live Search */}
              <input
                type="text"
                placeholder="Search matrix..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-white border border-slate-200/60 rounded-sm px-2 py-0.5 text-[11px] text-slate-800 placeholder-[#616161] focus:border-[#464775] outline-none transition-all w-[180px]"
              />

              {/* Actions */}
              <button 
                onClick={fetchLatestData}
                type="button"
                className="p-1 bg-white border border-slate-200/60 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors"
                title="Refresh data"
              >
                <RefreshCw size={13} />
              </button>

              <button 
                type="button"
                onClick={handleDownloadCSV}
                disabled={filteredData.length === 0}
                className="bg-white border border-slate-200/60 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white text-slate-800 text-[11px] font-medium px-2.5 py-1 rounded-sm transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Download size={12} /> <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          {paginatedData.length === 0 ? (
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
              <table className="table-fixed border-collapse overflow-hidden overflow-hidden text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-semibold text-[#464775] bg-white/80 backdrop-blur-md sticky left-0 z-30 border-r border-b border-slate-100 select-none">
                      Index
                    </th>
                    {Object.keys(currentCsvData[0]).map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-slate-800 bg-white/80 backdrop-blur-md border-r border-b border-slate-100 min-w-[160px] max-w-[280px] whitespace-nowrap truncate uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-1.5">
                          {header}
                          <Filter size={8} className="text-[#464775] opacity-40" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#F0F0F0]">
                  {paginatedData.map((row, relativeIdx) => {
                    const absoluteIdx = startIndex + relativeIdx;
                    return (
                      <tr key={absoluteIdx} className="hover:bg-slate-50/80 hover:shadow-sm transition-colors duration-75">
                        <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#464775] border-r border-slate-100 sticky left-0 z-10 bg-white border-b border-slate-50">
                          {absoluteIdx + 1}
                        </td>

                        {Object.keys(currentCsvData[0]).map((header) => {
                          const cellValue = row[header];
                          return (
                            <td key={header} className="p-0 text-slate-800 border-r border-b border-slate-50 min-w-[160px] max-w-[280px]">
                              <div 
                                className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate"
                                title={cellValue?.toString() || ''}
                              >
                                {cellValue !== null && cellValue !== undefined && cellValue !== '---' ? (
                                  Array.isArray(cellValue) ? cellValue.join(', ') : cellValue.toString()
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

          {/* Pagination Controls & Information Footer */}
          <div className="bg-gradient-to-r from-slate-50/40 to-white px-4 py-2 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-semibold text-slate-500 select-none">
            <div className="flex gap-4">
              <span className="uppercase tracking-tight">ATTRIBUTES: {currentCsvData.length > 0 ? Object.keys(currentCsvData[0]).length : 0}</span>
              <span className="uppercase tracking-tight">SHOWING: {startIndex + 1}-{Math.min(endIndex, filteredData.length)} OF {filteredData.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1 bg-white border border-slate-200/60 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white rounded-sm text-slate-800 transition-colors flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              
              <span className="text-[11px] font-bold px-2 text-slate-800">
                PAGE {currentPage} OF {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1 bg-white border border-slate-200/60 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white rounded-sm text-slate-800 transition-colors flex items-center justify-center cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-[#464775]/10 px-2.5 py-0.5 rounded border border-[#464775]/20 text-[#464775] font-extrabold uppercase text-[10px]">
                {activeTab === 'csv_raw' ? 'Dataset: Sanitized Manual ERP' : 'Dataset: AI PDF Extraction'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}