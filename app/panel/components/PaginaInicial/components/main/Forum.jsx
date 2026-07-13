import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
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
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Share2,
  Download,
  Users,
  Settings,
  Bell,
  Search,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Send
} from 'lucide-react';

const MODULES_CONFIG = [
  {
    key: 'WBT',
    title: 'Tables & Worksurfaces',
    agentName: 'Agent MCP - Tables',
    logo: '/logosEmpresas/WB.webp',
    icon: <LayoutGrid className="w-5 h-5" />
  },
  {
    key: 'WBS',
    title: 'Seating Diagnostics',
    agentName: 'Agent MCP - Seating',
    logo: '/logosEmpresas/WB.webp',
    icon: <Briefcase className="w-5 h-5" />
  },
  {
    key: 'WBD',
    title: 'Executive Desks',
    agentName: 'Agent MCP - Desks',
    logo: '/logosEmpresas/WB.webp',
    icon: <Monitor className="w-5 h-5" />
  },
  {
    key: 'WBO',
    title: 'Open Workstations',
    agentName: 'Agent MCP - Workstations',
    logo: '/logosEmpresas/WB.webp',
    icon: <Box className="w-5 h-5" />
  },
  {
    key: 'WBG',
    title: 'Acoustic Panels & Graphics',
    agentName: 'Agent MCP - Panels',
    logo: '/logosEmpresas/WB.webp',
    icon: <Layers className="w-5 h-5" />
  }
];

