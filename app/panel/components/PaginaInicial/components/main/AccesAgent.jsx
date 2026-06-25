"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Mic, ChevronDown, X, Database, Sparkles,
  ArrowRight, Info, Check, BookOpen, BarChart3, 
  Settings, HelpCircle, Shield, Layout, Zap
} from 'lucide-react';

const TeamsCopilotStyle = () => {
  const router = useRouter();
  
  // State
  const [mode, setMode] = useState('platform');
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [context, setContext] = useState('Servex US');

  const handleSend = () => {
    if (query.trim()) {
      sessionStorage.setItem('lastAIQuery', query);
      router.push('/modelContext'); 
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF] flex flex-col font-sans text-gray-800">
      
      {/* --- TOP BAR (REEMPLAZADO CON #464775) --- */}
      <div className="h-12 bg-[#FFF] w-full flex items-center justify-between px-4 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded p-0.5">
            <img src="/logo2.png" alt="SVX" className="h-5 w-auto" />
          </div>
          <span className="text-sm font-semibold opacity-90 tracking-tight">
            SVX Copilot Intelligence
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#3a3b61] px-3 py-1 rounded text-[11px] border border-[#5a5b8a] font-medium">
            Enterprise Mode
          </div>
          <Settings size={16} className="opacity-70 cursor-pointer hover:opacity-100" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 mt-4">
        <div className="w-full max-w-4xl">
          
          {/* --- COMPACT HEADER --- */}
          <div className="mb-8 border-b border-gray-200 pb-6">
            <div className="flex items-center gap-2 text-[#464775] mb-2">
              <Sparkles size={18} fill="#464775" fillOpacity={0.2} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Contextual Assistance Center
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
              Welcome to Servex Copilot
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl font-normal">
              Learn processes, resolve platform questions, or analyze critical data.
              The model is synchronized with the official 2025 documentation.
            </p>
          </div>

          {/* --- INFORMATION GRID --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all group">
              <Layout size={20} className="text-[#464775] mb-3" />
              <h3 className="text-sm font-semibold mb-1 tracking-tight">Platform Guide</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Step-by-step instructions for workflows, roles, and technical configurations.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <BarChart3 size={20} className="text-[#464775] mb-3" />
              <h3 className="text-sm font-semibold mb-1 tracking-tight">Data Analytics</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Real-time queries on inventory, sales, and customer KPIs.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <Shield size={20} className="text-[#464775] mb-3" />
              <h3 className="text-sm font-semibold mb-1 tracking-tight">Secure Support</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Restricted access under SVX Enterprise privacy policies.
              </p>
            </div>
          </div>

          {/* --- MODE SELECTOR --- */}
          <div className="flex gap-1 bg-gray-200/50 p-1 rounded-md w-fit mb-4">
            {['platform', 'data'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded text-xs font-semibold transition-all
                ${mode === m ? 'bg-white text-[#464775] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {m === 'platform' ? 'User Manual' : 'Business Intelligence'}
              </button>
            ))}
          </div>

          {/* --- INPUT BOX --- */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden transition-all focus-within:border-[#464775] focus-within:ring-1 focus-within:ring-[#464775]/30">
            
            {/* Context bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
              >
                <Database size={12} className="text-[#464775]" />
                CONTEXT: {context}
                <ChevronDown size={12} className={isDropdownOpen ? 'rotate-180' : ''} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-9 left-4 w-48 bg-white border border-gray-200 shadow-xl rounded z-50 py-1">
                  {['Servex US', 'Servex LATAM', 'General HQ'].map((ctx) => (
                    <button 
                      key={ctx}
                      onClick={() => { setContext(ctx); setIsDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#F3F2F1] flex justify-between items-center transition-colors font-medium"
                    >
                      {ctx}
                      {context === ctx && <Check size={12} className="text-[#464775]" />}
                    </button>
                  ))}
                </div>
              )}

              <div className="h-4 w-[1px] bg-gray-300 mx-1" />
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold tracking-tight">
                <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                SVX ENGINE v4.10 READY
              </div>
            </div>

            {/* Input */}
            <div className="p-4">
              <textarea 
                className="w-full text-sm text-gray-700 border-none focus:ring-0 resize-none bg-transparent placeholder-gray-400 min-h-[100px] font-normal"
                placeholder={
                  mode === 'platform'
                    ? "Ex: How do I configure permissions for a new analyst?"
                    : "Ex: Show me the purchase report by region for last month..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Footer Toolbar */}
            <div className="flex justify-between items-center px-4 py-2 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-3 text-gray-400">
                <button className="hover:text-[#464775] transition-colors"><Plus size={18} /></button>
                <button className="hover:text-[#464775] transition-colors"><Mic size={18} /></button>
                <button className="hover:text-[#464775] transition-colors"><HelpCircle size={18} /></button>
              </div>

              <button 
                onClick={handleSend}
                disabled={!query.trim()}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-bold text-xs transition-all
                ${query.trim() 
                  ? 'bg-[#464775] text-white hover:bg-[#3a3b61] shadow-sm' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 font-semibold'}`}
              >
                <span>Send Query</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* --- QUICK TIPS --- */}
          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter italic">
              Suggestions:
            </span>
            {["Export reports", "Create user", "Monthly KPI"].map((tip, i) => (
              <button 
                key={i}
                onClick={() => setQuery(tip)}
                className="text-[11px] text-[#464775] hover:underline font-semibold"
              >
                {tip}
              </button>
            ))}
          </div>

          {/* --- FOOTER --- */}
          <div className="mt-12 flex items-center justify-between border-t border-gray-200 pt-6 opacity-60">
            <div className="flex items-center gap-4 grayscale">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="MS" className="h-3" />
              <div className="h-3 w-[1px] bg-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                AI Copilot Alliance
              </span>
            </div>
            <p className="text-[10px] font-bold text-gray-400">
              © 2025 SERVEX INTELLIGENCE SYSTEM • V.PRO
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeamsCopilotStyle;