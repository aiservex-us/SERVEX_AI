"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Shield, User, Briefcase, FileText, CheckCircle, Loader2, Lock, AlertCircle } from 'lucide-react';

export default function ModuleDelegationGatekeeper({ moduleName, redirectUrl, children }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [lockStatus, setLockStatus] = useState('checking'); // 'checking', 'unlocked', 'locked_by_other', 'no_delegation'
  const [ownerInfo, setOwnerInfo] = useState(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [cargo, setCargo] = useState('');
  const [funcion, setFuncion] = useState('');
  const [delegadoPor, setDelegadoPor] = useState('');
  const [comentarios, setComentarios] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const apiURL = process.env.NEXT_PUBLIC_API_URL || 'https://servex-ai-back.onrender.com';

  useEffect(() => {
    checkAccess();
  }, [moduleName]);

  const checkAccess = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const res = await fetch(`${apiURL}/api/v1/module_delegation/${moduleName}`);
      const responseData = await res.json();

      if (!responseData.locked) {
        setLockStatus('no_delegation');
      } else if (responseData.data) {
        const data = responseData.data;
        if (data.user_id === user?.id) {
          // Ya es el dueño, redireccionar o mostrar
          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            setLockStatus('unlocked');
          }
        } else {
          try {
            const parsedData = typeof data.delegation_data === 'string' ? JSON.parse(data.delegation_data) : data.delegation_data;
            setOwnerInfo(parsedData);
          } catch (e) {
            setOwnerInfo({ nombre: "Usuario Desconocido", cargo: "Operador" });
          }
          setLockStatus('locked_by_other');
        }
      }
    } catch (error) {
      console.error("Error checking module delegation:", error);
      // Por defecto en caso de error, permitimos el acceso para no bloquear la app
      setLockStatus('unlocked');
    }
    setLoading(false);
  };

  const handleSetupDelegation = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombre.trim() || !cargo.trim() || !delegadoPor.trim()) {
      setErrorMsg('Por favor llena los campos obligatorios (Nombre, Cargo y Quién Delega).');
      return;
    }

    setIsSubmitting(true);
    const delegationData = {
      nombre,
      cargo,
      funcion,
      delegadoPor,
      comentarios
    };

    try {
      const res = await fetch(`${apiURL}/api/v1/module_delegation/${moduleName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUser?.id, delegation_data: delegationData })
      });
      if (!res.ok) throw new Error("Error API");

      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        setLockStatus('unlocked');
      }
    } catch (e) {
      setErrorMsg('Error al registrar delegación. Intenta nuevamente.');
      setIsSubmitting(false);
    }
  };

  // Pantalla de carga
  if (loading || lockStatus === 'checking') {
    return (
      <div className="min-h-screen bg-[#FFF] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-[#464775] mb-4" size={48} />
        <p className="text-[#464775] font-medium animate-pulse">Validando acceso corporativo...</p>
      </div>
    );
  }

  // Pantalla de bloqueo si le pertenece a alguien más
  if (lockStatus === 'locked_by_other') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fff] px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-5xl h-[70vh] max-h-[800px] bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
        >
          {/* Lado Izquierdo: Diseño del Login */}
          <div className="relative hidden md:flex flex-col justify-end p-10 overflow-hidden bg-gradient-to-br from-[#464775]/40 via-[#464775]/10 to-white">
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px' }}>
              <div
                className="absolute top-[15%] left-[5%] w-[180px] h-[180px] rounded-full bg-white/20 backdrop-blur-md border border-white/50"
                style={{
                  transform: 'rotateX(20deg) rotateY(30deg) translateZ(-100px)',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -2px 2px 0 rgba(255,255,255,0.6), -10px 10px 20px rgba(0,0,0,0.05)'
                }}
              />
              <div
                className="absolute top-[20%] left-[20%] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#464775]/60 to-[#464775]/20 backdrop-blur-xl border border-white/60 z-10"
                style={{
                  transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
                  boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -4px 4px 0 #d0d0d0, -15px 15px 30px rgba(0,0,0,0.1)'
                }}
              />
              <div
                className="absolute top-[30%] right-[25%] w-[160px] h-[160px] rounded-full bg-white/30 backdrop-blur-md border border-white/50 z-10"
                style={{
                  transform: 'rotateX(60deg) rotateY(-50deg) translateZ(100px)',
                  boxShadow: 'inset 0 0 15px rgba(255,255,255,0.4), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -10px 10px 15px rgba(0,0,0,0.05)'
                }}
              />
              <div
                className="absolute bottom-[35%] right-[10%] w-[190px] h-[190px] rounded-full bg-white/40 backdrop-blur-lg border border-white/70"
                style={{
                  transform: 'rotateX(15deg) rotateY(20deg) translateZ(0px)',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -10px 10px 20px rgba(0,0,0,0.05)'
                }}
              />
              <div
                className="absolute bottom-[20%] left-[25%] w-[180px] h-[180px] rounded-full bg-[#464775]/20 backdrop-blur-xl border border-white/30 blur-[4px]"
                style={{
                  transform: 'rotateX(45deg) rotateY(15deg) translateZ(150px)',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)'
                }}
              />
            </div>

            <div className="relative z-10 text-[#2B2C4B]">
              <div className="text-4xl font-bold mb-4 text-[#464775]"><Lock size={40} /></div>
              <p className="text-sm opacity-80 mb-2 font-medium">Módulo en Uso</p>
              <h2 className="text-2xl font-semibold leading-snug">
                El acceso a {moduleName} está restringido temporalmente para evitar colisiones.
              </h2>
            </div>
          </div>

          {/* Lado Derecho: Info */}
          <div className="flex flex-col px-8 py-10 md:px-14 h-full relative z-10 bg-white">
            <div className="mb-6 flex justify-center">
              <Image src="/logo.png" alt="SERVEX" width={140} height={40} priority />
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                Acceso Restringido
              </h1>
              <p className="text-sm text-gray-500 mb-8 text-center leading-relaxed">
                Este módulo está actualmente delegado y en uso exclusivo por otro usuario.
              </p>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Ocupante Actual</p>
                <p className="text-lg font-medium text-gray-800 flex items-center justify-center">
                  <User size={20} className="mr-2 text-[#464775]" /> {ownerInfo?.nombre}
                </p>
              </div>

              <button
                onClick={() => router.push('/panel')}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition font-medium"
              >
                Volver al Menú
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Pantalla de Formulario de Delegación
  if (lockStatus === 'no_delegation') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#fff] px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-5xl h-[70vh] max-h-[800px] bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
        >
          {/* Lado Izquierdo: Diseño del Login */}
          <div className="relative hidden md:flex flex-col justify-end p-10 overflow-hidden bg-gradient-to-br from-[#464775]/40 via-[#464775]/10 to-white">
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px' }}>
              <div
                className="absolute top-[15%] left-[5%] w-[180px] h-[180px] rounded-full bg-white/20 backdrop-blur-md border border-white/50"
                style={{
                  transform: 'rotateX(20deg) rotateY(30deg) translateZ(-100px)',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -2px 2px 0 rgba(255,255,255,0.6), -10px 10px 20px rgba(0,0,0,0.05)'
                }}
              />
              <div
                className="absolute top-[20%] left-[20%] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#464775]/60 to-[#464775]/20 backdrop-blur-xl border border-white/60 z-10"
                style={{
                  transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
                  boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -4px 4px 0 #d0d0d0, -15px 15px 30px rgba(0,0,0,0.1)'
                }}
              />
              <div
                className="absolute top-[30%] right-[25%] w-[160px] h-[160px] rounded-full bg-white/30 backdrop-blur-md border border-white/50 z-10"
                style={{
                  transform: 'rotateX(60deg) rotateY(-50deg) translateZ(100px)',
                  boxShadow: 'inset 0 0 15px rgba(255,255,255,0.4), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -10px 10px 15px rgba(0,0,0,0.05)'
                }}
              />
              <div
                className="absolute bottom-[35%] right-[10%] w-[190px] h-[190px] rounded-full bg-white/40 backdrop-blur-lg border border-white/70"
                style={{
                  transform: 'rotateX(15deg) rotateY(20deg) translateZ(0px)',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -10px 10px 20px rgba(0,0,0,0.05)'
                }}
              />
              <div
                className="absolute bottom-[20%] left-[25%] w-[180px] h-[180px] rounded-full bg-[#464775]/20 backdrop-blur-xl border border-white/30 blur-[4px]"
                style={{
                  transform: 'rotateX(45deg) rotateY(15deg) translateZ(150px)',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)'
                }}
              />
            </div>

            <div className="relative z-10 text-[#2B2C4B]">
              <div className="text-4xl font-bold mb-4 text-[#464775]"><Shield size={40} /></div>
              <p className="text-sm opacity-80 mb-2 font-medium">Registro de Delegación</p>
              <h2 className="text-2xl font-semibold leading-snug">
                El módulo {moduleName} requiere un registro formal para garantizar trazabilidad durante el procesamiento.
              </h2>
            </div>
          </div>

          {/* Lado Derecho: Formulario */}
          <div className="flex flex-col px-8 py-10 md:px-14 h-full relative z-10 bg-white">
            <div className="mb-6 flex justify-center">
              <Image src="/logo.png" alt="SERVEX" width={140} height={40} priority />
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
                Completar Registro
              </h1>
              <p className="text-sm text-gray-500 mb-6 text-center leading-relaxed">
                El acceso será de uso exclusivo para tu cuenta.
              </p>

              <form onSubmit={handleSetupDelegation} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center">
                    <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 tracking-wide">NOMBRE *</label>
                    <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#464775]/30 focus:border-[#464775] transition-all"
                      placeholder="Ej. Glynne" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 tracking-wide">CARGO *</label>
                    <input type="text" required value={cargo} onChange={e => setCargo(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#464775]/30 focus:border-[#464775] transition-all"
                      placeholder="Analista" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 tracking-wide">FUNCIÓN</label>
                    <input type="text" value={funcion} onChange={e => setFuncion(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#464775]/30 focus:border-[#464775] transition-all"
                      placeholder="Revisión XML" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 tracking-wide">DELEGADO POR *</label>
                    <input type="text" required value={delegadoPor} onChange={e => setDelegadoPor(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#464775]/30 focus:border-[#464775] transition-all"
                      placeholder="Autoridad" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 tracking-wide">COMENTARIOS</label>
                  <textarea value={comentarios} onChange={e => setComentarios(e.target.value)} rows="2"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#464775]/30 focus:border-[#464775] transition-all resize-none"
                    placeholder="Opcional..." />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#464775] text-white py-3 rounded-xl font-medium hover:bg-[#35365e] transition-colors flex items-center justify-center disabled:opacity-70 mt-4"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                  {isSubmitting ? 'Registrando...' : 'Registrar y Acceder'}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Fallback
  return <>{children}</>;
}
