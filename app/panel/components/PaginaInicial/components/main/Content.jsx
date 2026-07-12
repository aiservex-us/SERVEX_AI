'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Zap, Target, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Componente BlogCard con el nuevo color #464775 y tipografía optimizada
const BlogCard = ({ title, description, val, isActive, onClick, icon: Icon }) => (
  <div 
    onClick={onClick}
    className={`p-5 rounded-xl flex flex-col justify-between h-48 border transition-all duration-500 cursor-pointer group font-sans relative overflow-hidden ${
      isActive 
        ? 'border-[#464775]/30 bg-[#f2f3f8] scale-[1.02] shadow-[0_10px_30px_-10px_rgba(70,71,117,0.2)]' 
        : 'bg-white border-slate-200/60 text-slate-800 hover:border-[#464775]/40 hover:shadow-md'
    }`}
  >
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-semibold text-md leading-tight tracking-tight ${isActive ? 'text-[#2B2C4B]' : ''}`}>{title}</h3>
        <Icon size={16} className={isActive ? 'text-[#464775]' : 'text-[#464775]'} />
      </div>
      <p className={`text-[11px] leading-relaxed line-clamp-3 font-normal ${isActive ? 'text-[#2B2C4B]/80' : 'text-slate-500'}`}>
        {description}
      </p>
    </div>
    
    <div className="flex justify-between items-center relative z-10">
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
          <div key={i} className={`w-7 h-7 rounded-full border-2 ${isActive ? 'border-white/80 shadow-sm' : 'border-white'} bg-slate-200 overflow-hidden`}>
            <img src={`https://i.pravatar.cc/100?u=${title + i}`} alt="user" />
          </div>
        ))}
      </div>
      <div className={`flex items-center gap-1.5 text-[11px] font-medium tracking-tight ${isActive ? 'text-[#2B2C4B]' : ''}`}>
        <MousePointer2 size={12} className={isActive ? 'text-[#464775]' : 'text-[#464775]'} /> 
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
      
      {/* BANNER REDISEÑADO CON ANIMACIONES Y GLASSMORPHISM */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative rounded-3xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-[#2B2C4B] via-[#464775] to-[#5a5b8a] mb-8"
      >
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[50%] -left-[10%] w-[80%] h-[150%] rounded-full bg-gradient-to-br from-[#8c8dcb]/30 to-transparent blur-3xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[50%] -right-[10%] w-[70%] h-[150%] rounded-full bg-gradient-to-tl from-[#ffffff]/20 to-transparent blur-3xl"
          />
        </div>
        
        <div className="relative z-10 max-w-xl w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest mb-5 backdrop-blur-md">
              <Zap size={14} className="text-amber-300" />
              <span>Next-Gen Intelligence</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-5 text-white tracking-tight leading-[1.15]">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-100">SERVEX Client Copilot</span>
            </h1>
            <p className="text-indigo-100/90 text-sm md:text-base mb-8 leading-relaxed font-light max-w-lg">
              Your centralized AI hub designed to manage and streamline all your operations. 
              Harness autonomous agents to simplify complex workflows and boost productivity 
              across your entire organization.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full"
          >
            <button 
              onClick={() => router.push('/modelContext')}
              className="group bg-white text-[#2B2C4B] px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] w-full sm:w-auto text-center flex items-center justify-center gap-2"
            >
              Start AI Context
              <Target size={16} className="group-hover:rotate-12 transition-transform" />
            </button>
            <a 
              href="https://servex-ai-iota.vercel.app/politicas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-white/20 transition-all text-center w-full sm:w-auto flex items-center justify-center"
            >
              Documentation
            </a>
          </motion.div>
        </div>
        
        {/* Decoración 3D / Logo a la derecha */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          className="hidden md:flex relative w-64 h-64 z-10 items-center justify-center mt-8 md:mt-0"
        >
          <motion.div 
            animate={{ y: [-15, 15, -15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-white/5 rounded-full blur-3xl"
          />
          <motion.img
            animate={{ y: [-5, 5, -5], rotate: [-2, 2, -2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            src="/logo2.png"
            alt="SERVEX Logo"
            className="w-48 h-48 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)] brightness-0 invert opacity-90"
          />
        </motion.div>
      </motion.section>

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