'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedChatBackground from '@/app/xml-pipeline/Actualizer_XML_General/components/AnimatedChatBackground.jsx';
import {
  Sparkles,
  Loader2,
  User,
  CheckCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  Camera,
  ShieldCheck
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
    initial: { opacity: 0, y: 14, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -14, scale: 0.98 },
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
  };

  const Avatar = () => (
    <div
      className={`relative w-9 h-9 rounded-none flex-shrink-0 flex items-center justify-center border ${
        isDarkMode
          ? 'bg-white/10 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
          : 'bg-[#18181b] text-white border-[#18181b] shadow-xs'
      }`}
    >
      <Sparkles size={16} />
    </div>
  );

  const renderChatStep = () => {
    switch (chatStep) {
      case 0:
        return (
          <motion.div key="step-0" {...animationProps} className="flex-1 flex flex-col justify-center max-w-lg w-full mx-auto">
            <div className="flex gap-3.5 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-mono tracking-wider font-semibold text-zinc-300">Alysa</span>
                  <span className={`text-[9.5px] uppercase font-mono px-1.5 py-0.2 border ${isDarkMode ? 'border-white/15 text-zinc-400 bg-white/5' : 'border-slate-300 text-slate-500 bg-slate-100'}`}>
                    AI Assistant
                  </span>
                </div>
                <div
                  className={`p-4 sm:p-5 border rounded-none backdrop-blur-xl ${
                    isDarkMode
                      ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                      : 'bg-white/80 border-slate-200/90 text-slate-800 shadow-md'
                  }`}
                >
                  <p className="text-[13.5px] leading-relaxed m-0">
                    Hola, soy <strong>Alysa</strong>. Te doy la bienvenida a <strong>SERVEX AI</strong>.
                  </p>
                  <p className={`text-[12.5px] leading-relaxed mt-2.5 ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
                    Antes de ingresar al pipeline y comenzar a operar con el catálogo, necesitamos configurar tu ficha de perfil por <strong>única vez</strong> para vincular tu actividad y auditorías en el sistema. ¿Comenzamos?
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setChatStep(1)}
                className={`px-5 py-2.5 text-xs font-semibold rounded-none border flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] ${
                  isDarkMode
                    ? 'bg-white text-zinc-950 font-bold border-white hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                    : 'bg-[#18181b] text-white border-[#18181b] hover:bg-black shadow-sm'
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
          <motion.div key="step-1" {...animationProps} className="flex-1 flex flex-col justify-center max-w-lg w-full mx-auto">
            <div className="flex gap-3.5 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 mb-1.5 uppercase font-medium">Paso 1 de 6 • Identidad</span>
                <div
                  className={`p-4 sm:p-5 border rounded-none backdrop-blur-xl ${
                    isDarkMode
                      ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                      : 'bg-white/80 border-slate-200/90 text-slate-800 shadow-md'
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
                    className={`w-full border px-3.5 py-2.5 text-xs rounded-none outline-none transition-all backdrop-blur-md ${
                      isDarkMode
                        ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500 focus:border-white/50 focus:bg-white/10'
                        : 'bg-white/90 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-600'
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
                className={`text-xs flex items-center gap-1 cursor-pointer transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <button
                type="button"
                onClick={() => nombre.trim() && setChatStep(2)}
                disabled={!nombre.trim()}
                className={`px-4 py-2 text-xs font-semibold rounded-none border flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all ${
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
          <motion.div key="step-2" {...animationProps} className="flex-1 flex flex-col justify-center max-w-lg w-full mx-auto">
            <div className="flex gap-3.5 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 mb-1.5 uppercase font-medium">Paso 2 de 6 • Cargo</span>
                <div
                  className={`p-4 sm:p-5 border rounded-none backdrop-blur-xl ${
                    isDarkMode
                      ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                      : 'bg-white/80 border-slate-200/90 text-slate-800 shadow-md'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed mb-3">
                    Mucho gusto, <strong>{nombre}</strong>. <strong>¿Qué cargo o posición ocupas en la empresa?</strong>
                  </p>
                  <input
                    autoFocus
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && cargo.trim() && setChatStep(3)}
                    className={`w-full border px-3.5 py-2.5 text-xs rounded-none outline-none transition-all backdrop-blur-md ${
                      isDarkMode
                        ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500 focus:border-white/50 focus:bg-white/10'
                        : 'bg-white/90 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-600'
                    }`}
                    placeholder="Ej. Catalog Specialist, Data Analyst, Lead Engineer..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setChatStep(1)}
                className={`text-xs flex items-center gap-1 cursor-pointer transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <button
                type="button"
                onClick={() => cargo.trim() && setChatStep(3)}
                disabled={!cargo.trim()}
                className={`px-4 py-2 text-xs font-semibold rounded-none border flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all ${
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
          <motion.div key="step-3" {...animationProps} className="flex-1 flex flex-col justify-center max-w-lg w-full mx-auto">
            <div className="flex gap-3.5 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 mb-1.5 uppercase font-medium">Paso 3 de 6 • Delegación</span>
                <div
                  className={`p-4 sm:p-5 border rounded-none backdrop-blur-xl ${
                    isDarkMode
                      ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                      : 'bg-white/80 border-slate-200/90 text-slate-800 shadow-md'
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
                    className={`w-full border px-3.5 py-2.5 text-xs rounded-none outline-none transition-all backdrop-blur-md ${
                      isDarkMode
                        ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500 focus:border-white/50 focus:bg-white/10'
                        : 'bg-white/90 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-600'
                    }`}
                    placeholder="Ej. Dirección de Operaciones, Lead Engineering, Gerencia..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setChatStep(2)}
                className={`text-xs flex items-center gap-1 cursor-pointer transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <button
                type="button"
                onClick={() => delegadoPor.trim() && setChatStep(4)}
                disabled={!delegadoPor.trim()}
                className={`px-4 py-2 text-xs font-semibold rounded-none border flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all ${
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
          <motion.div key="step-4" {...animationProps} className="flex-1 flex flex-col justify-center max-w-lg w-full mx-auto">
            <div className="flex gap-3.5 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 mb-1.5 uppercase font-medium">Paso 4 de 6 • Función Principal</span>
                <div
                  className={`p-4 sm:p-5 border rounded-none backdrop-blur-xl ${
                    isDarkMode
                      ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                      : 'bg-white/80 border-slate-200/90 text-slate-800 shadow-md'
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
                    className={`w-full border px-3.5 py-2.5 text-xs rounded-none outline-none transition-all resize-none backdrop-blur-md ${
                      isDarkMode
                        ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500 focus:border-white/50 focus:bg-white/10'
                        : 'bg-white/90 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-600'
                    }`}
                    placeholder="Ej. Actualización de listas de precios anuales, reconciliación y exportación de matrices CET..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setChatStep(3)}
                className={`text-xs flex items-center gap-1 cursor-pointer transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <button
                type="button"
                onClick={() => funcion.trim() && setChatStep(5)}
                disabled={!funcion.trim()}
                className={`px-4 py-2 text-xs font-semibold rounded-none border flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all ${
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
          <motion.div key="step-5" {...animationProps} className="flex-1 flex flex-col justify-center max-w-lg w-full mx-auto">
            <div className="flex gap-3.5 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 mb-1.5 uppercase font-medium">Paso 5 de 6 • Fotografía</span>
                <div
                  className={`p-4 sm:p-5 border rounded-none backdrop-blur-xl ${
                    isDarkMode
                      ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                      : 'bg-white/80 border-slate-200/90 text-slate-800 shadow-md'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed mb-3">
                    Ahora, sube una <strong>foto de perfil</strong> para identificarte en el panel y en las auditorías del sistema:
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
                            : 'border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-800 bg-white/80'
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
                className={`text-xs flex items-center gap-1 cursor-pointer transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setChatStep(6)}
                  className={`px-3 py-1.5 text-xs border rounded-none cursor-pointer transition-colors ${
                    isDarkMode ? 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Omitir
                </button>
                <button
                  type="button"
                  onClick={() => setChatStep(6)}
                  className={`px-4 py-2 text-xs font-semibold rounded-none border flex items-center gap-1.5 cursor-pointer transition-all ${
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
          <motion.div key="step-6" {...animationProps} className="flex-1 flex flex-col justify-center max-w-lg w-full mx-auto">
            <div className="flex gap-3.5 items-start mb-6">
              <Avatar />
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 mb-1.5 uppercase font-medium">Paso Final • Confirmación</span>
                <div
                  className={`p-4 sm:p-5 border rounded-none backdrop-blur-xl ${
                    isDarkMode
                      ? 'bg-[#09090b]/70 border-white/10 text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                      : 'bg-white/80 border-slate-200/90 text-slate-800 shadow-md'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed mb-3">
                    Por último, información complementaria (opcional) y notas:
                  </p>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className={`w-full border px-3.5 py-2 text-xs rounded-none outline-none backdrop-blur-md ${
                        isDarkMode
                          ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500 focus:border-white/40'
                          : 'bg-white/90 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500'
                      }`}
                      placeholder="Teléfono (Ej. +1 555 123-4567)"
                    />
                    <input
                      type="text"
                      value={ubicacion}
                      onChange={(e) => setUbicacion(e.target.value)}
                      className={`w-full border px-3.5 py-2 text-xs rounded-none outline-none backdrop-blur-md ${
                        isDarkMode
                          ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500 focus:border-white/40'
                          : 'bg-white/90 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500'
                      }`}
                      placeholder="Ubicación / Sede (Ej. HQ - Servex)"
                    />
                    <input
                      type="text"
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      className={`w-full border px-3.5 py-2 text-xs rounded-none outline-none backdrop-blur-md ${
                        isDarkMode
                          ? 'bg-white/5 border-white/15 text-white placeholder-zinc-500 focus:border-white/40'
                          : 'bg-white/90 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-500'
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
                className={`text-xs flex items-center gap-1 cursor-pointer transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <ArrowLeft size={12} /> Atrás
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-5 py-2.5 text-xs font-semibold rounded-none border flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all ${
                  isDarkMode
                    ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-400 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    : 'bg-emerald-600 text-white font-bold border-emerald-700 hover:bg-emerald-700 shadow-sm'
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
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center font-sans overflow-hidden ${isDarkMode ? 'bg-[#09090b]' : 'bg-[#fafafa]'}`}>
        <AnimatedChatBackground isDarkMode={isDarkMode} />
        <div
          className={`relative z-10 px-8 py-6 border rounded-none backdrop-blur-2xl flex flex-col items-center justify-center ${
            isDarkMode
              ? 'bg-[#09090b]/60 border-white/10 text-white shadow-[0_16px_50px_rgba(0,0,0,0.7)]'
              : 'bg-white/70 border-slate-200/90 text-slate-800 shadow-xl'
          }`}
        >
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3.5" />
          <span className="text-xs font-mono text-zinc-400 tracking-wider">Verificando credenciales y perfil...</span>
        </div>
      </div>
    );
  }

  if (!needsOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 font-sans select-none overflow-hidden ${isDarkMode ? 'bg-[#09090b]' : 'bg-[#fafafa]'}`}>
      {/* ── FONDO DINÁMICO 3D TOPOGRAPHY EXACTAMENTE IGUAL AL CHAT ── */}
      <AnimatedChatBackground isDarkMode={isDarkMode} />

      {/* ── CONTENEDOR TRASLÚCIDO ARQUITECTÓNICO QUE DEJA VER LA TOPOGRAFÍA EN MOVIMIENTO ── */}
      <div
        className={`relative z-10 w-full max-w-4xl h-[640px] max-h-[92vh] border rounded-none grid grid-cols-1 md:grid-cols-2 overflow-hidden transition-all duration-300 ${
          isDarkMode
            ? 'bg-[#09090b]/55 border-white/[0.12] backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.12)]'
            : 'bg-white/60 border-slate-200/80 backdrop-blur-2xl shadow-[0_20px_70px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.8)]'
        }`}
      >
        {/* Panel Izquierdo: Presentación Arquitectónica Traslúcida */}
        <div
          className={`hidden md:flex flex-col justify-between p-8 border-r relative overflow-hidden backdrop-blur-xl ${
            isDarkMode
              ? 'border-white/10 bg-white/[0.02] text-white'
              : 'border-slate-200/70 bg-white/40 text-slate-900'
          }`}
        >
          {/* Header Superior: Brand Logo */}
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 border flex items-center justify-center font-bold text-xs ${
                isDarkMode ? 'border-white/20 bg-white/10 text-white' : 'border-[#18181b]/20 bg-[#18181b] text-white'
              }`}
            >
              S
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase block leading-none">SERVEX AI</span>
              <span className="text-[9px] font-mono text-zinc-400 tracking-wider">Enterprise Catalog Platform</span>
            </div>
          </div>

          {/* Cuerpo Central Informativo */}
          <div className="space-y-4 relative z-10 my-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border text-[10px] font-mono uppercase tracking-wider rounded-none font-semibold text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Registro Único de Acceso</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight leading-tight">
              Configuración de Perfil de Usuario
            </h2>

            <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
              Para cumplir con la trazabilidad y auditoría corporativa, vinculamos tus instrucciones a la tabla central <code className="font-mono text-[11px] px-1.5 py-0.5 border border-white/15 bg-white/10 text-white">AI_Users</code>.
            </p>

            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span>Auditoría y trazabilidad en Supabase</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                <span>No se vuelve a solicitar tras finalizar</span>
              </div>
            </div>
          </div>

          {/* Footer Izquierdo */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10.5px] font-mono text-zinc-400">
            <span>© 2026 GLYNNE S.A.S.</span>
            <span>v2.4 Live</span>
          </div>
        </div>

        {/* Panel Derecho: Chat Interactivo Traslúcido */}
        <div className="flex flex-col h-full overflow-hidden relative">
          {/* Cabecera Superior del Chat */}
          <div
            className={`h-14 px-6 border-b flex items-center justify-between shrink-0 backdrop-blur-xl ${
              isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200/80 bg-white/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide">Ficha Inicial de Usuario</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 border rounded-none ${
                isDarkMode ? 'border-white/15 bg-white/5 text-zinc-300' : 'border-slate-300 bg-slate-100 text-slate-700'
              }`}>
                Paso {chatStep} de 6
              </span>
            </div>
          </div>

          {/* Área Conversacional */}
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
