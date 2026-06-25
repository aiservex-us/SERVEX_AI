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
        
        {/* Contenedor Report.jsx (65% en escritorio, 100% en móvil) */}
        <div 
          // Se añaden clases dinámicas para el blur, opacidad y una transición suave
          className={`w-full lg:w-[65%] overflow-hidden transition-all duration-500 ease-out ${
            isAiActive 
              ? 'blur-[3px] opacity-40 scale-[0.99] cursor-pointer' 
              : 'blur-none opacity-100 scale-100'
          }`}
          // Al hacer clic en el reporte, se desactiva el enfoque de la IA
          onClick={() => setIsAiActive(false)}
        >
          <div className="bg-white">
            <AuditReportViewer />
          </div>
        </div>

        {/* Contenedor de IA (35%) -> Ahora se queda fijo al hacer scroll en escritorio */}
        <div 
          // Se añade una sutil elevación (shadow) cuando está activo para resaltar jerarquía
          className={`hidden min-[400px]:block w-full lg:w-[35%] border border-gray-100 rounded-lg shadow-sm overflow-hidden lg:sticky lg:top-6 transition-all duration-500 ease-out ${
            isAiActive ? 'shadow-md ring-1 ring-gray-200/50' : 'shadow-sm'
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