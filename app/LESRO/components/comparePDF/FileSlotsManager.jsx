'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export default function FileSlotsManager({ onSelectSlot }) {
  const [loading, setLoading] = useState(true);
  const [submissionData, setSubmissionData] = useState(null);
  const [availableFiles, setAvailableFiles] = useState([]);
  const [error, setError] = useState(null);
  const [processingSlot, setProcessingSlot] = useState(null);
  
  const fileInputRef = useRef(null);
  const targetSlotRef = useRef(null);

  // Mapeo maestro estático alineado con tu DDL (excluyendo el slot 7 faltante)
  const ALL_SLOTS = [
    { key: 'data_slot_1', label: 'Slot 01' },
    { key: 'data_slot_2', label: 'Slot 02' },
    { key: 'data_slot_3', label: 'Slot 03' },
    { key: 'data_slot_4', label: 'Slot 04' },
    { key: 'data_slot_5', label: 'Slot 05' },
    { key: 'data_slot_6', label: 'Slot 06' },
    { key: 'data_slot_8', label: 'Slot 08' },
  ];

  const fetchUserSlots = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      if (!session?.user) {
        setError('No se encontró una sesión activa o credenciales empresariales.');
        return;
      }

      // Consulta de visualización y estado de carga: Exclusiva de client_submissions
      const { data, error: dbError } = await supabase
        .from('client_submissions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (dbError && dbError.code !== 'PGRST116') throw dbError;

      if (data) {
        setSubmissionData(data);
        
        // Mapear el estado actual de los slots en DB
        const mapped = ALL_SLOTS.map(slot => ({
          ...slot,
          data: data[slot.key]
        }));
        
        setAvailableFiles(mapped);
      }
    } catch (err) {
      console.error('Error en infraestructura SVX Ingestion Engine:', err);
      setError('Error de sincronización con la infraestructura de ingesta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSlots();
  }, []);

  // Función interna para parsear de manera nativa texto plano de CSV a JSON estructurado
  const parseCSVToJSON = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];
    
    // Tratamiento adaptativo de delimitadores comunes comerciales
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.split(delimiter);
      const obj = {};
      headers.forEach((header, index) => {
        const val = values[index];
        obj[header] = val !== undefined ? val.trim().replace(/^["']|["']$/g, '') : null;
      });
      return obj;
    });
  };

  // Disparador del explorador de archivos asignado a un slot objetivo
  const triggerFileInput = (slotKey) => {
    targetSlotRef.current = slotKey;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Manejador del Input File (Lectura e Inyección Masiva en Supabase)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const slotKey = targetSlotRef.current;
    if (!file || !slotKey) return;

    try {
      setProcessingSlot(slotKey);
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const text = event.target.result;
          const parsedRows = parseCSVToJSON(text);

          if (parsedRows.length === 0) {
            alert('El archivo no contiene filas procesables.');
            return;
          }

          // Construcción de la estructura de metadatos unificada
          const payload = {
            fileName: file.name,
            rowCount: parsedRows.length,
            uploadedAt: new Date().toISOString(),
            rows: parsedRows
          };

          // Inyección en paralelo simétrica usando el user_id de la sesión/registro actual
          const [resSubmissions, resOriginal] = await Promise.all([
            supabase
              .from('client_submissions')
              .update({ [slotKey]: payload })
              .eq('user_id', submissionData.user_id),
            supabase
              .from('client_original')
              .update({ [slotKey]: payload })
              .eq('user_id', submissionData.user_id)
          ]);

          if (resSubmissions.error) throw resSubmissions.error;
          if (resOriginal.error) throw resOriginal.error;

          await fetchUserSlots(); // Re-sincronización en caliente
        } catch (innerErr) {
          console.error(innerErr);
          alert('Error crítico convirtiendo o guardando el dataset en el cluster.');
        } finally {
          setProcessingSlot(null);
          e.target.value = ''; // Limpieza del buffer del input
        }
      };

      reader.readAsText(file);
    } catch (err) {
      console.error(err);
      setProcessingSlot(null);
    }
  };

  // Remoción del set de datos en caliente (Vaciado sincrónico en cascada de ambas tablas)
  const handleDeleteSlot = async (slotKey, fileName) => {
    if (!window.confirm(`¿Confirmar purga y vaciado completo del slot asignado a "${fileName}"?`)) return;

    try {
      setProcessingSlot(slotKey);

      // Limpieza simultánea garantizando la remoción en ambas tablas apuntando al user_id
      const [resSubmissions, resOriginal] = await Promise.all([
        supabase
          .from('client_submissions')
          .update({ [slotKey]: null })
          .eq('user_id', submissionData.user_id),
        supabase
          .from('client_original')
          .update({ [slotKey]: null })
          .eq('user_id', submissionData.user_id)
      ]);

      if (resSubmissions.error) throw resSubmissions.error;
      if (resOriginal.error) throw resOriginal.error;

      await fetchUserSlots();
    } catch (err) {
      console.error('Error al depurar slot:', err);
      alert('No se pudo vaciar la memoria del slot seleccionado en el pipeline.');
    } finally {
      setProcessingSlot(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-16 bg-[#FFF] rounded-sm border border-[#EDEBE9] font-sans mx-auto w-full max-w-7xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-5 h-5 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#616161] font-semibold tracking-wide px-4">Mapeando infraestructura SVX Ingestion Engine...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-[#464775] border border-[#8889c5] text-white rounded-sm text-xs font-sans font-medium mx-auto w-full max-w-7xl break-words">
        <span className="font-bold">SVX Protocol Error:</span> {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-[#FFF] rounded-sm border border-[#E0E0E0] p-4 sm:p-5 font-sans antialiased text-[#242424]">
      
      {/* Input oculto reutilizable para interceptar subidas */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".csv" 
        className="hidden" 
      />

      {/* Cabecera Fluent - Full Responsive Breakpoints */}
      <div className="mb-5 pb-3 border-b border-[#E0E0E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="max-w-full min-w-0">
          <h2 className="text-xs font-bold text-[#242424] tracking-tight uppercase truncate" title={submissionData?.company_name}>
            {submissionData?.company_name || 'Buffers de Ingesta Asignados'}
          </h2>
          <p className="text-[10px] text-[#616161] mt-0.5 break-words sm:line-clamp-none line-clamp-2">
            Orquestación en Tiempo Real y Carga Homologada de Arreglos Técnicos
          </p>
        </div>
        <div className="self-start sm:self-center text-[10px] font-mono text-[#464775] bg-[#ECECFF] px-2 py-0.5 rounded-sm border border-[#D5D6E9] whitespace-nowrap">
          SVX_COMMAND_STORAGE
        </div>
      </div>

      {/* Grid General de Slots Adaptativo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
        {availableFiles.map((slot) => {
          const hasData = slot.data !== null;
          const rawContent = slot.data;
          const fileName = rawContent?.fileName || 'Technical_Dataset_Ingested.csv';
          
          const rowCount = Array.isArray(rawContent) 
            ? rawContent.length 
            : (rawContent?.rows?.length || rawContent?.rowCount || 0);
            
          const uploadDate = rawContent?.uploadedAt 
            ? new Date(rawContent.uploadedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
            : 'Buffer Vacío';

          const isCurrentProcessing = processingSlot === slot.key;

          return (
            <div 
              key={slot.key}
              className={`group flex flex-col justify-between p-3.5 bg-white border rounded-sm transition-all duration-150 relative min-w-0 ${
                hasData 
                  ? 'border-[#E0E0E0] hover:border-[#464775] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_2px_8px_rgba(70,71,117,0.12)]' 
                  : 'border-dashed border-[#C8C6C4] bg-[#FAFAFA] hover:bg-white hover:border-[#464775]'
              }`}
            >
              {/* Bloqueador de Operación Local */}
              {isCurrentProcessing && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 flex items-center justify-center rounded-sm">
                  <div className="w-4 h-4 border-2 border-[#464775] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <div className="min-w-0">
                {/* Cabecera del Slot */}
                <div className="flex justify-between items-center mb-2 gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider rounded-sm uppercase font-mono whitespace-nowrap ${
                    hasData 
                      ? 'text-[#464775] bg-[#ECECFF] border border-[#D5D6E9]' 
                      : 'text-[#616161] bg-[#F3F2F1] border border-[#EDEBE9]'
                  }`}>
                    {slot.label}
                  </span>
                  <span className="text-[9px] font-medium text-[#878685] font-mono whitespace-nowrap">{uploadDate}</span>
                </div>

                {/* Detalles Condicionales de la Data */}
                {hasData ? (
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#242424] truncate group-hover:text-[#464775] transition-colors font-mono" title={fileName}>
                      {fileName}
                    </h4>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#616161]">
                      <span className="text-[#464775] shrink-0">⚡</span>
                      <span className="font-medium text-[10px] truncate">
                        Registros: <strong className="font-semibold text-[#242424] font-mono">{rowCount}</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 min-w-0">
                    <p className="text-[11px] italic text-[#A19F9D] font-medium truncate">Asignación libre de memoria</p>
                    <p className="text-[9px] text-[#A19F9D] mt-0.5 truncate">Listo para parsear e indexar CSV</p>
                  </div>
                )}
              </div>

              {/* Botonera de Control Inferior - Optimizada para Touch y Mobile */}
              <div className="mt-4 pt-2.5 border-t border-[#F3F2F1] flex flex-row gap-1.5 justify-end items-center w-full">
                {hasData ? (
                  <>
                    {/* Botón de Purgado */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.key, fileName)}
                      className="px-2.5 py-1.5 bg-white hover:bg-[#FDE7E9] text-[#A80007] border border-[#F3B0B4] text-[10px] font-medium rounded-sm transition-all cursor-pointer whitespace-nowrap"
                      title="Vaciar memoria de la columna"
                    >
                      Eliminar
                    </button>

                    {/* Botón de Inyección a la matriz principal */}
                    <button
                      type="button"
                      onClick={() => onSelectSlot && onSelectSlot(rawContent)}
                      className="flex-1 px-3 py-1.5 bg-white hover:bg-[#464775] text-[#464775] hover:text-white border border-[#464775] text-[11px] font-semibold rounded-sm transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98] text-center truncate"
                    >
                      Examinar e Inyectar
                    </button>
                  </>
                ) : (
                  /* Botón para subir archivo si el slot está limpio */
                  <button
                    type="button"
                    onClick={() => triggerFileInput(slot.key)}
                    className="w-full px-3 py-1.5 bg-[#464775] hover:bg-[#353659] text-white text-[11px] font-semibold rounded-sm transition-all duration-150 cursor-pointer shadow-xs flex items-center justify-center gap-1 text-center"
                  >
                    <span className="shrink-0">📤</span> <span className="truncate">Cargar Dataset</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}