'use client';
import { useState } from 'react';
import MenuLateral from './components/menuLateral';

import Dashboard from './components/dashboard';
import PriceProduct from './components/priceProduct';

export default function MenuInicial() {
  // 👇 AHORA KANBAN ES LA VISTA INICIAL
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
    <div className="flex h-[100%] w-full overflow-hidden bg-gray-100">
      <MenuLateral
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className="flex-1 bg-[#F5F5F5] overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}
