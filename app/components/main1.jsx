'use client';

import { useEffect, useState } from 'react';
import { LoginPopup } from './LoginPopup';

export default function Main1() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [bgImage, setBgImage] = useState('https://i.pinimg.com/originals/8f/f8/66/8ff8667b888e69fe37a636312a55d2e9.gif');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 700;
      setIsMobile(mobile);
      setBgImage(
        mobile
          ? 'https://i.pinimg.com/originals/5f/37/df/5f37dfeb8007f33e29f4137d072462fb.gif'
          : 'https://i.pinimg.com/originals/8f/f8/66/8ff8667b888e69fe37a636312a55d2e9.gif'
      );
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setShowLogo(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="relative w-full h-[100vh] overflow-hidden font-inter">
      {/* 🔹 Imagen de fondo */}
      <div className="absolute top-0 left-0 w-full h-full">
        <img
          src={bgImage}
          alt="Fondo GLYNNE - Arquitectura de software B2B"
          className="w-full h-full object-cover transition-all duration-700 ease-in-out"
        />
      </div>

      {/* 🔹 Capa oscura */}
      <div className="absolute inset-0 bg-black/70 z-10" />

      {/* 🔹 CONTENIDO PRINCIPAL */}
      <div className="relative z-40 w-full h-full flex items-center justify-center px-4 sm:px-16">
        {isMobile ? (
          // 🔹 VERSIÓN MÓVIL
          <div className="w-full max-w-xl p-6 sm:p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white text-center space-y-4">
            <img
              src="/logo.png"
              alt="Logo GLYNNE Framework"
              className={`w-20 sm:w-24 mx-auto transition-all duration-1000 ${
                showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
            />
            <h2 className="text-xl sm:text-2xl font-semibold mt-2 uppercase">
              SOLUCIONES B2B PARA EMPRESAS{' '}
              <span className={isMobile ? 'text-white' : 'text-red-500'}>
                SOFTWARE A MEDIDA
              </span>
            </h2>

            <button
              onClick={() => {
                localStorage.removeItem('glyiaChatClosed');
                setShowLoginModal(true);
              }}
              className="relative mt-3 px-6 py-2 text-sm font-semibold bg-white text-black rounded-lg group overflow-hidden transition-all hover:scale-105 z-[9999]"
            >
              <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <span className="relative z-10">DESCUBRE NUESTROS SERVICIOS</span>
            </button>
          </div>
        ) : (
          // 🔹 VERSIÓN DESKTOP
          <div className="w-full h-full flex flex-col sm:flex-row items-center justify-between">
            {/* TEXTO PRINCIPAL */}
            <div className="w-full sm:w-1/2 text-left text-white space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold leading-snug mt-6">
                COMPLEMENTA EL SOFTWARE DE TU EMPRESA CON IA:{' '}
                <span className={isMobile ? 'text-purple-500' : 'text-red-800'}>
                  Procesos de inteligencia artificial a la medida de tu negocio
                </span>
              </h2>

              <button
                onClick={() => {
                  localStorage.removeItem('glyiaChatClosed');
                  setShowLoginModal(true);
                }}
                className="relative mt-4 px-6 py-2 text-sm font-semibold bg-white text-black rounded-lg group overflow-hidden transition-all hover:scale-105 z-[9999]"
              >
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <span className="relative z-10">Explora GLYNNE Framework</span>
              </button>
            </div>

            {/* IMAGEN MOCKUP */}
            <div className="hidden sm:flex w-full sm:w-1/2 justify-center items-center">
              <img
                src="/mokup.png"
                alt="Imagen lateral GLYNNE - Soluciones de software B2B"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* 🔹 CURVA INFERIOR */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none border-none shadow-none bg-transparent">
        <svg
          viewBox="0 -50 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[60vh] border-none shadow-none"
          preserveAspectRatio="none"
          style={{ filter: 'none' }}
        >
          <path
            fill="#fff"
            fillOpacity="1"
            d="
              M0,250 
              C360,230 720,260 1080,220 
              C1260,200 1380,180 1440,160 
              L1440,320 L0,320Z
            "
          />
        </svg>
      </div>

      {/* 🔹 MODAL DE LOGIN */}
      <LoginPopup visible={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  );
}
