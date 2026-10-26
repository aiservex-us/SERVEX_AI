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
  onCompleted,
  isDarkMode = true
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

  const handleConfirmAction = async (targetAction) => {
    setIsPurging(true);
    try {
      if (typeof window !== 'undefined') {
        window.__BYPASS_BEFOREUNLOAD__ = true;
      }

      // 1. Enviar beacon de descarga inmediata
      purgeTenantDataBeacon(currentTenant);

      // 2. Ejecutar la purga paralela de alta velocidad
      await purgeTenantData(currentTenant);

      if (onCompleted) {
        onCompleted();
      }

      // 3. Ejecutar la acción solicitada inmediatamente sin esperas
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Fondo con desenfoque cinematográfico adaptativo */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 animate-in fade-in ${
          isDarkMode ? 'bg-black/80 backdrop-blur-md' : 'bg-slate-900/40 backdrop-blur-md'
        }`}
        onClick={() => !isPurging && onClose()}
      />

      {/* Caja del Modal estilo Servex Copilot */}
      <div 
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-md rounded-none border backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans z-10 transition-colors ${
          isDarkMode
            ? 'bg-[#09090b]/95 border-white/15 text-zinc-100 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)]'
            : 'bg-white/98 border-slate-200 text-slate-900 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.18)]'
        }`}
      >
        {/* Resplandor superior sutil */}
        <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full blur-3xl pointer-events-none ${
          isDarkMode ? 'bg-rose-500/15' : 'bg-rose-500/10'
        }`} />

        {/* Header del modal */}
        <div className={`px-6 py-4 border-b flex items-center justify-between relative z-10 ${
          isDarkMode ? 'border-white/10' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-none border flex items-center justify-center shadow-sm shrink-0 ${
              isDarkMode 
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
                : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}>
              {isReload ? <RotateCcw size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-[14px] font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-[#18181b]'
                }`}>
                  {isReload ? 'Reiniciar Proceso y Purgar Datos' : 'Eliminar Proceso y Salir'}
                </h2>
                <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border ${
                  isDarkMode 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                    : 'bg-rose-100/80 text-rose-700 border-rose-200'
                }`}>
                  Irreversible
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${
                isDarkMode ? 'text-zinc-400' : 'text-slate-500'
              }`}>
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
            className={`p-1.5 rounded-none transition-colors disabled:opacity-40 cursor-pointer ${
              isDarkMode 
                ? 'text-zinc-400 hover:text-white hover:bg-white/10' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Cerrar modal"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Cuerpo del modal */}
        <div className="p-6 space-y-4 relative z-10">
          <p className={`text-[13px] leading-relaxed ${
            isDarkMode ? 'text-zinc-200' : 'text-slate-700'
          }`}>
            {isReload 
              ? '¿Estás completamente seguro de que deseas recargar la página y descartar el proceso?'
              : '¿Estás completamente seguro de que deseas salir del XML Pipeline y descartar el proceso?'}
          </p>

          <p className={`text-[12px] leading-relaxed ${
            isDarkMode ? 'text-zinc-300' : 'text-slate-600'
          }`}>
            Por optimización del sistema, todo lo realizado hasta el momento en este catálogo será <strong className={isDarkMode ? 'text-white font-semibold' : 'text-[#18181b] font-semibold'}>eliminado automáticamente</strong> de Supabase. La tabla <code className={`px-1.5 py-0.5 rounded-none text-[11px] font-mono border ${
              isDarkMode ? 'text-rose-300 bg-white/5 border-white/10' : 'text-rose-700 bg-rose-50/80 border-rose-200/80'
            }`}>ClientsSERVEX_General_Procces</code> quedará <strong className={isDarkMode ? 'text-white font-semibold' : 'text-[#18181b] font-semibold'}>completamente vacía</strong>, tal como al accionar el botón de eliminar proceso.
          </p>

          {/* Banner de advertencia */}
          <div className={`border rounded-none p-3.5 flex items-start gap-3 text-left ${
            isDarkMode 
              ? 'bg-rose-950/30 border-rose-500/25 text-rose-200/90' 
              : 'bg-rose-50/80 border-rose-200 text-rose-900'
          }`}>
            <ShieldAlert className={`shrink-0 mt-0.5 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} size={16} />
            <p className="text-[11.5px] leading-relaxed">
              En la base de datos de Supabase <strong>no quedará guardado nada</strong> de lo que hayas hecho si recargas o sales ahora. Para actualizar o auditar de nuevo, <strong>deberás volver a subir el catálogo XML maestro</strong>.
            </p>
          </div>

          {/* Lista visual de componentes a purgar */}
          <div className={`rounded-none border p-3.5 space-y-2.5 ${
            isDarkMode 
              ? 'bg-white/[0.02] border-white/10 text-zinc-300' 
              : 'bg-slate-50/80 border-slate-200 text-slate-700'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              isDarkMode ? 'text-zinc-400' : 'text-slate-500'
            }`}>
              Elementos incluidos en la purga:
            </span>
            <div className="flex items-center gap-2.5 text-[11.5px]">
              <Database size={14} className={isDarkMode ? 'text-rose-400/80 shrink-0' : 'text-rose-600/80 shrink-0'} />
              <span>Tabla <strong className={isDarkMode ? 'text-zinc-200 font-medium' : 'text-[#18181b] font-medium'}>ClientsSERVEX_General_Procces</strong> (100% vacía)</span>
            </div>
            <div className="flex items-center gap-2.5 text-[11.5px]">
              <FileSpreadsheet size={14} className={isDarkMode ? 'text-rose-400/80 shrink-0' : 'text-rose-600/80 shrink-0'} />
              <span>Archivos XML/CSV en Bucket <strong className={isDarkMode ? 'text-zinc-200 font-medium' : 'text-[#18181b] font-medium'}>catalogs-storage</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-[11.5px]">
              <Sparkles size={14} className={isDarkMode ? 'text-rose-400/80 shrink-0' : 'text-rose-600/80 shrink-0'} />
              <span>Memoria de sesión y contexto del Agente IA</span>
            </div>
          </div>
        </div>

        {/* Footer de acciones */}
        <div className={`px-6 py-4 border-t flex items-center justify-between gap-2.5 relative z-10 ${
          isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50/50 border-slate-100'
        }`}>
          <button 
            type="button"
            disabled={isPurging}
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-none border transition-all cursor-pointer disabled:opacity-40 ${
              isDarkMode 
                ? 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-white/10' 
                : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs'
            }`}
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
                  className={`px-3.5 py-2 text-xs font-semibold rounded-none border transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 ${
                    isDarkMode 
                      ? 'bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white border-white/10' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 shadow-xs'
                  }`}
                >
                  <LogOut size={13} />
                  <span>Salir al Panel</span>
                </button>
                <button 
                  type="button"
                  onClick={() => handleConfirmAction('reload')}
                  disabled={isPurging}
                  className={`px-4 py-2 text-xs font-semibold rounded-none transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-[0.98] ${
                    isDarkMode
                      ? 'text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-[0_0_20px_rgba(225,29,72,0.35)] border border-rose-500/40'
                      : 'text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25 border border-rose-600'
                  }`}
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
                  className={`px-3.5 py-2 text-xs font-semibold rounded-none border transition-all cursor-pointer disabled:opacity-40 ${
                    isDarkMode
                      ? 'bg-white/5 hover:bg-rose-500/10 text-zinc-300 hover:text-rose-200 border-white/10 hover:border-rose-500/20'
                      : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200 hover:border-rose-200'
                  }`}
                >
                  Cerrar Sesión
                </button>
                <button 
                  type="button"
                  onClick={() => handleConfirmAction('exit')}
                  disabled={isPurging}
                  className={`px-4 py-2 text-xs font-semibold rounded-none transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer active:scale-[0.98] ${
                    isDarkMode
                      ? 'text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-[0_0_20px_rgba(225,29,72,0.35)] border border-rose-500/40'
                      : 'text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25 border border-rose-600'
                  }`}
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

