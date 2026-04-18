'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FaMicrosoft, FaGoogle } from 'react-icons/fa'; // Añadido FaGoogle
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  // --- Manejador Microsoft ---
  const handleMicrosoftLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/panel`,
      },
    });
  };

  // --- Manejador Google (NUEVO) ---
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}//Panel_Cient`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // --- Lógica de sonido ---
        const audio = new Audio('/tu-sonido.mp3'); 
        audio.play().catch(err => console.log("El navegador bloqueó el autoplay:", err));
        
        // Redirigir al panel
        router.push('/panel');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* PANEL IZQUIERDO */}
        <div className="relative hidden md:flex flex-col justify-end p-10 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-[#c7d2fe] via-[#ddd6fe] to-[#bfdbfe]" />
          <div className="relative z-10">
            <div className="text-4xl font-bold mb-4">*</div>
            <p className="text-sm opacity-80 mb-2">
              Secure corporate access
            </p>
            <h2 className="text-2xl font-semibold leading-snug">
              Sign in to the SERVEX AI ecosystem and unlock intelligent tools
              built for enterprise performance
            </h2>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="flex flex-col px-8 py-10 md:px-14 h-full">
          {/* LOGO */}
          <div className="mb-10 flex justify-center">
            <Image
              src="/logo.png"
              alt="SERVEX"
              width={140}
              height={40}
              priority
            />
          </div>

          {/* CONTENIDO */}
          <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
              Access SERVEX AI Platform
            </h1>

            <p className="text-sm text-gray-500 mb-8 text-center leading-relaxed">
              This platform provides secure access to the SERVEX artificial
              intelligence ecosystem.  
              <br />
              <span className="font-medium text-gray-700">
                Only users with a <strong>@servex-us.com</strong> corporate email
                are authorized to sign in.
              </span>
            </p>

            <div className="space-y-3">
              {/* BOTÓN MICROSOFT */}
              <button
                onClick={handleMicrosoftLogin}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition font-medium text-[#242424]"
              >
                <FaMicrosoft className="text-[#00A4EF]" />
                Sign in with Microsoft
              </button>

              {/* DIVISOR (Opcional, pero ayuda visualmente) */}
              <div className="flex items-center gap-2 my-2">
                <div className="h-[1px] bg-gray-100 flex-1"></div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Attention SERVEX Clients: Access to the Partner Portal and the creation of corporate workspaces is managed exclusively through Google Authentication.</span>
                <div className="h-[1px] bg-gray-100 flex-1"></div>
              </div>

              {/* BOTÓN GOOGLE */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition font-medium text-[#242424]"
              >
                <FaGoogle className="text-[#EA4335]" />
                Sign in with Google
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-8">
              Unauthorized access is restricted. All activity is monitored for
              security purposes.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}