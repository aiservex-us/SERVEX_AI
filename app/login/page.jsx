'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
// 💡 IMPORTANTE: Importar tanto supabase como getCurrentUser para validar
import { supabase, getCurrentUser } from '../lib/supabaseClient'; 
import { FaMicrosoft } from 'react-icons/fa';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  const handleMicrosoftLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/panel`,
      },
    });
  };

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // 1. Intentar obtener el usuario. 
      // Esta función llama a getUser() y ejecuta la validación de dominio.
      const user = await getCurrentUser(); 

      if (user) {
        // 2. Si hay un usuario y pasó la validación, redirigir
        router.replace('/panel');
      } 
      // 3. Si no hay usuario, o si no pasó la validación (porque getCurrentUser
      //    cierra la sesión inmediatamente), el usuario se queda en /login.
      //    Esto elimina el bucle.
    };

    // Esto se ejecuta en la carga inicial y también después del callback de OAuth.
    checkAuthAndRedirect();

    // Opcionalmente, puedes volver a usar onAuthStateChange para manejar 
    // el evento 'SIGNED_IN' si quieres una respuesta más inmediata, 
    // pero DEBE invocar a getCurrentUser() para validar.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        checkAuthAndRedirect();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* PANEL IZQUIERDO */}
        <div className="relative hidden md:flex flex-col justify-end p-10 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#60a5fa]" />
          <div className="relative z-10">
            <div className="text-4xl font-bold mb-4">*</div>
            <p className="text-sm opacity-80 mb-2">Secure corporate access</p>
            <h2 className="text-2xl font-semibold">
              Your centralized workspace for productivity and clarity
            </h2>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="flex flex-col justify-center px-8 py-12 md:px-14">
          <div className="max-w-sm w-full mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#4f46e5]">*</span>
              <h1 className="text-2xl font-semibold text-gray-900">
                Sign in
              </h1>
            </div>

            <div className="mt-4 mb-6">
              <Image
                src="/logo.png"
                alt="Servex"
                width={340}
                height={40}
                priority
              />
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Access restricted to authorized company accounts.
            </p>

            {/* MENSAJE CORPORATIVO AÑADIDO POR CONSISTENCIA */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                🔒 Only users with an authorized <br />
                <span className="font-medium text-gray-900">
                    @servex-us.com
                </span>{' '}
                email address can sign in.
            </div>

            <button
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition font-medium"
            >
              <FaMicrosoft />
              Continue with Microsoft
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}