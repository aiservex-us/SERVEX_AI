'use client';
import React from 'react';
import AuditReportViewer from './components/Report';
import AuditAnalyticsDashboard from './components/graphics';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6" style={{ fontFamily: '"Segoe UI", Tahoma, sans-serif' }}>
      {/* Header del Dashboard */}
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[#201F1E]">Panel de Control Corporativo - SERVEX_AI</h1>
        <p className="text-xs text-[#605E5C]">Monitoreo en tiempo real de pipelines de auditoría y análisis de datos</p>
      </header>

      {/* Grid Layout 65% - 35% */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Contenedor Report.jsx (65%) */}
        <div className="lg:w-[65%] w-full">
          <div className="bg-white border border-[#E1DFDD] shadow-sm h-full">
            <AuditReportViewer />
          </div>
        </div>

        {/* Contenedor Graphics.jsx (35%) */}
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