"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Info } from 'lucide-react'; // Íconos para controlar el responsive
import SidebarLeft from './compnents/SidebarLeft';
import Viewport from './compnents/Viewport';
import SidebarRight from './compnents/SidebarRight';

const AIReporting = () => {
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  return (
    <motion.div 
      className="flex h-[100%] w-full bg-[#FFF] text-[#242424] font-sans overflow-hidden relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Botones de control para Móvil (Solo visibles en pantallas pequeñas) */}
      <div className="lg:hidden absolute top-2 left-4 z-[60] flex gap-2">
        <button 
          onClick={() => setIsLeftOpen(!isLeftOpen)}
          className="p-2 bg-[#464775] text-white rounded-md shadow-md"
        >
          {isLeftOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div className="lg:hidden absolute top-2 right-4 z-[60]">
        <button 
          onClick={() => setIsRightOpen(!isRightOpen)}
          className="p-2 bg-white border border-[#EDEBE9] text-[#464775] rounded-md shadow-md"
        >
          {isRightOpen ? <X size={18} /> : <Info size={18} />}
        </button>
      </div>

      {/* --- Sidebar Izquierdo --- */}
      {/* En desktop: bloque normal. En móvil: overlay absoluto */}
      <motion.div 
        variants={itemVariants} 
        className={`
          fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
          ${isLeftOpen ? "translate-x-0" : "-translate-x-full"}
          lg:flex h-full
        `}
      >
        <SidebarLeft />
      </motion.div>

      {/* Overlay para cerrar sidebars en móvil al tocar fuera */}
      <AnimatePresence>
        {(isLeftOpen || isRightOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsLeftOpen(false); setIsRightOpen(false); }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* --- Viewport Central --- */}
      <motion.div 
        variants={itemVariants} 
        className="flex-1 h-full w-full min-w-0" // min-w-0 evita que el flex rompa el ancho
      >
        <Viewport />
      </motion.div>

      {/* --- Sidebar Derecho --- */}
      <motion.div 
        variants={itemVariants} 
        className={`
          fixed inset-y-0 right-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out
          ${isRightOpen ? "translate-x-0" : "translate-x-full"}
          lg:flex h-full
        `}
      >
        <SidebarRight />
      </motion.div>
    </motion.div>
  );
};

export default AIReporting;