"use client";
import React from "react";
import { 
  Cpu, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ArrowRightLeft,
  FileCode,
  AlertCircle,
  TrendingUp,
  BrainCircuit,
  FileUp,
  Database,
  RefreshCw,
  Layers,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

export default function WBAIPanel() {
  const fadeIn = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans text-zinc-100">
      <motion.div 
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto flex flex-col gap-6"
      >
        {/* HEADER - Ajustado para General Process */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#09090b]/80 p-6 rounded-2xl border border-white/10 shadow-sm backdrop-blur-xl text-zinc-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-sm overflow-hidden p-1">
              <img 
                src="/logo.png" 
                alt="General Process Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">Intelligence Data Hub: General Process Manufacturing</h1>
              <p className="text-[13px] text-zinc-400 max-w-2xl mt-1 font-normal leading-relaxed">
                PIM synchronization and industrial catalog orchestration. Automated transformation of manufacturing assets to <strong className="font-semibold text-zinc-200">OFDA/XML compliant structures</strong> for CET Designer integration.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Engine Status</p>
              <p className="text-[12px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Active Sync
              </p>
            </div>
          </div>
        </header>

        {/* IMPACT METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card: Operational Efficiency */}
          <div className="bg-[#09090b]/80 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all shadow-sm backdrop-blur-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <Zap className="text-cyan-400 w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-400 tracking-tight">+98% Speed</span>
            </div>
            <h3 className="text-[14px] font-bold text-zinc-100 tracking-tight">Catalog Ingestion</h3>
            <p className="text-[12px] text-zinc-400 mt-1 font-normal">Automated extraction of industrial specs and dimensions.</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-2xl font-bold tracking-tighter text-zinc-100">2.4s</span>
              <span className="text-[11px] text-zinc-400 mb-1 pb-0.5 font-medium">processing/page</span>
            </div>
          </div>

          {/* Card: Accuracy Probability */}
          <div className="bg-[#09090b]/80 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all shadow-sm backdrop-blur-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                <ShieldCheck className="text-zinc-200 w-5 h-5" />
              </div>
              <BarChart3 className="text-zinc-400 w-4 h-4" />
            </div>
            <h3 className="text-[14px] font-bold text-zinc-100 tracking-tight">Confidence Score</h3>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "98.2%" }} className="h-full bg-white" />
              </div>
              <span className="text-[13px] font-bold text-zinc-100">98.2%</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 italic text-center font-medium">Attribute detection precision</p>
          </div>

          {/* Card: Error Reduction */}
          <div className="bg-[#09090b]/80 p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all shadow-sm backdrop-blur-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <AlertCircle className="text-amber-400 w-5 h-5" />
              </div>
            </div>
            <h3 className="text-[14px] font-bold text-zinc-100 tracking-tight">General Process Data Integrity</h3>
            <p className="text-[12px] text-zinc-400 mt-1 font-normal">Consistent mapping of finishes and upcharges.</p>
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-400 w-4 h-4" />
              <span className="text-[12px] font-semibold text-zinc-200 tracking-tight">XML Validation Active</span>
            </div>
          </div>

          {/* Card: XML Export */}
          <div className="bg-[#09090b]/90 border border-white/15 p-5 rounded-2xl text-white flex flex-col justify-between relative overflow-hidden shadow-md backdrop-blur-xl">
            <div className="relative z-10">
              <h3 className="text-[14px] font-bold mb-1 tracking-tight text-zinc-100">OFDA Finalization</h3>
              <p className="text-[11px] text-zinc-400 mb-4 font-normal">Direct export for General Process digital catalogs and CET tools.</p>
            </div>
            <Layers className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 text-white" />
          </div>
        </div>

        {/* DATA WORKFLOW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#09090b]/80 border border-white/10 rounded-2xl shadow-sm overflow-hidden backdrop-blur-xl">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-[14px] font-bold flex items-center gap-2 uppercase tracking-widest text-zinc-200">
                <ArrowRightLeft size={16} className="text-white" />
                General Process Smart Sync Workflow
              </h3>
            </div>
            <div className="p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* INPUT */}
                <div className="flex flex-col items-center text-center max-w-[120px]">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-3">
                    <FileUp className="text-zinc-300 w-8 h-8" />
                  </div>
                  <span className="text-[12px] font-bold tracking-tight text-zinc-200">General Process Source</span>
                  <span className="text-[10px] text-zinc-400 font-medium">CSV / Industrial Data</span>
                </div>

                {/* IA ENGINE */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-[2px] bg-white/10 flex items-center justify-center relative">
                    <div className="absolute inset-0 flex items-center justify-around overflow-hidden">
                       {[1,2,3,4,5].map(i => (
                         <motion.div 
                          key={i}
                          animate={{ x: [0, 100], opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                          className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                         />
                       ))}
                    </div>
                  </div>
                  <div className="mt-4 px-4 py-1.5 bg-white/10 rounded-full border border-white/15">
                    <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-wider">SVX AI: General Process Logic Engine</span>
                  </div>
                </div>

                {/* OUTPUT */}
                <div className="flex flex-col items-center text-center max-w-[120px]">
                  <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center mb-3">
                    <FileCode className="text-cyan-400 w-8 h-8" />
                  </div>
                  <span className="text-[12px] font-bold tracking-tight text-zinc-200">OFDA XML</span>
                  <span className="text-[10px] text-zinc-400 font-medium">Catalog Creator Ready</span>
                </div>
              </div>

              {/* TECHNICAL COMPARISON BARS */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-400 tracking-wider">
                    <span>Grade Analysis</span>
                    <span className="text-emerald-400">Sync</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-400 tracking-wider">
                    <span>Industrial Specs</span>
                    <span className="text-zinc-200">Active</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[92%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-400 tracking-wider">
                    <span>Option Validation</span>
                    <span className="text-zinc-200">100%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-200 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHANGE CONTROL PANEL */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#09090b]/80 border border-white/10 rounded-2xl p-5 shadow-sm backdrop-blur-xl text-zinc-100">
              <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Database size={14} /> General Process Catalog Trends
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-zinc-200 font-medium">Price Upcharges</div>
                  <div className="flex items-center gap-1 text-emerald-400 font-bold text-[13px]">
                    <TrendingUp size={14} /> +4.5%
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-zinc-200 font-medium">New General Process SKUs</div>
                  <div className="font-bold text-[13px] text-zinc-100">850 SKU</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-zinc-200 font-medium">Audit Time Saved</div>
                  <div className="text-zinc-100 font-bold text-[13px] tracking-tight">-12.2 hrs</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-zinc-100 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-2 text-zinc-100">
                <RefreshCw size={14} className="animate-spin-slow text-white" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-200">General Process REAL-TIME SYNC</h4>
              </div>
              <p className="text-[12px] text-zinc-400 leading-relaxed font-normal">
                Auditing <strong className="font-semibold text-zinc-200">General Process 2026 Masters</strong> against <strong className="font-semibold text-zinc-200">Current XML Schema</strong>.
              </p>
            </div>

            <button 
              onClick={() => window.location.href = '#'}
              className="w-full bg-[#09090b]/80 border border-white/10 p-4 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-between group shadow-sm text-zinc-100 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-xl group-hover:bg-white group-hover:text-zinc-950 transition-colors">
                  <BarChart3 size={16} />
                </div>
                <span className="text-[13px] font-bold tracking-tight text-zinc-200">General Process Data Insights</span>
              </div>
              <ArrowRightLeft size={14} className="text-zinc-400" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* CORPORATE FOOTER */}
      <footer className="max-w-7xl mx-auto mt-8 px-2 flex justify-between items-center border-t border-white/10 pt-4 text-zinc-400">
        <p className="text-[11px] text-zinc-400 font-medium">
          <strong className="font-bold text-zinc-300">Servex US</strong> © 2026 | Catalog Automation for <strong className="font-bold text-zinc-300">General Process</strong>
        </p>
        <div className="flex gap-4">
          <span className="text-[11px] font-bold text-zinc-400 hover:text-white cursor-pointer hover:underline">General Process Spec Guide</span>
          <span className="text-[11px] font-bold text-zinc-400 hover:text-white cursor-pointer hover:underline">Technical Support</span>
        </div>
      </footer>
    </div>
  );
}