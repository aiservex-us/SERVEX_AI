import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  DatabaseZap,
  Activity,
  AlertTriangle,
  RefreshCw,
  LayoutGrid,
  Briefcase,
  Monitor,
  Box,
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const MODULES_CONFIG = [
  {
    key: 'WBT',
    title: 'WBT - Tables & Worksurfaces',
    description: 'Specialized audit for tables, bases, tops, and workspaces. Evaluates dimensions, pricing, and cross-references.',
    logo: '/logosEmpresas/WB.webp',
    icon: <LayoutGrid className="w-5 h-5" />
  },
  {
    key: 'WBS',
    title: 'WBS - Seating',
    description: 'Analysis of corporate seating, ergonomics, finishes (fabrics/mesh), and modular component validation.',
    logo: '/logosEmpresas/WB.webp',
    icon: <Briefcase className="w-5 h-5" />
  },
  {
    key: 'WBD',
    title: 'WBD - Desks',
    description: 'Evaluation of executive and operative desks. Validation of L/U configurations and electrification management.',
    logo: '/logosEmpresas/WB.webp',
    icon: <Monitor className="w-5 h-5" />
  },
  {
    key: 'WBO',
    title: 'WBO - Workstations',
    description: 'Diagnostic for open workstations (Benching). Verification of partitions, supports, and shared modules.',
    logo: '/logosEmpresas/WB.webp',
    icon: <Box className="w-5 h-5" />
  },
  {
    key: 'WBG',
    title: 'WBG - Graphics & Panels',
    description: 'Control of acoustic panels, visual separators, rail systems, and spatial privacy components.',
    logo: '/logosEmpresas/WB.webp',
    icon: <Layers className="w-5 h-5" />
  }
];

