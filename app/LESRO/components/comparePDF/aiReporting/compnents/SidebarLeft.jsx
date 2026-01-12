"use client";

import React, { useState } from 'react';
import * as PH from "@phosphor-icons/react";

const SidebarLeft = () => {
  const [view, setView] = useState("process");
  const [activeModal, setActiveModal] = useState(null);
  const closeModal = () => setActiveModal(null);

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
      {/* --- SIDEBAR LEFT RESPONSIVE --- */}
      <aside className="
        w-60 
        sm:w-56 
        max-sm:w-[80vw] 
        bg-[#FFFFFF] 
        border-r border-[#EDEBE9] 
        flex flex-col 
        shadow-sm 
        h-full
      ">
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
              className="
                w-full bg-[#F3F2F1] 
                border-b border-transparent 
                focus:border-[#464775] 
                rounded-t 
                py-1.5 pl-8 pr-3 
                text-[12px] max-sm:text-[11px]
                outline-none transition-all
                placeholder:text-[#605E5C]
              "
            />
          </div>
        </div>

        {/* --- ACTION MODES --- */}
        <div className="flex px-3 gap-1 mt-3 max-sm:px-2">
          <button 
            onClick={() => setView("process")}
            className={`
              flex-1 py-1.5 rounded text-[10px] max-sm:text-[9px] font-bold transition-all
              ${view === "process" 
                ? "bg-[#464775] text-white shadow-sm" 
                : "text-[#605E5C] border border-[#EDEBE9] hover:bg-[#F3F2F1]"
              }
            `}
          >
            PROCESS
          </button>
          <button 
            onClick={() => setView("history")}
            className={`
              flex-1 py-1.5 rounded text-[10px] max-sm:text-[9px] font-bold transition-all
              ${view === "history" 
                ? "bg-[#464775] text-white shadow-sm" 
                : "text-[#605E5C] border border-[#EDEBE9] hover:bg-[#F3F2F1]"
              }
            `}
          >
            HISTORY
          </button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 overflow-y-auto mt-4 px-3 max-sm:px-2 max-sm:pb-6">
          {view === "process" ? (
            <>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] max-sm:text-[9px] font-bold uppercase tracking-widest text-[#605E5C]">
                  Pipeline
                </span>
                <PH.GearSix size={14} className="text-[#605E5C]" />
              </div>

              <div className="space-y-0.5 mb-4">
                <div 
                  onClick={() => setActiveModal("Extraction (OCR)")} 
                  className="
                    flex items-center gap-2 px-2 py-1.5 rounded-md 
                    text-[12px] max-sm:text-[11px]
                    text-[#484644] hover:bg-[#F3F2F1] cursor-pointer group
                  "
                >
                  <PH.FilePdf size={16} className="text-[#E03131]" /> 
                  Extraction (OCR)
                </div>

                <div 
                  onClick={() => setActiveModal("Normalization Engine")} 
                  className="
                    flex items-center gap-2 px-2 py-1.5 
                    bg-[#F3F2F1] text-[#464775] rounded-md 
                    text-[12px] max-sm:text-[11px]
                    font-bold border-l-2 border-[#464775] cursor-pointer
                  "
                >
                  <PH.Table size={16} weight="fill" /> 
                  Normalization Engine
                </div>

                <div 
                  onClick={() => setActiveModal("Validation Layer")} 
                  className="
                    flex items-center gap-2 px-2 py-1.5 rounded-md 
                    text-[12px] max-sm:text-[11px]
                    text-[#484644] hover:bg-[#F3F2F1] cursor-pointer
                  "
                >
                  <PH.CheckCircle size={16} className="text-[#107C10]" /> 
                  Validation Layer
                </div>
              </div>

              <span className="text-[10px] max-sm:text-[9px] font-bold uppercase tracking-widest text-[#605E5C] px-1">
                Optimization Tools
              </span>

              <div className="mt-2 space-y-0.5 text-[12px] max-sm:text-[11px]">
                <div 
                  onClick={() => setActiveModal("SKU Unification")}
                  className="flex items-center justify-between px-2 py-1.5 hover:bg-[#F3F2F1] rounded-md cursor-pointer text-[#484644]"
                >
                  <div className="flex items-center gap-2.5">
                    <PH.Hash size={16} /> 
                    SKU Unification
                  </div>
                </div>

                <div 
                  onClick={() => setActiveModal("Units Converter")}
                  className="flex items-center justify-between px-2 py-1.5 hover:bg-[#F3F2F1] rounded-md cursor-pointer text-[#484644]"
                >
                  <div className="flex items-center gap-2.5">
                    <PH.Ruler size={16} /> 
                    Units Converter
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] max-sm:text-[9px] font-bold uppercase tracking-widest text-[#605E5C]">
                  Recent Sessions
                </span>
                <PH.ClockCounterClockwise size={14} className="text-[#605E5C]" />
              </div>

              <div className="space-y-1">
                {historyItems.map((item) => (
                  <div 
                    key={item.id}
                    className="
                      p-2.5 max-sm:p-2 rounded-lg 
                      border border-transparent 
                      hover:border-[#EDEBE9] hover:bg-[#FAF9F8]
                      cursor-pointer transition-all group
                    "
                  >
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="text-[12px] max-sm:text-[11px] font-bold text-[#242424] truncate pr-2">
                        {item.title}
                      </span>
                      <span className="text-[9px] text-[#605E5C] whitespace-nowrap">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-[10px] max-sm:text-[9px] text-[#605E5C] line-clamp-1 italic group-hover:text-[#464775]">
                      {item.preview}
                    </p>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 text-[10px] max-sm:text-[9px] font-bold text-[#464775] hover:underline">
                View full activity log
              </button>
            </div>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="p-3 border-t border-[#EDEBE9] space-y-1 text-[11px] max-sm:text-[10px] font-bold text-[#484644] bg-[#FAF9F8]">
          <div className="flex items-center gap-2.5 p-1.5 cursor-pointer hover:bg-[#EDEBE9] rounded-md transition-colors text-[#107C10]">
            <PH.FileXls size={18} weight="fill" /> 
            Export to CET Table
          </div>

          <div 
            onClick={() => setActiveModal("Upload New PDF")} 
            className="flex items-center gap-2.5 p-1.5 cursor-pointer hover:bg-[#EDEBE9] rounded-md transition-colors text-[#464775]"
          >
            <PH.UploadSimple size={18} /> 
            New Manufacturer PDF
          </div>
        </div>
      </aside>

      {/* --- MODAL SYSTEM --- */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white w-[90%] h-[90%] rounded-2xl shadow-2xl border border-[#EDEBE9] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDEBE9] bg-[#FAF9F8]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#464775] rounded flex items-center justify-center text-white">
                  <PH.Sparkle size={14} weight="fill" />
                </div>
                <span className="font-bold text-sm text-[#242424] tracking-tight">
                  {activeModal}
                </span>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-[#EDEBE9] rounded-full transition-colors">
                <PH.X size={20} className="text-[#605E5C]" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-white p-6">
              <ModalContent title={activeModal} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidebarLeft;
