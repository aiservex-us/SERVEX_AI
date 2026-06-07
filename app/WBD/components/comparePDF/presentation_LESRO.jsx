'use client';
import React, { useState } from 'react';
import Image from 'next/image';
// Importamos el componente desde la misma carpeta
import InsertXML from './incertXML';

const LesroAdminHero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para abrir/cerrar el modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="relative h-[94vh] w-full font-sans overflow-hidden bg-white flex">
      
      {/* --- POPUP / MODAL OVERLAY --- */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={toggleModal} // Cierra al hacer clic en el fondo
        >
          {/* Contenedor del Modal */}
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
          >
            {/* Header del Modal con Botón de Cerrar */}
            <div className="absolute top-4 right-4 z-[110]">
              <button 
                onClick={toggleModal}
                className="group flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all duration-200 shadow-sm"
                aria-label="Cerrar"
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
            
            {/* Contenido del Componente InsertXML */}
            <div className="p-1 overflow-y-auto max-h-[90vh]">
              <InsertXML />
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
                src="/logosEmpresas/lesro.webp" 
                alt="LESRO Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg tracking-widest uppercase text-black">
                LESRO
              </span>
              <span className="font-medium text-[10px] tracking-[0.2em] uppercase text-black/40">
                Catalog Manager
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
              LESRO Catalog <br />
              <span className="text-black/25">Administration</span>
            </h2>
            
            <p className="max-w-xl text-base sm:text-lg text-black/50 leading-relaxed mb-12 font-light">
              Centralized management for data integrity, ETL workflows, 
              and real-time updates for LESRO product catalogs within the <span className="text-black/80 font-medium">SERVEX ecosystem</span>.
            </p>

            {/* Botón que dispara el modal */}
            <div className="flex flex-col items-center gap-8">
              <button 
                onClick={toggleModal}
                className="inline-flex items-center justify-center rounded-full bg-[#464775] px-12 py-4 text-sm font-bold text-white shadow-xl shadow-[#464775]/20 transition-all hover:scale-[1.05] hover:bg-[#3b3c63] active:scale-[0.98]"
              >
                Insert the data
              </button>
              
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
      <div className="hidden lg:flex w-[35%] h-full bg-[#464775] relative items-center justify-center overflow-hidden">
        <div className="absolute top-12 right-12 cursor-pointer group z-10">
          <div className="w-6 h-[1.5px] bg-white mb-1.5 transition-all group-hover:w-8" />
          <div className="w-4 h-[1.5px] bg-white ml-auto" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_75%)]" />
        
        <div className="relative z-10 opacity-20 rotate-90 pointer-events-none">
          <span className="text-white font-black text-[140px] tracking-tighter select-none leading-none">
            LESRO
          </span>
        </div>
      </div>

    </div>
  );
};

export default LesroAdminHero;