'use client';
import React, { useState } from 'react';
import AuditReportViewer from './components/Report';
import AuditAnalyticsDashboard from './components/AI_contact';

export default function Dashboard() {
  // Estado para controlar si la sección de IA está activa/enfocada
  const [isAiActive, setIsAiActive] = useState(false);
  // Estado para cerrar el modal permanentemente si el usuario hace clic en la X
  const [isModalDismissed, setIsModalDismissed] = useState(false);

  const showOverlay = !isAiActive && !isModalDismissed;

  return (
    <div
      className="min-h-[85vh] bg-[#FFF] p-4 lg:p-6"
      style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}
    >

      {/* Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

        {/* Contenedor Report.jsx (dinámico: 70% inactivo, 55% activo en escritorio) */}
        <div className={`relative w-full transition-all duration-500 ease-out ${isAiActive ? 'lg:w-[55%]' : 'lg:w-[70%]'}`}>

          {/* Overlay del Logo e Información (Card) */}
          <div
            className={`hidden min-[400px]:block absolute inset-0 z-10 pointer-events-none transition-all duration-500 ease-out ${showOverlay ? 'opacity-100 backdrop-blur-[2px]' : 'opacity-0'
              }`}
          >
            <div className="sticky top-0 h-[91vh] w-full flex items-center justify-center bg-white/95 rounded-xl p-6">

              <div className={`
                bg-gradient-to-br from-[#464775]/10 via-[#464775]/5 to-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] backdrop-blur-sm 
                rounded-3xl w-full max-w-4xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16
                transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden relative
                ${showOverlay ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto' : 'translate-y-12 scale-95 opacity-0 pointer-events-none'}
              `}>
                
                {/* Close Button */}
                <button 
                  onClick={() => setIsModalDismissed(true)}
                  className="absolute top-6 right-6 p-2 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors z-20"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Elementos decorativos sutiles de la card (estilo corporativo #464775) */}
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#464775]/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#464775]/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-[30%] left-[30%] w-[200px] h-[200px] bg-white/40 rounded-full blur-[60px] pointer-events-none" />

                {/* Izquierda: Logo y Textos Originales */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                  <img
                    src="/alysa_lg.png"
                    alt="Logo"
                    className="w-72 lg:w-80 h-auto object-contain drop-shadow-2xl mb-8 transition-transform duration-700 hover:scale-105"
                  />
                  <div className="text-center">
                    <h3 className="text-[#464775] text-lg lg:text-xl font-extralight tracking-[0.25em]">
                      CET Change Development Tool
                    </h3>
                    <p className="text-slate-400 text-[9px] mt-3 font-light tracking-widest uppercase">
                      Development of new technologies · Servex transition
                    </p>
                  </div>
                </div>

                {/* Divisor vertical (solo desktop) */}
                <div className="hidden lg:block w-px h-72 bg-gradient-to-b from-transparent via-slate-200 to-transparent relative z-10" />

                {/* Derecha: Información de Impacto y GLYNNE S.A.S */}
                <div className="flex-1 flex flex-col justify-center relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#464775]/5 border border-[#464775]/10 w-fit mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#464775] animate-pulse" />
                    <span className="text-[9px] font-bold tracking-widest text-[#464775] uppercase">Powered by SVX</span>
                  </div>

                  <h2 className="text-2xl lg:text-3xl font-light text-slate-800 tracking-tight mb-5 leading-tight">
                    Weeks of work.<br />
                    <strong className="font-semibold text-[#464775]">Done in seconds.</strong>
                  </h2>

                  <p className="text-sm text-slate-500 leading-relaxed font-light mb-8">
                    Through a few simple actions, our system fully automates <strong className="font-medium text-slate-700">3 weeks of manual analysis, data comparison, updating, and strict verification</strong>.
                    The entire operational lifecycle that previously took weeks is now flawlessly executed in mere seconds by <strong className="font-semibold text-slate-700">Alysa SVX Copilot</strong>.
                  </p>

                  <div className="flex flex-col gap-1 mt-auto">
                    <p className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold">Proprietary Technology</p>
                    <p className="text-[10px] text-slate-500 font-light tracking-wide">Next-gen intelligence ecosystem.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div
            // El reporte ya no se difumina en sí mismo (para evitar lag), el overlay de arriba hace el trabajo
            className="w-full h-full overflow-hidden transition-all duration-500 ease-out"
            onClick={() => setIsAiActive(false)}
          >
            <div className="bg-white">
              <AuditReportViewer />
            </div>
          </div>
        </div>

        {/* Contenedor de IA (dinámico: 30% inactivo, 45% activo en escritorio) -> Ahora se queda fijo al hacer scroll en escritorio */}
        <div
          // Se añade una sutil elevación (shadow) y más ancho cuando está activo para resaltar jerarquía
          className={`hidden min-[400px]:block w-full border border-gray-100 rounded-lg overflow-hidden lg:sticky lg:top-6 transition-all duration-500 ease-out ${isAiActive ? 'lg:w-[45%] shadow-md ring-1 ring-gray-200/50' : 'lg:w-[30%] shadow-sm'
            }`}
          // Al hacer clic en el área de IA, se activa el enfoque y desenfoca el reporte
          onClick={() => {
            setIsAiActive(true);
            setIsModalDismissed(true);
          }}
        >
          <div className="bg-white">
            <AuditAnalyticsDashboard />
          </div>
        </div>

      </div>
    </div>
  );
}