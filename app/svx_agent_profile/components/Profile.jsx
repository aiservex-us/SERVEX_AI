import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { Mail, Phone, MapPin, Calendar, Briefcase, Award, ShieldCheck, Camera, Edit3 } from 'lucide-react';



export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [completeData, setCompleteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data, error } = await supabase
          .from('AI_Users')
          .select('user_personal_data, user_personal_data_complete')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          if (data.user_personal_data) {
            setProfileData(data.user_personal_data);
          }
          if (data.user_personal_data_complete) {
            setCompleteData(data.user_personal_data_complete);
          }
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);




  const nombre = profileData?.nombre || "System Administrator";
  const cargo = profileData?.cargo || "Administrador General";
  const iniciales = nombre.substring(0, 2).toUpperCase();
  // We use descripcion from completeData if available, fallback to funcion from onboarding
  const funcion = completeData?.descripcion || profileData?.funcion || "Liderazgo de estrategias tecnológicas y gestión de sistemas de IA dentro de la plataforma.";
  const telefono = completeData?.telefono || "{telefono}";
  const ubicacion = completeData?.ubicacion || "Grand Rapids, MI";
  const fotoBase64 = completeData?.fotoBase64 || null;



  return (
    <div className="w-full h-full bg-[#F8F9FA] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      
      {/* HEADER / PORTADA */}
      <div className="relative w-full h-48 sm:h-64 bg-gradient-to-r from-[#464775] to-[#6264A7] rounded-b-3xl overflow-hidden shadow-md shrink-0">
        <div className="absolute inset-0 bg-[url('/fondo.jpg')] mix-blend-overlay opacity-30 bg-cover bg-center" />
        
        {/* Cover Edit Button */}
        <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2 rounded-full transition-colors flex items-center justify-center">
          <Camera size={16} />
        </button>
      </div>

      <div className="px-6 sm:px-12 max-w-6xl mx-auto pb-12">
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <Camera className="text-white" size={24} />
                </div>
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
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm flex items-center gap-2">
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>
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

          {/* RIGHT COLUMN - ACTIVITY & FORUM */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Experience / Roles */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[15px] font-bold text-[#464775]">Current Roles</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4 relative">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 z-10">
                    <Briefcase className="text-indigo-600" size={20} />
                  </div>
                  <div className="absolute left-6 top-12 bottom-[-24px] w-px bg-slate-100" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">System Architect</h3>
                    <p className="text-xs text-indigo-600 font-medium mb-1">Servex US Core Team</p>
                    <p className="text-[13px] text-slate-600">Managing global deployment and catalog integration (WBO, WBD, WBA, etc.) for internal operations.</p>
                  </div>
                </div>

                <div className="flex gap-4 relative">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 z-10">
                    <Award className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">AI Platform Maintainer</h3>
                    <p className="text-xs text-emerald-600 font-medium mb-1">Servex Copilot Initiative</p>
                    <p className="text-[13px] text-slate-600">Supervising prompt engineering and LLM integrations ensuring zero-hallucination pipelines.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Forum Activity Mockup */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[15px] font-bold text-[#464775]">Recent Activity</h2>
                <button className="text-[11px] font-bold text-[#464775] hover:text-indigo-800 transition-colors uppercase tracking-widest">View All</button>
              </div>

              <div className="space-y-4">
                {/* Mock Post 1 */}
                <div className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer bg-[#F8F9FA]/50 group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[13px] font-bold text-slate-800 group-hover:text-[#464775] transition-colors">WBO Catalog Update Authorized</h3>
                    <span className="text-[10px] text-slate-400 font-medium">2 hours ago</span>
                  </div>
                  <p className="text-[12px] text-slate-600 line-clamp-2">The latest WBO price list update was successfully processed through the actualizer pipeline. Zero anomalies detected in list prices.</p>
                </div>

                {/* Mock Post 2 */}
                <div className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer bg-[#F8F9FA]/50 group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[13px] font-bold text-slate-800 group-hover:text-[#464775] transition-colors">Copilot System Prompt Refinement</h3>
                    <span className="text-[10px] text-slate-400 font-medium">1 day ago</span>
                  </div>
                  <p className="text-[12px] text-slate-600 line-clamp-2">Pushed new guardrails to the Audit_Agent to ensure the AI behaves as a senior strategic analyst across all W* branches.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    
  );
}
