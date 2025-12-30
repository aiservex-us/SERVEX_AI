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
    
    if (type === 'csv_raw') {
      const allLines = csvString.trim().split('\n');
      if (allLines.length <= 2) return [];
      
      const headers = allLines[2].split(';').map(h => h.replace(/"/g, '').trim());
      const dataLines = allLines.slice(3);
      
      return dataLines.map(line => {
        const values = line.split(';').map(v => v.replace(/"/g, '').trim());
        return headers.reduce((obj, header, i) => {
          const key = header || `Col_${i}`;
          obj[key] = values[i] || '';
          return obj;
        }, {});
      });
    }

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

  const currentCsvData = data ? parseCSV(data[activeTab], activeTab) : [];
  
  const filteredData = currentCsvData.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#F5F5F5] p-6">
      <RefreshCw className="animate-spin text-[#5B5FC7] mb-4" size={40} />
      <span className="text-sm font-semibold text-[#242424]">Sincronizando con Teams...</span>
    </div>
  );

  if (!data) return (
    <div className="flex h-full w-full items-center justify-center p-6 bg-[#F5F5F5]">
      <div className="max-w-sm w-full text-center p-8 bg-white rounded-xl shadow-lg border border-[#EDEBE9]">
        <AlertCircle className="mx-auto mb-4 text-[#C4314B]" size={48} />
        <h3 className="text-lg font-bold">Sin conexión a datos</h3>
        <p className="text-sm text-[#616161] mt-2">No se han encontrado registros.</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-screen bg-[#F5F5F5] font-sans text-[#242424] overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-white px-4 md:px-6 py-3 border-b border-[#EDEBE9] shadow-sm z-20 shrink-0 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-[#5B5FC7] p-2 rounded-lg shadow-md shrink-0">
              <Database size={20} className="text-white" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-extrabold tracking-tight text-[#242424] truncate">
                  {data.company_name}
                </h2>
                <span className="text-[9px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-2 py-0.5 rounded-full uppercase shrink-0">
                  Read Only
                </span>
              </div>
              <p className="text-[10px] text-[#616161] truncate">
                Actualizado: {new Date(data.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#F0F0F0] p-1 rounded-lg shrink-0">
            <button
              onClick={() => setActiveTab('csv_raw')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                activeTab === 'csv_raw' ? 'bg-white text-[#5B5FC7] shadow-sm' : 'text-[#616161]'
              }`}
            >
              <FileSpreadsheet size={12} />
              <span>Manual</span>
            </button>
            <button
              onClick={() => setActiveTab('csvpdf_raw')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                activeTab === 'csvpdf_raw' ? 'bg-white text-[#5B5FC7] shadow-sm' : 'text-[#616161]'
              }`}
            >
              <FileText size={12} />
              <span>PDF Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white px-4 md:px-6 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-[#EDEBE9] shrink-0 w-full">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={12} />
          <input 
            type="text"
            placeholder="Buscar en tabla..."
            className="w-full pl-9 pr-4 py-1.5 bg-[#F0F0F0] border-transparent border-b-2 focus:border-[#5B5FC7] focus:bg-white transition-all outline-none text-[11px] rounded-t-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center justify-end gap-2 shrink-0">
            <button onClick={fetchLatestData} className="p-1.5 hover:bg-[#F0F0F0] rounded-full text-[#616161]">
                <RefreshCw size={14} />
            </button>
            <div className="h-6 w-[1px] bg-[#EDEBE9]"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold text-[#616161] border border-[#D1D1D1] rounded hover:bg-[#F5F5F5]">
                <Download size={12} /> <span>Exportar</span>
            </button>
        </div>
      </div>

      {/* ÁREA DE TABLA - CORRECCIÓN CLAVE AQUÍ */}
      <div className="flex-1 m-2 bg-white rounded-lg shadow-sm border border-[#EDEBE9] flex flex-col overflow-hidden">
        {filteredData.length > 0 ? (
          /* overflow-auto permite el scroll tanto en X como en Y */
          <div className="flex-1 overflow-auto custom-scrollbar">
            {/* IMPORTANTÍSIMO: 
               1. Quitamos 'w-full' de la tabla.
               2. Usamos 'min-w-full' para que si hay pocos datos llene el ancho, 
                  pero permita crecer si hay muchos.
            */}
            <table className="min-w-full border-separate border-spacing-0 text-[10px]">
              <thead>
                <tr className="bg-[#FAF9F8]">
                  {Object.keys(currentCsvData[0]).map((header) => (
                    <th key={header} className="px-4 py-2 text-left font-bold text-[#242424] sticky top-0 bg-[#FAF9F8] z-10 whitespace-nowrap border-b border-r border-[#EDEBE9]">
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
                      <td key={i} className="px-4 py-2 text-[#424242] border-r border-[#F0F0F0]/50 last:border-none whitespace-nowrap">
                        {val && val !== '---' ? (
                          <span className="font-medium">{val}</span>
                        ) : (
                          <span className="text-[#BDBDBD] italic text-[9px]">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-10">
            <TableIcon size={32} className="text-[#D1D1D1] mb-2" />
            <p className="text-xs font-semibold text-[#616161]">No hay datos para mostrar</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-4 py-1.5 bg-white border-t border-[#EDEBE9] flex justify-between items-center text-[9px] font-medium text-[#616161] shrink-0 w-full">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span>{filteredData.length} registros</span>
        </div>
        <div className="bg-[#5B5FC7]/10 px-2 py-0.5 rounded text-[#5B5FC7] font-bold uppercase text-[8px]">
          {activeTab === 'csv_raw' ? 'Manual' : 'PDF Extraction'}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D1D1; border-radius: 10px; border: 2px solid #FFF; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F5F5F5; }
        
        /* FUERZA A LA TABLA A NO COLAPSAR: 
           Esto hace que el scroll horizontal aparezca automáticamente.
        */
        table { 
          table-layout: auto !important; 
          width: max-content !important; 
        }
      `}</style>
    </div>
  );
}