'use client';

import { useState } from 'react';
import MenuLateral from './components/menuLateral';

import Dashboard from './components/dashboard';
import PriceProduct from './components/priceProduct';
import CatalogParser from './components/PDFsection';
// 👇 Importamos el nuevo componente
import Csvs from './components/comparePDF/csvs'; 

export default function MenuInicial() {
  // 👇 Vista inicial
  const [active, setActive] = useState('kanban');
  const [collapsed, setCollapsed] = useState(false);

  const renderContent = () => {
    switch (active) {
      case 'dashboard':
        return <Dashboard />;

      case 'kanban':
        return <PriceProduct />;

      case 'Tasks': // 👈 CHANGE TRACKER
        return <CatalogParser />;

      case 'inbox': // 👈 Sync Preview
        return <Csvs />;

      default:
        return (
          <div className="p-6 text-gray-500">
            Vista en construcción
          </div>
        );
    }
  };

  return (
    /* Contenedor padre — sin scroll global */
    <div className="h-screen w-full bg-[#fff] font-sans  flex items-center justify-center">

      {/* MAIN ocupa el 95% de la altura */}
      <main className="w-full h-[95vh] p-0 flex">

        {/* MENÚ LATERAL (no scrollea) */}
        <MenuLateral
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* CONTENEDOR DEL CONTENIDO */}
        <div className="relative group flex-1 h-full">

          {/* Glow decorativo (igual que PanelPage) */}
          <div className="absolute -inset-1 blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>

          {/* PANEL BLANCO — AQUÍ vive el scroll */}
          <div className="relative bg-white border-y md:border border-slate-200 md:rounded-2xl shadow-xl shadow-slate-200/50 w-full h-full overflow-y-auto">

            {/* Padding interno */}
            <div className="p-1 w-full h-full">
              {renderContent()}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}  