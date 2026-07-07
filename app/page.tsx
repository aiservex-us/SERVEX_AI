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

// --- PORTAL CARD COMPONENT (Teams Style with animations) ---
const PortalSection = ({ title, subtitle, description, features, buttonText, onClick, colorClass, gradientClass, iconColor, delay }: any) => (
  <div 
    className="flex flex-col bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-500 group animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradientClass} shadow-sm border border-white/20 group-hover:scale-110 transition-transform duration-300 shrink-0`}>
        {title.includes("PARTNERS") || title.includes("COLABORATORS") ? 
          <Users size={22} className="text-white" /> : 
          <ShieldCheck size={22} className="text-white" />
        }
      </div>
      <div>
        <h4 className={`font-bold text-[14px] sm:text-[15px] leading-tight ${iconColor}`}>{title}</h4>
        <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold tracking-widest uppercase">{subtitle}</span>
      </div>
    </div>
    
    <p className="text-[12px] text-gray-600 mb-5 sm:mb-6 leading-relaxed">
      {description}
    </p>

    <div className="space-y-4 mb-6 sm:mb-8 flex-1">
      {features.map((f: any, i: number) => (
        <div key={i} className="flex items-start gap-3 group/item">
          <div className="mt-0.5 text-gray-400 group-hover/item:text-blue-500 transition-colors shrink-0">{f.icon}</div>
          <div>
            <p className="text-[12px] font-bold text-gray-800 leading-none">{f.label}</p>
            <p className="text-[10px] text-gray-500 mt-1">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>

    <button 
      onClick={onClick}
      className={`w-full py-2.5 rounded text-white text-[12px] font-bold transition-all active:scale-[0.95] flex items-center justify-center gap-2 ${colorClass} hover:brightness-110 hover:gap-4`}
    >
      {buttonText} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
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
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-700 bg-cover bg-center"
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url('')` 
      }}
    >
      <div className="absolute inset-0 bg-w backdrop-blur-[8px]"></div>

      <div className="relative w-full max-w-[950px] max-h-[90vh] md:max-h-none bg-white rounded-2xl shadow-[0_32px_120px_rgba(0,0,0,0.3)] border border-white/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 ease-out">
        
        {/* Contenedor escrolleable sólo en móviles si la pantalla es muy pequeña */}
        <div className="p-6 sm:p-10 overflow-y-auto md:overflow-y-visible flex-1">
          <div className="text-center mb-6 sm:mb-10">
            <div className="flex justify-center mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
              <img src="/logo.png" alt="Servex Logo" className="h-7 sm:h-8 w-auto object-contain" />
            </div>

            <p className="text-[13px] sm:text-[14px] text-gray-500 mt-2 animate-in fade-in duration-1000 delay-300 max-w-xl mx-auto">
              Welcome to the new era of data orchestrations at{' '}
              <a 
                href="https://servex-us.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                <strong className="text-gray-600">Servex US</strong>
              </a>
              . Choose your entry point.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <PortalSection 
              title="SVX COPILOT"
              subtitle="(PARTNERS & SERVEX AGENTS AREA)"
              colorClass="bg-[#414141]"
              gradientClass="from-[#717171] to-[#414141]"
              iconColor="text-[#414141]"
              delay={400}
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
              title="SVX COMMAND"
              subtitle="(CLIENT SERVEX/CET DESIGNER AREA)"
              colorClass="bg-[#464775]"
              gradientClass="from-[#5b5fc7] to-[#464775]"
              iconColor="text-[#464775]"
              delay={600}
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

        {/* Footer del popup adaptativo */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 sm:px-8 py-4 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center text-[8px] text-gray-400 font-bold uppercase tracking-widest text-center sm:text-left shrink-0">
          <span>GLYNNE ECOSYSTEM © 2026</span>
          <div className="flex gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              SERVEX Teams UI System
            </span>
            <span>Security Verified</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [requiresInteraction, setRequiresInteraction] = useState<boolean>(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const hasSeenAnimation = sessionStorage.getItem('svx_animation_seen');

    if (hasSeenAnimation) {
      setIsLoading(false);
      return;
    }

    const audio = new Audio('/tono1.mp3');
    setAudioObj(audio);

    // Try to play immediately
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Autoplay allowed
        startSplashTimer(audio);
      }).catch(error => {
        console.log("Audio blocked, requiring interaction:", error);
        setRequiresInteraction(true);
      });
    }

    return () => {
      audio.pause();
    };
  }, []);

  const startSplashTimer = (audioInstance: HTMLAudioElement) => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      audioInstance.pause();
      
      sessionStorage.setItem('svx_animation_seen', 'true');
    }, 4000);
  };

  const handleStartInteraction = () => {
    setRequiresInteraction(false);
    if (audioObj) {
      audioObj.play().catch(e => console.log(e));
      startSplashTimer(audioObj);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center p-4">
        <div className="animate-in fade-in zoom-in duration-1000 max-w-[80%] flex flex-col items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className={`w-36 sm:w-48 h-auto object-contain transition-all duration-500 ${requiresInteraction ? 'mb-8' : 'animate-pulse'}`} 
          />
          {requiresInteraction && (
            <button 
              onClick={handleStartInteraction}
              className="px-6 py-2.5 bg-[#464775] text-white text-sm font-semibold rounded-full hover:bg-[#3b3c66] transition-all animate-bounce shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Start Experience
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FFF] relative overflow-hidden">
      <div className="transition-all duration-1000 ease-in-out opacity-100 blur-0 scale-100">
        <Header />
        <main className="flex flex-col w-full overflow-hidden">
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