'use client';

import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FiLogOut } from 'react-icons/fi'; // Icono de salida

export default function PanelClientPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
    } else {
      // Redirigir a la página de login principal o raíz
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Customer Portal
        </h1>
        <div className="text-blue-600 font-medium mb-8">
          READY FOR DEVELOPMENT
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 hover:bg-red-100 transition-colors rounded-xl font-semibold border border-red-100"
        >
          <FiLogOut />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}