"use client";

import React, { useState } from 'react';
import * as PH from "@phosphor-icons/react";
import { ChevronRight, Cpu, Microscope, Play, Info } from 'lucide-react';

// --- SUBCOMPONENTE: STAT ITEM CON ESTILO NEGATIVO ---
const StatItem = ({ icon, label, description, onClick, isActive }) => (
  <div className={`px-2.5 py-3 rounded-lg shadow-sm border transition-all ${isActive ? 'border-[#464775] bg-[#f8f8fd]' : 'border-[#464775]/20 bg-[#FFF]'}`}>
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <div className="text-[#464775]">
          {React.cloneElement(icon, { size: 16 })}
        </div>
        <span className="text-[11px] font-bold text-[#464775]">
          {label}
        </span>
      </div>
      <ChevronRight size={12} className={`rotate-90 transition-colors ${isActive ? 'text-[#464775]' : 'text-[#464775]/50'}`} />
    </div>
    
    <div className="opacity-100">
      <p className="text-[10px] text-slate-500 leading-snug border-t pt-2 border-slate-200 italic">
        {description}
      </p>
      
      {/* BOTÓN CON ESTILO NEGATIVO CUANDO ESTÁ ACTIVO */}
      <button 
        onClick={onClick}
        className={`w-full mt-3 text-[9px] font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-all shadow-sm border ${
          isActive 
            ? 'bg-white text-[#464775] border-[#464775]' // Estilo Negativo
            : 'bg-[#464775] text-white border-transparent hover:bg-[#3b3c63]' // Estilo Default
        }`}
      >
        <Play size={10} fill="currentColor" /> {isActive ? "ACTIVE MODE" : "START MODE"}
      </button>
    </div>
  </div>
);

