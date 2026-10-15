'use client';

import React, { useState } from 'react';
import { 
  ChevronRight, 
  Layers, 
  Cpu, 
  Boxes 
} from 'lucide-react';
import Products from './AccesAgent';

const StatItem = ({ icon, label, value, description, isOpen, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white px-4 py-3 rounded-2xl shadow-xs border cursor-pointer transition-all ${
      isOpen ? 'border-[#464775]/50 bg-slate-50/50' : 'border-slate-200/80 hover:border-[#464775]/30'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 text-[#464775] flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div className="leading-tight">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            {label}
          </p>
          <p className="text-xs font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>

      <ChevronRight
        size={14}
        className={`transition-transform text-slate-400 ${
          isOpen ? 'rotate-90 text-[#464775]' : ''
        }`}
      />
    </div>

    {/* EXPANDED CONTENT */}
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? 'max-h-40 mt-3 pt-3 border-t border-slate-100 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <p className="text-[11px] text-slate-500 font-light leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

export function ArchitectureSpecs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-7 shadow-[0_10px_35px_-10px_rgba(70,71,117,0.08)] border border-slate-200/90 font-sans h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
          Architecture Specs
        </span>
        <span className="text-[10px] text-slate-400 font-mono">v2.4 Standards</span>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <StatItem
          icon={<Boxes size={16} />}
          label="Catalog Automation"
          value="CET · BIM · 20/20"
          description="Automates the generation, structuring, and ongoing maintenance of electronic XML catalogs compliant with global design and specification platforms."
          isOpen={openIndex === 0}
          onClick={() => toggleItem(0)}
        />

        <StatItem
          icon={<Cpu size={16} />}
          label="AI Specification Engine"
          value="Rules · Variants · Pricing"
          description="Autonomous engine that interprets product rules, matrix variants, option pricing, and hierarchical logic to eliminate manual specification errors."
          isOpen={openIndex === 1}
          onClick={() => toggleItem(1)}
        />

        <StatItem
          icon={<Layers size={16} />}
          label="Product Lifecycle"
          value="Ingest · Validate · Deploy"
          description="End-to-end management of the catalog lifecycle: raw file ingestion, price reconciliation, and automated deployment across CET, Revit, and 20/20."
          isOpen={openIndex === 2}
          onClick={() => toggleItem(2)}
        />
      </div>
    </div>
  );
}

export default function DashboardRight() {
  return (
    <div className="space-y-6 font-sans">
      <ArchitectureSpecs />

      {/* EMBEDDED ALYSA COPILOT CHAT */}
      <section className="w-full h-[580px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-[0_10px_35px_-10px_rgba(70,71,117,0.08)] relative bg-white flex flex-col">
        <Products isFloating={false} />
      </section>
    </div>
  );
}