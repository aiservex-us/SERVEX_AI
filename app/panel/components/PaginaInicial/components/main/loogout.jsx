'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const AlysaHomeIcon = ({ className = "w-[26px] h-[26px] md:w-[28px] md:h-[28px]", ...props }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 22.62 13.88 L 21.77 15.16 L 21.55 29.01 L 7.28 39.67 L 6.00 41.58 L 6.43 44.78 L 8.77 46.70 L 13.88 45.42 L 13.88 85.26 L 14.95 87.82 L 18.57 89.95 L 41.16 89.95 L 41.37 66.30 L 44.14 63.96 L 55.86 63.96 L 58.20 65.45 L 59.06 67.58 L 59.06 89.95 L 81.43 89.95 L 83.77 89.10 L 86.12 85.26 L 86.33 45.21 L 89.10 46.70 L 92.30 46.27 L 94.00 43.93 L 93.15 40.09 L 51.60 10.47 L 46.70 10.90 L 32.85 20.92 L 32.00 20.92 L 32.00 15.59 L 30.93 13.88 Z M 28.59 41.37 L 29.01 41.16 L 36.90 41.16 L 37.32 41.37 L 37.96 42.01 L 38.60 43.50 L 38.60 50.32 L 38.17 51.60 L 37.32 52.45 L 36.47 52.88 L 29.44 52.88 L 28.59 52.45 L 27.73 51.60 L 27.31 50.75 L 27.31 43.29 L 27.73 42.22 Z M 45.85 41.37 L 46.27 41.16 L 53.94 41.16 L 54.37 41.37 L 55.22 42.22 L 55.65 43.29 L 55.65 50.75 L 55.43 51.38 L 54.37 52.45 L 53.30 52.88 L 46.70 52.88 L 45.63 52.45 L 44.78 51.60 L 44.57 51.17 L 44.35 49.04 L 44.35 45.21 L 44.57 42.86 L 44.78 42.44 Z M 62.46 41.58 L 63.32 41.16 L 70.99 41.16 L 71.41 41.37 L 72.27 42.22 L 72.69 43.08 L 72.69 50.75 L 72.27 51.60 L 71.41 52.45 L 70.35 52.88 L 63.74 52.88 L 63.10 52.66 L 62.04 51.81 L 61.61 50.96 L 61.61 42.86 L 62.04 42.01 Z"
    />
  </svg>
);

const AlysaDashboardIcon = ({ className = "w-[26px] h-[26px] md:w-[28px] md:h-[28px]", ...props }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 7.13 17.96 L 6.00 22.02 L 6.00 67.15 L 7.35 72.34 L 9.84 74.59 L 12.77 75.50 L 40.30 75.72 L 38.72 80.24 L 34.21 80.69 L 33.08 81.59 L 32.63 83.39 L 34.21 85.43 L 66.02 85.43 L 67.60 83.62 L 67.15 81.59 L 66.02 80.69 L 61.96 80.46 L 60.15 75.50 L 87.68 75.27 L 89.94 74.14 L 93.77 69.86 L 94.00 20.22 L 92.87 17.51 L 90.39 15.25 L 88.58 14.57 L 11.87 14.57 L 8.93 15.93 Z M 31.72 29.47 L 36.91 29.47 L 38.04 30.82 L 38.04 59.25 L 37.14 60.38 L 36.46 60.61 L 31.95 60.61 L 30.59 59.48 L 30.37 58.80 L 30.37 31.05 L 30.82 30.14 Z M 43.46 37.59 L 46.84 37.59 L 47.74 37.82 L 48.65 38.72 L 48.87 39.17 L 48.87 59.03 L 48.65 59.48 L 47.74 60.38 L 47.29 60.61 L 42.78 60.61 L 42.33 60.38 L 41.43 59.48 L 41.20 59.03 L 41.20 39.17 L 41.43 38.72 L 42.33 37.82 Z M 20.89 43.91 L 21.79 43.68 L 25.41 43.68 L 26.53 44.13 L 27.21 44.81 L 27.44 45.26 L 27.44 59.03 L 27.21 59.48 L 26.31 60.38 L 25.86 60.61 L 21.34 60.61 L 20.67 60.38 L 19.76 59.48 L 19.54 58.80 L 19.54 45.49 L 19.76 45.04 Z M 68.05 51.81 L 68.95 51.35 L 74.37 51.35 L 75.27 51.81 L 75.72 52.26 L 76.17 53.16 L 76.17 59.03 L 75.72 59.70 L 75.27 60.15 L 74.37 60.61 L 68.95 60.61 L 68.05 60.15 L 67.37 59.48 L 66.92 58.35 L 66.92 53.61 L 67.37 52.48 Z M 55.64 52.03 L 55.87 52.03 L 56.32 51.58 L 56.77 51.35 L 62.18 51.35 L 62.64 51.58 L 63.09 52.03 L 63.31 52.03 L 63.54 52.26 L 63.99 53.16 L 63.99 59.03 L 63.76 59.48 L 63.09 60.15 L 62.18 60.61 L 56.77 60.61 L 56.32 60.38 L 55.87 59.93 L 55.64 59.93 L 55.42 59.70 L 54.96 58.80 L 54.96 53.16 L 55.42 52.26 Z"
    />
  </svg>
);

