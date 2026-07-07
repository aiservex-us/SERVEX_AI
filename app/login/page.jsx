'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
// Importamos la instancia estándar (Azure)
import { supabase } from '../lib/supabaseClient'; 
import { useRouter } from 'next/navigation';
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
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const audio = new Audio('/tu-sonido.mp3');
        audio.play().catch(err => console.log("El navegador bloqueó el autoplay:", err));
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
        <div className="relative hidden md:flex flex-col justify-end p-10 overflow-hidden bg-gradient-to-br from-[#464775]/40 via-[#464775]/10 to-white">
          
          {/* Decorative Floating 3D Glass Coins (Estáticos) */}
          <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px' }}>
            <div 
              className="absolute top-[15%] left-[5%] w-[180px] h-[180px] rounded-full bg-white/20 backdrop-blur-md border border-white/50"
              style={{ 
                transform: 'rotateX(20deg) rotateY(30deg) translateZ(-100px)',
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -2px 2px 0 rgba(255,255,255,0.6), -10px 10px 20px rgba(0,0,0,0.05)'
              }} 
            />
            <div 
              className="absolute top-[20%] left-[20%] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#464775]/60 to-[#464775]/20 backdrop-blur-xl border border-white/60 z-10"
              style={{ 
                transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
                boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -4px 4px 0 #d0d0d0, -15px 15px 30px rgba(0,0,0,0.1)'
              }}
            />
            <div 
              className="absolute top-[30%] right-[25%] w-[160px] h-[160px] rounded-full bg-white/30 backdrop-blur-md border border-white/50 z-10"
              style={{ 
                transform: 'rotateX(60deg) rotateY(-50deg) translateZ(100px)',
                boxShadow: 'inset 0 0 15px rgba(255,255,255,0.4), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -10px 10px 15px rgba(0,0,0,0.05)'
              }}
            />
            <div 
              className="absolute bottom-[35%] right-[10%] w-[190px] h-[190px] rounded-full bg-white/40 backdrop-blur-lg border border-white/70"
              style={{ 
                transform: 'rotateX(15deg) rotateY(20deg) translateZ(0px)',
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -10px 10px 20px rgba(0,0,0,0.05)'
              }}
            />
            <div 
              className="absolute bottom-[20%] left-[25%] w-[180px] h-[180px] rounded-full bg-[#464775]/20 backdrop-blur-xl border border-white/30 blur-[4px]"
              style={{ 
                transform: 'rotateX(45deg) rotateY(15deg) translateZ(150px)',
                boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)'
              }}
            />
          </div>

          <div className="relative z-10 text-[#2B2C4B]">
            <div className="text-4xl font-bold mb-4 text-[#464775]">*</div>
            <p className="text-sm opacity-80 mb-2 font-medium">Secure corporate access</p>
            <h2 className="text-2xl font-semibold leading-snug">
              Sign in to the SERVEX AI ecosystem and unlock intelligent tools
              built for enterprise performance
            </h2>
          </div>
        </div>

        <div className="flex flex-col px-8 py-10 md:px-14 h-full">
          <div className="mb-10 flex justify-center">
            <Image src="/logo.png" alt="SERVEX" width={140} height={40} priority />
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
              Access SERVEX AI Platform
            </h1>
            <p className="text-sm text-gray-500 mb-8 text-center leading-relaxed">
              This platform provides secure access to the SERVEX artificial intelligence ecosystem.
              <br />
              <span className="font-medium text-gray-700">
                Only users with a <strong>@servex-us.com</strong> corporate email are authorized to sign in.
              </span>
            </p>

            <button
              onClick={handleMicrosoftLogin}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition font-medium"
            >
              <FaMicrosoft className="text-lg" />
              Sign in with Microsoft
            </button>

            <p className="text-xs text-gray-400 text-center mt-8">
              Unauthorized access is restricted. All activity is monitored for security purposes.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}