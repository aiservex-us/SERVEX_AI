'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, FileSpreadsheet, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CriticalExcelModal({ xmlRoute, moduleName = 'default' }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const getTheme = (mod) => {
    switch(mod) {
      case 'WBO': return { color: '#464775', bg: 'bg-[#464775]', hover: 'hover:bg-[#36375a]', text: 'text-[#464775]', grad: 'from-[#464775]/40 via-[#464775]/10', gradShape: 'from-[#464775]/80 to-[#36375a]/40', shadow: 'shadow-[#464775]/30', borderHover: 'hover:border-[#464775]/30', fill: 'bg-[#464775]/15', fillAlt: 'bg-[#464775]/5', border: 'border-[#464775]/20', shape: { borderRadius: '9999px' } };
      case 'WBT': return { color: '#003873', bg: 'bg-[#003873]', hover: 'hover:bg-[#002244]', text: 'text-[#003873]', grad: 'from-[#003873]/40 via-[#003873]/10', gradShape: 'from-[#003873]/80 to-[#002244]/40', shadow: 'shadow-[#003873]/30', borderHover: 'hover:border-[#003873]/30', fill: 'bg-[#003873]/15', fillAlt: 'bg-[#003873]/5', border: 'border-[#003873]/20', shape: { clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' } };
      case 'WBD': return { color: '#047857', bg: 'bg-[#047857]', hover: 'hover:bg-[#064e3b]', text: 'text-[#047857]', grad: 'from-[#047857]/40 via-[#047857]/10', gradShape: 'from-[#047857]/80 to-[#064e3b]/40', shadow: 'shadow-[#047857]/30', borderHover: 'hover:border-[#047857]/30', fill: 'bg-[#047857]/15', fillAlt: 'bg-[#047857]/5', border: 'border-[#047857]/20', shape: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' } };
      case 'WBS': return { color: '#b91c1c', bg: 'bg-[#b91c1c]', hover: 'hover:bg-[#7f1d1d]', text: 'text-[#b91c1c]', grad: 'from-[#b91c1c]/40 via-[#b91c1c]/10', gradShape: 'from-[#b91c1c]/80 to-[#7f1d1d]/40', shadow: 'shadow-[#b91c1c]/30', borderHover: 'hover:border-[#b91c1c]/30', fill: 'bg-[#b91c1c]/15', fillAlt: 'bg-[#b91c1c]/5', border: 'border-[#b91c1c]/20', shape: { clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)' } };
      case 'WBA': return { color: '#b45309', bg: 'bg-[#b45309]', hover: 'hover:bg-[#78350f]', text: 'text-[#b45309]', grad: 'from-[#b45309]/40 via-[#b45309]/10', gradShape: 'from-[#b45309]/80 to-[#78350f]/40', shadow: 'shadow-[#b45309]/30', borderHover: 'hover:border-[#b45309]/30', fill: 'bg-[#b45309]/15', fillAlt: 'bg-[#b45309]/5', border: 'border-[#b45309]/20', shape: { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' } };
      case 'WBG': return { color: '#7e22ce', bg: 'bg-[#7e22ce]', hover: 'hover:bg-[#581c87]', text: 'text-[#7e22ce]', grad: 'from-[#7e22ce]/40 via-[#7e22ce]/10', gradShape: 'from-[#7e22ce]/80 to-[#581c87]/40', shadow: 'shadow-[#7e22ce]/30', borderHover: 'hover:border-[#7e22ce]/30', fill: 'bg-[#7e22ce]/15', fillAlt: 'bg-[#7e22ce]/5', border: 'border-[#7e22ce]/20', shape: { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' } };
      case 'LESRO': return { color: '#334155', bg: 'bg-[#334155]', hover: 'hover:bg-[#0f172a]', text: 'text-[#334155]', grad: 'from-[#334155]/40 via-[#334155]/10', gradShape: 'from-[#334155]/80 to-[#0f172a]/40', shadow: 'shadow-[#334155]/30', borderHover: 'hover:border-[#334155]/30', fill: 'bg-[#334155]/15', fillAlt: 'bg-[#334155]/5', border: 'border-[#334155]/20', shape: { clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' } };
      default: return { color: '#464775', bg: 'bg-[#464775]', hover: 'hover:bg-[#36375a]', text: 'text-[#464775]', grad: 'from-[#464775]/40 via-[#464775]/10', gradShape: 'from-[#464775]/80 to-[#36375a]/40', shadow: 'shadow-[#464775]/30', borderHover: 'hover:border-[#464775]/30', fill: 'bg-[#464775]/15', fillAlt: 'bg-[#464775]/5', border: 'border-[#464775]/20', shape: { borderRadius: '9999px' } };
    }
  };
  const theme = getTheme(moduleName);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/20 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 15 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
          >
            {/* Left side: The beautiful 3D glass circles */}
            <div className={`hidden md:flex w-[40%] relative items-center justify-center overflow-hidden bg-gradient-to-b ${theme.grad} to-white p-10 border-r border-slate-100`}>
              
              <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15)) drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>
                {/* Shape 1 */}
                <div
                  className="absolute top-[10%] left-[-10%] w-[130px] h-[130px] backdrop-blur-md"
                  style={{
                    background: `linear-gradient(to bottom right, ${theme.color}33, rgba(255,255,255,0.1))`,
                    transform: 'rotateX(20deg) rotateY(30deg) translateZ(-80px)',
                    boxShadow: 'inset 0 0 30px rgba(255,255,255,0.4), inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 10px rgba(0,0,0,0.2)',
                    ...theme.shape
                  }}
                />
                {/* Shape 2 */}
                <div
                  className={`absolute top-[25%] left-[15%] w-[160px] h-[160px] bg-gradient-to-br ${theme.gradShape} backdrop-blur-xl z-10`}
                  style={{
                    transform: 'rotateX(30deg) rotateY(-30deg) translateZ(40px)',
                    boxShadow: 'inset 0 0 40px rgba(255,255,255,0.2), inset 2px 2px 4px rgba(255,255,255,0.4), inset -3px -3px 12px rgba(0,0,0,0.4)',
                    ...theme.shape
                  }}
                />
                {/* Shape 3 */}
                <div
                  className="absolute bottom-[25%] right-[5%] w-[140px] h-[140px] bg-white/40 backdrop-blur-lg"
                  style={{
                    transform: 'rotateX(15deg) rotateY(20deg) translateZ(10px)',
                    boxShadow: 'inset 0 0 25px rgba(255,255,255,0.6), inset 2px 2px 6px rgba(255,255,255,1), inset -2px -2px 8px rgba(0,0,0,0.05)',
                    ...theme.shape
                  }}
                />
                {/* Shape 4 (blur) */}
                <div
                  className="absolute bottom-[10%] left-[5%] w-[120px] h-[120px] backdrop-blur-2xl blur-[2px]"
                  style={{
                    backgroundColor: `${theme.color}4D`,
                    transform: 'rotateX(45deg) rotateY(15deg) translateZ(120px)',
                    boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2), inset 2px 2px 8px rgba(255,255,255,0.5)',
                    ...theme.shape
                  }}
                />
              </div>
              <div className="relative z-20 text-[#2B2C4B] mt-auto w-full">

                <ShieldCheck size={32} className={`${theme.text} mb-3`} />
                <h3 className="text-xl font-bold leading-tight mb-2">System Validation</h3>
                <p className="text-[12px] opacity-70 font-medium leading-relaxed">
                  Data processing synchronization requires active XML dependencies.
                </p>
              </div>
            </div>

            {/* Right side: The content */}
            <div className="w-full md:w-[60%] p-8 sm:p-10 flex flex-col justify-center bg-[#fcfcfd] relative">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:${theme.text} hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <span className="inline-flex items-center gap-2 rounded-full ${theme.bg}/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${theme.text} mb-4 border ${theme.border}">
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.bg} animate-pulse`} />
                  Action Required
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 mb-3">
                  Critical Step Required
                </h2>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed max-w-md">
                  This module strictly depends on the system's XML data being fully updated prior to processing.
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {/* Feature 1 */}
                <div className={`group flex gap-4 items-start p-4 bg-white rounded-2xl border border-slate-100 shadow-sm ${theme.borderHover} hover:shadow-md transition-all duration-300 cursor-default`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.fill} to-${theme.fillAlt.replace('bg-', '')} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                    <FileCode className={`w-6 h-6 ${theme.text}`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-800 tracking-tight">XML Actualizer</h4>
                    <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                      Advanced management and parsing for XML format catalogs and complex workflows.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className={`group flex gap-4 items-start p-4 bg-white rounded-2xl border border-slate-100 shadow-sm ${theme.borderHover} hover:shadow-md transition-all duration-300 cursor-default`}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <FileSpreadsheet className="w-6 h-6 text-slate-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-800 tracking-tight">XML to Catalog Converter</h4>
                    <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                      Convert updated XML catalog files to standard format Excel files to send directly to your clients.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl text-[13px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                >
                  Accept and close
                </button>
                <button
                  onClick={() => router.push(xmlRoute)}
                  className={`w-full sm:flex-1 px-6 py-3 rounded-xl text-[13px] font-bold text-white ${theme.bg} ${theme.hover} shadow-lg ${theme.shadow} hover:shadow-xl hover:-translate-y-px transition-all flex items-center justify-center gap-2 group`}
                >
                  Verify in Update Panel
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
