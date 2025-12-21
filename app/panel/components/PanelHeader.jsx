'use client';

import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function PanelHeader() {
  const router = useRouter();

  // 🔓 LOGOUT SEGURO (MISMA LÓGICA)
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  // 🔁 IR A LA RAÍZ (page.tsx)
  const goHome = () => {
    router.push('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        
        {/* Logo / Title clickeable */}
        <button
          onClick={goHome}
          className="flex items-center gap-2 focus:outline-none"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-blue-200 shadow-lg">
            <span className="text-white font-bold">S</span>
          </div>
          <p className="text-xl font-bold text-slate-800 tracking-tight hover:text-blue-600 transition">
            Servex <span className="text-blue-600">Admin</span>
          </p>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
        >
          <span>Cerrar sesión</span>
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