const AlysaChatIcon = ({ className = "w-[26px] h-[26px] md:w-[28px] md:h-[28px]", ...props }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 72.18 33.30 L 71.94 33.66 L 71.70 34.39 L 71.70 51.87 L 72.06 52.71 L 72.67 53.44 L 73.75 53.92 L 93.28 53.92 L 93.77 53.80 L 94.25 53.56 L 95.09 52.71 L 95.45 51.63 L 95.45 34.63 L 95.09 33.54 L 94.49 32.82 L 94.13 32.58 L 93.40 32.34 L 73.63 32.34 L 72.79 32.70 Z M 6.23 29.08 L 5.39 30.65 L 5.03 31.61 L 4.67 33.18 L 4.55 35.95 L 4.55 63.08 L 5.03 64.89 L 5.63 66.10 L 6.23 66.94 L 7.56 68.27 L 8.77 69.11 L 9.97 69.71 L 11.30 70.20 L 11.78 70.68 L 11.90 70.92 L 11.78 83.70 L 11.90 84.78 L 12.26 85.63 L 12.74 86.11 L 13.23 86.35 L 14.07 86.47 L 15.03 86.23 L 16.12 85.63 L 24.32 78.39 L 28.66 74.42 L 31.79 71.40 L 32.40 71.04 L 32.76 70.92 L 60.61 70.92 L 61.70 70.80 L 63.26 70.32 L 64.71 69.59 L 66.04 68.63 L 67.00 67.66 L 67.72 66.70 L 68.81 64.53 L 69.17 62.84 L 69.17 35.71 L 69.05 35.11 L 68.69 34.39 L 68.09 33.78 L 67.36 33.42 L 66.76 33.30 L 54.94 33.30 L 53.98 32.94 L 53.13 32.22 L 52.65 31.37 L 52.41 30.17 L 52.41 25.34 L 52.17 24.86 L 51.81 24.50 L 51.33 24.26 L 50.84 24.14 L 14.31 24.14 L 12.26 24.50 L 10.94 24.98 L 9.61 25.71 L 8.28 26.67 L 7.44 27.51 Z M 47.95 44.27 L 48.91 43.79 L 55.31 43.79 L 55.91 44.03 L 56.63 44.63 L 57.11 45.60 L 57.11 52.11 L 56.75 52.95 L 56.03 53.68 L 55.55 53.92 L 55.06 54.04 L 49.04 54.04 L 48.19 53.68 L 47.59 53.20 L 47.11 52.23 L 47.11 45.60 L 47.47 44.76 Z M 33.00 44.03 L 33.72 43.79 L 40.11 43.79 L 40.72 44.03 L 41.56 44.88 L 41.80 45.36 L 41.92 45.96 L 41.92 51.75 L 41.80 52.47 L 41.68 52.71 L 40.96 53.56 L 40.35 53.92 L 39.87 54.04 L 33.84 54.04 L 33.12 53.80 L 32.28 53.07 L 31.91 52.35 L 31.79 51.63 L 31.79 46.20 L 31.91 45.48 L 32.16 44.88 Z M 17.45 44.27 L 18.41 43.79 L 24.80 43.79 L 25.40 44.03 L 26.13 44.63 L 26.49 45.24 L 26.61 45.72 L 26.61 51.99 L 26.49 52.47 L 26.25 52.95 L 25.52 53.68 L 25.04 53.92 L 24.56 54.04 L 18.53 54.04 L 17.69 53.68 L 17.08 53.20 L 16.60 52.23 L 16.60 45.60 L 16.84 45.00 Z M 77.25 18.23 L 77.01 18.71 L 76.89 19.32 L 76.89 28.60 L 77.01 29.08 L 77.25 29.56 L 77.73 30.05 L 78.21 30.29 L 78.82 30.41 L 88.58 30.41 L 89.06 30.29 L 89.91 29.80 L 90.39 28.84 L 90.39 18.95 L 90.15 18.35 L 89.55 17.75 L 89.06 17.51 L 88.10 17.39 L 79.06 17.39 L 78.21 17.51 L 77.61 17.87 Z M 55.31 14.37 L 54.94 15.22 L 54.94 29.32 L 55.31 30.05 L 55.79 30.53 L 56.51 30.89 L 72.67 30.89 L 73.27 30.65 L 74.11 29.80 L 74.23 29.44 L 74.35 28.36 L 74.23 14.97 L 73.99 14.49 L 73.27 13.77 L 72.67 13.53 L 56.63 13.53 L 55.79 13.89 Z"
    />
  </svg>
);

