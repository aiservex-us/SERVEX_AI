'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, FileSpreadsheet, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CriticalExcelModal({ xmlRoute }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show modal on mount with a slight delay
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
            <div className="hidden md:flex w-[40%] relative items-center justify-center overflow-hidden bg-gradient-to-b from-[#464775]/40 via-[#464775]/10 to-white p-10 border-r border-slate-100">
              <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px' }}>
                <div
                  className="absolute top-[20%] left-[10%] w-[180px] h-[180px] rounded-full bg-gradient-to-br from-[#464775]/60 to-[#464775]/20 backdrop-blur-xl border border-white/60 z-10"
                  style={{
                    transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
                    boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -4px 4px 0 #d0d0d0, -15px 15px 30px rgba(0,0,0,0.1)'
                  }}
                />
                <div
                  className="absolute bottom-[20%] right-[10%] w-[140px] h-[140px] rounded-full bg-white/40 backdrop-blur-lg border border-white/70"
                  style={{
                    transform: 'rotateX(15deg) rotateY(20deg) translateZ(0px)',
                    boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -10px 10px 20px rgba(0,0,0,0.05)'
                  }}
                />
              </div>
              <div className="relative z-20 text-[#2B2C4B] mt-auto w-full">
                <ShieldCheck size={32} className="text-[#464775] mb-3" />
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
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-[#464775] hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#464775]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#464775] mb-4 border border-[#464775]/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#464775] animate-pulse" />
                  Action Required
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 mb-3">
                  Paso Crítico Requerido
                </h2>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed max-w-md">
                  Para utilizar este módulo correctamente, depende estrictamente de que en el sistema el XML esté actualizado.
                </p>
              </div>

              <div className="space-y-4 mb-10">
                {/* Feature 1 */}
                <div className="group flex gap-4 items-start p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-[#464775]/30 hover:shadow-md transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#464775]/10 to-[#464775]/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <FileCode className="w-6 h-6 text-[#464775]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-slate-800 tracking-tight">XML Actualizer</h4>
                    <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
                      Advanced management and parsing for XML format catalogs and complex workflows.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="group flex gap-4 items-start p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-[#464775]/30 hover:shadow-md transition-all duration-300 cursor-default">
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
                  Aceptar y cerrar
                </button>
                <button
                  onClick={() => router.push(xmlRoute)}
                  className="w-full sm:flex-1 px-6 py-3 rounded-xl text-[13px] font-bold text-white bg-[#464775] hover:bg-[#36375a] shadow-lg shadow-[#464775]/25 hover:shadow-xl hover:-translate-y-px transition-all flex items-center justify-center gap-2 group"
                >
                  Verificar en el panel de actualizacion
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
