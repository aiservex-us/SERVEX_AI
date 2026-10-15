'use client';

import React, { useRef, useState } from 'react';
import { 
  ChevronRight, 
  Layers, 
  Cpu, 
  Boxes, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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

/* BRAND LOGOS IN REPOSITORY */
const logos = [
  '/logosEmpresas/9to5 Seating - Red.svg',
  '/logosEmpresas/berner-air-curtains-seeklogo.com.svg',
  '/logosEmpresas/cropped-logo-dals.png',
  '/logosEmpresas/download (2).png',
  '/logosEmpresas/download (3).png',
  '/logosEmpresas/Haskell-logo-color-topMargin-01.svg',
  '/logosEmpresas/header_logo_hover.svg',
  '/logosEmpresas/hm-logo-caption.svg',
  '/logosEmpresas/lesro.png',
  '/logosEmpresas/logo-Ali-Group-ForLightBG.svg',
  '/logosEmpresas/logo-metalumen.png',
  '/logosEmpresas/logo.svg',
  '/logosEmpresas/LogoHeader.avif',
  '/logosEmpresas/mity-lite-logo.png',
  '/logosEmpresas/ShawFloorsLogo_Navy.png',
  '/logosEmpresas/Teknion_logo_RGB.svg',
  '/logosEmpresas/via_peach-brown-logo.webp',
  '/logosEmpresas/VIRCO_75-600x183.png'
];

const TENANTS = [
  { name: 'General Process Engine', code: 'XML-General', status: 'Operational', path: '/xml-pipeline' },
  { name: 'Herman Miller', code: 'HM-CAT', status: 'Active', path: '/xml-pipeline' },
  { name: 'Teknion Seating', code: 'TEK-2024', status: 'Active', path: '/xml-pipeline' },
  { name: 'DALS Lighting', code: 'DALS-XML', status: 'Active', path: '/xml-pipeline' },
  { name: 'Via Seating', code: 'VIA-CAT', status: 'Active', path: '/xml-pipeline' }
];

export default function DashboardRight({ setActiveView }) {
  const router = useRouter();
  const sliderRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);

  const handleNext = () => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: 160, behavior: 'smooth' });
  };

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6 font-sans">

      {/* CORE SPECIFICATION ARCHITECTURE */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
            Architecture Specs
          </span>
          <span className="text-[10px] text-slate-400 font-mono">v2.4 Standards</span>
        </div>

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

      {/* TRUSTED ECOSYSTEM PARTNERS */}
      <section className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
            Supported Manufacturers
          </h2>

          <button
            onClick={handleNext}
            className="w-7 h-7 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-[#464775] hover:bg-[#464775] hover:text-white transition-all cursor-pointer"
            title="Next partner"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div ref={sliderRef} className="flex gap-5 overflow-x-hidden scroll-smooth py-1">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center min-w-[100px] h-10 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all shrink-0"
            >
              <img
                src={logo}
                alt="Brand partner logo"
                className="max-h-8 max-w-[90px] object-contain"
              />
            </div>
          ))}
        </div>
      </section>

      {/* SYSTEM INFRASTRUCTURE TELEMETRY */}
      <section className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#464775]" />
            Infrastructure Status
          </h3>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-2">
              <HardDrive size={13} className="text-slate-400" />
              <span className="text-slate-600 font-medium">Supabase Storage</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-medium">
              catalogs-storage
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-2">
              <Database size={13} className="text-slate-400" />
              <span className="text-slate-600 font-medium">PostgreSQL Cluster</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-medium">
              Online · 0ms
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="flex items-center gap-2">
              <Cpu size={13} className="text-slate-400" />
              <span className="text-slate-600 font-medium">Python Processing Backend</span>
            </div>
            <span className="text-[11px] font-mono text-[#464775] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 font-medium">
              Ready
            </span>
          </div>
        </div>
      </section>

      {/* QUICK TENANT LAUNCHPAD */}
      <section className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
            Quick Pipeline Launch
          </h3>
          <span className="text-[10px] text-slate-400">Direct Access</span>
        </div>

        <div className="space-y-1.5">
          {TENANTS.map((t) => (
            <button
              key={t.code}
              onClick={() => router.push(t.path)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/60 hover:border-[#464775]/40 hover:bg-slate-50 transition-all text-left group shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-800 group-hover:text-[#464775] transition-colors">
                  {t.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-[#464775] transition-colors">
                <span className="text-[10px] font-mono">{t.code}</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        {/* Quick action to switch to Copilot */}
        <button
          onClick={() => setActiveView && setActiveView('products')}
          className="w-full mt-2 py-2.5 px-3 rounded-xl bg-[#464775] text-white text-xs font-semibold hover:bg-[#38395f] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Sparkles size={13} className="text-amber-300" />
          <span>Launch Alysa AI Auditor</span>
        </button>
      </section>

    </div>
  );
}