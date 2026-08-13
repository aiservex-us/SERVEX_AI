'use client';
import React, { useState } from 'react';
import Image from 'next/image';
// Importamos el componente desde la misma carpeta


const WBmfgAdminHero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para abrir/close el modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="relative h-[94vh] w-full font-sans overflow-hidden bg-white flex">
      
      {/* --- POPUP / MODAL OVERLAY --- */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center  backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={toggleModal} // Cierra al hacer clic en el fondo
        >
          {/* Contenedor del Modal */}
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
          >
            {/* Header del Modal con Botón de Close */}
            <div className="absolute top-4 right-4 z-[110]">
              <button 
                onClick={toggleModal}
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all duration-200 shadow-sm"
                aria-label="Close"
              >
                <svg 
                  className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
        
          </div>
        </div>
      )}

      {/* --- LADO IZQUIERDO (CONTENIDO) --- */}
      <div className="w-full lg:w-[65%] h-full bg-white flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20">
        
        <div className="max-w-3xl w-full flex flex-col items-center text-center">
          
          {/* Logo Area */}
          <div className="flex flex-col items-center gap-4 mb-12 lg:mb-16">
            <div className="w-16 h-16 flex items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-100">
              <img 
                src="/logosEmpresas/WB.webp" 
                alt="WB mfg Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg tracking-widest uppercase text-black">
                WB Seating
              </span>
              <span className="font-medium text-[10px] tracking-[0.2em] uppercase text-black/40">
                Client Export Module
              </span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 mb-8 rounded-full border border-[#b91c1c]/20 bg-[#b91c1c]/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#b91c1c]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] animate-pulse" />
              Data Distribution Center
            </div>

            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-black leading-[1] mb-8">
              Export Data <br />
              <span className="text-black/25">For Complete Client</span>
            </h2>
            
            <p className="max-w-xl text-base sm:text-lg text-black/50 leading-relaxed mb-12 font-light">
              Seamlessly format, preview, and export complete datasets directly to your clients through the <span className="text-black/80 font-medium">SERVEX ecosystem</span>.
            </p>

            {/* Botón que dispara el modal */}
            <div className="flex flex-col items-center gap-8">
  
              <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-black/30">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#b91c1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  1-Click Export
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#b91c1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Client Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- LADO DERECHO (VISUAL) --- */}
      <div className="hidden lg:flex w-[35%] h-full relative items-center justify-center overflow-hidden border-l border-gray-100 bg-gradient-to-b from-[#b91c1c]/40 via-[#b91c1c]/10 to-white">
        
        {/* Decorative Floating 3D Glass Shapes (Ultra Pro) */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px', filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.15)) drop-shadow(0 5px 15px rgba(0,0,0,0.05))' }}>

          {/* Shape 1: Back left */}
          <div
            className="absolute top-[15%] left-[5%] w-[180px] h-[180px] backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, #b91c1c33, rgba(255,255,255,0.1))',
              transform: 'rotateX(20deg) rotateY(30deg) translateZ(-100px)',
              boxShadow: 'inset 0 0 40px rgba(255,255,255,0.4), inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 15px rgba(0,0,0,0.2)',
              clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
            }}
          />

          {/* Shape 2: Main center, solid professional color */}
          <div
            className="absolute top-[20%] left-[20%] w-[200px] h-[200px] bg-gradient-to-br from-[#b91c1c]/80 to-[#7f1d1d]/40 backdrop-blur-xl z-10"
            style={{
              transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
              boxShadow: 'inset 0 0 50px rgba(255,255,255,0.2), inset 2px 2px 5px rgba(255,255,255,0.4), inset -4px -4px 15px rgba(0,0,0,0.4)',
              clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
            }}
          />

          {/* Shape 3: Thin, right side rotated deeply */}
          <div
            className="absolute top-[30%] right-[25%] w-[160px] h-[160px] backdrop-blur-md z-10"
            style={{
              background: 'linear-gradient(45deg, rgba(255,255,255,0.3), #b91c1c1A)',
              transform: 'rotateX(60deg) rotateY(-50deg) translateZ(100px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), inset 1px 1px 3px rgba(255,255,255,0.9), inset -1px -1px 10px rgba(0,0,0,0.1)',
              clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
            }}
          />

          {/* Shape 4: Middle right */}
          <div
            className="absolute bottom-[35%] right-[10%] w-[190px] h-[190px] bg-white/40 backdrop-blur-lg"
            style={{
              transform: 'rotateX(15deg) rotateY(20deg) translateZ(0px)',
              boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), inset 2px 2px 8px rgba(255,255,255,1), inset -2px -2px 10px rgba(0,0,0,0.05)',
              clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
            }}
          />

          {/* Shape 5: Blurry foreground bottom left */}
          <div
            className="absolute bottom-[20%] left-[25%] w-[180px] h-[180px] backdrop-blur-2xl blur-[2px]"
            style={{
              backgroundColor: '#b91c1c4D',
              transform: 'rotateX(45deg) rotateY(15deg) translateZ(150px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2), inset 2px 2px 10px rgba(255,255,255,0.5)',
              clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
            }}
          />

        </div>

        <div className="absolute top-12 right-12 cursor-pointer group z-20">
          <div className="w-6 h-[1.5px] bg-[#b91c1c] mb-1.5 transition-all group-hover:w-8" />
          <div className="w-4 h-[1.5px] bg-[#b91c1c] ml-auto" />
        </div>
        
        <div className="relative z-20 rotate-90 pointer-events-none opacity-30 mix-blend-multiply">
          <span className="text-[#b91c1c] font-black text-[120px] tracking-tighter select-none leading-none">
            WB Seating
          </span>
        </div>
      </div>

    </div>
  );
};

export default WBmfgAdminHero;