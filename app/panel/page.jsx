'use client';

import { useEffect } from 'react'; // Importante añadir useEffect
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../lib/supabaseClient'; // Usamos el helper de auth
import PanelMenur from './components/PaginaInicial/initPage';
import GlobalOnboarding from './components/GlobalOnboarding';


export default function PanelPage() {
  const router = useRouter();

 // 🔒 PROTECCIÓN DE RUTA PARA TRABAJADORES
  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUser();

      // Si no hay user válido (o no es azure, o no es @servex-us.com), getCurrentUser() devuelve null y cierra sesión
      if (!user) {
        router.replace('/login'); 
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
              <GlobalOnboarding>
                <PanelMenur />
              </GlobalOnboarding>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}