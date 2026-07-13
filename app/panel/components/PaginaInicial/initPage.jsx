'use client';

import React, { useState } from 'react';
// Cambiaste el nombre del archivo o alias, se inyectan las props aquí
import Sidebar from './components/main/loogout';
import Header from './components/main/Header';

// VISTAS / COMPONENTES
import Content from './components/main/Content';
import Chart from './components/main/Chart';
import DashboardRight from './components/main/Dashboard';
import Forum from './components/main/Forum';

// VISTAS ADICIONALES
import Calendar from './components/menuEmpresas';
import Products from './components/main/AccesAgent';
import Settings from './components/Settings';
import { Brain } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import Footer from './components/main/footer';

const InitPage = () => {
  const [activeView, setActiveView] = useState('dashboard');
  // NUEVO: Estado para controlar si el menú está colapsado o no
  const [collapsed, setCollapsed] = useState(false);
  // Estado para el chat flotante
  const [isChatOpen, setIsChatOpen] = useState(false);

  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return (
          <div key="home" className="col-span-12 lg:col-span-8 space-y-6 animate-view-fade">
            <Content setActiveView={setActiveView} />
          </div>
        );

      case 'dashboard':
        return (
          <div key="dashboard" className="col-span-12 lg:col-span-8 space-y-6 animate-view-fade">
            <Content setActiveView={setActiveView} />
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

      case 'foro':
        return (
          <div key="foro" className="col-span-12 lg:col-span-8 space-y-6 animate-view-fade">
            <Forum />
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
            <Content setActiveView={setActiveView} />
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

        {/* BOTÓN FLOTANTE Y CHAT (Si no estamos en 'products') */}
        {activeView !== 'products' && (
          <AnimatePresence mode="wait">
            {isChatOpen ? (
              <motion.div
                key="chat-window"
                initial={{ opacity: 0, x: -250, y: 150, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -250, y: 150, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, mass: 0.8 }}
                className="fixed bottom-8 right-10 z-[100] flex flex-col items-end pointer-events-none"
              >
                <div className="mb-4 pointer-events-auto">
                  <Products isFloating={true} onClose={() => setIsChatOpen(false)} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-button"
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.9 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
              >
                <div className="relative">
                  {/* Animación de fondo sutil (glow/vibración) */}
                  <div className="absolute -inset-1.5 bg-indigo-500/20 rounded-full blur-md animate-soft-glow pointer-events-none" />
                  
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="relative flex items-center gap-3 bg-white border border-gray-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] px-5 py-3 rounded-full hover:bg-gray-50 hover:-translate-y-1 transition-all pointer-events-auto w-[320px] group animate-float-idle"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#464775] text-white flex items-center justify-center relative flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Brain size={16} />
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
                    </div>
                    <div className="flex flex-col items-start text-left flex-1">
                      <span className="text-[13px] font-bold text-gray-800 leading-none">SVX Copilot</span>
                      <span className="text-[11px] text-gray-500 font-medium mt-1 truncate">Online · Chat with Alysa</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

      </main>
    </div>
  );
};

export default InitPage;