'use client';

import React, { useState } from 'react';
import { Home, Grid, Calendar, Box, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

// Componente SidebarIcon con tamaños responsivos
const SidebarIcon = ({ icon, active, onClick }) => (
  <div
    onClick={onClick}
    className={`
      /* Tamaño dinámico: 40px en móvil, 48px en desktop (>800px) */
      w-10 h-10 min-[800px]:w-12 min-[800px]:h-12 
      flex items-center justify-center rounded-xl cursor-pointer transition-all relative group
      ${active
        ? 'bg-white text-[#6264A7] shadow-sm'
        : 'text-slate-500 hover:bg-white/50 hover:text-[#6264A7]'}
    `}
  >
    {active && (
      <div className="absolute left-[-8px] w-1 h-5 min-[800px]:h-6 bg-[#6264A7] rounded-r-full" />
    )}
    {/* Clonamos el icono para inyectar clases de tamaño responsivas */}
    {React.cloneElement(icon, { 
      className: "w-[18px] h-[18px] min-[800px]:w-5 min-[800px]:h-5" 
    })}
  </div>
);

export default function Sidebar({ activeView, setActiveView }) {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
    } else {
      router.push('/');
    }
  };

  return (
    <>
      {/* ASIDE RESPONSIVO: Pasa de 56px a 72px a los 800px */}
      <aside className="w-14 min-[800px]:w-[72px] h-full bg-[#FFF] border-r border-slate-200 flex flex-col items-center py-4 min-[800px]:py-6 justify-between flex-shrink-0 transition-all duration-300">
        <div className="flex flex-col gap-4 min-[800px]:gap-6 items-center w-full">
          
          {/* LOGO RESPONSIVO */}
          <div className="w-8 h-8 min-[800px]:w-10 min-[800px]:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
            <span className="font-black text-[#6264A7] text-[14px] min-[800px]:text-lg">SX</span>
          </div>

          <nav className="flex flex-col gap-1.5 min-[800px]:gap-2 w-full px-2">
            <SidebarIcon
              icon={<Home />}
              active={false}
              onClick={() => router.push('/')}
            />

            <SidebarIcon
              icon={<Grid />}
              active={activeView === 'dashboard'}
              onClick={() => setActiveView('dashboard')}
            />

            <SidebarIcon
              icon={<Calendar />}
              active={activeView === 'calendar'}
              onClick={() => setActiveView('calendar')}
            />

            <SidebarIcon
              icon={<Box />}
              active={activeView === 'products'}
              onClick={() => setActiveView('products')}
            />

            <div className="h-[1px] bg-slate-300 mx-1.5 min-[800px]:mx-2 my-1 min-[800px]:my-2" />

            <SidebarIcon
              icon={<Settings />}
              active={activeView === 'settings'}
              onClick={() => setActiveView('settings')}
            />
          </nav>
        </div>

        {/* BOTÓN CERRAR SESIÓN */}
        <div className="mb-4">
          <SidebarIcon
            icon={<LogOut />}
            active={false}
            onClick={() => setShowLogoutModal(true)}
          />
        </div>
      </aside>

      {/* 🔐 LOGOUT CONFIRMATION MODAL */}
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
                Sign out of SVX Copilot
              </h2>

              <p className="text-[14px] min-[800px]:text-[15px] mb-6 leading-relaxed">
                We'll sign you out and remove any temporary offline data, including unsent query drafts. {' '}
                <a href="#" className="text-[#464eb8] hover:underline">Learn more</a>
              </p>

              <div className="mb-8 min-[800px]:mb-10 text-[14px] min-[800px]:text-[15px]">
                <span className="font-bold">Tip: </span>
                SVX Copilot now supports multiple workspaces, which means you won't have to sign out to move between Servex projects.
              </div>

              {/* Acciones responsivas: se apilan en pantallas muy pequeñas */}
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 min-[800px]:px-5 py-[6px] border border-[#d1d1d1] bg-white text-[#242424] rounded-[4px] text-[13px] min-[800px]:text-[14px] font-semibold hover:bg-gray-50 transition-colors"
                >
                  Add another account
                </button>
                
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 min-[800px]:px-5 py-[6px] border border-[#d1d1d1] bg-white text-[#242424] rounded-[4px] text-[13px] min-[800px]:text-[14px] font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 min-[800px]:px-5 py-[6px] bg-[#464eb8] text-white rounded-[4px] text-[13px] min-[800px]:text-[14px] font-semibold hover:bg-[#3b42a0] transition-colors"
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