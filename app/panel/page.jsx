'use client';

import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

// COMPONENTES
import IncertXML from './components/incertXML';
import PanelHeader from './components/PanelHeader';
import PanelMenur from './components/XMLperseado';

export default function PanelPage() {
  const router = useRouter();

  // 🔒 PROTECCIÓN DE RUTA (MISMA LÓGICA)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
/*
      if (!data?.user) {
        router.replace('/login');
      }
  */
    });
  
  }, [router]);

  return (
    /* Contenedor padre sin scroll y altura completa */
    <div className="h-screen w-full bg-[#f8fafc] font-sans overflow-hidden flex items-center justify-center">
      
      {/* MAIN: 
          - h-[95vh]: Ocupa el 95% de la altura.
          - w-full: Ocupa el 100% del ancho.
          - p-0: Eliminamos paddings para que sea edge-to-edge.
      */}
      <main className="w-full h-[95vh] p-0">
        <div className="relative group w-full h-full">
          
          {/* Glow decorativo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

          {/* Contenedor del Menú:
              - h-full: Para que respete el 95vh del padre.
              - overflow-y-auto: Para que el scroll ocurra solo aquí dentro.
          */}
          <div className="relative bg-white border-y md:border border-slate-200 md:rounded-2xl shadow-xl shadow-slate-200/50 w-full h-full overflow-y-auto">
            <div className="p-1 w-full h-full">
              <PanelMenur />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}