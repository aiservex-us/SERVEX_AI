'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  SearchCode,
  Headphones,
  Settings,
  ChevronLeft,
  FileDiff,
  KanbanSquare,
  Inbox,
  FileCode,
  FileSpreadsheet,
  UploadCloud,
  BrainCircuit,
  CheckCircle2
} from 'lucide-react';

const menuItems = [
  { id: 'reporting', label: 'WBA Home', icon: LayoutDashboard, sub: 'Dashboard' },
    { id: 'incert_delete', label: 'Import Base excel & XML', icon: UploadCloud , sub: 'Ingestion' },
    { id: 'report', label: 'List Price Changes', icon: BrainCircuit, sub: 'Execution' },
  { id: 'inbox', label: 'cataloge base', icon:   FileCode, sub: 'Intelligence' },
  { id: 'kanban', label: 'XML base', icon: FileSpreadsheet, sub: 'Data' },
  { id: 'inbox_updated', label: 'Current Catalog', icon:  FileCode, sub: 'Data' },
  { id: 'dashboard', label: 'XML Results', icon: FileSpreadsheet, sub: 'Data' },
  { id: 'AI_reporter', label: 'AI Resumen', icon: CheckCircle2, sub: 'Output' },
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
    <>
      {/* BOTÓN FLOTANTE ÚNICAMENTE PARA MÓVILES (< 768px) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          md:hidden fixed top-5 w-7 h-7 bg-white border border-slate-200/80 rounded-full 
          flex items-center justify-center shadow-md z-50 text-slate-500 hover:text-[#464775]
          transition-all duration-300 ease-in-out
          ${collapsed ? 'left-4' : 'left-[244px]'}
        `}
      >
        <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* OVERLAY DE FONDO EN MÓVIL (Se activa si el menú se despliega en pantalla chica) */}
      {!collapsed && (
        <div 
          onClick={() => setCollapsed(true)} 
          className="md:hidden fixed inset-0 bg-slate-900/10 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      <aside
        className={`
          shrink-0 bg-white
          border-r border-slate-100/80
          flex flex-col
          transition-all duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          
          /* Lógica Responsiva de Comportamiento Fijo/Oculto */
          fixed top-0 bottom-0 left-0 z-40 h-full
          md:sticky md:h-full
          
          ${collapsed 
            ? 'w-0 -translate-x-full opacity-0 md:w-[70px] md:translate-x-0 md:opacity-100' 
            : 'w-[230px] translate-x-0 opacity-100'
          }
        `}
      >
        {/* HEADER: LOGO & TOGGLE */}
        <div className="h-20 flex items-center px-4 shrink-0 relative">
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <Link href="/panel" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm shrink-0 group hover:border-[#464775]/30 transition-colors cursor-pointer">
              <img
                src="/logosEmpresas/WB.webp"
                alt="Logo"
                className={`object-contain transition-all duration-300 ${collapsed ? 'w-5 h-5' : 'w-7 h-7'}`}
              />
            </Link>
            
            <div className={`
              overflow-hidden transition-all duration-[400ms]
              ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}
            `}>
              <span className="font-black text-[15px] tracking-tight text-[#464775] whitespace-nowrap uppercase">
                DATA WBA
              </span>
            </div>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex absolute -right-3 top-5 w-6 h-6 bg-white border border-slate-100 rounded-full items-center justify-center shadow-sm hover:shadow-md transition-all z-50 text-slate-400 hover:text-[#464775]"
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
                onClick={() => {
                  if (item.id === 'incert_delete' && typeof window !== 'undefined' && window.innerWidth < 400) {
                    alert("This feature is only available on desktop.");
                    return;
                  }
                  setActive(item.id);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setCollapsed(true);
                  }
                }}
                className={`
                  group relative flex flex-col transition-all duration-300 w-full rounded-xl border
                  ${collapsed ? 'items-center justify-center py-3' : 'p-3'}
                  ${isActive 
                    ? 'bg-[#464775]/5 border-[#464775]/30 shadow-sm' 
                    : 'bg-white border-slate-100 shadow-sm hover:border-slate-200 hover:bg-slate-50/30'}
                  ${item.id === 'incert_delete' ? 'max-[400px]:opacity-60 max-[400px]:bg-slate-50' : ''}
                `}
              >
                <div className={`flex items-center w-full ${collapsed ? 'justify-center' : 'gap-3'}`}>
                  <div className={`${isActive ? 'text-[#464775]' : 'text-slate-400'} transition-all duration-300`}>
                    <Icon size={collapsed ? 15 : 17} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  
                  {!collapsed && (
                    <div className="flex flex-col items-start overflow-hidden text-left w-full">
                      <span className={`text-[9px] uppercase tracking-wider leading-none ${isActive ? 'text-[#464775] font-bold' : 'text-slate-700 font-semibold'}`}>
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] text-slate-400 font-medium uppercase tracking-tighter">
                          {item.sub}
                        </span>
                        {item.id === 'incert_delete' && (
                          <span className="min-[400px]:hidden text-[8px] text-red-500/80 font-bold uppercase tracking-tighter bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">
                            Desktop Only
                          </span>
                        )}
                      </div>
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
                  <span className="text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">{item.label}</span>
                </div>
              </button>
            );
          })}

          {/* TARJETA Servex Copilot */}
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
                  Servex Copilot
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
    </>
  );
}