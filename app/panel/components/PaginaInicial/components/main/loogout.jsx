'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';


const AlysaDashboardIcon = ({ className = "w-[26px] h-[26px] md:w-[28px] md:h-[28px]", ...props }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Pantalla monitor con esquinas redondeadas */}
    <rect x="10" y="16" width="80" height="54" rx="10" ry="10" />
    {/* Soporte / cuello */}
    <path d="M 42 70 L 37 85 H 63 L 58 70" />
    {/* Base pie del monitor */}
    <line x1="28" y1="85" x2="72" y2="85" strokeWidth="6" />
    {/* 3 Barras estadísticas */}
    <line x1="26" y1="57" x2="26" y2="45" strokeWidth="6.5" />
    <line x1="38" y1="57" x2="38" y2="31" strokeWidth="6.5" />
    <line x1="50" y1="57" x2="50" y2="39" strokeWidth="6.5" />
    {/* 2 Puntos indicadores cuadrados */}
    <rect x="60" y="51" width="7" height="7" rx="2" strokeWidth="5.5" />
    <rect x="73" y="51" width="7" height="7" rx="2" strokeWidth="5.5" />
  </svg>
);

const AlysaChatIcon = ({ className = "w-[26px] h-[26px] md:w-[28px] md:h-[28px]", ...props }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Globo de chat con cola */}
    <path d="M 14 26 C 14 19.37 19.37 14 26 14 H 74 C 80.63 14 86 19.37 86 26 V 54 C 86 60.63 80.63 66 74 66 H 34 L 18 80 V 66 C 15.79 66 14 64.21 14 62 Z" />
    {/* 3 puntos de conversación */}
    <circle cx="34" cy="40" r="3.5" strokeWidth="5" />
    <circle cx="50" cy="40" r="3.5" strokeWidth="5" />
    <circle cx="66" cy="40" r="3.5" strokeWidth="5" />
  </svg>
);

const AlysaLogoIcon = ({ className = "w-[26px] h-[26px] md:w-[28px] md:h-[28px]", ...props }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    {/* Documento con solapa doblada */}
    <path d="M 22 16 H 58 L 78 36 V 82 C 78 85.3 75.3 88 72 88 H 22 C 18.7 88 16 85.3 16 82 V 22 C 16 18.7 18.7 16 22 16 Z" />
    <path d="M 58 16 V 36 H 78" />
    {/* Brackets de XML Pipeline */}
    <path d="M 38 52 L 30 60 L 38 68" strokeWidth="5.5" />
    <path d="M 56 52 L 64 60 L 56 68" strokeWidth="5.5" />
    <line x1="49" y1="49" x2="45" y2="71" strokeWidth="5.5" />
  </svg>
);

