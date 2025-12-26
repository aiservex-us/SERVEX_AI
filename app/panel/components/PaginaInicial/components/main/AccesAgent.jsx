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
      
      {/* --- TOP BAR (TEAMS STYLE) --- */}
      <div className="h-12 bg-[#464775] w-full flex items-center justify-between px-4 text-white shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded p-0.5">
            <img src="/logo2.png" alt="SVX" className="h-5 w-auto" />
          </div>
          <span className="text-sm font-semibold opacity-90 tracking-tight">
            SVX Copilot Intelligence
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#3d3e66] px-3 py-1 rounded text-[11px] border border-[#5b5c8a]">
            Enterprise Mode
          </div>
          <Settings size={16} className="opacity-70 cursor-pointer hover:opacity-100" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center p-6 mt-4">
        <div className="w-full max-w-4xl">
          
          {/* --- COMPACT HEADER --- */}
          <div className="mb-8 border-b border-gray-200 pb-6">
            <div className="flex items-center gap-2 text-[#5B5FC7] mb-2">
              <Sparkles size={18} fill="#5B5FC7" fillOpacity={0.2} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Contextual Assistance Center
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome to Servex Copilot
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl">
              Learn processes, resolve platform questions, or analyze critical data.
              The model is synchronized with the official 2025 documentation.
            </p>
          </div>

          {/* --- INFORMATION GRID (DASHBOARD STYLE) --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <Layout size={20} className="text-[#5B5FC7] mb-3" />
              <h3 className="text-sm font-bold mb-1">Platform Guide</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Step-by-step instructions for workflows, roles, and technical configurations.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <BarChart3 size={20} className="text-[#5B5FC7] mb-3" />
              <h3 className="text-sm font-bold mb-1">Data Analytics</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Real-time queries on inventory, sales, and customer KPIs.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <Shield size={20} className="text-[#5B5FC7] mb-3" />
              <h3 className="text-sm font-bold mb-1">Secure Support</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
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
                ${mode === m ? 'bg-white text-[#5B5FC7] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {m === 'platform' ? 'User Manual' : 'Business Intelligence'}
              </button>
            ))}
          </div>

          {/* --- INPUT BOX (TEAMS CHAT STYLE) --- */}
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden transition-all focus-within:border-[#5B5FC7] focus-within:ring-1 focus-within:ring-[#5B5FC7]">
            
            {/* Context bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
              >
                <Database size={12} className="text-[#5B5FC7]" />
                CONTEXT: {context}
                <ChevronDown size={12} className={isDropdownOpen ? 'rotate-180' : ''} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-9 left-4 w-48 bg-white border border-gray-200 shadow-xl rounded z-50 py-1">
                  {['Servex US', 'Servex LATAM', 'General HQ'].map((ctx) => (
                    <button 
                      key={ctx}
                      onClick={() => { setContext(ctx); setIsDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-[#F3F2F1] flex justify-between items-center transition-colors"
                    >
                      {ctx}
                      {context === ctx && <Check size={12} className="text-[#5B5FC7]" />}
                    </button>
                  ))}
                </div>
              )}

              <div className="h-4 w-[1px] bg-gray-300 mx-1" />
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                SVX ENGINE v4.10 READY
              </div>
            </div>

            {/* Input */}
            <div className="p-4">
              <textarea 
                className="w-full text-sm text-gray-700 border-none focus:ring-0 resize-none bg-transparent placeholder-gray-400 min-h-[100px]"
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
                <button className="hover:text-[#5B5FC7] transition-colors"><Plus size={18} /></button>
                <button className="hover:text-[#5B5FC7] transition-colors"><Mic size={18} /></button>
                <button className="hover:text-[#5B5FC7] transition-colors"><HelpCircle size={18} /></button>
              </div>

              <button 
                onClick={handleSend}
                disabled={!query.trim()}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-bold text-xs transition-all
                ${query.trim() 
                  ? 'bg-[#5B5FC7] text-white hover:bg-[#4E52B1] shadow-sm' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
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
                className="text-[11px] text-[#5B5FC7] hover:underline font-medium"
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
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                AI Copilot Alliance
              </span>
            </div>
            <p className="text-[10px] font-semibold text-gray-400">
              © 2025 SERVEX INTELLIGENCE SYSTEM • V.PRO
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeamsCopilotStyle;
