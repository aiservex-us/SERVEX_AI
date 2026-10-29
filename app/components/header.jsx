'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import ServexLogo from './ServexLogo';
import {
  FileText,
  Briefcase,
  BookOpen,
  Mail,
  Menu,
  X,
  Cpu,
  Tag
} from 'lucide-react';

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
      router.push('/xml-pipeline');
    } else {
      router.push('/login');
    }
  };

  const NavItem = ({ icon: Icon, label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 cursor-pointer text-xs md:text-sm font-medium text-neutral-600 hover:text-black transition-colors px-2 py-1"
    >
      <Icon size={15} className="opacity-70" />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* ── HEADER CON FONDO HIDDEN (TRANSPARENTE / MINIMALISTA / NO IA) ── */}
      <header className="fixed top-0 left-0 w-full z-50 bg-transparent border-none">
        <div className="max-w-[95vw] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">

          {/* Logo en SVG en tonos negro / gris */}
          <div className="flex items-center">
            <ServexLogo
              className="h-5 sm:h-6 w-auto text-[#18181b] hover:text-black cursor-pointer transition-colors"
              onClick={() => router.push('/')}
            />
          </div>

          {/* Navegación Desktop Limpia y Elegante */}
          <nav className="hidden lg:flex items-center gap-6">
            <NavItem
              icon={FileText}
              label="Policies"
              onClick={() => router.push('/policies')}
            />

            <NavItem
              icon={Cpu}
              label="Operation"
              onClick={() => window.open('https://axglynne.com/servex_espesification', '_blank')}
            />

            <NavItem
              icon={Tag}
              label="Pricing"
              onClick={() => router.push('/pricing')}
            />

            <NavItem
              icon={Briefcase}
              label="Portfolio"
              onClick={() =>
                window.open(
                  'https://servex-us.com/3d-visualization/rendering-gallery/',
                  '_blank'
                )
              }
            />

            <NavItem
              icon={BookOpen}
              label="Blog"
              onClick={() => window.open('https://www.linkedin.com/company/servex-us/posts/', '_blank')}
            />

            <NavItem
              icon={Mail}
              label="Contact"
              onClick={() =>
                window.open(
                  'https://servex-us.com/#getintouch',
                  '_blank'
                )
              }
            />
          </nav>

          {/* Botón Principal (Sign In / Dashboard) */}
          <div className="hidden sm:flex items-center">
            <button
              type="button"
              onClick={handleMainButton}
              className={`
                px-5 py-2
                text-xs md:text-sm font-semibold tracking-wide
                rounded-full
                transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                ${
                  isAuthenticated
                    ? 'bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 shadow-sm'
                    : 'bg-black hover:bg-neutral-800 text-white shadow'
                }
              `}
            >
              <span>{isAuthenticated ? 'Dashboard' : 'Sign In'}</span>
            </button>
          </div>

          {/* Botón Menú Mobile */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="lg:hidden p-2 rounded-full hover:bg-black/5 text-neutral-800 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Menú Mobile Desplegable */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-6 h-16 border-b border-black/10">
            <ServexLogo
              className="h-5 w-auto text-[#18181b]"
              onClick={() => {
                router.push('/');
                setOpen(false);
              }}
            />

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="p-2 rounded-full hover:bg-black/5 text-neutral-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="px-6 py-6 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                router.push('/policies');
                setOpen(false);
              }}
              className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black text-sm font-medium text-left transition-colors"
            >
              <FileText size={16} />
              <span>Policies</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.open('https://axglynne.com/servex_espesification', '_blank');
                setOpen(false);
              }}
              className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black text-sm font-medium text-left transition-colors"
            >
              <Cpu size={16} />
              <span>Operation</span>
            </button>

            <button
              type="button"
              onClick={() => {
                router.push('/pricing');
                setOpen(false);
              }}
              className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black text-sm font-medium text-left transition-colors"
            >
              <Tag size={16} />
              <span>Pricing</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.open(
                  'https://servex-us.com/3d-visualization/rendering-gallery/',
                  '_blank'
                );
                setOpen(false);
              }}
              className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black text-sm font-medium text-left transition-colors"
            >
              <Briefcase size={16} />
              <span>Portfolio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.open('https://www.linkedin.com/company/servex-us/posts/', '_blank');
                setOpen(false);
              }}
              className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black text-sm font-medium text-left transition-colors"
            >
              <BookOpen size={16} />
              <span>Blog</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.open(
                  'https://servex-us.com/#getintouch',
                  '_blank'
                );
                setOpen(false);
              }}
              className="flex items-center gap-3 py-2 text-neutral-700 hover:text-black text-sm font-medium text-left transition-colors"
            >
              <Mail size={16} />
              <span>Contact</span>
            </button>

            <div className="pt-4 mt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => {
                  handleMainButton();
                  setOpen(false);
                }}
                className={`
                  w-full py-3 text-sm font-semibold rounded-full shadow transition-all
                  ${
                    isAuthenticated
                      ? 'bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800'
                      : 'bg-black text-white hover:bg-neutral-800'
                  }
                `}
              >
                <span>{isAuthenticated ? 'Dashboard' : 'Sign In'}</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}