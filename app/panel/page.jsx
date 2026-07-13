'use client';

import { useEffect } from 'react'; // Importante añadir useEffect
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient'; // Usamos el cliente estándar (Azure)
import PanelMenur from './components/PaginaInicial/initPage';

export default function PanelPage() {
  const router = useRouter();

 // 🔒 PROTECCIÓN DE RUTA PARA TRABAJADORES
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // Si no hay usuario, o el proveedor no es 'azure', redirigir al login de Microsoft
      if (!user || user.app_metadata?.provider !== 'azure') {
        router.replace('/login'); // O la ruta de tu login de Microsoft
      }
    };

    checkUser();
  }, [router]);

  return (
    /* Contenedor padre sin scroll y altura completa */
    <div className="h-screen w-full bg-[#f8fafc] font-sans overflow-hidden flex items-center justify-center">
      
      {/* MAIN: 
          - h-[95vh]: Ocupa el 95% de la altura.
          - w-full: Ocupa el 100% del ancho.
      */}
      <main className="w-full h-[95vh] p-0">
        <div className="relative group w-full h-full">
          
          {/* Glow decorativo */}
          <div className="absolute -inset-1 blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

          {/* Contenedor del Menú */}
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