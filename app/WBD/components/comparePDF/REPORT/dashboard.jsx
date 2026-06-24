'use client';
import React from 'react';
import AuditReportViewer from './components/Report';
import AuditAnalyticsDashboard from './components/AI_contact';

export default function Dashboard() {
  return (
    <div className="min-h-[85vh] bg-[#FFF] p-4 lg:p-6" style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}>
      
      {/* Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        
        {/* Contenedor Report.jsx (65% en escritorio, 100% en móvil) */}
        {/* Usamos 'w-full' para que siempre sea full responsive */}
        <div className="w-full lg:w-[65%] overflow-hidden">
          <div className="bg-white ">
            <AuditReportViewer />
          </div>
        </div>

        {/* Contenedor Graphics.jsx (35%) */}
        {/* 'hidden' por defecto, se muestra como 'block' solo si el ancho es >= 400px */}
        {/* En pantallas grandes (lg), mantenemos el 35% */}
    <div className="hidden min-[400px]:block w-full lg:w-[35%] border border-gray-100 rounded-lg shadow-sm overflow-hidden">
  <div className="bg-white">
    <AuditAnalyticsDashboard />
  </div>
</div>
        
      </div>
    </div>
  );
}