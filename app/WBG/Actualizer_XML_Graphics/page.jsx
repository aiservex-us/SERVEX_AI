'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient.js';
import { X, AlertCircle , Sparkles} from 'lucide-react';
import TeamsAgentChat from './components/comparePDF/REPORT/components/AI_contact.jsx';

import MenuLateral from './components/menuLateral.jsx';
import Dashboard from './components/perceo_XML_MASTER_post_prcess.jsx';
import PriceProduct from './components/perceo_XML_MASTER_pre_prosses.jsx';
import CatalogParser from './components/PDFsection.jsx';
import Csvs from './components/comparePDF/csvs.jsx';
import Csvs_updated from './components/comparePDF/csvs_updated.jsx';
import PrecentMain from './components/PrecentMain.jsx';
import UploadFileCmpare from './components/comparePDF/IncertData/components/EJECUTOR.jsx';
import AIReporting from './components/comparePDF/presentation_WBG.jsx'
import Compare from './components/comparePDF/UploadFileCmpare.jsx'
import Responce_ai from './components/comparePDF/REPORT_SUPABASE_AI.jsx'
import Report from './components/comparePDF/REPORT/dashboard.jsx';
import IncertDelete from './components/comparePDF/IncertData/Incert_data.jsx'

export default function MenuInicial() {
  const [active, setActive] = useState('reporting');
  const [collapsed, setCollapsed] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const router = useRouter();

  // 🔒 PROTECCIÓN DE RUTA DEL MÓDULO (Redirige si se borró el tenant o no hay delegación)
  useEffect(() => {
    const checkDelegation = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/WBG';
          return;
        }
        
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'https://servex-ai-back.onrender.com';
        const res = await fetch(`${apiURL}/api/v1/module_delegation/WBG`);
        const responseData = await res.json();
        
        if (!responseData.locked || (responseData.data && responseData.data.user_id !== user.id)) {
          window.location.href = '/WBG';
        }
      } catch (err) {
        console.error('Delegation check failed', err);
      }
    };
    checkDelegation();
  }, []);


  
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

  
  const [isAiMenuExpanded, setIsAiMenuExpanded] = useState(true);
  const showAiMenu = ['dashboard', 'kanban', 'inbox', 'inbox_updated', 'report', 'incert_delete'].includes(active);

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
      case 'kanban': return <PriceProduct />;
      case 'Tasks': return <CatalogParser />;
      case 'inbox': return <Csvs />;
      case 'inbox_updated': return <Csvs_updated />;
      case 'presentation': return <PrecentMain />;
      case 'report': return <Report />;
      case 'notifications': return <UploadFileCmpare />;
      case 'reporting': return <AIReporting />;
      case 'compare': return <Compare />;
      case 'AI_reporter': return <Responce_ai />;
      default:
        return <div className="p-6 text-gray-500">View under construction</div>;
    }
  };

  return (
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
        <MenuLateral
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        {/* CONTENEDOR SPLIT */}
        <div className="flex flex-1 h-full w-full min-w-0 p-2 gap-2 bg-slate-50">
          
          {/* Lado Izquierdo: Contenido Principal */}
          <div className={`relative group transition-all duration-300 ease-in-out h-full ${(showAiMenu && isAiMenuExpanded) ? 'w-[65%]' : 'w-full'}`}>
            <div className="absolute -inset-1 blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 w-full h-full overflow-hidden flex flex-col">
              
              {/* Toolbar Superior (Sólo visible si corresponde el menú IA) */}
              {showAiMenu && (
                <div className="absolute top-3 right-3 z-[90]">
                  <button 
                    onClick={() => setIsAiMenuExpanded(!isAiMenuExpanded)}
                    className={`flex items-center justify-center p-1.5 rounded-lg shadow-sm border transition-all ${isAiMenuExpanded ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    title={isAiMenuExpanded ? 'Ocultar Copilot' : 'Show Copilot'}
                  >
                    <Sparkles size={18} />
                  </button>
                </div>
              )}

              <div className="flex-1 w-full relative overflow-y-auto">
                <div className="p-1 w-full h-full">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Asistente IA (Menú Lateral Derecho) */}
          {(showAiMenu && isAiMenuExpanded) && (
            <div className="relative w-[35%] h-full bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col animate-in slide-in-from-right-8 duration-300">
              <TeamsAgentChat currentSection={active} />
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
}