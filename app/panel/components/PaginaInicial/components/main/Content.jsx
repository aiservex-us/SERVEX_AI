'use client';
import React, { useState } from 'react';
import { MousePointer2, Zap, Target, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Componente BlogCard con el nuevo color #464775 y tipografía optimizada
const BlogCard = ({ title, description, val, isActive, onClick, icon: Icon }) => (
  <div 
    onClick={onClick}
    className={`p-5 rounded-xl shadow-sm flex flex-col justify-between h-48 border transition-all duration-300 cursor-pointer group font-sans ${
      isActive 
        ? 'bg-[#464775] border-[#464775] text-white scale-[1.02] shadow-md' 
        : 'bg-white border-slate-200/60 text-slate-800 hover:border-[#464775]/40 hover:shadow-md'
    }`}
  >
    <div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-md leading-tight tracking-tight">{title}</h3>
        <Icon size={16} className={isActive ? 'text-white/80' : 'text-[#464775]'} />
      </div>
      <p className={`text-[11px] leading-relaxed line-clamp-3 font-normal ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
        {description}
      </p>
    </div>
    
    <div className="flex justify-between items-center">
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
          <div key={i} className={`w-7 h-7 rounded-full border-2 ${isActive ? 'border-[#464775]' : 'border-white'} bg-slate-200 overflow-hidden`}>
            <img src={`https://i.pravatar.cc/100?u=${title + i}`} alt="user" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-[11px] font-medium tracking-tight">
        <MousePointer2 size={12} className={isActive ? 'text-white' : 'text-[#464775]'} /> 
        {val}
      </div>
    </div>
  </div>
);

export default function Content() {
  const [activeCard, setActiveCard] = useState('automation');
  const router = useRouter();

  const insights = [
    {
      id: 'automation',
      title: "SVX · Smart Automation",
      val: "2.4k",
      icon: Zap,
      description: "Operational workflow optimization via SERVEX autonomous agents, reducing response times by 40%."
    },
    {
      id: 'triaging',
      title: "Intelligent Triaging",
      val: "1.2k",
      icon: Target,
      description: "Predictive classification of technical requirements with 98% accuracy applied to the CoPilot architecture."
    },
    {
      id: 'analytics',
      title: "Predictive Analytics",
      val: "3.1k",
      icon: BarChart3,
      description: "Early detection of bottlenecks and real-time productivity trend analysis for strategic decision-making."
    }
  ];

  return (
    <div className="space-y-6 px-4 md:px-0 font-sans">
      
      {/* BANNER ACTUALIZADO */}
      <section className="bg-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-sm border border-slate-200/60">
        
        <div className="z-10 max-w-lg w-full">
          <h1 className="text-xl md:text-2xl font-bold mb-3 text-slate-800 tracking-tight">
            Welcome to SERVEX Client Copilot.
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mb-6 leading-relaxed font-normal">
            Your centralized AI hub designed to manage and streamline all your operations. 
            Harness next-gen intelligence to simplify complex workflows and boost productivity 
            across your entire organization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button 
              onClick={() => router.push('/modelContext')}
              className="bg-[#464775] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3a3b61] transition-all shadow-sm hover:shadow-md w-full sm:w-auto text-center"
            >
              Start AI Context
            </button>
            <a 
              href="https://servex-ai-iota.vercel.app/politicas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-slate-600 border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all inline-block text-center w-full sm:w-auto"
            >
              Documentation
            </a>
          </div>
        </div>
        
        {/* Decoración abstracta con el nuevo color */}
        <div className="hidden md:block relative w-40 h-40 opacity-20">
          <div className="absolute inset-0 bg-[#464775] rounded-3xl rotate-12"></div>
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
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            SVX CoPilot · Trending Insights
          </h2>
          <button className="text-[#464775] text-xs font-bold hover:underline">
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