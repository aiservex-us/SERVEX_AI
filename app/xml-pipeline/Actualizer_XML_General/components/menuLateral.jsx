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

// Componente SidebarIcon con tooltip tutorial interactivo "Hover Popover" con estética arquitectónica Servex
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
  isDarkMode = true,
  isDanger = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={title}
        className={`
          ${hideOnMobile ? 'hidden md:flex' : 'flex'}
          w-10 h-10 shrink-0
          items-center justify-center rounded-none cursor-pointer transition-all duration-200 relative group border
          ${active
            ? isDarkMode
              ? 'bg-white text-zinc-950 font-bold border-white shadow-[0_0_20px_rgba(255,255,255,0.22)]'
              : 'bg-[#18181b] text-white font-bold border-[#18181b] shadow-[0_4px_16px_rgba(24,24,27,0.2)]'
            : isDanger
              ? isDarkMode
                ? 'text-zinc-400 border-transparent hover:text-rose-400 hover:border-rose-500/25 hover:bg-rose-500/10'
                : 'text-slate-500 border-transparent hover:text-rose-600 hover:border-rose-500/25 hover:bg-rose-500/10'
              : isDarkMode
                ? 'text-zinc-400 border-transparent hover:text-white hover:bg-white/10 hover:border-white/15'
                : 'text-slate-500 border-transparent hover:text-[#18181b] hover:bg-[#18181b]/5 hover:border-[#18181b]/15'}
        `}
      >
        {active && (
          <>
            {/* Indicador Desktop lineal de precisión en el borde izquierdo */}
            <div className={`hidden md:block absolute -left-2 top-0 bottom-0 w-[3px] rounded-none ${isDarkMode ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-[#18181b] shadow-[0_0_8px_rgba(0,0,0,0.3)]'}`} />
            {/* Indicador Mobile lineal arriba */}
            <div className={`md:hidden absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[2px] rounded-none ${isDarkMode ? 'bg-white' : 'bg-[#18181b]'}`} />
          </>
        )}
        {icon}
      </button>

      {/* Ventana flotante Tutorial en Hover (Visible en Desktop) con estética técnica Servex */}
      <AnimatePresence>
        {isHovered && description && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={`
              hidden md:flex flex-col absolute left-full ml-3.5 top-1/2 -translate-y-1/2
              w-[275px] ${isDarkMode ? 'bg-[#09090b]/95 border-white/15 text-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.12)]' : 'bg-white/95 border-[#18181b]/15 text-[#18181b] shadow-[0_20px_50px_rgba(0,0,0,0.1)]'} backdrop-blur-2xl rounded-none p-4
              border z-[300] pointer-events-none text-left
            `}
          >
            {/* Flecha conectora angular */}
            <div className={`absolute -left-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 ${isDarkMode ? 'bg-[#09090b] border-white/15' : 'bg-white border-[#18181b]/15'} border-l border-b rotate-45`} />

            {/* Cabecera del Tutorial con Badge del Paso idéntico al Servex Copilot badge */}
            <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
              <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-none ${isDarkMode ? 'bg-white/10 text-zinc-200 border-white/20' : 'bg-[#18181b]/10 text-[#18181b] border-[#18181b]/20'} border flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-none ${isDarkMode ? 'bg-white' : 'bg-[#18181b]'} animate-pulse`} />
                {stepNumber || 'GUIDE'}
              </span>
              {tagline && (
                <span className={`text-[9px] font-semibold tracking-widest ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'} uppercase`}>
                  {tagline}
                </span>
              )}
            </div>

            {/* Section Name */}
            <h4 className={`text-[13px] font-bold ${isDarkMode ? 'text-white' : 'text-[#18181b]'} tracking-tight leading-snug relative z-10`}>
              {title}
            </h4>

            {/* Short Explanation / Tutorial */}
            <p className={`text-[11.5px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'} leading-relaxed mt-1.5 font-normal relative z-10`}>
              {description}
            </p>

            {/* Quick Action Hint */}
            {tip && (
              <div className={`mt-3 pt-2 border-t ${isDarkMode ? 'border-white/10 text-zinc-200' : 'border-[#18181b]/10 text-[#18181b]'} flex items-center justify-between text-[10.5px] font-semibold relative z-10`}>
                <span>{tip}</span>
                <span className={`${isDarkMode ? 'text-zinc-400' : 'text-slate-400'} font-bold font-mono`}>→</span>
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
        z-[100] flex-shrink-0 transition-all duration-300
        ${isDarkMode
          ? 'bg-[#09090b]/60 border-white/10 shadow-[1px_0_30px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.04)]'
          : 'bg-white/70 border-[#18181b]/10 shadow-[1px_0_30px_rgba(0,0,0,0.03)]'}
        backdrop-blur-xl
        fixed bottom-0 left-0 w-full h-[60px] border-t flex flex-row items-center px-3
        md:relative md:w-[64px] md:h-full md:border-r md:border-t-0 md:flex-col md:py-4 md:px-0 md:justify-between
      `}>
        {/* TOP SECTION: GLYNNE Logo + Navigation Stack */}
        <div className="hidden md:flex flex-col items-center w-full">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => window.open('https://axglynne.com', '_blank', 'noopener,noreferrer')}
            title="AXGLYNNE Ecosystem"
            className={`w-10 h-10 rounded-none flex items-center justify-center p-2.5 transition-all duration-200 group focus:outline-none border border-transparent ${
              isDarkMode
                ? 'hover:bg-white/10 text-white hover:border-white/15'
                : 'hover:bg-[#18181b]/5 text-[#18181b] hover:border-[#18181b]/15'
            }`}
          >
            <GlynneLogo className={`w-full h-full ${isDarkMode ? 'text-white' : 'text-[#18181b]'} group-hover:scale-105 transition-transform`} />
          </button>

          {/* Separador arquitectónico */}
          <div className={`w-7 h-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-[#18181b]/10'} my-3 transition-colors`} />

          {/* Navigation Items (Top-aligned, directly below logo) */}
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            {/* STEP 1: Process Overview */}
            <SidebarIcon
              icon={<Sparkles size={17} />}
              active={active === 'reporting'}
              title="General Process Home"
              stepNumber="STEP 1"
              tagline="Overview"
              description="Vista general del proceso autónomo, arquitectura del sistema y métricas en vivo del pipeline IA."
              tip="Abrir Home del Proceso"
              onClick={() => setActive('reporting')}
              isDarkMode={isDarkMode}
            />

            {/* STEP 2: Export Data Client */}
            <SidebarIcon
              icon={<FileSpreadsheet size={17} />}
              active={active === 'xml_results'}
              title="Export Data Client"
              stepNumber="STEP 2"
              tagline="Export"
              description="Revisar tablas procesadas de CET y exportar matrices estructuradas directamente para clientes."
              tip="Abrir Matriz Exportable"
              onClick={() => setActive('xml_results')}
              isDarkMode={isDarkMode}
            />

            {/* STEP 3: Current Catalog */}
            <SidebarIcon
              icon={<FileCode size={17} />}
              active={active === 'inbox_updated'}
              title="Current Catalog"
              stepNumber="STEP 3"
              tagline="Catalog"
              description="Inspeccionar registros activos del catálogo, precios actualizados y filas de productos ingeridas."
              tip="Abrir Catálogo Activo"
              onClick={() => setActive('inbox_updated')}
              isDarkMode={isDarkMode}
            />

            {/* STEP 4: XML Results */}
            <SidebarIcon
              icon={<FileDiff size={17} />}
              active={active === 'dashboard'}
              title="XML Results & Diff"
              stepNumber="STEP 4"
              tagline="ETL Engine"
              description="Desglose del catálogo posproceso, cambios en la estructura de nodos y verificación final del XML."
              tip="Ver Resultados XML"
              onClick={() => setActive('dashboard')}
              isDarkMode={isDarkMode}
            />
          </nav>
        </div>

        {/* MOBILE NAVIGATION BAR (When viewport < md) */}
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
            icon={isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-[#18181b]" />}
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
            isDanger={true}
          />
        </nav>

        {/* BOTTOM SECTION: Theme Toggle & Exit to Panel / Sign Out (Desktop) */}
        <div className="hidden md:flex flex-col items-center justify-center w-full pb-2 gap-2">
          {/* Separador inferior arquitectónico */}
          <div className={`w-7 h-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-[#18181b]/10'} my-1 transition-colors`} />

          {/* BOTÓN DE CAMBIO DE THEME (SOBRE EL ICONO DE LOGOUT) */}
          <SidebarIcon
            icon={isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-[#18181b]" />}
            active={false}
            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            stepNumber="THEME"
            tagline="Apariencia"
            description={isDarkMode ? "Alternar al tema claro con fondos limpios, cristalería translúcida y contrastes nítidos." : "Alternar al tema oscuro con fondos inmersivos y alto contraste."}
            tip={isDarkMode ? "Activar Modo Claro" : "Activar Modo Oscuro"}
            onClick={onToggleTheme}
            isDarkMode={isDarkMode}
          />

          {/* BOTÓN SALIR / CERRAR SESIÓN */}
          <SidebarIcon
            icon={<LogOut size={17} />}
            active={false}
            title="Salir / Cerrar Sesión"
            stepNumber="EXIT"
            tagline="Sesión"
            description="Cerrar sesión de forma segura y salir al Home, o volver al panel de control general."
            tip="Cerrar Sesión / Panel"
            onClick={() => (onExit ? onExit() : router.push('/panel'))}
            isDarkMode={isDarkMode}
            isDanger={true}
          />
        </div>
      </aside>
    </>
  );
}

