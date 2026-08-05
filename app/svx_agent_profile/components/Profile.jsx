import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/app/lib/supabaseClient';
import { Mail, Phone, MapPin, Calendar, Briefcase, Award, ShieldCheck, Camera, Edit3, Image as ImageIcon, Send, MessageSquare, TrendingUp, Zap, CheckCircle, Activity, Share2 } from 'lucide-react';



export default function Profile({ targetUserId }) {
  const [profileData, setProfileData] = useState(null);
  const [completeData, setCompleteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);

  // Kanban and Timeline States
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('todo'); // todo, in-progress, done
  const [isPosting, setIsPosting] = useState(false);
  const [modules] = useState([
    { id: '1', name: 'WBT - Tables', assignedAt: '2026-03-10' },
    { id: '2', name: 'WBA - Analysis', assignedAt: '2026-04-15' },
    { id: '3', name: 'WBD - Design', assignedAt: '2026-05-20' },
  ]);

  // Profile Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    cargo: '',
    funcion: '',
    delegado_por: '',
    telefono: '',
    ubicacion: '',
    fotoBase64: ''
  });
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        
        const profileIdToFetch = targetUserId || user.id;
        setIsOwnProfile(!targetUserId || targetUserId === user.id);

        const { data, error } = await supabase
          .from('AI_Users')
          .select('user_personal_data, user_personal_data_complete, publication')
          .eq('user_id', profileIdToFetch)
          .single();

        if (data) {
          if (data.user_personal_data) {
            setProfileData(data.user_personal_data);
          }
          if (data.user_personal_data_complete) {
            setCompleteData(data.user_personal_data_complete);
          }
          if (data.publication && Array.isArray(data.publication)) {
            const mappedTasks = data.publication.map(p => ({
              ...p,
              status: p.status || 'done'
            }));
            setTasks(mappedTasks);
          }
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);





  const handleTaskSubmit = async () => {
    if (!newTaskText.trim()) return;

    setIsPosting(true);

    const newTask = {
      id: Date.now().toString(),
      text: newTaskText,
      status: newTaskStatus,
      timestamp: new Date().toISOString(),
    };

    const updatedTasks = [newTask, ...tasks];

    try {
      const { error } = await supabase
        .from('AI_Users')
        .update({ publication: updatedTasks })
        .eq('user_id', currentUser.id);

      if (!error) {
        setTasks(updatedTasks);
        setNewTaskText('');
      }
    } catch (e) {
      console.error('Error posting task:', e);
    }

    setIsPosting(false);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    
    try {
      await supabase
        .from('AI_Users')
        .update({ publication: updatedTasks })
        .eq('user_id', currentUser.id);
    } catch (e) {
      console.error('Error updating task:', e);
    }
  };

  const handleSaveProfile = async () => {
    setIsPosting(true);
    const delegationData = {
      ...profileData,
      nombre: editForm.nombre,
      cargo: editForm.cargo,
      funcion: editForm.funcion,
      delegado_por: editForm.delegado_por,
    };
    const newCompleteData = {
      ...completeData,
      fotoBase64: editForm.fotoBase64,
      descripcion: editForm.funcion,
      telefono: editForm.telefono,
      ubicacion: editForm.ubicacion,
    };

    const { error } = await supabase.from('AI_Users').update({
      user_personal_data: delegationData,
      user_personal_data_complete: newCompleteData
    }).eq('user_id', currentUser.id);

    if (!error) {
      setProfileData(delegationData);
      setCompleteData(newCompleteData);
      setIsEditing(false);
    } else {
      console.error("Error updating profile:", error);
    }
    setIsPosting(false);
  };

  const openEditModal = () => {
    setEditForm({
      nombre: profileData?.nombre || '',
      cargo: profileData?.cargo || '',
      funcion: completeData?.descripcion || profileData?.funcion || '',
      delegado_por: profileData?.delegado_por || '',
      telefono: completeData?.telefono || '',
      ubicacion: completeData?.ubicacion || '',
      fotoBase64: completeData?.fotoBase64 || ''
    });
    setIsEditing(true);
  };

  const nombre = profileData?.nombre || "System Administrator";
  const cargo = profileData?.cargo || "Administrador General";
  const iniciales = nombre.substring(0, 2).toUpperCase();
  // We use descripcion from completeData if available, fallback to funcion from onboarding
  const funcion = completeData?.descripcion || profileData?.funcion || "Liderazgo de estrategias tecnológicas y gestión de sistemas de IA dentro de la plataforma.";
  const telefono = completeData?.telefono || "{telefono}";
  const ubicacion = completeData?.ubicacion || "Grand Rapids, MI";
  const fotoBase64 = completeData?.fotoBase64 || null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center p-4">
        <div className="animate-in fade-in zoom-in duration-1000 max-w-[80%] flex flex-col items-center justify-center">
          <img
            src="/logo2.png"
            alt="Logo"
            className="w-36 sm:w-48 h-auto object-contain transition-all duration-500 animate-pulse"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#FFF] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">

      {/* HEADER / PORTADA */}
      <div className="relative w-full h-48 sm:h-64 bg-white rounded-b-3xl overflow-hidden shadow-md shrink-0 border-b border-slate-200">
        <div className="absolute inset-0 bg-[url('/fondo.jpg')] mix-blend-overlay opacity-20 bg-cover bg-center" />

        {/* DECORATIVE BUBBLES FROM MAIN1 */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-[#464775]/20 to-[#464775]/40" />

          <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes float-bubble {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-25px) scale(1.02); }
              }
            `}} />
            <div className="absolute top-[10%] left-[2%] w-[250px] h-[250px] rounded-full backdrop-blur-[12px]" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.5) 100%)', boxShadow: 'inset -15px -15px 30px rgba(70, 71, 117, 0.15), inset 10px 10px 25px rgba(255,255,255,0.9), 0 20px 40px rgba(70,71,117,0.05)', animation: 'float-bubble 8s ease-in-out infinite' }} />
            <div className="absolute top-[15%] left-[25%] w-[380px] h-[380px] rounded-full backdrop-blur-[16px] z-10" style={{ background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0.7) 100%)', boxShadow: 'inset -25px -25px 50px rgba(70, 71, 117, 0.2), inset 15px 15px 30px rgba(255,255,255,1), 0 30px 60px rgba(70,71,117,0.1)', animation: 'float-bubble 12s ease-in-out infinite reverse' }} />
            <div className="absolute top-[5%] right-[15%] w-[220px] h-[220px] rounded-full backdrop-blur-[8px]" style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.4) 100%)', boxShadow: 'inset -10px -10px 20px rgba(70, 71, 117, 0.15), inset 8px 8px 20px rgba(255,255,255,0.8), 0 15px 30px rgba(70,71,117,0.05)', animation: 'float-bubble 9s ease-in-out infinite 2s' }} />
            <div className="absolute bottom-[5%] right-[2%] w-[450px] h-[450px] rounded-full backdrop-blur-[20px]" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.02) 70%, rgba(255,255,255,0.4) 100%)', boxShadow: 'inset -30px -30px 60px rgba(70, 71, 117, 0.1), inset 20px 20px 40px rgba(255,255,255,0.7), 0 40px 80px rgba(70,71,117,0.08)', animation: 'float-bubble 15s ease-in-out infinite 1s' }} />
          </div>
        </div>

        {/* LOGO CENTERED */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <img src="/logo.png" alt="Servex Logo" className="h-8 sm:h-10 object-contain drop-shadow-xl opacity-90" />
        </div>

        {/* Cover Edit Button */}
        {isOwnProfile && (
          <button className="absolute top-4 right-4 bg-white/40 hover:bg-white/60 backdrop-blur-md text-[#464775] p-2 rounded-full transition-colors flex items-center justify-center z-30 shadow-sm border border-white/40">
            <Camera size={16} />
          </button>
        )}
      </div>

      <div className="px-6 sm:px-12 w-full mx-auto pb-12">
        {/* AVATAR & BASIC INFO */}
        <div className="relative flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 sm:-mt-20 mb-8">
          <div className="relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full p-1.5 shadow-xl shrink-0">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden relative">
                {fotoBase64 ? (
                  <img src={fotoBase64} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-bold">{iniciales}</span>
                )}
                {/* Hover overlay for avatar */}
                {isOwnProfile && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                    <Camera className="text-white" size={24} />
                  </div>
                )}
              </div>
            </div>
            {/* Status Badge */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm" title="Online" />
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  {nombre}
                  <ShieldCheck className="text-[#464775] fill-indigo-100" size={24} />
                </h1>
                <p className="text-slate-500 font-medium">{cargo}</p>
              </div>
              {isOwnProfile && (
                <div className="flex gap-3">
                  <button onClick={openEditModal} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm flex items-center gap-2">
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN - ABOUT & INFO */}
          <div className="lg:col-span-1 space-y-6">

            {/* About Card */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-[15px] font-bold text-[#464775] mb-4">About Me</h2>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {funcion}
              </p>
            </div>

            {/* Personal Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-[15px] font-bold text-[#464775] mb-4">Personal Information</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#464775]/5 flex items-center justify-center shrink-0">
                    <Mail className="text-[#464775]" size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Email</p>
                    <p className="text-[13px] text-slate-800 font-medium">{currentUser?.email || 'admin@servex-us.com'}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#464775]/5 flex items-center justify-center shrink-0">
                    <Phone className="text-[#464775]" size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                    <p className="text-[13px] text-slate-800 font-medium">{telefono}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#464775]/5 flex items-center justify-center shrink-0">
                    <MapPin className="text-[#464775]" size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
                    <p className="text-[13px] text-slate-800 font-medium">{ubicacion}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#464775]/5 flex items-center justify-center shrink-0">
                    <Calendar className="text-[#464775]" size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Joined</p>
                    <p className="text-[13px] text-slate-800 font-medium">March 15, 2021</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN - DASHBOARD & KANBAN */}
          <div className="lg:col-span-2 space-y-6">

            {/* DASHBOARD HEADER */}
            <div className="bg-white rounded p-5 border border-[#EDEBE9] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
               <div className="flex gap-4 items-center">
                 <div className="w-10 h-10 rounded bg-[#F3F2F1] flex items-center justify-center shrink-0">
                   <Activity className="text-[#464775]" size={20} />
                 </div>
                 <div>
                   <h2 className="text-[14px] font-semibold text-[#242424] mb-1">Mi Panel de Productividad</h2>
                   <p className="text-[13px] text-[#616161]">Gestiona tus tareas, visualiza tus métricas y revisa el historial de módulos asignados.</p>
                 </div>
               </div>
            </div>

            {/* ANALYTICS CARD (TEAMS STYLE) */}
            <div className="bg-white rounded p-6 border border-[#EDEBE9] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#464775] flex items-center justify-center shrink-0">
                    <TrendingUp className="text-white" size={16} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold text-[#242424]">Mis Optimizaciones</h4>
                    <p className="text-[12px] text-[#616161]">Rendimiento histórico de mis flujos de trabajo de sincronización.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                <div className="bg-white p-3 border border-[#EDEBE9] rounded">
                   <p className="text-[11px] text-[#616161] font-semibold mb-1">Total Tareas</p>
                   <p className="text-2xl font-bold text-[#242424]">{tasks.length}</p>
                </div>
                <div className="bg-white p-3 border border-[#EDEBE9] rounded">
                   <p className="text-[11px] text-[#616161] font-semibold mb-1">Módulos Asignados</p>
                   <p className="text-2xl font-bold text-[#242424]">{modules.length}</p>
                </div>
                <div className="bg-[#F3F2F1] p-3 border border-[#EDEBE9] rounded">
                   <p className="text-[11px] text-[#464775] font-semibold mb-1">Precisión General</p>
                   <p className="text-2xl font-bold text-[#464775]">99.9%</p>
                </div>
                <div className="bg-white p-3 border border-[#EDEBE9] rounded">
                   <p className="text-[11px] text-[#616161] font-semibold mb-1">Tareas Completadas</p>
                   <p className="text-2xl font-bold text-[#107C41]">{tasks.filter(t => t.status === 'done').length}</p>
                </div>
              </div>
            </div>

            {/* TIMELINE SECTION */}
            <div className="bg-white rounded p-6 border border-[#EDEBE9] shadow-sm">
              <h3 className="text-[14px] font-semibold text-[#242424] mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-[#464775]" /> Historial de Módulos
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                {modules.map((mod, i) => (
                  <div key={mod.id} className="min-w-[150px] bg-slate-50 border border-slate-100 p-3 rounded-lg flex-shrink-0 relative">
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-500 shadow-sm border-2 border-white" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{mod.assignedAt}</p>
                    <p className="text-[13px] font-semibold text-slate-800">{mod.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* KANBAN BOARD */}
            <div className="bg-white rounded p-6 border border-[#EDEBE9] shadow-sm">
              <h3 className="text-[14px] font-semibold text-[#242424] mb-4 flex items-center gap-2">
                <CheckCircle size={16} className="text-[#464775]" /> Bitácora de Actividades
              </h3>
              
              {isOwnProfile && (
                <div className="mb-6 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Nueva tarea o registro..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded text-[13px] focus:outline-none focus:border-[#464775]"
                  />
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded text-[13px] bg-slate-50 focus:outline-none focus:border-[#464775]"
                  >
                    <option value="todo">Por Hacer</option>
                    <option value="in-progress">En Progreso</option>
                    <option value="done">Completado</option>
                  </select>
                  <button
                    onClick={handleTaskSubmit}
                    disabled={isPosting || !newTaskText.trim()}
                    className="px-4 py-2 bg-[#464775] text-white rounded text-[13px] font-medium hover:bg-[#35365e] disabled:opacity-50"
                  >
                    Agregar
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['todo', 'in-progress', 'done'].map(status => {
                  const statusTasks = tasks.filter(t => t.status === status);
                  const titles = {
                    'todo': 'Por Hacer',
                    'in-progress': 'En Progreso',
                    'done': 'Completado'
                  };
                  return (
                    <div key={status} className="bg-slate-50 rounded-lg p-3 min-h-[300px] border border-slate-100 flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[12px] font-bold text-slate-700 uppercase tracking-wider">{titles[status]}</h4>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{statusTasks.length}</span>
                      </div>
                      <div className="space-y-2 flex-1">
                        {statusTasks.map(task => (
                          <div key={task.id} className="bg-white p-3 rounded shadow-sm border border-slate-200 group relative">
                            <p className="text-[12.5px] text-slate-800 leading-snug mb-2 pr-4">{task.text}</p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                              <span className="text-[10px] text-slate-400">
                                {task.timestamp ? formatDistanceToNow(new Date(task.timestamp), { addSuffix: true }) : ''}
                              </span>
                              {isOwnProfile && (
                                <select 
                                  value={task.status} 
                                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                  className="text-[10px] p-1 border border-slate-200 rounded text-slate-600 bg-slate-50 focus:outline-none"
                                >
                                  <option value="todo">Mover a Hacer</option>
                                  <option value="in-progress">Mover a Progreso</option>
                                  <option value="done">Mover a Completado</option>
                                </select>
                              )}
                            </div>
                          </div>
                        ))}
                        {statusTasks.length === 0 && (
                          <div className="h-full w-full flex items-center justify-center py-4">
                            <p className="text-[11px] text-slate-400">Sin tareas</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
               {/* Photo */}
               <div className="flex flex-col items-center gap-3">
                 <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden relative group shadow-inner">
                   {editForm.fotoBase64 ? (
                     <img src={editForm.fotoBase64} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-400">
                       <Camera size={32} />
                     </div>
                   )}
                   <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                     <Camera size={24} className="text-white" />
                     <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                       const file = e.target.files[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onloadend = () => setEditForm(prev => ({...prev, fotoBase64: reader.result}));
                         reader.readAsDataURL(file);
                       }
                     }} />
                   </label>
                 </div>
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Profile Photo</span>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                   <input type="text" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#464775] focus:ring-1 focus:ring-[#464775] transition-shadow bg-slate-50 focus:bg-white" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cargo</label>
                   <input type="text" value={editForm.cargo} onChange={e => setEditForm({...editForm, cargo: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#464775] focus:ring-1 focus:ring-[#464775] transition-shadow bg-slate-50 focus:bg-white" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Teléfono</label>
                   <input type="text" value={editForm.telefono} onChange={e => setEditForm({...editForm, telefono: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#464775] focus:ring-1 focus:ring-[#464775] transition-shadow bg-slate-50 focus:bg-white" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ubicación</label>
                   <input type="text" value={editForm.ubicacion} onChange={e => setEditForm({...editForm, ubicacion: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#464775] focus:ring-1 focus:ring-[#464775] transition-shadow bg-slate-50 focus:bg-white" />
                 </div>
                 <div className="sm:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Delegado Por</label>
                   <input type="text" value={editForm.delegado_por} onChange={e => setEditForm({...editForm, delegado_por: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#464775] focus:ring-1 focus:ring-[#464775] transition-shadow bg-slate-50 focus:bg-white" />
                 </div>
                 <div className="sm:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Acerca de / Función Principal</label>
                   <textarea rows={3} value={editForm.funcion} onChange={e => setEditForm({...editForm, funcion: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-[#464775] focus:ring-1 focus:ring-[#464775] resize-none transition-shadow bg-slate-50 focus:bg-white"></textarea>
                 </div>
               </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
               <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                 Cancelar
               </button>
               <button onClick={handleSaveProfile} disabled={isPosting} className="px-5 py-2 text-sm font-medium text-white bg-[#464775] rounded-lg hover:bg-[#35365e] transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2">
                 {isPosting ? 'Guardando...' : 'Guardar Cambios'}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>

  );
}
