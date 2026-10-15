'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ArrowRight, 
  Sparkles, 
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Content({ setActiveView }) {
  const router = useRouter();

  const handleLaunchPipeline = () => {
    router.push('/xml-pipeline');
  };

  const handleOpenCopilot = () => {
    if (setActiveView) {
      setActiveView('products');
    } else {
      router.push('/modelContext');
    }
  };

  return (
    <div className="font-sans h-full">
      
      {/* ENTERPRISE OPERATIONS HERO BANNER */}
      <motion.section 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-3xl p-7 md:p-8 overflow-hidden shadow-[0_10px_35px_-10px_rgba(70,71,117,0.08)] border border-[#464775]/15 bg-white h-full flex flex-col justify-between"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-gradient-to-bl from-[#464775]/10 via-[#464775]/5 to-transparent rounded-full blur-3xl transform translate-x-32 -translate-y-24" />
          <div className="absolute bottom-0 left-1/3 w-[320px] h-[320px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-3xl">
          
          {/* TELEMETRY STATUS PILL */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 mb-5 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-700 tracking-wide uppercase">
              Servex Core Engine v2.4 · Pipeline Ready
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[10px] text-slate-500 font-mono">
              CET / 20-20 / BIM
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-[32px] font-normal text-slate-900 tracking-tight leading-tight mb-3">
            Operations & Catalog <br />
            <span className="font-semibold text-[#464775]">Pipeline Control Hub</span>
          </h1>

          <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-2xl mb-7 font-light">
            Centralized execution environment for high-throughput XML catalog synchronization, automated pricing matrix reconciliation, and AI-assisted discrepancy auditing across all brand tenants.
          </p>

          {/* QUICK LAUNCH ACTIONS */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleLaunchPipeline}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#464775] text-white text-xs md:text-[13px] font-semibold hover:bg-[#38395f] transition-all shadow-md shadow-[#464775]/20 hover:shadow-lg hover:shadow-[#464775]/30 hover:-translate-y-0.5 cursor-pointer"
            >
              <Zap size={15} className="text-amber-300 fill-amber-300" />
              <span>Launch XML Pipeline</span>
              <ArrowRight size={14} className="opacity-80" />
            </button>

            <button
              onClick={handleOpenCopilot}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#464775] border border-[#464775]/20 text-xs md:text-[13px] font-semibold transition-all hover:-translate-y-0.5 cursor-pointer shadow-xs"
            >
              <Sparkles size={14} className="text-[#464775]" />
              <span>Audit with Alysa Copilot</span>
            </button>

            <a
              href="https://axglynne.com/servex_espesification"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-800 text-xs md:text-[13px] font-medium transition-colors"
            >
              <span>Catalog Specs</span>
              <ExternalLink size={13} className="opacity-60" />
            </a>
          </div>

        </div>
      </motion.section>

    </div>
  );
}