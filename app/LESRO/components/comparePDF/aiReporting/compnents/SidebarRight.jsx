import React from 'react';
import * as PH from "@phosphor-icons/react";

const SidebarRight = () => {
  return (
    <aside 
      className="
        w-full sm:w-64 lg:w-72 
        bg-[#FFFFFF] border-l border-[#EDEBE9] 
        p-4 flex flex-col 
        h-full 
        overflow-y-auto 
        shadow-lg lg:shadow-none
      "
    >
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-[11px] uppercase tracking-widest text-[#242424]">
          AI Generator
        </h3>
        <PH.Info size={16} className="text-[#605E5C]" />
      </div>
      
      {/* --- Prompt --- */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#605E5C] ml-0.5">
            PROMPT
          </label>
          <textarea 
            rows={2}
            defaultValue="Robot Mood"
            className="
              w-full bg-[#FAF9F8] border border-[#EDEBE9] 
              focus:border-[#464775] 
              rounded-lg py-2 px-3 text-[12px] font-semibold 
              text-[#242424] outline-none transition-all 
              resize-none
            "
          />
        </div>

        {/* Button */}
        <button 
          className="
            w-full bg-[#464775] hover:bg-[#3b3c63] 
            text-white font-bold py-2 
            rounded-lg text-[10px] uppercase tracking-widest 
            shadow-sm transition-all
            active:scale-[0.98]
          "
        >
          GENERATE MESH
        </button>
      </div>

      {/* --- History --- */}
      <div className="mt-8 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#605E5C]">
            History
          </span>
          <PH.SquaresFour size={16} className="text-[#464775]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div 
              key={i} 
              className={`
                aspect-square rounded-xl bg-[#FAF9F8] border 
                transition-all cursor-pointer flex items-center justify-center group
                ${i === 1 
                  ? 'border-[#464775] ring-1 ring-[#464775]/20' 
                  : 'border-[#EDEBE9] hover:border-[#C8C6C4]'
                }
              `}
            >
              <div 
                className={`
                  w-8 h-8 rounded-full shadow-sm flex 
                  ${i === 1 ? 'bg-[#464775]/5' : 'bg-white'}
                `}
              >
                <PH.Cube 
                  size={14} 
                  className={`
                    m-auto 
                    ${i === 1 ? 'text-[#464775]' : 'text-[#C8C6C4]'}
                  `}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Footer Note --- */}
      <div className="mt-4 p-3 bg-[#F3F2F1] rounded-lg border border-[#EDEBE9]">
        <p className="text-[9px] text-[#605E5C] leading-tight flex gap-2">
          <PH.Sparkle 
            size={12} 
            weight="fill" 
            className="shrink-0 text-[#464775]" 
          />
          AI results require manual refinement in the editor.
        </p>
      </div>
    </aside>
  );
};

export default SidebarRight;
