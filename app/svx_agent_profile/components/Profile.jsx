import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/app/lib/supabaseClient';
import { Mail, Phone, MapPin, Calendar, Briefcase, Award, ShieldCheck, Camera, Edit3, Image as ImageIcon, Send, MessageSquare } from 'lucide-react';



export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [completeData, setCompleteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Social Wall States
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [newPostImageBase64, setNewPostImageBase64] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef(null);
  
  

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data, error } = await supabase
          .from('AI_Users')
          .select('user_personal_data, user_personal_data_complete, publication')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          if (data.user_personal_data) {
            setProfileData(data.user_personal_data);
          }
          if (data.user_personal_data_complete) {
            setCompleteData(data.user_personal_data_complete);
          }
          if (data.publication && Array.isArray(data.publication)) {
            setPosts(data.publication);
          }
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);




  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPostText.trim() && !newPostImageBase64) return;
    
    setIsPosting(true);
    
    const newPost = {
      id: Date.now().toString(),
      text: newPostText,
      image: newPostImageBase64,
      timestamp: new Date().toISOString(),
      author: {
        name: nombre,
        role: cargo,
        avatar: fotoBase64 || null,
        initials: iniciales
      }
    };
    
    const updatedPosts = [newPost, ...posts];
    
    try {
      const { error } = await supabase
        .from('AI_Users')
        .update({ publication: updatedPosts })
        .eq('user_id', currentUser.id);
        
      if (!error) {
        setPosts(updatedPosts);
        setNewPostText('');
        setNewPostImageBase64('');
      }
    } catch (e) {
      console.error('Error posting:', e);
    }
    
    setIsPosting(false);
  };

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
            
            {/* CREATE POST CARD */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                  {fotoBase64 ? (
                    <img src={fotoBase64} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-bold">{iniciales}</span>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="¿Qué estás pensando?"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[13.5px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#464775]/20 focus:bg-white transition-all resize-none min-h-[80px]"
                  />
                  
                  {/* Image Preview */}
                  {newPostImageBase64 && (
                    <div className="relative mt-3 inline-block">
                      <div className="rounded-xl overflow-hidden max-h-64 border border-slate-200">
                        <img src={newPostImageBase64} alt="Preview" className="w-full h-auto object-cover max-h-64" />
                      </div>
                      <button 
                        onClick={() => setNewPostImageBase64('')}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-[#464775] transition-colors text-sm font-medium"
                      >
                        <ImageIcon size={18} />
                        <span>Foto</span>
                      </button>
                    </div>
                    <button 
                      onClick={handlePostSubmit}
                      disabled={isPosting || (!newPostText.trim() && !newPostImageBase64)}
                      className="flex items-center gap-2 px-5 py-2 bg-[#464775] text-white rounded-lg hover:bg-[#35365e] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPosting ? 'Publicando...' : 'Publicar'}
                      {!isPosting && <Send size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* FEED SECTION */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                        {post.author?.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-sm font-bold">{post.author?.initials}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-[14px] font-bold text-slate-900">{post.author?.name}</h3>
                        <p className="text-[11px] text-slate-500">{post.author?.role}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      {post.timestamp ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true }) : 'Recientemente'}
                    </span>
                  </div>

                  <div className="pl-[52px]">
                    {post.text && (
                      <p className="text-[13.5px] text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
                        {post.text}
                      </p>
                    )}
                    
                    {post.image && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 mt-2 mb-4 bg-slate-50">
                        <img src={post.image} alt="Post attachment" className="w-full h-auto max-h-[500px] object-contain" />
                      </div>
                    )}
                    
                    {/* Interaction Bar Mockup */}
                    <div className="flex items-center gap-6 pt-3 border-t border-slate-100">
                      <button className="flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium">
                        <Award size={16} />
                        <span>Reconocer</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-slate-500 hover:text-[#464775] transition-colors text-sm font-medium">
                        <MessageSquare size={16} />
                        <span>Comentar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {posts.length === 0 && (
                <div className="bg-white/50 backdrop-blur-sm border border-slate-100 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <MessageSquare size={20} />
                  </div>
                  <h3 className="text-slate-800 font-bold mb-1">El muro está vacío</h3>
                  <p className="text-slate-500 text-sm">Sé el primero en compartir algo con el equipo.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
    
  );
}
