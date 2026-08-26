'use client';
import XMLResultsLESRO from '../Actualizer_Excel_LESRO/components/XML_Results_LESRO.jsx';
import ImportCETXml from '../Actualizer_Excel_LESRO/components/IncertDataExcel/incertXML_excel';
import CETComparator from '../Actualizer_Excel_LESRO/components/CET_Comparator.jsx';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient.js';
import { X, AlertCircle , Sparkles} from 'lucide-react';
import TeamsAgentChat from '../components/comparePDF/REPORT/components/AI_contact.jsx';


import MenuLateral from '../components/menuLateral.jsx';
import ViewportGraphics from '../components/comparePDF/aiReporting/compnents/ViewportGraphics.jsx';
import Dashboard from '../components/perceo_XML_MASTER_post_prcess.jsx';
import PriceProduct from '../components/perceo_XML_MASTER_pre_prosses.jsx';
import CatalogParser from '../components/PDFsection.jsx';
import Csvs from '../components/comparePDF/csvs.jsx';
import Csvs_updated from '../components/comparePDF/csvs_updated.jsx';
import PrecentMain from '../components/PrecentMain.jsx';
import UploadFileCmpare from '../components/comparePDF/IncertData/components/EJECUTOR.jsx';
import AIReporting from '../components/comparePDF/presentation_LESRO.jsx'
import Compare from '../components/comparePDF/UploadFileCmpare.jsx'
import Responce_ai from '../components/comparePDF/REPORT_SUPABASE_AI.jsx'
import Report from '../components/comparePDF/REPORT/dashboard.jsx';
import IncertDelete from '../components/comparePDF/IncertData/Incert_data.jsx'

export default function MenuInicial() {
  const [active, setActive] = useState('reporting');
  const [collapsed, setCollapsed] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const router = useRouter();




  
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
  const [isIntroDismissed, setIsIntroDismissed] = useState(false);
  const handleSetActive = (id) => {
    setActive(id);
    setIsToolsOpen(true);
  };

  const renderContent = () => {
    if (active === 'notifications' && isMobileScreen) {
      return (
        <div className="p-6 flex flex-col items-center justify-center h-full text-center bg-slate-50">
          <AlertCircle className="text-amber-500 mb-2" size={32} />
          <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-wider">Panel bloqueado</h3>
          <p className={"text-[12px] text-slate-500 max-w-xs mt-1"}>
            The Change Tracker section is only available for desktop (PC) environments.
          </p>
        </div>
      );
    }

    switch (active) {
      case 'dashboard': return <Dashboard />;
                          case 'incert_delete': return <IncertDelete />;
                    case 'import_cet_xml': return <div className="w-full h-full overflow-y-auto"><ImportCETXml moduleName="LESRO" /></div>;
                    case 'exportCETcsv': return <XMLResultsLESRO />;
                    case 'compareCET': return <CETComparator />;
                    case 'xml_results': return <XMLResultsLESRO />;
      case 'kanban': return <PriceProduct />;
      case 'Tasks': return <CatalogParser />;
      case 'inbox': return <Csvs />;
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
        return <Csvs_updated />;
    }
  };

  return (
    <>
      <div className="h-[97vh] w-[99%] bg-[#fff] font-sans flex items-center justify-center relative">

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

      <main className="w-full h-[95vh] p-0 flex relative overflow-hidden">

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
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        {/* CONTENEDOR UNIFICADO */}
        <div className="flex flex-1 h-full w-full min-w-0 p-2 lg:p-3 bg-slate-50">
          <div className="flex w-full h-full bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden relative">
            
            {/* Lado Izquierdo: Asistente IA */}
            <div className={`hidden md:flex relative h-full flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex-shrink-0 ${isToolsOpen ? 'w-[50%] border-r border-slate-100 bg-slate-50/50' : 'w-full bg-white'}`}>
              <TeamsAgentChat 
                currentSection={active}
                onOpenToolPanel={handleSetActive}
                renderTool={(toolId) => {
                  switch (toolId) {
                                        case 'incert_delete': return <IncertDelete />;
                    case 'import_cet_xml': return <div className="w-full h-full overflow-y-auto"><ImportCETXml moduleName="LESRO" /></div>;
                    case 'exportCETcsv': return <XMLResultsLESRO />;
                    case 'compareCET': return <CETComparator />;
                    case 'report': return <Report />;
                    case 'graphics': return <ViewportGraphics />;
                    case 'AI_reporter': return <Responce_ai />;
                    default: return null;
                  }
                }}
              />
            </div>

            {/* Lado Derecho: Contenido Principal */}
            <div 
               className={`relative h-full flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex-shrink-0 bg-slate-50/50
               ${isToolsOpen ? 'w-[50%] opacity-100' : 'w-0 opacity-0'}`}
            >
                {/* Contenedor interno absoluto para evitar squish en animación */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col overflow-hidden min-w-[500px]">
                {/* ── BACKGROUND ORBS (Matching Chat) ── */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50/50">
                  <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[80px] orb-ring-1" />
                  <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-200/20 blur-[100px] orb-ring-2" />
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay" />
                </div>

                  
                  {/* Toolbar Superior */}
                  <div className="hidden md:block absolute top-3 right-4 z-[90]">
                    <button 
                      onClick={() => setIsToolsOpen(false)}
                      className="flex items-center justify-center p-1.5 rounded-full shadow-sm border bg-white border-slate-200 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                      title="Cerrar panel"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex-1 w-full relative overflow-y-auto">
                    <div className="p-2 w-full h-full">
                      {renderContent()}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}