'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Settings,
  BookOpen,
  Brain,
  Layers,
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef(null);

  /* Cerrar dropdown al hacer click fuera */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push('/');
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-4 md:px-8 shrink-0">
        
        {/* SEARCH */}
        <div className="relative w-full max-w-[180px] sm:max-w-xs md:max-w-96">
       
        </div>

        <div className="flex items-center gap-2 sm:gap-5">
          
          {/* NOTIFICATIONS */}
          <div className="p-2 hover:bg-slate-100 rounded-full cursor-pointer text-slate-500 relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>

          {/* PROFILE */}
          <div className="hidden min-[800px]:flex items-center gap-3" ref={menuRef}>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

            <div
              onClick={() => setOpen(!open)}
              className="relative flex items-center gap-3 cursor-pointer select-none"
            >
              <div className="text-right">
                <p className="font-bold text-[13px] text-slate-800 leading-none">
                  Servex AI Platform
                </p>
                <p className="text-[11px] text-[#6264A7] font-medium">
                  Administrator Profile
                </p>
              </div>

              <div className="relative">
                <img
                  src="/logo2.png"
                  alt="Servex Admin"
                  className="w-9 h-9 rounded-full border border-slate-200"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
              />

              {/* DROPDOWN */}
              {open && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                  
                  {/* PROFILE HEADER */}
                  <div className="px-4 py-4 flex items-center gap-3 bg-slate-50">
                    <img src="/logo2.png" className="w-10 h-10 rounded-full border" />
                    <div>
                      <p className="font-semibold text-sm">Servex AI Platform</p>
                      <p className="text-xs text-[#6264A7]">Administrator Profile</p>
                    </div>
                  </div>

                  <div className="h-px bg-slate-200"></div>

                  <MenuItem icon={Settings} label="Settings" />
                  <MenuItem icon={BookOpen} label="Documentation" />
                  <MenuItem icon={Brain} label="AI Context" />
                  <MenuItem icon={Layers} label="AI Models" />

                  <div className="h-px bg-slate-200 my-1"></div>

                  {/* 🔐 SIGN OUT → ABRE EL MISMO MODAL */}
                  <MenuItem
                    icon={LogOut}
                    label="Sign out"
                    danger
                    onClick={() => {
                      setOpen(false);
                      setShowLogoutModal(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 🔐 LOGOUT MODAL — EXACTAMENTE IGUAL */}
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
              <h2 className="text-[20px] min-[800px]:text-[24px] font-semibold mb-4">
                Sign out of SVX Copilot
              </h2>

              <p className="text-[14px] min-[800px]:text-[15px] mb-6">
                We'll sign you out and remove any temporary offline data,
                including unsent query drafts.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-[6px] border rounded text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-[6px] bg-[#464eb8] text-white rounded text-sm font-semibold hover:bg-[#3b42a0]"
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

/* MENU ITEM */
function MenuItem({ icon: Icon, label, danger, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer
        ${danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-slate-700 hover:bg-[#6264A7]/10 hover:text-[#6264A7]'
        }
      `}
    >
      <Icon size={16} />
      <span>{label}</span>
    </div>
  );
}
