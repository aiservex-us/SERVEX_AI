"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Aseguramos AnimatePresence
import { Menu, X, PanelRightOpen, PanelRightClose } from 'lucide-react'; 
import SidebarLeft from './compnents/SidebarLeft';
import Viewport from './compnents/Viewport';
import Viewport2 from './compnents/Viewport2';
import SidebarRight from './compnents/SidebarRight';

const AIReporting = () => {
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [activeViewport, setActiveViewport] = useState('explorer');

  // Definimos las variantes de la animación para los Viewports
  const viewportVariants = {
    initial: { opacity: 0, scale: 0.98, y: 5 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.02, y: -5 },
  };

  return (
    <div className="flex h-[98%] w-[100%] bg-[#FFF] text-[#242424] font-sans overflow-hidden relative">
      
      {/* Botón Móvil Izquierdo */}
      <div className="lg:hidden absolute top-2 left-4 z-[60]">
        <button 
          onClick={() => setIsLeftOpen(!isLeftOpen)}
          className="p-2 bg-[#464775] text-white rounded-md shadow-md"
        >
          {isLeftOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* BOTÓN DE CONTROL DERECHO */}
      <div className={`absolute top-4 z-[60] transition-all mt-[-12px] duration-300 ${isRightOpen ? "right-[270px]" : "right-4"}`}>
        <button 
          onClick={() => setIsRightOpen(!isRightOpen)}
          className={`p-1.5 rounded-md border transition-all shadow-sm ${
            isRightOpen 
            ? "bg-[#464775] text-white border-transparent" 
            : "bg-white text-[#464775] border-[#EDEBE9] hover:bg-slate-50"
          }`}
        >
          {isRightOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </div>

      {/* --- Sidebar Izquierdo --- */}
      <div className={`
          fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
          ${isLeftOpen ? "translate-x-0" : "-translate-x-full"}
          lg:flex h-full
        `}
      >
        <SidebarLeft 
          setActiveViewport={setActiveViewport} 
          activeViewport={activeViewport} 
        />
      </div>

      {/* --- Viewport Central con ANIMACIÓN --- */}
      <main className="flex-1 h-full min-w-0 overflow-hidden relative">
        <AnimatePresence mode="wait"> 
          {/* 'mode="wait"' hace que el viejo desaparezca antes de que el nuevo aparezca */}
          <motion.div
            key={activeViewport} // La 'key' es vital para que Framer detecte el cambio
            variants={viewportVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full"
          >
            {activeViewport === 'explainer' ? (
              <Viewport2 />
            ) : (
              <Viewport />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- Sidebar Derecho --- */}
      <AnimatePresence initial={true}>
        {isRightOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0, x: 260 }}
            animate={{ 
              width: typeof window !== 'undefined' && window.innerWidth < 1024 ? "auto" : 260, 
              opacity: 1, 
              x: 0 
            }}
            exit={{ width: 0, opacity: 0, x: 260 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`
              fixed inset-y-0 right-0 z-50 bg-white border-l border-[#EDEBE9] shadow-xl
              lg:relative lg:inset-auto lg:z-0 lg:shadow-none lg:flex-shrink-0 lg:overflow-hidden
              h-full
            `}
          >
            <div className="w-[260px] h-full"> 
              <SidebarRight />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(isLeftOpen || isRightOpen) && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => { setIsLeftOpen(false); setIsRightOpen(false); }}
        />
      )}

    </div>
  );
};

export default AIReporting;