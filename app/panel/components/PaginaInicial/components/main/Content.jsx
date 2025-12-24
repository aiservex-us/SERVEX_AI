
'use client';
import React from 'react';
import { MousePointer2 } from 'lucide-react';

const BlogCard = ({ title, color, textColor, val }) => (
  <div className={`${color} ${textColor} p-5 rounded-xl shadow-sm flex flex-col justify-between h-48 border border-slate-200/60 hover:shadow-md transition-shadow group cursor-pointer`}>
    <div>
      <h3 className="font-bold text-md mb-2">{title}</h3>
      <p className="text-[11px] opacity-70 leading-relaxed line-clamp-3">
        {title === "Typography" 
          ? "The art and technique of arranging type to make written language legible and appealing..." 
          : "An early sample, model, or release of a product built to test a concept or process..."}
      </p>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex -space-x-2">
        {[1,2,3].map(i => (
          <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
            <img src={`https://i.pravatar.cc/100?u=${title+i}`} alt="user" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-bold">
        <MousePointer2 size={12} className={textColor === 'text-white' ? 'text-white' : 'text-[#6264A7]'} /> 
        {val}
      </div>
    </div>
  </div>
);

export default function Content() {
  return (
    <div className="space-y-6">
      
      {/* BANNER ACTUALIZADO - SERVEX CLIENT COPILOT */}
      <section className="bg-white rounded-xl p-8 flex justify-between items-center relative overflow-hidden shadow-sm border border-slate-200/60">
        
        <div className="z-10 max-w-lg">
          <h1 className="text-2xl font-extrabold mb-3 text-slate-800">
            Welcome to SERVEX Client Copilot.
          </h1>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Your centralized AI hub designed to manage and streamline all your operations. 
            Harness next-gen intelligence to simplify complex workflows and boost productivity 
            across your entire organization.
          </p>
          <div className="flex gap-3">
            <button className="bg-[#6264A7] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#4d4f8a] transition-all shadow-sm hover:shadow-md">
              Start AI Conntext
            </button>
            <a 
              href="https://servex-ai-iota.vercel.app/politicas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-slate-600 border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all inline-block text-center"
            >
              Documentation
            </a>
          </div>
        </div>
        
        {/* Decoración abstracta sutil (MISMA POSICIÓN) */}
        <div className="hidden md:block relative w-40 h-40 opacity-20">
          
          {/* Cuadro morado (igual) */}
          <div className="absolute inset-0 bg-[#6264A7] rounded-3xl rotate-12"></div>

          {/* Cuadro claro (MISMA CLASE, SOLO CONTENIDO NUEVO) */}
          <div className="absolute inset-0 bg-slate-200 rounded-3xl -rotate-6 flex flex-col items-center justify-center">
            <img
              src="/logo2.png"
              alt="SERVEX Logo"
              className="w-54 h-54 object-contain mb-1"
            />
         
          </div>

        </div>
      </section>

      {/* TRENDING */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Trending Insights
          </h2>
          <button className="text-[#6264A7] text-xs font-bold hover:underline">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BlogCard title="AI Prototyping" color="bg-white" textColor="text-slate-800" val="1.5k" />
          <BlogCard title="Machine Learning" color="bg-[#6264A7]" textColor="text-white" val="1.2k" />
          <BlogCard title="Data Analytics" color="bg-white" textColor="text-slate-800" val="1.6k" />
        </div>
      </section>
    </div>
  );
}
