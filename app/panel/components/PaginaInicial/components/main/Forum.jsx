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

  // Renderizado Markdown con estética GLYNNE_SITE_2026
  const renderMarkdown = (content) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#111111', margin: '16px 0 8px 0', letterSpacing: '-0.01em' }} {...props} />,
        h2: ({node, ...props}) => <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#111111', margin: '16px 0 8px 0', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '8px' }} {...props} />,
        h3: ({node, ...props}) => <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#111111', margin: '12px 0 4px 0' }} {...props} />,
        p: ({node, ...props}) => <p style={{ fontSize: '12px', color: '#86868b', fontWeight: 300, lineHeight: 1.6, marginBottom: '12px' }} {...props} />,
        ul: ({node, ...props}) => <ul style={{ fontSize: '12px', color: '#86868b', fontWeight: 300, lineHeight: 1.6, marginBottom: '12px', listStyleType: 'disc', paddingLeft: '16px' }} {...props} />,
        table: ({node, ...props}) => (
          <div className="w-full overflow-x-auto my-4 border border-slate-200/60 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse text-[11px] divide-y divide-slate-100" {...props} />
          </div>
        ),
        thead: ({node, ...props}) => <thead className="bg-slate-50 text-slate-500 uppercase tracking-widest font-semibold text-[9px] border-b border-slate-200/60" {...props} />,
        th: ({node, ...props}) => <th className="px-4 py-3 whitespace-nowrap" {...props} />,
        tr: ({node, ...props}) => <tr className="hover:bg-slate-50/50 transition-colors" {...props} />,
        td: ({node, ...props}) => <td className="px-4 py-3 text-slate-600 border-t border-slate-100" {...props} />,
        strong: ({node, ...props}) => <strong style={{ fontWeight: 500, color: '#111111' }} {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="relative w-full h-full flex flex-col font-sans overflow-hidden bg-white">
      
      {/* HEADER NAVBAR */}
      <header className="h-16 bg-[#f8f9fb] border-b border-slate-200/60 flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 500, color: '#111111', letterSpacing: '-0.01em', margin: 0 }}>Audit Reports Hub</h2>
          <p style={{ fontSize: '11px', color: '#86868b', fontWeight: 300, margin: 0 }}>Centralized log of all AI autonomous inspections</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-8 py-2 bg-white border border-slate-200/60 rounded-full text-[12px] focus:outline-none focus:border-slate-300 transition-all text-slate-800 placeholder-slate-400 shadow-sm"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={fetchAuditData} className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200/60 shadow-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* CENTER FEED */}
      <main className="flex-1 overflow-y-auto bg-[#f8f9fb] p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
          
          {loading ? (
             <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-[20px] border border-slate-200/60 shadow-sm">
               <RefreshCw className="w-6 h-6 text-slate-400 animate-spin mb-3" />
               <span style={{ fontSize: '12px', fontWeight: 500, color: '#86868b' }}>Syncing reports...</span>
             </div>
          ) : error ? (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-[12px] font-medium border border-red-100 shadow-sm">
               {error}
             </div>
          ) : !auditData ? (
             <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-[20px] border border-slate-200/60 shadow-sm">
               <Box className="w-8 h-8 text-slate-300 mb-3" />
               <h3 style={{ fontSize: '13px', fontWeight: 500, color: '#111111' }}>No Audits Found</h3>
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
                <article key={module.key} className="bg-white rounded-[20px] shadow-sm border border-slate-200/60 overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                  
                  {/* Card Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                        {userDataMap[module.key] ? (
                          <span className="text-slate-700 font-bold text-[13px]">{userInfo.initials}</span>
                        ) : (
                           <img src={module.logo} alt="Agent" className="w-6 h-6 object-contain" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <h4 style={{ fontSize: '13px', fontWeight: 500, color: '#111111', margin: 0 }}>
                            {userInfo.name}
                          </h4>
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <span style={{ fontSize: '11px', color: '#86868b', fontWeight: 300, letterSpacing: '0.01em' }}>
                          {userInfo.role} • {postDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '9px', fontWeight: 500, color: '#86868b', letterSpacing: '0.05em', textTransform: 'uppercase', padding: '4px 8px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '999px' }}>
                        #{module.key}_Audit
                      </span>
                      <button className="text-slate-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-200/50 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    
                    {/* Markdown Body with Scroll */}
                    <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-4 mb-4">
                      {renderMarkdown(markdown)}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-slate-500">
                      <button 
                        onClick={() => toggleComments(module.key)}
                        className={`flex items-center gap-1.5 group text-[12px] font-medium transition-colors ${isCommentsOpen ? 'text-slate-800' : 'hover:text-slate-800'}`}
                      >
                        <div className={`p-1.5 rounded-md transition-colors ${isCommentsOpen ? 'bg-slate-100' : 'group-hover:bg-slate-100'}`}>
                           <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <span>Discussions {moduleComments.length > 0 && `(${moduleComments.length})`}</span>
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors">
                           <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors">
                           <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors">
                           <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* INLINE COMMENTS THREAD */}
                    {isCommentsOpen && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        {moduleComments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 mb-4 last:mb-0">
                            <img src={comment.avatar} alt="Avatar" className="w-7 h-7 rounded-full shrink-0 border border-slate-200" />
                            <div className="flex flex-col bg-slate-50/80 p-3 rounded-xl w-full border border-slate-100 shadow-sm">
                              <div className="flex items-baseline justify-between mb-1">
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#111111' }}>{comment.user}</span>
                                <span style={{ fontSize: '10px', color: '#86868b' }}>{comment.time}</span>
                              </div>
                              <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>{comment.text}</p>
                            </div>
                          </div>
                        ))}

                        {/* Reply Input */}
                        <div className="flex items-center gap-3 mt-4 w-full">
                          <img src="https://ui-avatars.com/api/?name=Me&background=0F172A&color=fff" alt="You" className="w-7 h-7 rounded-full shrink-0 border border-slate-200" />
                          <div className="flex-1 flex items-center bg-white border border-slate-200/80 rounded-xl px-4 py-2 focus-within:border-slate-400 focus-within:shadow-sm transition-all shadow-sm">
                            <input
                              type="text"
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(module.key); }}
                              placeholder="Write a comment..."
                              className="flex-1 bg-transparent text-[12px] text-slate-800 focus:outline-none placeholder-slate-400"
                            />
                            <button 
                              onClick={() => handleAddComment(module.key)}
                              disabled={!newCommentText.trim()}
                              className="text-slate-800 font-medium text-[12px] disabled:opacity-40 disabled:cursor-not-allowed px-2 hover:text-black transition-colors"
                            >
                              Post
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
