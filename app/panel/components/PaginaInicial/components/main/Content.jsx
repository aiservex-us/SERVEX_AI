'use client';
import React, { useState } from 'react';
import { MousePointer2, Zap, Target, BarChart3 } from 'lucide-react';

// Componente BlogCard mejorado con estados interactivos y contenido de SVX
const BlogCard = ({ title, description, val, isActive, onClick, icon: Icon }) => (
  <div 
    onClick={onClick}
    className={`p-5 rounded-xl shadow-sm flex flex-col justify-between h-48 border transition-all duration-300 cursor-pointer group ${
      isActive 
        ? 'bg-[#6264A7] border-[#6264A7] text-white scale-[1.02] shadow-md' 
        : 'bg-white border-slate-200/60 text-slate-800 hover:border-[#6264A7]/40 hover:shadow-md'
    }`}
  >
    <div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-md leading-tight tracking-tight">{title}</h3>
        <Icon size={16} className={isActive ? 'text-white/80' : 'text-[#6264A7]'} />
      </div>
      <p className={`text-[11px] leading-relaxed line-clamp-3 ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
        {description}
      </p>
    </div>
    
    <div className="flex justify-between items-center">
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
          <div key={i} className={`w-7 h-7 rounded-full border-2 ${isActive ? 'border-[#6264A7]' : 'border-white'} bg-slate-200 overflow-hidden`}>
            <img src={`https://i.pravatar.cc/100?u=${title + i}`} alt="user" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-bold">
        <MousePointer2 size={12} className={isActive ? 'text-white' : 'text-[#6264A7]'} /> 
        {val}
      </div>
    </div>
  </div>
);

export default function Content() {
  const [activeCard, setActiveCard] = useState('automation');

  const insights = [
    {
      id: 'automation',
      title: "SVX · Smart Automation",
      val: "2.4k",
      icon: Zap,
      description: "Optimización de flujos operativos mediante agentes autónomos de SERVEX, reduciendo tiempos de respuesta en un 40%."
    },
    {
      id: 'triaging',
      title: "Intelligent Triaging",
      val: "1.2k",
      icon: Target,
      description: "Clasificación predictiva de requerimientos técnicos con una precisión del 98% aplicada a la arquitectura de CoPilot."
    },
    {
      id: 'analytics',
      title: "Predictive Analytics",
      val: "3.1k",
      icon: BarChart3,
      description: "Detección temprana de cuellos de botella y análisis de tendencias de productividad en tiempo real para la toma de decisiones."
    }
  ];

  return (
    <div className="space-y-6 px-4 md:px-0">
      
      {/* BANNER ACTUALIZADO - RESPONSIVE FIX */}
      <section className="bg-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-sm border border-slate-200/60">
        
        <div className="z-10 max-w-lg w-full">
          <h1 className="text-xl md:text-2xl font-extrabold mb-3 text-slate-800">
            Welcome to SERVEX Client Copilot.
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mb-6 leading-relaxed">
            Your centralized AI hub designed to manage and streamline all your operations. 
            Harness next-gen intelligence to simplify complex workflows and boost productivity 
            across your entire organization.
          </p>
          
          {/* BOTONES RESPONSIVOS: Se apilan en móvil, se alinean en desktop */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button className="bg-[#6264A7] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#4d4f8a] transition-all shadow-sm hover:shadow-md w-full sm:w-auto text-center">
              Start AI Context
            </button>
            <a 
              href="https://servex-ai-iota.vercel.app/politicas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-slate-600 border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all inline-block text-center w-full sm:w-auto"
            >
              Documentation
            </a>
          </div>
        </div>
        
        {/* Decoración abstracta sutil (Oculta en móviles para evitar overflow) */}
        <div className="hidden md:block relative w-40 h-40 opacity-20">
          <div className="absolute inset-0 bg-[#6264A7] rounded-3xl rotate-12"></div>
          <div className="absolute inset-0 bg-slate-200 rounded-3xl -rotate-6 flex flex-col items-center justify-center">
            <img
              src="/logo2.png"
              alt="SERVEX Logo"
              className="w-54 h-54 object-contain mb-1"
            />
          </div>
        </div>
      </section>

      {/* TRENDING INSIGHTS */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            SVX CoPilot · Trending Insights
          </h2>
          <button className="text-[#6264A7] text-xs font-bold hover:underline">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <BlogCard 
              key={insight.id}
              title={insight.title}
              description={insight.description}
              val={insight.val}
              icon={insight.icon}
              isActive={activeCard === insight.id}
              onClick={() => setActiveCard(insight.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}