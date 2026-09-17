'use client';

import React, { useState } from 'react';
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';

const DeleteTenantButton = ({ currentTenant = 'WBS', onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('ClientsSERVEX_WBS')
        .delete()
        .eq('company_name', currentTenant);

      if (error) throw error;
      
      setIsModalOpen(false);
      if (onDeleted) onDeleted();
      window.location.href = '/' + currentTenant;
    } catch (err) {
      console.error(`[SERVEX_AI] Fallo en la eliminación del registro ${currentTenant}:`, err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Contenedor principal */}
      <div className="w-full flex flex-col gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
        <div className="flex gap-3 text-gray-600">
          <AlertTriangle size={18} className="text-rose-600 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-gray-900">Tenant Settings</span>
            <p className="text-[11px] leading-relaxed text-gray-500">
              Gestión crítica: eliminación de registros y data relacionada para {currentTenant}.
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm bg-white border border-gray-300 text-rose-600 shadow-sm hover:bg-rose-50 hover:border-rose-200 transition-all"
        >
          <Trash2 size={16} />
          Delete Tenant {currentTenant}
        </button>
      </div>

      {/* Modal de Confirmación estilo Teams */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-[400px] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Delete Tenant</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 text-sm text-gray-600">
              <p className="mb-4">Are you sure you want to delete the tenant <strong>{currentTenant}</strong>?</p>
              <p className="text-xs bg-rose-50 text-rose-700 p-3 rounded">
                This action will permanently delete all associated information, catalogs, and data flows. This operation cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 px-5 py-4 bg-gray-50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : "Confirm eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteTenantButton;