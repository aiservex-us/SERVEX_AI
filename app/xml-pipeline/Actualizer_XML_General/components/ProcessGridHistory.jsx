'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  LayoutGrid,
  Database,
  History,
  FileCode2,
  Calendar,
  Layers,
  Search,
  Filter,
  RefreshCw,
  FolderOpen,
  Sparkles,
  Clock,
  ArrowUpRight
} from 'lucide-react';

export default function ProcessGridHistory({ isDarkMode = true, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden select-none font-sans ${
        isDarkMode
          ? 'bg-[#09090b] text-zinc-100'
          : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* ── TOP HEADER / ACCIONES ── */}
      <header
        className={`h-14 shrink-0 px-4 flex items-center justify-between border-b backdrop-blur-xl ${
          isDarkMode
            ? 'bg-[#0c0c0e]/80 border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
            : 'bg-white/85 border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-white/5 hover:bg-white/15 text-zinc-300 border-white/15'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              <ArrowLeft size={13} />
              <span>Volver</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              <LayoutGrid size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold tracking-tight">
                  Grilla de Procesos & Catálogos
                </h1>
                <span
                  className={`text-[9.5px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${
                    isDarkMode
                      ? 'bg-white/10 text-white border-white/20'
                      : 'bg-zinc-100 text-zinc-900 border-zinc-300'
                  }`}
                >
                  Espacio Preparado
                </span>
              </div>
              <p
                className={`text-[10.5px] hidden sm:block ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                Historial centralizado de catálogos subidos por el usuario y procesos ejecutados
              </p>
            </div>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-md ${
              isDarkMode
                ? 'bg-white/5 border-white/10 text-zinc-300'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <Clock size={12} className="text-zinc-400" />
            <span className="text-[11px] font-mono">Registro Activo</span>
          </div>
        </div>
      </header>

      {/* ── BARRA DE BÚSQUEDA Y FILTROS ── */}
      <div
        className={`px-4 py-3 shrink-0 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDarkMode
            ? 'bg-[#09090b]/60 border-white/10'
            : 'bg-white/60 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-md">
          <div
            className={`w-full flex items-center gap-2 px-3 py-1.5 border text-xs rounded-md ${
              isDarkMode
                ? 'bg-white/5 border-white/10 text-white focus-within:border-white/30'
                : 'bg-white border-slate-200 text-slate-900 focus-within:border-slate-400 shadow-2xs'
            }`}
          >
            <Search size={13} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nombre de catálogo o ID de proceso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-xs placeholder:text-zinc-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 text-[11px] font-medium border rounded-md cursor-pointer transition-all ${
              activeTab === 'all'
                ? isDarkMode
                  ? 'bg-white text-zinc-950 font-bold border-white'
                  : 'bg-slate-900 text-white font-bold border-slate-900'
                : isDarkMode
                ? 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('catalogs')}
            className={`px-2.5 py-1 text-[11px] font-medium border rounded-md cursor-pointer transition-all ${
              activeTab === 'catalogs'
                ? isDarkMode
                  ? 'bg-white text-zinc-950 font-bold border-white'
                  : 'bg-slate-900 text-white font-bold border-slate-900'
                : isDarkMode
                ? 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Catálogos Subidos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('processes')}
            className={`px-2.5 py-1 text-[11px] font-medium border rounded-md cursor-pointer transition-all ${
              activeTab === 'processes'
                ? isDarkMode
                  ? 'bg-white text-zinc-950 font-bold border-white'
                  : 'bg-slate-900 text-white font-bold border-slate-900'
                : isDarkMode
                ? 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Procesos Ejecutados
          </button>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL: GRILLA Y CONTENEDOR DE HISTORIAL ── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Métricas / Resumen rápido */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              className={`p-4 border rounded-xl transition-all ${
                isDarkMode
                  ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>
                  Catálogos Subidos
                </span>
                <FolderOpen size={14} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
              </div>
              <div className="text-xl font-bold tracking-tight">0</div>
              <div
                className={`text-[10.5px] mt-1 ${
                  isDarkMode ? 'text-zinc-500' : 'text-slate-400'
                }`}
              >
                Archivos ingeridos y registrados
              </div>
            </div>

            <div
              className={`p-4 border rounded-xl transition-all ${
                isDarkMode
                  ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>
                  Procesos Realizados
                </span>
                <Layers size={14} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
              </div>
              <div className="text-xl font-bold tracking-tight">0</div>
              <div
                className={`text-[10.5px] mt-1 ${
                  isDarkMode ? 'text-zinc-500' : 'text-slate-400'
                }`}
              >
                Actualizaciones y transformaciones
              </div>
            </div>

            <div
              className={`p-4 border rounded-xl transition-all ${
                isDarkMode
                  ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'}>
                  Estado de la Grilla
                </span>
                <Database size={14} className={isDarkMode ? 'text-zinc-400' : 'text-slate-500'} />
              </div>
              <div className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-950'}`}>Listo</div>
              <div
                className={`text-[10.5px] mt-1 ${
                  isDarkMode ? 'text-zinc-500' : 'text-slate-400'
                }`}
              >
                Estructura base preparada para persistencia
              </div>
            </div>
          </div>

          {/* Tarjeta de Grilla Principal (Placeholder estilizado Servex) */}
          <div
            className={`border rounded-xl overflow-hidden ${
              isDarkMode
                ? 'bg-[#0c0c0e]/70 border-white/10'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${
                isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <History size={14} className="text-zinc-400" />
                <h2 className="text-xs font-semibold tracking-wide uppercase">
                  Registro de Versiones y Catálogos
                </h2>
              </div>
              <span
                className={`text-[10px] font-mono ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                Base de Datos / Logs
              </span>
            </div>

            {/* Estado Vacío / En Construcción Arquitectónica */}
            <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
              <div
                className={`w-14 h-14 rounded-xl border flex items-center justify-center mb-4 ${
                  isDarkMode
                    ? 'bg-white/5 border-white/15 text-zinc-300'
                    : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                <LayoutGrid size={26} />
              </div>

              <h3 className="text-sm font-bold tracking-tight mb-1">
                Grilla de Catálogos y Procesos Preparada
              </h3>
              <p
                className={`text-xs max-w-md leading-relaxed mb-6 ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                Esta sección está lista para conectar el registro histórico de los catálogos que subas y todos los procesos de actualización que se ejecuten en la plataforma.
              </p>

              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs font-mono rounded-md ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-zinc-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Sparkles size={12} className={`${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`} />
                <span>Sección preparada para la integración de lógica futura</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

