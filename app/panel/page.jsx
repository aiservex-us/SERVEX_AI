'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

// COMPONENTES
import IncertXML from './components/incertXML';
import PanelHeader from './components/PanelHeader';

export default function PanelPage() {
  const router = useRouter();

  // 🔒 PROTECCIÓN DE RUTA (MISMA LÓGICA)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {

      if (!data?.user) {
        router.replace('/login');
      }

    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      
      {/* HEADER SEPARADO */}
      <PanelHeader />

      {/* CONTENIDO */}
      <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
        <div className="relative group">
          
          {/* Glow decorativo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50">
            <div className="p-1">
              <IncertXML />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