const Forum = () => {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for comments (ephemeral until DB is linked)
  const [comments, setComments] = useState({
    WBT: [
      { id: 1, user: 'System Admin', text: 'Pricing patterns look stable. Please monitor the L-Series.', time: '2 hours ago', avatar: 'https://ui-avatars.com/api/?name=Admin&background=464775&color=fff' }
    ]
  });
  const [activeCommentSection, setActiveCommentSection] = useState(null); // module key
  const [newCommentText, setNewCommentText] = useState("");

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

  const handleAddComment = (moduleKey) => {
    if (!newCommentText.trim()) return;
    
    const newComment = {
      id: Date.now(),
      user: 'System Admin',
      text: newCommentText,
      time: 'Just now',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=464775&color=fff'
    };

    setComments(prev => ({
      ...prev,
      [moduleKey]: [...(prev[moduleKey] || []), newComment]
    }));
    setNewCommentText("");
  };

  const toggleComments = (moduleKey) => {
    setActiveCommentSection(prev => prev === moduleKey ? null : moduleKey);
  };

  const renderMarkdown = (content) => (
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
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="relative w-[95%] h-[90vh] mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#464775]/20 flex flex-col bg-slate-50 font-sans">
      
      {/* BACKGROUND (ESTILO AI CHAT) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="/fondo.jpg" alt="Background" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-[#464775]/5 to-[#464775]/15" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/10 to-transparent border-l border-white/60 shadow-[1px_0_10px_rgba(0,0,0,0.03)]" />
        </div>
      </div>

      {/* HEADER NAVBAR (ESTILO RED SOCIAL) */}
      <header className="relative z-20 h-16 bg-white/70 backdrop-blur-xl border-b border-white/50 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#464775] to-[#2B2C4B] rounded-lg flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none">Servex AI Network</h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Global Audit Feed</p>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-8 relative hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-full text-xs bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#464775]/20 focus:border-[#464775]/50 transition-all text-slate-700 placeholder-slate-400"
            placeholder="Search audits, modules, or pricing alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:bg-white/50 hover:text-[#464775] rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button onClick={fetchAuditData} className="p-2 text-slate-400 hover:bg-white/50 hover:text-[#464775] rounded-full transition-colors">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white ml-2 overflow-hidden shadow-sm">
             <img src="/avatar_placeholder.jpg" alt="User" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Admin&background=464775&color=fff'; }} />
          </div>
        </div>
      </header>

      {/* THREE COLUMN LAYOUT */}
      <div className="relative z-20 flex-1 flex min-h-0 w-full max-w-7xl mx-auto px-4 py-6 gap-6">
        
        {/* LEFT SIDEBAR: PROFILE & SHORTCUTS */}
        <aside className="w-64 flex flex-col gap-5 shrink-0 hidden lg:flex">
          {/* System Profile Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/80 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#464775] to-indigo-400 p-0.5 shadow-md">
                 <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=Admin&background=fff&color=464775" alt="User" className="w-full h-full object-cover" />
                 </div>
               </div>
               <div>
                 <h3 className="font-bold text-slate-800 text-sm">System Admin</h3>
                 <span className="text-[11px] font-medium text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                 </span>
               </div>
            </div>
            <div className="border-t border-slate-100 pt-4 flex justify-between text-center">
              <div>
                <div className="font-bold text-slate-800 text-sm">54</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Updates</div>
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">5</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Modules</div>
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">99%</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">Health</div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/80">
            <nav className="flex flex-col gap-1">
               <a href="#" className="flex items-center gap-3 px-3 py-2 bg-[#464775]/5 text-[#464775] font-semibold text-sm rounded-lg">
                 <Activity className="w-4 h-4" /> Live Feed
               </a>
               <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 font-medium text-sm rounded-lg transition-colors">
                 <Users className="w-4 h-4" /> Active Agents
               </a>
               <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 font-medium text-sm rounded-lg transition-colors">
                 <DatabaseZap className="w-4 h-4" /> Databases
               </a>
               <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 font-medium text-sm rounded-lg transition-colors">
                 <Settings className="w-4 h-4" /> Configuration
               </a>
            </nav>
          </div>
        </aside>

        {/* CENTER FEED: INFINITE SCROLL OF POSTS */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-none pb-10">
          
          {/* Compose Post Area (Read-only visual) */}
          <div className="bg-white/90 backdrop-blur-2xl rounded-2xl p-4 shadow-sm border border-white mb-6 shrink-0 flex gap-3">
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden shrink-0">
               <img src="https://ui-avatars.com/api/?name=Admin&background=464775&color=fff" alt="User" className="w-full h-full object-cover" />
             </div>
             <div className="flex-1">
                <div className="w-full h-10 bg-slate-50 rounded-full border border-slate-200 flex items-center px-4 text-sm text-slate-400">
                  Awaiting new audit triggers from the ETL modules...
                </div>
             </div>
          </div>

          {/* Feed Posts */}
          <div className="flex flex-col gap-6">
            {loading ? (
               <div className="flex flex-col items-center justify-center text-center py-20">
                 <RefreshCw className="w-8 h-8 text-[#464775] animate-spin mb-4" />
                 <span className="text-sm font-bold text-slate-500">Loading Feed...</span>
               </div>
            ) : error ? (
               <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm font-medium border border-red-100">
                 {error}
               </div>
            ) : !auditData ? (
               <div className="flex flex-col items-center justify-center text-center py-20 bg-white/40 rounded-2xl border border-white">
                 <Box className="w-12 h-12 text-slate-300 mb-4" />
                 <h3 className="text-lg font-bold text-slate-600">No Audits Found</h3>
                 <p className="text-xs text-slate-500 mt-1 max-w-xs">There are no reports available in the master database yet.</p>
               </div>
            ) : (
              MODULES_CONFIG.map((module) => {
                const markdown = auditData[module.key];
                if (!markdown || markdown.trim() === "") return null;

                // Simple search filter
                if (searchQuery && !markdown.toLowerCase().includes(searchQuery.toLowerCase()) && !module.key.toLowerCase().includes(searchQuery.toLowerCase())) return null;

                const moduleComments = comments[module.key] || [];
                const isCommentsOpen = activeCommentSection === module.key;

                return (
                  <article key={module.key} className="bg-white/95 backdrop-blur-3xl rounded-[1.5rem] shadow-md border border-white overflow-hidden transition-all flex flex-col">
                    
                    {/* Post Header */}
                    <div className="p-5 pb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-1.5 shrink-0">
                          <img src={module.logo} alt={module.key} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-[15px] flex items-center gap-1.5 leading-none mb-1">
                            {module.agentName}
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                          </h4>
                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                            AI Auditor Engine • {new Date(auditData.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Post Body (Markdown) */}
                    <div className="px-6 py-2 text-[13px] text-slate-700">
                      <div className="inline-flex items-center gap-1.5 bg-[#464775]/10 text-[#464775] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-4 border border-[#464775]/10">
                        {module.title}
                      </div>
                      <div className="prose-container overflow-hidden">
                        {renderMarkdown(markdown)}
                      </div>
                    </div>

                    {/* Post Footer Actions */}
                    <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex gap-1">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold">
                          <ThumbsUp className="w-4 h-4" /> Like
                        </button>
                        <button 
                          onClick={() => toggleComments(module.key)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold ${isCommentsOpen ? 'text-[#464775] bg-[#464775]/10' : 'text-slate-500 hover:text-[#464775] hover:bg-[#464775]/5'}`}
                        >
                          <MessageSquare className="w-4 h-4" /> Comment {moduleComments.length > 0 && <span className="bg-[#464775] text-white px-1.5 py-0.5 rounded-full text-[9px]">{moduleComments.length}</span>}
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs font-bold">
                          <Share2 className="w-4 h-4" /> Share
                        </button>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-[#464775] hover:border-[#464775]/30 rounded-lg transition-all text-xs font-bold">
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>

                    {/* SOPHISTICATED COMMENTS SECTION (TEAMS STYLE) */}
                    {isCommentsOpen && (
                      <div className="bg-slate-50/50 border-t border-slate-100 flex flex-col p-5">
                        
                        {/* Existing Comments Thread */}
                        <div className="flex flex-col gap-4 mb-5">
                          {moduleComments.length === 0 ? (
                            <p className="text-xs text-slate-400 italic text-center py-2">No feedback yet. Be the first to reply to this audit.</p>
                          ) : (
                            moduleComments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <img src={comment.avatar} alt="Avatar" className="w-8 h-8 rounded-full shadow-sm border border-white" />
                                <div className="flex flex-col bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[13px] font-bold text-slate-800">{comment.user}</span>
                                    <span className="text-[10px] text-slate-400">{comment.time}</span>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed">{comment.text}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Reply Input Box */}
                        <div className="flex items-end gap-3 mt-auto">
                          <img src="https://ui-avatars.com/api/?name=Admin&background=464775&color=fff" alt="You" className="w-8 h-8 rounded-full border-2 border-white shadow-sm shrink-0" />
                          <div className="flex-1 bg-white border border-slate-200 rounded-[1.25rem] shadow-inner p-1.5 flex items-center focus-within:border-[#464775]/50 focus-within:ring-2 focus-within:ring-[#464775]/10 transition-all">
                            <input
                              type="text"
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(module.key); }}
                              placeholder="Write your feedback..."
                              className="flex-1 bg-transparent text-xs text-slate-700 px-3 focus:outline-none placeholder-slate-400"
                            />
                            <button 
                              onClick={() => handleAddComment(module.key)}
                              disabled={!newCommentText.trim()}
                              className="w-8 h-8 rounded-full bg-[#464775] text-white flex items-center justify-center hover:bg-[#34355a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            >
                              <Send className="w-3.5 h-3.5 ml-0.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                  </article>
                );
              })
            )}
          </div>
        </main>

        {/* RIGHT SIDEBAR: TRENDING & STATS */}
        <aside className="w-72 flex flex-col gap-5 shrink-0 hidden xl:flex">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/80">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[#464775]" /> Trending Modules
            </h3>
            <div className="flex flex-col gap-3">
              {MODULES_CONFIG.slice(0, 3).map((mod, i) => (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center text-[#464775]">
                    {mod.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 text-xs">{mod.key} Segment</h4>
                    <span className="text-[10px] text-slate-500">24 updates today</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-white/80">
             <h3 className="font-bold text-slate-800 text-sm mb-3">System Health</h3>
             <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                <div className="bg-green-500 h-2 rounded-full w-[95%]"></div>
             </div>
             <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>Memory: 42%</span>
                <span>CPU: 18%</span>
             </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Forum;
