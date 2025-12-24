'use client';

import React, { useState } from 'react';
import Sidebar from './components/main/Sidebar';
import Header from './components/main/Header';

// VISTAS / COMPONENTES
import Content from './components/main/Content';
import Chart from './components/main/Chart';
import DashboardRight from './components/main/Dashboard';

// (Ejemplos de vistas adicionales)
import Calendar from './components/Calendar';
import Products from './components/Products';
import Settings from './components/Settings';

const InitPage = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Content />
          </div>
        );

      case 'dashboard':
        return (
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Content />
            <Chart />
          </div>
        );

      case 'calendar':
        return (
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Calendar />
          </div>
        );

      case 'products':
        return (
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Products />
          </div>
        );

      case 'settings':
        return (
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Settings />
          </div>
        );

      default:
        return (
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Content />
            <Chart />
          </div>
        );
        
    }
  };

  return (
    <div className="flex h-[90vh] bg-[#FFF] font-sans overflow-hidden text-slate-700">
      {/* SIDEBAR */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <Header />

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#FFF]">
          <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">

            {/* COLUMNA IZQUIERDA (DINÁMICA) */}
            {renderMainContent()}
{/* COLUMNA DERECHA (FIJA COMO SIDEBAR) */}
<aside className="col-span-12   lg:col-span-4 relative">
  <div className="sticky ">
    <DashboardRight />
  </div>
</aside>


          </div>
          <Header />
        </div>
        
      </main>
    </div>
  );
};

export default InitPage;
