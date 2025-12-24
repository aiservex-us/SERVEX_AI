'use client';

import React from 'react';

export default function Chart() {
  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Analytics Overview</h2>
          <p className="text-xs text-slate-400">Activity performance this period</p>
        </div>
        <div className="bg-slate-100 p-1 rounded-lg flex border border-slate-200">
          <button className="bg-white text-slate-800 px-4 py-1.5 rounded-md text-xs font-bold shadow-sm">Weekly</button>
          <button className="px-4 py-1.5 text-xs text-slate-500 font-bold hover:text-slate-700">Monthly</button>
        </div>
      </div>
      <div className="h-44 w-full pt-4">
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
          <path 
            d="M0,80 C50,90 80,40 120,60 C160,80 200,30 250,50 C300,70 350,20 400,40" 
            fill="none" stroke="#6264A7" strokeWidth="3" strokeLinecap="round"
          />
          <circle cx="120" cy="60" r="5" fill="#6264A7" stroke="white" strokeWidth="2" />
          <rect x="108" y="25" width="28" height="18" rx="4" fill="#1e293b" />
          <text x="112" y="37" fill="white" fontSize="8" fontWeight="bold">1.2k</text>
        </svg>
      </div>
    </section>
  );
}