const Forum = () => {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: sbError } = await supabase
        .from('ClientSERVEX_Audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sbError) throw sbError;
      setAuditData(data);
    } catch (err) {
      console.error('Error fetching audit data:', err);
      setError('Unable to retrieve the latest AI audit report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleNext = () => {
    setActiveIndex((prev) => (prev === MODULES_CONFIG.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? MODULES_CONFIG.length - 1 : prev - 1));
  };

  const activeModule = MODULES_CONFIG[activeIndex];
  const markdownContent = auditData ? auditData[activeModule.key] : null;
  const hasContent = markdownContent && markdownContent.trim().length > 0;

  return (
    <div className="relative w-[95%] h-[90vh] mx-auto rounded-[3rem] overflow-hidden shadow-2xl shadow-[#464775]/20 flex flex-col items-center justify-center font-sans">
      
      {/* 1. BACKGROUND IMAGE & OVERLAYS */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/fondo.jpg" 
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
      </div>

      {/* 2. GRADIENTS AND PANELS */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/70 via-[#464775]/10 to-[#464775]/20" />
        
        {/* Floating Glass Spheres */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float-bubble {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-25px) scale(1.02); }
          }
        `}} />
        
        <div 
          className="absolute top-[15%] left-[25%] w-[380px] h-[380px] rounded-full backdrop-blur-[16px] z-10"
          style={{ 
            background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0.7) 100%)',
            boxShadow: 'inset -25px -25px 50px rgba(70, 71, 117, 0.2), inset 15px 15px 30px rgba(255,255,255,1), 0 30px 60px rgba(70,71,117,0.1)',
            animation: 'float-bubble 12s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute bottom-[5%] right-[2%] w-[450px] h-[450px] rounded-full backdrop-blur-[20px]"
          style={{ 
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0.4) 100%)',
            boxShadow: 'inset -30px -30px 60px rgba(70, 71, 117, 0.1), inset 20px 20px 40px rgba(255,255,255,0.7), 0 40px 80px rgba(70,71,117,0.08)',
            animation: 'float-bubble 15s ease-in-out infinite 1s'
          }}
        />
      </div>

      {/* 3. MAIN CONTENT CAROUSEL */}
      <div className="relative z-20 w-full h-full flex flex-col p-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#464775] to-[#2B2C4B] rounded-2xl flex items-center justify-center shadow-lg shadow-[#464775]/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">Universal Audit Dashboard</h2>
              <p className="text-sm font-medium text-[#464775]/80 mt-1">Real-time Cross-Module Diagnostics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {auditData && (
              <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-0.5">Last Scan</span>
                <span className="text-xs font-bold text-[#464775] bg-white/60 px-3 py-1 rounded-full border border-white backdrop-blur-md shadow-sm">
                  {new Date(auditData.created_at).toLocaleString()}
                </span>
              </div>
            )}
            <button 
              onClick={fetchAuditData}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/70 backdrop-blur-md border border-white rounded-xl text-sm font-bold text-[#464775] hover:bg-white hover:shadow-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </button>
          </div>
        </div>

        {/* CAROUSEL BODY */}
        <div className="flex-1 w-full flex items-center justify-center relative">
          
          {/* Navigation Buttons */}
          <button onClick={handlePrev} className="absolute left-0 z-30 w-14 h-14 bg-white/40 hover:bg-white/70 backdrop-blur-xl border border-white/60 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all text-[#464775]">
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button onClick={handleNext} className="absolute right-0 z-30 w-14 h-14 bg-white/40 hover:bg-white/70 backdrop-blur-xl border border-white/60 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all text-[#464775]">
            <ChevronRight className="w-8 h-8" />
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center text-center">
               <DatabaseZap className="w-12 h-12 text-[#464775] animate-bounce mb-4" />
               <h3 className="text-xl font-bold text-slate-800">Extracting Intelligence</h3>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center">
               <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
               <h3 className="text-xl font-bold text-slate-800">{error}</h3>
            </div>
          ) : !auditData ? (
             <div className="flex flex-col items-center justify-center text-center max-w-lg">
               <Activity className="w-12 h-12 text-[#464775]/50 mb-4" />
               <h3 className="text-2xl font-bold text-slate-800 mb-2">No audits available</h3>
               <p className="text-slate-600 font-medium">Run the AI Auditor from any module to generate the first cross-catalog diagnostic.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
                className="w-full max-w-6xl h-full flex gap-8 pb-4 px-16"
              >
                {/* Left Side: Module Info */}
                <div className="w-[35%] flex flex-col justify-center">
                  <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/80 h-auto">
                    <div className="w-24 h-24 bg-white rounded-2xl shadow-sm border border-white flex items-center justify-center p-3 mb-6 relative overflow-hidden">
                      <img src={activeModule.logo} alt="Company Logo" className="w-full h-full object-contain relative z-10" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-2 text-[#464775]">
                      {activeModule.icon}
                      <span className="font-bold tracking-widest uppercase text-sm opacity-80">{activeModule.key} Module</span>
                    </div>
                    
                    <h1 className="text-4xl font-extrabold text-slate-800 leading-tight mb-4 tracking-tighter">
                      {activeModule.title.split(' - ')[1]}
                    </h1>
                    
                    <p className="text-slate-600 text-lg leading-relaxed mb-8">
                      {activeModule.description}
                    </p>

                    <div className="w-full bg-[#464775]/5 rounded-2xl p-5 border border-[#464775]/10">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700 text-sm">Status</span>
                        {hasContent ? (
                           <div className="flex items-center gap-2">
                             <span className="relative flex h-3 w-3">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                             </span>
                             <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Analyzed</span>
                           </div>
                        ) : (
                           <div className="flex items-center gap-2">
                             <div className="h-3 w-3 rounded-full bg-slate-300"></div>
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</span>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Markdown Scrollable Area */}
                <div className="w-[65%] h-full">
                  <div className="bg-white/80 backdrop-blur-3xl w-full h-full rounded-[2.5rem] p-10 shadow-2xl border border-white/80 flex flex-col relative overflow-hidden">
                    
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#464775]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <h3 className="text-2xl font-bold text-[#464775] mb-6 shrink-0 flex items-center gap-3">
                      <Activity className="w-6 h-6" />
                      Executive Diagnostic Report
                    </h3>

                    <div className="flex-1 overflow-y-auto pr-6 scrollbar-thin scrollbar-thumb-[#464775]/20 scrollbar-track-transparent">
                       {hasContent ? (
                        <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#1a1a1a] prose-a:text-[#464775] prose-strong:text-[#1a1a1a] prose-p:text-gray-700 prose-p:leading-relaxed prose-li:marker:text-[#464775] prose-table:border-collapse prose-th:bg-slate-50 prose-th:text-slate-800 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-slate-100 pb-10">
                          <ReactMarkdown>{markdownContent}</ReactMarkdown>
                        </div>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-center opacity-50 grayscale">
                          <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center mb-6 shadow-sm">
                            <Box className="w-10 h-10 text-slate-400" />
                          </div>
                          <span className="text-xl font-bold text-slate-600 mb-2">Awaiting Data Pipeline</span>
                          <span className="text-sm text-slate-500 font-medium max-w-md">The agent hasn't generated an audit report for this specific catalog segment yet.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

        </div>
        
        {/* PROGRESS INDICATOR */}
        {auditData && !loading && !error && (
          <div className="flex justify-center items-center gap-3 mt-4 shrink-0 relative z-30">
            {MODULES_CONFIG.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all duration-300 rounded-full ${activeIndex === idx ? 'w-10 h-2 bg-[#464775]' : 'w-2 h-2 bg-[#464775]/30 hover:bg-[#464775]/50'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Forum;
