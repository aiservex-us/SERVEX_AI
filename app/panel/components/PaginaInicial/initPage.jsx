'use client';

import React, { useState } from 'react';
// Cambiaste el nombre del file o alias, se inyectan las props aquí
import Sidebar from './components/main/loogout';

// VISTAS / COMPONENTES
import Content from './components/main/Content';
import Chart from './components/main/Chart';
import { ArchitectureSpecs } from './components/main/Dashboard';
import Forum from './components/main/Forum';

// VISTAS ADICIONALES
import Calendar from './components/menuEmpresas';
import Products from './components/main/AccesAgent';
import FilesView from './components/main/FilesView';

import Footer from './components/main/footer';

const InitPage = () => {
  const [activeView, setActiveView] = useState('dashboard');
  // NUEVO: Estado para controlar si el menú está colapsado o no
  const [collapsed, setCollapsed] = useState(false);

  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <div key="home" className="col-span-12 space-y-6 animate-view-fade">
            <div className="grid grid-cols-12 gap-6 items-stretch">
              <div className="col-span-12 lg:col-span-8 flex flex-col">
                <Content setActiveView={setActiveView} />
              </div>
              <div className="col-span-12 lg:col-span-4 flex flex-col">
                <ArchitectureSpecs />
              </div>
            </div>
          </div>
        );

      case 'dashboard':
      default:
        return (
          <div key="dashboard" className="col-span-12 space-y-6 animate-view-fade">
            {/* ROW 1: Operations Hero Banner (8 cols) + Architecture Specs (4 cols) */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
              <div className="col-span-12 lg:col-span-8 flex flex-col">
                <Content setActiveView={setActiveView} />
              </div>
              <div className="col-span-12 lg:col-span-4 flex flex-col">
                <ArchitectureSpecs />
              </div>
            </div>

            {/* ROW 2: Pipeline Execution & Analytics (8 cols) + Servex Copilot Chat (4 cols) */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
              <div className="col-span-12 lg:col-span-8 flex flex-col">
                <Chart setActiveView={setActiveView} />
              </div>
              <div className="col-span-12 lg:col-span-4 flex flex-col">
                <section className="w-full h-[580px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-[0_10px_35px_-10px_rgba(70,71,117,0.08)] relative bg-white flex flex-col">
                  <Products isFloating={false} isInitialWidget={true} />
                </section>
              </div>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div key="calendar" className="col-span-12 space-y-6 animate-view-fade">
            <Calendar />
          </div>
        );

      case 'products':
        return (
          <div key="products" className="col-span-12 h-full min-h-0 flex flex-col animate-view-fade">
            <Products />
          </div>
        );

      case 'foro':
        return (
          <div key="foro" className="col-span-12 space-y-6 animate-view-fade">
            <Forum />
          </div>
        );

      case 'files':
        return (
          <div key="files" className="col-span-12 space-y-6 animate-view-fade">
            <FilesView />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-[#FFF] font-sans overflow-hidden text-slate-700 relative min-h-0">
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
        @keyframes floatIdle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-float-idle {
          animation: floatIdle 4s ease-in-out infinite;
        }
        @keyframes softGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-soft-glow {
          animation: softGlow 3s ease-in-out infinite;
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

      <main className="flex-1 h-full flex flex-col overflow-hidden min-h-0">
        {activeView === 'products' ? (
          <div className="flex-1 h-full w-full min-h-0 flex flex-col max-[700px]:pb-[60px] overflow-hidden">
            <Products />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-[#FFF] p-4 md:p-8 pb-24 md:pb-8">
            <div className="max-w-[1600px] mx-auto w-full">
              {renderMainContent()}
            </div>
            <Footer />
          </div>
        )}
      </main>
    </div>
  );
};

export default InitPage;