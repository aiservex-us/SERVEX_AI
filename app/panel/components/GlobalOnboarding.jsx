"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Loader2, User, CheckCircle, Camera, Upload } from 'lucide-react';

export default function GlobalOnboarding({ children }) {
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [funcion, setFuncion] = useState('');
  const [delegadoPor, setDelegadoPor] = useState('');
  const [comentarios, setComentarios] = useState('');
  
  // Extra states for complete profile
  const [fotoBase64, setFotoBase64] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const fileInputRef = React.useRef(null);
  
  const [chatStep, setChatStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setCurrentUser(user);

      // Revisar si ya está en AI_Users
      const { data: aiUsersData, error: aiError } = await supabase
        .from('AI_Users')
        .select('user_personal_data')
        .eq('user_id', user.id)
        .limit(1);

      if (aiError) {
        console.warn("⚠️ Error fetching from AI_Users (Table might not exist):", aiError.message);
        setNeedsOnboarding(true);
      } else if (aiUsersData && aiUsersData.length > 0 && aiUsersData[0].user_personal_data) {
        setNeedsOnboarding(false);
      } else {
        setNeedsOnboarding(true);
      }
    } catch (e) {
      console.error("Error in GlobalOnboarding:", e);
      setNeedsOnboarding(true);
    }
    setLoading(false);
  };

  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const delegationData = {
        nombre,
        cargo,
        funcion,
        delegado_por: delegadoPor,
        comentarios,
        timestamp: new Date().toISOString()
      };
      
      const completeData = {
        fotoBase64,
        descripcion: funcion, // Use function as description since we merged it
        telefono,
        ubicacion,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase.from('AI_Users').insert([{
        user_id: currentUser.id,
        user_personal_data: delegationData,
        user_personal_data_complete: completeData
      }]);

      if (error) {
        throw error;
      }

      setNeedsOnboarding(false);
    } catch (e) {
      console.error(e);
      setErrorMsg('Error guardando los datos. Revisa la consola o asegúrate que la tabla AI_Users exista.');
    }
    setIsSubmitting(false);
  };


  const hasPlayedAudio = useRef(false);
  useEffect(() => {
    if (!loading && !hasPlayedAudio.current) {
      hasPlayedAudio.current = true;
      try {
        const audio = new Audio('/universfield-new-notification-030-480567.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio autoplay prevented', e));
      } catch (e) {}
    }
  }, [loading]);

  const renderChatStep = () => {
    const animationProps = {
      initial: { opacity: 0, y: 15, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: -15, scale: 0.98 },
      transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
    };

    const Avatar = () => (
      <motion.div 
        whileHover={{ scale: 1.05, rotate: -5 }}
        className="relative w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white bg-gradient-to-br from-[#464775] to-[#35365e] shadow-md z-10"
      >
        <Sparkles size={18} />
        <span className="absolute -inset-1 rounded-[16px] border border-[#464775]/30 animate-pulse" />
      </motion.div>
    );

    switch (chatStep) {
      case 0:
        return (
          <motion.div key="step-0" {...animationProps} className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="flex gap-4 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-semibold text-gray-400 mb-1 ml-1">Alysa</span>
                <div className="px-5 py-4 bg-gray-50/80 backdrop-blur-md border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm w-full">
                  <p className="text-gray-700 text-[13.5px] leading-relaxed m-0">
                    Hola, soy <strong>Alysa</strong>. Bienvenid@ a SERVEX AI. Antes de mostrarte el Panel Principal, necesito configurar tu Perfil. ¿Comenzamos?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setChatStep(1)}
                className="bg-[#464775] text-white px-6 py-2.5 rounded-xl text-[13px] font-medium hover:bg-[#35365e] transition-all hover:shadow-md hover:-translate-y-px"
              >
                Start
              </button>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="step-1" {...animationProps} className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="flex gap-4 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-semibold text-gray-400 mb-1 ml-1">Alysa</span>
                <div className="px-5 py-4 bg-gray-50/80 backdrop-blur-md border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm w-full">
                  <p className="text-gray-700 text-[13.5px] leading-relaxed mb-4">
                    Perfecto. Primero que todo, <strong>¿Cuál es tu nombre completo?</strong>
                  </p>
                  <div className="relative">
                    <input 
                      autoFocus
                      type="text" 
                      value={nombre} 
                      onChange={e => setNombre(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && nombre.trim() && setChatStep(2)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#464775]/40 transition-all shadow-inner placeholder-gray-400"
                      placeholder="E.g., John Doe..." 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => nombre.trim() && setChatStep(2)}
                disabled={!nombre.trim()}
                className="bg-[#464775] text-white px-6 py-2.5 rounded-xl text-[13px] font-medium hover:bg-[#35365e] transition-all hover:shadow-md hover:-translate-y-px disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step-2" {...animationProps} className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="flex gap-4 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-semibold text-gray-400 mb-1 ml-1">Alysa</span>
                <div className="px-5 py-4 bg-gray-50/80 backdrop-blur-md border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm w-full">
                  <p className="text-gray-700 text-[13.5px] leading-relaxed mb-4">
                    Mucho gusto, {nombre}. <strong>¿Qué cargo ocupas actualmente?</strong>
                  </p>
                  <div className="relative">
                    <input 
                      autoFocus
                      type="text" 
                      value={cargo} 
                      onChange={e => setCargo(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && cargo.trim() && setChatStep(3)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#464775]/40 transition-all shadow-inner placeholder-gray-400"
                      placeholder="E.g., Data Analyst..." 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => cargo.trim() && setChatStep(3)}
                disabled={!cargo.trim()}
                className="bg-[#464775] text-white px-6 py-2.5 rounded-xl text-[13px] font-medium hover:bg-[#35365e] transition-all hover:shadow-md hover:-translate-y-px disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step-3" {...animationProps} className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="flex gap-4 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-semibold text-gray-400 mb-1 ml-1">Alysa</span>
                <div className="px-5 py-4 bg-gray-50/80 backdrop-blur-md border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm w-full">
                  <p className="text-gray-700 text-[13.5px] leading-relaxed mb-4">
                    Entendido. <strong>¿Quién autoriza o delega tu acceso a la plataforma?</strong>
                  </p>
                  <div className="relative">
                    <input 
                      autoFocus
                      type="text" 
                      value={delegadoPor} 
                      onChange={e => setDelegadoPor(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && delegadoPor.trim() && setChatStep(4)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#464775]/40 transition-all shadow-inner placeholder-gray-400"
                      placeholder="Name of the authority..." 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => delegadoPor.trim() && setChatStep(4)}
                disabled={!delegadoPor.trim()}
                className="bg-[#464775] text-white px-6 py-2.5 rounded-xl text-[13px] font-medium hover:bg-[#35365e] transition-all hover:shadow-md hover:-translate-y-px disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step-4" {...animationProps} className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="flex gap-4 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-semibold text-gray-400 mb-1 ml-1">Alysa</span>
                <div className="px-5 py-4 bg-gray-50/80 backdrop-blur-md border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm w-full">
                  <p className="text-gray-700 text-[13.5px] leading-relaxed mb-4">
                    Casi terminamos. <strong>¿Cuál es tu función principal en el área?</strong>
                  </p>
                  <div className="relative">
                    <textarea 
                      autoFocus
                      rows={2}
                      value={funcion} 
                      onChange={e => setFuncion(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && funcion.trim() && setChatStep(5)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#464775]/40 transition-all shadow-inner placeholder-gray-400 resize-none"
                      placeholder="Describe your role..." 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => funcion.trim() && setChatStep(5)}
                disabled={!funcion.trim()}
                className="bg-[#464775] text-white px-6 py-2.5 rounded-xl text-[13px] font-medium hover:bg-[#35365e] transition-all hover:shadow-md hover:-translate-y-px disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step-5" {...animationProps} className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="flex gap-4 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-semibold text-gray-400 mb-1 ml-1">Alysa</span>
                <div className="px-5 py-4 bg-gray-50/80 backdrop-blur-md border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm w-full">
                  <p className="text-gray-700 text-[13.5px] leading-relaxed mb-4">
                    Perfecto. Ahora, <strong>sube una foto de perfil</strong> para que te identifiquemos en la plataforma.
                  </p>
                  <div className="relative flex flex-col items-center gap-4">
                    {fotoBase64 ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#464775]/20 relative group">
                        <img src={fotoBase64} alt="Avatar" className="w-full h-full object-cover" />
                        <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-[#464775] hover:text-[#464775] transition-colors bg-white"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                        <span className="text-[10px] font-medium uppercase tracking-wider">Subir</span>
                      </button>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setChatStep(6)}
                className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-[13px] font-medium hover:bg-gray-300 transition-all"
              >
                Omitir
              </button>
              <button 
                onClick={() => setChatStep(6)}
                disabled={!fotoBase64}
                className="bg-[#464775] text-white px-6 py-2.5 rounded-xl text-[13px] font-medium hover:bg-[#35365e] transition-all hover:shadow-md hover:-translate-y-px disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div key="step-6" {...animationProps} className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="flex gap-4 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-semibold text-gray-400 mb-1 ml-1">Alysa</span>
                <div className="px-5 py-4 bg-gray-50/80 backdrop-blur-md border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm w-full">
                  <p className="text-gray-700 text-[13.5px] leading-relaxed mb-4">
                    Excelente. Ahora, por favor ingresa tu <strong>teléfono y ubicación</strong>.
                  </p>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={telefono} 
                      onChange={e => setTelefono(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#464775]/40 transition-all shadow-inner placeholder-gray-400"
                      placeholder="Teléfono (Ej: +1 (555) 123-4567)" 
                    />
                    <input 
                      type="text" 
                      value={ubicacion} 
                      onChange={e => setUbicacion(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && setChatStep(7)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#464775]/40 transition-all shadow-inner placeholder-gray-400"
                      placeholder="Ubicación (Ej: Grand Rapids, MI)" 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setChatStep(7)}
                className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-[13px] font-medium hover:bg-gray-300 transition-all"
              >
                Omitir
              </button>
              <button 
                onClick={() => setChatStep(7)}
                className="bg-[#464775] text-white px-6 py-2.5 rounded-xl text-[13px] font-medium hover:bg-[#35365e] transition-all hover:shadow-md hover:-translate-y-px"
              >
                Next
              </button>
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div key="step-7" {...animationProps} className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
            <div className="flex gap-4 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-semibold text-gray-400 mb-1 ml-1">Alysa</span>
                <div className="px-5 py-4 bg-gray-50/80 backdrop-blur-md border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm w-full">
                  <p className="text-gray-700 text-[13.5px] leading-relaxed mb-4">
                    Todo listo. Si tienes algún comentario final, escríbelo. Si no, solo dale click a Finalizar.
                  </p>
                  <div className="relative">
                    <input 
                      autoFocus
                      type="text" 
                      value={comentarios} 
                      onChange={e => setComentarios(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#464775]/40 transition-all shadow-inner placeholder-gray-400"
                      placeholder="Optional comments..." 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {errorMsg && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded text-center mb-2">
                  {errorMsg}
                </div>
              )}
              <div className="flex justify-end">
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#464775] text-white px-6 py-2.5 rounded-xl text-[13px] font-medium hover:bg-[#35365e] transition-all hover:shadow-md hover:-translate-y-px disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Procesando...</>
                  ) : (
                    <><CheckCircle size={16} /> Finalizar</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] w-screen h-screen bg-[#FFF] flex flex-col items-center justify-center overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fog-fade {
            0%, 100% { opacity: 1; filter: blur(0px); transform: scale(1); }
            50% { opacity: 0.15; filter: blur(12px); transform: scale(1.05); }
          }
          .animate-fog {
            animation: fog-fade 2.5s ease-in-out infinite;
          }
        `}} />
        <img src="/logo2.png" alt="Servex Logo" className="h-10 w-auto object-contain animate-fog" />
      </div>
    );
  }

  if (!needsOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fff] px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl h-[70vh] max-h-[800px] bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* Lado Izquierdo */}
        <div className="relative hidden md:flex flex-col justify-end p-10 overflow-hidden bg-gradient-to-br from-[#464775]/40 via-[#464775]/10 to-white">
          <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px' }}>
            <div
              className="absolute top-[20%] left-[20%] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#464775]/60 to-[#464775]/20 backdrop-blur-xl border border-white/60 z-10"
              style={{
                transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
                boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -4px 4px 0 #d0d0d0, -15px 15px 30px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          <div className="relative z-10 text-[#2B2C4B]">
            <div className="text-4xl font-bold mb-4 text-[#464775]"><User size={40} /></div>
            <p className="text-sm opacity-80 mb-2 font-medium">Global Profile Setup</p>
            <h2 className="text-2xl font-semibold leading-snug">
              Welcome to SERVEX AI Platform. Let&apos;s setup your profile.
            </h2>
          </div>
        </div>

        {/* Lado Derecho: Chat Interface */}
        <div className="flex flex-col h-full bg-[#fcfcfd] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#464775]/5 to-transparent pointer-events-none z-0" />
          
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#464775] to-[#35365e] flex items-center justify-center shadow-inner">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[14px] text-gray-800 tracking-tight leading-tight">Servex Copilot</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-gray-500 font-medium">Onboarding Assistant</span>
                </div>
              </div>
            </div>
            <Image src="/logo.png" alt="SERVEX" width={100} height={28} priority className="opacity-80 drop-shadow-sm" />
          </div>

          <div className="flex-1 flex flex-col p-6 z-10 relative">
            <AnimatePresence mode="wait">
              {renderChatStep()}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
