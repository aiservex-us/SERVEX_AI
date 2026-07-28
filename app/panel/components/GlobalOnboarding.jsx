"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Loader2, User, CheckCircle } from 'lucide-react';

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

      const { error } = await supabase.from('AI_Users').insert([{
        user_id: currentUser.id,
        user_personal_data: delegationData
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
      <div className="min-h-screen bg-[#FFF] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#464775] mb-4" size={48} />
        <p className="text-[#464775] font-medium animate-pulse">Loading Profile...</p>
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
              Welcome to SERVEX AI Platform. Let's setup your profile.
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
