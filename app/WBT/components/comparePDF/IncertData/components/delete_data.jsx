'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export default function DeleteClientRow({ clientId, companyName, onDeleteSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`⚠️ ¿Deseas eliminar permanentemente a "${companyName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('ClientsSERVEX_WBT')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('Error al procesar la eliminación. Verifica tus permisos.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 border border-gray-200 rounded-lg bg-white shadow-sm max-w-sm">
      <div className="text-xs text-gray-500">
        <p className="font-semibold text-gray-700">Administración de datos</p>
        <p>Al eliminar, toda la información asociada a <strong>{companyName}</strong> será borrada permanentemente de la base de datos.</p>
      </div>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded transition-colors border ${
          isDeleting
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-200'
        }`}
      >
        {isDeleting ? (
          <>
            <span className="mr-2 animate-spin">◌</span> Procesando...
          </>
        ) : (
          'Eliminar registro'
        )}
      </button>
    </div>
  );
}