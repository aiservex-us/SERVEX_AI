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
  ChevronRight,
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
  
  const filteredData = currentCsvData.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return (
    <div className="flex h-full flex-col items-center justify-center bg-[#F5F5F5] font-sans">
      <div className="relative flex items-center justify-center">
        <RefreshCw className="animate-spin text-[#5B5FC7]" size={40} />
        <div className="absolute inset-0 animate-ping rounded-full border-4 border-[#5B5FC7] opacity-20"></div>
      </div>
      <span className="mt-4 text-sm font-semibold text-[#242424]">Cargando registros de Teams...</span>
    </div>
  );

  if (!data) return (
    <div className="flex h-full items-center justify-center p-10 bg-[#F5F5F5]">
      <div className="max-w-sm text-center p-8 bg-white rounded-xl shadow-lg border border-[#EDEBE9]">
        <AlertCircle className="mx-auto mb-4 text-[#C4314B]" size={48} />
        <h3 className="text-lg font-bold text-[#242424]">No se encontraron datos</h3>
        <p className="text-sm text-[#616161] mt-2">No hay registros disponibles en la tabla ClientsSERVEX actualmente.</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] font-sans text-[#242424] overflow-hidden">
      
      {/* HEADER SOFISTICADO */}
      <div className="bg-white px-6 py-4 border-b border-[#EDEBE9] shadow-sm z-20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#5B5FC7] p-2.5 rounded-lg shadow-md shadow-indigo-100">
              <Database size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-[#242424]">
                  {data.company_name}
                </h2>
                <span className="text-[10px] font-bold text-[#5B5FC7] bg-[#E8EBFA] px-2 py-0.5 rounded-full uppercase">
                  Solo Lectura
                </span>
              </div>
              <p className="text-xs text-[#616161] flex items-center gap-1 mt-0.5">
                Actualizado el {new Date(data.created_at).toLocaleDateString()} a las {new Date(data.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#F0F0F0] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('csv_raw')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                activeTab === 'csv_raw' 
                ? 'bg-white text-[#5B5FC7] shadow-sm scale-[1.02]' 
                : 'text-[#616161] hover:bg-white/50'
              }`}
            >
              <FileSpreadsheet size={16} />
              Manual CSV
            </button>
            <button
              onClick={() => setActiveTab('csvpdf_raw')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                activeTab === 'csvpdf_raw' 
                ? 'bg-white text-[#5B5FC7] shadow-sm scale-[1.02]' 
                : 'text-[#616161] hover:bg-white/50'
              }`}
            >
              <FileText size={16} />
              PDF Extraction
            </button>
          </div>
        </div>
      </div>

      {/* TOOLBAR DE ACCIÓN */}
      <div className="bg-white px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-[#EDEBE9]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#616161]" size={16} />
          <input 
            type="text"
            placeholder="Filtrar registros en tiempo real..."
            className="w-full pl-10 pr-4 py-2 bg-[#F0F0F0] border-transparent border-b-2 focus:border-[#5B5FC7] focus:bg-white transition-all outline-none text-sm rounded-t-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
            <button onClick={fetchLatestData} className="p-2 hover:bg-[#F0F0F0] rounded-full text-[#616161] transition-colors" title="Refrescar">
                <RefreshCw size={18} />
            </button>
            <div className="h-6 w-[1px] bg-[#EDEBE9]"></div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#616161] border border-[#D1D1D1] rounded hover:bg-[#F5F5F5]">
                <Download size={14} /> Exportar
            </button>
        </div>
      </div>

      {/* CONTENEDOR DE TABLA ESTILO TEAMS */}
      <div className="flex-1 m-4 mb-2 bg-white rounded-xl shadow-sm border border-[#EDEBE9] overflow-hidden flex flex-col">
        {filteredData.length > 0 ? (
          <div className="overflow-auto custom-scrollbar h-full">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF9F8] border-b border-[#EDEBE9]">
                  {Object.keys(currentCsvData[0]).map((header) => (
                    <th key={header} className="px-6 py-4 text-left font-bold text-[#242424] sticky top-0 bg-[#FAF9F8] z-10 whitespace-nowrap">
                      <div className="flex items-center gap-2 group cursor-pointer">
                        {header}
                        <Filter size={12} className="opacity-0 group-hover:opacity-100 text-[#5B5FC7] transition-opacity" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F0F0]">
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="group hover:bg-[#F5F5F7] transition-colors">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-6 py-3.5 text-[#424242] whitespace-nowrap border-r border-[#F0F0F0]/50 last:border-none">
                        {val && val !== '---' ? (
                          <span className="font-medium">{val}</span>
                        ) : (
                          <span className="text-[#BDBDBD] italic text-xs">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 py-20 bg-[#FAF9F8]">
            <div className="bg-white p-6 rounded-full shadow-inner mb-4">
                <TableIcon size={48} strokeWidth={1} className="text-[#D1D1D1]" />
            </div>
            <p className="text-base font-semibold text-[#242424]">Sin resultados coincidentes</p>
            <p className="text-sm text-[#616161]">Intenta ajustar los términos de búsqueda.</p>
          </div>
        )}
      </div>

      {/* BARRA DE ESTADO INFERIOR */}
      <div className="px-6 py-3 flex justify-between items-center text-xs font-medium text-[#616161]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Conectado a Base de Datos</span>
          </div>
          <span className="text-[#EDEBE9]">|</span>
          <span>Mostrando <strong>{filteredData.length}</strong> de <strong>{currentCsvData.length}</strong> registros</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#E8EBFA] px-3 py-1 rounded text-[#5B5FC7]">
            <span className="font-bold">MODO:</span>
            <span className="uppercase">{activeTab === 'csv_raw' ? 'Manual' : 'Automático'}</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { 
          width: 8px; 
          height: 8px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #D1D1D1; 
          border-radius: 4px;
          border: 2px solid #FFF;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: #A1A1A1; 
        }
        .custom-scrollbar::-webkit-scrollbar-track { 
          background: #F5F5F5; 
        }
      `}</style>
    </div>
  );
}