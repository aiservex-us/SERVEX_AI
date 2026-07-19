'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowRight, FaStar, FaRobot } from 'react-icons/fa';
import { FileCode, FileSpreadsheet, ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    /* Responsiveness Adjustments on Parent:
      - Changed `min-h-[60vh]` to `min-h-fit` to prevent content overflow on mobile.
      - Dynamic Padding: `pt-16 pb-10 px-4` on mobile, scaling to `md:px-10 md:pb-12 md:pt-24 lg:px-12 lg:pb-14 lg:pt-28`.
      - Adaptive Border Radius: `rounded-2xl` on mobile, `md:rounded-3xl` on large screens.
    */
    <section className="relative min-h-[80vh] w-[95%] max-w-9xl mx-auto flex flex-col justify-end overflow-hidden bg-white px-4 pb-10 pt-16 md:px-10 md:pb-12 md:pt-24 lg:px-12 lg:pb-14 lg:pt-28 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
      
            {/* 1. ULTRA-REALISTIC STATIC ABSTRACT GLASS BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-[#fbfbfc] overflow-hidden rounded-2xl md:rounded-3xl">
        {/* Ambient background soft gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-[#464775]/5 to-[#464775]/10" />

        {/* Abstract 3D Glass Blob 1 */}
        <div 
          className="absolute top-[-10%] left-[-5%] w-[450px] h-[500px] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] backdrop-blur-[12px] opacity-80"
          style={{ 
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 25%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.6) 100%)',
            boxShadow: 'inset -15px -15px 30px rgba(70, 71, 117, 0.1), inset 15px 15px 30px rgba(255,255,255,1), 0 20px 50px rgba(70,71,117,0.05)'
          }} 
        />
        
        {/* Abstract 3D Glass Blob 2 */}
        <div 
          className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[550px] rounded-[50%_30%_52%_48%_/_40%_60%_40%_60%] backdrop-blur-[16px] opacity-70"
          style={{ 
            background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.1) 70%, rgba(255,255,255,0.8) 100%)',
            boxShadow: 'inset -20px -20px 40px rgba(70, 71, 117, 0.15), inset 20px 20px 40px rgba(255,255,255,0.9), 0 30px 60px rgba(70,71,117,0.08)'
          }}
        />

        {/* Abstract 3D Glass Blob 3 (Small accent) */}
        <div 
          className="absolute top-[30%] right-[20%] w-[250px] h-[220px] rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] backdrop-blur-[8px] opacity-60"
          style={{ 
            background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.05) 80%, rgba(255,255,255,0.5) 100%)',
            boxShadow: 'inset -10px -10px 20px rgba(70, 71, 117, 0.08), inset 10px 10px 20px rgba(255,255,255,0.8), 0 10px 30px rgba(70,71,117,0.03)'
          }}
        />
      </div>

      {/* 2. GRADIENT & PANEL LAYER */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-blue-100/15 to-orange-100/15" />
        
        {/* Abstract panels hidden or optimized for small screens */}
        <div className="absolute top-[-10%] right-[-5%] w-[80%] md:w-[60%] h-[120%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-100/15 to-transparent border-l border-white/40 shadow-[1px_0_10px_rgba(0,0,0,0.03)]" />
        </div>
        <div className="absolute top-[5%] right-[15%] w-[40%] h-[100%] rotate-[15deg] hidden sm:block">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-100/10 to-transparent border-l border-white/40" />
        </div>
        <div className="absolute top-[-20%] left-[10%] w-[30%] h-[80%] rotate-[15deg] hidden sm:block">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-100/15 to-transparent border-l border-white/40" />
        </div>
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="relative z-20 w-full flex flex-col items-center text-center">
        
        {/* AI Assistant Badge - Compact size */}
        <div className="inline-flex items-center gap-1.5 bg-[#5B5FC7]/10 border border-[#5B5FC7]/20 text-[#5B5FC7] px-2.5 py-0.5 rounded-full mb-4 backdrop-blur-sm">
          <FaRobot className="text-[9px] md:text-[10px]" />
          <span className="text-[8px] md:text-[9px] font-semibold uppercase tracking-wider font-sans">
            Guided by Alysa AI Assistant
          </span>
        </div>

        {/* Main Title - Fluid size control, matching previous compact style */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-[#1a1a1a] leading-tight tracking-tighter max-w-2xl mx-auto mb-3 px-2">
          <span className="font-bold">LESRO Catalog Engine:</span>
        </h1>
        
        {/* Descriptive Text - Compact size, and restored text content */}
        <p className="text-xs md:text-sm text-[#424242] leading-relaxed max-w-2xl mx-auto mb-8 px-4">
          Intelligently optimizes the <span className="text-black font-normal">LESRO catalog architecture</span>. Upload your legacy matrices in XML and CSV to cross-reference them against new datasets; our platform structurally analyzes variations, generates new rows or columns, and instantly executes price delta audits. Continuously powered by <span className="text-[#5B5FC7] font-normal">Alysa</span>, it compiles and deploys clean, custom-tailored XML schemas for direct integration and dynamic adjustment within <span className="text-black font-normal">Configura CET Designer</span>.
        </p>

                        {/* 4. INTEGRATED MODULE CARDS - Ultra Premium Minimalist Layout (Scaled Down) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-5 w-[90%] mx-auto mb-10 md:mb-12 text-left">
          
          {/* Card XML */}
          <Link 
            href="/LESRO/Actualizer_XML_LESRO"
            className="group flex flex-col bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-5 lg:p-7 hover:bg-white/80 hover:border-white hover:shadow-[0_20px_40px_rgba(70,71,117,0.08)] hover:-translate-y-1 transition-all duration-500 ease-out"
          >
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#464775] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-slate-50 mb-4 group-hover:scale-105 transition-transform duration-500 ease-out">
              <FileCode size={18} strokeWidth={1.5} />
            </div>
            <h2 className="text-[15px] font-semibold mb-1.5 text-slate-800 tracking-tight">XML Actualizer</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-6 flex-grow pr-4">
              Advanced management and parsing for XML format catalogs and complex workflows.
            </p>
            <div className="flex items-center text-[#464775] text-[9px] font-extrabold tracking-[0.15em] uppercase mt-auto opacity-60 group-hover:opacity-100 transition-opacity duration-500">
              Access Module 
              <ArrowRight size={12} strokeWidth={2.5} className="ml-2 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out" />
            </div>
          </Link>

          {/* Card Alysa Hub */}
          <Link 
            href="/WBO/Alysa_Hub_Workstations"
            className="group flex flex-col bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-5 lg:p-7 hover:bg-white/80 hover:border-white hover:shadow-[0_20px_40px_rgba(70,71,117,0.08)] hover:-translate-y-1 transition-all duration-500 ease-out"
          >
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#464775] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-slate-50 mb-4 group-hover:scale-105 transition-transform duration-500 ease-out">
              <Sparkles size={18} strokeWidth={1.5} />
            </div>
            <h2 className="text-[15px] font-semibold mb-1.5 text-slate-800 tracking-tight">Alysa Intelligence Hub</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-6 flex-grow pr-4">
              AI-guided delta auditing, structural schema insertion, and direct synchronization with CET Designer.
            </p>
            <div className="flex items-center text-[#464775] text-[9px] font-extrabold tracking-[0.15em] uppercase mt-auto opacity-60 group-hover:opacity-100 transition-opacity duration-500">
              Access Module 
              <ArrowRight size={12} strokeWidth={2.5} className="ml-2 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out" />
            </div>
          </Link>

        </div>

        {/* 5. HERO FOOTER / METADATA - Restructured to be Full Responsive */}
        {/* Spacing updated to compact previous design */}
        <div className="flex flex-col md:grid md:grid-cols-12 gap-5 md:gap-3 lg:gap-6 items-center md:items-end border-t border-gray-900/10 pt-6 font-sans w-full text-center md:text-left">
          
          {/* Left Subtext */}
          <div className="md:col-span-5 lg:col-span-4 flex items-start gap-3">
            <p className="text-[9px] md:text-[10px] text-gray-500 leading-relaxed uppercase tracking-wider font-medium max-w-sm md:max-w-none">
              Delta Data Analysis: Upload source files <br className="hidden lg:block" />
              and automate row, column, and pricing integration.
            </p>
            <div className="mt-0.5 hidden md:block">
              <FaArrowRight className="text-gray-400 text-[9px]" />
            </div>
          </div>

          {/* Central Subtext */}
          <div className="md:col-span-4 lg:col-span-4">
            <p className="text-[9px] md:text-[10px] text-gray-400 leading-relaxed uppercase tracking-wider font-medium opacity-70 max-w-sm md:max-w-none mx-auto md:mx-0">
              Robust Sync with CET Designer. Configure new <br className="hidden lg:block" />
              products and validate catalog modifications in real time.
            </p>
          </div>

          {/* Ratings / Trust - Adaptive alignment (center on mobile, right on desktop) */}
          {/* Updated star color to match #464775 */}
          <div className="md:col-span-3 lg:col-span-4 flex flex-col items-center md:items-end gap-1 w-full">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-gray-900 mr-1 uppercase tracking-tighter">Mission Critical</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-[#464775] text-[7px]" />
                ))}
              </div>
            </div>
            <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold">
              Automated Infrastructure for <span className="text-gray-900">Servex US & WBO</span>
            </p>
          </div>
 
        </div>
        
      </div>
      
    </section>
  );
};

export default HeroSection;