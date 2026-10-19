'use client';
import React, { useState } from 'react';
import Image from 'next/image';

const WBmfgAdminHero = () => {
  return (
    <div className="relative w-full max-w-full min-w-0 font-sans bg-transparent flex flex-col text-zinc-100 rounded-xl border border-white/10 p-4 overflow-hidden">
      <div className="flex items-start gap-3">
        {/* Compact Logo */}
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center p-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xs">
          <img 
            src="/logo.png" 
            alt="General Process Logo" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title and Badge */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-bold text-sm tracking-wide text-white">
              General Process Seating
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Platform
            </span>
          </div>
          <span className="font-medium text-[10px] tracking-wider uppercase text-zinc-400 block">
            Catalog Manager · Servex Ecosystem
          </span>

          <p className="text-[11.5px] text-zinc-300 leading-relaxed mt-2 font-normal">
            Centralized ETL workflows, automated price sync, and structure reconciliation for General Process product catalogs.
          </p>

          {/* Features Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px] font-medium text-zinc-300">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-emerald-400 font-bold">✓</span> Data Control
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-emerald-400 font-bold">✓</span> ETL Optimized
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
              <span className="text-emerald-400 font-bold">✓</span> Real-Time Audit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WBmfgAdminHero;
