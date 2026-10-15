'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  FileCheck, 
  RefreshCw, 
  ArrowRight, 
  Database, 
  Layers, 
  CheckCircle2, 
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';

const BENCHMARK_DATA = {
  comparison: {
    label: 'Matrix Price Comparison',
    description: 'Deep matrix analysis comparing thousands of legacy pricing nodes against incoming catalog updates to detect precise variations.',
    manualTime: '80 Hours',
    svxTime: '2.5 Minutes',
    savings: 99.94,
    accuracy: '99.9%',
    svxVisualWidth: '5%'
  },
  cleansing: {
    label: 'Data Cleansing & Normalization',
    description: 'Autonomous normalization of raw catalog data, filtering anomalies and removing structural inconsistencies instantly.',
    manualTime: '40 Hours',
    svxTime: '12 Seconds',
    savings: 99.99,
    accuracy: '100%',
    svxVisualWidth: '2%'
  },
  restructuring: {
    label: 'Hierarchical Node Restructuring',
    description: 'Intelligent re-mapping of XML hierarchies and product attributes to match master database schemas autonomously.',
    manualTime: '120 Hours',
    svxTime: '45 Seconds',
    savings: 99.98,
    accuracy: '100%',
    svxVisualWidth: '3%'
  },
  updating: {
    label: 'XML Master Updating',
    description: 'Automated injection of corrected values, new SKUs, and pricing into the master XML without manual coding.',
    manualTime: '60 Hours',
    svxTime: '15 Seconds',
    savings: 99.99,
    accuracy: '100%',
    svxVisualWidth: '2%'
  },
  configuration: {
    label: 'Catalog Engine Compilation',
    description: 'Final compiling, checksum validation, and deployment of the updated catalog engine for CET Designer and 20/20 interfaces.',
    manualTime: '20 Hours',
    svxTime: '5 Seconds',
    savings: 99.99,
    accuracy: '100%',
    svxVisualWidth: '1%'
  }
};

const PHASES = [
  { key: 'comparison', label: 'Matrix Comparison' },
  { key: 'cleansing', label: 'Cleansing' },
  { key: 'restructuring', label: 'Restructuring' },
  { key: 'updating', label: 'XML Updating' },
  { key: 'configuration', label: 'Compilation' }
];

// Fallback audit items if table has no entries yet
const FALLBACK_LOGS = [
  {
    id: 'log-1',
    company_name: 'General_Procces',
    file_name: 'MASTER_CATALOG_2024_REVISED.xml',
    status: 'Verified & Synced',
    time: 'Recent Ingestion',
    records_count: '1,420 SKUs'
  },
  {
    id: 'log-2',
    company_name: 'Herman Miller',
    file_name: 'HM_PRICING_MATRIX_Q3.xml',
    status: 'Schema Compliant',
    time: '2 hours ago',
    records_count: '3,850 SKUs'
  },
  {
    id: 'log-3',
    company_name: 'Teknion',
    file_name: 'TEK_SEATING_SERIES_V4.xml',
    status: 'Matrix Reconciled',
    time: 'Yesterday',
    records_count: '890 SKUs'
  }
];

