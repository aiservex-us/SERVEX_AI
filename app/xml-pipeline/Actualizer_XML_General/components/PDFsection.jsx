"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, Sparkles, Settings, Zap, RefreshCw, 
  FileText, GitCompare, ArrowUpRight, Info,
  BookOpen, FileUp, CheckCircle2
} from 'lucide-react';

// ✅ IMPORT DEL COMPONENTE
import CatalogParser from './comparePDF/CatalogParser';

// --- ANIMATION CONFIG ---
const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: "easeOut" }
};

// --- VIEW COMPONENTS ---
const LastCatalogContent = () => (
  <motion.div {...pageTransition} className="p-8 text-zinc-100">
    <h2 className="text-lg font-semibold mb-4 text-zinc-100">Last Uploaded Catalog</h2>
    <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center text-zinc-400 bg-white/[0.02]">
      No historical data available for preview.
    </div>
  </motion.div>
);

const CatalogUpdateContent = () => (
  <motion.div {...pageTransition} className="p-8 text-zinc-100">
    <h2 className="text-lg font-semibold mb-4 text-zinc-100">Catalog Update Editor</h2>
    <div className="p-12 border border-white/10 rounded-2xl bg-white/[0.02] text-center text-zinc-400">
      Select a product to begin editing.
    </div>
  </motion.div>
);

const ChangedProductsContent = () => (
  <motion.div {...pageTransition} className="flex-1 overflow-y-auto custom-scrollbar bg-transparent">
    <CatalogParser />
  </motion.div>
);

const LesroSyncCopilot = () => {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [context, setContext] = useState('LESRO Enterprise');
  const [activeTab, setActiveTab] = useState('SYNC'); 

  const handleStartSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setActiveTab('CHANGED'); 
      setIsSyncing(false);
    }, 1500);
  };

  const menuOptions = [
    { id: 'SYNC', label: 'Synchronization', icon: RefreshCw },
  ];

  const renderMainContent = () => {
    switch (activeTab) {
      case 'LAST_CATALOG':
        return <LastCatalogContent />;

      case 'UPDATE':
        return <CatalogUpdateContent />;

      case 'CHANGED':
        return <ChangedProductsContent />;

      case 'SYNC':
      default:
        return (
          <motion.div {...pageTransition} className="flex flex-col h-[90%] bg-transparent">
            {/* STICKY INTERNAL HEADER */}
            <div className="p-6 border-b border-white/10 bg-[#09090b]/90 sticky top-0 z-20 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 text-zinc-300 mb-1">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                      Servex US Sync Center
                    </span>
                  </div>
                  <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
                    LESRO Portfolio Adaptation
                  </h1>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Connected
                  </span>
                </div>
              </div>
            </div>
            
            {/* SCROLLABLE BODY */}
            <div className="p-8 bg-transparent flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  { title: "Data Integrity", desc: "Verifying XML structures for CET Designer compatibility.", icon: Database },
                  { title: "Neural Matching", desc: "Comparing current attributes with master library definitions.", icon: GitCompare },
                  { title: "Audit Ready", desc: "Generating delta reports for engineering approval.", icon: CheckCircle2 }
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-white/[0.02] p-6 rounded-2xl border border-white/10 transition-all hover:border-white/20 hover:bg-white/[0.04] flex flex-col items-start group shadow-sm"
                  >
                    <div className="mb-4 p-2 bg-white/5 rounded-xl border border-white/10 group-hover:bg-white/10 transition-colors">
                      <step.icon size={20} className="text-zinc-200" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-zinc-100 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[12px] leading-relaxed text-zinc-400">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Main Action Area */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-12 flex flex-col items-center text-center shadow-sm max-w-4xl mx-auto backdrop-blur-xl">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all border
                    ${isSyncing ? 'bg-white/10 border-white/20 shadow-inner' : 'bg-white/5 border-white/10 shadow-sm'}`}
                >
                  <RefreshCw 
                    size={28} 
                    className={`${isSyncing ? 'animate-spin text-white' : 'text-zinc-400'}`} 
                  />
                </div>

                <h2 className="text-xl font-semibold text-zinc-100 mb-3">
                  {isSyncing ? 'Synchronizing Servex US Data...' : 'Start Global Catalog Adaptation'}
                </h2>

                <p className="text-[13px] text-zinc-400 mb-8 max-w-sm leading-relaxed">
                  Triggers a full comparison and update cycle for the LESRO 2025 portfolio. Review changes in the Audit tab.
                </p>
                
                <button 
                  onClick={handleStartSync} 
                  disabled={isSyncing}
                  className="w-full sm:w-auto h-11 px-10 bg-white hover:bg-zinc-200 text-zinc-950 text-[14px] font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSyncing ? 'Processing Update...' : 'Start Synchronization'}
                  {!isSyncing && <ArrowUpRight size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-zinc-100 overflow-hidden">
      
      {/* Top Bar - Clean Navigation */}
      <div className="h-14 bg-[#09090b]/80 w-full flex items-center justify-between px-6 border-b border-white/10 shrink-0 z-30 backdrop-blur-xl">
        <div className="flex items-center gap-6 h-full">
          <div className="flex items-center gap-3 pr-6 border-r border-white/10">
            <div className="bg-white/10 rounded-lg px-2 py-1 border border-white/10">
              <img src="/logo2.png" alt="SVX" className="h-4 w-auto brightness-0 invert" />
            </div>
            <span className="text-[13px] font-bold text-zinc-100 tracking-tight">
              Servex Copilot
            </span>
          </div>

          <nav className="flex items-center h-full">
            {menuOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setActiveTab(option.id)}
                className={`flex items-center gap-2 px-5 h-full text-[13px] font-semibold transition-all relative shrink-0
                  ${activeTab === option.id 
                    ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <option.icon size={16} strokeWidth={activeTab === option.id ? 2.5 : 2} />
                <span>{option.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors text-zinc-400 hover:text-white">
            <Settings size={18} />
          </div>
        </div>
      </div>

      <main className="flex-1 h-[94vh] p-6 bg-transparent overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-7xl bg-[#09090b]/80 rounded-2xl border border-white/10 shadow-sm flex flex-col h-full overflow-hidden backdrop-blur-xl text-zinc-100">
          <AnimatePresence mode="wait">
            {renderMainContent()}
          </AnimatePresence>
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EDEBE9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D4D4D8; }
      `}</style>
    </div>
  );
};

export default LesroSyncCopilot;