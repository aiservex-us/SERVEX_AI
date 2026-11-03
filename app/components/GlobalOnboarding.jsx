'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  User,
  CheckCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  Camera,
  Briefcase,
  ShieldCheck,
  Phone,
  MapPin,
  FileText
} from 'lucide-react';

export default function GlobalOnboarding({ children, isDarkMode = true }) {
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states (user_personal_data)
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [funcion, setFuncion] = useState('');
  const [delegadoPor, setDelegadoPor] = useState('');
  const [comentarios, setComentarios] = useState('');

  // Extra states (user_personal_data_complete)
  const [fotoBase64, setFotoBase64] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const fileInputRef = useRef(null);

  const [chatStep, setChatStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const hasPlayedAudio = useRef(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Sin sesión activa de Supabase (ej. pruebas o usuario anónimo) -> No bloquear
        setNeedsOnboarding(false);
        setLoading(false);
        return;
      }
      setCurrentUser(user);

      // Revisar si ya existe registro en AI_Users con user_personal_data
      const { data: aiUsersData, error: aiError } = await supabase
        .from('AI_Users')
        .select('user_personal_data')
        .eq('user_id', user.id)
        .limit(1);

      if (aiError) {
        console.warn('⚠️ Advertencia al consultar tabla AI_Users:', aiError.message);
        // Si hay error en consulta, evitar bloqueo
        setNeedsOnboarding(false);
      } else if (
        aiUsersData &&
        aiUsersData.length > 0 &&
        aiUsersData[0].user_personal_data &&
        typeof aiUsersData[0].user_personal_data === 'object' &&
        Object.keys(aiUsersData[0].user_personal_data).length > 0
      ) {
        // El usuario ya tiene sus datos guardados -> NUNCA más se le pregunta
        setNeedsOnboarding(false);
      } else {
        // Primera vez del usuario en el sistema -> Solicitar información
        setNeedsOnboarding(true);
      }
    } catch (e) {
      console.error('Error verificando onboarding en AI_Users:', e);
      setNeedsOnboarding(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && needsOnboarding && !hasPlayedAudio.current) {
      hasPlayedAudio.current = true;
      try {
        const audio = new Audio('/universfield-welcome-notification-131917.mp3');
        audio.volume = 0.35;
        audio.play().catch(() => {});
      } catch (_) {}
    }
  }, [loading, needsOnboarding]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const delegationData = {
        nombre: nombre.trim(),
        cargo: cargo.trim(),
        funcion: funcion.trim(),
        delegado_por: delegadoPor.trim(),
        comentarios: comentarios.trim(),
        timestamp: new Date().toISOString()
      };

      const completeData = {
        fotoBase64: fotoBase64 || '',
        descripcion: funcion.trim(),
        telefono: telefono.trim(),
        ubicacion: ubicacion.trim(),
        timestamp: new Date().toISOString()
      };

      // Guardar en tabla AI_Users (Upsert por user_id)
      const { error } = await supabase.from('AI_Users').upsert([
        {
          user_id: currentUser.id,
          user_personal_data: delegationData,
          user_personal_data_complete: completeData
        }
      ], { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      // Onboarding completado exitosamente: liberar el paso al pipeline
      setNeedsOnboarding(false);
    } catch (e) {
      console.error('Error al persistir perfil en AI_Users:', e);
      setErrorMsg('No se pudieron guardar tus datos en AI_Users. Por favor verifica e intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const animationProps = {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -12, scale: 0.98 },
    transition: { duration: 0.25, ease: 'easeOut' }
  };

  const Avatar = () => (
    <div
      className={`relative w-9 h-9 rounded-none flex-shrink-0 flex items-center justify-center border ${
        isDarkMode
          ? 'bg-white/10 text-white border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
          : 'bg-[#18181b] text-white border-[#18181b]'
      }`}
    >
      <Sparkles size={16} />
    </div>
  );

  const renderChatStep = () => {
    switch (chatStep) {
      case 0:
        return (
          <motion.div key="step-0" {...animationProps} className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
            <div className="flex gap-3 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-mono tracking-wider text-zinc-400 mb-1">Alysa • Copilot</span>
                <div
                  className={`p-4 border rounded-none shadow-xs ${
                    isDarkMode ? 'bg-white/[0.03] border-white/10 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed m-0">
                    Hola, soy <strong>Alysa</strong>. Te doy la bienvenida a la plataforma <strong>SERVEX AI</strong>.
                  </p>
                  <p className="text-[12.5px] leading-relaxed mt-2 text-zinc-400">
                    Antes de ingresar al pipeline y comenzar a operar con el catálogo, necesitamos configurar tu ficha de perfil por <strong>única vez</strong>. ¿Comenzamos?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setChatStep(1)}
                className={`px-5 py-2 text-xs font-semibold rounded-none border flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] ${
                  isDarkMode
                    ? 'bg-white text-zinc-950 font-bold border-white hover:bg-zinc-200'
                    : 'bg-[#18181b] text-white border-[#18181b] hover:bg-black'
                }`}
              >
                <span>Comenzar</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div key="step-1" {...animationProps} className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
            <div className="flex gap-3 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-mono tracking-wider text-zinc-400 mb-1">Paso 1 de 6</span>
                <div
                  className={`p-4 border rounded-none shadow-xs ${
                    isDarkMode ? 'bg-white/[0.03] border-white/10 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed mb-3">
                    Primero que todo, <strong>¿Cuál es tu nombre completo?</strong>
                  </p>
                  <input
                    autoFocus
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && nombre.trim() && setChatStep(2)}
                    className={`w-full border px-3 py-2 text-xs rounded-none outline-none transition-all ${
                      isDarkMode
                        ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500 focus:border-white/40'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500'
                    }`}
                    placeholder="Ej. Juan Pérez..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setChatStep(0)}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <button
                type="button"
                onClick={() => nombre.trim() && setChatStep(2)}
                disabled={!nombre.trim()}
                className={`px-4 py-2 text-xs font-semibold rounded-none border flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                  isDarkMode
                    ? 'bg-white text-zinc-950 font-bold border-white'
                    : 'bg-[#18181b] text-white border-[#18181b]'
                }`}
              >
                <span>Siguiente</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="step-2" {...animationProps} className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
            <div className="flex gap-3 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-mono tracking-wider text-zinc-400 mb-1">Paso 2 de 6</span>
                <div
                  className={`p-4 border rounded-none shadow-xs ${
                    isDarkMode ? 'bg-white/[0.03] border-white/10 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed mb-3">
                    Mucho gusto, <strong>{nombre}</strong>. <strong>¿Qué cargo ocupas actualmente en la empresa?</strong>
                  </p>
                  <input
                    autoFocus
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && cargo.trim() && setChatStep(3)}
                    className={`w-full border px-3 py-2 text-xs rounded-none outline-none transition-all ${
                      isDarkMode
                        ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500 focus:border-white/40'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500'
                    }`}
                    placeholder="Ej. CET Catalog Specialist, Data Analyst..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setChatStep(1)}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <button
                type="button"
                onClick={() => cargo.trim() && setChatStep(3)}
                disabled={!cargo.trim()}
                className={`px-4 py-2 text-xs font-semibold rounded-none border flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                  isDarkMode
                    ? 'bg-white text-zinc-950 font-bold border-white'
                    : 'bg-[#18181b] text-white border-[#18181b]'
                }`}
              >
                <span>Siguiente</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div key="step-3" {...animationProps} className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
            <div className="flex gap-3 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-mono tracking-wider text-zinc-400 mb-1">Paso 3 de 6</span>
                <div
                  className={`p-4 border rounded-none shadow-xs ${
                    isDarkMode ? 'bg-white/[0.03] border-white/10 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed mb-3">
                    Entendido. <strong>¿Quién autoriza o delega tu acceso al pipeline de catálogos?</strong>
                  </p>
                  <input
                    autoFocus
                    type="text"
                    value={delegadoPor}
                    onChange={(e) => setDelegadoPor(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && delegadoPor.trim() && setChatStep(4)}
                    className={`w-full border px-3 py-2 text-xs rounded-none outline-none transition-all ${
                      isDarkMode
                        ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500 focus:border-white/40'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500'
                    }`}
                    placeholder="Ej. Dirección de Operaciones, Lead Engineering..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setChatStep(2)}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <button
                type="button"
                onClick={() => delegadoPor.trim() && setChatStep(4)}
                disabled={!delegadoPor.trim()}
                className={`px-4 py-2 text-xs font-semibold rounded-none border flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                  isDarkMode
                    ? 'bg-white text-zinc-950 font-bold border-white'
                    : 'bg-[#18181b] text-white border-[#18181b]'
                }`}
              >
                <span>Siguiente</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div key="step-4" {...animationProps} className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
            <div className="flex gap-3 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-mono tracking-wider text-zinc-400 mb-1">Paso 4 de 6</span>
                <div
                  className={`p-4 border rounded-none shadow-xs ${
                    isDarkMode ? 'bg-white/[0.03] border-white/10 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed mb-3">
                    Muy bien. <strong>¿Cuál es tu función o actividad principal con los catálogos y matrices?</strong>
                  </p>
                  <textarea
                    autoFocus
                    rows={3}
                    value={funcion}
                    onChange={(e) => setFuncion(e.target.value)}
                    className={`w-full border px-3 py-2 text-xs rounded-none outline-none transition-all resize-none ${
                      isDarkMode
                        ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500 focus:border-white/40'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500'
                    }`}
                    placeholder="Ej. Actualización de listas de precios anuales y exportación de matrices CET..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setChatStep(3)}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <button
                type="button"
                onClick={() => funcion.trim() && setChatStep(5)}
                disabled={!funcion.trim()}
                className={`px-4 py-2 text-xs font-semibold rounded-none border flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                  isDarkMode
                    ? 'bg-white text-zinc-950 font-bold border-white'
                    : 'bg-[#18181b] text-white border-[#18181b]'
                }`}
              >
                <span>Siguiente</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div key="step-5" {...animationProps} className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
            <div className="flex gap-3 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-mono tracking-wider text-zinc-400 mb-1">Paso 5 de 6</span>
                <div
                  className={`p-4 border rounded-none shadow-xs ${
                    isDarkMode ? 'bg-white/[0.03] border-white/10 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed mb-3">
                    Ahora, sube una <strong>foto de perfil</strong> para identificarte en las auditorías y colaboraciones:
                  </p>
                  <div className="flex flex-col items-center justify-center gap-3 py-2">
                    {fotoBase64 ? (
                      <div className="w-20 h-20 border rounded-none overflow-hidden relative group">
                        <img src={fotoBase64} alt="Avatar" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Camera size={16} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-20 h-20 border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isDarkMode
                            ? 'border-white/20 text-zinc-400 hover:border-white/40 hover:text-white bg-white/5'
                            : 'border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-800 bg-white'
                        }`}
                      >
                        <Upload size={18} className="mb-1" />
                        <span className="text-[9.5px] font-mono uppercase tracking-wider">Subir</span>
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
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setChatStep(4)}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setChatStep(6)}
                  className={`px-3 py-1.5 text-xs border rounded-none cursor-pointer ${
                    isDarkMode ? 'border-white/10 text-zinc-400 hover:text-white' : 'border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Omitir
                </button>
                <button
                  type="button"
                  onClick={() => setChatStep(6)}
                  className={`px-4 py-2 text-xs font-semibold rounded-none border flex items-center gap-1.5 cursor-pointer ${
                    isDarkMode
                      ? 'bg-white text-zinc-950 font-bold border-white'
                      : 'bg-[#18181b] text-white border-[#18181b]'
                  }`}
                >
                  <span>Siguiente</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div key="step-6" {...animationProps} className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
            <div className="flex gap-3 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[11px] font-mono tracking-wider text-zinc-400 mb-1">Paso Final</span>
                <div
                  className={`p-4 border rounded-none shadow-xs ${
                    isDarkMode ? 'bg-white/[0.03] border-white/10 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed mb-3">
                    Por último, información complementaria (opcional) y comentarios:
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className={`w-full border px-3 py-2 text-xs rounded-none outline-none ${
                        isDarkMode
                          ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                      placeholder="Teléfono (Ej. +1 555 123-4567)"
                    />
                    <input
                      type="text"
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                      className={`w-full border px-3 py-2 text-xs rounded-none outline-none ${
                        isDarkMode
                          ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                      placeholder="Ubicación / Sede (Ej. HQ - Servex)"
                    />
                    <input
                      type="text"
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      className={`w-full border px-3 py-2 text-xs rounded-none outline-none ${
                        isDarkMode
                          ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                      placeholder="Comentarios adicionales o notas..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-none mb-3 text-center">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setChatStep(5)}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-5 py-2.5 text-xs font-semibold rounded-none border flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isDarkMode
                    ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-400 hover:bg-emerald-400'
                    : 'bg-emerald-600 text-white font-bold border-emerald-700 hover:bg-emerald-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Guardando perfil...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={13} />
                    <span>Finalizar e Ingresar al Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center font-sans ${
          isDarkMode ? 'bg-[#09090b] text-white' : 'bg-white text-slate-900'
        }`}
      >
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono text-zinc-400 tracking-wider">Verificando credenciales y perfil...</span>
      </div>
    );
  }

  if (!needsOnboarding) {
    return <>{children}</>;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 font-sans select-none backdrop-blur-2xl ${
        isDarkMode ? 'bg-[#09090b]/90 text-zinc-100' : 'bg-slate-900/60 text-slate-800'
      }`}
    >
      <div
        className={`w-full max-w-4xl h-[620px] max-h-[90vh] border rounded-none shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden ${
          isDarkMode
            ? 'bg-[#0c0c0e] border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]'
            : 'bg-white border-slate-200'
        }`}
      >
        {/* Lado Izquierdo: Presentación Arquitectónica */}
        <div
          className={`hidden md:flex flex-col justify-between p-8 border-r relative overflow-hidden ${
            isDarkMode
              ? 'bg-gradient-to-br from-white/[0.04] to-transparent border-white/10 text-white'
              : 'bg-gradient-to-br from-slate-100/70 to-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 border border-white/20 flex items-center justify-center font-bold text-xs">
              S
            </div>
            <span className="text-xs font-bold tracking-widest uppercase">SERVEX AI</span>
          </div>

          <div className="space-y-4 relative z-10">
            <div
              className={`w-10 h-10 border flex items-center justify-center ${
                isDarkMode ? 'border-white/20 bg-white/5 text-white' : 'border-slate-300 bg-white text-slate-900'
              }`}
            >
              <User size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Registro Único Requerido
              </span>
              <h2 className="text-xl font-bold tracking-tight mt-1 leading-snug">
                Configuración de Perfil de Usuario
              </h2>
              <p
                className={`text-xs mt-2 leading-relaxed ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-600'
                }`}
              >
                Esta información se solicita una sola vez al iniciar sesión para vincular tu identidad a la base de datos central <code className="font-mono text-[11px] text-zinc-300">AI_Users</code> y asignarte roles en el pipeline.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Persistencia segura en Supabase</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <CheckCircle size={14} className="text-emerald-400" />
                <span>Acceso directo sin volver a preguntar</span>
              </div>
            </div>
          </div>

          <div className="text-[10.5px] font-mono text-zinc-500">
            © 2026 GLYNNE S.A.S. • All rights reserved
          </div>
        </div>

        {/* Lado Derecho: Interfaz Conversacional de Onboarding */}
        <div className="flex flex-col h-full overflow-hidden relative">
          {/* Header Superior */}
          <div
            className={`h-14 px-6 border-b flex items-center justify-between shrink-0 ${
              isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide">Ficha Inicial de Usuario</span>
            </div>
            <span className="text-[10.5px] font-mono text-zinc-400">
              Paso {chatStep} de 6
            </span>
          </div>

          {/* Formulario / Chat por Pasos */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              {renderChatStep()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