const AlysaLogoIcon = ({ className = "w-[26px] h-[26px] md:w-[28px] md:h-[28px]", ...props }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 77.27 34.29 L 76.84 34.83 L 76.63 35.37 L 76.63 50.75 L 76.84 51.40 L 77.49 52.04 L 78.24 52.37 L 93.73 52.37 L 94.16 52.26 L 94.59 52.04 L 95.24 51.40 L 95.45 50.75 L 95.45 35.48 L 95.24 34.83 L 94.70 34.19 L 94.06 33.86 L 78.13 33.86 Z M 80.29 21.17 L 79.64 21.81 L 79.53 22.03 L 79.53 30.85 L 79.64 31.07 L 80.29 31.71 L 80.61 31.82 L 89.54 31.82 L 90.08 31.60 L 90.51 31.17 L 90.72 30.74 L 90.72 22.14 L 90.51 21.71 L 90.08 21.27 L 89.64 21.06 L 80.61 21.06 Z M 61.14 17.94 L 60.81 18.59 L 60.81 32.03 L 61.03 32.46 L 61.46 32.89 L 62.10 33.22 L 75.87 33.22 L 76.52 32.89 L 76.95 32.46 L 77.17 31.93 L 77.17 18.59 L 76.73 17.83 L 75.98 17.40 L 62.00 17.40 Z M 35.10 17.83 L 34.35 18.59 L 33.70 19.77 L 33.06 21.38 L 31.23 25.04 L 30.58 26.65 L 30.37 26.87 L 29.61 28.70 L 26.92 34.19 L 26.28 35.80 L 20.58 47.74 L 20.25 48.17 L 16.70 55.59 L 16.38 56.02 L 16.27 56.46 L 15.95 56.89 L 15.84 57.32 L 15.41 57.96 L 15.30 58.39 L 14.98 58.82 L 14.87 59.25 L 14.44 59.90 L 14.44 60.11 L 14.01 60.76 L 13.91 61.19 L 7.13 74.74 L 6.91 74.96 L 4.76 79.37 L 4.55 80.02 L 4.55 80.98 L 4.98 81.85 L 5.62 82.38 L 6.16 82.60 L 25.20 82.60 L 25.74 82.38 L 26.17 82.06 L 26.82 81.31 L 27.89 78.83 L 28.32 78.19 L 32.63 69.26 L 33.70 66.78 L 34.78 64.52 L 34.99 64.31 L 37.04 59.79 L 38.43 57.10 L 39.40 54.84 L 39.83 54.20 L 40.91 51.72 L 41.23 51.29 L 42.31 48.82 L 43.60 46.34 L 43.60 46.13 L 44.35 44.62 L 44.67 44.41 L 45.00 44.41 L 45.43 44.84 L 47.58 49.25 L 51.56 56.78 L 53.82 61.30 L 53.60 61.51 L 39.19 61.51 L 38.76 61.62 L 38.33 61.83 L 37.90 62.26 L 37.57 62.91 L 37.36 64.09 L 37.25 65.92 L 37.25 67.64 L 37.04 69.26 L 37.04 71.30 L 37.47 71.95 L 37.90 72.16 L 57.69 72.05 L 58.12 72.16 L 58.77 72.49 L 59.52 73.24 L 61.46 77.00 L 62.10 77.97 L 64.04 81.63 L 64.58 82.17 L 64.90 82.38 L 65.55 82.60 L 87.17 82.60 L 87.71 82.38 L 88.25 81.85 L 88.57 81.20 L 88.57 80.23 L 88.25 79.48 L 86.31 76.25 L 80.93 67.64 L 80.07 66.46 L 79.42 65.28 L 78.56 64.09 L 77.17 61.73 L 76.30 60.54 L 74.80 57.96 L 74.48 57.64 L 73.94 56.56 L 72.97 55.16 L 71.46 52.69 L 68.02 46.77 L 66.94 45.16 L 66.08 43.54 L 65.65 43.01 L 65.12 41.93 L 64.69 41.39 L 64.15 40.32 L 62.86 38.38 L 62.32 37.31 L 60.06 33.75 L 56.19 26.87 L 55.54 25.47 L 54.90 24.50 L 54.25 23.10 L 53.39 21.71 L 52.64 20.09 L 51.78 18.59 L 51.02 17.83 L 50.16 17.40 L 35.96 17.40 Z"
    />
  </svg>
);

