'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Header from './components/header'
import {
  Home,
  MessageSquare,
  LayoutDashboard,
  Settings,
  LogOut,
  MoreHorizontal
} from "lucide-react";
import { AnimatePresence, motion } from 'framer-motion';

import TeamsAgentChat from './components/TeamsAgentChat'; 

export default function PanelPage() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {});
  }, [router]);

  return (
    <div className="h-screen w-full bg-[#FFF] font-sans overflow-hidden flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">

        {/* BARRA LATERAL */}
        <nav className="w-16 bg-[#FFF] flex flex-col items-center py-4 gap-6 shrink-0 border-r border-gray-300">

          <div className="flex flex-col items-center gap-1 cursor-pointer text-[#5B5FC7]">
            <Home size={22} />
            <span className="text-[10px]">Home</span>
          </div>

          <div className="flex flex-col items-center gap-1 cursor-pointer text-[#5B5FC7] border-l-2 border-[#5B5FC7] w-full">
            <MessageSquare size={22} />
            <span className="text-[10px] font-semibold">New Chat</span>
          </div>

          <div className="flex flex-col items-center gap-1 cursor-pointer text-gray-500 hover:text-[#5B5FC7]">
            <LayoutDashboard size={22} />
            <span className="text-[10px]">Dashboard</span>
          </div>

          <div className="mt-auto flex flex-col gap-6 mb-4 text-gray-500 relative">
            <MoreHorizontal size={22} className="cursor-pointer" onClick={() => setShowMenu(!showMenu)} />

            {/* MENÚ DESPLEGABLE */}
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute bottom-10 left-14 bg-white border rounded-lg shadow-xl w-40 overflow-hidden z-50"
                >
                  <button
                    onClick={() => setShowLogout(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 w-full"
                  >
                    <LogOut size={16} /> Cerrar sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <Settings size={22} className="cursor-pointer" />
          </div>
        </nav>

        {/* CHAT */}
        <main className="flex-1 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 shadow-sm overflow-hidden flex flex-col">
            <TeamsAgentChat />
          </div>
        </main>

        {/* MODAL LOGOUT */}
        <AnimatePresence>
          {showLogout && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[999]">
              <motion.div
                initial={{ scale: .95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: .95, opacity: 0 }}
                className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm"
              >
                <h2 className="text-lg font-semibold mb-4">Cerrar sesión</h2>
                <p className="text-sm mb-6">¿Deseas cerrar tu sesión en Servex Copilot?</p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowLogout(false)} className="px-4 py-1 border rounded">Cancelar</button>
                  <button
                    onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
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
    </div>
  );
}
