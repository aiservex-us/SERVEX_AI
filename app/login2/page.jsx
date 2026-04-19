'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc'; 
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
        // Ajustado para redirigir a la carpeta Panel_Client
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/Panel_Client`,
      },
    });
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const audio = new Audio('/tu-sonido.mp3');
        audio.play().catch(err => console.log("El navegador bloqueó el autoplay:", err));
        
        // Redirección interna tras verificar sesión
        router.push('/Panel_Client');
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
          <div className="mb-10 flex justify-center">
            <Image
              src="/logo.png"
              alt="SERVEX"
              width={140}
              height={40}
              priority
            />
          </div>

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

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition font-medium text-gray-700"
            >
              <FcGoogle className="text-xl" />
              Sign in with Google
            </button>

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