// Componente SidebarIcon con tamaños responsivos "Mobile App Like"
const SidebarIcon = ({ icon, active, onClick, hideOnMobile, title }) => (
  <div
    onClick={onClick}
    title={title}
    className={`
      ${hideOnMobile ? 'hidden md:flex' : 'flex'}
      w-12 h-12 md:w-[54px] md:h-[54px] shrink-0
      items-center justify-center rounded-xl md:rounded-2xl cursor-pointer transition-all relative group
      ${active
        ? 'bg-[#6264A7]/15 text-[#6264A7] shadow-sm md:bg-white md:shadow-md md:text-[#6264A7]'
        : 'text-slate-500 hover:bg-slate-100/80 hover:text-[#6264A7] md:hover:bg-slate-50'}
    `}
  >
    {active && (
      <>
        {/* Indicador Desktop (izquierda) */}
        <div className="hidden md:block absolute left-[-12px] w-1.5 h-8 bg-[#6264A7] rounded-r-full shadow-sm" />
        {/* Indicador Mobile (abajo) */}
        <div className="md:hidden absolute bottom-[2px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#6264A7] rounded-full" />
      </>
    )}
    {React.isValidElement(icon) ? (
      React.cloneElement(icon, {
        className: `${icon.props.className ? icon.props.className : 'w-[26px] h-[26px] md:w-[28px] md:h-[28px]'} transition-transform duration-200 ${active ? 'scale-105' : 'group-hover:scale-105'}`.trim()
      })
    ) : icon}
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
        fixed bottom-0 left-0 w-full h-[76px] border-t flex flex-row items-center px-3 shadow-[0_-10px_40px_rgba(0,0,0,0.06)]
        md:relative md:w-[86px] md:h-full md:border-r md:border-t-0 md:flex-col md:py-6 md:px-0 md:shadow-none md:justify-between
      ">
        <div className="flex flex-row md:flex-col gap-2 md:gap-6 items-center w-full flex-1 md:flex-none">

          <a href="https://axglynne.com" target="_blank" rel="noopener noreferrer" className="hidden md:flex w-12 h-12 rounded-xl items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity p-1" title="AXGLYNNE">
            <img src="/GLYNNE.png" alt="GLYNNE" className="w-full h-full object-contain" />
          </a>

          <nav className="flex flex-row md:flex-col gap-1.5 md:gap-3 w-full md:px-3 overflow-x-auto md:overflow-visible items-center hide-scrollbar justify-around md:justify-start h-full">
            <SidebarIcon
              icon={<AlysaHomeIcon />}
              active={false}
              title="Home"
              onClick={() => router.push('/')}
            />

            <SidebarIcon
              icon={<AlysaDashboardIcon />}
              active={activeView === 'dashboard'}
              title="Dashboard"
              onClick={() => setActiveView('dashboard')}
            />

            <SidebarIcon
              icon={<AlysaChatIcon />}
              active={activeView === 'products'}
              title="Chat with Alysa"
              onClick={() => setActiveView('products')}
            />

            <SidebarIcon
              icon={<AlysaLogoIcon />}
              active={false}
              title="XML Pipeline Engine"
              onClick={() => router.push('/xml-pipeline')}
            />

            {/* LogOut en mobile se muestra al final del scroll, en desktop abajo */}
            <div className="md:hidden">
              <SidebarIcon
                icon={<LogOut className="w-[26px] h-[26px] md:w-[28px] md:h-[28px]" />}
                active={false}
                title="Sign out"
                onClick={() => setShowLogoutModal(true)}
              />
            </div>
          </nav>
        </div>

        {/* Desktop LogOut */}
        <div className="hidden md:flex mb-4">
          <SidebarIcon
            icon={<LogOut className="w-[26px] h-[26px] md:w-[28px] md:h-[28px]" />}
            active={false}
            title="Sign out"
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
