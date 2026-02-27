'use client';
import React from 'react';
import Image from 'next/image';

const LesroAdminHero = () => {
  return (
    <div className="relative h-[90vh] w-full font-sans overflow-hidden bg-white flex">
      
      {/* Left Side (White) - Main Content */}
      <div className="w-full lg:w-[65%] h-full bg-white flex flex-col p-8 sm:p-12 lg:p-20">
        
        {/* Header / Logo Area */}
        <div className="flex items-center gap-4 mb-16 lg:mb-24">
          <div className="w-12 h-12 flex items-center justify-center">
            <img 
              src="/logosEmpresas/lesro.webp" 
              alt="LESRO Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="h-8 w-[1px] bg-black/10 mx-2" /> 
          <span className="font-semibold text-sm tracking-tight uppercase text-black/80">
            Catalog <br /> Manager
          </span>
        </div>

        {/* Hero Content */}
        <div className="max-w-2xl">
          {/* Upper Badge */}
          <span className="inline-block mb-6 rounded-full border border-black/10 px-4 py-1 text-[11px] sm:text-xs font-medium text-black/60">
            LESRO · Internal Administration Platform
          </span>

          {/* Headline with tracking-tight and font-medium */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-black leading-[1.1] mb-6">
            LESRO Catalog <br />
            <span className="text-black/40">Administration</span>
          </h2>
          
          {/* Description with softened text (text-black/60) */}
          <p className="max-w-md text-sm sm:text-base md:text-lg text-black/60 leading-relaxed mb-10">
            Centralized management for data integrity, ETL workflows, 
            and real-time updates for LESRO product catalogs within the SERVEX ecosystem.
          </p>

          {/* Rounded Button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <button className="inline-flex items-center justify-center rounded-full bg-[#464775]  px-8 py-3 text-sm font-medium text-white shadow-lg transition hover:scale-[1.03] active:scale-[0.98]">
            Insert the data
            </button>
            
            <div className="flex items-center gap-4 text-xs font-medium text-black/40">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                Data Control
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                ETL Optimized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side (Visual) */}
      <div className="hidden lg:flex w-[35%] h-full bg-[#464775] relative items-center justify-center overflow-hidden">
        {/* Minimalist Hamburger Menu */}
        <div className="absolute top-12 right-12 cursor-pointer group">
          <div className="w-6 h-[1.5px] bg-white mb-1.5 transition-all group-hover:w-8" />
          <div className="w-4 h-[1.5px] bg-white ml-auto" />
        </div>

        {/* Subtle gradient and background text */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]" />
        
        <div className="relative z-10 opacity-20 rotate-90 pointer-events-none">
          <span className="text-white font-black text-9xl tracking-tighter select-none">
            LESRO
          </span>
        </div>
      </div>

    </div>
  );
};

export default LesroAdminHero;