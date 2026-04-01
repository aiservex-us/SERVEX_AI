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
    <div className="flex h-full w-full flex-col items-center justify-center bg-white p-6">
      <RefreshCw className="animate-spin text-[#5B5FC7] mb-4" size={40} />
      <span className="text-sm font-semibold text-[#242424]">Sincronizando datos...</span>
    </div>
  );

  if (!data) return (
    <div className="flex h-full w-full items-center justify-center p-6 bg-white">
      <div className="max-w-sm w-full text-center p-8 bg-white rounded-xl shadow-lg border border-[#EDEBE9]">
        <AlertCircle className="mx-auto mb-4 text-[#C4314B]" size={48} />
        <h3 className="text-lg font-bold">Sin conexión a datos</h3>
      </div>
    </div>
  );

  return (
    // CAMBIO CLAVE: w-full en lugar de w-screen y h-full para respetar el layout padre
    <div className="flex flex-col h-full w-[80vvw] bg-[#FAF9F8] font-sans text-[#242424] overflow-hidden">
      
      {/* HEADER - shrink-0 evita que se colapse */}
      <header className="bg-white px-4 md:px-6 py-3 border-b border-[#EDEBE9] shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#5B5FC7] p-2 rounded-lg shadow-sm">
              <Database size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm md:text-base font-bold truncate text-[#242424]">
                {data.company_name}
              </h2>
              <p className="text-[10px] text-[#616161]">
                Última actualización: {new Date(data.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#F0F0F0] p-1 rounded-lg self-start md:self-center">
            <button
              onClick={() => setActiveTab('csv_raw')}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                activeTab === 'csv_raw' ? 'bg-white text-[#5B5FC7] shadow-sm' : 'text-[#616161]'
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setActiveTab('csvpdf_raw')}
              className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
                activeTab === 'csvpdf_raw' ? 'bg-white text-[#5B5FC7] shadow-sm' : 'text-[#616161]'
              }`}
            >
              PDF Sync
            </button>
          </div>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="bg-white px-4 md:px-6 py-2 flex items-center gap-3 border-b border-[#EDEBE9] shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={14} />
          <input 
            type="text"
            placeholder="Filtrar registros..."
            className="w-full pl-9 pr-4 py-1.5 bg-[#F3F2F1] border-none focus:ring-2 focus:ring-[#5B5FC7]/20 transition-all outline-none text-[11px] rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={fetchLatestData} className="p-2 hover:bg-[#F3F2F1] rounded-full transition-colors text-[#616161]">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ÁREA DE TABLA - El contenedor mágico */}
      <div className="flex-1 overflow-hidden p-2 md:p-4">
        <div className="h-full w-full bg-white rounded-lg border border-[#EDEBE9] shadow-sm flex flex-col overflow-hidden">
          {filteredData.length > 0 ? (
            // overflow-auto aquí permite scroll interno horizontal y vertical
            <div className="flex-1 overflow-auto custom-scrollbar relative">
              <table className="w-full border-separate border-spacing-0">
                <thead className="sticky top-0 z-20 bg-[#FAF9F8]">
                  <tr>
                    {Object.keys(currentCsvData[0]).map((header) => (
                      <th 
                        key={header} 
                        className="px-4 py-2.5 text-left text-[9px] font-black uppercase tracking-wider text-[#616161] border-b border-r border-[#EDEBE9] whitespace-nowrap"
                      >
                        <div className="flex items-center gap-2">
                          {header}
                          <Filter size={8} className="text-[#5B5FC7]" />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEBE9]">
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#F3F2F1]/50 transition-colors">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="px-4 py-2 text-[10px] text-[#242424] border-r border-[#EDEBE9]/50 whitespace-nowrap">
                          {val || <span className="text-gray-300">---</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-60">
              <TableIcon size={40} className="text-[#D1D1D1] mb-2" />
              <p className="text-xs font-medium">No se encontraron resultados</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="px-6 py-2 bg-white border-t border-[#EDEBE9] flex justify-between items-center shrink-0">
        <span className="text-[10px] font-bold text-[#616161]">
          {filteredData.length} FILAS ENCONTRADAS
        </span>
        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1 text-[10px] font-bold text-[#5B5FC7] hover:bg-[#5B5FC7]/5 rounded transition-colors">
                <Download size={12} /> Descargar CSV
            </button>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #C8C6C4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F3F2F1; }
        
        /* Previene que la tabla colapse si hay pocas columnas */
        table { min-width: 100%; }
      `}</style>
    </div>
  );
}