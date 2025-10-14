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

export default function LesroAIPanel() {
  const fadeIn = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#FFF] p-4 md:p-8 font-sans text-[#242424]">
      <motion.div 
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="max-w-7xl mx-auto flex flex-col gap-6"
      >
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[6px] border border-[#FFF]">
          <div className="flex items-center gap-4">
            <div className="w-25 h-25 bg-[#FFF] rounded-[4px] flex items-center justify-center shadow-sm overflow-hidden p-1">
              <img 
                src="/logosEmpresas/lesro.webp" 
                alt="Lesro Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#242424] tracking-tight">Intelligence Data Hub: Lesro Automation</h1>
              <p className="text-[13px] text-[#616161] max-w-2xl mt-1">
                Intelligent catalog synchronization powered by AI engines. Automated conversion from legacy assets (PDF/CSV) to <strong>enriched XML structures</strong> for CET Designer and Catalog Creator.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-2 bg-[#F3F5F8] border border-[#EDEBE9] rounded-[4px] text-center">
              <p className="text-[10px] uppercase font-bold text-[#616161]">AI Status</p>
              <p className="text-[12px] font-semibold text-[#237B4B] flex items-center gap-1">
                <span className="w-2 h-2 bg-[#237B4B] rounded-full animate-pulse" /> Optimized
              </p>
            </div>
          </div>
        </header>

        {/* IMPACT METRICS & PROBABILITIES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card: Operational Efficiency */}
          <div className="bg-white p-5 rounded-[6px] border border-[#EDEBE9] hover:border-[#D1D1D1] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#EBF3FC] rounded-[4px]">
                <Zap className="text-[#0078D4] w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-[#237B4B]">+98% Speed</span>
            </div>
            <h3 className="text-[14px] font-semibold text-[#242424]">Upload Automation</h3>
            <p className="text-[12px] text-[#616161] mt-1">Replacing manual mapping with neural ingestion.</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-2xl font-bold">2.4s</span>
              <span className="text-[11px] text-[#616161] mb-1 pb-0.5">processing/page</span>
            </div>
          </div>

          {/* Card: Accuracy Probability */}
          <div className="bg-white p-5 rounded-[6px] border border-[#EDEBE9] hover:border-[#D1D1D1] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#F3F5F8] rounded-[4px]">
                <ShieldCheck className="text-[#464775] w-5 h-5" />
              </div>
              <BarChart3 className="text-[#616161] w-4 h-4" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#242424]">Confidence Score</h3>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 bg-[#EDEBE9] h-2 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "98.2%" }} className="h-full bg-[#464775]" />
              </div>
              <span className="text-[13px] font-bold text-[#464775]">98.2%</span>
            </div>
            <p className="text-[11px] text-[#616161] mt-2 italic text-center">Detected attribute precision</p>
          </div>

          {/* Card: Error Reduction */}
          <div className="bg-white p-5 rounded-[6px] border border-[#EDEBE9] hover:border-[#D1D1D1] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#FDF3E8] rounded-[4px]">
                <AlertCircle className="text-[#8A662E] w-5 h-5" />
              </div>
            </div>
            <h3 className="text-[14px] font-semibold text-[#242424]">Data Integrity</h3>
            <p className="text-[12px] text-[#616161] mt-1">Consistency detection in legacy catalogs.</p>
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle2 className="text-[#237B4B] w-4 h-4" />
              <span className="text-[12px] font-medium text-[#242424]">Critical XML Validation</span>
            </div>
          </div>

          {/* Card: CET Export */}
          <div className="bg-[#464775] p-5 rounded-[6px] text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[14px] font-semibold mb-1">XML Finalization</h3>
              <p className="text-[11px] text-[#EAEBFA] mb-4">Direct export for Catalog Creator without manual intervention.</p>
           
            </div>
            <Layers className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
          </div>
        </div>

        {/* DATA WORKFLOW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#EDEBE9] rounded-[6px]">
            <div className="px-6 py-4 border-b border-[#EDEBE9] flex justify-between items-center bg-[#FAF9F8]">
              <h3 className="text-[14px] font-bold flex items-center gap-2 uppercase tracking-wide">
                <ArrowRightLeft size={16} className="text-[#464775]" />
                Intelligent Sync Workflow
              </h3>
            </div>
            <div className="p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* INPUT */}
                <div className="flex flex-col items-center text-center max-w-[120px]">
                  <div className="w-16 h-16 bg-[#F3F5F8] border border-[#EDEBE9] rounded-full flex items-center justify-center mb-3">
                    <FileUp className="text-[#616161] w-8 h-8" />
                  </div>
                  <span className="text-[12px] font-bold">Legacy Input</span>
                  <span className="text-[10px] text-[#616161]">Client Annual PDF / CSV</span>
                </div>

                {/* IA ENGINE */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-[2px] bg-dashed-gradient flex items-center justify-center relative">
                    <div className="absolute inset-0 flex items-center justify-around overflow-hidden">
                       {[1,2,3,4,5].map(i => (
                         <motion.div 
                          key={i}
                          animate={{ x: [0, 100], opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                          className="w-2 h-2 bg-[#464775] rounded-full"
                         />
                       ))}
                    </div>
                  </div>
                  <div className="mt-4 px-4 py-1.5 bg-[#EAEBFA] rounded-full border border-[#464775]/20">
                    <span className="text-[10px] font-bold text-[#464775] uppercase">Servex AI Analysis Engine</span>
                  </div>
                </div>

                {/* OUTPUT */}
                <div className="flex flex-col items-center text-center max-w-[120px]">
                  <div className="w-16 h-16 bg-[#EBF3FC] border border-[#0078D4]/20 rounded-full flex items-center justify-center mb-3">
                    <FileCode className="text-[#0078D4] w-8 h-8" />
                  </div>
                  <span className="text-[12px] font-bold">XML Output</span>
                  <span className="text-[10px] text-[#616161]">Synced with CET Designer</span>
                </div>
              </div>

              {/* TECHNICAL COMPARISON BARS */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-[#F3F5F8]">
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-[#616161]">
                    <span>Price Analysis</span>
                    <span className="text-[#237B4B]">Auto</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F3F5F8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#237B4B] w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-[#616161]">
                    <span>Specs Sync</span>
                    <span className="text-[#464775]">Active</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F3F5F8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#464775] w-[85%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-[#616161]">
                    <span>SKU Validation</span>
                    <span className="text-[#242424]">100%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F3F5F8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#242424] w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CHANGE CONTROL PANEL */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-[#EDEBE9] rounded-[6px] p-5">
              <h4 className="text-[12px] font-bold text-[#616161] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database size={14} /> Trends Report
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-[#242424]">Price Adjustments</div>
                  <div className="flex items-center gap-1 text-[#237B4B] font-bold text-[13px]">
                    <TrendingUp size={14} /> +8.2%
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-[#242424]">New References</div>
                  <div className="font-bold text-[13px]">1,240 SKU</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-[#242424]">Processing Time</div>
                  <div className="text-[#464775] font-bold text-[13px]">-7.5 hrs</div>
                </div>
              </div>
            </div>

            <div className="bg-[#EBF3FC] border border-[#0078D4]/10 rounded-[6px] p-5">
              <div className="flex items-center gap-2 mb-2 text-[#005A9E]">
                <RefreshCw size={14} className="animate-spin-slow" />
                <h4 className="text-[11px] font-bold">REAL-TIME SYNCHRONIZATION</h4>
              </div>
              <p className="text-[12px] text-[#242424] leading-relaxed">
                The AI engine is currently comparing <strong>2026 PDF</strong> against <strong>2025 XML</strong>. Significant changes detected in fabric specifications.
              </p>
            </div>

            <button 
  onClick={() => window.location.href = 'https://servex-us.com/servex-online-product-configurator/'}
  className="w-full bg-white border border-[#EDEBE9] p-4 rounded-[6px] hover:bg-[#FAF9F8] transition-colors flex items-center justify-between group"
>
  <div className="flex items-center gap-3">
    <div className="p-2 bg-[#F3F5F8] rounded-[4px] group-hover:bg-[#464775] group-hover:text-white transition-colors">
      <BarChart3 size={16} />
    </div>
    <span className="text-[13px] font-semibold">View Detailed in</span>
  </div>
  <ArrowRightLeft size={14} className="text-[#616161]" />
</button>
          </div>
        </div>
      </motion.div>

      {/* CORPORATE FOOTER */}
      <footer className="max-w-7xl mx-auto mt-8 px-2 flex justify-between items-center border-t border-[#EDEBE9] pt-4">
        <p className="text-[11px] text-[#616161]">
          <strong>Servex US</strong> © 2026 | Catalog Automation System for <strong>Lesro</strong>
        </p>
        <div className="flex gap-4">
          <span className="text-[11px] font-semibold text-[#464775] cursor-pointer">Engine Documentation</span>
          <span className="text-[11px] font-semibold text-[#464775] cursor-pointer">Technical Support</span>
        </div>
      </footer>
    </div>
  );
}