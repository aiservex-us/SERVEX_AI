'use client';

import { useState } from 'react';
import { LoginPopup } from './LoginPopup';

export default function Main1() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <main className="relative w-full min-h-screen bg-white flex items-center justify-center font-inter px-3 sm:px-6">
      
      {/* Card principal */}
      <section className="
        relative 
        w-full max-w-[1400px]
        min-h-[85vh] md:h-[80vh]
        mx-auto 
        rounded-[24px] md:rounded-[28px] 
        bg-white 
        overflow-hidden 
        flex flex-col
      ">
        
        {/* Navbar */}
        <header className="
          flex items-center justify-between 
          px-4 sm:px-6 md:px-10 
          py-4 md:py-6 
          shrink-0
        ">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-black" />
            <span className="font-semibold text-sm md:text-base">SERVEX US</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-black/70">
            <a>Doc</a>
            <a>Automatización</a>
            <a>Datos</a>
            <a>Casos de uso</a>
            <a>Soporte</a>
          </nav>
        </header>

        {/* Hero */}
        <div className="
          flex-1 
          grid grid-cols-1 md:grid-cols-2 
          gap-10 
          px-4 sm:px-6 md:px-10 
          pb-6 md:pb-10 
          items-center
        ">
          
          {/* Texto izquierda */}
          <div className="bg-transparent">
            <span className="
              inline-block mb-5 
              rounded-full 
              border border-black/10 
              px-4 py-1 
              text-[11px] sm:text-xs
            ">
              Plataforma interna · CET Servex US
            </span>

            <h1 className="
              text-3xl sm:text-4xl md:text-5xl 
              font-medium 
              leading-tight 
              tracking-tight
            ">
              Automatización <br />
              y Gestión <br />
              de Datos <span className="opacity-60">*</span>
            </h1>

            <p className="
              mt-5 sm:mt-6 
              max-w-md 
              text-sm 
              text-black/60
            ">
              Esta plataforma centraliza herramientas de automatización y control
              de datos diseñadas para optimizar procesos operativos fuera de CET
              Designer, permitiendo a los equipos de CET Servex trabajar de forma
              más eficiente, ordenada y escalable.
            </p>

            <div className="
              mt-7 sm:mt-8 
              flex flex-col sm:flex-row 
              sm:items-center 
              gap-5 sm:gap-6
            ">
              <button
                onClick={() => setShowLoginModal(true)}
                className="
                  w-full sm:w-auto
                  rounded-full 
                  bg-black 
                  px-8 py-3 
                  text-sm 
                  font-medium 
                  text-white 
                  shadow-lg 
                  transition hover:scale-[1.03]
                "
              >
                Acceder a la plataforma
              </button>

              <div className="flex items-center gap-4 text-xs text-black/60">
                <span>✓ Procesos centralizados</span>
                <span>✓ Datos controlados</span>
              </div>
            </div>
          </div>

          {/* Visual derecha */}
          <div className="
            relative 
            flex items-center justify-center 
            w-full 
            min-h-[260px] sm:min-h-[320px] md:h-full
          ">
            
            {/* Fondo */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-300 via-purple-300 to-pink-300 opacity-80" />

            {/* Contenedor */}
            <div className="
              relative z-10 
              w-full max-w-md 
              h-[260px] sm:h-[320px] 
              rounded-3xl 
              overflow-hidden 
              bg-transparent
            ">
              
              <div className="
                absolute right-4 sm:right-6 top-4 sm:top-6 
                w-48 sm:w-56 
                rounded-2xl 
                bg-white/70 
                backdrop-blur-xl 
                p-4 sm:p-5 
                shadow-xl
              ">
                <p className="text-base sm:text-lg font-semibold">Automatización</p>
                <p className="text-xs text-black/60 mt-1">
                  Procesos operativos fuera de CET Designer
                </p>
              </div>

              <div className="
                absolute left-4 sm:left-6 bottom-4 sm:bottom-6 
                rounded-full 
                bg-white/80 
                backdrop-blur 
                px-4 py-2 
                text-xs 
                shadow
              ">
                Uso interno · CET Servex US
              </div>
            </div>
          </div>
        </div>
      </section>

      <LoginPopup
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </main>
  );
}
