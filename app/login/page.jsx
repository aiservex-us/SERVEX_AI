'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithAzure, supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FaMicrosoft } from 'react-icons/fa';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import Topography from '../components/Topography';
import ServexLogo from '../components/ServexLogo';

export default function LoginPage() {
  const router = useRouter();
  const [isHoveringTopo, setIsHoveringTopo] = useState(false);

  const handleMicrosoftLogin = async () => {
    try {
      await signInWithAzure();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const audio = new Audio('/tu-sonido.mp3');
        audio.play().catch(err => console.log("Browser blocked autoplay:", err));
        router.push('/xml-pipeline');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#dfe1e3] text-[#111111] p-3 sm:p-5 md:p-7 font-sans selection:bg-[#111111] selection:text-white">
      {/* Contenedor Principal — Estética Editorial Suiza & Topográfica de Gran Formato */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1520px] min-h-[86vh] lg:min-h-[89vh] bg-[#e6e7e9] border border-[#111111]/20 shadow-[0_36px_110px_rgba(0,0,0,0.14)] grid grid-cols-1 md:grid-cols-12 overflow-hidden relative"
      >
        {/* Esquinas arquitectónicas de precisión */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#111111] pointer-events-none z-30" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#111111] pointer-events-none z-30" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#111111] pointer-events-none z-30" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#111111] pointer-events-none z-30" />

        {/* ── COLUMNA IZQUIERDA: TOPOGRAFÍA ANIMADA EN FONDO COMPLETO + FICHA TÉCNICA SUIZA (7 COLUMNAS) ── */}
        <div
          onMouseEnter={() => setIsHoveringTopo(true)}
          onMouseLeave={() => setIsHoveringTopo(false)}
          className="hidden md:flex md:col-span-7 flex-col justify-between p-10 lg:p-14 xl:p-16 border-r border-[#111111]/15 bg-[#e3e4e6] relative overflow-hidden"
        >
          {/* Animación Topográfica WebGL ocupando el 100% del fondo de la sección izquierda */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Topography
              key="login-swiss-topo-full"
              color="#ffffff"
              lineCount={18}
              lineWidth={0.85}
              elevation={0.68}
              foreground={0.22}
              tilt={88}
              speed={isHoveringTopo ? 0.16 : 0.08}
              direction="right"
              originX={-18.4}
              originZ={24.6}
              morphOffset={2.4}
              glow={0.15}
              depthOfField={0}
              fog={0.02}
              hoverEffect="lift"
              clickEffect="peak"
              majorLines={false}
              scale={0.72}
              detail={0.65}
              morph={0.2}
              brightness={0.75}
              opacity={0.98}
              mouseInteraction={true}
              markers="plus"
              lightMode={true}
              className="w-full h-full"
            />
          </div>

          {/* Velo sutil inferior para garantizar contraste perfecto del texto sobre la animación */}
          <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-[#e3e4e6]/90 via-[#e3e4e6]/35 to-transparent" />

          {/* Cabecera Técnica Superior sobre el fondo animado */}
          <div className="relative z-10 flex items-center justify-between text-[10px] lg:text-[11px] font-mono tracking-widest uppercase text-[#111111]/70">
            <span>LAT +42.80 · LON -19.60</span>
            <span>GLYNNE // ENGINE</span>
          </div>

          {/* Ficha Editorial Inferior sobre el fondo animado (Inspirada en sistema tipográfico A:2 / M1:1000c) */}
          <div className="relative z-10 mt-auto pt-24 flex flex-col justify-end select-none">
            {/* Nivel 1: Índices de Cabecera */}
            <div className="flex items-baseline justify-between pb-2 border-b-[1.5px] border-[#111111]">
              <span className="text-sm lg:text-base font-bold tracking-tight text-[#111111]">SVX:02</span>
              <span className="text-sm lg:text-base font-bold tracking-tight font-mono text-[#111111]">M1:1000c</span>
            </div>

            {/* Nivel 2: Metadatos de Orquestación */}
            <div className="grid grid-cols-12 py-4 border-b-[1.5px] border-[#111111] text-[#111111]">
              <div className="col-span-4">
                <p className="text-sm lg:text-[15px] font-bold tracking-tight">Orchestration</p>
              </div>
              <div className="col-span-6">
                <p className="text-sm lg:text-[15px] font-bold leading-tight">Pipeline:</p>
                <p className="text-sm lg:text-[15px] font-normal leading-tight text-[#111111]/80">cet xml architecture</p>
              </div>
              <div className="col-span-2 text-right">
                <p className="text-sm lg:text-[15px] font-bold leading-tight">Node:</p>
                <p className="text-sm lg:text-[15px] font-normal leading-tight text-[#111111]/80">svx</p>
              </div>
            </div>

            {/* Nivel 3: Manifiesto Técnico y Sello Cuadrado */}
            <div className="pt-5 flex items-end justify-between gap-8">
              <div className="max-w-[360px]">
                <h2 className="text-base lg:text-lg font-bold leading-[1.15] tracking-tight text-[#111111] mb-2.5">
                  The subtle art of<br />
                  data orchestration
                </h2>
                <p className="text-[11px] lg:text-xs italic leading-relaxed text-[#111111]/75 font-serif">
                  Autonomous intelligence applied to the structural validation, matrix reconciliation, and parametric synthesis of CET Designer catalogs.
                </p>
              </div>

              <div className="flex flex-col items-end justify-between h-full gap-5 shrink-0">
                <div className="text-right font-mono text-xs lg:text-[13px] font-bold leading-tight text-[#111111]">
                  <p>24/07</p>
                  <p>2026</p>
                </div>
                <span className="w-3 h-3 bg-[#111111] inline-block" />
              </div>
            </div>
          </div>
        </div>

        {/* ── COLUMNA DERECHA: ACCESO CORPORATIVO SERVEX AI (5 COLUMNAS) ── */}
        <div className="md:col-span-5 flex flex-col justify-between p-10 sm:p-12 lg:p-16 xl:p-20 bg-[#e8e9eb] relative overflow-hidden">
          {/* Detalle topográfico minimalista en esquina superior derecha */}
          <div className="absolute -top-16 -right-16 w-64 h-64 opacity-25 pointer-events-none">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full stroke-[#111111]">
              <path d="M20 10 C50 40, 90 35, 130 70 C160 95, 175 140, 195 170" strokeWidth="1.2" />
              <path d="M40 5 C70 35, 105 30, 145 62 C170 85, 182 125, 198 150" strokeWidth="1.2" />
              <path d="M65 0 C90 28, 120 25, 158 52 C180 72, 190 105, 200 128" strokeWidth="1.2" />
              <path d="M90 0 C112 20, 138 18, 172 42 C188 58, 195 85, 200 102" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Cabecera con Logo Vectorial SERVEX */}
          <div className="relative z-10 flex items-center justify-between">
            <ServexLogo
              className="h-5 lg:h-6 w-auto text-[#111111] cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => router.push('/')}
            />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#111111]/60">
              AUTH // SSO
            </span>
          </div>

          {/* Bloque Central Editorial + Acción de Login */}
          <div className="relative z-10 my-auto py-10 max-w-md w-full mx-auto">
            <div className="pb-2.5 border-b-[1.5px] border-[#111111] flex items-baseline justify-between">
              <span className="text-base font-bold tracking-tight text-[#111111]">A:1</span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#111111]/70">
                Enterprise Node
              </span>
            </div>

            <div className="grid grid-cols-2 py-4 border-b-[1.5px] border-[#111111] mb-8">
              <div>
                <p className="text-sm lg:text-[15px] font-bold tracking-tight text-[#111111]">Access Control</p>
              </div>
              <div>
                <p className="text-xs lg:text-sm font-bold leading-tight text-[#111111]">Domain:</p>
                <p className="text-xs lg:text-sm font-normal leading-tight text-[#111111]/80">@servex-us.com</p>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.08] text-[#111111] mb-4">
              Access SERVEX AI<br />
              Platform
            </h1>

            <p className="text-xs lg:text-[13px] italic font-serif text-[#111111]/75 leading-relaxed mb-9">
              This portal provides authenticated entry to the SERVEX artificial intelligence ecosystem. Only collaborators with an authorized <strong className="font-sans not-italic font-semibold text-[#111111]">@servex-us.com</strong> corporate identity may sign in.
            </p>

            <button
              onClick={handleMicrosoftLogin}
              className="group w-full flex items-center justify-between px-6 py-4 bg-[#111111] text-white hover:bg-[#242424] active:scale-[0.99] transition-all duration-200 cursor-pointer border border-[#111111]"
            >
              <span className="flex items-center gap-3.5 text-xs lg:text-[13px] font-bold uppercase tracking-widest">
                <FaMicrosoft className="text-base" />
                Sign in with Microsoft
              </span>
              <ArrowUpRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </div>

          {/* Pie de Seguridad y Trazabilidad */}
          <div className="relative z-10 pt-5 border-t border-[#111111]/20 flex items-center justify-between text-[11px] text-[#111111]/60 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-[#111111]" />
              AUTHORIZED PERSONNEL ONLY
            </span>
            <span className="uppercase tracking-widest">GLYNNE © 2026</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
