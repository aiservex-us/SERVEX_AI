'use client';

import React, { useRef, useState } from 'react';
import { ChevronRight, Layers, Cpu, Boxes } from 'lucide-react';

const StatItem = ({ icon, label, value, description, isOpen, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white px-4 py-3 rounded-xl shadow-sm border cursor-pointer transition-all
      ${isOpen ? 'border-[#6264A7]/40' : 'border-slate-100 hover:border-[#6264A7]/30'}
    `}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-slate-50 text-[#6264A7] p-2 rounded-lg">
          {icon}
        </div>

        <div className="leading-tight">
          <p className="text-[9px] uppercase font-semibold text-slate-400 tracking-wider">
            {label}
          </p>
          <p className="font-semibold text-[13px] text-slate-700">
            {value}
          </p>
        </div>
      </div>

      <ChevronRight
        size={14}
        className={`transition-all text-slate-300
          ${isOpen ? 'rotate-90 text-[#6264A7]' : ''}
        `}
      />
    </div>

    {/* EXPANDED CONTENT */}
    <div
      className={`overflow-hidden transition-all duration-300
        ${isOpen ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'}
      `}
    >
      <p className="text-[11px] text-slate-500 leading-snug">
        {description}
      </p>
    </div>
  </div>
);

/* LOGOS */
const logos = [
  '/logosEmpresas/9to5 Seating - Red.svg',
  '/logosEmpresas/berner-air-curtains-seeklogo.com.svg',
  '/logosEmpresas/cropped-logo-dals.png',
  '/logosEmpresas/download (2).png',
  '/logosEmpresas/download (3).png',
  '/logosEmpresas/Haskell-logo-color-topMargin-01.svg',
  '/logosEmpresas/header_logo_hover.svg',
  '/logosEmpresas/hm-logo-caption.svg',
  '/logosEmpresas/lesro.png',
  '/logosEmpresas/logo-Ali-Group-ForLightBG.svg',
  '/logosEmpresas/logo-metalumen.png',
  '/logosEmpresas/logo.svg',
  '/logosEmpresas/LogoHeader.avif',
  '/logosEmpresas/mity-lite-logo.png',
  '/logosEmpresas/ShawFloorsLogo_Navy.png',
  '/logosEmpresas/Teknion_logo_RGB.svg',
  '/logosEmpresas/via_peach-brown-logo.webp',
  '/logosEmpresas/VIRCO_75-600x183.png'
];

export default function DashboardRight() {
  const sliderRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);

  const handleNext = () => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: 160, behavior: 'smooth' });
  };

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6">

      {/* INTERACTIVE STATS */}
      <div className="space-y-2">
        <StatItem
          icon={<Boxes size={16} />}
          label="Catalog Automation"
          value="CET · BIM · 20/20"
          description="SVX Copilot automates the creation, structuring, and maintenance of electronic catalogs for specification platforms used by manufacturers, dealers, and designers."
          isOpen={openIndex === 0}
          onClick={() => toggleItem(0)}
        />

        <StatItem
          icon={<Cpu size={16} />}
          label="AI Specification Engine"
          value="Rules · Variants · Data"
          description="AI-driven engine that interprets product rules, variants, pricing, and configuration logic to reduce human error and accelerate the technical specification process."
          isOpen={openIndex === 1}
          onClick={() => toggleItem(1)}
        />

        <StatItem
          icon={<Layers size={16} />}
          label="Product Lifecycle"
          value="Create · Update · Convert"
          description="End-to-end management of the product lifecycle: initial creation, continuous updates, and conversion across formats such as CET, Revit, 20/20, and SketchUp."
          isOpen={openIndex === 2}
          onClick={() => toggleItem(2)}
        />
      </div>

      {/* CAROUSEL */}
      <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Trusted by Companies
          </h2>

          <button
            onClick={handleNext}
            className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-[#6264A7] hover:bg-[#6264A7] hover:text-white transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div ref={sliderRef} className="flex gap-6 overflow-x-hidden scroll-smooth">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center min-w-[120px] h-12 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all"
            >
              <img
                src={logo}
                alt="Company logo"
                className="max-h-10 max-w-[110px] object-contain"
              />
            </div>
          ))}
        </div>
      </section>

      {/* PROMO SECTION: REFINED MICRO-CARD */}
      <section className="relative mt-24 mb-10 px-4 flex justify-center">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xl shadow-slate-200/60 relative flex flex-col items-center text-center max-w-[400px]">
          
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[60%] z-20">
            <img 
              src="/macMain.png" 
              alt="Expert Support" 
              className="w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.25)] transition-transform duration-500 hover:scale-105"
            />
          </div>

          <div className="h-20 w-full"></div>

          <div className="relative z-10 mt-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2 leading-snug">
              Ready to optimize your profile?
            </h2>
            
            <p className="text-slate-500 text-[13px] leading-relaxed mb-6 px-2">
              Get personalized technical assistance to ensure your digital practice looks impeccable and professional.
            </p>

            <button className="bg-[#6264A7] text-white px-6 py-2.5 rounded-xl font-bold text-[12px] hover:bg-[#4b4d8a] transition-all flex items-center justify-center gap-2 group mx-auto">
              Contact Support
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CTA */}
      <section className="bg-[#fff]/5 border border-[#6264A7]/20 rounded-xl p-6 text-center">
 
        <h3 className="text-slate-800 font-bold text-sm mb-1 uppercase tracking-tight">
          Svx Copilot Pro
        </h3>
        <p className="text-slate-500 mb-5 text-[11px] leading-tight px-2">
          AI copilot designed to automate and scale the creation, 
          maintenance, and conversion of electronic catalogs 
          within the Servex ecosystem.
        </p>
        <button className="bg-white text-slate-800 border border-slate-200 w-full py-2.5 rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm">
          Upgrade Now
        </button>
      </section>


    </div>
  );
}