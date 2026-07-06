'use client';
import React, { useState } from 'react';
import AuditReportViewer from './components/Report';
import AuditAnalyticsDashboard from './components/AI_contact';

export default function Dashboard() {
  // Estado para controlar si la sección de IA está activa/enfocada
  const [isAiActive, setIsAiActive] = useState(false);

  return (
    <div
      className="min-h-[85vh] bg-[#FFF] p-4 lg:p-6"
      style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}
    >

      {/* Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

        {/* Contenedor Report.jsx (dinámico: 70% inactivo, 55% activo en escritorio) */}
        <div className={`relative w-full transition-all duration-500 ease-out ${isAiActive ? 'lg:w-[55%]' : 'lg:w-[70%]'}`}>

          {/* Overlay del Logo y Blur (sticky a la pantalla para mejor rendimiento y centrado perfecto) */}
          <div
            className={`absolute inset-0 z-10 pointer-events-none transition-all duration-500 ease-out ${isAiActive ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div className="sticky top-0 h-[85vh] w-full flex items-center justify-center backdrop-blur-[4px] bg-white/30 rounded-xl">
              <img
                src="/logo.png"
                alt="Logo"
                className={`w-64 h-auto object-contain drop-shadow-2xl transition-all duration-500 ease-out ${isAiActive ? 'scale-100' : 'scale-90'}`}
              />
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
          className={`hidden min-[400px]:block w-full border border-gray-100 rounded-lg overflow-hidden lg:sticky lg:top-6 transition-all duration-500 ease-out ${
            isAiActive ? 'lg:w-[45%] shadow-md ring-1 ring-gray-200/50' : 'lg:w-[30%] shadow-sm'
          }`}
          // Al hacer clic en el área de IA, se activa el enfoque y desenfoca el reporte
          onClick={() => setIsAiActive(true)}
        >
          <div className="bg-white">
            <AuditAnalyticsDashboard />
          </div>
        </div>

      </div>
    </div>
  );
}