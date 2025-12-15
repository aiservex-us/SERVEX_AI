'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FaMicrosoft } from 'react-icons/fa';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  // 🔐 Login con Microsoft Entra ID
  const handleMicrosoftLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/panel`,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      console.error('❌ Error login Azure:', error);
    }
  };

  // ✅ ESCUCHAR SESIÓN (FORMA CORRECTA PARA OAUTH)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        router.replace('/panel');
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
        className="
          w-full max-w-5xl
          h-[85vh]
          bg-white
          rounded-3xl
          shadow-2xl
          overflow-hidden
          grid grid-cols-1 md:grid-cols-2
        "
      >
        {/* PANEL IZQUIERDO */}
        <div className="relative hidden md:flex flex-col justify-end p-10 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#60a5fa]" />
          <div className="relative z-10">
            <div className="text-4xl font-bold mb-4">*</div>
            <p className="text-sm opacity-80 mb-2">
              Secure corporate access
            </p>
            <h2 className="text-2xl font-semibold leading-snug">
              Your centralized workspace for productivity and clarity
            </h2>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="flex flex-col justify-center px-8 py-12 md:px-14">
          <div className="max-w-sm w-full mx-auto">
            {/* TÍTULO */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#4f46e5]">*</span>
              <h1 className="text-2xl font-semibold text-gray-900">
                Sign in
              </h1>
            </div>

            {/* LOGO */}
            <div className="mt-4 mb-6">
              <Image
                src="/logo.png"
                alt="Servex"
                width={340}
                height={40}
                className="object-contain"
                priority
              />
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Access is restricted to authorized company accounts.
            </p>

            {/* MENSAJE CORPORATIVO */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              🔒 Only users with an authorized <br />
              <span className="font-medium text-gray-900">
                @servex-us.com
              </span>{' '}
              email address can sign in.
            </div>

            {/* BOTÓN MICROSOFT */}
            <button
              onClick={handleMicrosoftLogin}
              className="
                w-full
                flex items-center justify-center gap-3
                py-3
                rounded-xl
                border border-gray-200
                hover:border-gray-300
                hover:bg-gray-50
                transition
                font-medium
              "
            >
              <FaMicrosoft className="text-lg" />
              Continue with Microsoft
            </button>

            <p className="text-xs text-gray-400 text-center mt-8">
              Secure authentication powered by Microsoft Entra ID
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
