'use client';

import React, { useState, useEffect } from 'react';
import { FiZap, FiTrash2, FiAlertCircle, FiCpu } from 'react-icons/fi';
import { Zap, Loader2, Cpu } from 'lucide-react';

const EJECUTOR_PLAY = ({ 
  handleUnifiedProcess, 
  handleFullReset, 
  file, 
  isProcessing,
  setIsProcessing, 
  currentTenant,
  hasExistingData 
}) => {
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [showSecondPopup, setShowSecondPopup] = useState(false);
  const [localProcessing, setLocalProcessing] = useState(false);

  // Obtener fecha actual formateada
  const currentDate = new Date().toLocaleDateString('en-US', { 
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
      // SANEAMIENTO MULTI-TENANT: Forzamos la identificación limpia de WBO para este sub-motor
      const targetCompany = 'WBO';

      const formData = new FormData();
      formData.append('company_name', targetCompany);
  
      // Cluster Base Distribuidor de SERVEX_AI
      const baseUrl = 'https://servex-ai-back.onrender.com'; 
      
      // SOLUCIÓN AL 404: Endpoint modificado con el sufijo -WBO mapeado en el backend
      const endpointUrl = `${baseUrl}/wbo/api/v1/pipeline/compare-only-WBO`;
  
      console.log(`[+] Despachando payload atómico a: ${endpointUrl}`);
  
      const response = await fetch(endpointUrl, {
        method: 'POST',
        body: formData,
        // El navegador gestiona el boundary multipart/form-data automáticamente al omitir Content-Type
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falla en la respuesta del motor de comparación WBO');
      }
  
      const result = await response.json();
      console.log('[✓] Respuesta de SERVEX_AI Engine (WBO):', result);
  
    } catch (err) {
      console.error(`Secondary Process halted (WBO): ${err.message}`);
    } finally {
      setLocalProcessing(false);
      if (setIsProcessing) setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 font-sans antialiased text-[#242424]">
      
      {/* --- POPUP 1: PROCESO UNIFICADO --- */}
      {showStatusPopup && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-6">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-lg sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 sm:space-y-4 transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#5b5fc7]/10 rounded-full animate-ping"></div>
                <div className="relative bg-white border border-gray-100 p-2 sm:p-3 rounded-full shadow-sm">
                  <FiZap className="text-[#5b5fc7] animate-pulse" size={20} />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-tight">Update Process Initiated</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Catalog ({currentTenant}): {currentDate}</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 text-left">
              <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={14} />
              <p className="text-[9px] sm:text-[10px] text-amber-800 leading-tight">
                <strong>IMPORTANT:</strong> The system is synchronizing critical data within SVX. <strong>Do not switch sections</strong> or restart the application until the output monitor finishes.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#5b5fc7]">
              <Loader2 size={12} className="animate-spin" />
              <span className="uppercase tracking-widest">Synchronizing with CRUD...</span>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP 2: SEGUNDO PROCESO --- */}
      {showSecondPopup && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-6">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-lg sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 sm:space-y-4 transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#464775]/10 rounded-full animate-ping"></div>
                <div className="relative bg-white border border-gray-100 p-2 sm:p-3 rounded-full shadow-sm">
                  <FiCpu className="text-[#464775] animate-pulse" size={20} />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-tight">Secondary Process Initiated</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Module ({currentTenant}): {currentDate}</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 text-left">
              <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={14} />
              <p className="text-[9px] sm:text-[10px] text-amber-800 leading-tight">
                <strong>WARNING:</strong> Storing new catalog data. Please wait for the data upload to complete without interrupting the process.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#464775]">
              <Loader2 size={12} className="animate-spin" />
              <span className="uppercase tracking-widest">Processing Cloud Records...</span>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTION CONTAINER --- */}
      <div className="bg-white border border-[#e0e0e0] rounded-lg p-3 sm:p-4 lg:p-5 shadow-sm flex flex-col h-full gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <div className="text-[#5b5fc7]">
            <Zap size={12} className="sm:hidden" fill="currentColor" />
            <Zap size={14} className="hidden sm:inline" fill="currentColor" />
          </div>
          <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#616161]">System Actions</h4>
        </div>
        
        <div className="flex flex-col gap-3 sm:gap-4 flex-1">
          {/* PRIMER BOTÓN CON DESCRIPCIÓN */}
          <div className="flex flex-col gap-1.5 sm:gap-2 pb-3 sm:pb-4 border-b border-[#f0f0f0]">
            <button 
              onClick={ejecutarConConsola}
              disabled={!file || estadoProcesando}
              className="w-full bg-[#464775] hover:bg-[#4f52b2] disabled:bg-[#f0f0f0] disabled:text-[#bdbdbd] text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-md font-semibold text-[10px] sm:text-[11px] transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-sm"
            >
              {estadoProcesando && showStatusPopup ? <Loader2 size={12} className="animate-spin" /> : <FiZap size={12} />}
              <span className="line-clamp-2">SAVE NEW DATA IN SYSTEM (FIRST STEP)</span>
            </button>
            <div className="px-1 py-1 sm:py-2">
              <p className="text-[8px] sm:text-[9px] font-bold text-[#5b5fc7] mb-0.5 sm:mb-1 uppercase tracking-wide">Process:</p>
              <p className="text-[8px] sm:text-[9px] text-[#616161] leading-relaxed line-clamp-3 sm:line-clamp-none">
                Uploads your CSV catalog data to the cloud database and synchronizes it with the CRUD system. This step validates, sanitizes, and stores the new pricing information.
              </p>
            </div>
          </div>

          {/* SEGUNDO BOTÓN CON DESCRIPCIÓN */}
          <div className="flex flex-col gap-1.5 sm:gap-2 pb-3 sm:pb-4 border-b border-[#f0f0f0]">
            <button 
              onClick={ejecutarSegundoProceso}
              disabled={!hasExistingData || !file || estadoProcesando}
              title={!hasExistingData ? "Must complete the first step (upload base) before executing this step." : ""}
              className="w-full bg-[#464775] hover:bg-[#4f52b2] disabled:bg-[#f0f0f0] disabled:text-[#bdbdbd] text-white py-1.5 sm:py-2 px-2 sm:px-3 rounded-md font-semibold text-[10px] sm:text-[11px] transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-sm"
            >
              {estadoProcesando && showSecondPopup ? <Loader2 size={12} className="animate-spin" /> : <Cpu size={12} />}
              <span className="line-clamp-2">EXECUTE XML RESTRUCTURE AND CATALOG COMPARE (SECOND STEP)</span>
            </button>
            <div className="px-1 py-1 sm:py-2">
              <p className="text-[8px] sm:text-[9px] font-bold text-[#464775] mb-0.5 sm:mb-1 uppercase tracking-wide">Process:</p>
              <p className="text-[8px] sm:text-[9px] text-[#616161] leading-relaxed line-clamp-3 sm:line-clamp-none">
                Restructures the XML catalog format and compares it against master records. Generates an audit report highlighting changes, differences, and validation results for CET Designer approval.
              </p>
            </div>
          </div>

          {/* BOTÓN DE RESET CON DESCRIPCIÓN */}
          <div className="flex flex-col gap-1.5 sm:gap-2 mt-auto">
            <button 
              onClick={handleFullReset} 
              className="w-full py-1.5 sm:py-2 px-2 sm:px-3 text-[9px] sm:text-[10px] font-medium text-[#616161] hover:text-[#c4314b] hover:bg-[#f5f5f5] border border-[#e0e0e0] rounded-md transition-all flex items-center justify-center gap-1 sm:gap-2"
            >
              <FiTrash2 size={12} />
              RESET SYSTEM
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EJECUTOR_PLAY;