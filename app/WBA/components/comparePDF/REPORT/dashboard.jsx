'use client';
import React from 'react';
import AuditReportViewer from './components/Report';
import AuditAnalyticsDashboard from './components/AI_contact';

export default function Dashboard() {
  return (
    <div className="min-h-[85vh] bg-[#FFF] p-4 lg:p-6" style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}>
      
      {/* Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start"> {/* Añadido items-start para que el sticky funcione correctamente */}
        
        {/* Contenedor Report.jsx (65% en escritorio, 100% en móvil) */}
        <div className="w-full lg:w-[65%] overflow-hidden">
          <div className="bg-white">
            <AuditReportViewer />
          </div>
        </div>

        {/* Contenedor de IA (35%) -> Ahora se queda fijo al hacer scroll en escritorio */}
        <div className="hidden min-[400px]:block w-full lg:w-[35%] border border-gray-100 rounded-lg shadow-sm overflow-hidden lg:sticky lg:top-6">
          <div className="bg-white">
            <AuditAnalyticsDashboard />
          </div>
        </div>
        
      </div>
    </div>
  );
}