"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  RefreshCcw, 
  FileCode, 
  ShieldCheck, 
  Database, 
  Download, 
  ArrowRight,
  Grid,
  Search,
  Bell,
  Settings
} from 'lucide-react';

// Existing components
import Header from './components/header';
import Main1 from './components/main1';
import Main2 from './components/main2';
import Cards from './components/cards';
import Footer from './components/footer';
import MainGif from './components/main3';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- PORTAL CARD COMPONENT (Teams Style) ---
const PortalSection = ({ title, subtitle, description, features, buttonText, onClick, colorClass, gradientClass, iconColor }: any) => (
  <div className="flex flex-col bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradientClass} shadow-sm border border-white/20`}>
        {title.includes("PARTNERS") || title.includes("COLABORATORS") ? 
          <Users size={22} className="text-white" /> : 
          <ShieldCheck size={22} className="text-white" />
        }
      </div>
      <div>
        <h4 className={`font-bold text-[15px] leading-tight ${iconColor}`}>{title}</h4>
        <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{subtitle}</span>
      </div>
    </div>
    
    <p className="text-[12px] text-gray-600 mb-6 leading-relaxed">
      {description}
    </p>

    <div className="space-y-4 mb-8 flex-1">
      {features.map((f: any, i: number) => (
        <div key={i} className="flex items-start gap-3">
          <div className="mt-0.5 text-gray-400">{f.icon}</div>
          <div>
            <p className="text-[12px] font-bold text-gray-800 leading-none">{f.label}</p>
            <p className="text-[10px] text-gray-500 mt-1">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>

    <button 
      onClick={onClick}
      className={`w-full py-2.5 rounded text-white text-[12px] font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${colorClass} hover:brightness-110`}
    >
      {buttonText} <ArrowRight size={14} />
    </button>
  </div>
);

// --- POPUP COMPONENT (CRM LARGE STYLE) ---
const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleClientRedirect = (): void => {
    window.location.href = 'https://servex-clent-profle.vercel.app/';
  };

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-6 animate-in fade-in duration-500 bg-cover bg-center"
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('/fondo22.jpg')` 
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[4px]"></div>

      <div className="relative w-full max-w-[950px] bg-[#FFF] rounded-2xl shadow-[0_32px_120px_rgba(0,0,0,0.2)] border border-white/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="p-10">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-extrabold text-[#242424] tracking-tight">Select Your Ecosystem Portal</h3>
            <p className="text-[14px] text-gray-500 mt-2">Welcome to the new era of data orchestrations at <strong>Servex US</strong>. Choose your entry point.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <PortalSection 
              title="PARTNERS PORTAL"
              subtitle="(SVX COPILOT)"
              colorClass="bg-[#414141]"
              gradientClass="from-[#717171] to-[#414141]"
              iconColor="text-[#414141]"
              description="Automation engine for the new SERVEX-US furniture project. Technical orchestration and intelligent workflows."
              features={[
                { icon: <FileCode size={16}/>, label: "XML Catalogs", desc: "Updates for CET Designer." },
                { icon: <RefreshCcw size={16}/>, label: "Data Orchestration", desc: "Automated ETL pipelines." },
                { icon: <LayoutDashboard size={16}/>, label: "Engineering Control", desc: "Real-time flow monitoring." }
              ]}
              buttonText="Enter Internal Portal"
              onClick={onClose}
            />

            <PortalSection 
              title="CLIENT AREA"
              subtitle="(COMMAND CENTER)"
              colorClass="bg-[#464775]"
              gradientClass="from-[#5b5fc7] to-[#464775]"
              iconColor="text-[#464775]"
              description="Your Command Center for autonomous product management. Evolve your operations and leave Excel limitations behind."
              features={[
                { icon: <Database size={16}/>, label: "Catalog Management", desc: "Total control without spreadsheets." },
                { icon: <Download size={16}/>, label: "My Projects", desc: "Live integration status." },
                { icon: <ShieldCheck size={16}/>, label: "Download Area", desc: "Manuals and corporate resources." }
              ]}
              buttonText="Access Client Area"
              onClick={handleClientRedirect}
            />
          </div>
        </div>

        <div className="bg-white border-t border-gray-200 px-8 py-3 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <span>SVX ECOSYSTEM © 2026</span>
          <div className="flex gap-6">
            <span>Microsoft Teams UI System</span>
            <span>Security Verified</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if the animation has already been shown in this tab (sessionStorage)
    const hasSeenAnimation = sessionStorage.getItem('svx_animation_seen');

    if (hasSeenAnimation) {
      // If already seen, remove loading immediately and don't open the modal
      setIsLoading(false);
      return;
    }

    // If it's the first time in the tab:
    const audio = new Audio('/tono1.mp3');
    audio.play().catch(error => {
      console.log("Audio blocked:", error);
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
      audio.pause();
      
      // Mark that the animation has been seen in this session
      sessionStorage.setItem('svx_animation_seen', 'true');
      
      const hasClosedPopup = sessionStorage.getItem('svx_popup_closed');
      if (!hasClosedPopup) {
        setIsModalOpen(true);
      }
    }, 4000);

    return () => {
      clearTimeout(timer);
      audio.pause();
    };
  }, []);

  const handleCloseModal = () => {
    sessionStorage.setItem('svx_popup_closed', 'true');
    setIsModalOpen(false);
  };

  // Splash Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center">
        <div className="animate-in fade-in zoom-in duration-1000">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-48 h-auto animate-pulse" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAF9F8] relative">
      <WelcomePopup 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />

      <div className={`transition-all duration-700 ${isModalOpen ? 'opacity-30 blur-md pointer-events-none' : 'opacity-100 blur-0'}`}>
        <Header />
        <main className="flex flex-col">
          <section className="w-full"><Main1 /></section>
          <section className="w-full"><Cards /></section>
          <section className="w-full"><Main2 /></section>
          <section className="w-full"><MainGif /></section>
          <Footer />
        </main>
      </div>
    </div>
  );
}