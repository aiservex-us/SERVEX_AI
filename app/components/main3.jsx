import React from "react";
import Image from "next/image";

export default function TutorialBanner() {
  return (
    <section className="w-full max-w-[1200px] mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden">

        {/* ================= LEFT / SPHERE ================= */}
        <div className="relative flex items-center justify-center bg-[#fff]">
          <div className="relative w-[420px] h-[420px] md:w-[480px] md:h-[480px]">
            <Image
              src="/ball.gif" // aquí va la esfera
              alt="SVX Copilot Core"
              fill
              className="object-contain "
              priority
            />
          </div>

          {/* Slider label (estético) */}
          <div className="absolute bottom-6 left-10 right-10 flex items-center gap-3 text-xs text-gray-500">
            <span>Data</span>
            <div className="flex-1 h-px bg-gray-300" />
            <span>Models</span>
          </div>
        </div>

        {/* ================= RIGHT / CONTENT ================= */}
        <div className="p-10 flex flex-col justify-between">

          {/* Header */}
          <div>
            <span className="text-xs uppercase tracking-widest text-gray-400">
              AI CORE
            </span>

            <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900">
              SVX Copilot
            </h2>

            <p className="mt-4 text-sm text-gray-500 max-w-sm">
              SVX Copilot is the unified artificial intelligence that acts as the
              brain of the SERVEX ecosystem, coordinating data, processes, and
              automation from a single core.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-6 mt-10 text-sm">
            <div>
              <p className="text-gray-400 text-xs uppercase">Data Sync</p>
              <p className="mt-1 font-medium">Real-time</p>
            </div>

            <div>
              <p className="text-gray-400 text-xs uppercase">Scope</p>
              <p className="mt-1 font-medium">End-to-End Ops</p>
            </div>

            <div>
              <p className="text-gray-400 text-xs uppercase">Learning</p>
              <p className="mt-1 font-medium">Continuous</p>
            </div>

            <div>
              <p className="text-gray-400 text-xs uppercase">Architecture</p>
              <p className="mt-1 font-medium">Centralized AI</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase">Status</p>
              <p className="font-medium text-gray-900">Building</p>
            </div>

            <button className="px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-90 transition">
              Access SVX
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
