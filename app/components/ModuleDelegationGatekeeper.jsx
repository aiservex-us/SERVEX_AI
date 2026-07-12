"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
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
      <main className="min-h-screen bg-[#FFF] flex items-center justify-center p-8">
        <section className="relative w-full max-w-3xl mx-auto overflow-hidden bg-white p-12 rounded-3xl border border-red-100 shadow-xl shadow-red-500/10 text-center">
          <div className="absolute inset-0 z-0 bg-[#fbfbfc] overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-red-500/5 to-red-500/10" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-100">
              <Lock size={40} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 tracking-tight">Acceso Restringido</h1>
            <p className="text-slate-500 text-lg max-w-lg mb-8 leading-relaxed">
              El módulo <strong>{moduleName}</strong> está actualmente delegado y en uso exclusivo para evitar colisión de datos.
            </p>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full max-w-md text-left mb-8">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Información de Delegación</h3>
              <div className="space-y-3">
                <p className="flex items-center text-slate-700"><User size={18} className="mr-3 text-slate-400" /> <span className="font-medium mr-2">Ocupante:</span> {ownerInfo?.nombre}</p>
                <p className="flex items-center text-slate-700"><Briefcase size={18} className="mr-3 text-slate-400" /> <span className="font-medium mr-2">Cargo:</span> {ownerInfo?.cargo}</p>
                <p className="flex items-center text-slate-700"><Shield size={18} className="mr-3 text-slate-400" /> <span className="font-medium mr-2">Autorizado por:</span> {ownerInfo?.delegadoPor}</p>
              </div>
            </div>
            
            <button onClick={() => router.push('/panel')} className="px-8 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors">
              Volver al Menú
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Pantalla de Formulario de Delegación
  if (lockStatus === 'no_delegation') {
    return (
      <main className="min-h-screen bg-[#FFF] flex flex-col items-center justify-center p-4 md:p-8">
        <section className="relative w-full max-w-4xl mx-auto overflow-hidden bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
          {/* Fondo Abstracto tipo Main1 */}
          <div className="absolute inset-0 z-0 bg-[#fbfbfc] overflow-hidden rounded-3xl pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-[#464775]/5 to-[#464775]/10" />
            <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-[40%_60%_70%_30%] backdrop-blur-[12px] opacity-60"
                 style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.05))' }} />
          </div>

          <div className="relative z-10 grid md:grid-cols-5 gap-12 items-center">
            
            {/* Lado Izquierdo: Info */}
            <div className="md:col-span-2">
              <div className="w-16 h-16 bg-[#464775]/10 text-[#464775] rounded-2xl flex items-center justify-center mb-6">
                <Shield size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight mb-4">Registro de Delegación</h2>
              <p className="text-slate-500 mb-6 leading-relaxed text-sm">
                El módulo <strong>{moduleName}</strong> requiere un registro formal de asignación para garantizar la trazabilidad y evitar colisiones durante el procesamiento de catálogos.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="text-emerald-500 mt-1 mr-3 flex-shrink-0" size={18} />
                  <span className="text-sm text-slate-600">Acceso exclusivo a tu cuenta.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-emerald-500 mt-1 mr-3 flex-shrink-0" size={18} />
                  <span className="text-sm text-slate-600">Auditoría respaldada por tu delegador.</span>
                </li>
              </ul>
            </div>

            {/* Lado Derecho: Formulario */}
            <div className="md:col-span-3">
              <form onSubmit={handleSetupDelegation} className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl shadow-slate-200/40">
                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                  <User size={20} className="mr-2 text-[#464775]" /> Completa tus datos
                </h3>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center">
                    <AlertCircle size={16} className="mr-2" /> {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Nombre y Apellido *</label>
                    <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#464775]/30 focus:border-[#464775] transition-all"
                      placeholder="Ej. Glynne" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Cargo *</label>
                    <input type="text" required value={cargo} onChange={e => setCargo(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#464775]/30 focus:border-[#464775] transition-all"
                      placeholder="Ej. Analista de Datos" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Función (Rol)</label>
                    <input type="text" value={funcion} onChange={e => setFuncion(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#464775]/30 focus:border-[#464775] transition-all"
                      placeholder="Ej. Revisión XML" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Delegado Por *</label>
                    <input type="text" required value={delegadoPor} onChange={e => setDelegadoPor(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#464775]/30 focus:border-[#464775] transition-all"
                      placeholder="Nombre de Autoridad" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider">Comentarios (Opcional)</label>
                  <textarea value={comentarios} onChange={e => setComentarios(e.target.value)} rows="2"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#464775]/30 focus:border-[#464775] transition-all resize-none"
                    placeholder="Detalles sobre el uso del módulo..." />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#464775] text-white py-3.5 rounded-xl font-medium hover:bg-[#35365e] transition-colors flex items-center justify-center disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                  {isSubmitting ? 'Registrando...' : 'Registrar y Acceder'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // Fallback
  return <>{children}</>;
}
