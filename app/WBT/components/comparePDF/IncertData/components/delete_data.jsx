'use client';

import { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export default function DeleteClientRow({ companyName, onDeleteSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Validación: Solo necesitamos que exista el companyName
  const isInvalid = !companyName || companyName.trim() === '';

  const handleDelete = async () => {
    if (isInvalid) {
      alert('Error: No se ha especificado un nombre de compañía válido para eliminar.');
      return;
    }

    if (!confirm(`⚠️ ¿Deseas eliminar permanentemente a "${companyName}" y toda su información asociada? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      // Eliminamos basándonos ÚNICAMENTE en la columna 'company_name'
      const { error } = await supabase
        .from('ClientsSERVEX_WBT')
        .delete()
        .eq('company_name', companyName);

      if (error) throw error;

      if (onDeleteSuccess) onDeleteSuccess();
      alert(`Éxito: Se ha eliminado el registro de "${companyName}".`);
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
            ? <span className="text-red-500 font-bold">⚠️ Error: Nombre de compañía no detectado.</span>
            : <>Al eliminar, toda la información asociada a <strong>{companyName}</strong> será borrada permanentemente.</>
          }
        </p>
      </div>

      <button
        onClick={handleDelete}
        disabled={isDeleting || isInvalid}
        className={`flex items-center justify-center px-4 py-1.5 text-sm font-medium rounded transition-colors border ${
          isDeleting
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : isInvalid
            ? 'bg-red-100 text-red-600 border-red-300'
            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300'
        }`}
      >
        {isDeleting ? 'Procesando...' : 'Eliminar registro'}
      </button>
    </div>
  );
}