'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DATA = {
  cleansing: {
    label: 'Data Cleansing',
    description: 'Autonomous normalization of raw catalog data, filtering anomalies and removing structural inconsistencies instantly.',
    manualTime: '40 Hours',
    svxTime: '12 Seconds',
    savings: 99.99,
    accuracy: '100%',
    svxVisualWidth: '2%' // Minimum visual width for the bar
  },
  comparison: {
    label: 'Matrix Comparison',
    description: 'Deep matrix analysis comparing thousands of legacy pricing nodes against incoming data to detect precise variations.',
    manualTime: '80 Hours',
    svxTime: '2.5 Minutes',
    savings: 99.94,
    accuracy: '99.9%',
    svxVisualWidth: '5%'
  },
  restructuring: {
    label: 'Node Restructuring',
    description: 'Intelligent re-mapping of XML hierarchies and product attributes to match the master database schema autonomously.',
    manualTime: '120 Hours',
    svxTime: '45 Seconds',
    savings: 99.98,
    accuracy: '100%',
    svxVisualWidth: '3%'
  },
  updating: {
    label: 'XML Updating',
    description: 'Automated injection of corrected values, new SKUs, and pricing into the master XML without manual coding.',
    manualTime: '60 Hours',
    svxTime: '15 Seconds',
    savings: 99.99,
    accuracy: '100%',
    svxVisualWidth: '2%'
  },
  configuration: {
    label: 'Catalog Configuration',
    description: 'Final compiling, checksum validation, and deployment of the updated catalog engine for end-user interfaces.',
    manualTime: '20 Hours',
    svxTime: '5 Seconds',
    savings: 99.99,
    accuracy: '100%',
    svxVisualWidth: '1%'
  }
};

const PHASES = [
  { key: 'cleansing', label: 'Cleansing' },
  { key: 'comparison', label: 'Comparison' },
  { key: 'restructuring', label: 'Restructuring' },
  { key: 'updating', label: 'Updating' },
  { key: 'configuration', label: 'Configuration' }
];

export default function Chart() {
  const [mode, setMode] = useState('comparison');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current = DATA[mode];

  // Circular progress calculations
  const circumference = 2 * Math.PI * 40; // ~251.2
  const strokeDashoffset = circumference - (circumference * current.savings) / 100;

  if (!mounted) return null;

  return (
    <section className="bg-white rounded-2xl p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-slate-200/70 overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="max-w-2xl">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
            Servex Copilot · Backend Optimization Analytics
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Real-time performance metrics of XML catalog synchronization workflows. 
            Measuring the exponential time reduction powered by the SERVEX AI Python backend.
          </p>
        </div>

        {/* PHASE CONTROLS */}
        <div className="flex flex-wrap gap-2">
          {PHASES.map(phase => (
            <button
              key={phase.key}
              onClick={() => setMode(phase.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                mode === phase.key
                  ? 'bg-[#464775] text-white border-[#464775] shadow-sm scale-105'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {phase.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* INFO DE LA FASE */}
          <div className="mb-2">
            <p className="text-xs font-semibold text-[#464775] uppercase tracking-wide">
              {current.label}
            </p>
            <p className="text-xs text-slate-500 max-w-2xl">
              {current.description}
            </p>
          </div>

          {/* MODERN PRO GRAPHIC */}
          <div className="h-44 w-full relative flex items-center justify-between px-2 sm:px-8 border-t border-slate-100 pt-6 mt-4">
            
            {/* Circular Graphic (Time Saved) */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                 {/* Background Circle */}
                 <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                 {/* Animated Progress Circle */}
                 <motion.circle 
                   cx="50" cy="50" r="40" 
                   fill="none" 
                   stroke="#464775" 
                   strokeWidth="6" 
                   strokeDasharray={circumference} 
                   initial={{ strokeDashoffset: circumference }}
                   animate={{ strokeDashoffset }}
                   transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                   strokeLinecap="round"
                   className="drop-shadow-md"
                 />
               </svg>
               <div className="absolute flex flex-col items-center justify-center">
                 <motion.span 
                   initial={{ opacity: 0, scale: 0.5 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
                   className="text-[20px] font-black text-[#464775] leading-none tracking-tight"
                 >
                   {current.savings}%
                 </motion.span>
                 <span className="text-[7px] uppercase font-bold text-slate-400 tracking-widest mt-1">Time Saved</span>
               </div>
            </div>

            {/* Execution Metrics (Comparative Bars) */}
            <div className="flex-1 ml-6 sm:ml-12 space-y-6 max-w-md">
               {/* Bar 1: Manual */}
               <div>
                 <div className="flex justify-between items-end text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-wide">
                   <span>Manual Workflow</span>
                   <span className="text-[#A4262C]">{current.manualTime}</span>
                 </div>
                 <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="bg-[#A4262C]/60 w-full h-full rounded-full"
                   />
                 </div>
               </div>
               
               {/* Bar 2: SVX */}
               <div>
                 <div className="flex justify-between items-end text-[10px] text-[#464775] font-bold uppercase mb-2 tracking-wide">
                   <span className="flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                     Servex Copilot
                   </span>
                   <span className="text-emerald-600 font-black">{current.svxTime}</span>
                 </div>
                 <div className="w-full bg-[#f2f3f8] h-2.5 rounded-full overflow-hidden relative">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: current.svxVisualWidth }}
                     transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                     className="bg-[#464775] h-full rounded-full shadow-[0_0_10px_rgba(70,71,117,0.5)]"
                   />
                 </div>
               </div>
            </div>

            {/* Extra Stats Box (Accuracy) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="hidden sm:flex ml-6 sm:ml-12 bg-[#f2f3f8]/50 border border-[#f2f3f8] p-5 rounded-2xl flex-col items-center justify-center min-w-[120px] shadow-sm"
            >
               <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
                 <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
               </div>
               <span className="text-xl font-black text-slate-800 leading-none">{current.accuracy}</span>
               <span className="text-[8px] uppercase font-bold text-slate-400 mt-1.5 tracking-wider">Accuracy Rate</span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}