'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
  Home,
  MessageSquare,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import TeamsAgentChat from './components/TeamsAgentChat';

/* -----------------------------------------
   ITEM DEL MENÚ
------------------------------------------ */
const MenuItem = ({ icon: Icon, label, active, collapsed, onClick }) => (
  <button
    onClick={onClick}
    className={`
      group relative w-full flex items-center rounded-lg transition-all duration-300
      ${collapsed ? 'justify-center h-11' : 'px-3 py-2'}
      ${active
        ? 'bg-[#6264A7]/5 text-[#6264A7]'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
    `}
  >
    <div
      className={`
        absolute left-0 w-[2.5px] bg-[#6264A7] rounded-r-full transition-all duration-300
        ${active ? 'h-5 opacity-100' : 'h-0 opacity-0'}
      `}
    />

    <Icon className="w-[18px] h-[18px] shrink-0" />

    <div
      className={`
        overflow-hidden transition-all duration-[400ms]
        ${collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}
      `}
    >
      <span className="text-[12px] font-medium whitespace-nowrap">
        {label}
      </span>
    </div>
  </button>
);

export default function PanelPage() {
  const router = useRouter();

  const [activeView, setActiveView] = useState('chat');
  const [collapsed, setCollapsed] = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    supabase.auth.getUser();
  }, []);

  return (
    <div className="h-screen w-full bg-white overflow-hidden flex">

      {/* SIDEBAR */}
      <aside
        className={`
          h-full shrink-0 bg-white border-r border-slate-100/80
          flex flex-col transition-all duration-[500ms]
          ${collapsed ? 'w-[68px]' : 'w-[240px]'}
        `}
      >
        {/* HEADER */}
        <div className="h-16 flex items-center px-4 relative">
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
              <span className="font-black text-[#6264A7] text-sm">SX</span>
            </div>

            <div
              className={`
                overflow-hidden transition-all duration-300
                ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}
              `}
            >
              <span className="font-bold text-[13px] text-slate-800 whitespace-nowrap">
                Servex Copilot
              </span>
            </div>
          </div>

          {/* TOGGLE */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-5 w-6 h-6 bg-white border border-slate-100 rounded-full
              flex items-center justify-center shadow-sm hover:text-[#6264A7]"
          >
            <ChevronLeft
              className={`w-3 h-3 transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 space-y-1">
          <MenuItem
            icon={Home}
            label="Home"
            active={activeView === 'home'}
            collapsed={collapsed}
            onClick={() => setActiveView('home')}
          />

          <MenuItem
            icon={MessageSquare}
            label="New Chat"
            active={activeView === 'chat'}
            collapsed={collapsed}
            onClick={() => setActiveView('chat')}
          />

          <MenuItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeView === 'dashboard'}
            collapsed={collapsed}
            onClick={() => setActiveView('dashboard')}
          />

          <div className="h-px bg-slate-200 my-3" />

          <MenuItem
            icon={Settings}
            label="Settings"
            active={activeView === 'settings'}
            collapsed={collapsed}
            onClick={() => setActiveView('settings')}
          />
        </nav>

        {/* FOOTER */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => setShowLogout(true)}
            className={`
              w-full flex items-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all
              ${collapsed ? 'justify-center h-11' : 'px-3 py-2'}
            `}
          >
            <LogOut className="w-[18px] h-[18px]" />
            <div
              className={`
                overflow-hidden transition-all duration-300
                ${collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}
              `}
            >
              <span className="text-[12px] font-medium">Cerrar sesión</span>
            </div>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="flex-1 overflow-hidden">
          {activeView === 'chat' && <TeamsAgentChat />}

          {activeView !== 'chat' && (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Vista {activeView}
            </div>
          )}
        </div>
      </main>

      {/* MODAL LOGOUT */}
      <AnimatePresence>
        {showLogout && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[999]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm"
            >
              <h2 className="text-lg font-semibold mb-4">Cerrar sesión</h2>
              <p className="text-sm mb-6">
                ¿Deseas cerrar tu sesión en Servex Copilot?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowLogout(false)}
                  className="px-4 py-1 border rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push('/');
                  }}
                  className="px-4 py-1 bg-[#464eb8] text-white rounded"
                >
                  Salir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
