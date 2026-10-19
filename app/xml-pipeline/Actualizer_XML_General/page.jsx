'use client';
import XMLResultsGeneral from '../Actualizer_Excel_General/components/XML_Results_General.jsx';
import ImportCETXml from '../Actualizer_Excel_General/components/IncertDataExcel/incertXML_excel';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentUser } from '../../lib/supabaseClient.js';
import { X, AlertCircle, Sparkles, Settings, RotateCcw, LogOut } from 'lucide-react';
import TeamsAgentChat from './components/comparePDF/REPORT/components/AI_contact.jsx';
import AnimatedChatBackground from './components/AnimatedChatBackground.jsx';

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
import DeleteData, { purgeTenantData, purgeTenantDataBeacon } from './components/comparePDF/IncertData/components/delete_data';
import CETComparator from '../Actualizer_Excel_General/components/CET_Comparator.jsx';
import ExitPipelineModal from './components/ExitPipelineModal.jsx';

export default function MenuInicial() {
  const [active, setActive] = useState('reporting');
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitActionType, setExitActionType] = useState('exit'); // 'exit' | 'reload' | 'signout'
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const isDarkMode = true;
  const router = useRouter();

  /* 🔒 PROTECCIÓN DE RUTA DE XML PIPELINE (Temporalmente comentada para desarrollo local)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

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
  */

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

  // Al montar/recargar el componente, asegurar que la tabla ClientsSERVEX_General_Procces esté limpia y virgen
  useEffect(() => {
    purgeTenantData('General_Procces').catch(() => {});
  }, []);

  // Interceptar combinaciones de recarga de página (F5, Ctrl+R, Command+R) con captura prioritaria
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isReload =
        e.key === 'F5' ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'));

      if (isReload) {
        e.preventDefault();
        e.stopPropagation();
        setExitActionType('reload');
        setShowExitModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  // Purga garantizada en unload/pagehide SIN activar el modal por defecto de Google Chrome
  useEffect(() => {
    const handleBeforeUnload = () => {
      // IMPORTANTE: NO asignar e.returnValue ni e.preventDefault() para evitar el diálogo gris nativo de Google Chrome
      purgeTenantDataBeacon('General_Procces');
    };

    const handlePageHide = () => {
      purgeTenantDataBeacon('General_Procces');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  // Interceptar navegación por historial del navegador (atrás/adelante)
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);

    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
      setExitActionType('exit');
      setShowExitModal(true);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Evento global para disparar la salida/recarga desde otros componentes
  useEffect(() => {
    const handleTriggerExit = (e) => {
      const action = e.detail?.action || 'exit';
      setExitActionType(action);
      setShowExitModal(true);
    };
    window.addEventListener('triggerPipelineExit', handleTriggerExit);
    return () => window.removeEventListener('triggerPipelineExit', handleTriggerExit);
  }, []);


  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isIntroDismissed, setIsIntroDismissed] = useState(true);

  const handleSetActive = (id) => {
    setActive(id);
    setIsToolsOpen(true);
  };

  const handleSidebarSelect = (id) => {
    setActive(id);
    setIsToolsOpen(false);

    let botText = '';
    switch (id) {
      case 'xml_results':
        botText = 'Aquí tienes la tabla y matriz de exportación para clientes (**Export Data Client**):';
        break;
      case 'dashboard':
        botText = 'Aquí tienes los resultados de la estructura XML y Diff (**XML Results & Diff**):';
        break;
      case 'inbox_updated':
        botText = 'Aquí tienes el catálogo actual de productos y precios actualizados (**Current Catalog**):';
        break;
      case 'reporting':
        botText = 'Aquí tienes la visión general y arquitectura del proceso (**General Process Overview**):';
        break;
      default:
        botText = `Aquí tienes la sección solicitada (**${id}**):`;
        break;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('globalChatMessage', {
        detail: {
          from: 'bot',
          text: botText,
          toolId: id
        }
      }));
    }
  };

  const renderViewComponent = (id) => {
    switch (id) {
      case 'dashboard': return <Dashboard />;
      case 'incert_delete': return <IncertDelete step="xml" />;
      case 'incert_wbs_csv_base': return <IncertDelete step="csv_base" />;
      case 'incert_wbs_csv_new': return <IncertDelete step="csv_new" />;
      case 'xml_results':
      case 'exportCETcsv': return <XMLResultsGeneral />;
      case 'Tasks': return <CatalogParser />;
      case 'inbox_updated': return <Csvs_updated />;
      case 'presentation': return <PrecentMain />;
      case 'report': return <Report />;
      case 'notifications': return <UploadFileCmpare />;
      case 'reporting': return <AIReporting />;
      case 'graphics': return <ViewportGraphics />;
      case 'compare': return <Compare />;
      case 'compare_cet':
      case 'compareCET': return <CETComparator />;
      case 'AI_reporter': return <Responce_ai />;
      case 'import_cet_xml': return <div className="w-full h-full overflow-y-auto"><ImportCETXml moduleName="General_Procces" /></div>;
      case 'delete_data': return <div className="w-full max-w-sm mx-auto mt-4"><DeleteData /></div>;
      default:
        return <div className="p-6 text-gray-500">View under construction</div>;
    }
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

    return renderViewComponent(active);
  };

  /* 🔒 PANTALLA DE CARGA DE SESIÓN (Temporalmente comentada para desarrollo local)
  if (isLoadingAuth || !isAuthenticated) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white text-slate-400 select-none">
        <div className="w-8 h-8 border-2 border-[#18181b]/20 border-t-[#18181b] rounded-full animate-spin mb-3" />
        <span className="text-xs font-medium tracking-wide text-slate-500">Verifying session...</span>
      </div>
    );
  }
  */

  return (
    <div className={`w-full h-screen overflow-hidden ${isDarkMode ? 'bg-[#09090b]' : 'bg-white'} font-sans flex flex-col m-0 p-0 min-h-0 relative transition-colors duration-500`}>

      <ExitPipelineModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        exitType={exitActionType}
        currentTenant="General_Procces"
      />

      <main className="w-full h-full p-0 m-0 flex relative overflow-hidden flex-1 min-h-0">

        {/* --- FONDO ÓPTICO DINÁMICO ANIMADO CON BLUR Y ESTRÍAS EN TODO EL CANVAS --- */}
        <AnimatedChatBackground isDarkMode={isDarkMode} />

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
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#18181b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-slate-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

              {/* Izquierda: Logo */}
              <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <img
                  src="/alysa_lg.png"
                  alt="Logo"
                  className="w-48 md:w-64 lg:w-80 h-auto object-contain drop-shadow-2xl mb-4 md:mb-8 transition-transform duration-700 hover:scale-105"
                />
                <div className="text-center">
                  <h3 className="text-[#18181b] text-lg lg:text-xl font-extralight tracking-[0.25em]">
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
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181b]/5 border border-[#18181b]/10 w-fit mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#18181b] animate-pulse" />
                  <span className="text-[9px] font-bold tracking-widest text-[#18181b] uppercase">Powered by SVX</span>
                </div>

                <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-slate-800 tracking-tight mb-4 md:mb-5 leading-tight">
                  Weeks of work.<br />
                  <strong className="font-semibold text-[#18181b]">Done in seconds.</strong>
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
          setActive={handleSidebarSelect}
          onExit={() => {
            setExitActionType('exit');
            setShowExitModal(true);
          }}
          isDarkMode={isDarkMode}
        />
        {/* CONTENEDOR UNIFICADO */}
        <div className="flex flex-1 h-full w-full min-w-0 p-0 bg-transparent">
          <div className="flex flex-col w-full h-full bg-transparent overflow-hidden relative">
            {/* ── TOP BAR (FLOATING & TRANSPARENT OVER BACKGROUND, NO BOTTOM LINE) ── */}
            <header className="absolute top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-3 sm:px-6 bg-transparent border-none pointer-events-none w-full">
              <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
                <span className={`text-[10px] font-bold ${isDarkMode ? 'text-white bg-white/10 border-white/20' : 'text-[#18181b] bg-[#18181b]/10 border-[#18181b]/20'} border px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-md transition-colors`}>
                  Servex Copilot
                </span>

                {/* BOTÓN REINICIAR / RECARGAR PROCESO */}
                <button
                  type="button"
                  onClick={() => {
                    setExitActionType('reload');
                    setShowExitModal(true);
                  }}
                  title="Reiniciar proceso y purgar datos temporales en Supabase"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/30 hover:border-rose-500/50 backdrop-blur-md transition-all text-[11px] font-semibold shadow-sm group cursor-pointer"
                >
                  <RotateCcw size={12} className="group-hover:-rotate-90 transition-transform duration-300 text-rose-400" />
                  <span className="hidden sm:inline">Reiniciar Proceso</span>
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('openAiGuide'))}
                  title="AI Guide & Documentation"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all text-[11px] font-semibold shadow-sm group cursor-pointer"
                >
                  <Sparkles size={13} className="text-amber-300 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">AI Guide</span>
                </button>

                {/* BOTÓN SALIR AL PANEL */}
                <button
                  type="button"
                  onClick={() => {
                    setExitActionType('exit');
                    setShowExitModal(true);
                  }}
                  title="Salir al panel y descartar proceso"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-rose-500/20 text-zinc-300 hover:text-rose-200 border border-white/20 hover:border-rose-500/30 backdrop-blur-md transition-all text-[11px] font-semibold shadow-sm group cursor-pointer"
                >
                  <LogOut size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  <span className="hidden sm:inline">Salir</span>
                </button>

                {isToolsOpen && (
                  <button
                    onClick={() => setIsToolsOpen(false)}
                    className={`flex items-center justify-center p-1.5 rounded-full border ${isDarkMode ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-slate-200 text-slate-400 hover:text-black hover:bg-zinc-100'} backdrop-blur-md transition-all ml-1`}
                    title="Close panel"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </header>

            {/* Body Area (Full Viewport with Top Spacing for Floating Header) */}
            <div className="flex flex-1 w-full h-full min-h-0 relative z-10 overflow-hidden pt-12 sm:pt-14">
              {/* Lado Izquierdo: Asistente IA */}
              <div className={`
                h-full flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex-shrink-0 bg-transparent
                ${isToolsOpen
                  ? 'hidden md:flex md:w-[50%]'
                  : 'flex w-full'}
              `}>
                <TeamsAgentChat
                  currentSection={active}
                  onOpenToolPanel={handleSetActive}
                  isDarkMode={isDarkMode}
                  renderTool={(toolId) => renderViewComponent(toolId)}
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
