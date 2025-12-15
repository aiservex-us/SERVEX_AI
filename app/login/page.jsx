'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/panel`,
      },
    });
  };

  const handleMicrosoftLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/panel`,
      },
    });
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/panel');
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f3ff] px-4">
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
              You can easily
            </p>

            <h2 className="text-2xl font-semibold leading-snug">
              Get access your personal hub for clarity and productivity
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
                Create an account
              </h1>
            </div>

            {/* LOGO SERVEX */}
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

            <p className="text-sm text-gray-500 mb-8">
              Access your tasks, notes, and projects anytime, anywhere — and
              keep everything flowing in one place.
            </p>

            {/* BOTONES */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition font-medium mb-4"
            >
              <FaGoogle className="text-lg" />
              Continue with Google
            </button>

            <button
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition font-medium"
            >
              <FaMicrosoft className="text-lg" />
              Continue with Microsoft
            </button>

            <p className="text-xs text-gray-400 text-center mt-8">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
