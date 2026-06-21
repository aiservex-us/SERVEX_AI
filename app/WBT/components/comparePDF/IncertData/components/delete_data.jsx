'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export default function DeleteClientRow({ clientId, companyName, onDeleteSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Convertimos a número. Si clientId es nulo, idAsNumber será NaN
  const idAsNumber = Number(clientId);
  const isInvalid = !clientId || isNaN(idAsNumber);

  const handleDelete = async () => {
    if (isInvalid) {
      console.error('❌ Error de ID:', { clientId, idAsNumber });
      alert('Error: El ID del registro es inválido (recibido: ' + clientId + '). Verifica el componente padre.');
      return;
    }

    if (!confirm(`⚠️ ¿Deseas eliminar permanentemente a "${companyName || 'este registro'}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('ClientsSERVEX_WBT')
        .delete()
        .eq('id', idAsNumber);

      if (error) throw error;

      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      console.error('❌ Error al eliminar en Supabase:', err);
      alert(`Error al eliminar: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 border border-gray-200 rounded-lg bg-white shadow-sm max-w-sm">
      <div className="text-xs text-gray-500">
        <p className="font-semibold text-gray-700">Administración de datos</p>
        <p>
          {isInvalid 
            ? <span className="text-red-500 font-bold">⚠️ Error: ID de cliente no detectado.</span>
            : <>Al eliminar, toda la información asociada a <strong>{companyName || 'este registro'}</strong> será borrada permanentemente.</>
          }
        </p>
      </div>

      <button
        onClick={handleDelete}
        // Solo deshabilitamos si está procesando. 
        // Si es inválido, permitimos el clic para que el alert de error ayude a depurar.
        disabled={isDeleting}
        className={`flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded transition-colors border ${
          isDeleting
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : isInvalid
            ? 'bg-red-100 text-red-600 border-red-300 hover:bg-red-200'
            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'
        }`}
      >
        {isDeleting ? 'Procesando...' : isInvalid ? 'ID Inválido' : 'Eliminar registro'}
      </button>
    </div>
  );
}