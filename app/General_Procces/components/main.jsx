'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowRight, FaStar, FaRobot } from 'react-icons/fa';
import { FileCode, FileSpreadsheet, ArrowRight, Sparkles, Cpu, Layers } from 'lucide-react';

const HeroSection = () => {
  const router = useRouter();

  return (
    <section className="relative min-h-[80vh] w-[95%] max-w-9xl mx-auto flex flex-col justify-end overflow-hidden bg-white px-4 pb-10 pt-16 md:px-10 md:pb-12 md:pt-24 lg:px-12 lg:pb-14 lg:pt-28 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
      
      {/* 1. ULTRA-REALISTIC STATIC ABSTRACT GLASS BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-[#fbfbfc] overflow-hidden rounded-2xl md:rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-[#464775]/5 to-[#464775]/10" />

        <div 
          className="absolute top-[-10%] left-[-5%] w-[450px] h-[500px] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] backdrop-blur-[12px] opacity-80"
          style={{ 
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 25%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.6) 100%)',
            boxShadow: 'inset -15px -15px 30px rgba(70, 71, 117, 0.1), inset 15px 15px 30px rgba(255,255,255,1), 0 20px 50px rgba(70,71,117,0.05)'
          }} 
        />
        
        <div 
          className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[550px] rounded-[50%_30%_52%_48%_/_40%_60%_40%_60%] backdrop-blur-[16px] opacity-70"
          style={{ 
            background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.1) 70%, rgba(255,255,255,0.8) 100%)',
            boxShadow: 'inset -20px -20px 40px rgba(70, 71, 117, 0.15), inset 20px 20px 40px rgba(255,255,255,0.9), 0 30px 60px rgba(70,71,117,0.08)'
          }}
        />
      </div>

      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-blue-100/15 to-purple-100/15" />
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="relative z-20 w-full flex flex-col items-center text-center">
        
        {/* AI Assistant Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#5B5FC7]/10 border border-[#5B5FC7]/20 text-[#5B5FC7] px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
          <FaRobot className="text-[10px]" />
          <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider font-sans">
            Powered by SERVEX_LOGIC_GLYNNE (Universal Multi-Tenant)
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-[#1a1a1a] leading-tight tracking-tighter max-w-2xl mx-auto mb-3 px-2">
          <span className="font-bold">General Process Engine:</span>
        </h1>
        
        {/* Descriptive Text */}
        <p className="text-xs md:text-sm text-[#424242] leading-relaxed max-w-2xl mx-auto mb-8 px-4">
          Universal multi-tenant engine for <span className="text-black font-semibold">OFDA / CET XML Schema</span> catalog processing. Seamlessly cross-references XML and CSV matrices, executes structural cell audit, and applies price mutations for any manufacturer powered by <span className="text-[#5B5FC7] font-semibold">Alysa SVX Copilot</span>.
        </p>

        {/* 4. INTEGRATED MODULE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-1 max-w-xl gap-3 lg:gap-5 w-[90%] mx-auto mb-10 md:mb-12 text-left">
          
          <Link 
            href="/General_Procces/Actualizer_XML_General"
            className="group flex flex-col bg-white/50 backdrop-blur-2xl border border-white/80 rounded-3xl p-6 lg:p-8 hover:bg-white/90 hover:border-indigo-200 hover:shadow-[0_20px_40px_rgba(70,71,117,0.12)] hover:-translate-y-1 transition-all duration-500 ease-out"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#464775] shadow-sm border border-indigo-100 mb-4 group-hover:scale-105 transition-transform duration-500 ease-out">
              <FileCode size={20} strokeWidth={1.5} />
            </div>
            <h2 className="text-base font-semibold mb-1.5 text-slate-900 tracking-tight">XML General Actualizer</h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-grow">
              Universal XML catalog actualizer and ETL pipeline for OFDA / CET schemas across all tenants.
            </p>
            <div className="flex items-center text-[#464775] text-[10px] font-extrabold tracking-[0.15em] uppercase mt-auto opacity-70 group-hover:opacity-100 transition-opacity duration-500">
              Access Universal Module 
              <ArrowRight size={14} strokeWidth={2.5} className="ml-2 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out" />
            </div>
          </Link>

        </div>

        {/* 5. HERO FOOTER */}
        <div className="flex flex-col md:grid md:grid-cols-12 gap-5 md:gap-3 lg:gap-6 items-center md:items-end border-t border-gray-900/10 pt-6 font-sans w-full text-center md:text-left">
          <div className="md:col-span-6 flex items-start gap-3">
            <p className="text-[9px] md:text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider font-medium">
              Universal Delta Data Analysis: Automates XML schema injection, cell price auditing, and multi-tenant persistence.
            </p>
          </div>
          <div className="md:col-span-6 text-right">
            <span className="text-[10px] text-gray-400 font-mono">
              SERVEX_LOGIC_GLYNNE v1.0 • Universal Engine
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;