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
  FiExternalLink
} from 'react-icons/fi';

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔹 Detect Session
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

  const handleAccessSvx = () => {
    // Opens in the same tab as requested
    window.location.href = 'https://servex-clent-profle.vercel.app/';
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
            className="h-2 md:h-4 cursor-pointer"
            onClick={() => router.push('/')}
          />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavItem
              icon={FiInfo}
              label="About"
              onClick={() => router.push('/politicas')}
            />

            <NavItem
              icon={FiBriefcase}
              label="Portfolio"
              onClick={() =>
                window.open(
                  'https://servex-us.com/3d-visualization/rendering-gallery/',
                  '_blank'
                )
              }
            />

            <NavItem
              icon={FiBookOpen}
              label="Blog"
              onClick={() => router.push('/firstai')}
            />

            <NavItem
              icon={FiMail}
              label="Contact"
              onClick={() =>
                window.open(
                  'https://servex-us.com/#getintouch',
                  '_blank'
                )
              }
            />
          </nav>

          {/* Action Button Group */}
          <div className="hidden md:flex items-center gap-3">
            {/* New Button: Access Svx Command */}
            <button
              onClick={handleAccessSvx}
              className="
                px-5 py-2
                text-sm font-medium
                rounded-full
                border border-black/10
                bg-white
                text-black
                transition hover:bg-gray-50 hover:scale-[1.03]
                flex items-center gap-2
              "
            >
              Access Svx Command
              <FiExternalLink size={14} className="opacity-50" />
            </button>

            {/* Login / Dashboard Button */}
            <button
              onClick={handleMainButton}
              className={`
                px-5 py-2
                text-sm font-medium
                rounded-full
                shadow
                transition hover:scale-[1.03]
                ${
                  isAuthenticated
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-black text-white'
                }
              `}
            >
              {isAuthenticated ? 'Dashboard' : 'Sign In'}
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-black/5 transition"
          >
            <FiMenu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-4 border-b border-black/10">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-7 md:h-9 cursor-pointer"
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
            <NavItem
              icon={FiInfo}
              label="About"
              onClick={() => {
                router.push('/politicas');
                setOpen(false);
              }}
            />

            <NavItem
              icon={FiBriefcase}
              label="Portfolio"
              onClick={() => {
                window.open(
                  'https://servex-us.com/3d-visualization/rendering-gallery/',
                  '_blank'
                );
                setOpen(false);
              }}
            />

            <NavItem
              icon={FiBookOpen}
              label="Blog"
              onClick={() => {
                router.push('/firstai');
                setOpen(false);
              }}
            />

            <NavItem
              icon={FiMail}
              label="Contact"
              onClick={() => {
                window.open(
                  'https://servex-us.com/3d-visualization/rendering-gallery/#getintouch',
                  '_blank'
                );
                setOpen(false);
              }}
            />

            <div className="pt-6 border-t border-black/10 flex flex-col gap-3">
              {/* Access Svx Command Button on Mobile */}
              <button
                onClick={handleAccessSvx}
                className="w-full rounded-full px-6 py-3 text-sm font-medium bg-white text-black border border-black/10 shadow-sm transition active:scale-95 flex justify-center items-center gap-2"
              >
                Access Svx Command
                <FiExternalLink size={14} />
              </button>

              <button
                onClick={() => {
                  handleMainButton();
                  setOpen(false);
                }}
                className={`w-full rounded-full px-6 py-3 text-sm font-medium text-white shadow transition active:scale-95
                  ${
                    isAuthenticated
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-black'
                  }
                `}
              >
                {isAuthenticated ? 'Dashboard' : 'Sign In'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}