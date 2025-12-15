'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';

export function LoginPopup({ visible, onClose }) {
  const router = useRouter();
  const [email, setEmail] = useState('');

  // 🔐 Google
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/panel`,
        },
      });

      if (error) alert('Error al iniciar sesión con Google');
    } catch (_) {}
  };

  // 🔐 Microsoft (Azure)
  const handleMicrosoftLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/panel`,
        },
      });

      if (error) alert('Error al iniciar sesión con Microsoft');
    } catch (_) {}
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.email) {
          setEmail(user.email);
          router.push('/panel');
        }
      } catch (_) {}
    };

    checkUser();
  }, [router]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative bg-white p-5 sm:p-6 rounded-xl w-[90vw] max-w-md shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl"
            >
              ×
            </button>

            <h3 className="text-base font-bold text-gray-800 text-center mb-2">
              Empieza ahora
            </h3>
            <p className="text-xs text-gray-600 text-center mb-4">
              Inicia sesión para recibir recomendaciones personalizadas.
            </p>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-900 transition mb-3"
            >
              <FaGoogle className="w-4 h-4" />
              Continuar con Google
            </button>

            {/* Microsoft */}
            <button
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-[#2F2F2F] text-white text-sm font-semibold shadow-md hover:bg-[#1f1f1f] transition"
            >
              <FaMicrosoft className="w-4 h-4" />
              Continuar con Microsoft
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
