'use client';

import React from 'react';
import { FaArrowRight, FaStar } from 'react-icons/fa';

const HeroSection = () => {
  return (
    <section className="relative min-h-[100vh] w-full flex flex-col justify-end overflow-hidden bg-white px-6 pb-20 pt-32 md:px-16">
      
      {/* 1. IMAGEN DE FONDO BASE */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/fondo.jpg" 
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/35" />
      </div>

      {/* 2. CAPA DE DEGRADADOS, PANELES Y ESFERAS 3D */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-[#464775]/5 to-[#464775]/10" />
        
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/10 to-transparent border-l border-white/60 shadow-[1px_0_10px_rgba(0,0,0,0.03)]" />
        </div>
        <div className="absolute top-[5%] right-[15%] w-[40%] h-[100%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/5 to-transparent border-l border-white/50" />
        </div>
        <div className="absolute top-[-20%] left-[10%] w-[30%] h-[80%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/10 to-transparent border-l border-white/60" />
        </div>

        {/* Decorative Floating 3D Glass Spheres */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes float-bubble {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-25px) scale(1.02); }
            }
          `}} />
          
          {/* Sphere 1: Back left - large and soft */}
          <div 
            className="absolute top-[10%] left-[2%] w-[250px] h-[250px] rounded-full backdrop-blur-[12px]"
            style={{ 
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.5) 100%)',
              boxShadow: 'inset -15px -15px 30px rgba(70, 71, 117, 0.15), inset 10px 10px 25px rgba(255,255,255,0.9), 0 20px 40px rgba(70,71,117,0.05)',
              animation: 'float-bubble 8s ease-in-out infinite'
            }} 
          />
          {/* Sphere 2: Main center - very large, crisp */}
          <div 
            className="absolute top-[15%] left-[25%] w-[380px] h-[380px] rounded-full backdrop-blur-[16px] z-10"
            style={{ 
              background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0.7) 100%)',
              boxShadow: 'inset -25px -25px 50px rgba(70, 71, 117, 0.2), inset 15px 15px 30px rgba(255,255,255,1), 0 30px 60px rgba(70,71,117,0.1)',
              animation: 'float-bubble 12s ease-in-out infinite reverse'
            }}
          />
          {/* Sphere 3: Top right - medium size */}
          <div 
            className="absolute top-[5%] right-[15%] w-[220px] h-[220px] rounded-full backdrop-blur-[8px]"
            style={{ 
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.4) 100%)',
              boxShadow: 'inset -10px -10px 20px rgba(70, 71, 117, 0.15), inset 8px 8px 20px rgba(255,255,255,0.8), 0 15px 30px rgba(70,71,117,0.05)',
              animation: 'float-bubble 9s ease-in-out infinite 2s'
            }}
          />
          {/* Sphere 4: Bottom right - massive and slightly blurry */}
          <div 
            className="absolute bottom-[5%] right-[2%] w-[450px] h-[450px] rounded-full backdrop-blur-[20px]"
            style={{ 
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0.4) 100%)',
              boxShadow: 'inset -30px -30px 60px rgba(70, 71, 117, 0.1), inset 20px 20px 40px rgba(255,255,255,0.7), 0 40px 80px rgba(70,71,117,0.08)',
              animation: 'float-bubble 15s ease-in-out infinite 1s'
            }}
          />
          {/* Sphere 5: Foreground bottom left - smaller and out of focus */}
          <div 
            className="absolute bottom-[10%] left-[10%] w-[200px] h-[200px] rounded-full backdrop-blur-[10px] blur-[3px]"
            style={{ 
              background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.6) 100%)',
              boxShadow: 'inset -12px -12px 25px rgba(70, 71, 117, 0.2), inset 8px 8px 15px rgba(255,255,255,0.9), 0 15px 25px rgba(70,71,117,0.05)',
              animation: 'float-bubble 10s ease-in-out infinite 3s'
            }}
          />
        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL */}
      <div className="relative z-20 max-w-[100vw] mx-auto w-full">
        
        {/* Título Principal - Enfocado en Svx Copilot & Command */}
        <h1 className="text-4xl md:text-[300%] font-light text-[#1a1a1a] leading-[1.1] tracking-tighter max-w-3xl">
          <span className="font-bold">Next-Gen Orchestration:</span> <br />
          SVX Copilot & Command Engine.
        </h1>

        {/* Texto Descriptivo - Ajustado a la funcionalidad de XML y Catalog Creator */}
        <p className="text-s md:text-base lg:text-lg font-light text-gray-500 mb-12 max-w-xl md:max-w-2xl leading-relaxed">
          Automate the complexity of <span className="text-black font-normal">Catalog Creator XML architectures</span>. Our SVX Copilot delivers an ultra-sophisticated audit engine that synchronizes data pipelines directly into Configura’s ecosystem, replacing manual legacy workflows with <span className="text-black font-normal">intelligent PIM orchestration and automated XML schema validation.</span>
        </p> 

        {/* Footer del Hero */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end border-t border-gray-900/10 pt-10 font-sans">
          
          {/* Subtexto Izquierdo - Foco en XML/Catalog Creator */}
          <div className="md:col-span-4 flex items-start gap-4">
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