'use client';

import React, { useState } from 'react';
import InsertXML from './components/incertXML';

const IncertData = () => {
  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-4 space-y-3 font-sans bg-transparent">
      <div className="flex items-center gap-2 mb-1 pb-2 border-b border-slate-200/60">
         <h3 className="text-[13px] font-bold text-slate-700 tracking-wide uppercase">Injestión de Datos (ImportBase)</h3>
      </div>
      <div className="flex flex-col gap-3">
        
        {/* Sección de Inserción XML y CSVs */}
        <section className="relative bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="w-full">
            <InsertXML />
          </div>
        </section>

        
        
      </div>
    </div>
  );
};

export default IncertData;
