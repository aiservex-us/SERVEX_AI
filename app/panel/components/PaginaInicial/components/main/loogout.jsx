'use client';

import React, { useState } from 'react';
import { LogOut, LayoutDashboard, Bot, FileCode2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

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
            {/* STEP 1: Overview Dashboard */}
            <SidebarIcon
              icon={<LayoutDashboard size={18} />}
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
              icon={<Bot size={18} />}
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
              icon={<FileCode2 size={18} />}
              active={false}
              title="XML Pipeline Engine"
              stepNumber="STEP 3"
              tagline="Processing"
              description="End-to-end data audit and conversion pipeline: import Excel/XML files, detect price discrepancies, and export verified CET catalogs."
              tip="Launch XML Pipeline"
              onClick={() => router.push('/xml-pipeline')}
            />
          </nav>
        </div>

        {/* MOBILE NAVIGATION BAR */}
        <nav className="md:hidden flex flex-row items-center justify-around w-full h-full">
          <SidebarIcon
            icon={<LayoutDashboard size={18} />}
            active={activeView === 'dashboard'}
            title="Overview"
            onClick={() => setActiveView('dashboard')}
          />
          <SidebarIcon
            icon={<Bot size={18} />}
            active={activeView === 'products'}
            title="Copilot"
            onClick={() => setActiveView('products')}
          />
          <SidebarIcon
            icon={<FileCode2 size={18} />}
            active={false}
            title="Pipeline"
            onClick={() => router.push('/xml-pipeline')}
          />
          <SidebarIcon
            icon={<LogOut size={18} />}
            active={false}
            title="Sign Out"
            onClick={() => setShowLogoutModal(true)}
          />
        </nav>

        {/* BOTTOM SECTION: Sign Out (Desktop) */}
        <div className="hidden md:flex items-center justify-center w-full pb-2">
          <SidebarIcon
            icon={<LogOut size={18} />}
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
              className="bg-white rounded-xl shadow-2xl max-w-[480px] w-full p-6 text-[#242424] border border-gray-200"
            >
              <h2 className="text-[18px] md:text-[20px] font-semibold mb-3 leading-tight text-gray-900">
                Sign out of Servex Copilot
              </h2>
              <p className="text-[13px] md:text-[14px] text-gray-600 mb-6 leading-relaxed">
                We&apos;ll sign you out and remove any temporary offline data.
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-[#464775] text-white rounded-lg text-[13px] font-semibold hover:bg-[#35365e] transition-colors shadow-sm"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
