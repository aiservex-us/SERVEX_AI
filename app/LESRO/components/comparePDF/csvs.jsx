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
  Table as TableIcon
} from 'lucide-react';

export default function DataViewer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('csv_raw'); // 'csv_raw' o 'csvpdf_raw'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLatestData();
  }, []);

  const fetchLatestData = async () => {
    setLoading(true);
    try {
      // Obtenemos el registro más reciente de la tabla
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

  // Función para convertir el string CSV en un Array de objetos para la tabla
  const parseCSV = (csvString) => {
    if (!csvString || csvString === '---') return [];
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, ''));
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i];
        return obj;
      }, {});
    });
  };

  const currentCsvData = data ? parseCSV(data[activeTab]) : [];
  
  // Filtro de búsqueda básico
  const filteredData = currentCsvData.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return (
    <div className="flex h-96 items-center justify-center text-[#6264A7] font-sans">
      <RefreshCw className="animate-spin mr-2" size={20} />
      <span>Loading database records...</span>
    </div>
  );

  if (!data) return (
    <div className="p-10 text-center border-2 border-dashed rounded-lg border-gray-200">
      <AlertCircle className="mx-auto mb-2 text-gray-400" size={32} />
      <p className="text-gray-500">No records found in ClientsSERVEX table.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white font-sans text-[#242424]">
      
      {/* HEADER & MENU */}
      <div className="px-6 py-4 border-b border-[#EDEBE9] bg-[#FAF9F8]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Database size={18} className="text-[#6264A7]" />
              {data.company_name} <span className="text-[10px] font-normal text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded ml-2">Read Only</span>
            </h2>
            <p className="text-[11px] text-[#616161]">Last update: {new Date(data.created_at).toLocaleString()}</p>
          </div>

          <div className="flex items-center bg-white rounded-md border border-[#EDEBE9] p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('csv_raw')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-[12px] font-semibold transition-all ${
                activeTab === 'csv_raw' ? 'bg-[#6264A7] text-white shadow-md' : 'text-[#616161] hover:bg-[#F3F2F1]'
              }`}
            >
              <FileSpreadsheet size={14} />
              Manual CSV
            </button>
            <button
              onClick={() => setActiveTab('csvpdf_raw')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-[12px] font-semibold transition-all ${
                activeTab === 'csvpdf_raw' ? 'bg-[#6264A7] text-white shadow-md' : 'text-[#616161] hover:bg-[#F3F2F1]'
              }`}
            >
              <FileText size={14} />
              PDF Sync CSV
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="px-6 py-3 border-b border-[#EDEBE9] flex items-center gap-2">
        <Search size={14} className="text-gray-400" />
        <input 
          type="text"
          placeholder="Search in table..."
          className="bg-transparent border-none outline-none text-[12px] w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLE AREA */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-white">
        {filteredData.length > 0 ? (
          <table className="min-w-full border-collapse text-[11px]">
            <thead className="sticky top-0 bg-[#F3F2F1] z-10 shadow-sm">
              <tr>
                {Object.keys(currentCsvData[0]).map((header) => (
                  <th key={header} className="px-4 py-3 text-left font-bold text-[#444] border-b border-r border-[#EDEBE9] uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEBE9]">
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#FAF9F8] transition-colors">
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="px-4 py-2 border-r border-[#EDEBE9] text-[#616161] whitespace-nowrap">
                      {val || '---'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <TableIcon size={40} strokeWidth={1} className="mb-2" />
            <p className="text-[12px]">No data available to display in this section.</p>
          </div>
        )}
      </div>

      {/* FOOTER STATS */}
      <div className="px-6 py-2 bg-[#FAF9F8] border-t border-[#EDEBE9] flex justify-between items-center text-[10px] text-[#616161]">
        <div className="flex gap-4">
          <span>Rows: <strong>{filteredData.length}</strong></span>
          <span>Source: <strong>{activeTab === 'csv_raw' ? 'Raw Input' : 'PDF Extraction'}</strong></span>
        </div>
        <div className="flex items-center gap-1 text-[#6264A7] font-bold">
          <RefreshCw size={10} className="cursor-pointer" onClick={fetchLatestData} />
          <span>LIVE PREVIEW</span>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EDEBE9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}