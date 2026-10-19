'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  Database, 
  FileSpreadsheet, 
  Sparkles 
} from 'lucide-react';
import { supabase } from '../../../../../../lib/supabaseClient';

const DeleteTenantButton = ({ currentTenant = 'WBT', onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen && !isDeleting) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isDeleting]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('ClientsSERVEX_WBT')
        .delete()
        .eq('company_name', currentTenant);

      if (error) throw error;

      // Limpiar memoria de sesion, historial de chat y contexto del modelo en backend
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://servex-ai-back.onrender.com';
      try {
        await Promise.allSettled([
          fetch(backendUrl + '/api/v1/cet-ai-engine/clear-session', { method: 'POST' }),
          fetch(backendUrl + '/api/v1/' + encodeURIComponent(currentTenant) + '/clear-session', { method: 'POST' }),
          fetch(backendUrl + '/api/v1/' + encodeURIComponent(currentTenant) + '/agent/history', { method: 'DELETE' })
        ]);
      } catch (beErr) {
        console.warn('[-] Advertencia limpiando memoria de sesion en backend:', beErr);
      }

      // Limpiar almacenamiento local para reiniciar conversacion fresca
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.clear();
          localStorage.removeItem('chat_history_' + currentTenant);
          localStorage.removeItem('cet_active_messages');
        } catch (_) {}
      }

      setIsModalOpen(false);
      if (onDeleted) onDeleted();
      window.location.href = '/' + currentTenant;
    } catch (err) {
      console.error(, err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Contenedor principal estilizado oscuro con glassmorphism profesional */}
      <div className="w-full rounded-2xl p-4 sm:p-5 bg-[#09090b]/85 border border-white/10 hover:border-rose-500/30 backdrop-blur-2xl shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.08)] relative overflow-hidden transition-all duration-300 group font-sans">
        {/* Glow sutil en la esquina */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all duration-500" />

        {/* Encabezado y badges */}
        <div className="flex items-center justify-between mb-3.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Zona Crítica
          </div>
          <span className="text-[10px] text-zinc-400 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
            {currentTenant}
          </span>
        </div>

        {/* Información descriptiva */}
        <div className="flex items-start gap-3.5 mb-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-600/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm shrink-0">
            <Trash2 size={18} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Eliminación de Proceso y Datos
            </h3>
            <p className="text-[11.5px] leading-relaxed text-zinc-400">
              Gestión operativa crítica: eliminación de registros en base de datos y memoria contextual de IA para <strong className="text-zinc-200 font-semibold">{currentTenant}</strong>.
            </p>
          </div>
        </div>

        {/* Botón de apertura del modal */}
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-rose-200 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-600 hover:text-white hover:border-rose-500 hover:shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all duration-300 active:scale-[0.98] cursor-pointer relative z-10 group/btn"
        >
          <Trash2 size={15} className="group-hover/btn:scale-110 transition-transform" />
          <span>Eliminar Datos de {currentTenant}</span>
        </button>
      </div>

      {/* Modal de Confirmación montado en Portal */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Fondo oscuro con desenfoque cinematográfico */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
            onClick={() => !isDeleting && setIsModalOpen(false)}
          />

          {/* Caja del Modal estilo Servex Copilot */}
          <div 
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-2xl bg-[#09090b]/95 border border-white/15 text-zinc-100 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans z-10"
          >
            {/* Resplandor superior sutil */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-bold text-white tracking-tight">
                      Eliminar Proceso de Datos
                    </h2>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Irreversible
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Confirmación de purga completa para {currentTenant}
                  </p>
                </div>
              </div>

              <button 
                type="button"
                disabled={isDeleting}
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
                title="Cerrar modal"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Cuerpo del modal */}
            <div className="p-6 space-y-4 relative z-10">
              <p className="text-[13px] text-zinc-200 leading-relaxed">
                ¿Estás completamente seguro de que deseas eliminar los datos de <strong className="text-white font-semibold">{currentTenant}</strong>?
              </p>

              {/* Banner de advertencia */}
              <div className="bg-rose-950/30 border border-rose-500/25 rounded-xl p-3.5 flex items-start gap-3 text-left">
                <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={16} />
                <p className="text-[11.5px] text-rose-200/90 leading-relaxed">
                  Esta acción eliminará de forma permanente catálogos, registros y flujos asociados. <strong>Esta operación no se puede deshacer</strong>.
                </p>
              </div>

              {/* Lista visual de componentes a purgar */}
              <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3.5 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Elementos incluidos en la purga:
                </span>
                <div className="flex items-center gap-2.5 text-[11.5px] text-zinc-300">
                  <Database size={14} className="text-rose-400/80 shrink-0" />
                  <span>Tablas y registros en Supabase DB</span>
                </div>
                <div className="flex items-center gap-2.5 text-[11.5px] text-zinc-300">
                  <Sparkles size={14} className="text-rose-400/80 shrink-0" />
                  <span>Memoria de sesión y contexto del Agente IA</span>
                </div>
              </div>
            </div>

            {/* Footer de acciones */}
            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-end gap-2.5 relative z-10">
              <button 
                type="button"
                disabled={isDeleting}
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer disabled:opacity-40"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.35)] border border-rose-500/40 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Eliminando proceso...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Confirmar eliminación</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default DeleteTenantButton;
