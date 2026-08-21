'use client';

import React, { useState } from 'react';
import { Home, Grid, Calendar, Box, Settings, LogOut, Users, User, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

// Componente SidebarIcon con tamaños responsivos "Mobile App Like"
const SidebarIcon = ({ icon, active, onClick, hideOnMobile }) => (
  <div
    onClick={onClick}
    className={`
      ${hideOnMobile ? 'hidden md:flex' : 'flex'}
      w-12 h-12 md:w-12 md:h-12 shrink-0
      items-center justify-center rounded-xl cursor-pointer transition-all relative group
      ${active
        ? 'bg-[#6264A7]/10 text-[#6264A7] shadow-sm md:bg-white md:shadow-sm'
        : 'text-slate-500 hover:bg-slate-50 hover:text-[#6264A7] md:hover:bg-white/50'}
    `}
  >
    {active && (
      <>
        {/* Indicador Desktop (izquierda) */}
        <div className="hidden md:block absolute left-[-8px] w-1 h-6 bg-[#6264A7] rounded-r-full" />
        {/* Indicador Mobile (abajo) */}
        <div className="md:hidden absolute bottom-[2px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#6264A7] rounded-full" />
      </>
    )}
    {React.cloneElement(icon, { 
      className: `w-5 h-5 md:w-5 md:h-5 transition-transform ${active ? 'scale-110' : ''}` 
    })}
  </div>
);

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
        fixed bottom-0 left-0 w-full h-[72px] border-t flex flex-row items-center px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]
        md:relative md:w-[72px] md:h-full md:border-r md:border-t-0 md:flex-col md:py-6 md:px-0 md:shadow-none md:justify-between
      ">
        <div className="flex flex-row md:flex-col gap-2 md:gap-6 items-center w-full flex-1 md:flex-none">
          
          <a href="https://glynneai.com" target="_blank" rel="noopener noreferrer" className="hidden md:flex w-10 h-10 rounded-lg items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/GLYNNE.png" alt="GLYNNE" className="w-full h-full object-contain" />
          </a>

          <nav className="flex flex-row md:flex-col gap-1 md:gap-2 w-full md:px-2 overflow-x-auto md:overflow-visible items-center hide-scrollbar justify-around md:justify-start h-full">
            <SidebarIcon
              icon={<Home />}
              active={false}
              onClick={() => router.push('/')}
            />

            <SidebarIcon
              icon={<Calendar />}
              active={activeView === 'dashboard'}
              onClick={() => setActiveView('dashboard')}
            />

            <SidebarIcon
              icon={<Grid />}
              active={activeView === 'calendar'}
              onClick={() => setActiveView('calendar')}
            />

            <SidebarIcon
              icon={<Box />}
              active={activeView === 'products'}
              onClick={() => setActiveView('products')}
            />

            <SidebarIcon
              icon={<MessageSquare />}
              active={activeView === 'foro'}
              onClick={() => setActiveView('foro')}
            />

            <SidebarIcon
              icon={<User />}
              active={false}
              onClick={() => router.push('/svx_agent_profile')}
            />

            <div className="hidden md:block h-[1px] bg-slate-300 mx-2 my-2 w-8" />

            <SidebarIcon
              icon={<Settings />}
              active={activeView === 'settings'}
              onClick={() => setActiveView('settings')}
            />
            
            {/* LogOut en mobile se muestra al final del scroll, en desktop abajo */}
            <div className="md:hidden">
              <SidebarIcon
                icon={<LogOut />}
                active={false}
                onClick={() => setShowLogoutModal(true)}
              />
            </div>
          </nav>
        </div>

        {/* Desktop LogOut */}
        <div className="hidden md:flex mb-4">
          <SidebarIcon
            icon={<LogOut />}
            active={false}
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
