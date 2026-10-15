'use client';

import React, { useState } from 'react';
import Sidebar from './components/main/loogout';
import Products from './components/main/AccesAgent';

const InitPage = () => {
  const [activeView, setActiveView] = useState('products');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-[#FFF] font-sans overflow-hidden text-slate-700 relative min-h-0">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        active={activeView}
        setActive={setActiveView}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN UNIFIED CHAT VIEW */}
      <main className="flex-1 h-full flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 h-full w-full min-h-0 flex flex-col max-[700px]:pb-[60px] overflow-hidden">
          <Products />
        </div>
      </main>
    </div>
  );
};

export default InitPage;