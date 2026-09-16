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
              alt="Servex Copilot Core"
              fill
              className="object-contain "
              priority
            />
          </div>

          {/* Slider label removed as per request */}
        </div>

        {/* ================= RIGHT / CONTENT ================= */}
        <div className="p-10 flex flex-col justify-center">

          {/* Header */}
          <div>
            <span className="text-xs uppercase tracking-widest text-gray-400">
              DOCUMENTATION
            </span>

            <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900">
              Project Specifications
            </h2>

            <p className="mt-4 text-sm text-gray-500 max-w-sm leading-relaxed">
              Discover the full operational scope and architecture of Servex Copilot. 
              Our documentation details how deterministic AI agents interact with 
              enterprise systems, the ETL pipelines, and our security protocols.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-10 flex items-center justify-start">
            <button 
              onClick={() => window.open('https://axglynne.com/Solutions', '_blank')}
              className="px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:scale-[1.03] hover:opacity-90 transition"
            >
              Explore Solutions
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
