'use client';

import React, { useState, useEffect } from 'react';
import { FiZap, FiTrash2, FiAlertCircle, FiCpu } from 'react-icons/fi';
import { Zap, Loader2, Cpu } from 'lucide-react';

const EJECUTOR_PLAY = ({ 
  handleUnifiedProcess, 
  handleFullReset, 
  file, 
  isProcessing,
  setIsProcessing, // Se asume que el padre puede proveerlo o usamos control de carga local
  currentTenant,
  hasExistingData 
}) => {
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [showSecondPopup, setShowSecondPopup] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);

  // Obtener fecha actual formateada
  const currentDate = new Date().toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  const estadoProcesando = isProcessing || localProcessing;

  // Cerrar el popup de proceso unificado automáticamente
  useEffect(() => {
    if (!estadoProcesando && showStatusPopup) {
      const timer = setTimeout(() => setShowStatusPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [estadoProcesando, showStatusPopup]);

  // Cerrar el popup del segundo proceso automáticamente
  useEffect(() => {
    if (!estadoProcesando && showSecondPopup) {
      const timer = setTimeout(() => setShowSecondPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [estadoProcesando, showSecondPopup]);

  const ejecutarConConsola = async () => {
    setShowStatusPopup(true); 
    try {
      await handleUnifiedProcess();
    } catch (err) {
      console.error(`Pipeline halted: ${err.message}`);
    }
  };

  const ejecutarSegundoProceso = async () => {
    setShowSecondPopup(true);
    setLocalProcessing(true);
    if (setIsProcessing) setIsProcessing(true);

    try {
      // Saneo del string de Tenant para coincidir con la base de datos de Supabase
      // Si currentTenant es "WBT", mapeamos a "WB Manufacturing" corporativo
      const targetCompany = currentTenant === 'WBT' ? 'WB Manufacturing' : currentTenant;

      const formData = new FormData();
      formData.append('company_name', targetCompany);

      // Determinar Base URL dinámicamente si estás en local o producción
      const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:8000' 
        : 'https://servex-ai-iota.vercel.app'; // Cambia por tu url real de Render de ser necesario

      const response = await fetch(`${baseUrl}/api/v1/pipeline/compare-only`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falla en la respuesta del motor de comparación');
      }

      const result = await response.json();
      console.log('[✓] Respuesta de SERVEX_AI Engine:', result);

    } catch (err) {
      console.error(`Secondary Process halted: ${err.message}`);
    } finally {
      setLocalProcessing(false);
      if (setIsProcessing) setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 font-sans antialiased text-[#242424]">
      
      {/* --- POPUP 1: PROCESO UNIFICADO --- */}
      {showStatusPopup && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 max-w-sm w-full text-center space-y-4 transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#5b5fc7]/10 rounded-full animate-ping"></div>
                <div className="relative bg-white border border-gray-100 p-3 rounded-full shadow-sm">
                  <FiZap className="text-[#5b5fc7] animate-pulse" size={24} />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Proceso de Actualización Iniciado</h3>
              <p className="text-[11px] text-gray-500 font-medium">Catálogo ({currentTenant}): {currentDate}</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-start gap-3 text-left">
              <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <p className="text-[10px] text-amber-800 leading-tight">
                <strong>IMPORTANTE:</strong> El sistema está sincronizando datos críticos en Supabase. <strong>No cambies de sección</strong> ni reinicios la aplicación hasta que el monitor de salida finalice.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#5b5fc7]">
              <Loader2 size={12} className="animate-spin" />
              <span className="uppercase tracking-widest">Sincronizando con Supabase...</span>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP 2: SEGUNDO PROCESO --- */}
      {showSecondPopup && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 max-w-sm w-full text-center space-y-4 transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#464775]/10 rounded-full animate-ping"></div>
                <div className="relative bg-white border border-gray-100 p-3 rounded-full shadow-sm">
                  <FiCpu className="text-[#464775] animate-pulse" size={24} />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Proceso Secundario Iniciado</h3>
              <p className="text-[11px] text-gray-500 font-medium">Módulo ({currentTenant}): {currentDate}</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-start gap-3 text-left">
              <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <p className="text-[10px] text-amber-800 leading-tight">
                <strong>ADVERTENCIA:</strong> Ejecutando mapeo alternativo de matriz. Por favor, espere a que termine la carga de datos sin interrumpir el proceso.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#464775]">
              <Loader2 size={12} className="animate-spin" />
              <span className="uppercase tracking-widest">Procesando registros Cloud...</span>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTION CONTAINER --- */}
      <div className="bg-white border border-[#e0e0e0] rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[#5b5fc7]">
            <Zap size={14} fill="currentColor" />
          </div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#616161]">System Actions</h4>
        </div>
        
        <div className="flex flex-col gap-1.5">
          {/* PRIMER BOTÓN ORIGINAL */}
          <button 
            onClick={ejecutarConConsola}
            disabled={!file || estadoProcesando}
            className="w-full bg-[#464775] hover:bg-[#4f52b2] disabled:bg-[#f0f0f0] disabled:text-[#bdbdbd] text-white py-1.5 px-3 rounded font-semibold text-[11px] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {estadoProcesando && showStatusPopup ? <Loader2 size={14} className="animate-spin" /> : <FiZap size={14} />}
            RUN PIPELINE & SYNC
          </button>

          {/* SEGUNDO BOTÓN REESTRUCTURADO Y CONECTADO */}
          <button 
            onClick={ejecutarSegundoProceso}
            disabled={(!file && !hasExistingData) || estadoProcesando}
            className="w-full bg-[#5b5fc7] hover:bg-[#4f52b2] disabled:bg-[#f0f0f0] disabled:text-[#bdbdbd] text-white py-1.5 px-3 rounded font-semibold text-[11px] transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {estadoProcesando && showSecondPopup ? <Loader2 size={14} className="animate-spin" /> : <Cpu size={14} />}
            EXECUTE REESTRUCTURE XML AND CATALGE COMPARE
          </button>

          {/* BOTÓN DE RESET TRASERO */}
          <button 
            onClick={handleFullReset} 
            className="w-full mt-1 py-1.5 px-3 text-[10px] font-medium text-[#616161] hover:text-[#c4314b] hover:bg-[#f5f5f5] rounded transition-all flex items-center justify-center gap-2"
          >
            <FiTrash2 size={13} />
            Reset System
          </button>
        </div>
      </div>

    </div>
  );
};

export default EJECUTOR_PLAY;