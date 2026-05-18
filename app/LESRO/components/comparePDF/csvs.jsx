'use client';

import React, { useState, useEffect, useMemo } from 'react';
// Cambiado para usar el cliente del segundo proyecto del archivo anterior
import { supabaseSecondProject as supabase } from '@/app/lib/supabaseClient'; 
import FileSlotsManager from './FileSlotsManager'; 

export default function ClientSubmissionsMatrix() {
  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  
  // Filtros y Paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Matriz de Datos Local (Solo Lectura)
  const [localRows, setLocalRows] = useState([]);
  const [isSlotsModalOpen, setIsSlotsModalOpen] = useState(false);

  // 1. Cargar lista de clientes
  useEffect(() => {
    async function getSubmissionsList() {
      try {
        setLoading(true);
        const { data, error: sbError } = await supabase
          .from('client_original')
          .select('id, company_name, created_at, city')
          .order('created_at', { ascending: false });

        if (sbError) throw sbError;

        setSubmissions(data || []);
        if (data && data.length > 0) {
          setSelectedId(data[0].id.toString());
        }
      } catch (err) {
        console.error('❌ Error cargando registros de Supabase:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    getSubmissionsList();
  }, []);

  // 2. Cargar y unificar slots en memoria para visualización
  useEffect(() => {
    if (!selectedId) return;

    async function fetchFullSubmission() {
      try {
        setFetchingSlots(true);
        setSearchTerm(''); 
        setCurrentPage(1);

        const { data, error: sbError } = await supabase
          .from('client_original')
          .select('*')
          .eq('id', selectedId)
          .single();

        if (sbError) throw sbError;

        const targetSlots = [
          { data: data.data_slot_1 },
          { data: data.data_slot_2 },
          { data: data.data_slot_3 },
          { data: data.data_slot_4 },
          { data: data.data_slot_5 },
          { data: data.data_slot_6 },
          { data: data.data_slot_7 },
          { data: data.data_slot_8 },
        ];

        const flatRows = targetSlots
          .filter(slot => slot.data && Array.isArray(slot.data))
          .flatMap(slot => slot.data);

        setLocalRows(flatRows);

      } catch (err) {
        console.error('❌ Error al recuperar slots:', err);
      } finally {
        setFetchingSlots(false);
      }
    }
    fetchFullSubmission();
  }, [selectedId]);

  // Reset de página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 3. Extraer esquemas/llaves dinámicas de las columnas existentes
  const headers = useMemo(() => {
    if (!localRows || localRows.length === 0) return [];
    return Object.keys(localRows[0]);
  }, [localRows]);

  // 4. Filtrado de filas optimizado
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return localRows;
    const lowerCaseSearch = searchTerm.toLowerCase().trim();

    return localRows.filter((row) => {
      return Object.values(row).some((value) => {
        if (value === null || value === undefined) return false;
        return value.toString().toLowerCase().includes(lowerCaseSearch);
      });
    });
  }, [localRows, searchTerm]);

  // 5. Segmentación de Paginación
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, currentPage]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;

  // Manejador del explorador de slots reactivo (Solo lectura)
  const handleSelectSlotData = (slotContent) => {
    if (slotContent && (Array.isArray(slotContent) || typeof slotContent === 'object')) {
      const targetRows = Array.isArray(slotContent) ? slotContent : (slotContent.rows || []);
      setLocalRows(targetRows);
      setCurrentPage(1);
      setIsSlotsModalOpen(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[90vh] bg-white text-xs font-semibold text-[#616161] font-sans">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#5B5FC7] border-t-transparent rounded-full animate-spin"></div>
          Retrieving master data matrix...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-[90vw] mx-auto mt-10 bg-[#FDE7E9] border border-[#F3B0B4] text-[#A80007] rounded-sm text-xs font-sans">
        <span className="font-bold">Synchronization error:</span> {error}
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] bg-[#FFF] p-5 text-[#242424] font-sans antialiased">
      <div className="w-full max-w-[90vw] mx-auto">
        
        <div className="bg-white rounded-md border border-[#E0E0E0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col w-full">
          
          {/* Operations / Filters Header */}
          <div className="px-4 py-2 border-b border-[#E0E0E0] bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#242424]">Master Catalog Viewer</span>
              <span className="text-[10px] text-[#616161]">
                {fetchingSlots ? 'Updating matrix...' : 'Viewing original catalog, without changes or updates'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSlotsModalOpen(true)}
                className="bg-white border border-[#D2D2D2] hover:bg-[#F3F2F1] text-[#242424] text-[11px] font-medium px-2.5 py-1 rounded-sm transition-all flex items-center gap-1.5"
              >
                Explore Slots
              </button>

              <input
                type="text"
                placeholder="Search matrix..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] text-[#242424] placeholder-[#616161] focus:border-[#5B5FC7] outline-none transition-all w-[180px]"
              />

              <select
                id="submission-select"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="bg-white border border-[#D2D2D2] rounded-sm px-2 py-0.5 text-[11px] text-[#242424] focus:border-[#5B5FC7] outline-none cursor-pointer max-w-[180px]"
              >
                {submissions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.company_name || `ID: ${sub.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {paginatedRows.length === 0 ? (
            <div className="p-12 text-center text-[#616161] text-xs font-normal bg-white">
              No matching records found.
            </div>
          ) : (
            <div className="w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-gray-300">
              <table className="table-fixed border-collapse text-left text-xs w-max min-w-full">
                <thead className="sticky top-0 z-20 shadow-[0_1px_0_0_#E0E0E0]">
                  <tr>
                    <th className="w-12 px-2 py-2 text-center text-[10px] font-semibold text-[#5B5FC7] bg-gradient-to-b from-white to-[#FCFAFF] sticky left-0 z-30 border-r border-b border-[#E0E0E0] select-none">
                      Index
                    </th>
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-[11px] font-semibold text-[#242424] bg-gradient-to-b from-white to-[#FCFAFF] border-r border-b border-[#E0E0E0] min-w-[160px] max-w-[280px] whitespace-nowrap truncate"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#F0F0F0]">
                  {paginatedRows.map((row, index) => {
                    const absoluteIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <tr key={index} className="hover:bg-[#F7F5FA] transition-colors duration-75">
                        <td className="px-2 py-1.5 text-center text-[10px] font-semibold text-[#5B5FC7] border-r border-[#E0E0E0] sticky left-0 z-10 bg-white group-hover:bg-[#FCFAFF] border-b border-[#F0F0F0]">
                          {absoluteIndex}
                        </td>

                        {headers.map((header) => {
                          const cellValue = row[header];
                          return (
                            <td key={header} className="p-0 text-[#242424] border-r border-b border-[#F0F0F0] min-w-[160px] max-w-[280px]">
                              <div 
                                className="px-3 py-1.5 font-mono text-[11px] whitespace-nowrap truncate"
                                title={cellValue?.toString() || ''}
                              >
                                {cellValue !== null && cellValue !== undefined ? (
                                  cellValue.toString()
                                ) : (
                                  <span className="text-[#A19F9D] italic text-[10px]">null</span>
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

          {/* Pagination Footer */}
          <div className="bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] px-4 py-2 border-t border-[#E0E0E0] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-semibold text-[#616161] select-none">
            <div className="flex gap-4">
              <span>ATTRIBUTES: {headers.length}</span>
              <span>FILTERED RECORDS: {filteredRows.length} of {localRows.length}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white border border-[#D2D2D2] hover:bg-[#FCFAFF] text-[#242424] px-2 py-0.5 rounded-sm transition-all disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-[#242424] font-normal px-1">
                Page <strong className="font-semibold">{currentPage}</strong> of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-white border border-[#D2D2D2] hover:bg-[#FCFAFF] text-[#242424] px-2 py-0.5 rounded-sm transition-all disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: Data Slots Explorer */}
      {isSlotsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md border border-[#E0E0E0] shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-white via-[#FCFAFF] to-[#F7F3FF] border-b border-[#E0E0E0] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#242424]">Change Data Source</span>
                <span className="text-[10px] text-[#616161]">Select the structured set you wish to audit</span>
              </div>
              <button 
                onClick={() => setIsSlotsModalOpen(false)}
                className="text-[#616161] hover:text-[#242424] text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#FAFAFA]">
              <FileSlotsManager onSelectSlot={handleSelectSlotData} />
            </div>

            <div className="p-3 border-t border-[#E0E0E0] flex justify-end bg-white">
              <button
                type="button"
                onClick={() => setIsSlotsModalOpen(false)}
                className="bg-white border border-[#A19F9D] hover:bg-[#F3F2F1] text-[#242424] text-[11px] font-medium px-3 py-1 rounded-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}