'use client';

import React, { useState } from 'react';
import { Home, Grid, Calendar, Box, Settings, LogOut, Users, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

// Componente SidebarIcon con tamaños responsivos
const SidebarIcon = ({ icon, active, onClick }) => (
  <div
    onClick={onClick}
    className={`
      w-10 h-10 min-[800px]:w-12 min-[800px]:h-1z2 
      flex items-center justify-center rounded-xl cursor-pointer transition-all relative group
      ${active
        ? 'bg-white text-[#6264A7] shadow-sm'
        : 'text-slate-500 hover:bg-white/50 hover:text-[#6264A7]'}
    `}
  >
    {active && (
      <div className="absolute left-[-8px] w-1 h-5 min-[800px]:h-6 bg-[#6264A7] rounded-r-full" />
    )}
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
      console.error('Error logging out:', error.message);
    } else {
      router.push('/');
    }
  };

  return (
    <>
      <aside className="w-14 min-[800px]:w-[72px] h-full bg-[#FFF] border-r border-slate-200 flex flex-col items-center py-4 min-[800px]:py-6 justify-between flex-shrink-0 transition-all duration-300">
        <div className="flex flex-col gap-4 min-[800px]:gap-6 items-center w-full">
          
          <a href="https://glynneai.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 min-[800px]:w-10 min-[800px]:h-10 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
            <img src="/GLYNNE.png" alt="GLYNNE" className="w-full h-full object-contain" />
          </a>

          <nav className="flex flex-col gap-1.5 min-[800px]:gap-2 w-full px-2">
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
              icon={<Users />}
              active={activeView === 'foro'}
              onClick={() => setActiveView('foro')}
            />

            <SidebarIcon
              icon={<User />}
              active={false}
              onClick={() => router.push('/svx_agent_profile')}
            />

            <div className="h-[1px] bg-slate-300 mx-1.5 min-[800px]:mx-2 my-1 min-[800px]:my-2" />

            <SidebarIcon
              icon={<Settings />}
              active={activeView === 'settings'}
              onClick={() => setActiveView('settings')}
            />
          </nav>
        </div>

        <div className="mb-4">
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