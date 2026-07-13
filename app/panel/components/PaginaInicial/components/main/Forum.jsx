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
      
      {/* 1. BACKGROUND IMAGE & OVERLAYS ESTILO AI CHAT */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="/fondo.jpg" alt="Background" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-[#464775]/5 to-[#464775]/15" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/10 to-transparent border-l border-white/60 shadow-[1px_0_10px_rgba(0,0,0,0.03)]" />
        </div>
        <div className="absolute top-[5%] right-[15%] w-[40%] h-[100%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/5 to-transparent border-l border-white/50" />
        </div>
      </div>

      {/* 3. MAIN CONTENT CAROUSEL */}
      <div className="relative z-20 w-full h-full flex flex-col p-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#464775] to-[#2B2C4B] rounded-xl flex items-center justify-center shadow-md shadow-[#464775]/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">Universal Audit Dashboard</h2>
              <p className="text-xs font-medium text-[#464775]/80 mt-1">Real-time Cross-Module Diagnostics</p>
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
        <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
          
          {/* Navigation Buttons */}
          <button onClick={handlePrev} className="absolute left-0 z-30 w-12 h-12 bg-white/40 hover:bg-white/70 backdrop-blur-xl border border-white/60 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all text-[#464775]">
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button onClick={handleNext} className="absolute right-0 z-30 w-12 h-12 bg-white/40 hover:bg-white/70 backdrop-blur-xl border border-white/60 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all text-[#464775]">
            <ChevronRight className="w-6 h-6" />
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
                className="w-full max-w-6xl h-full flex gap-8 pb-4 px-16 min-h-0"
              >
                {/* Left Side: Module Info */}
                <div className="w-[30%] flex flex-col justify-center">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/80 h-auto">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-white flex items-center justify-center p-2 mb-4 relative overflow-hidden">
                      <img src={activeModule.logo} alt="Company Logo" className="w-full h-full object-contain relative z-10" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2 text-[#464775]">
                      {activeModule.icon}
                      <span className="font-bold tracking-widest uppercase text-xs opacity-80">{activeModule.key} Module</span>
                    </div>
                    
                    <h1 className="text-3xl font-extrabold text-slate-800 leading-tight mb-3 tracking-tight">
                      {activeModule.title.split(' - ')[1]}
                    </h1>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {activeModule.description}
                    </p>

                    <div className="w-full bg-[#464775]/5 rounded-xl p-4 border border-[#464775]/10">
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
                <div className="w-[70%] h-full flex flex-col min-h-0 pl-4">
                  <div className="bg-white/90 backdrop-blur-2xl w-full flex-1 rounded-[2rem] p-8 shadow-xl border border-white/80 flex flex-col relative overflow-hidden min-h-0">
                    
                    <h3 className="text-xl font-bold text-[#464775] mb-4 shrink-0 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Activity className="w-5 h-5" />
                      Executive Diagnostic Report
                    </h3>

                    <div className="flex-1 overflow-y-auto min-h-0 pr-4 scrollbar-thin scrollbar-thumb-[#464775]/20 scrollbar-track-transparent">
                       {hasContent ? (
                        <div className="text-[13px] text-slate-700 leading-relaxed pb-8">
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-[1.1rem] font-extrabold text-slate-800 mb-3 mt-4 tracking-tight uppercase" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-base font-bold text-slate-800 mb-2 mt-4 pb-1 border-b border-slate-100" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-[15px] font-bold text-[#464775] mb-2 mt-3" {...props} />,
                              p: ({node, ...props}) => <p className="mb-3 text-slate-600" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-0.5 mb-3 text-slate-600 marker:text-[#464775]" {...props} />,
                              table: ({node, ...props}) => (
                                <div className="w-full overflow-x-auto my-4 rounded-lg border border-slate-200 shadow-sm bg-white/50 backdrop-blur-sm">
                                  <table className="w-full text-left border-collapse text-[11px] md:text-[12px]" {...props} />
                                </div>
                              ),
                              thead: ({node, ...props}) => <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-extrabold text-[9px]" {...props} />,
                              th: ({node, ...props}) => <th className="px-3 py-2 whitespace-nowrap" {...props} />,
                              td: ({node, ...props}) => <td className="px-3 py-2 border-b border-slate-100 text-slate-600 font-medium last:border-0" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-[#464775]" {...props} />,
                            }}
                          >
                            {markdownContent}
                          </ReactMarkdown>
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
