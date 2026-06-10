'use client';
import React, { useState } from 'react';
import {
  LayoutDashboard,
  SearchCode,
  BarChart3,
  Inbox,
  KanbanSquare,
  ListChecks,
  Headphones,
  Settings,
  ChevronLeft,
  X,
  LayoutTemplate,
  FileDiff
} from 'lucide-react';

const menuItems = [
  { id: 'reporting', label: 'WBS HOME', icon: LayoutDashboard, sub: 'Analysis' },
  { id: 'notifications', label: 'Change Tracker', icon: FileDiff, sub: 'Logs' },
  { id: 'inbox', label: 'Excel Preview', icon: Inbox, sub: 'Visualization' },
  { id: 'kanban', label: 'XML Pre Prosses', icon: KanbanSquare, sub: 'Structure' },
  { id: 'dashboard', label: 'XML Post Prosses', icon:  KanbanSquare, sub: 'Statistics' },
  { id: 'AI_reporter', label: 'AI Reporte', icon:  KanbanSquare, sub: 'Statistics' },
];

export default function MenuLateral({
  active,
  setActive,
  collapsed,
  setCollapsed
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`
        h-full shrink-0 bg-white
        border-r border-slate-100/80
        flex flex-col
        transition-all duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)]
        ${collapsed ? 'w-[70px]' : 'w-[230px]'}
      `}
    >
      {/* HEADER: LOGO & TOGGLE */}
      <div className="h-16 flex items-center px-4 shrink-0 relative">
        <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm shrink-0 group hover:border-[#464775]/30 transition-colors">
            <img
              src="/logosEmpresas/WB.webp"
              alt="Logo"
              className={`object-contain transition-all duration-300 ${collapsed ? 'w-4 h-4' : 'w-5 h-5'}`}
            />
          </div>
          
          <div className={`
            overflow-hidden transition-all duration-[400ms]
            ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}
          `}>
            <span className="font-bold text-[12px] tracking-tight text-slate-800 whitespace-nowrap uppercase">
              DATA LESRO
            </span>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-5 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-50 text-slate-400 hover:text-[#464775]"
        >
          <ChevronLeft className={`w-3 h-3 transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* SEARCH BAR SECTION */}
      <div className="px-3 mb-4">
        <div className={`
          relative flex items-center transition-all duration-300
          ${collapsed ? 'justify-center h-10' : 'h-8 bg-slate-50/50 border border-slate-100 rounded-lg px-2'}
        `}>
          <SearchCode className={`shrink-0 transition-colors ${searchQuery ? 'text-[#464775]' : 'text-slate-400'} ${collapsed ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
          
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`
              bg-transparent border-none focus:ring-0 text-[11px] w-full ml-2 placeholder:text-slate-400 text-slate-700
              transition-all duration-300
              ${collapsed ? 'w-0 opacity-0 p-0' : 'opacity-100'}
            `}
          />
        </div>
      </div>

      {/* MENU PRINCIPAL REPARTIDO CON ESTILO CARD */}
      <nav className="flex-1 px-3 space-y-2.5 overflow-y-auto custom-scrollbar flex flex-col">
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`
                group relative flex flex-col transition-all duration-300 w-full rounded-xl border
                ${collapsed ? 'items-center justify-center py-3' : 'p-3'}
                ${isActive 
                  ? 'bg-[#464775]/5 border-[#464775]/30 shadow-sm' 
                  : 'bg-white border-slate-100 shadow-sm hover:border-slate-200 hover:bg-slate-50/30'}
              `}
            >
              <div className={`flex items-center w-full ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <div className={`${isActive ? 'text-[#464775]' : 'text-slate-400'} transition-all duration-300`}>
                  {/* ICONO REDUCIDO: 15px colapsado, 17px abierto */}
                  <Icon size={collapsed ? 15 : 17} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                {!collapsed && (
                  <div className="flex flex-col items-start overflow-hidden text-left">
                    <span className={`text-[10px] uppercase tracking-wider leading-none ${isActive ? 'text-[#464775] font-bold' : 'text-slate-700 font-semibold'}`}>
                      {item.label}
                    </span>
                    <span className="text-[8px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">
                      {item.sub}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-slate-50 bg-white/50 space-y-2">
        {[
          { label: 'Support', icon: Headphones },
          { label: 'Settings', icon: Settings },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`
                w-full flex items-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-[#464775] transition-all duration-200
                ${collapsed ? 'justify-center h-10' : 'px-3 py-2'}
              `}
            >
              <Icon size={collapsed ? 14 : 16} className="shrink-0" />
              <div className={`
                overflow-hidden transition-all duration-[400ms]
                ${collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}
              `}>
                <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{item.label}</span>
              </div>
            </button>
          );
        })}

        {/* TARJETA SVX COPILOT */}
        <div className={`
          mt-2 flex items-center rounded-xl transition-all duration-300
          ${collapsed ? 'justify-center h-10' : 'p-2 bg-[#464775] text-white shadow-lg shadow-[#464775]/20'}
        `}>
          <div className="relative shrink-0">
            <div className={`rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-300 ${collapsed ? 'w-6 h-6 p-1' : 'w-7 h-7 p-1.5'}`}>
              <img
                src="/logo2.png" 
                alt="Svx"
                className="w-full h-full object-contain brightness-200"
              />
            </div>
          </div>
          
          <div className={`
            overflow-hidden transition-all duration-[400ms]
            ${collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}
          `}>
            <div className="flex flex-col leading-tight text-white">
              <p className="text-[10px] font-black tracking-tight uppercase">
                Svx Copilot
              </p>
              <p className="text-[7.5px] opacity-70 font-medium whitespace-nowrap">
                Next-gen Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* LEYENDA GLYNNE */}
        <div className={`
          transition-all duration-[400ms] overflow-hidden pt-1
          ${collapsed ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'}
        `}>
          <p className="text-[7px] text-slate-400 leading-tight tracking-tight px-1 uppercase font-medium">
            © 2025 GLYNNE S.A.S
          </p>
        </div>
      </div>
    </aside>
  );
}