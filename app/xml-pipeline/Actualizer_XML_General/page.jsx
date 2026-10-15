'use client';
import XMLResultsGeneral from '../Actualizer_Excel_General/components/XML_Results_General.jsx';
import ImportCETXml from '../Actualizer_Excel_General/components/IncertDataExcel/incertXML_excel';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentUser } from '../../lib/supabaseClient.js';
import {  X, AlertCircle , Sparkles, Settings } from 'lucide-react';
import TeamsAgentChat from './components/comparePDF/REPORT/components/AI_contact.jsx';

import MenuLateral from './components/menuLateral.jsx';
import ViewportGraphics from './components/comparePDF/aiReporting/compnents/ViewportGraphics.jsx';
import Dashboard from './components/perceo_XML_MASTER_post_prcess.jsx';
import PriceProduct from './components/perceo_XML_MASTER_pre_prosses.jsx';
import CatalogParser from './components/PDFsection.jsx';
import Csvs from './components/comparePDF/csvs.jsx';
import Csvs_updated from './components/comparePDF/csvs_updated.jsx';
import PrecentMain from './components/PrecentMain.jsx';
import UploadFileCmpare from './components/comparePDF/IncertData/components/EJECUTOR.jsx';
import AIReporting from './components/comparePDF/presentation_General.jsx'
import Compare from './components/comparePDF/UploadFileCmpare.jsx'
import Responce_ai from './components/comparePDF/REPORT_SUPABASE_AI.jsx'
import Report from './components/comparePDF/REPORT/dashboard.jsx';
import IncertDelete from './components/comparePDF/IncertData/Incert_data.jsx'
import DeleteData from './components/comparePDF/IncertData/components/delete_data';
import CETComparator from '../Actualizer_Excel_General/components/CET_Comparator.jsx';

