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
      
      {/* 1. BASE BACKGROUND IMAGE (Cambiado a fondo blanco con figura rara, morada y difuminada) */}
      <div className="absolute inset-0 z-0 bg-white">
        {/* Figura abstracta/rara morada principal con fuerte difuminado - Se incrementó la opacidad al 35% */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[80%] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] bg-[#464775]/35 blur-[120px] pointer-events-none" />
        
        {/* Segunda figura complementaria para dar la forma irregular al fondo - Se incrementó la opacidad al 30% */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[70%] rounded-[50%_30%_52%_48%_/_40%_60%_40%_60%] bg-[#464775]/30 blur-[140px] pointer-events-none" />
        
        {/* Destellos y difuminados blancos encima para suavizar y fusionar la composición */}
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-white/60 blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/40 pointer-events-none" />
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
          <span className="font-bold">WBS Catalog Engine:</span>
        </h1>
        
        {/* Descriptive Text - Compact size, and restored text content */}
        <p className="text-xs md:text-sm text-[#424242] leading-relaxed max-w-2xl mx-auto mb-8 px-4">
          Intelligently optimizes the <span className="text-black font-normal">WB Manufacturing catalog architecture</span>. Upload your legacy matrices in XML and CSV to cross-reference them against new datasets; our platform structurally analyzes variations, generates new rows or columns, and instantly executes price delta audits. Continuously powered by <span className="text-[#5B5FC7] font-normal">Alysa</span>, it compiles and deploys clean, custom-tailored XML schemas for direct integration and dynamic adjustment within <span className="text-black font-normal">Configura CET Designer</span>.
        </p>

        {/* 4. INTEGRATED MODULE CARDS - Responsive Grid (1 col on mobile, 3 cols on desktop) */}
        {/* Using compact card style and updated accent color #464775 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 w-full mb-10 md:mb-12 text-left">
          
          {/* Card XML - Updated Href and Color */}
          <Link 
            href="/WBS/Actualizer_XML_Seatings"
            className="flex flex-col bg-white/80 border border-[#E1E1E1] rounded-lg p-4 md:p-5 hover:bg-white hover:border-[#BDBDBD] hover:shadow-sm transition-all duration-200 backdrop-blur-sm"
          >
            {/* Color del icono y texto de enlace actualizado a #464775 */}
            <div className="mb-2 md:mb-3 text-[#464775]">
              <FileCode size={20} className="md:w-[22px] md:h-[22px]" />
            </div>
            <h2 className="text-sm md:text-base font-semibold mb-1 text-[#1a1a1a]">XML Actualizer</h2>
            <p className="text-[11px] md:text-xs text-[#616161] mb-4 md:mb-5 flex-grow leading-normal">Advanced management and parsing for XML format catalogs and complex workflows.</p>
            <div className="flex items-center text-[#464775] text-[11px] md:text-xs font-medium mt-auto">
              Go to module <ArrowRight className="ml-1.5" size={12} />
            </div>
          </Link>

          {/* Card Excel/CSV - Updated Href and Color */}
          <Link 
            href="/WBS/Actualizer_Excel_Seatings"
            className="flex flex-col bg-white/80 border border-[#E1E1E1] rounded-lg p-4 md:p-5 hover:bg-white hover:border-[#BDBDBD] hover:shadow-sm transition-all duration-200 backdrop-blur-sm"
          >
            {/* Color del icono y texto de enlace actualizado de verde a #464775 */}
            <div className="mb-2 md:mb-3 text-[#464775]">
              <FileSpreadsheet size={20} className="md:w-[22px] md:h-[22px]" />
            </div>
            <h2 className="text-sm md:text-base font-semibold mb-1 text-[#1a1a1a]">CSV/Excel Actualizer</h2>
            <p className="text-[11px] md:text-xs text-[#616161] mb-4 md:mb-5 flex-grow leading-normal">Processing, transformation, and normalization of structured data files.</p>
            <div className="flex items-center text-[#464775] text-[11px] md:text-xs font-medium mt-auto">
              Go to module <ArrowRight className="ml-1.5" size={12} />
            </div>
          </Link>

          {/* Card Alysa & CET Integration Hub - Updated Href and Color */}
          <Link 
            href="/WBS/Alysa_Hub_Seatings"
            className="flex flex-col bg-white/80 border border-[#E1E1E1] rounded-lg p-4 md:p-5 hover:bg-white hover:border-[#BDBDBD] hover:shadow-sm transition-all duration-200 backdrop-blur-sm"
          >
            {/* Color del icono y texto de enlace actualizado a #464775 */}
            <div className="mb-2 md:mb-3 text-[#464775]">
              <Sparkles size={20} className="md:w-[22px] md:h-[22px]" />
            </div>
            <h2 className="text-sm md:text-base font-semibold mb-1 text-[#1a1a1a]">Alysa Intelligence Hub</h2>
            <p className="text-[11px] md:text-xs text-[#616161] mb-4 md:mb-5 flex-grow leading-normal">AI-guided delta auditing, structural schema insertion, and direct synchronization with CET Designer.</p>
            <div className="flex items-center text-[#464775] text-[11px] md:text-xs font-medium mt-auto">
              Go to module <ArrowRight className="ml-1.5" size={12} />
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
              Automated Infrastructure for <span className="text-gray-900">Servex US & WBS</span>
            </p>
          </div>
 
        </div>
        
      </div>
      
    </section>
  );
};

export default HeroSection;