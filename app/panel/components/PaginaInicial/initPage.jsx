'use client';

import React, { useState } from 'react';
// Cambiaste el nombre del archivo o alias, se inyectan las props aquí
import Sidebar from './components/main/loogout'; 
import Header from './components/main/Header';

// VISTAS / COMPONENTES
import Content from './components/main/Content';
import Chart from './components/main/Chart';
import DashboardRight from './components/main/Dashboard';

// VISTAS ADICIONALES
import Calendar from './components/menuEmpresas';
import Products from './components/main/AccesAgent';
import Settings from './components/Settings';

import Footer from './components/main/footer';

const InitPage = () => {
  const [activeView, setActiveView] = useState('dashboard');
  // NUEVO: Estado para controlar si el menú está colapsado o no
  const [collapsed, setCollapsed] = useState(false);

  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <div key="home" className="col-span-12 lg:col-span-8 space-y-6 animate-view-fade">
            <Content />
          </div>
        );

      case 'dashboard':
        return (
          <div key="dashboard" className="col-span-12 lg:col-span-8 space-y-6 animate-view-fade">
            <Content />
            <Chart />
          </div>
        );

      case 'calendar':
        return (
          <div key="calendar" className="col-span-12 lg:col-span-8 space-y-6 animate-view-fade">
            <Calendar />
          </div>
        );

      case 'products':
        return (
          <div key="products" className="col-span-12 lg:col-span-8 space-y-6 animate-view-fade">
            <Products />
          </div>
        );

      case 'settings':
        return (
          <div key="settings" className="col-span-12 lg:col-span-8 space-y-6 animate-view-fade">
            <Settings />
          </div>
        );

      default:
        return (
          <div key="default" className="col-span-12 lg:col-span-8 space-y-6 animate-view-fade">
            <Content />
            <Chart />
          </div>
        );
    }
  };

  return (
    <div className="flex h-[90vh] bg-[#FFF] font-sans overflow-hidden text-slate-700">
      {/* INYECCIÓN DE ANIMACIÓN PREMIUM AUTÓNOMA */}
      <style>{`
        @keyframes subtleFadeUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-view-fade {
          animation: subtleFadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
      `}</style>

      {/* SIDEBAR: Ahora recibe el estado y el manejador del colapso */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        active={activeView}          // Mapeo por si tu componente interno usa 'active'
        setActive={setActiveView}    // Mapeo por si tu componente interno usa 'setActive'
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />

      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <Header />

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#FFF]">
          <div className="grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">

            {/* COLUMNA IZQUIERDA (DINÁMICA) */}
            {renderMainContent()}

            {/* COLUMNA DERECHA (FIJA) */}
            <aside className="col-span-12 lg:col-span-4 relative">
              <div className="sticky top-0">
                <DashboardRight />
              </div>
            </aside>

          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
};

export default InitPage;