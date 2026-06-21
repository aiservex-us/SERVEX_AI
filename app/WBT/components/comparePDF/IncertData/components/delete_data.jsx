'use client';

import React, { useState } from 'react';
import { Trash2, Loader2, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';

const DeleteTenantButton = ({ targetTableName, currentTenant, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    // Validación de seguridad
    if (!targetTableName) {
      console.error('[-] Error: targetTableName está vacío o no definido.');
      alert('Error de configuración: No se ha especificado la tabla de destino.');
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from(targetTableName)
        .delete()
        .eq('company_name', currentTenant);

      if (error) throw error;
      
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error('[-] Error crítico al eliminar la fila completa:', err);
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Sección de aviso informativo */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info size={16} className="text-gray-400" />
          <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Restablecer Sistema WBT</h4>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Al ejecutar esta acción, se borrará permanentemente toda la información y registros asociados a este tenant en el sistema. Esta operación es irreversible.
        </p>
      </div>

      {/* Botón de acción */}
      <button 
        onClick={() => setShowConfirm(true)} 
        disabled={isDeleting || !targetTableName} // Deshabilitado si no hay tabla
        className="w-full flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-rose-200 hover:bg-rose-50/30 transition-all text-left shadow-sm group disabled:opacity-50"
      >
        <Trash2 size={20} className="text-gray-400 group-hover:text-rose-500 transition-colors" />
        <div>
          <p className="text-xs font-bold text-gray-700">Delete Entire Tenant</p>
          <p className="text-[10px] text-gray-400">Eliminación completa del registro.</p>
        </div>
      </button>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden border border-gray-100">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
              <AlertTriangle size={20} className="text-rose-500" />
              <h3 className="text-sm font-bold text-gray-800">Confirmar Eliminación</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-gray-500">
                ¿Estás seguro de que deseas eliminar permanentemente a <strong>{currentTenant}</strong>?
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 bg-gray-50/50 border-t border-gray-100">
              <button 
                onClick={() => setShowConfirm(false)} 
                disabled={isDeleting} 
                className="px-4 py-1.5 rounded text-[11px] font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting} 
                className="flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : "Confirmar Eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteTenantButton;