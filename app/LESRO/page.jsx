'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient'; 
import { X, AlertCircle } from 'lucide-react';

import MenuLateral from './components/menuLateral';
import Dashboard from './components/dashboard';
import PriceProduct from './components/priceProduct';
import CatalogParser from './components/PDFsection';
import Csvs from './components/comparePDF/csvs'; 
import PrecentMain from './components/PrecentMain';
import UploadFileCmpare from './components/comparePDF/EJECUTOR'; 
import AIReporting from './components/comparePDF/presentation_LESRO'
import Compare from './components/comparePDF/UploadFileCmpare'

export default function MenuInicial() {
  const [active, setActive] = useState('reporting');
  const [collapsed, setCollapsed] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Definimos la empresa objetivo para filtrar en los componentes hijos
  const COMPANY_FILTER = "LESRO"; 

  const router = useRouter();

  // Protección de ruta habilitada para asegurar la sesión
{/*
  // 🔒 ROUTE PROTECTION (SAME LOGIC AS PanelPage)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.replace('/login');
      }
    }); 
  }, [router]); */}

  // Lógica de detección de intento de salida
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);

    const handlePopState = () => {
      window.history.pushState(null, null, window.location.pathname);
      setShowExitModal(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleConfirmExit = () => {
    setShowExitModal(false);
    router.push('/panel'); 
  };

  // Renderizado inyectando la propiedad companyName a los componentes que la necesiten
  const renderContent = () => {
    switch (active) {
      case 'dashboard': 
        return <Dashboard companyName={COMPANY_FILTER} />;
      case 'kanban': 
        return <PriceProduct companyName={COMPANY_FILTER} />;
      case 'Tasks': 
        return <CatalogParser companyName={COMPANY_FILTER} />;
      case 'inbox': 
        return <Csvs companyName={COMPANY_FILTER} />;
      case 'presentation': 
        return <PrecentMain companyName={COMPANY_FILTER} />;
      case 'notifications': 
        return <UploadFileCmpare companyName={COMPANY_FILTER} />; 
      case 'reporting': 
        return <AIReporting companyName={COMPANY_FILTER} />; 
      case 'compare': 
        return <Compare companyName={COMPANY_FILTER} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            View under construction
          </div>
        );
    }
  };

  return (
    <div className="h-[97vh] w-[99%] bg-white font-sans flex items-center justify-center relative">

      {/* MODAL DE CONFIRMACIÓN (ESTILO TEAMS) */}
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
                  You are about to leave the {COMPANY_FILTER} management area. Any temporary changes in this view will be closed.
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

      <main className="w-full h-[95vh] p-0 flex">
        <MenuLateral
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div className="relative group flex-1 h-full">
          <div className="absolute -inset-1 blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className="relative bg-white border-y md:border border-slate-200 md:rounded-2xl shadow-xl shadow-slate-200/50 w-full h-full overflow-y-auto">
            <div className="p-1 w-full h-full">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}