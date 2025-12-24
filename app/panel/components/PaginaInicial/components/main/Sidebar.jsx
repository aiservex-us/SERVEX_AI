'use client';

import React, { useState } from 'react';
import { Home, Grid, Calendar, Box, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

const SidebarIcon = ({ icon, active, onClick }) => (
  <div
    onClick={onClick}
    className={`
      w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all relative group
      ${active
        ? 'bg-white text-[#6264A7] shadow-sm'
        : 'text-slate-500 hover:bg-white/50 hover:text-[#6264A7]'}
    `}
  >
    {active && (
      <div className="absolute left-[-8px] w-1 h-6 bg-[#6264A7] rounded-r-full" />
    )}
    {icon}
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
      <aside className="w-[72px] h-full bg-[#FFF] border-r border-slate-200 flex flex-col items-center py-6 justify-between flex-shrink-0">
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200">
            <span className="font-black text-[#6264A7] text-lg">Δ</span>
          </div>

          <nav className="flex flex-col gap-2 w-full px-2">
            {/* HOME */}
            <SidebarIcon
              icon={<Home size={20} />}
              active={false}
              onClick={() => router.push('/')}
            />

            <SidebarIcon
              icon={<Grid size={20} />}
              active={activeView === 'dashboard'}
              onClick={() => setActiveView('dashboard')}
            />

            <SidebarIcon
              icon={<Calendar size={20} />}
              active={activeView === 'calendar'}
              onClick={() => setActiveView('calendar')}
            />

            <SidebarIcon
              icon={<Box size={20} />}
              active={activeView === 'products'}
              onClick={() => setActiveView('products')}
            />

            <div className="h-[1px] bg-slate-300 mx-2 my-2" />

            <SidebarIcon
              icon={<Settings size={20} />}
              active={activeView === 'settings'}
              onClick={() => setActiveView('settings')}
            />
          </nav>
        </div>

        {/* 🔴 BOTÓN CERRAR SESIÓN */}
        <div className="mb-4">
          <SidebarIcon
            icon={<LogOut size={20} />}
            active={false}
            onClick={() => setShowLogoutModal(true)}
          />
        </div>
      </aside>

     {/* 🔐 LOGOUT CONFIRMATION MODAL (SVX Copilot - English Version) */}
<AnimatePresence>
  {showLogoutModal && (
    /* CAMBIO AQUÍ: Se agregó 'backdrop-blur-sm' y se ajustó el color de fondo a 'bg-black/20' */
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="bg-white rounded-lg shadow-2xl max-w-[512px] w-full mx-4 p-8 text-[#242424] border border-gray-200"
      >
        {/* Title */}
        <h2 className="text-[24px] font-semibold mb-5 leading-tight">
          Sign out of SVX Copilot
        </h2>

        {/* Main Body */}
        <p className="text-[15px] mb-6 leading-relaxed">
          We'll sign you out and remove any temporary offline data, including unsent query drafts. {' '}
          <a 
            href="#" 
            className="text-[#464eb8] hover:underline"
          >
            Learn more
          </a>
        </p>

        {/* Tip Section */}
        <div className="mb-10 text-[15px]">
          <span className="font-bold">Tip: </span>
          SVX Copilot now supports multiple workspaces, which means you won't have to sign out to move between Servex projects.
        </div>

        {/* Button Actions */}
        <div className="flex justify-end gap-[8px]">
          <button
            onClick={() => setShowLogoutModal(false)}
            className="px-5 py-[6px] border border-[#d1d1d1] bg-white text-[#242424] rounded-[4px] text-[14px] font-semibold hover:bg-gray-50 transition-colors min-w-[120px]"
          >
            Add another account
          </button>
          
          <button
            onClick={() => setShowLogoutModal(false)}
            className="px-5 py-[6px] border border-[#d1d1d1] bg-white text-[#242424] rounded-[4px] text-[14px] font-semibold hover:bg-gray-50 transition-colors min-w-[96px]"
          >
            Cancel
          </button>

          <button
            onClick={handleLogout}
            className="px-5 py-[6px] bg-[#464eb8] text-white rounded-[4px] text-[14px] font-semibold hover:bg-[#3b42a0] transition-colors min-w-[96px]"
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
