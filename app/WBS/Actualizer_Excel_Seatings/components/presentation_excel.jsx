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
                Excel & CSV Converter
              </span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 mb-8 rounded-full border border-[#464775]/20 bg-[#464775]/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#464775]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#464775] animate-pulse" />
              Internal Administration Platform
            </div>

            <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-black leading-[1] mb-8">
              WB mfg Excel <br />
              <span className="text-black/25">Data Processing</span>
            </h2>
            
            <p className="max-w-xl text-base sm:text-lg text-black/50 leading-relaxed mb-12 font-light">
              Centralized processing for XML parsing, CSV generation,
              and Excel data extraction within the <span className="text-black/80 font-medium">SERVEX ecosystem</span>.
            </p>

            {/* Botón que dispara el modal */}
            <div className="flex flex-col items-center gap-8">
  
              <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-black/30">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#464775]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Data Control
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#464775]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  ETL Optimized
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- LADO DERECHO (VISUAL) --- */}
      <div className="hidden lg:flex w-[35%] h-full relative items-center justify-center overflow-hidden border-l border-gray-100 bg-gradient-to-b from-[#464775]/40 via-[#464775]/10 to-white">
        
        {/* Decorative Floating 3D Glass Coins (Recreating the elegant image) */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px' }}>
          
          {/* Coin 1: Back left */}
          <div 
            className="absolute top-[15%] left-[5%] w-[180px] h-[180px] rounded-full bg-white/20 backdrop-blur-md border border-white/50"
            style={{ 
              transform: 'rotateX(20deg) rotateY(30deg) translateZ(-100px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -2px 2px 0 rgba(255,255,255,0.6), -10px 10px 20px rgba(0,0,0,0.05)'
            }} 
          />
          
          {/* Coin 2: Main center, distinctly purple with thickness */}
          <div 
            className="absolute top-[20%] left-[20%] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#464775]/60 to-[#464775]/20 backdrop-blur-xl border border-white/60 z-10"
            style={{ 
              transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
              boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -4px 4px 0 #d0d0d0, -15px 15px 30px rgba(0,0,0,0.1)'
            }}
          />
          
          {/* Coin 3: Thin, right side rotated deeply */}
          <div 
            className="absolute top-[30%] right-[25%] w-[160px] h-[160px] rounded-full bg-white/30 backdrop-blur-md border border-white/50 z-10"
            style={{ 
              transform: 'rotateX(60deg) rotateY(-50deg) translateZ(100px)',
              boxShadow: 'inset 0 0 15px rgba(255,255,255,0.4), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -10px 10px 15px rgba(0,0,0,0.05)'
            }}
          />
          
          {/* Coin 4: Middle right */}
          <div 
            className="absolute bottom-[35%] right-[10%] w-[190px] h-[190px] rounded-full bg-white/40 backdrop-blur-lg border border-white/70"
            style={{ 
              transform: 'rotateX(15deg) rotateY(20deg) translateZ(0px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -10px 10px 20px rgba(0,0,0,0.05)'
            }}
          />

          {/* Coin 5: Blurry foreground bottom left */}
          <div 
            className="absolute bottom-[20%] left-[25%] w-[180px] h-[180px] rounded-full bg-[#464775]/20 backdrop-blur-xl border border-white/30 blur-[4px]"
            style={{ 
              transform: 'rotateX(45deg) rotateY(15deg) translateZ(150px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)'
            }}
          />

        </div>

        <div className="absolute top-12 right-12 cursor-pointer group z-20">
          <div className="w-6 h-[1.5px] bg-[#464775] mb-1.5 transition-all group-hover:w-8" />
          <div className="w-4 h-[1.5px] bg-[#464775] ml-auto" />
        </div>
        
        <div className="relative z-20 rotate-90 pointer-events-none opacity-30 mix-blend-multiply">
          <span className="text-[#2B2C4B] font-black text-[120px] tracking-tighter select-none leading-none">
            WB Seating
          </span>
        </div>
      </div>

    </div>
  );
};

export default WBmfgAdminHero;