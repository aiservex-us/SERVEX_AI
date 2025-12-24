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

      {/* 🔐 MODAL CONFIRMACIÓN LOGOUT */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[1000]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-4 p-6 relative"
            >
              <button
                onClick={() => setShowLogoutModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <FaTimes size={20} />
              </button>

              <h2 className="text-xl font-bold mb-4 text-gray-800">
                ¿Cerrar sesión?
              </h2>

              <p className="text-gray-700 text-sm mb-6">
                Estás a punto de cerrar tu sesión. ¿Deseas continuar?
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleLogout}
                  className="relative inline-block px-4 py-2 text-sm font-semibold bg-black text-white rounded-md shadow-sm overflow-hidden group transition-all duration-300"
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  <span className="relative z-10">Cerrar sesión</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
