'use client';

import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';

const DeleteTenantButton = ({ currentTenant = 'WBT', onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Eliminación directa filtrando por la columna 'company_name' con el valor 'WBT'
      const { error } = await supabase
        .from('ClientsSERVEX_WBT')
        .delete()
        .eq('company_name', currentTenant); // currentTenant es 'WBT'

      if (error) throw error;
      
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error(`[SERVEX_AI] Fallo en la eliminación del registro ${currentTenant}:`, err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting} 
      className="flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold bg-white text-[#444791] shadow-sm hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12}/>}
      {isDeleting ? "Eliminando..." : `Delete Tenant ${currentTenant}`}
    </button>
  );
};

export default DeleteTenantButton;