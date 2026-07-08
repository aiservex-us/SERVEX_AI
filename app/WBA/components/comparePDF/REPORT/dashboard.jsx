'use client';
import React from 'react';
import AuditReportViewer from './components/Report';

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

        
        
      </div>
    </div>
  );
}