'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowRight, FaStar, FaRobot } from 'react-icons/fa';
import { FileCode, FileSpreadsheet, ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    /* Responsiveness Adjustments on Parent:
      - Changed `min-h-[60vh]` to `min-h-fit` to prevent content overflow on mobile.
      - Dynamic Padding: `pt-20 pb-12 px-4` on mobile, scaling to `md:px-12 md:pb-16 md:pt-28 lg:px-16 lg:pb-20 lg:pt-32`.
      - Adaptive Border Radius: `rounded-2xl` on mobile, `md:rounded-3xl` on large screens.
    */
    <section className="relative min-h-fit w-[95%] max-w-9xl mx-auto flex flex-col justify-end overflow-hidden bg-white px-4 pb-12 pt-20 md:px-12 md:pb-16 md:pt-28 lg:px-16 lg:pb-20 lg:pt-32 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
      
      {/* 1. BASE BACKGROUND IMAGE */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/_.jpeg" 
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/35" />
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
        
        {/* AI Assistant Badge */}
        <div className="inline-flex items-center gap-2 bg-[#5B5FC7]/10 border border-[#5B5FC7]/20 text-[#5B5FC7] px-3 py-1 rounded-full mb-6 backdrop-blur-sm">
          <FaRobot className="text-[10px] md:text-xs" />
          <span className="text-[9px] md:text-[11px] font-semibold uppercase tracking-wider font-sans">
            Guided by Alysa AI Assistant
          </span>
        </div>

        {/* Main Title - Fluid size control */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-[#1a1a1a] leading-tight tracking-tighter max-w-3xl mx-auto mb-4 px-2">
          <span className="font-bold">WBT Catalog Engine:</span>
  
        </h1>

        {/* Descriptive Text */}
        <p className="text-xs sm:text-sm lg:text-base font-light text-gray-500 mb-10 md:mb-12 max-w-xl md:max-w-2xl leading-relaxed mx-auto px-2">
          Intelligently optimizes the <span className="text-black font-normal">WB Manufacturing catalog architecture</span>. Upload your legacy matrices in XML and CSV to cross-reference them against new datasets; our platform structurally analyzes variations, generates new rows or columns, and instantly executes price delta audits. Continuously powered by <span className="text-[#5B5FC7] font-normal">Alysa</span>, it compiles and deploys clean, custom-tailored XML schemas for direct integration and dynamic adjustment within <span className="text-black font-normal">Configura CET Designer</span>.
        </p> 

        {/* 4. INTEGRATED MODULE CARDS - Responsive Grid (1 col on mobile, 3 cols on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 w-full mb-12 md:mb-16 text-left">
          
          {/* Card XML */}
          <Link 
            href="/WBO/Actualizer_XML"
            className="flex flex-col bg-white/80 border border-[#E1E1E1] rounded-xl p-5 md:p-6 hover:bg-white hover:border-[#BDBDBD] hover:shadow-md transition-all duration-200 backdrop-blur-sm"
          >
            <div className="mb-3 md:mb-4 text-[#6264A7]">
              <FileCode size={26} className="md:w-[28px] md:h-[28px]" />
            </div>
            <h2 className="text-base md:text-lg font-semibold mb-1 text-[#1a1a1a]">XML Actualizer</h2>
            <p className="text-xs md:text-sm text-[#616161] mb-5 md:mb-6 flex-grow">Advanced management and parsing for XML format catalogs and complex workflows.</p>
            <div className="flex items-center text-[#6264A7] text-xs md:text-sm font-medium mt-auto">
              Go to module <ArrowRight className="ml-2" size={14} />
            </div>
          </Link>

          {/* Card Excel/CSV */}
          <Link 
            href="/WBO/Actualizer_Excel"
            className="flex flex-col bg-white/80 border border-[#E1E1E1] rounded-xl p-5 md:p-6 hover:bg-white hover:border-[#BDBDBD] hover:shadow-md transition-all duration-200 backdrop-blur-sm"
          >
            <div className="mb-3 md:mb-4 text-[#46A160]">
              <FileSpreadsheet size={26} className="md:w-[28px] md:h-[28px]" />
            </div>
            <h2 className="text-base md:text-lg font-semibold mb-1 text-[#1a1a1a]">CSV/Excel Actualizer</h2>
            <p className="text-xs md:text-sm text-[#616161] mb-5 md:mb-6 flex-grow">Processing, transformation, and normalization of structured data files.</p>
            <div className="flex items-center text-[#46A160] text-xs md:text-sm font-medium mt-auto">
              Go to module <ArrowRight className="ml-2" size={14} />
            </div>
          </Link>

          {/* Card Alysa & CET Integration Hub */}
          <Link 
            href="/WBO/Alysa_Hub"
            className="flex flex-col bg-white/80 border border-[#E1E1E1] rounded-xl p-5 md:p-6 hover:bg-white hover:border-[#BDBDBD] hover:shadow-md transition-all duration-200 backdrop-blur-sm"
          >
            <div className="mb-3 md:mb-4 text-[#5B5FC7]">
              <Sparkles size={26} className="md:w-[28px] md:h-[28px]" />
            </div>
            <h2 className="text-base md:text-lg font-semibold mb-1 text-[#1a1a1a]">Alysa Intelligence Hub</h2>
            <p className="text-xs md:text-sm text-[#616161] mb-5 md:mb-6 flex-grow">AI-guided delta auditing, structural schema insertion, and direct synchronization with CET Designer.</p>
            <div className="flex items-center text-[#5B5FC7] text-xs md:text-sm font-medium mt-auto">
              Go to module <ArrowRight className="ml-2" size={14} />
            </div>
          </Link>

        </div>

        {/* 5. HERO FOOTER / METADATA - Restructured to be Full Responsive */}
        <div className="flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-4 lg:gap-8 items-center md:items-end border-t border-gray-900/10 pt-8 font-sans w-full text-center md:text-left">
          
          {/* Left Subtext */}
          <div className="md:col-span-5 lg:col-span-4 flex items-start gap-4">
            <p className="text-[10px] md:text-[11px] text-gray-500 leading-relaxed uppercase tracking-wider font-medium max-w-sm md:max-w-none">
              Delta Data Analysis: Upload source files <br className="hidden lg:block" />
              and automate row, column, and pricing integration.
            </p>
            <div className="mt-0.5 hidden md:block">
              <FaArrowRight className="text-gray-400 text-[10px]" />
            </div>
          </div>

          {/* Central Subtext */}
          <div className="md:col-span-4 lg:col-span-4">
            <p className="text-[10px] md:text-[11px] text-gray-400 leading-relaxed uppercase tracking-wider font-medium opacity-70 max-w-sm md:max-w-none mx-auto md:mx-0">
              Robust Sync with CET Designer. Configure new <br className="hidden lg:block" />
              products and validate catalog modifications in real time.
            </p>
          </div>

          {/* Ratings / Trust - Adaptive alignment (center on mobile, right on desktop) */}
          <div className="md:col-span-3 lg:col-span-4 flex flex-col items-center md:items-end gap-1.5 w-full">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-900 mr-1.5 uppercase tracking-tighter">Mission Critical</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-[#5B5FC7] text-[8px]" />
                ))}
              </div>
            </div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              Automated Infrastructure for <span className="text-gray-900">Servex US & WBT</span>
            </p>
          </div>
 
        </div>
        
      </div>
      
    </section>
  );
};

export default HeroSection;