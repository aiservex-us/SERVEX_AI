'use client';
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  BarChart3,
  Bell,
  Mail,
  Inbox,
  KanbanSquare,
  ListChecks,
  BookOpen,
  Headphones,
  Settings,
  ChevronLeft,
  X
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'reporting', label: 'Reporting', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'mail', label: 'Mail', icon: Mail },
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'kanban', label: 'Kanban', icon: KanbanSquare },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
];

export default function MenuLateral({
  active,
  setActive,
  collapsed,
  setCollapsed
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Lógica de filtrado
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
        ${collapsed ? 'w-[68px]' : 'w-[250px]'}
      `}
    >
      {/* HEADER: LOGO & TOGGLE */}
      <div className="h-16 flex items-center px-4 shrink-0 relative">
        <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm shrink-0 group hover:border-[#6264A7]/30 transition-colors">
            <img
              src="/logosEmpresas/lesro.png"
              alt="Logo"
              className="w-5 h-5 object-contain group-hover:scale-110 transition-transform"
            />
          </div>
          
          <div className={`
            overflow-hidden transition-all duration-[400ms]
            ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}
          `}>
            <span className="font-bold text-[13px] tracking-tight text-slate-800 whitespace-nowrap">
              DATA LESRO
            </span>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-5 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-50 text-slate-400 hover:text-[#6264A7]"
        >
          <ChevronLeft className={`w-3 h-3 transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* SEARCH BAR SECTION */}
      <div className="px-3 mb-4">
        <div className={`
          relative flex items-center transition-all duration-300
          ${collapsed ? 'justify-center h-10' : 'h-9 bg-slate-50/50 border border-slate-100 rounded-lg px-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#6264A7]/10 focus-within:border-[#6264A7]/30'}
        `}>
          <Search className={`shrink-0 transition-colors ${searchQuery ? 'text-[#6264A7]' : 'text-slate-400'} ${collapsed ? 'w-5 h-5' : 'w-3.5 h-3.5'}`} />
          
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`
              bg-transparent border-none focus:ring-0 text-[12px] w-full ml-2 placeholder:text-slate-400 text-slate-700
              transition-all duration-300
              ${collapsed ? 'w-0 opacity-0 p-0' : 'opacity-100'}
            `}
          />

          {!collapsed && searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-200/50 rounded-full transition-colors">
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}

          {/* Tooltip en colapsado */}
          {collapsed && (
            <div className="absolute inset-0 cursor-pointer" onClick={() => setCollapsed(false)} />
          )}
        </div>
      </div>

      {/* MENU PRINCIPAL */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const isSearching = searchQuery.length > 0;
          
          // Efecto de resaltado si coincide con la búsqueda
          const isMatch = isSearching && item.label.toLowerCase().includes(searchQuery.toLowerCase());

          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`
                group relative w-full flex items-center rounded-lg transition-all duration-300
                ${collapsed ? 'justify-center h-11' : 'px-3 py-2'}
                ${isActive 
                  ? 'bg-[#6264A7]/5 text-[#6264A7]' 
                  : isMatch 
                    ? 'bg-slate-50 text-slate-900 shadow-[0_0_10px_rgba(98,100,167,0.1)] scale-[1.02]' 
                    : 'text-slate-500 hover:bg-slate-50/80 hover:text-slate-900'}
              `}
            >
              {/* Teams Indicator */}
              <div className={`
                absolute left-0 w-[2.5px] bg-[#6264A7] rounded-r-full transition-all duration-300
                ${isActive ? 'h-5 opacity-100' : 'h-0 opacity-0'}
              `} />
              
              <Icon className={`
                w-[17px] h-[17px] shrink-0 transition-all duration-300
                ${isActive ? 'scale-110 stroke-[2.5px]' : 'group-hover:scale-110'}
                ${isMatch ? 'text-[#6264A7] drop-shadow-[0_0_3px_rgba(98,100,167,0.4)]' : ''}
              `} />
              
              <div className={`
                overflow-hidden transition-all duration-[400ms] flex items-center
                ${collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}
              `}>
                <span className={`text-[12px] whitespace-nowrap transition-all ${isActive || isMatch ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </div>

              {/* Tooltip para modo colapsado */}
              {collapsed && (
                <div className="absolute left-14 px-2 py-1.5 bg-slate-900 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="py-10 text-center animate-in fade-in zoom-in-95 duration-300">
            <p className="text-[11px] text-slate-400">No results found</p>
          </div>
        )}
      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-slate-50 bg-white/50">
        {[
          { label: 'Support', icon: Headphones },
          { label: 'Settings', icon: Settings },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`
                w-full flex items-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200
                ${collapsed ? 'justify-center h-10' : 'px-3 py-2'}
              `}
            >
              <Icon className="w-[16px] h-[16px] shrink-0" />
              <div className={`
                overflow-hidden transition-all duration-[400ms]
                ${collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}
              `}>
                <span className="text-[11px] font-medium whitespace-nowrap">{item.label}</span>
              </div>
            </button>
          );
        })}

        {/* PROFILE PROFILE */}
        <div className={`
          mt-3 flex items-center rounded-xl transition-all duration-300
          ${collapsed ? 'justify-center' : 'p-2 bg-slate-50/50 border border-slate-100/50'}
        `}>
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6264A7] to-[#8b8dc9] flex items-center justify-center text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
              AT
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div className={`
            overflow-hidden transition-all duration-[400ms]
            ${collapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[200px] opacity-100 ml-3'}
          `}>
            <div className="flex flex-col leading-tight">
              <p className="text-[12px] font-bold text-slate-700 truncate">Anna Taylor</p>
              <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">Pro Account</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}