'use client';

import React, { useState } from 'react';
import { Trash2, Loader2, FileCode, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';

const DeleteTenantButton = ({ targetTableName, currentTenant, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'xml' | 'csv' | 'all' | null

  const handlePartialDelete = async (target) => {
    setIsDeleting(true);
    try {
      const updatePayload = target === 'xml' ? { xml_raw: null } : { csv_raw: null };
      const { error } = await supabase
        .from(targetTableName)
        .update(updatePayload)
        .eq('company_name', currentTenant);

      if (error) throw error;
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error(`[-] Error al eliminar ${target}:`, err);
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setConfirmAction(null);
    }
  };

  const handleFullDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from(targetTableName)
        .delete()
        .eq('company_name', currentTenant);

      if (error) throw error;
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error('[-] Error al eliminar todo:', err);
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setConfirmAction(null);
    }
  };

  const handleConfirm = () => {
    if (confirmAction === 'xml') handlePartialDelete('xml');
    else if (confirmAction === 'csv') handlePartialDelete('csv');
    else if (confirmAction === 'all') handleFullDeleteConfirmed();
  };

  const confirmConfig = {
    xml: { title: 'Delete XML content', icon: <FileCode size={20} className="text-[#5B5FC7]" />, description: `Removes the XML file content for "${currentTenant}". The row and CSV data will remain intact.`, actionLabel: 'Delete XML' },
    csv: { title: 'Delete CSV content', icon: <FileSpreadsheet size={20} className="text-[#5B5FC7]" />, description: `Removes the CSV file content for "${currentTenant}". The row and XML data will remain intact.`, actionLabel: 'Delete CSV' },
    all: { title: 'Delete everything', icon: <AlertTriangle size={20} className="text-rose-600" />, description: `Permanently deletes the entire row and all associated data for "${currentTenant}". This cannot be undone.`, actionLabel: 'Delete Everything' },
  };

  return (
    <div className="w-full space-y-2">

      {/* --- INFO BANNER: aviso sobre esta zona de eliminación --- */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-1">
        <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-amber-800 leading-relaxed">
          Aquí se elimina la información previamente cargada en el catálogo WBT. Estas acciones son
          irreversibles y afectan los datos crudos almacenados en LESRO: puedes borrar solo el XML,
          solo el CSV, o eliminar por completo el registro del tenant.
        </p>
      </div>

      {/* Cards de Acción */}
      <button onClick={() => setConfirmAction('xml')} className="w-full flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-[#5B5FC7] transition-all text-left">
        <FileCode size={20} className="text-[#5B5FC7]" />
        <div>
          <p className="text-xs font-bold text-[#242424]">Delete XML Data</p>
          <p className="text-[10px] text-gray-500">Limpieza parcial: elimina solo la columna XML.</p>
        </div>
      </button>

      <button onClick={() => setConfirmAction('csv')} className="w-full flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-[#5B5FC7] transition-all text-left">
        <FileSpreadsheet size={20} className="text-[#5B5FC7]" />
        <div>
          <p className="text-xs font-bold text-[#242424]">Delete CSV Data</p>
          <p className="text-[10px] text-gray-500">Limpieza parcial: elimina solo la columna CSV.</p>
        </div>
      </button>

      <button onClick={() => setConfirmAction('all')} className="w-full flex items-center gap-4 p-3 bg-rose-50 border border-rose-200 rounded-lg hover:border-rose-400 transition-all text-left">
        <Trash2 size={20} className="text-rose-600" />
        <div>
          <p className="text-xs font-bold text-rose-600">Delete Entire Tenant</p>
          <p className="text-[10px] text-rose-800/70">Eliminación total: borra la fila completa del sistema.</p>
        </div>
      </button>

      {/* Modal de confirmación con fondo blur */}
      {confirmAction && (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {confirmConfig[confirmAction].icon}
                <h3 className="text-sm font-bold text-[#242424]">{confirmConfig[confirmAction].title}</h3>
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-[#616161] leading-relaxed">{confirmConfig[confirmAction].description}</p>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 bg-[#FAF9F8] border-t border-gray-100">
              <button onClick={() => setConfirmAction(null)} disabled={isDeleting} className="px-4 py-1.5 rounded text-[11px] font-bold text-[#242424] bg-white border border-gray-200 hover:bg-gray-50 transition-all">Cancel</button>
              <button onClick={handleConfirm} disabled={isDeleting} className="flex items-center gap-2 px-4 py-1.5 rounded text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all">
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