// Componente SidebarIcon con tooltip tutorial interactivo "Hover Popover"
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
          w-12 h-12 md:w-[54px] md:h-[54px] shrink-0
          items-center justify-center rounded-xl md:rounded-2xl cursor-pointer transition-all relative group
          ${active
            ? 'bg-[#6264A7]/15 text-[#6264A7] shadow-sm md:bg-white md:shadow-md md:text-[#6264A7]'
            : 'text-slate-500 hover:bg-slate-100/80 hover:text-[#6264A7] md:hover:bg-slate-50'}
        `}
      >
        {active && (
          <>
            {/* Indicador Desktop (izquierda) */}
            <div className="hidden md:block absolute left-[-12px] w-1.5 h-8 bg-[#6264A7] rounded-r-full shadow-sm" />
            {/* Indicador Mobile (abajo) */}
            <div className="md:hidden absolute bottom-[2px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#6264A7] rounded-full" />
          </>
        )}
        {React.isValidElement(icon) ? (
          React.cloneElement(icon, {
            className: `${icon.props.className ? icon.props.className : 'w-[26px] h-[26px] md:w-[28px] md:h-[28px]'} transition-transform duration-200 ${active ? 'scale-105' : 'group-hover:scale-110'}`.trim()
          })
        ) : icon}
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
              hidden md:flex flex-col absolute left-full ml-4 top-1/2 -translate-y-1/2
              w-[280px] bg-white/98 backdrop-blur-md rounded-2xl p-4
              border border-slate-200/90 shadow-[0_16px_36px_-6px_rgba(15,23,42,0.15),0_4px_16px_-2px_rgba(15,23,42,0.05)]
              z-[300] pointer-events-none text-left
            "
          >
            {/* Flecha conectora que apunta al icono */}
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-slate-200/90 rotate-45" />

            {/* Cabecera del Tutorial con Badge del Paso */}
            <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
              <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#6264A7]/10 text-[#6264A7] border border-[#6264A7]/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6264A7] animate-pulse" />
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
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#6264A7] font-semibold relative z-10">
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

export default function Sidebar({ activeView, setActiveView }) {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      router.push('/');
    }
  };

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
        z-[100] flex-shrink-0 transition-all duration-300 bg-[#FFF] border-slate-200
        fixed bottom-0 left-0 w-full h-[76px] border-t flex flex-row items-center px-3 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]
        md:relative md:w-[86px] md:h-full md:border-r md:border-t-0 md:flex-col md:py-6 md:px-0 md:shadow-none md:justify-between
      ">
        {/* 1. TOP: GLYNNE Logo with Tutorial Tooltip */}
        <div className="hidden md:flex items-center justify-center w-full">
          <SidebarIcon
            icon={
              <div className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden p-1">
                <img src="/GLYNNE.png" alt="GLYNNE" className="w-full h-full object-contain" />
              </div>
            }
            active={false}
            title="AXGLYNNE Ecosystem"
            stepNumber="PORTAL"
            tagline="Corporate"
            description="Official AXGLYNNE portal: enterprise intelligence solutions and cutting-edge AI systems engineering."
            tip="Visit axglynne.com"
            onClick={() => window.open('https://axglynne.com', '_blank', 'noopener,noreferrer')}
          />
        </div>

        {/* 2. MIDDLE: Step-by-Step Navigation with Tutorial Tooltips */}
        <nav className="
          flex flex-row md:flex-col items-center justify-around md:justify-center
          w-full md:w-full h-full md:h-auto md:flex-1
          gap-1.5 md:gap-3.5 md:px-3
          overflow-x-auto md:overflow-visible hide-scrollbar
        ">

          {/* STEP 1: Overview Dashboard */}
          <SidebarIcon
            icon={<AlysaDashboardIcon />}
            active={activeView === 'dashboard'}
            title="Overview & Control Dashboard"
            stepNumber="STEP 1"
            tagline="Metrics"
            description="Monitor your global platform summary, catalog health metrics, active audits, and primary workspace shortcuts."
            tip="Open Global Dashboard"
            onClick={() => setActiveView('dashboard')}
          />

          {/* STEP 2: Alysa SVX Copilot */}
          <SidebarIcon
            icon={<AlysaChatIcon />}
            active={activeView === 'products'}
            title="Alysa SVX Copilot (AI)"
            stepNumber="STEP 2"
            tagline="AI Assistant"
            description="Interact with the core AI assistant to resolve technical queries, audit catalog lines, and automate routine workflows."
            tip="Start conversation with Alysa"
            onClick={() => setActiveView('products')}
          />

          {/* STEP 3: XML Pipeline Engine */}
          <SidebarIcon
            icon={<AlysaLogoIcon />}
            active={false}
            title="XML Pipeline Engine"
            stepNumber="STEP 3"
            tagline="Processing"
            description="End-to-end data audit and conversion pipeline: import Excel/XML files, detect price discrepancies, and export verified CET catalogs."
            tip="Launch XML Pipeline"
            onClick={() => router.push('/xml-pipeline')}
          />

          {/* Sign Out on mobile */}
          <div className="md:hidden">
            <SidebarIcon
              icon={<LogOut className="w-[26px] h-[26px] md:w-[28px] md:h-[28px]" />}
              active={false}
              title="Sign Out"
              onClick={() => setShowLogoutModal(true)}
            />
          </div>
        </nav>

        {/* 3. BOTTOM: Sign Out */}
        <div className="hidden md:flex items-center justify-center w-full">
          <SidebarIcon
            icon={<LogOut className="w-[26px] h-[26px] md:w-[28px] md:h-[28px]" />}
            active={false}
            title="Sign Out"
            stepNumber="SECURITY"
            tagline="Account"
            description="Securely terminate your session and clear local temporary cache stored in your browser."
            tip="Disconnect account"
            onClick={() => setShowLogoutModal(true)}
          />
        </div>
      </aside>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="bg-white rounded-lg shadow-2xl max-w-[512px] w-full p-6 min-[800px]:p-8 text-[#242424] border border-gray-200"
            >
              <h2 className="text-[20px] min-[800px]:text-[24px] font-semibold mb-4 min-[800px]:mb-5 leading-tight">
                Sign out of Servex Copilot
              </h2>
              <p className="text-[14px] min-[800px]:text-[15px] mb-6 leading-relaxed">
                We'll sign you out and remove any temporary offline data.
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <button onClick={() => setShowLogoutModal(false)} className="px-4 py-[6px] border border-[#d1d1d1] rounded-[4px] text-[14px] font-semibold">Cancel</button>
                <button onClick={handleLogout} className="px-4 py-[6px] bg-[#464eb8] text-white rounded-[4px] text-[14px] font-semibold">Sign out</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
