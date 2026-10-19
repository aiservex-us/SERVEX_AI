'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Database, 
  FileSpreadsheet, 
  Sparkles, 
  Trash2, 
  RotateCcw, 
  LogOut, 
  Loader2, 
  X 
} from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';
import { purgeTenantData, purgeTenantDataBeacon } from './comparePDF/IncertData/components/delete_data';

export default function ExitPipelineModal({
  isOpen,
  onClose,
  exitType = 'exit', // 'exit' | 'reload' | 'signout'
  currentTenant = 'General_Procces',
  onCompleted
}) {
  const [mounted, setMounted] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar modal con tecla Escape si no está en proceso de purga
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isPurging) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPurging, onClose]);

  if (!mounted || !isOpen) return null;

  const displayTenant = currentTenant === 'General_Procces' ? 'XML Pipeline' : currentTenant;

  const handleConfirmAction = async (targetAction) => {
    setIsPurging(true);
    try {
      if (typeof window !== 'undefined') {
        window.__BYPASS_BEFOREUNLOAD__ = true;
      }

      // 1. Ejecutar purga de emergencia inmediata vía beacon y vía async directa
      purgeTenantDataBeacon(currentTenant);
      await purgeTenantData(currentTenant);

      if (onCompleted) {
        onCompleted();
      }

      // 2. Ejecutar la acción solicitada
      if (targetAction === 'reload') {
        window.location.reload();
      } else if (targetAction === 'signout') {
        try {
          await supabase.auth.signOut();
        } catch (_) {}
        window.location.href = '/';
      } else {
        window.location.href = '/panel';
      }
    } catch (err) {
      console.error('[SERVEX_AI] Error durante la purga en salida/recarga:', err);
      // Reaseguro: si falló la conexión completa, forzar la acción
      if (targetAction === 'reload') {
        window.location.reload();
      } else {
        window.location.href = '/panel';
      }
    } finally {
      setIsPurging(false);
      onClose();
    }
  };

  const isReload = exitType === 'reload';

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Fondo oscuro con desenfoque cinematográfico idéntico a deleteData */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={() => !isPurging && onClose()}
      />

      {/* Caja del Modal estilo Servex Copilot (Idéntico a DeleteTenantButton) */}
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
              {isReload ? <RotateCcw size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-bold text-white tracking-tight">
                  {isReload ? 'Reiniciar Proceso y Purgar Datos' : 'Eliminar Proceso y Salir'}
                </h2>
                <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Irreversible
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {isReload 
                  ? 'Confirmación de recarga y descarte total de sesión'
                  : 'Confirmación de salida y descarte de sesión'}
              </p>
            </div>
          </div>

          <button 
            type="button"
            disabled={isPurging}
            onClick={onClose} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
            title="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Cuerpo del modal */}
        <div className="p-6 space-y-4 relative z-10">
          <p className="text-[13px] text-zinc-200 leading-relaxed">
            {isReload 
              ? '¿Estás completamente seguro de que deseas recargar la página y descartar el proceso?'
              : '¿Estás completamente seguro de que deseas salir del XML Pipeline y descartar el proceso?'}
          </p>

          <p className="text-[12px] text-zinc-300 leading-relaxed">
            Por optimización del sistema, todo lo realizado hasta el momento en este catálogo será <strong className="text-white font-semibold">eliminado automáticamente</strong> de Supabase. La tabla <code className="text-rose-300 bg-white/5 px-1 py-0.5 rounded text-[11px] font-mono">ClientsSERVEX_General_Procces</code> quedará <strong className="text-white font-semibold">completamente vacía</strong>, tal como al accionar el botón de eliminar proceso.
          </p>

          {/* Banner de advertencia */}
          <div className="bg-rose-950/30 border border-rose-500/25 rounded-xl p-3.5 flex items-start gap-3 text-left">
            <ShieldAlert className="text-rose-400 shrink-0 mt-0.5" size={16} />
            <p className="text-[11.5px] text-rose-200/90 leading-relaxed">
              En la base de datos de Supabase <strong>no quedará guardado nada</strong> de lo que hayas hecho si recargas o sales ahora. Para actualizar o auditar de nuevo, <strong>deberás volver a subir el catálogo XML maestro</strong>.
            </p>
          </div>

          {/* Lista visual de componentes a purgar (idéntico a deleteData) */}
          <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3.5 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Elementos incluidos en la purga:
            </span>
            <div className="flex items-center gap-2.5 text-[11.5px] text-zinc-300">
              <Database size={14} className="text-rose-400/80 shrink-0" />
              <span>Tabla <strong className="text-zinc-200 font-medium">ClientsSERVEX_General_Procces</strong> (100% vacía)</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11.5px] text-zinc-300">
              <FileSpreadsheet size={14} className="text-rose-400/80 shrink-0" />
              <span>Archivos XML/CSV en Bucket <strong className="text-zinc-200 font-medium">catalogs-storage</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-[11.5px] text-zinc-300">
              <Sparkles size={14} className="text-rose-400/80 shrink-0" />
              <span>Memoria de sesión y contexto del Agente IA</span>
            </div>
          </div>
        </div>

        {/* Footer de acciones */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between gap-2.5 relative z-10">
          <button 
            type="button"
            disabled={isPurging}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer disabled:opacity-40"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {isReload ? (
              <>
                <button
                  type="button"
                  disabled={isPurging}
                  onClick={() => handleConfirmAction('exit')}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                >
                  <LogOut size={13} />
                  <span>Salir al Panel</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleConfirmAction('reload')}
                  disabled={isPurging}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.35)] border border-rose-500/40 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {isPurging ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Purgando base de datos...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw size={14} />
                      <span>Descartar y Recargar</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isPurging}
                  onClick={() => handleConfirmAction('signout')}
                  className="px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-rose-200 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 rounded-xl transition-all cursor-pointer disabled:opacity-40"
                >
                  Cerrar Sesión
                </button>
                <button 
                  type="button"
                  onClick={() => handleConfirmAction('exit')}
                  disabled={isPurging}
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.35)] border border-rose-500/40 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  {isPurging ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Purgando base de datos...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Descartar y Salir</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
