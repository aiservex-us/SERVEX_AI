'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import {
  FiInfo,
  FiBriefcase,
  FiBookOpen,
  FiMail,
  FiMenu,
  FiX,
} from 'react-icons/fi';

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔹 Detectar sesión
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMainButton = () => {
    if (isAuthenticated) {
      router.push('/panel');
    } else {
      router.push('/login');
    }
  };

  const NavItem = ({ icon: Icon, label, onClick }) => (
    <div
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer text-sm text-black/70 hover:text-black transition"
    >
      <Icon size={16} />
      <span>{label}</span>
    </div>
  );

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Logo"
            className="h-9 cursor-pointer"
            onClick={() => router.push('/')}
          />

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <NavItem icon={FiInfo} label="About" />
            <NavItem icon={FiBriefcase} label="Portfolio" />
            <NavItem icon={FiBookOpen} label="Blog" />
            <NavItem icon={FiMail} label="Contact" />
          </nav>

          {/* Botón login / dashboard */}
          <button
            onClick={handleMainButton}
            className="
              hidden md:inline-flex
              px-5 py-2
              text-sm font-medium
              bg-black text-white
              rounded-full
              shadow
              transition hover:scale-[1.03]
            "
          >
            {isAuthenticated ? 'Dashboard' : 'Iniciar sesión'}
          </button>

          {/* Botón hamburguesa */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-black/5 transition"
          >
            <FiMenu size={22} />
          </button>
        </div>
      </header>

      {/* Overlay móvil */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white">
          
          <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-9 cursor-pointer"
              onClick={() => {
                router.push('/');
                setOpen(false);
              }}
            />

            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-black/5 transition"
            >
              <FiX size={22} />
            </button>
          </div>

          <nav className="px-6 py-8 flex flex-col gap-6">
            <NavItem icon={FiInfo} label="About" onClick={() => setOpen(false)} />
            <NavItem icon={FiBriefcase} label="Portfolio" onClick={() => setOpen(false)} />
            <NavItem icon={FiBookOpen} label="Blog" onClick={() => setOpen(false)} />
            <NavItem icon={FiMail} label="Contact" onClick={() => setOpen(false)} />

            <div className="pt-6 border-t border-black/10">
              <button
                onClick={() => {
                  handleMainButton();
                  setOpen(false);
                }}
                className="w-full rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow transition hover:scale-[1.03]"
              >
                {isAuthenticated ? 'Dashboard' : 'Iniciar sesión'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
