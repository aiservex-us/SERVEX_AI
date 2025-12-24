'use client';

import { useState } from 'react';
import MenuLateral from './components/menuLateral';

import Dashboard from './components/dashboard';
import PriceProduct from './components/priceProduct';

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

      default:
        return (
          <div className="p-6 text-gray-500">
            Vista en construcción
          </div>
        );
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-gray-100">

      {/* MENÚ LATERAL */}
      <MenuLateral
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 overflow-hidden">
        
        {/* CONTENEDOR ESTÁNDAR (como el ejemplo) */}
        <div className="relative bg-white border-y md:border border-slate-200 md:rounded-2xl shadow-xl shadow-slate-200/50 w-full h-full overflow-y-auto">
          
          <div className="p-1 w-full h-full">
            {renderContent()}
          </div>

        </div>

      </main>
    </div>
  );
}
