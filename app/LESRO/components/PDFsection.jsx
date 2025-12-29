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
  <div className="p-8 text-[#242424] font-sans">
    Last Uploaded Catalog View
  </div>
);

const CatalogUpdateContent = () => (
  <div className="p-8 text-[#242424] font-sans">
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
    { id: 'LAST_CATALOG', label: 'Last Catalog', icon: BookOpen },
    { id: 'UPDATE', label: 'Catalog Update', icon: FileUp },
    { id: 'CHANGED', label: 'Changed Products', icon: GitCompare },
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
            <div className="p-6 border-b border-[#EDEBE9] bg-white sticky top-0 z-20">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-[#6264A7] mb-1">
                    <Sparkles size={14} fill="#6264A7" fillOpacity={0.2} />
                    <span className="text-[11px] font-semibold uppercase tracking-tight">
                      Servex US Sync Center
                    </span>
                  </div>
                  <h1 className="text-xl font-semibold text-[#242424] tracking-tight">
                    LESRO Portfolio Adaptation
                  </h1>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#107C10]"></div>
                  <span className="text-[11px] text-[#605E5C] font-medium">
                    Connected
                  </span>
                </div>
              </div>
            </div>
            
            {/* SCROLLABLE BODY */}
            <div className="p-8 bg-[#FFF] flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-3 gap-6 mb-10">
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
              <div className="bg-[#FFF] border border-[#EDEBE9] rounded-lg p-12 flex flex-col items-center text-center shadow-inner mb-4">
                <div
                  className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all
                    ${isSyncing ? 'bg-white shadow-md' : 'bg-[#EAEAF2]'}`}
                >
                  <RefreshCw 
                    size={32} 
                    className={isSyncing ? 'animate-spin text-[#6264A7]' : 'text-[#6264A7]'} 
                    strokeWidth={2.5}
                  />
                </div>

                <h2 className="text-xl font-semibold text-[#242424] mb-2">
                  {isSyncing ? 'Synchronizing Servex US Data...' : 'Start Global Catalog Adaptation'}
                </h2>

                <p className="text-[13px] text-[#605E5C] mb-8 max-w-md">
                  This action will trigger a full comparison and update cycle for the LESRO 2025 portfolio. Review your changes before proceeding.
                </p>
                
                <button 
                  onClick={handleStartSync} 
                  disabled={isSyncing}
                  className="h-10 px-10 bg-[#6264A7] hover:bg-[#4E52B1] active:bg-[#3B3C63] text-white text-[14px] font-semibold rounded shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncing ? 'Processing Update...' : 'Start Synchronization'}
                  {!isSyncing && <ArrowUpRight size={18} />}
                </button>
              </div>

              <div className="h-20"></div> 
            </div>
          </>
        );
    }
  };

  return (
    <div className="h-[93vh] bg-[#FFF] flex flex-col font-sans text-[#242424] overflow-hidden">
      
      {/* Top Bar */}
      <div className="h-12 bg-[#464775] w-full flex items-center justify-between px-4 text-white shrink-0 shadow-md z-30">
        <div className="flex items-center gap-4 h-full">
          <div className="flex items-center gap-2 border-r border-[#ffffff33] pr-4 h-6">
            <div className="bg-white rounded-sm p-0.5">
              <img src="/logo2.png" alt="SVX" className="h-3.5 w-auto" />
            </div>
            <span className="text-[12px] font-bold tracking-tight">
              SVX Copilot
            </span>
          </div>

          <nav className="flex items-center h-full">
            {menuOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setActiveTab(option.id)}
                className={`flex items-center gap-2 px-4 h-12 text-[12px] font-medium transition-all relative
                  ${activeTab === option.id 
                    ? 'bg-[#3b3c63] text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#C8C8E5]' 
                    : 'text-[#D1D1E0] hover:bg-[#505181] hover:text-white'
                  }`}
              >
                <option.icon size={15} strokeWidth={activeTab === option.id ? 2.5 : 2} />
                {option.label}
              </button>
            ))}
          </nav>
        </div>

        <Settings size={18} className="text-white opacity-90 cursor-pointer" />
      </div>

      <main className="flex-1 p-6 overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-7xl bg-white rounded-md shadow border border-[#EDEBE9] flex flex-col max-h-full overflow-hidden">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
};

export default LesroSyncCopilot;
