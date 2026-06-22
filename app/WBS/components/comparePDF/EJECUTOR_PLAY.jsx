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

  const currentDate = new Date().toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  const estadoProcesando = isProcessing || localProcessing;

  useEffect(() => {
    if (!estadoProcesando && showStatusPopup) {
      const timer = setTimeout(() => setShowStatusPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [estadoProcesando, showStatusPopup]);

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
      // --- CONEXIÓN DIRECTA Y EXCLUSIVA PARA WBS ---
      const targetCompany = 'WBS';
      const baseUrl = 'https://servex-ai-back.onrender.com'; 
      const endpointUrl = `${baseUrl}/wbs/api/v1/pipeline/compare-only-WBS`;
  
      const formData = new FormData();
      formData.append('company_name', targetCompany);
  
      console.log(`[+] Despachando payload atómico WBS a: ${endpointUrl}`);
  
      const response = await fetch(endpointUrl, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Falla en la respuesta del motor WBS');
      }
  
      const result = await response.json();
      console.log('[✓] Respuesta de SERVEX_AI WBS Engine:', result);
  
    } catch (err) {
      console.error(`WBS Process halted: ${err.message}`);
    } finally {
      setLocalProcessing(false);
      if (setIsProcessing) setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 font-sans antialiased text-[#242424]">
      
      {/* --- POPUP 1 --- */}
      {showStatusPopup && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-6">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-lg sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 transform animate-in zoom-in-95 duration-200">
            <div className="relative bg-white border border-gray-100 p-3 rounded-full shadow-sm inline-block">
              <FiZap className="text-[#5b5fc7] animate-pulse" size={20} />
            </div>
            <h3 className="text-sm font-bold text-gray-800 uppercase">WBS Update Process Initiated</h3>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-left">
              <p className="text-[10px] text-amber-800">Synchronizing critical WBS data. Please do not interrupt.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#5b5fc7]">
              <Loader2 size={12} className="animate-spin" />
              <span>SYNCING WBS...</span>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP 2 --- */}
      {showSecondPopup && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-6">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-lg sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 transform animate-in zoom-in-95 duration-200">
            <div className="relative bg-white border border-gray-100 p-3 rounded-full shadow-sm inline-block">
              <FiCpu className="text-[#464775] animate-pulse" size={20} />
            </div>
            <h3 className="text-sm font-bold text-gray-800 uppercase">WBS Engine Processing</h3>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl text-left">
              <p className="text-[10px] text-amber-800">Executing WBS XML Restructure & Audit.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#464775]">
              <Loader2 size={12} className="animate-spin" />
              <span>PROCESSING WBS CLOUD RECORDS...</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#e0e0e0] rounded-lg p-4 shadow-sm flex flex-col h-full gap-4">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-[#5b5fc7]" fill="currentColor" />
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#616161]">WBS System Actions</h4>
        </div>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={ejecutarConConsola}
            disabled={!file || estadoProcesando}
            className="w-full bg-[#464775] hover:bg-[#4f52b2] disabled:bg-[#f0f0f0] text-white py-2 rounded-md font-semibold text-[11px] flex items-center justify-center gap-2"
          >
            {estadoProcesando && showStatusPopup ? <Loader2 size={12} className="animate-spin" /> : <FiZap size={12} />}
            SAVE NEW WBS DATA
          </button>

          <button 
            onClick={ejecutarSegundoProceso}
            disabled={(!file && !hasExistingData) || estadoProcesando}
            className="w-full bg-[#464775] hover:bg-[#4f52b2] disabled:bg-[#f0f0f0] text-white py-2 rounded-md font-semibold text-[11px] flex items-center justify-center gap-2"
          >
            {estadoProcesando && showSecondPopup ? <Loader2 size={12} className="animate-spin" /> : <Cpu size={12} />}
            WBS RESTRUCTURE & AUDIT
          </button>

          <button 
            onClick={handleFullReset} 
            className="w-full py-2 text-[10px] font-medium text-[#616161] hover:text-[#c4314b] border border-[#e0e0e0] rounded-md flex items-center justify-center gap-2"
          >
            <FiTrash2 size={12} />
            RESET WBS SYSTEM
          </button>
        </div>
      </div>
    </div>
  );
};

export default EJECUTOR_PLAY;