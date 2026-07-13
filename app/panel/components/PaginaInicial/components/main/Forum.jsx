import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  DatabaseZap,
  Box,
  Monitor,
  LayoutGrid,
  Briefcase,
  Layers,
  Activity,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const MODULES_CONFIG = [
  {
    key: 'WBT',
    title: 'WBT - Tables & Worksurfaces',
    description: 'Specialized audit for tables, bases, tops, and workspaces. Evaluates dimensions, pricing, and cross-references.',
    icon: <LayoutGrid className="w-6 h-6 text-indigo-500" />,
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    accent: 'bg-indigo-500'
  },
  {
    key: 'WBS',
    title: 'WBS - Seating',
    description: 'Analysis of corporate seating, ergonomics, finishes (fabrics/mesh), and modular component validation.',
    icon: <Briefcase className="w-6 h-6 text-emerald-500" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    accent: 'bg-emerald-500'
  },
  {
    key: 'WBD',
    title: 'WBD - Desks',
    description: 'Evaluation of executive and operative desks. Validation of L/U configurations and electrification management.',
    icon: <Monitor className="w-6 h-6 text-sky-500" />,
    bg: 'bg-sky-50',
    border: 'border-sky-100',
    accent: 'bg-sky-500'
  },
  {
    key: 'WBO',
    title: 'WBO - Workstations',
    description: 'Diagnostic for open workstations (Benching). Verification of partitions, supports, and shared modules.',
    icon: <Box className="w-6 h-6 text-violet-500" />,
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    accent: 'bg-violet-500'
  },
  {
    key: 'WBG',
    title: 'WBG - Graphics & Panels',
    description: 'Control of acoustic panels, visual separators, rail systems, and spatial privacy components.',
    icon: <Layers className="w-6 h-6 text-rose-500" />,
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    accent: 'bg-rose-500'
  }
];

const Forum = () => {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="w-full min-h-[80vh] flex flex-col font-sans antialiased">
      
      {/* HEADER SECTION */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-[#464775]/5 rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="flex items-start gap-5 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-[#464775] to-[#2B2C4B] rounded-2xl flex items-center justify-center shadow-lg shadow-[#464775]/20 shrink-0">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">
              Universal Master Audit
            </h2>
            <p className="text-sm font-medium text-slate-500 max-w-xl leading-relaxed">
              Real-time diagnostic forum. The AI agent analyzes your ingested records across all catalogs and compiles them into a unified executive report.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10 shrink-0">
          {auditData && (
            <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-0.5">Last Scan</span>
              <span className="text-xs font-bold text-[#464775] bg-[#464775]/5 px-3 py-1 rounded-full border border-[#464775]/10">
                {new Date(auditData.created_at).toLocaleString()}
              </span>
            </div>
          )}
          <button 
            onClick={fetchAuditData}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#464775]' : ''}`} />
            Sync Report
          </button>
        </div>
      </div>

      {/* CONTENT SECTION */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-2xl shadow-[#464775]/5 min-h-[400px]">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#464775] rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="w-16 h-16 bg-white rounded-full border-2 border-[#464775]/10 flex items-center justify-center relative shadow-sm">
               <DatabaseZap className="w-6 h-6 text-[#464775] animate-bounce" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Extracting Intelligence</h3>
          <p className="text-sm text-slate-500 font-medium">Gathering the latest cross-module audit logs from Supabase...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-3xl border border-red-100 shadow-2xl shadow-red-500/5 min-h-[400px]">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 mb-6 shadow-inner">
             <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Connection Error</h3>
          <p className="text-sm text-slate-500 font-medium">{error}</p>
        </div>
      ) : !auditData ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-2xl shadow-[#464775]/5 min-h-[400px] text-center p-8">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 mb-6 shadow-inner">
             <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No audits available yet</h3>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
            The Universal Audit pipeline hasn't recorded any data in the database. Run the AI Auditor from any module to generate the first cross-catalog diagnostic.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MODULES_CONFIG.map((mod, idx) => {
            const markdownContent = auditData[mod.key];
            const hasContent = markdownContent && markdownContent.trim().length > 0;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                key={mod.key}
                className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl overflow-hidden flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(70,71,117,0.08)] transition-all duration-300"
              >
                {/* Card Header */}
                <div className={`p-6 border-b ${mod.border} ${mod.bg} relative overflow-hidden group`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${mod.accent} opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:opacity-10 transition-opacity`}></div>
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-white/50 flex items-center justify-center shrink-0">
                      {mod.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg tracking-tight">{mod.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${hasContent ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500">
                          {hasContent ? 'Data Received' : 'Pending Audit'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mt-4 leading-relaxed line-clamp-2">
                    {mod.description}
                  </p>
                </div>

                {/* Card Body (Markdown Renderer) */}
                <div className="p-6 flex-1 bg-gradient-to-b from-white to-slate-50/30 overflow-y-auto min-h-[250px] max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200">
                  {hasContent ? (
                    <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-a:text-[#464775] prose-strong:text-[#464775] prose-p:leading-relaxed prose-li:marker:text-[#464775]">
                      <ReactMarkdown>{markdownContent}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 opacity-60 grayscale">
                      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                        <Activity className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-500 mb-1">Awaiting Data</span>
                      <span className="text-[10px] text-slate-400 font-medium">This module hasn't submitted audit reports in the current cycle.</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Forum;
