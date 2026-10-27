'use client';

import React from 'react';
import { FaArrowRight, FaStar } from 'react-icons/fa';
import Topography from './Topography';

const HeroSection = () => {
  return (
    <section className="relative min-h-[100vh] w-full flex flex-col justify-end overflow-hidden bg-white px-6 pb-20 pt-32 md:px-16">

      {/* ── TOPOGRAPHY WEBGL 3D ANIMATION (Pure White Background) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Topography
          color="#ffffff"
          lineCount={13}
          lineWidth={0.7}
          elevation={0.6}
          foreground={0.21}
          tilt={90}
          speed={0.12}
          direction="right"
          glow={0.3}
          depthOfField={0}
          fog={0.03}
          hoverEffect="lift"
          clickEffect="peak"
          majorLines={false}
          scale={0.6}
          detail={0.76}
          morph={0.21}
          brightness={0.7}
          opacity={0.98}
          mouseRadius={0.8}
          markers="plus"
          lightMode
          className="w-full h-full"
        />
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <div className="relative z-20 max-w-[100vw] mx-auto w-full">

        {/* Título Principal - Enfocado en Servex Copilot & Command */}
        <h1 className="text-4xl md:text-[300%] font-light text-[#1a1a1a] leading-[1.1] tracking-tighter max-w-3xl">
          <span className="font-bold">Next-Gen Orchestration:</span> <br />
          Servex Copilot & Command Engine.
        </h1>

        {/* Texto Descriptivo - Ajustado a la funcionalidad de XML y Catalog Creator */}
        <p className="hidden md:block text-s md:text-base lg:text-lg font-light text-gray-500 mb-12 max-w-xl md:max-w-2xl leading-relaxed">
          Automate the complexity of <span className="text-black font-normal">Catalog Creator XML architectures</span>. Our Servex Copilot delivers an ultra-sophisticated audit engine that synchronizes data pipelines directly into Configura’s ecosystem, replacing manual legacy workflows with <span className="text-black font-normal">intelligent PIM orchestration and automated XML schema validation.</span>
        </p>

        {/* Footer del Hero */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end border-t border-gray-900/10 pt-10 font-sans">

          {/* Subtexto Izquierdo - Foco en XML/Catalog Creator */}
          <div className="md:col-span-4 hidden md:flex items-start gap-4">
            <p className="text-[10px] md:text-[11px] text-gray-500 leading-relaxed uppercase tracking-wider font-medium">
              Eliminate manual XML editing. Deploy specialized <br className="hidden md:block" />
              pipelines for Catalog Creator data integrity.
            </p>
            <div className="mt-0.5">
              <FaArrowRight className="text-gray-400 text-[10px]" />
            </div>
          </div>

          {/* Subtexto Central - Foco en Auditoría */}
          <div className="md:col-span-4">
            <p className="text-[10px] md:text-[11px] text-gray-400 leading-relaxed uppercase tracking-wider font-medium opacity-70">
              Advanced Audit Engine to validate, synchronize, <br className="hidden md:block" />
              and deploy high-fidelity CET Designer catalogs.
            </p>
          </div>

          {/* Ratings / Trust */}
          <div className="md:col-span-4 flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-900 mr-2 uppercase tracking-tighter">Mission Critical</span>
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-[#5B5FC7] text-[8px]" />
              ))}
            </div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              Automated Infrastructure for <span className="text-gray-900">Servex US Partners</span>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;