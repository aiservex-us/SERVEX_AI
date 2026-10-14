'use client';
import React, { useState } from 'react';
import Image from 'next/image';
// Importamos el componente desde la misma carpeta


const WBmfgAdminHero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para abrir/close el modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="relative h-full min-h-[80vh] w-full font-sans overflow-y-auto custom-scrollbar bg-transparent flex flex-col lg:flex-row">
      
      {/* --- POPUP / MODAL OVERLAY --- */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={toggleModal}
        >
          {/* Contenedor del Modal */}
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal con Botón de Close */}
            <div className="absolute top-4 right-4 z-[110]">
              <button 
                onClick={toggleModal}
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-[#464775]/10 text-slate-500 hover:text-[#464775] transition-all duration-200 shadow-sm"
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
      <div className="w-full lg:w-[65%] h-full bg-transparent flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12">
        
        <div className="max-w-2xl w-full flex flex-col items-center text-center">
          
          {/* Logo Area */}
          <div className="flex flex-col items-center gap-3 mb-6 lg:mb-8">
            <div className="w-14 h-14 flex items-center justify-center p-2 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md">
              <img 
                src="/logo.png" 
                alt="General Process Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-base tracking-widest uppercase text-slate-900">
                General Process Seating
              </span>
              <span className="font-semibold text-[9.5px] tracking-[0.2em] uppercase text-slate-500 mt-0.5">
                Client Export Module
              </span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 mb-5 rounded-full border border-[#464775]/20 bg-[#464775]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#464775]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#464775] animate-pulse" />
              Data Distribution Center
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight mb-5">
              Export Data <br />
              <span className="text-slate-400 font-light">For Complete Client</span>
            </h2>
            
            <p className="max-w-lg text-xs sm:text-sm text-slate-600 leading-relaxed mb-8 font-normal">
              Seamlessly format, preview, and export complete datasets directly to your clients through the <span className="text-slate-900 font-semibold">SERVEX ecosystem</span>.
            </p>

            {/* Features */}
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs">
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#464775]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  1-Click Export
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#464775]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Client Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- LADO DERECHO (VISUAL) --- */}
      <div className="hidden lg:flex w-[35%] h-full relative items-center justify-center overflow-hidden border-l border-slate-200/50 bg-transparent">
        
        {/* Decorative Floating 3D Glass Shapes */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px' }}>

          {/* Shape 1 */}
          <div
            className="absolute top-[15%] left-[5%] w-[150px] h-[150px] backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, #46477533, rgba(255,255,255,0.1))',
              transform: 'rotateX(20deg) rotateY(30deg) translateZ(-100px)',
              boxShadow: 'inset 0 0 40px rgba(255,255,255,0.4)',
              clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
            }}
          />

          {/* Shape 2 */}
          <div
            className="absolute top-[20%] left-[20%] w-[170px] h-[170px] bg-gradient-to-br from-[#464775]/80 to-[#32335b]/40 backdrop-blur-xl z-10"
            style={{
              transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
              boxShadow: 'inset 0 0 50px rgba(255,255,255,0.2)',
              clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
            }}
          />

          {/* Shape 3 */}
          <div
            className="absolute top-[30%] right-[25%] w-[140px] h-[140px] backdrop-blur-md z-10"
            style={{
              background: 'linear-gradient(45deg, rgba(255,255,255,0.3), #4647751A)',
              transform: 'rotateX(60deg) rotateY(-50deg) translateZ(100px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5)',
              clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'
            }}
          />
        </div>

        <div className="relative z-20 rotate-90 pointer-events-none opacity-20 mix-blend-multiply">
          <span className="text-[#464775] font-black text-[90px] tracking-tighter select-none leading-none">
            General Process Seating
          </span>
        </div>
      </div>

    </div>
  );
};

export default WBmfgAdminHero;