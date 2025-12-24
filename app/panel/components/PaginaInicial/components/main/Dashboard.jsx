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

    {/* CONTENIDO EXPANDIDO */}
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

      {/* STATS — INTERACTIVOS */}
      <div className="space-y-2">
        <StatItem
          icon={<Boxes size={16} />}
          label="Catalog Automation"
          value="CET · BIM · 20/20"
          description="SVX Copilot automatiza la creación, estructuración y mantenimiento de catálogos electrónicos para plataformas de especificación utilizadas por fabricantes, dealers y diseñadores."
          isOpen={openIndex === 0}
          onClick={() => toggleItem(0)}
        />

        <StatItem
          icon={<Cpu size={16} />}
          label="AI Specification Engine"
          value="Rules · Variants · Data"
          description="Motor de IA que interpreta reglas de producto, variantes, pricing y lógica de configuración para reducir errores humanos y acelerar el proceso de especificación técnica."
          isOpen={openIndex === 1}
          onClick={() => toggleItem(1)}
        />

        <StatItem
          icon={<Layers size={16} />}
          label="Product Lifecycle"
          value="Create · Update · Convert"
          description="Gestión completa del ciclo de vida del producto: creación inicial, actualizaciones continuas y conversión entre formatos como CET, Revit, 20/20 y SketchUp."
          isOpen={openIndex === 2}
          onClick={() => toggleItem(2)}
        />
      </div>

      {/* CARRUSEL */}
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

      {/* CTA PRINCIPAL */}
      <section className="bg-[#fff]/5 border border-[#6264A7]/20 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mx-auto mb-4">
          🚀
        </div>
        <h3 className="text-slate-800 font-bold text-sm mb-1 uppercase tracking-tight">
          Svx Copilot Pro
        </h3>
        <p className="text-slate-500 mb-5 text-[11px] leading-tight">
          AI copilot para automatizar y escalar la creación,
          mantenimiento y conversión de catálogos electrónicos
          dentro del ecosistema Servex.
        </p>
        <button className="bg-white text-slate-800 border border-slate-200 w-full py-2.5 rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm">
          Upgrade Now
        </button>
      </section>

      {/* NUEVA SECCIÓN: PROMO CARD CON EFECTO POP-OUT */}
      <section className="relative mt-16 pt-12">
        <div className="bg-white border border-[#6264A7]/20 rounded-2xl p-6 shadow-sm relative overflow-visible">
          {/* Imagen que sobresale */}
          <div className="absolute -top-14 right-4 w-32 h-40 pointer-events-none">
            <img 
              src="/path-to-your-image.png" // Reemplaza con tu imagen PNG sin fondo
              alt="Expert Support" 
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>

          {/* Contenido de texto en la parte baja */}
          <div className="relative z-10 pt-4">
            <h4 className="text-[#6264A7] font-bold text-sm mb-1">
              ¿Necesitas ayuda experta?
            </h4>
            <p className="text-slate-500 text-[11px] leading-snug max-w-[160px]">
              Nuestro equipo técnico está listo para ayudarte con tu integración.
            </p>
            
            <button className="mt-4 flex items-center gap-2 text-[#6264A7] font-bold text-xs hover:underline">
              Hablar con soporte <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}