'use client';

import React, { useState } from 'react';
import {
  LogOut,
  Sparkles,
  FileSpreadsheet,
  FileCode,
  FileDiff,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Componente SidebarIcon con tooltip tutorial interactivo "Hover Popover" idéntico al panel
const SidebarIcon = ({
  icon,
  active,
  onClick,
  hideOnMobile,
  title,
  stepNumber,
  tagline,
  description,
  tip
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={title}
        className={`
          ${hideOnMobile ? 'hidden md:flex' : 'flex'}
          w-9 h-9 md:w-10 md:h-10 shrink-0
          items-center justify-center rounded-xl cursor-pointer transition-all duration-200 relative group
          ${active
            ? 'bg-[#464775] text-white shadow-sm shadow-[#464775]/25'
            : 'text-slate-400 hover:text-[#464775] hover:bg-slate-200/60'}
        `}
      >
        {active && (
          <>
            {/* Indicador Desktop (izquierda) */}
            <div className="hidden md:block absolute -left-2.5 w-1 h-5 bg-[#464775] rounded-r-full shadow-sm" />
            {/* Indicador Mobile (abajo) */}
            <div className="md:hidden absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#464775] rounded-full" />
          </>
        )}
        {icon}
      </button>

      {/* Ventana flotante Tutorial en Hover (Visible en Desktop) */}
      <AnimatePresence>
        {isHovered && description && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.95 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="
              hidden md:flex flex-col absolute left-full ml-3.5 top-1/2 -translate-y-1/2
              w-[270px] bg-white/98 backdrop-blur-md rounded-2xl p-4
              border border-slate-200/90 shadow-[0_16px_36px_-6px_rgba(15,23,42,0.15),0_4px_16px_-2px_rgba(15,23,42,0.05)]
              z-[300] pointer-events-none text-left
            "
          >
            {/* Flecha conectora que apunta al icono */}
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-slate-200/90 rotate-45" />

            {/* Cabecera del Tutorial con Badge del Paso */}
            <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
              <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#464775]/10 text-[#464775] border border-[#464775]/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#464775] animate-pulse" />
                {stepNumber || 'GUIDE'}
              </span>
              {tagline && (
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {tagline}
                </span>
              )}
            </div>

            {/* Section Name */}
            <h4 className="text-[13.5px] font-bold text-slate-900 tracking-tight leading-snug relative z-10">
              {title}
            </h4>

            {/* Short Explanation / Tutorial */}
            <p className="text-[12px] text-slate-600 leading-relaxed mt-1 font-normal relative z-10">
              {description}
            </p>

            {/* Quick Action Hint */}
            {tip && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#464775] font-semibold relative z-10">
                <span>{tip}</span>
                <span className="text-slate-400 font-bold">→</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function MenuLateral({ active, setActive, onExit }) {
  const router = useRouter();

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <aside className="
        z-[100] flex-shrink-0 transition-all duration-300 bg-slate-50/70 backdrop-blur-md border-slate-200/60
        fixed bottom-0 left-0 w-full h-[60px] border-t flex flex-row items-center px-3 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]
        md:relative md:w-[64px] md:h-full md:border-r md:border-t-0 md:flex-col md:py-4 md:px-0 md:shadow-none md:justify-between
      ">
        {/* TOP SECTION: GLYNNE Logo + Navigation Stack */}
        <div className="hidden md:flex flex-col items-center w-full">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => window.open('https://axglynne.com', '_blank', 'noopener,noreferrer')}
            title="AXGLYNNE Ecosystem"
            className="w-10 h-10 rounded-xl flex items-center justify-center p-1.5 hover:bg-slate-200/50 transition-all group focus:outline-none"
          >
            <img src="/GLYNNE.png" alt="GLYNNE" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
          </button>
          <div className="w-6 h-[1px] bg-slate-200/80 my-2.5" />

          {/* Navigation Items (Top-aligned, directly below logo) */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            {/* STEP 0: Return to Main Panel */}
            <SidebarIcon
              icon={<ArrowLeft size={18} />}
              active={false}
              title="Return to Main Panel"
              stepNumber="PANEL"
              tagline="Servex"
              description="Exit the current workspace and return to the primary Servex Operations & Analytics dashboard."
              tip="Go to Panel"
              onClick={() => router.push('/panel')}
            />

            {/* STEP 1: Process Overview */}
            <SidebarIcon
              icon={<Sparkles size={18} />}
              active={active === 'reporting'}
              title="General Process Home"
              stepNumber="STEP 1"
              tagline="Overview"
              description="Autonomous process overview, system architecture specifications, and live AI pipeline metrics."
              tip="View Process Home"
              onClick={() => setActive('reporting')}
            />

            {/* STEP 2: Export Data Client */}
            <SidebarIcon
              icon={<FileSpreadsheet size={18} />}
              active={active === 'xml_results'}
              title="Export Data Client"
              stepNumber="STEP 2"
              tagline="Export"
              description="Review processed CET tables and export structured matrices directly for clients."
              tip="Open Export Tables"
              onClick={() => setActive('xml_results')}
            />

            {/* STEP 3: Current Catalog */}
            <SidebarIcon
              icon={<FileCode size={18} />}
              active={active === 'inbox_updated'}
              title="Current Catalog"
              stepNumber="STEP 3"
              tagline="Catalog"
              description="Inspect active catalog records, updated price rows, and ingested CSV items."
              tip="Open Current Catalog"
              onClick={() => setActive('inbox_updated')}
            />

            {/* STEP 4: XML Results */}
            <SidebarIcon
              icon={<FileDiff size={18} />}
              active={active === 'dashboard'}
              title="XML Results & Diff"
              stepNumber="STEP 4"
              tagline="ETL Engine"
              description="Post-process catalog breakdown, node structure changes, and final XML verification."
              tip="View XML Results"
              onClick={() => setActive('dashboard')}
            />
          </nav>
        </div>

        {/* MOBILE NAVIGATION BAR */}
        <nav className="md:hidden flex flex-row items-center justify-around w-full h-full">
          <SidebarIcon
            icon={<ArrowLeft size={18} />}
            active={false}
            title="Panel"
            onClick={() => router.push('/panel')}
          />
          <SidebarIcon
            icon={<Sparkles size={18} />}
            active={active === 'reporting'}
            title="Home"
            onClick={() => setActive('reporting')}
          />
          <SidebarIcon
            icon={<FileSpreadsheet size={18} />}
            active={active === 'xml_results'}
            title="Export"
            onClick={() => setActive('xml_results')}
          />
          <SidebarIcon
            icon={<FileCode size={18} />}
            active={active === 'inbox_updated'}
            title="Catalog"
            onClick={() => setActive('inbox_updated')}
          />
          <SidebarIcon
            icon={<FileDiff size={18} />}
            active={active === 'dashboard'}
            title="Results"
            onClick={() => setActive('dashboard')}
          />
          <SidebarIcon
            icon={<LogOut size={18} />}
            active={false}
            title="Exit"
            onClick={() => (onExit ? onExit() : router.push('/panel'))}
          />
        </nav>

        {/* BOTTOM SECTION: Exit to Panel (Desktop) */}
        <div className="hidden md:flex items-center justify-center w-full pb-2">
          <SidebarIcon
            icon={<LogOut size={18} />}
            active={false}
            title="Exit Workspace"
            stepNumber="EXIT"
            tagline="Navigation"
            description="Safely leave the XML Pipeline workspace and return to the main Servex panel."
            tip="Return to Panel"
            onClick={() => (onExit ? onExit() : router.push('/panel'))}
          />
        </div>
      </aside>
    </>
  );
}