'use client';

export default function ProductFeatures() {
  return (
    <section className="w-full bg-white py-14 sm:py-16 md:py-20 px-4 sm:px-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-10 sm:mb-12 md:mb-14">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black">
          Designed to Automate Your Workflow
        </h2>
        <p className="mt-3 text-xs sm:text-sm text-neutral-500">
          Centralize data, automate repetitive tasks, and transform analysis into
          <br className="hidden sm:block" />
          actionable insights — all in one intelligent platform.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-4 sm:gap-6">
        {/* Left Big Card */}
        <div className="col-span-12 md:col-span-5 rounded-3xl border border-white bg-gradient-to-br from-[#fff7f2] via-white to-[#fff] shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-5 sm:p-6 md:p-8 relative overflow-hidden">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-200 flex items-center justify-center text-white font-bold mb-5 sm:mb-6">
            S
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-black mb-2">
            Automated Integrations
          </h3>

          <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-sm">
            Seamlessly connect your tools and data sources. Servex automates data
            flows, synchronizes systems, and removes manual intervention so your
            team can focus on building, not managing processes.
          </p>

          <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6 hidden min-[800px]:flex items-center gap-3">
            <span className="px-3 sm:px-4 py-1.5 text-xs rounded-full bg-white shadow-sm border">
              ⚙ Configure
            </span>
            <span className="w-9 h-5 bg-orange-500 rounded-full relative">
              <span className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
            </span>
          </div>
        </div>

        {/* Middle Column */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-4 sm:gap-6">
          {/* Trackers */}
          <div className="rounded-3xl border border-white bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-5 sm:p-6">
            <h4 className="text-sm font-medium text-black">
              Active Data Pipelines
            </h4>
            <p className="text-xs text-neutral-500 mb-4">
              03 Automated Processes Running
            </p>

            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100" />
              <div className="w-7 h-7 rounded-full bg-purple-100" />
              <div className="w-7 h-7 rounded-full bg-yellow-100" />
            </div>
          </div>

          {/* Focus */}
          <div className="rounded-3xl border border-white bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-black">
                Automation Coverage
              </h4>
              <span className="text-xs text-purple-300">
                Efficiency Index
              </span>
            </div>

            <div className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black mb-2">
              42%
            </div>

            <div className="flex justify-between text-xs text-neutral-500">
              <span>Manual tasks reduced</span>
              <span>Monthly performance</span>
            </div>
          </div>
        </div>

        {/* Right Big Card */}
        <div className="col-span-12 md:col-span-3 rounded-3xl border border-white bg-gradient-to-br from-white via-[#fff] to-[#fff8f4] shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-5 sm:p-6 md:p-8 flex flex-col justify-between">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-black">
            10X
          </div>

          <div>
            <h4 className="text-sm font-medium text-black mb-1">
              Faster Decision Making
            </h4>
            <p className="text-xs text-neutral-500">
              Convert raw data into clear insights, enabling teams to act faster
              and develop with confidence.
            </p>
          </div>
        </div>

        {/* Bottom Shortcut */}
        <div className="col-span-12 rounded-3xl border border-white bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-black">
              Smart Shortcuts
            </h4>
            <p className="text-xs text-neutral-500">
              Access configuration, analytics, and automation tools instantly.
            </p>
          </div>

          <div className="flex gap-3 text-sm">
            <span className="px-3 py-1.5 rounded-xl bg-white border shadow-sm">
              ⌘
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white border shadow-sm">
              ⇧
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white border shadow-sm">
              M
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