export default function MenuInicial() {
  const [active, setActive] = useState('reporting');
  const [showExitModal, setShowExitModal] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const router = useRouter();

  // 🔒 PROTECCIÓN DE RUTA DE XML PIPELINE
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/login');
        } else {
          if (isMounted) {
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        router.replace('/login');
      }
    };
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);


  
  useEffect(() => {
    const handleNavigate = (e) => {
      if (e.detail) setActive(e.detail);
    };
    window.addEventListener('navigateTo', handleNavigate);
    return () => window.removeEventListener('navigateTo', handleNavigate);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 700);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);

    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
      setShowExitModal(true);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.push('/panel');
  };

  
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isIntroDismissed, setIsIntroDismissed] = useState(true);

  const handleSetActive = (id) => {
    setActive(id);
    setIsToolsOpen(true);
  };
  const renderContent = () => {
    if (active === 'notifications' && isMobileScreen) {
      return (
        <div className="p-6 flex flex-col items-center justify-center h-full text-center bg-slate-50">
          <AlertCircle className="text-amber-500 mb-2" size={32} />
          <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-wider">Panel Locked</h3>
          <p className={"text-[12px] text-slate-500 max-w-xs mt-1"}>
            The Change Tracker section is only available for desktop (PC) environments.
          </p>
        </div>
      );
    }

    switch (active) {
      case 'dashboard': return <Dashboard />;
      case 'incert_delete': return <IncertDelete step="xml" />;
                    case 'incert_wbs_csv_base': return <IncertDelete step="csv_base" />;
                    case 'incert_wbs_csv_new': return <IncertDelete step="csv_new" />;
      case 'xml_results': return <XMLResultsGeneral />;
      case 'Tasks': return <CatalogParser />;
      case 'inbox_updated': return <Csvs_updated />;
      case 'presentation': return <PrecentMain />;
      case 'report': return <Report />;
      case 'notifications': return <UploadFileCmpare />;
      case 'reporting': return <AIReporting />;
      case 'graphics': return <ViewportGraphics />;
      case 'compare': return <Compare />;
      case 'compare_cet': return <CETComparator />;
      case 'AI_reporter': return <Responce_ai />;
      default:
        return <div className="p-6 text-gray-500">View under construction</div>;
    }
  };

  if (isLoadingAuth || !isAuthenticated) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white text-slate-400 select-none">
        <div className="w-8 h-8 border-2 border-[#464775]/20 border-t-[#464775] rounded-full animate-spin mb-3" />
        <span className="text-xs font-medium tracking-wide text-slate-500">Verifying session...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-white font-sans flex flex-col m-0 p-0 min-h-0 relative">

      {showExitModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowExitModal(false)}
          />

          <div className="relative bg-white w-[440px] rounded-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <span className="text-[14px] font-bold text-[#242424]">Confirm exit</span>
              <button onClick={() => setShowExitModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="px-8 py-6 flex gap-4">
              <div className="bg-[#C4314B]/10 p-2 h-fit rounded-full shrink-0">
                <AlertCircle size={22} className="text-[#C4314B]" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#242424] mb-1">
                  Do you want to return to the main panel?
                </p>
                <p className="text-[13px] text-[#616161] leading-relaxed">
                  You are about to leave the WBT management area. Any temporary changes in this view will be closed.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F5F5F5] flex justify-end gap-2 rounded-b-xl border-t border-slate-100">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-1.5 text-[12px] font-semibold text-[#242424] bg-white border border-[#D1D1D1] rounded hover:bg-[#F0F0F0] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExit}
                className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[#5B5FC7] rounded hover:bg-[#4F52B2] transition-all shadow-md"
              >
                Confirm and return
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="w-full h-full p-0 m-0 flex relative overflow-hidden flex-1 min-h-0">

      {/* ── GLOBAL SPLASH MODAL ── */}
      <div
        className={`fixed inset-0 z-[9999] pointer-events-none transition-all duration-500 ease-out flex items-center justify-center bg-white/40 backdrop-blur-md ${!isIntroDismissed ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center justify-center h-full w-full p-4 sm:p-6">
          <div className={`
            bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] 
            rounded-3xl w-full max-w-4xl p-6 md:p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-6 md:gap-10 lg:gap-16
            transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative
            max-h-[90vh] overflow-y-auto custom-scrollbar
            ${!isIntroDismissed ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto' : 'translate-y-12 scale-95 opacity-0 pointer-events-none'}
          `}>

            {/* Close Button */}
            <button
              onClick={() => setIsIntroDismissed(true)}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors z-20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Decorativos */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#464775]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

            {/* Izquierda: Logo */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              <img
                src="/alysa_lg.png"
                alt="Logo"
                className="w-48 md:w-64 lg:w-80 h-auto object-contain drop-shadow-2xl mb-4 md:mb-8 transition-transform duration-700 hover:scale-105"
              />
              <div className="text-center">
                <h3 className="text-[#464775] text-lg lg:text-xl font-extralight tracking-[0.25em]">
                  CET Change Development Tool
                </h3>
                <p className="text-slate-400 text-[9px] mt-3 font-light tracking-widest uppercase">
                  Development of new technologies · Servex transition
                </p>
              </div>
            </div>

            {/* Divisor vertical */}
            <div className="hidden lg:block w-px h-72 bg-gradient-to-b from-transparent via-slate-200 to-transparent relative z-10" />

            {/* Derecha: Textos */}
            <div className="flex-1 flex flex-col justify-center relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#464775]/5 border border-[#464775]/10 w-fit mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#464775] animate-pulse" />
                <span className="text-[9px] font-bold tracking-widest text-[#464775] uppercase">Powered by SVX</span>
              </div>

              <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-slate-800 tracking-tight mb-4 md:mb-5 leading-tight">
                Weeks of work.<br />
                <strong className="font-semibold text-[#464775]">Done in seconds.</strong>
              </h2>

              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-light mb-6 md:mb-8 text-justify md:text-left">
                Through a few simple actions, our system fully automates <strong className="font-medium text-slate-700">3 weeks of manual analysis, data comparison, updating, and strict verification</strong>.
                The entire operational lifecycle that previously took weeks is now flawlessly executed in mere seconds by <strong className="font-semibold text-slate-700">Alysa Servex Copilot</strong>.
              </p>

              <div className="flex flex-col gap-1 mt-auto">
                <p className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold">Proprietary Technology</p>
                <p className="text-[10px] text-slate-500 font-light tracking-wide">Next-gen intelligence ecosystem.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

        <MenuLateral
          active={active}
          setActive={handleSetActive}
          onExit={() => setShowExitModal(true)}
        />
                {/* CONTENEDOR UNIFICADO */}
        <div className="flex flex-1 h-full w-full min-w-0 p-0 bg-transparent">
          <div className="flex flex-col w-full h-full bg-transparent overflow-hidden relative">
            {/* --- FONDO ESTILO PANEL PRINCIPAL (MISMO DISEÑO Y COLORES, DIFERENTE COMPOSICIÓN Y POSICIÓN) --- */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
              <img src="/fondo.jpg" alt="Background" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-[#464775]/5 to-[#464775]/15" />
              
              {/* Cuadro 1: Plano geométrico izquierdo rotado en ángulo opuesto */}
              <div className="absolute top-[-10%] left-[-5%] w-[55%] h-[120%] -rotate-[12deg]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/10 to-transparent border-r border-white/60 shadow-[-1px_0_10px_rgba(0,0,0,0.03)]" />
              </div>
              
              {/* Cuadro 2: Segundo plano complementario izquierdo */}
              <div className="absolute top-[8%] left-[10%] w-[38%] h-[100%] -rotate-[12deg]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/5 to-transparent border-r border-white/50" />
              </div>

              {/* Cuadro 3: Plano geométrico inferior derecho de balance */}
              <div className="absolute bottom-[-15%] right-[-5%] w-[48%] h-[75%] rotate-[10deg]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#464775]/8 to-transparent border-t border-l border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)]" />
              </div>
            </div>

            {/* ── TOP BAR (100% Width across entire container) ── */}
            <header className="relative z-20 h-[52px] flex-shrink-0 flex items-center justify-between px-3 sm:px-5 bg-transparent border-b border-slate-200/30 w-full">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="text-[10px] font-bold text-[#464775] bg-[#464775]/10 border border-[#464775]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Servex Copilot
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('openAiGuide'))}
                  title="AI Guide & Documentation"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#464775]/10 hover:bg-[#464775]/20 text-[#464775] border border-[#464775]/20 hover:border-[#464775]/35 transition-all text-[11px] font-semibold shadow-sm group cursor-pointer"
                >
                  <Sparkles size={13} className="text-[#6264A7] group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">AI Guide</span>
                </button>

                {isToolsOpen && (
                  <button 
                    onClick={() => setIsToolsOpen(false)}
                    className="flex items-center justify-center p-1.5 rounded-full border bg-white border-slate-200 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all ml-1"
                    title="Close panel"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </header>

            {/* Body Area (Split View below 100% Header) */}
            <div className="flex flex-1 w-full min-h-0 relative z-10 overflow-hidden">
              {/* Lado Izquierdo: Asistente IA */}
              <div className={`
                h-full flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex-shrink-0 bg-transparent
                ${isToolsOpen 
                  ? 'hidden md:flex md:w-[50%] border-r border-slate-200/60' 
                  : 'flex w-full'}
              `}>
                <TeamsAgentChat 
                  currentSection={active}
                  onOpenToolPanel={handleSetActive}
                  renderTool={(toolId) => {
                    switch (toolId) {
                      case 'incert_delete': return <IncertDelete step="xml" />;
                      case 'incert_wbs_csv_base': return <IncertDelete step="csv_base" />;
                      case 'incert_wbs_csv_new': return <IncertDelete step="csv_new" />;
                      case 'import_cet_xml': return <div className="w-full h-full overflow-y-auto"><ImportCETXml moduleName="General_Procces" /></div>;
                      case 'delete_data': return <div className="w-full max-w-sm mx-auto mt-4"><DeleteData /></div>;
                      case 'report': return <Report />;
                      case 'graphics': return <ViewportGraphics />;
                      case 'AI_reporter': return <Responce_ai />;
                      case 'exportCETcsv': return <XMLResultsGeneral />;
                      case 'compareCET': return <CETComparator />;
                      default: return null;
                    }
                  }}
                />
              </div>

              {/* Lado Derecho: Contenido Principal */}
              <div className={`
                relative h-full flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex-shrink-0 bg-transparent
                ${isToolsOpen 
                  ? 'flex w-full md:w-[50%] opacity-100' 
                  : 'hidden md:flex md:w-0 opacity-0'}
              `}>
                {/* Contenedor interno absoluto para evitar squish en animación */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col overflow-hidden min-w-0 md:min-w-[500px]">
                  <div className="flex-1 w-full relative overflow-y-auto pb-24 custom-scrollbar">
                    <div className="p-1 sm:p-2 w-full h-full">
                      {renderContent()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}