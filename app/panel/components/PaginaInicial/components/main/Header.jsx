'use client';
import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-4 md:px-8 shrink-0">
      
      {/* SEARCH BAR - Ajustada para ser flexible en móviles */}
      <div className="relative w-full max-w-[180px] sm:max-w-xs md:max-w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full bg-slate-100/50 rounded-md py-2 pl-10 pr-4 text-sm border border-transparent focus:bg-white focus:border-[#6264A7]/30 outline-none transition-all"
        />
      </div>
      
      <div className="flex items-center gap-2 sm:gap-5">
        {/* Notificación siempre visible */}
        <div className="p-2 hover:bg-slate-100 rounded-full cursor-pointer text-slate-500 relative transition-colors">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </div>

        {/* ESTA SECCIÓN SE OCULTA POR DEBAJO DE 800PX 
          Utilizamos min-[800px] para que solo se muestre cuando la pantalla sea mayor a 800px
        */}
        <div className="hidden min-[800px]:flex items-center gap-3">
          <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
          
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="text-right">
              <p className="font-bold text-[13px] text-slate-800 leading-none">John Doe</p>
              <p className="text-[11px] text-[#6264A7] font-medium">Administrator</p>
            </div>
            
            <div className="relative">
              <img 
                src="https://i.pravatar.cc/150?u=john" 
                alt="Profile" 
                className="w-9 h-9 rounded-full border border-slate-200 object-cover" 
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>

        {/* Avatar simplificado para móviles (Opcional: Solo si quieres que se vea algo del perfil en móvil) */}
        <div className="min-[800px]:hidden ml-2">
           <img src="https://i.pravatar.cc/150?u=john" alt="Profile" className="w-8 h-8 rounded-full border border-slate-200" />
        </div>

      </div>
    </header>
  );
}