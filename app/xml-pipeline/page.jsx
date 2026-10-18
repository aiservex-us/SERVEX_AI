'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../lib/supabaseClient';
import MenuInicial from './Actualizer_XML_General/page.jsx';

export default function Home() {
  const router = useRouter();
  /* 🔒 PROTECCIÓN DE RUTA (Temporalmente comentada para desarrollo local)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/login');
        } else {
          if (isMounted) {
            setIsAuthenticated(true);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error verifying user authentication:', err);
        router.replace('/login');
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white text-slate-400 select-none">
        <div className="w-8 h-8 border-2 border-[#18181b]/20 border-t-[#18181b] rounded-full animate-spin mb-3" />
        <span className="text-xs font-medium tracking-wide text-slate-500">Verifying session...</span>
      </div>
    );
  }
  */

  return <MenuInicial />;
}