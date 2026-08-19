'use client';

import React, { useState } from 'react';
import InsertXML from './incertXML_excel';
import DeleteData from '../../../Actualizer_XML_Storage/components/comparePDF/IncertData/components/delete_data';

const IncertData = ({ moduleName }) => {
  const [isModalDismissed, setIsModalDismissed] = useState(false);
  const showOverlay = !isModalDismissed;

  return (
    <div className="p-8 max-w-8xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col gap-8">
        
        {/* Sección de Inserción XML (CET) */}
        <section className="relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
          
          {/* Overlay del Logo e Information (Card) */}
          <div
            className={`hidden min-[400px]:block absolute inset-0 z-50 pointer-events-none transition-all duration-500 ease-out ${showOverlay ? 'opacity-100 backdrop-blur-[2px]' : 'opacity-0'}`}
          >
            <div className="flex items-center justify-center h-full w-full bg-white/95 p-6">
              <div className={`bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-3xl w-full max-w-4xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden relative ${showOverlay ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto' : 'translate-y-12 scale-95 opacity-0 pointer-events-none'}`}>

                <button
                  onClick={() => setIsModalDismissed(true)}
                  className="absolute top-6 right-6 p-2 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors z-20"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#7f1d1d]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                  <img
                    src="/alysa_lg.png"
                    alt="Logo"
                    className="w-72 lg:w-80 h-auto object-contain drop-shadow-2xl mb-8 transition-transform duration-700 hover:scale-105"
                  />
                  <div className="text-center">
                    <h3 className="text-[#7f1d1d] text-lg lg:text-xl font-extralight tracking-[0.25em]">
                      CET Change Development Tool
                    </h3>
                    <p className="text-slate-400 text-[9px] mt-3 font-light tracking-widest uppercase">
                      Development of new technologies · Servex transition
                    </p>
                  </div>
                </div>

                <div className="hidden lg:block w-px h-72 bg-gradient-to-b from-transparent via-slate-200 to-transparent relative z-10" />

                <div className="flex-1 flex flex-col justify-center relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7f1d1d]/5 border border-[#7f1d1d]/10 w-fit mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7f1d1d] animate-pulse" />
                    <span className="text-[9px] font-bold tracking-widest text-[#7f1d1d] uppercase">Powered by SVX</span>
                  </div>

                  <h2 className="text-2xl lg:text-3xl font-light text-slate-800 tracking-tight mb-5 leading-tight">
                    Weeks of work.<br />
                    <strong className="font-semibold text-[#7f1d1d]">Done in seconds.</strong>
                  </h2>

                  <p className="text-sm text-slate-500 leading-relaxed font-light mb-8">
                    Through a few simple actions, our system fully automates <strong className="font-medium text-slate-700">3 weeks of manual analysis, data comparison, updating, and strict verification</strong>.
                    The entire operational lifecycle that previously took weeks is now flawlessly executed in mere seconds by <strong className="font-semibold text-slate-700">Alysa Servex Copilot</strong>.
                  </p>

                  <div className="flex flex-col gap-1 mt-auto">
                    <p className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold">Proprietary Technology</p>
                    <p className="text-[10px] text-slate-500 font-light tracking-wide">Next-gen intelligence ecosystem.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-500 ease-out ${showOverlay ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
            <InsertXML moduleName={moduleName} />
          </div>
        </section>

        {/* Sección de Eliminación */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <DeleteData />
        </section>
        
      </div>
    </div>
  );
};

export default IncertData;
