'use client';

export default function ProductFeatures() {
  return (
    <section className="w-full bg-white py-14 sm:py-16 md:py-20 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-10 sm:mb-12 md:mb-14">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black tracking-tight">
          Engineered for 3D Data Governance
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-neutral-500">
          Parse complex XML structures, decentralize commercial editing, and inject data 
          <br className="hidden sm:block" />
          with absolute structural integrity back into CET Designer.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-4 sm:gap-6">
        {/* Left Big Card */}
        <div className="col-span-12 md:col-span-5 rounded-3xl border border-black/5 bg-[#fafafa] shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-5 sm:p-6 md:p-8 relative overflow-hidden">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-black flex items-center justify-center text-white font-bold mb-5 sm:mb-6">
            AI
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-black mb-2">
            Deterministic Translation Engine
          </h3>

          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-sm">
            Transform monolithic XML trees into universal spreadsheets. Servex Copilot orchestrates data flows using specialized AI agents, completely removing human error from code manipulation while maintaining strict software architecture rules.
          </p>

          <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 hidden min-[800px]:flex items-center gap-3">
            <span className="px-3 sm:px-4 py-1.5 text-xs rounded-full bg-white shadow-sm border border-black/10 text-black">
              ⚡ Multi-Agent System
            </span>
            <span className="w-9 h-5 bg-black rounded-full relative">
              <span className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
            </span>
          </div>
        </div>

        {/* Middle Column */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-4 sm:gap-6">
          {/* Trackers */}
          <div className="rounded-3xl border border-black/5 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-5 sm:p-6">
            <h4 className="text-sm font-medium text-black">
              Active Agent Nodes
            </h4>
            <p className="text-xs text-neutral-500 mb-4">
              04 Specialized AI Protocols Running
            </p>

            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[10px] text-white font-medium">P</div>
              <div className="w-7 h-7 rounded-full bg-neutral-600 flex items-center justify-center text-[10px] text-white font-medium">E</div>
              <div className="w-7 h-7 rounded-full bg-neutral-400 flex items-center justify-center text-[10px] text-white font-medium">A</div>
              <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] text-black font-medium">I</div>
            </div>
          </div>

          {/* Focus */}
          <div className="rounded-3xl border border-black/5 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-black">
                Structural Integrity
              </h4>
              <span className="text-xs text-neutral-400">
                CET Reliability
              </span>
            </div>

            <div className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black mb-2 tracking-tight">
              100%
            </div>

            <div className="flex justify-between text-xs text-neutral-500">
              <span>Code corruption prevented</span>
              <span>XML Validation</span>
            </div>
          </div>
        </div>

        {/* Right Big Card */}
        <div className="col-span-12 md:col-span-3 rounded-3xl border border-black/5 bg-black shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-5 sm:p-6 md:p-8 flex flex-col justify-between">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tighter">
            0
          </div>

          <div>
            <h4 className="text-sm font-medium text-white mb-1">
              Hallucination Risk
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Our AI does not guess or invent data. It executes precise ETL injections governed by immutable rules.
            </p>
          </div>
        </div>

        {/* Bottom Shortcut */}
        <div className="col-span-12 rounded-3xl border border-black/5 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-black">
              Supported Architectures
            </h4>
            <p className="text-xs text-neutral-500">
              Natively compatible with industry-standard frameworks and enterprise systems.
            </p>
          </div>

          <div className="flex gap-3 text-xs font-semibold text-black">
            <span className="px-4 py-2 rounded-xl bg-[#fafafa] border border-black/5 shadow-sm">
              XML
            </span>
            <span className="px-4 py-2 rounded-xl bg-[#fafafa] border border-black/5 shadow-sm">
              CSV
            </span>
            <span className="px-4 py-2 rounded-xl bg-[#fafafa] border border-black/5 shadow-sm">
              CET
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
