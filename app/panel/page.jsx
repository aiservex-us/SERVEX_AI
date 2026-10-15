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
    <div className="w-full h-screen overflow-hidden bg-white font-sans flex flex-col m-0 p-0 min-h-0">
      <GlobalOnboarding>
        <PanelMenur />
      </GlobalOnboarding>
    </div>
  );
}