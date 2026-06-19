'use client';

import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../../../../lib/supabaseClient';

const DeleteTenantButton = ({ targetTableName, currentTenant, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to completely delete the row associated with company ${currentTenant} from the database? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;

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
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isDeleting} 
      className="flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-bold bg-white text-[#444791] shadow-sm hover:bg-rose-50 hover:text-rose-600 transition-all disabled:opacity-50"
    >
      {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12}/>}
      {isDeleting ? "Deleting..." : `Delete Tenant ${currentTenant}`}
    </button>
  );
};

export default DeleteTenantButton;