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
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function DataViewer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Mapeado exacto a las columnas de la tabla: se cambia 'csv_optimizer_raw' por 'csv_raw'
  const [activeTab, setActiveTab] = useState('csv_raw'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- ESTADOS PARA PAGINACIÓN LOCAL ---
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchLatestData();
  }, []);

  // Resetea la página activa si se cambia de contexto (pestaña)
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Resetea la página activa si cambia el término de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const fetchLatestData = async () => {
    setLoading(true);
    try {
      // Consulta exacta alineada al DDL y filtrada por la entidad corporativa WBD
      const { data: record, error } = await supabase
        .from('ClientsSERVEX_WBD')
        .select('company_name, csv_raw, informa_agent_raw, created_at')
        .eq('company_name', 'WBD')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setData(record);
    } catch (error) {
      console.error('Error fetching WBD data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- LECTURA DIRECTA DE LA ESTRUCTURA SANEADA EN JSONB ---
  const getSanitizedData = (record, tab) => {
    if (!record || !record[tab]) return [];
    
    // Si Supabase ya lo parseó automáticamente como Array de objetos
    if (Array.isArray(record[tab])) {
      return record[tab];
    }
    
    // Si viene como string debido a la serialización previa
    try {
      if (typeof record[tab] === 'string') {
        return JSON.parse(record[tab]);
      }
    } catch (e) {
      console.error("Error interpretando JSONB slot:", e);
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
    const filename = `${data?.company_name || 'WBD'}_${activeTab === 'csv_raw' ? 'Sanitized_Manual' : 'Sanitized_PDF'}_${new Date().toISOString().slice(0,10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[90vh] bg-white text-xs font-semibold text-[#616161] font-sans">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-[#5B5FC7] border-t-transparent rounded-full animate-spin"></div>
        Retrieving master data matrix for WBD...
      </div>
    </div>
  );

  if (!data) return (
    <div className="p-4 max-w-[90vw] mx-auto mt-10 bg-[#FDE7E9] border border-[#F3B0B4] text-[#A80007] rounded-sm text-xs font-sans">
      <span className="font-bold">Synchronization error:</span> No active matrix found for entity "WBD" in ClientsSERVEX_WBD.
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
                <span className="text-xs font-bold text-[#242424]">Entity: {data.company_name}</span>
                <span className="text-[9px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-1.5 py-0.5 rounded-sm uppercase tracking-tight border border-[#5B5FC7]/10 select-none">
                  Saneamiento Activo
                </span>
              </div>
              <span className="text-[10px] text-[#616161]">
                Last data sync: {new Date(data.created_at).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Tab Selector mapeado a las nuevas columnas JSONB */}
              <div className="flex items-center gap-1 bg-[#F0F0F0] p-0.5 rounded-sm border border-[#E0E0E0]">
                <button
                  type="button"
                  onClick={() => setActiveTab('csv_raw')}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all ${
                    activeTab === 'csv_raw' ? 'bg-white text-[#5B5FC7] shadow-xs' : 'text-[#616161] hover:text-[#5B5FC7]'
                  }`}
                >
                  Manual Optimizer
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('informa_agent_raw')}
                  className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-all ${
                    activeTab === 'informa_agent_raw' ? 'bg-white text-[#5B5FC7] shadow-xs' : 'text-[#616161] hover:text-[#5B5FC7]'
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
                onChange={handleSearchChange}
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

              <button 
                type="button"
                onClick={handleDownloadCSV}
                disabled={filteredData.length === 0}
                className="bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] disabled:opacity-50 disabled:hover:bg-white text-[#242424] text-[11px] font-medium px-2.5 py-1 rounded-sm transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Download size={12} /> <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          {paginatedData.length === 0 ? (
            <div className="p-12 text-center text-[#616161] text-xs font-normal bg-white">
              No matching matching analytical records found inside {activeTab}.
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
                  {paginatedData.map((row, relativeIdx) => {
                    const absoluteIdx = startIndex + relativeIdx;
                    return (
                      <tr key={absoluteIdx} className="hover:bg-[#F7F5FA] transition-colors duration-75">
                        <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#5B5FC7] border-r border-[#E0E0E0] sticky left-0 z-10 bg-white border-b border-[#F0F0F0]">
                          {absoluteIdx + 1}
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
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-semibold text-[#616161] select-none">
            <div className="flex gap-4">
              <span className="uppercase tracking-tight">ATTRIBUTES: {currentCsvData.length > 0 ? Object.keys(currentCsvData[0]).length : 0}</span>
              <span className="uppercase tracking-tight">SHOWING: {startIndex + 1}-{Math.min(endIndex, filteredData.length)} OF {filteredData.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1 bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] disabled:opacity-40 disabled:hover:bg-white rounded-sm text-[#242424] transition-colors flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              
              <span className="text-[11px] font-bold px-2 text-[#242424]">
                PAGE {currentPage} OF {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1 bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] disabled:opacity-40 disabled:hover:bg-white rounded-sm text-[#242424] transition-colors flex items-center justify-center cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-[#5B5FC7]/10 px-2.5 py-0.5 rounded border border-[#5B5FC7]/20 text-[#5B5FC7] font-extrabold uppercase text-[9px]">
                {activeTab === 'csv_raw' ? 'Dataset: Sanitized Manual ERP' : 'Dataset: AI PDF Extraction'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}