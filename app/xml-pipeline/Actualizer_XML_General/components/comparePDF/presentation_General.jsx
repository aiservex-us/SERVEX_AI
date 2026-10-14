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
                Catalog Manager
              </span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-2 mb-5 rounded-full border border-[#464775]/20 bg-[#464775]/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#464775]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#464775] animate-pulse" />
              Internal Administration Platform
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight mb-5">
              General Process Catalog <br />
              <span className="text-slate-400 font-light">Administration</span>
            </h2>
            
            <p className="max-w-lg text-xs sm:text-sm text-slate-600 leading-relaxed mb-8 font-normal">
              Centralized management for data integrity, ETL workflows, 
              and real-time updates for General Process product catalogs within the <span className="text-slate-900 font-semibold">SERVEX ecosystem</span>.
            </p>

            {/* Features */}
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/80 shadow-xs">
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#464775]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  Data Control
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-[#464775]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  ETL Optimized
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- LADO DERECHO (VISUAL) --- */}
      <div className="hidden lg:flex w-[35%] h-full relative items-center justify-center overflow-hidden border-l border-slate-200/50 bg-transparent">
        
        {/* Decorative Floating 3D Glass Coins */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px' }}>
          
          {/* Coin 1: Back left */}
          <div 
            className="absolute top-[15%] left-[5%] w-[150px] h-[150px] rounded-full bg-white/20 backdrop-blur-md border border-white/50"
            style={{ 
              transform: 'rotateX(20deg) rotateY(30deg) translateZ(-100px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -2px 2px 0 rgba(255,255,255,0.6), -10px 10px 20px rgba(0,0,0,0.05)'
            }} 
          />
          
          {/* Coin 2: Main center */}
          <div 
            className="absolute top-[20%] left-[20%] w-[170px] h-[170px] rounded-full bg-gradient-to-br from-[#464775]/60 to-[#464775]/20 backdrop-blur-xl border border-white/60 z-10"
            style={{ 
              transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
              boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -15px 15px 30px rgba(0,0,0,0.1)'
            }}
          />
          
          {/* Coin 3 */}
          <div 
            className="absolute top-[30%] right-[25%] w-[140px] h-[140px] rounded-full bg-white/30 backdrop-blur-md border border-white/50 z-10"
            style={{ 
              transform: 'rotateX(60deg) rotateY(-50deg) translateZ(100px)',
              boxShadow: 'inset 0 0 15px rgba(255,255,255,0.4), -1px 1px 0 #fff, -10px 10px 15px rgba(0,0,0,0.05)'
            }}
          />
        </div>

        <div className="relative z-20 rotate-90 pointer-events-none opacity-20 mix-blend-multiply">
          <span className="text-[#2B2C4B] font-black text-[90px] tracking-tighter select-none leading-none">
            General Process Seating
          </span>
        </div>
      </div>

    </div>
  );
};

export default WBmfgAdminHero;