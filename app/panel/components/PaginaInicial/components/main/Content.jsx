'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ArrowRight, 
  Sparkles, 
  FileCode2, 
  CheckCircle2, 
  Bot, 
  Layers, 
  Activity, 
  FileSpreadsheet,
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

  const operationalCards = [
    {
      id: 'pipeline',
      tag: 'Engine Active',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'Automated XML Pipeline',
      icon: FileCode2,
      stat: '< 2.5 min',
      statLabel: 'Avg. Ingestion Cycle',
      description: 'Autonomous parsing and normalization of multi-node XML catalogs, price matrices, and dynamic SKU variations.',
      actionLabel: 'Launch Pipeline',
      action: handleLaunchPipeline,
      featured: true
    },
    {
      id: 'compliance',
      tag: 'CET · 20/20 · BIM',
      tagColor: 'bg-indigo-50 text-[#464775] border-indigo-100',
      title: 'Schema & Rule Validator',
      icon: Layers,
      stat: '99.98%',
      statLabel: 'Structural Accuracy',
      description: 'Hierarchical node re-mapping, dynamic option matrix verification, and automated checksum validation across manufacturers.',
      actionLabel: 'Inspect Schemas',
      action: handleLaunchPipeline,
      featured: false
    },
    {
      id: 'copilot',
      tag: 'Alysa AI Agent',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
      title: 'Autonomous Discrepancy Audit',
      icon: Bot,
      stat: 'Real-Time',
      statLabel: 'Triaging & Resolution',
      description: 'Predictive classification of legacy vs new pricing nodes with instant multi-format reporting and natural language queries.',
      actionLabel: 'Start AI Audit',
      action: handleOpenCopilot,
      featured: false
    }
  ];

  return (
    <div className="space-y-6 px-4 md:px-0 font-sans">
      
      {/* ENTERPRISE OPERATIONS HERO BANNER */}
      <motion.section 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-3xl p-7 md:p-10 overflow-hidden shadow-[0_10px_35px_-10px_rgba(70,71,117,0.08)] border border-[#464775]/15 bg-white"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-gradient-to-bl from-[#464775]/10 via-[#464775]/5 to-transparent rounded-full blur-3xl transform translate-x-32 -translate-y-24" />
          <div className="absolute bottom-0 left-1/3 w-[320px] h-[320px] bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        <div className="relative z-10 w-full max-w-3xl">
          
          {/* TELEMETRY STATUS PILL */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 mb-5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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

      {/* OPERATIONAL KPI CARDS SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-[#464775]" />
            <h2 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
              Core Processing Capabilities
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Autonomous Pipeline Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {operationalCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={card.action}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#464775]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Top Bar: Icon & Status Badge */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#464775] group-hover:bg-[#464775] group-hover:text-white transition-colors duration-200">
                      <Icon size={18} />
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${card.tagColor}`}>
                      {card.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-semibold text-slate-900 mb-1.5 group-hover:text-[#464775] transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[12px] text-slate-500 font-light leading-relaxed mb-4">
                    {card.description}
                  </p>
                </div>

                {/* Bottom Stats & Trigger */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[16px] font-bold text-slate-900 leading-none">
                      {card.stat}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-1">
                      {card.statLabel}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#464775] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span>{card.actionLabel}</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}