const SidebarLeft = ({ setActiveViewport, activeViewport }) => {
  const [view, setView] = useState("process");
  const [activeModal, setActiveModal] = useState(null);

  const historyItems = [
    { id: 1, title: "Mascot Project v1.2", date: "Today", preview: "Processed 45 SKUs from PDF..." },
    { id: 2, title: "Pricing Update - Nike", date: "Yesterday", preview: "Standardization complete." },
    { id: 3, title: "Archive - Q4 Catalogs", date: "Jan 10", preview: "Ready for CET Export." },
  ];

  const ModalContent = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-[#605E5C]">
      <PH.AppWindow size={48} weight="thin" />
      <h2 className="mt-4 font-bold text-[#464775]">{title}</h2>
      <p className="text-xs opacity-60">Ready to import component from assetsTools</p>
    </div>
  );

  return (
    <>
      <aside className="w-60 sm:w-56 max-sm:w-[80vw] bg-[#FFFFFF] border-r border-[#EDEBE9] flex flex-col shadow-sm h-full font-sans">
        {/* --- BRANDING --- */}
        <div className="p-4 flex-none flex items-center gap-2 max-sm:p-3">
          <div className="w-7 h-7 bg-[#464775] rounded-lg flex items-center justify-center text-white shadow-sm">
            <PH.Sparkle size={18} weight="fill" />
          </div>
          <div>
            <span className="font-bold text-[#242424] text-sm block leading-none max-sm:text-[13px]">
              SERVEX IA
            </span>
            <span className="text-[9px] text-[#605E5C] font-medium tracking-tight max-sm:text-[8px]">
              Catalogs for Servex
            </span>
          </div>
          <div className="ml-auto text-[#605E5C] hover:bg-[#F3F2F1] p-1 rounded cursor-pointer transition-colors">
            <PH.DotsThreeOutlineVertical size={14} weight="fill" />
          </div>
        </div>

        {/* --- SEARCH --- */}
        <div className="px-3 py-1 max-sm:px-2">
          <div className="relative group">
            <PH.MagnifyingGlass className="absolute left-2.5 top-2.5 text-[#605E5C]" size={14} />
            <input 
              type="text" 
              placeholder={view === "process" ? "Search manufacturer..." : "Search history..."} 
              className="w-full bg-[#F3F2F1] border-b border-transparent focus:border-[#464775] rounded-t py-1.5 pl-8 pr-3 text-[12px] max-sm:text-[11px] outline-none transition-all placeholder:text-[#605E5C]"
            />
          </div>
        </div>

        {/* --- ACTION MODES --- */}
        <div className="flex px-3 gap-1 mt-3 max-sm:px-2">
          <button 
            onClick={() => setView("process")}
            className={`flex-1 py-1.5 rounded text-[10px] max-sm:text-[9px] font-bold transition-all ${view === "process" ? "bg-[#464775] text-white shadow-sm" : "text-[#605E5C] border border-[#EDEBE9] hover:bg-[#F3F2F1]"}`}
          >
            PROCESS
          </button>
          <button 
            onClick={() => setView("history")}
            className={`flex-1 py-1.5 rounded text-[10px] max-sm:text-[9px] font-bold transition-all ${view === "history" ? "bg-[#464775] text-white shadow-sm" : "text-[#605E5C] border border-[#EDEBE9] hover:bg-[#F3F2F1]"}`}
          >
            HISTORY
          </button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto mt-4 px-3 max-sm:px-2 max-sm:pb-6 custom-scrollbar">
          {view === "process" ? (
            <>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#605E5C]">
                  Reasoning Modes
                </span>
                <Cpu size={14} className="text-[#605E5C]" />
              </div>

              <div className="space-y-3 pb-4">
                <StatItem
                  icon={<Microscope />}
                  label="Let me explain how it works"
                  description="Deep exploration and pattern discovery across the product catalog."
                  isActive={activeViewport === "explainer"}
                  onClick={() => setActiveViewport("explainer")}
                />

                <StatItem
                  icon={<Info />}
                  label="Explore the catalog now."
                  description="Explore and analyze catalog data."
                  isActive={activeViewport === "explorer"}
                  onClick={() => setActiveViewport("explorer")}
                />

                <StatItem
                  icon={<Cpu />}
                  label="Build your audit"
                  description="Create and manage structured data audits"
                  isActive={activeViewport === "audit"}
                  onClick={() => setActiveViewport("audit")}
                />
              </div>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#605E5C]">Recent Sessions</span>
                <PH.ClockCounterClockwise size={14} className="text-[#605E5C]" />
              </div>
              <div className="space-y-1">
                {historyItems.map((item) => (
                  <div key={item.id} className="p-2 rounded-lg border border-transparent hover:border-[#EDEBE9] hover:bg-[#FAF9F8] cursor-pointer transition-all group">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-[11px] font-bold text-[#242424] truncate pr-2">{item.title}</span>
                      <span className="text-[9px] text-[#605E5C]">{item.date}</span>
                    </div>
                    <p className="text-[9px] text-[#605E5C] line-clamp-1 italic group-hover:text-[#464775]">{item.preview}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="p-3 border-t border-[#EDEBE9] space-y-1 text-[10px] font-bold text-[#484644] bg-[#FAF9F8]">
          <div className="flex items-center gap-2.5 p-1.5 cursor-pointer hover:bg-[#EDEBE9] rounded-md transition-colors text-[#107C10]">
            <PH.FileXls size={18} weight="fill" /> Export to CET Table
          </div>
          <div onClick={() => setActiveModal("Upload New PDF")} className="flex items-center gap-2.5 p-1.5 cursor-pointer hover:bg-[#EDEBE9] rounded-md transition-colors text-[#464775]">
            <PH.UploadSimple size={18} /> New Manufacturer PDF
          </div>
        </div>
      </aside>

      {/* --- MODAL SYSTEM --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white w-[90%] h-[90%] rounded-2xl shadow-2xl border border-[#EDEBE9] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex-1 overflow-auto bg-white p-6">
              <ModalContent title={activeModal} />
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full">
                <PH.X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarLeft;