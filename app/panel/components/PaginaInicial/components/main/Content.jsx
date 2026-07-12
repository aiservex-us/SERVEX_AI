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

export default function Content({ setActiveView }) {
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
      
      {/* BANNER REDISEÑADO CON ANIMACIONES Y GLASSMORPHISM (ESTILO MAIN1) */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative rounded-3xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center overflow-hidden shadow-[0_10px_40px_-10px_rgba(70,71,117,0.1)] border border-[#464775]/10 bg-white mb-8"
      >
        {/* Animated Background Spheres (from main1.jsx) */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-[#464775]/5 to-[#464775]/10" />
          
          <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] rotate-[15deg]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/10 to-transparent border-l border-white/60 shadow-[1px_0_10px_rgba(0,0,0,0.03)]" />
          </div>
          <div className="absolute top-[5%] right-[15%] w-[40%] h-[100%] rotate-[15deg]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/5 to-transparent border-l border-white/50" />
          </div>
          <div className="absolute top-[-20%] left-[10%] w-[30%] h-[80%] rotate-[15deg]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/10 to-transparent border-l border-white/60" />
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes float-bubble {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-15px) scale(1.02); }
            }
          `}} />
          
          {/* Sphere 1: Back left - large and soft */}
          <div 
            className="absolute top-[5%] left-[5%] w-[150px] h-[150px] rounded-full backdrop-blur-[12px]"
            style={{ 
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.5) 100%)',
              boxShadow: 'inset -15px -15px 30px rgba(70, 71, 117, 0.15), inset 10px 10px 25px rgba(255,255,255,0.9), 0 20px 40px rgba(70,71,117,0.05)',
              animation: 'float-bubble 8s ease-in-out infinite'
            }} 
          />
          {/* Sphere 2: Main center/right - very large, crisp */}
          <div 
            className="absolute top-[10%] right-[10%] w-[250px] h-[250px] rounded-full backdrop-blur-[16px] z-10"
            style={{ 
              background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0.7) 100%)',
              boxShadow: 'inset -25px -25px 50px rgba(70, 71, 117, 0.2), inset 15px 15px 30px rgba(255,255,255,1), 0 30px 60px rgba(70,71,117,0.1)',
              animation: 'float-bubble 12s ease-in-out infinite reverse'
            }}
          />
          {/* Sphere 3: Bottom right - medium size */}
          <div 
            className="absolute bottom-[-10%] right-[30%] w-[180px] h-[180px] rounded-full backdrop-blur-[8px]"
            style={{ 
              background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.4) 100%)',
              boxShadow: 'inset -10px -10px 20px rgba(70, 71, 117, 0.15), inset 8px 8px 20px rgba(255,255,255,0.8), 0 15px 30px rgba(70,71,117,0.05)',
              animation: 'float-bubble 9s ease-in-out infinite 2s'
            }}
          />
        </div>
        
        <div className="relative z-10 w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-[#464775]/20 text-[#464775] text-[10px] font-bold uppercase tracking-widest mb-5 backdrop-blur-md shadow-sm">
              <Zap size={14} className="text-amber-500" />
              <span>Next-Gen Intelligence</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-light mb-5 text-[#1a1a1a] tracking-tighter leading-[1.1]">
              Welcome to <br />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#464775] to-[#2B2C4B]">SERVEX Client Copilot</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base mb-8 leading-relaxed font-light max-w-xl">
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
              onClick={() => {
                if (setActiveView) {
                  setActiveView('products');
                } else {
                  router.push('/modelContext');
                }
              }}
              className="group bg-[#464775] text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-[#3a3b61] transition-all shadow-[0_10px_20px_rgba(70,71,117,0.2)] hover:shadow-[0_15px_30px_rgba(70,71,117,0.3)] w-full sm:w-auto text-center flex items-center justify-center gap-2"
            >
              Start AI Context
              <Target size={16} className="group-hover:rotate-12 transition-transform" />
            </button>
            <a 
              href="https://servex-ai-iota.vercel.app/politicas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white/80 backdrop-blur-md text-[#464775] border border-[#464775]/20 px-8 py-3.5 rounded-xl text-sm font-medium hover:bg-white transition-all hover:shadow-md text-center w-full sm:w-auto flex items-center justify-center"
            >
              Documentation
            </a>
          </motion.div>
        </div>
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