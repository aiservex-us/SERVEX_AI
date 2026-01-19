"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, PanelRightOpen, PanelRightClose } from 'lucide-react'; 
import SidebarLeft from './compnents/SidebarLeft';
import Viewport from './compnents/Viewport';
import SidebarRight from './compnents/SidebarRight';

const AIReporting = () => {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);

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

      {/* BOTÓN DE CONTROL DERECHO (Se mueve con el panel) */}
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
        <SidebarLeft />
      </div>

      {/* --- Viewport Central (Se ajusta automáticamente) --- */}
      <main className="flex-1 h-full min-w-0 overflow-hidden">
        <Viewport />
      </main>

      {/* --- Sidebar Derecho (Responsive similar al izquierdo) --- */}
      <AnimatePresence initial={false}>
        {isRightOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0, x: 260 }} // Añadimos x para el slide en móvil
            animate={{ 
              width: window.innerWidth < 1024 ? "auto" : 260, 
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
            <div className="w-[260px] h-full"> {/* Contenedor interno para mantener el ancho */}
              <SidebarRight />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para cerrar menús al tocar fuera en móvil (Opcional pero recomendado) */}
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