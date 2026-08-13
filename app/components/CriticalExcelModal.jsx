'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, FileCode, FileSpreadsheet, ExternalLink, X } from 'lucide-react';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200/60"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-red-50 to-white px-6 py-5 border-b border-slate-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 border border-red-200/50">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Paso Crítico Requerido</h3>
                <p className="text-[13px] text-slate-500 font-medium mt-1 leading-relaxed">
                  Para utilizar este módulo correctamente, depende estrictamente de que en el sistema el XML esté actualizado.
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 bg-slate-50/50">
              {/* Feature 1 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm flex gap-4 hover:border-[#464775]/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-[#464775]/10 flex items-center justify-center shrink-0">
                  <FileCode className="w-5 h-5 text-[#464775]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#464775]">XML Actualizer</h4>
                  <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">
                    Advanced management and parsing for XML format catalogs and complex workflows.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm flex gap-4 hover:border-emerald-600/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-emerald-700">XML to Catalog Converter</h4>
                  <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">
                    Convert updated XML catalog files to standard format Excel files to send directly to your clients.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-5 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Aceptar y cerrar
              </button>
              <button
                onClick={() => router.push(xmlRoute)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[#464775] hover:bg-[#36375a] shadow-md shadow-[#464775]/20 hover:shadow-lg hover:-translate-y-px transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                Verificar en el panel de actualizacion
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