export default function Chart({ setActiveView }) {
  const router = useRouter();
  const [viewTab, setViewTab] = useState('feed'); // 'feed' | 'benchmarks'
  const [benchmarkMode, setBenchmarkMode] = useState('comparison');
  const [liveRecords, setLiveRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real records from ClientsSERVEX_General_Procces
  const fetchRecentPipelines = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ClientsSERVEX_General_Procces')
        .select('id, created_at, company_name, file_name')
        .order('created_at', { ascending: false })
        .limit(4);

      if (!error && data && data.length > 0) {
        setLiveRecords(data);
      } else {
        setLiveRecords(FALLBACK_LOGS);
      }
    } catch {
      setLiveRecords(FALLBACK_LOGS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentPipelines();
  }, []);

  const currentBenchmark = BENCHMARK_DATA[benchmarkMode];
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (circumference * currentBenchmark.savings) / 100;

  return (
    <section className="bg-white rounded-3xl p-6 md:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200/80 overflow-hidden font-sans">
      
      {/* SECTION HEADER & TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
              Pipeline Execution & Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time catalog ingestion telemetry and Python acceleration benchmarks.
          </p>
        </div>

        {/* VIEW TOGGLE */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60">
          <button
            onClick={() => setViewTab('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewTab === 'feed'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Activity Feed
          </button>
          <button
            onClick={() => setViewTab('benchmarks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewTab === 'benchmarks'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Velocity Benchmarks
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      {viewTab === 'feed' ? (
        <div className="pt-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-700">Recent Catalog Ingestions</span>
            <button
              onClick={fetchRecentPipelines}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs text-[#464775] hover:text-[#38395f] font-medium transition-colors cursor-pointer"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/40">
            {(liveRecords.length > 0 ? liveRecords : FALLBACK_LOGS).map((item, idx) => {
              const displayName = item.company_name === 'General_Procces' ? 'General Pipeline' : item.company_name;
              const fileName = item.file_name || 'XML Catalog Master';
              const timeString = item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : (item.time || 'Processed');

              return (
                <div 
                  key={item.id || idx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition-colors group"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-[#464775] shrink-0 shadow-xs">
                      <FileCheck size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {displayName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                          {item.status || 'Synced & Validated'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[280px] sm:max-w-md">
                        {fileName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <span className="text-[11px] text-slate-400 font-light">
                      {timeString}
                    </span>
                    <button
                      onClick={() => router.push('/xml-pipeline')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#464775] hover:border-[#464775]/40 text-xs font-medium transition-all shadow-xs group-hover:border-[#464775]/40 cursor-pointer"
                    >
                      <span>Inspect</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Direct pipeline connection with Supabase storage and PostgreSQL</span>
            <button
              onClick={() => router.push('/xml-pipeline')}
              className="text-[#464775] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>View Full Pipeline</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      ) : (
        /* VELOCITY BENCHMARKS */
        <div className="pt-5 space-y-5">
          {/* Phase Pill Buttons */}
          <div className="flex flex-wrap gap-2">
            {PHASES.map((p) => (
              <button
                key={p.key}
                onClick={() => setBenchmarkMode(p.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  benchmarkMode === p.key
                    ? 'bg-[#464775] text-white border-[#464775] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={benchmarkMode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  {currentBenchmark.label}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl font-light">
                  {currentBenchmark.description}
                </p>
              </div>

              {/* Graphic Comparison */}
              <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Circular Percentage */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                    <motion.circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#464775"
                      strokeWidth="6"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-[#464775] leading-none">
                      {currentBenchmark.savings}%
                    </span>
                    <span className="text-[8px] uppercase font-semibold text-slate-400 tracking-wider mt-1">
                      Time Saved
                    </span>
                  </div>
                </div>

                {/* Comparative Timeline Bars */}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium mb-1.5">
                      <span>Manual Human Specification</span>
                      <span className="text-rose-600 font-semibold">{currentBenchmark.manualTime}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-400 h-full rounded-full w-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[11px] text-slate-700 font-medium mb-1.5">
                      <span className="flex items-center gap-1.5 font-semibold text-[#464775]">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Servex Automated Python Engine
                      </span>
                      <span className="text-emerald-600 font-bold">{currentBenchmark.svxTime}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: currentBenchmark.svxVisualWidth }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="bg-[#464775] h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Accuracy Badge */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center shrink-0 min-w-[110px]">
                  <CheckCircle2 size={20} className="text-emerald-500 mb-1" />
                  <span className="text-base font-bold text-slate-900 leading-none">
                    {currentBenchmark.accuracy}
                  </span>
                  <span className="text-[9px] uppercase font-semibold text-slate-400 tracking-wider mt-1">
                    Accuracy
                  </span>
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

    </section>
  );
}