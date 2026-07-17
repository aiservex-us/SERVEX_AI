import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ShieldCheck, 
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
  Bell,
  Search,
  CheckCircle2,
  Send,
  BadgeCheck
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

// Parser robusto para user_personal_data
const parseUserData = (dataStr, fallbackAgentName) => {
  if (!dataStr) return { name: fallbackAgentName, role: 'AI Auditor Engine', initials: 'AI' };
  try {
    const parsed = JSON.parse(dataStr);
    const name = parsed.name || parsed.Nombre || parsed.username || fallbackAgentName;
    const role = parsed.role || parsed.Rol || parsed.position || 'Audit Analyst';
    return { name, role, initials: name.substring(0, 2).toUpperCase() };
  } catch (e) {
    return { name: dataStr, role: 'Audit Analyst', initials: dataStr.substring(0, 2).toUpperCase() };
  }
};

const Forum = () => {
  const [auditData, setAuditData] = useState(null);
  const [userDataMap, setUserDataMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [comments, setComments] = useState({});
  const [activeCommentSection, setActiveCommentSection] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch Audit Data
      const { data, error: sbError } = await supabase
        .from('ClientSERVEX_Audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sbError) throw sbError;
      setAuditData(data);

      // 2. Fetch User Personal Data for each module in parallel
      const userMap = {};
      await Promise.all(
        MODULES_CONFIG.map(async (mod) => {
          try {
            const { data: userData } = await supabase
              .from(`ClientsSERVEX_${mod.key}`)
              .select('user_personal_data')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (userData && userData.user_personal_data) {
              userMap[mod.key] = userData.user_personal_data;
            }
          } catch (e) {
             // Ignorar errores silentes si la tabla no existe o falla permisos
          }
        })
      );
      setUserDataMap(userMap);

    } catch (err) {
      console.error('Error fetching data:', err);
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
      user: 'Current User', // This would ideally be the logged-in user
      text: newCommentText,
      time: 'Just now',
      avatar: 'https://ui-avatars.com/api/?name=Me&background=0F172A&color=fff'
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

  // Renderizado Markdown minimalista y corporativo para muro tipo red social
  const renderMarkdown = (content) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-[1.1rem] font-bold text-[#464775] mb-2 mt-4 tracking-tight" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-sm font-bold text-[#464775] mb-2 mt-4" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-[13px] font-bold text-[#464775] mb-1 mt-3" {...props} />,
        p: ({node, ...props}) => <p className="mb-3 text-[13px] text-slate-800 leading-relaxed" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-0.5 mb-3 text-[13px] text-slate-800" {...props} />,
        table: ({node, ...props}) => (
          <div className="w-full overflow-x-auto my-3 border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse text-[11px]" {...props} />
          </div>
        ),
        thead: ({node, ...props}) => <thead className="bg-[#464775]/5 border-b border-gray-100 text-[#464775] uppercase tracking-wider font-bold text-[9px]" {...props} />,
        th: ({node, ...props}) => <th className="px-3 py-2 whitespace-nowrap" {...props} />,
        td: ({node, ...props}) => <td className="px-3 py-2 border-b border-gray-50 text-slate-800 last:border-0" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold text-[#464775]" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="relative w-full h-full flex flex-col font-sans overflow-hidden bg-white">
      
      {/* HEADER NAVBAR (Minimalista) */}
      <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-[15px] font-bold text-slate-900 tracking-tight">Audit Network</h1>
        </div>
        
        <div className="flex-1 max-w-lg mx-6 relative hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 bg-slate-100 border-none rounded-full text-[13px] focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all text-slate-800 placeholder-slate-500"
            placeholder="Search feed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchAuditData} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-900 ml-2 overflow-hidden flex items-center justify-center">
             <span className="text-white text-[10px] font-bold">ME</span>
          </div>
        </div>
      </header>

      {/* CENTER FEED */}
      <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <div className="w-[90%] mx-auto py-2 sm:px-0 flex flex-col">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center text-center py-20">
               <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mb-3" />
               <span className="text-xs font-semibold text-slate-500">Syncing feed...</span>
             </div>
          ) : error ? (
             <div className="bg-red-50 text-red-600 p-3 rounded-md text-center text-xs font-medium border border-red-100">
               {error}
             </div>
          ) : !auditData ? (
             <div className="flex flex-col items-center justify-center text-center py-20">
               <Box className="w-8 h-8 text-slate-300 mb-3" />
               <h3 className="text-sm font-semibold text-slate-600">No Audits Found</h3>
             </div>
          ) : (
            MODULES_CONFIG.map((module) => {
              const markdown = auditData[module.key];
              if (!markdown || markdown.trim() === "") return null;

              if (searchQuery && !markdown.toLowerCase().includes(searchQuery.toLowerCase()) && !module.key.toLowerCase().includes(searchQuery.toLowerCase())) return null;

              const moduleComments = comments[module.key] || [];
              const isCommentsOpen = activeCommentSection === module.key;

              // Parse User Data dynamically
              const userInfo = parseUserData(userDataMap[module.key], module.agentName);
              const postDate = new Date(auditData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

              return (
                <article key={module.key} className="border-b border-gray-100 bg-white py-6 flex gap-3 hover:bg-gray-50/30 transition-colors">
                  
                  {/* Left Column: Avatar */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {userDataMap[module.key] ? (
                        <span className="text-slate-600 font-bold text-sm">{userInfo.initials}</span>
                      ) : (
                         <img src={module.logo} alt="Agent" className="w-6 h-6 object-contain" />
                      )}
                    </div>
                  </div>

                  {/* Right Column: Content */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 truncate">
                        <h4 className="font-bold text-slate-900 text-[14px] flex items-center gap-1 hover:underline cursor-pointer truncate">
                          {userInfo.name}
                          <BadgeCheck className="w-4 h-4 text-blue-500 shrink-0" />
                        </h4>
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-500 truncate">
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">{userInfo.role}</span>
                          <span>•</span>
                          <span className="shrink-0">{postDate}</span>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Tag */}
                    <span className="inline-block text-[10px] font-bold text-[#464775] mb-2">#{module.key}_Audit</span>

                    {/* Markdown Body */}
                    <div className="prose-container overflow-hidden pr-2">
                      {renderMarkdown(markdown)}
                    </div>

                    {/* Action Bar (Twitter Style) */}
                    <div className="flex items-center justify-between mt-3 text-slate-500 max-w-md">
                      <button 
                        onClick={() => toggleComments(module.key)}
                        className={`flex items-center gap-2 group text-[13px] transition-colors ${isCommentsOpen ? 'text-blue-500' : 'hover:text-blue-500'}`}
                      >
                        <div className={`p-1.5 rounded-full transition-colors ${isCommentsOpen ? 'bg-blue-50' : 'group-hover:bg-blue-50'}`}>
                           <MessageSquare className="w-4 h-4" />
                        </div>
                        {moduleComments.length > 0 && <span className="font-medium">{moduleComments.length}</span>}
                      </button>
                      
                      <button className="flex items-center gap-2 group text-[13px] hover:text-green-500 transition-colors">
                        <div className="p-1.5 rounded-full group-hover:bg-green-50 transition-colors">
                           <RefreshCw className="w-4 h-4" />
                        </div>
                      </button>

                      <button className="flex items-center gap-2 group text-[13px] hover:text-red-500 transition-colors">
                        <div className="p-1.5 rounded-full group-hover:bg-red-50 transition-colors">
                           <ThumbsUp className="w-4 h-4" />
                        </div>
                      </button>

                      <button className="flex items-center gap-2 group text-[13px] hover:text-blue-500 transition-colors">
                        <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
                           <Download className="w-4 h-4" />
                        </div>
                      </button>
                    </div>

                    {/* INLINE COMMENTS THREAD */}
                    {isCommentsOpen && (
                      <div className="mt-3 border-l-2 border-slate-100 pl-4 py-1">
                        {moduleComments.map((comment) => (
                          <div key={comment.id} className="flex gap-2 mb-3 last:mb-0">
                            <img src={comment.avatar} alt="Avatar" className="w-6 h-6 rounded-full shrink-0" />
                            <div className="flex flex-col bg-slate-50 p-2.5 rounded-lg rounded-tl-none w-full">
                              <div className="flex items-baseline justify-between mb-0.5">
                                <span className="text-[12px] font-bold text-slate-900">{comment.user}</span>
                                <span className="text-[10px] text-slate-400">{comment.time}</span>
                              </div>
                              <p className="text-[12px] text-slate-700">{comment.text}</p>
                            </div>
                          </div>
                        ))}

                        {/* Reply Input */}
                        <div className="flex items-center gap-2 mt-3 w-full">
                          <img src="https://ui-avatars.com/api/?name=Me&background=0F172A&color=fff" alt="You" className="w-6 h-6 rounded-full shrink-0" />
                          <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 focus-within:border-blue-400 transition-colors">
                            <input
                              type="text"
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(module.key); }}
                              placeholder="Post your reply..."
                              className="flex-1 bg-transparent text-[12px] text-slate-800 focus:outline-none placeholder-slate-400"
                            />
                            <button 
                              onClick={() => handleAddComment(module.key)}
                              disabled={!newCommentText.trim()}
                              className="text-blue-500 font-bold text-[12px] disabled:opacity-50 disabled:cursor-not-allowed px-1"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
          
          {!loading && auditData && (
             <div className="text-center py-8">
               <span className="text-xs font-semibold text-slate-400">You've reached the end of the feed.</span>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Forum;
