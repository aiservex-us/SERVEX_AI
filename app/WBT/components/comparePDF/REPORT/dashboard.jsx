'use client';
import React from 'react';
import AuditReportViewer from './components/Report';
import AuditAnalyticsDashboard from './components/graphics';

export default function Dashboard() {
  return (
    // Se ajustó el padding a 'p-4' para móvil y 'lg:p-6' para escritorio
    <div className="min-h-screen bg-[#F5F5F5] p-4 lg:p-6" style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}>
      


      {/* Grid Layout 65% - 35% con manejo de desbordamiento */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        
        {/* Contenedor Report.jsx (65%) */}
        {/* 'w-full' asegura el ancho total en móvil */}
        <div className="lg:w-[65%] w-full overflow-hidden">
          <div className="bg-white border border-[#E1DFDD] shadow-sm min-h-[400px]">
            <AuditReportViewer />
          </div>
        </div>

        {/* Contenedor Graphics.jsx (35%) */}
        {/* 'w-full' permite que se apile correctamente en móvil */}
        <div className="lg:w-[35%] w-full">
          <div className="bg-white border border-[#E1DFDD] shadow-sm p-4 h-full">
            <h2 className="text-sm font-semibold text-[#323130] mb-4">Analítica de Datos</h2>
            <AuditAnalyticsDashboard />
          </div>
        </div>
        
      </div>
    </div>
  );
}