'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient.js';
import { X, AlertCircle } from 'lucide-react';
import CriticalExcelModal from '../../components/CriticalExcelModal.jsx';

import MenuLateral from './components/menuLateral.jsx';
import AIReporting from './components/presentation_excel.jsx';
import IncertData from './components/IncertDataExcel/Incert_data_excel.jsx';
import XMLResultsGeneral from './components/XML_Results_General.jsx';
import CETComparator from './components/CET_Comparator.jsx';
import CSVFinalResultsGeneral from './components/CSV_Final_Results_General.jsx';


import ExitPipelineModal from '../Actualizer_XML_General/components/ExitPipelineModal.jsx';
import { purgeTenantData, purgeTenantDataBeacon } from '../Actualizer_XML_General/components/comparePDF/IncertData/components/delete_data';

export default function ExcelActualizer() {
  const [active, setActive] = useState('reporting');
  const [collapsed, setCollapsed] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitActionType, setExitActionType] = useState('exit');
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const router = useRouter();

  /* 🔒 PROTECCIÓN DE RUTA DEL MÓDULO (Temporalmente comentada para desarrollo local)
  useEffect(() => {
    const checkDelegation = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/xml-pipeline';
          return;
        }
        
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'https://servex-ai-back.onrender.com';
        const res = await fetch(`${apiURL}/api/v1/General_Procces`);
        const responseData = await res.json();
        
        if (responseData.status === 'error' || !res.ok) {
          console.warn('Delegation check returned an error, bypassing redirect:', responseData);
          return;
        }

        if (!responseData.locked || (responseData.data && responseData.data.user_id !== user.id)) {
          window.location.href = '/xml-pipeline';
        }
      } catch (err) {
        console.error('Delegation check failed', err);
      }
    };
    checkDelegation();
  }, []);
  */

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

  // Interceptar recarga (F5, Ctrl+R, Command+R) con captura prioritaria
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isReload =
        e.key === 'F5' ||
        e.key === 'Refresh' ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R' || e.code === 'KeyR' || e.keyCode === 82));

      if (isReload) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setExitActionType('reload');
        setShowExitModal(true);
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);

  // Purga garantizada en unload/pagehide SIN activar NUNCA el modal gris de Google Chrome
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (typeof window !== 'undefined' && window.__BYPASS_BEFOREUNLOAD__) {
        return;
      }
      // NUNCA asignar e.returnValue ni e.preventDefault() para que NUNCA aparezca el diálogo nativo de Google
      purgeTenantDataBeacon('General_Procces');
    };

    const handlePageHide = () => {
      if (typeof window !== 'undefined' && window.__BYPASS_BEFOREUNLOAD__) {
        return;
      }
      purgeTenantDataBeacon('General_Procces');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  // Bloqueo estricto del botón ATRÁS (←) del navegador e intercepción con Modal Personalizado
  useEffect(() => {
    // Insertamos estado centinela en el historial para interceptar retrocesos
    window.history.pushState({ isPipelineGuard: true }, '', window.location.href);

    const handlePopState = () => {
      if (typeof window !== 'undefined' && window.__BYPASS_BEFOREUNLOAD__) {
        return;
      }

      // Bloquear retroceso inmediato re-insertando la URL
      window.history.pushState({ isPipelineGuard: true }, '', window.location.href);

      // Desplegar nuestro modal idéntico a deleteData
      setExitActionType('exit');
      setShowExitModal(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
    
  const renderContent = () => {
    switch (active) {
      case 'reporting': return <AIReporting />;
      case 'incert_delete': return <IncertData moduleName="General_Procces" />;
      case 'xml_results': return <XMLResultsGeneral />;
      case 'cet_comparator': return <CETComparator />;
      case 'csv_final': return <CSVFinalResultsGeneral />;

      default:
        return <div className="p-6 text-gray-500">View under construction</div>;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-white font-sans flex flex-col m-0 p-0 min-h-0 relative">
      <CriticalExcelModal xmlRoute="/xml-pipeline/Actualizer_XML_General" />

      <ExitPipelineModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        exitType={exitActionType}
        currentTenant="General_Procces"
      />

      <main className="w-full h-full p-0 m-0 flex relative overflow-hidden flex-1 min-h-0">
        <MenuLateral
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        {/* CONTENEDOR SPLIT */}
        <div className="flex flex-1 h-full w-full min-w-0 p-2 gap-2 bg-slate-50">
          
          {/* Lado Izquierdo: Contenido Principal */}
          <div className={`relative group transition-all duration-300 ease-in-out h-full w-full`}>
            <div className="absolute -inset-1 blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 w-full h-full overflow-hidden flex flex-col">
              
              

              <div className="flex-1 w-full relative overflow-y-auto">
                <div className="p-1 w-full h-full">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>

          
          
        </div>
      </main>
    </div>
  );
}
