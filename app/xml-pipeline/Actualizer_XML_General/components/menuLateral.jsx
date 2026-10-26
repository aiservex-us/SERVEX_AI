'use client';

import React, { useState } from 'react';
import {
  LogOut,
  Sparkles,
  FileSpreadsheet,
  FileCode,
  FileDiff,
  Sun,
  Moon
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
  tip,
  isDarkMode = true
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
            ? isDarkMode
              ? 'bg-white text-zinc-950 shadow-sm shadow-white/20'
              : 'bg-zinc-900 text-white shadow-sm shadow-zinc-900/25'
            : isDarkMode
              ? 'text-zinc-400 hover:text-white hover:bg-white/10'
              : 'text-slate-400 hover:text-zinc-900 hover:bg-slate-200/60'}
        `}
      >
        {active && (
          <>
            {/* Indicador Desktop (izquierda) */}
            <div className={`hidden md:block absolute -left-2.5 w-1 h-5 ${isDarkMode ? 'bg-white' : 'bg-zinc-900'} rounded-r-full shadow-sm`} />
            {/* Indicador Mobile (abajo) */}
            <div className={`md:hidden absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 ${isDarkMode ? 'bg-white' : 'bg-zinc-900'} rounded-full`} />
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
            className={`
              hidden md:flex flex-col absolute left-full ml-3.5 top-1/2 -translate-y-1/2
              w-[270px] ${isDarkMode ? 'bg-[#09090b]/80 border-white/10 text-zinc-100 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/98 border-slate-200/90 text-slate-900 shadow-[0_16px_36px_-6px_rgba(15,23,42,0.15)]'} backdrop-blur-2xl rounded-2xl p-4
              border z-[300] pointer-events-none text-left
            `}
          >
            {/* Flecha conectora que apunta al icono */}
            <div className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 ${isDarkMode ? 'bg-[#09090b] border-white/10' : 'bg-white border-slate-200/90'} border-l border-b rotate-45`} />

            {/* Cabecera del Tutorial con Badge del Paso */}
            <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
              <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-white/10 text-zinc-200 border-white/20' : 'bg-zinc-900/10 text-zinc-900 border-zinc-900/20'} border flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-zinc-200' : 'bg-zinc-900'} animate-pulse`} />
                {stepNumber || 'GUIDE'}
              </span>
              {tagline && (
                <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'} uppercase tracking-wider`}>
                  {tagline}
                </span>
              )}
            </div>

            {/* Section Name */}
            <h4 className={`text-[13.5px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tight leading-snug relative z-10`}>
              {title}
            </h4>

            {/* Short Explanation / Tutorial */}
            <p className={`text-[12px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'} leading-relaxed mt-1 font-normal relative z-10`}>
              {description}
            </p>

            {/* Quick Action Hint */}
            {tip && (
              <div className={`mt-2.5 pt-2 border-t ${isDarkMode ? 'border-white/10 text-zinc-200' : 'border-slate-100 text-zinc-900'} flex items-center justify-between text-[11px] font-semibold relative z-10`}>
                <span>{tip}</span>
                <span className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-400'} font-bold`}>→</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente vectorial del logotipo GLYNNE (Ecosistema)
const GlynneLogo = ({ className = 'w-full h-full text-white', ...props }) => (
  <svg
    viewBox="0 0 2048 2048"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <g transform="translate(0,2048) scale(0.1,-0.1)">
      {/* Marco exterior con ventana interior recortada */}
      <path d="M2050 10292 l0 -8529 2458 -6 c1351 -4 3231 -11 4177 -17 946 -5 2748 -14 4005 -20 1257 -5 2537 -12 2845 -15 308 -3 1085 -8 1728 -11 l1167 -7 0 8532 0 8531 -727 0 c-648 0 -1775 5 -5358 25 -577 3 -1959 10 -3070 15 -1111 6 -2893 15 -3960 20 -1067 6 -2238 10 -2602 10 l-663 0 0 -8528z m4645 7888 c1644 -9 6108 -31 9610 -48 l1430 -7 3 -7898 2 -7897 -152 0 c-669 1 -5444 23 -7523 35 -1413 8 -3564 17 -4780 20 -1215 3 -2283 8 -2372 11 l-163 6 0 7900 0 7900 1078 -6 c592 -4 1883 -11 2867 -16z" />
      {/* Letra G */}
      <path d="M5695 17109 c-328 -31 -621 -112 -900 -249 -260 -126 -477 -282 -685 -490 -424 -425 -707 -987 -805 -1595 -26 -165 -36 -308 -36 -500 0 -359 41 -632 142 -941 211 -649 660 -1212 1241 -1556 731 -432 1717 -466 2501 -85 700 340 1150 891 1324 1623 l28 119 0 583 0 583 -1275 0 -1275 1 0 -479 1 -478 637 -3 637 -2 0 -39 c0 -80 -22 -198 -54 -294 -123 -362 -476 -634 -925 -712 -108 -19 -313 -19 -421 0 -167 29 -348 105 -500 208 -112 77 -302 272 -387 397 -164 244 -260 498 -299 795 -22 165 -14 483 16 645 65 352 206 647 434 902 248 279 544 424 901 441 287 14 559 -61 800 -220 115 -77 304 -261 400 -391 33 -45 63 -81 67 -82 6 0 715 767 800 866 17 20 15 23 -71 120 -427 478 -1032 771 -1721 833 -133 13 -444 12 -575 0z" />
      {/* Letra L */}
      <path d="M9065 17008 c-3 -7 -4 -1246 -3 -2753 l3 -2740 1573 -3 1572 -2 0 550 0 550 -945 0 -945 0 -2 2203 -3 2202 -623 3 c-493 2 -624 0 -627 -10z" />
      {/* Letra Y */}
      <path d="M12254 17004 c5 -14 766 -1154 1653 -2476 l373 -556 0 -1231 0 -1231 625 0 625 0 0 1233 0 1234 298 444 c794 1184 1732 2589 1732 2594 0 3 -337 5 -748 5 l-749 0 -68 -102 c-73 -109 -891 -1356 -1014 -1545 -40 -62 -74 -113 -76 -113 -2 0 -154 231 -338 513 -185 281 -443 676 -575 877 l-239 365 -753 3 c-679 2 -752 1 -746 -14z" />
      {/* Letra N superior */}
      <path d="M3510 8493 c0 -984 -1 -2161 -1 -2618 l-2 -830 599 0 599 0 5 1625 5 1625 49 -75 c27 -41 230 -356 451 -700 423 -657 665 -1034 1244 -1933 l353 -547 601 2 602 3 0 2615 0 2615 -600 0 -600 0 0 -1618 c0 -1073 -3 -1616 -10 -1614 -13 4 -329 492 -1545 2387 -288 448 -530 823 -538 833 -14 16 -56 17 -614 17 l-598 0 0 -1787z" />
      {/* Letra N inferior */}
      <path d="M8770 7660 l0 -2620 600 0 600 0 0 1625 c0 914 4 1625 9 1625 4 0 95 -136 202 -302 169 -265 1282 -1997 1735 -2701 l159 -247 600 2 600 3 0 2615 0 2615 -592 2 -593 2 0 -1620 c0 -1486 -1 -1620 -16 -1617 -14 3 -608 920 -1599 2467 -148 232 -321 500 -383 596 l-114 175 -604 0 -604 0 0 -2620z" />
      {/* Letra E */}
      <path d="M14055 10272 c-3 -3 -5 -1181 -5 -2619 l0 -2613 1500 0 1500 0 0 525 0 525 -905 0 -905 0 0 525 0 525 870 0 870 0 -2 523 -3 522 -867 3 -868 2 0 520 0 520 904 0 c498 0 906 3 908 8 2 4 2 240 0 524 l-2 517 -1495 -1 c-822 0 -1497 -3 -1500 -6z" />
    </g>
  </svg>
);

export default function MenuLateral({ active, setActive, onExit, isDarkMode = true, onToggleTheme }) {
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

      <aside className={`
        z-[100] flex-shrink-0 transition-all duration-300 ${isDarkMode ? 'bg-[#09090b]/10 border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]' : 'bg-slate-50/70 border-slate-200/60'} backdrop-blur-md
        fixed bottom-0 left-0 w-full h-[60px] border-t flex flex-row items-center px-3 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]
        md:relative md:w-[64px] md:h-full md:border-r md:border-t-0 md:flex-col md:py-4 md:px-0 md:shadow-none md:justify-between
      `}>
        {/* TOP SECTION: GLYNNE Logo + Navigation Stack */}
        <div className="hidden md:flex flex-col items-center w-full">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => window.open('https://axglynne.com', '_blank', 'noopener,noreferrer')}
            title="AXGLYNNE Ecosystem"
            className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-200/50'} transition-all group focus:outline-none`}
          >
            <GlynneLogo className={`w-full h-full ${isDarkMode ? 'text-white' : 'text-zinc-900'} group-hover:scale-105 transition-transform`} />
          </button>
          <div className={`w-6 h-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-slate-200/80'} my-2.5`} />

          {/* Navigation Items (Top-aligned, directly below logo) */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
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
              isDarkMode={isDarkMode}
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
              isDarkMode={isDarkMode}
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
              isDarkMode={isDarkMode}
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
              isDarkMode={isDarkMode}
            />
          </nav>
        </div>

        {/* MOBILE NAVIGATION BAR */}
        <nav className="md:hidden flex flex-row items-center justify-around w-full h-full">
          <SidebarIcon
            icon={<Sparkles size={18} />}
            active={active === 'reporting'}
            title="Home"
            onClick={() => setActive('reporting')}
            isDarkMode={isDarkMode}
          />
          <SidebarIcon
            icon={<FileSpreadsheet size={18} />}
            active={active === 'xml_results'}
            title="Export"
            onClick={() => setActive('xml_results')}
            isDarkMode={isDarkMode}
          />
          <SidebarIcon
            icon={<FileCode size={18} />}
            active={active === 'inbox_updated'}
            title="Catalog"
            onClick={() => setActive('inbox_updated')}
            isDarkMode={isDarkMode}
          />
          <SidebarIcon
            icon={<FileDiff size={18} />}
            active={active === 'dashboard'}
            title="Results"
            onClick={() => setActive('dashboard')}
            isDarkMode={isDarkMode}
          />
          <SidebarIcon
            icon={isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
            active={false}
            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            onClick={onToggleTheme}
            isDarkMode={isDarkMode}
          />
          <SidebarIcon
            icon={<LogOut size={18} />}
            active={false}
            title="Salir / Cerrar Sesión"
            onClick={() => (onExit ? onExit() : router.push('/panel'))}
            isDarkMode={isDarkMode}
          />
        </nav>

        {/* BOTTOM SECTION: Theme Toggle & Exit to Panel / Sign Out (Desktop) */}
        <div className="hidden md:flex flex-col items-center justify-center w-full pb-2 gap-2">
          {/* BOTÓN DE CAMBIO DE THEME (SOBRE EL ICONO DE LOGOUT) */}
          <SidebarIcon
            icon={isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
            active={false}
            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            stepNumber="THEME"
            tagline="Apariencia Visual"
            description={isDarkMode ? "Alternar al tema claro con fondos limpios y contrastes nítidos." : "Alternar al tema oscuro con fondos inmersivos y alto contraste."}
            tip={isDarkMode ? "Activar Modo Claro" : "Activar Modo Oscuro"}
            onClick={onToggleTheme}
            isDarkMode={isDarkMode}
          />

          <SidebarIcon
            icon={<LogOut size={18} />}
            active={false}
            title="Salir / Cerrar Sesión"
            stepNumber="EXIT"
            tagline="Navegación y Sesión"
            description="Cerrar sesión de forma segura y salir al Home, o volver al panel de control general."
            tip="Cerrar Sesión / Panel"
            onClick={() => (onExit ? onExit() : router.push('/panel'))}
            isDarkMode={isDarkMode}
          />
        </div>
      </aside>
    </>
  );
}
