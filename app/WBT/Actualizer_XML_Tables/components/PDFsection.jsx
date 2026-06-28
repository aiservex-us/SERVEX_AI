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
  <motion.div {...pageTransition} className="p-8 text-[#242424]">
    <h2 className="text-lg font-semibold mb-4">Last Uploaded Catalog</h2>
    <div className="p-12 border border-dashed border-[#EDEBE9] rounded-lg text-center text-[#616161]">
      No historical data available for preview.
    </div>
  </motion.div>
);

const CatalogUpdateContent = () => (
  <motion.div {...pageTransition} className="p-8 text-[#242424]">
    <h2 className="text-lg font-semibold mb-4">Catalog Update Editor</h2>
    <div className="p-12 border border-[#EDEBE9] rounded-lg bg-[#F5F5F5] text-center text-[#616161]">
      Select a product to begin editing.
    </div>
  </motion.div>
);

const ChangedProductsContent = () => (
  <motion.div {...pageTransition} className="flex-1 overflow-y-auto custom-scrollbar bg-white">
    <CatalogParser />
  </motion.div>
);

const WBTSyncCopilot = () => {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [context, setContext] = useState('WBT Enterprise');
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
          <motion.div {...pageTransition} className="flex flex-col h-[90%] bg-white">
            {/* STICKY INTERNAL HEADER */}
            <div className="p-6 border-b border-[#EDEBE9] bg-white sticky top-0 z-20">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#464775] mb-1">
                    <Sparkles size={14} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Servex US Sync Center
                    </span>
                  </div>
                  <h1 className="text-xl font-semibold text-[#242424] tracking-tight">
                    WBT Portfolio Adaptation
                  </h1>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#fff] rounded-full border border-[#EDEBE9]">
                  <div className="w-2 h-2 rounded-full bg-[#107C10]"></div>
                  <span className="text-[11px] text-[#616161] font-semibold uppercase">
                    Connected
                  </span>
                </div>
              </div>
            </div>
            
            {/* SCROLLABLE BODY */}
            <div className="p-8 bg-white flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  { title: "Data Integrity", desc: "Verifying XML structures for CET Designer compatibility.", icon: Database },
                  { title: "Neural Matching", desc: "Comparing current attributes with master library definitions.", icon: GitCompare },
                  { title: "Audit Ready", desc: "Generating delta reports for engineering approval.", icon: CheckCircle2 }
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-lg border border-[#EDEBE9] transition-all hover:border-[#464775]/30 hover:shadow-sm flex flex-col items-start group"
                  >
                    <div className="mb-4 p-2 bg-[#F5F5F5] rounded-md group-hover:bg-[#464775]/5 transition-colors">
                      <step.icon size={20} className="text-[#464775]" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-[#242424] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[12px] leading-relaxed text-[#616161]">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Main Action Area */}
              <div className="bg-white border border-[#EDEBE9] rounded-xl p-12 flex flex-col items-center text-center shadow-sm max-w-4xl mx-auto">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all border
                    ${isSyncing ? 'bg-[#F5F5F5] border-[#464775]/20 shadow-inner' : 'bg-white border-[#EDEBE9] shadow-sm'}`}
                >
                  <RefreshCw 
                    size={28} 
                    className={`${isSyncing ? 'animate-spin text-[#464775]' : 'text-[#616161]'}`} 
                  />
                </div>

                <h2 className="text-xl font-semibold text-[#242424] mb-3">
                  {isSyncing ? 'Synchronizing Servex US Data...' : 'Start Global Catalog Adaptation'}
                </h2>

                <p className="text-[13px] text-[#616161] mb-8 max-w-sm leading-relaxed">
                  Triggers a full comparison and update cycle for the WBT 2025 portfolio. Review changes in the Audit tab.
                </p>
                
                <button 
                  onClick={handleStartSync} 
                  disabled={isSyncing}
                  className="w-full sm:w-auto h-11 px-10 bg-[#464775] hover:bg-[#38395d] text-white text-[14px] font-semibold rounded-md shadow-md shadow-[#464775]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
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
    <div className="min-h-screen bg-white flex flex-col font-sans text-[#242424] overflow-hidden">
      
      {/* Top Bar - Clean White Navigation */}
      <div className="h-14 bg-white w-full flex items-center justify-between px-6 border-b border-[#EDEBE9] shrink-0 z-30">
        <div className="flex items-center gap-6 h-full">
          <div className="flex items-center gap-3 pr-6 border-r border-[#EDEBE9]">
            <div className="bg-[#464775] rounded px-1.5 py-1">
              <img src="/logo2.png" alt="SVX" className="h-4 w-auto brightness-0 invert" />
            </div>
            <span className="text-[13px] font-bold text-[#242424] tracking-tight">
              SVX Copilot
            </span>
          </div>

          <nav className="flex items-center h-full">
            {menuOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setActiveTab(option.id)}
                className={`flex items-center gap-2 px-5 h-full text-[13px] font-semibold transition-all relative shrink-0
                  ${activeTab === option.id 
                    ? 'text-[#464775] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#464775]' 
                    : 'text-[#616161] hover:text-[#242424] hover:bg-[#F5F5F5]'
                  }`}
              >
                <option.icon size={16} strokeWidth={activeTab === option.id ? 2.5 : 2} />
                <span>{option.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-md hover:bg-[#F5F5F5] flex items-center justify-center cursor-pointer transition-colors text-[#616161]">
            <Settings size={18} />
          </div>
        </div>
      </div>

      <main className="flex-1 h-[94vh] p-6 bg-[#fff] overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-7xl bg-white rounded-lg border border-[#EDEBE9] shadow-sm flex flex-col h-full overflow-hidden">
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D1E0; }
      `}</style>
    </div>
  );
};

export default WBTSyncCopilot;