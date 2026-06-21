'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export default function DeleteClientRow({ clientId, companyName, onDeleteSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Convertimos a número para asegurar compatibilidad con bigint
  const idAsNumber = Number(clientId);
  const isInvalid = !clientId || isNaN(idAsNumber);

  const handleDelete = async () => {
    if (isInvalid) {
      alert('Error: El ID del registro no es válido.');
      return;
    }

    if (!confirm(`⚠️ ¿Deseas eliminar permanentemente a "${companyName || 'este registro'}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      // Intentamos la eliminación
      const { error } = await supabase
        .from('ClientsSERVEX_WBT')
        .delete()
        .eq('id', idAsNumber);

      if (error) {
        console.error('❌ Error desde Supabase:', error);
        throw new Error(error.message || 'Error desconocido al eliminar');
      }

      // Si llegamos aquí, fue exitoso
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
      alert(`Hubo un error al intentar eliminar el registro: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 border border-gray-200 rounded-lg bg-white shadow-sm max-w-sm">
      <div className="text-xs text-gray-500">
        <p className="font-semibold text-gray-700">Administración de datos</p>
        <p>
          Al eliminar, toda la información asociada a <strong>{companyName || 'registro desconocido'}</strong> será borrada permanentemente.
        </p>
      </div>

      <button
        onClick={handleDelete}
        disabled={isDeleting || isInvalid}
        className={`flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded transition-colors border ${
          isDeleting || isInvalid
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'
        }`}
      >
        {isDeleting ? 'Procesando...' : 'Eliminar registro'}
      </button>
    </div>
  );
}