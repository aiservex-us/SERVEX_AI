"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Database, Sparkles, Settings, Zap, RefreshCw, 
  FileText, GitCompare, ArrowUpRight, Info,
  BookOpen, FileUp
} from 'lucide-react';

// ✅ IMPORT DEL COMPONENTE
import CatalogParser from './comparePDF/CatalogParser';

// --- VIEW COMPONENTS ---
const LastCatalogContent = () => (
  <div className="p-4 md:p-8 text-[#242424] font-sans">
    Last Uploaded Catalog View
  </div>
);

const CatalogUpdateContent = () => (
  <div className="p-4 md:p-8 text-[#242424] font-sans">
    Catalog Update Editor
  </div>
);

// ✅ CHANGED PRODUCTS AHORA MUESTRA EL COMPONENTE
const ChangedProductsContent = () => (
  <div className="flex-1 overflow-y-auto custom-scrollbar">
    <CatalogParser />
  </div>
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
        return (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <LastCatalogContent />
          </div>
        );

      case 'UPDATE':
        return (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <CatalogUpdateContent />
          </div>
        );

      case 'CHANGED':
        return (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <ChangedProductsContent />
          </div>
        );

      case 'SYNC':
      default:
        return (
          <>
            {/* STICKY INTERNAL HEADER */}
            <div className="p-4 md:p-6 border-b border-[#EDEBE9] bg-white sticky top-0 z-20">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#6264A7] mb-1">
                    <Sparkles size={14} fill="#6264A7" fillOpacity={0.2} />
                    <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-tight">
                      Servex US Sync Center
                    </span>
                  </div>
                  <h1 className="text-lg md:text-xl font-semibold text-[#242424] tracking-tight">
                    LESRO Portfolio Adaptation
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <div className="w-2 h-2 rounded-full bg-[#107C10]"></div>
                  <span className="text-[11px] text-[#605E5C] font-medium">
                    Connected
                  </span>
                </div>
              </div>
            </div>
            
            {/* SCROLLABLE BODY */}
            <div className="p-4 md:p-8 bg-[#FFF] flex-1 overflow-y-auto custom-scrollbar">
              {/* Responsive Grid: 1 col on mobile, 3 on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
                {[
                  { 
                    icon: FileText, 
                    title: "View & Edit Catalogs", 
                    desc: "Access the central Servex US database to view and edit current portfolio details, ensuring all product information is accurate before processing.", 
                    iconColor: "#0078D4" 
                  },
                  { 
                    icon: GitCompare, 
                    title: "Compare & Detect", 
                    desc: "Compare new price files against existing Servex US catalogs. Detect changes in SKUs, descriptions, and pricing tiers automatically.", 
                    iconColor: "#6264A7" 
                  },
                  { 
                    icon: Zap, 
                    title: "Sync & Update", 
                    desc: "Execute the final synchronization to update client catalogs. This process reconciles all differences and pushes the latest data live.", 
                    iconColor: "#D83B01" 
                  }
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-md border border-[#EDEBE9] shadow-sm flex flex-col items-start transition-all hover:border-[#C8C8E5] hover:shadow-md"
                  >
                    <div className="mb-4">
                      <step.icon size={22} color={step.iconColor} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[14px] font-semibold text-[#242424] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[12px] leading-relaxed text-[#605E5C]">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Main Action Area */}
              <div className="bg-[#FFF] border border-[#EDEBE9] rounded-lg p-6 md:p-12 flex flex-col items-center text-center shadow-inner mb-4">
                <div
                  className={`mx-auto w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-6 transition-all
                    ${isSyncing ? 'bg-white shadow-md' : 'bg-[#EAEAF2]'}`}
                >
                  <RefreshCw 
                    size={32} 
                    className={isSyncing ? 'animate-spin text-[#6264A7]' : 'text-[#6264A7]'} 
                    strokeWidth={2.5}
                  />
                </div>

                <h2 className="text-lg md:text-xl font-semibold text-[#242424] mb-2">
                  {isSyncing ? 'Synchronizing Servex US Data...' : 'Start Global Catalog Adaptation'}
                </h2>

                <p className="text-[12px] md:text-[13px] text-[#605E5C] mb-8 max-w-md">
                  This action will trigger a full comparison and update cycle for the LESRO 2025 portfolio. Review your changes before proceeding.
                </p>
                
                <button 
                  onClick={handleStartSync} 
                  disabled={isSyncing}
                  className="w-full sm:w-auto h-10 px-6 md:px-10 bg-[#6264A7] hover:bg-[#4E52B1] active:bg-[#3B3C63] text-white text-[14px] font-semibold rounded shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncing ? 'Processing Update...' : 'Start Synchronization'}
                  {!isSyncing && <ArrowUpRight size={18} />}
                </button>
              </div>

              <div className="h-10 md:h-20"></div> 
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen md:h-[93vh] bg-[#FFF] flex flex-col font-sans text-[#242424] overflow-hidden">
      
      {/* Top Bar */}
      <div className="h-12 bg-[#464775] w-full flex items-center justify-between px-4 text-white shrink-0 shadow-md z-30">
        <div className="flex items-center gap-2 md:gap-4 h-full overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 border-r border-[#ffffff33] pr-2 md:pr-4 h-6 shrink-0">
            <div className="bg-white rounded-sm p-0.5">
              <img src="/logo2.png" alt="SVX" className="h-3.5 w-auto" />
            </div>
            <span className="text-[11px] md:text-[12px] font-bold tracking-tight whitespace-nowrap">
              SVX Copilot
            </span>
          </div>

          <nav className="flex items-center h-full">
            {menuOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setActiveTab(option.id)}
                className={`flex items-center gap-2 px-3 md:px-4 h-12 text-[11px] md:text-[12px] font-medium transition-all relative shrink-0
                  ${activeTab === option.id 
                    ? 'bg-[#3b3c63] text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#C8C8E5]' 
                    : 'text-[#D1D1E0] hover:bg-[#505181] hover:text-white'
                  }`}
              >
                <option.icon size={15} strokeWidth={activeTab === option.id ? 2.5 : 2} />
                <span className="whitespace-nowrap">{option.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="shrink-0 ml-2">
          <Settings size={18} className="text-white opacity-90 cursor-pointer" />
        </div>
      </div>

      <main className="flex-1 p-3 md:p-6 overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-7xl bg-white rounded-md shadow border border-[#EDEBE9] flex flex-col h-full max-h-full overflow-hidden">
          {renderMainContent()}
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EDEBE9; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default LesroSyncCopilot;