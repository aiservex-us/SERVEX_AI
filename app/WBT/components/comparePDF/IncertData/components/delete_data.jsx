'use client';

import React, { useState } from 'react';
import { Trash2, Loader2, FileCode, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient'; 

const DeleteTenantButton = ({ currentTenant, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); 
  
  const targetTableName = 'ClientsSERVEX_WBT';

  const handleAction = async (type) => {
    if (!currentTenant) {
      alert("Error: No se ha identificado el tenant (currentTenant está vacío).");
      return;
    }

    setIsDeleting(true);
    console.log(`[DEBUG] Iniciando ${type} para:`, currentTenant);

    try {
      let query;

      if (type === 'all') {
        // Borrado completo de la fila
        query = supabase.from(targetTableName).delete().eq('company_name', currentTenant);
      } else {
        // Limpieza parcial (UPDATE)
        const updatePayload = type === 'xml' ? { xml_raw: null } : { csv_raw: null };
        query = supabase.from(targetTableName).update(updatePayload).eq('company_name', currentTenant);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log(`[DEBUG] Operación ${type} completada con éxito.`);
      if (onDeleted) onDeleted();
      
    } catch (err) {
      console.error(`[-] Error crítico en operación ${type}:`, err);
      alert(`Error al realizar ${type}: ${err.message || 'Error desconocido'}`);
    } finally {
      setIsDeleting(false);
      setConfirmAction(null);
    }
  };

  const confirmConfig = {
    xml: { title: 'Eliminar XML', icon: <FileCode size={20} className="text-[#5B5FC7]" />, description: `Se limpiará el contenido de la columna 'xml_raw' para "${currentTenant}".`, actionLabel: 'Confirmar XML' },
    csv: { title: 'Eliminar CSV', icon: <FileSpreadsheet size={20} className="text-[#5B5FC7]" />, description: `Se limpiará el contenido de la columna 'csv_raw' para "${currentTenant}".`, actionLabel: 'Confirmar CSV' },
    all: { title: 'Eliminar Registro Total', icon: <Trash2 size={20} className="text-rose-600" />, description: `Se eliminará toda la fila de "${currentTenant}" en ClientsSERVEX_WBT. Acción irreversible.`, actionLabel: 'Eliminar Todo' },
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-1">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-amber-800 leading-relaxed">
          Gestión de datos crudos. Las acciones de limpieza solo vacían el campo específico.
        </p>
      </div>

      <button onClick={() => setConfirmAction('xml')} className="w-full flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-[#5B5FC7] transition-all text-left">
        <FileCode size={20} className="text-[#5B5FC7]" />
        <div>
          <p className="text-xs font-bold text-[#242424]">Delete XML Data</p>
          <p className="text-[10px] text-gray-500">Limpieza de columna xml_raw.</p>
        </div>
      </button>

      <button onClick={() => setConfirmAction('csv')} className="w-full flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-[#5B5FC7] transition-all text-left">
        <FileSpreadsheet size={20} className="text-[#5B5FC7]" />
        <div>
          <p className="text-xs font-bold text-[#242424]">Delete CSV Data</p>
          <p className="text-[10px] text-gray-500">Limpieza de columna csv_raw.</p>
        </div>
      </button>

      <button onClick={() => setConfirmAction('all')} className="w-full flex items-center gap-4 p-3 bg-rose-50 border border-rose-200 rounded-lg hover:border-rose-400 transition-all text-left">
        <Trash2 size={20} className="text-rose-600" />
        <div>
          <p className="text-xs font-bold text-rose-600">Delete Entire Tenant</p>
          <p className="text-[10px] text-rose-800/70">Eliminación completa del registro.</p>
        </div>
      </button>

      {confirmAction && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {confirmConfig[confirmAction].icon}
                <h3 className="text-sm font-bold text-[#242424]">{confirmConfig[confirmAction].title}</h3>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-[#616161]">{confirmConfig[confirmAction].description}</p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 bg-[#FAF9F8] border-t border-gray-100">
              <button onClick={() => setConfirmAction(null)} disabled={isDeleting} className="px-4 py-1.5 rounded text-[11px] font-bold text-[#242424] bg-white border border-gray-200">Cancel</button>
              <button onClick={() => handleAction(confirmAction)} disabled={isDeleting} className="flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-bold text-white bg-rose-600">
                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : confirmConfig[confirmAction].actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteTenantButton;