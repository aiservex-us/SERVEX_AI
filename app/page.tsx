"use client";

import React, { useState, useEffect } from 'react';
// Your existing component imports
import Header from './components/header';
import Main1 from './components/main1';
import Main2 from './components/main2';
import Cards from './components/cards';
import Footer from './components/footer';
import MainGif from './components/main3';

// --- INTERFACES FOR TYPESCRIPT ---
interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- POPUP COMPONENT (MINIMALIST/PROFESSIONAL STYLE) ---
const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleClientRedirect = (): void => {
    window.location.href = 'https://servex-clent-profle.vercel.app/';
  };

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-in fade-in duration-500 bg-cover bg-center"
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('/fondo_popup_inicio.jpg')` 
      }}
    >
      {/* Subtle blur overlay */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[4px]"></div>

      {/* Popup Card */}
      <div className="relative w-full max-w-[500px] bg-white rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
          <h2 className="text-[14px] font-semibold text-[#242424] flex items-center gap-2">
            <div className="w-1.5 h-4 bg-[#464775] rounded-full shadow-sm"></div>
            SERVEX DATA EXPERIENCE
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-left bg-white">
          <div className="flex items-start gap-4">
            
            {/* Logo or Icon */}
            <div className="hidden sm:flex shrink-0 w-12 h-12 bg-white rounded-xl items-center justify-center shadow-sm border border-gray-100 overflow-hidden">
              <img 
                src="/logo2.png" 
                alt="SVX Logo"
                className="w-8 h-8 object-contain"
              />
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-[#242424] leading-tight">
                  Evolve your workflow
                </h3>
                <p className="text-[11px] text-[#464775] font-bold mt-0.5 tracking-wider uppercase">
                  Next-Gen Data Orchestration
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[#424242] text-[13px] leading-relaxed">
                  Welcome to the new era of management at <strong>Servex US</strong>. We have optimized the platform to deliver an industrial-grade experience.
                </p>
                <div className="bg-gray-50 p-3 rounded-md border-l-4 border-[#464775]">
                  <p className="text-[12px] text-[#616161] leading-snug">
                    Forget obsolete flows. With <strong>SVX Command & Copilot</strong>, you will process data in seconds under a high-availability architecture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Buttons & Info Bubbles (Tooltips) */}
        <div className="px-6 py-4 bg-[#F9F9F9] flex flex-col sm:flex-row-reverse gap-2 border-t border-gray-100">
          
          {/* Button: Client Access */}
          <div className="relative group">
            <button
              onClick={handleClientRedirect}
              className="w-full sm:w-auto px-4 py-1.5 bg-[#464775] text-white text-[12px] font-semibold rounded 
                         transition-all duration-300 ease-out
                         hover:bg-[#3b3c63] hover:shadow-md hover:-translate-y-0.5 
                         active:scale-[0.97] active:translate-y-0"
            >
              Client Access
            </button>
            {/* Info Bubble - English Version */}
            <div className="absolute bottom-full mb-2 right-0 w-60 p-3 bg-[#242424] text-white text-[10px] rounded shadow-xl opacity-0 translate-y-2 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 z-10">
              As a <strong>SERVEX</strong> client, access your command center to <strong>upload, transform, and manage your XML catalogs</strong> with data engineering tools that simplify every update.
              <div className="absolute top-full right-6 border-4 border-transparent border-t-[#242424]"></div>
            </div>
          </div>
          
          {/* Button: Collaborator */}
          <div className="relative group">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-1.5 bg-white border border-[#D1D1D1] text-[#242424] text-[12px] font-semibold rounded 
                         transition-all duration-300 ease-out
                         hover:bg-[#F0F0F0] hover:border-gray-400 hover:shadow-sm hover:-translate-y-0.5
                         active:scale-[0.97] active:translate-y-0"
            >
              I am a Collaborator
            </button>
            {/* Info Bubble - English Version */}
            <div className="absolute bottom-full mb-2 left-0 w-60 p-3 bg-[#242424] text-white text-[10px] rounded shadow-xl opacity-0 translate-y-2 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 z-10">
              Access <strong>SVX Copilot</strong> to monitor XML file integrity, execute mapping processes, and ensure seamless data synchronization with the Servex ecosystem.
              <div className="absolute top-full left-6 border-4 border-transparent border-t-[#242424]"></div>
            </div>
          </div>
          
          <div className="flex-1 flex items-center">
            <span className="text-[9px] text-gray-400 font-medium tracking-tighter uppercase">
              SVX ECOSYSTEM © 2026
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- MAIN COMPONENT (HOME) ---
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const hasClosedPopup = sessionStorage.getItem('svx_popup_closed');
    
    if (!hasClosedPopup) {
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = () => {
    sessionStorage.setItem('svx_popup_closed', 'true');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F8] relative">
      
      {/* 1. Modal / Popup */}
      <WelcomePopup 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />

      {/* 2. App Content with blur effect when modal is open */}
      <div className={`transition-all duration-700 ${isModalOpen ? 'opacity-30 blur-md pointer-events-none' : 'opacity-100 blur-0'}`}>
        
        <Header />

        <main className="flex flex-col">
          <section className="w-full">
            <Main1 />
          </section>
          
          <section className="w-full">
            <Cards />
          </section>
        
          <section className="w-full">
            <Main2 />
          </section>

          <section className="w-full">
            <MainGif />
          </section>

          <Footer />
        </main>
      </div>
    </div>
  );
}