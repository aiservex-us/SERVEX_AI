'use client';

import React, { useState } from 'react';

const DATA = {
  foundation: {
    path: 'M0,85 C80,85 120,80 160,78 C200,76 240,74 400,72',
    value: '+6%',
    label: 'Foundation Phase',
    description:
      'Centralización de herramientas y procesos. Base operativa unificada para habilitar automatización futura.'
  },
  automation: {
    path: 'M0,82 C60,80 120,72 160,68 C200,65 260,60 400,55',
    value: '+18%',
    label: 'Automation Phase',
    description:
      'Automatización de tareas repetitivas mediante IA, reduciendo carga manual y tiempos operativos.'
  },
  optimization: {
    path: 'M0,80 C60,75 120,65 160,58 C200,50 260,45 400,40',
    value: '+34%',
    label: 'Optimization Phase',
    description:
      'Optimización de flujos críticos con IA, mejora continua del rendimiento y eficiencia operativa.'
  },
  scaling: {
    path: 'M0,78 C60,70 120,58 160,48 C200,38 260,32 400,26',
    value: '+64%',
    label: 'Scaling Phase',
    description:
      'Escalamiento de automatizaciones a múltiples áreas y procesos, habilitando crecimiento sostenido.'
  },
  intelligence: {
    path: 'M0,75 C60,60 120,45 160,35 C200,28 260,22 400,18',
    value: '+112%',
    label: 'Intelligent Platform Phase',
    description:
      'Plataforma de IA madura con capacidades predictivas, decisiones autónomas y máxima eficiencia operativa.'
  }
};

const PHASES = [
  { key: 'foundation', label: 'Foundation' },
  { key: 'automation', label: 'Automation' },
  { key: 'optimization', label: 'Optimization' },
  { key: 'scaling', label: 'Scaling' },
  { key: 'intelligence', label: 'Intelligence' }
];

export default function Chart() {
  const [mode, setMode] = useState('automation');

  const current = DATA[mode];

  return (
    <section className="bg-white rounded-2xl p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-slate-200/70">

      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="max-w-xl">
          <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
            SERVEX · AI Automation Growth Model
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Evolución progresiva del crecimiento de SERVEX mediante automatización
            con IA, desde la centralización inicial hasta una plataforma inteligente
            y autónoma.
          </p>
        </div>

        {/* CONTROLES DE FASE */}
        <div className="flex flex-wrap gap-2">
          {PHASES.map(phase => (
            <button
              key={phase.key}
              onClick={() => setMode(phase.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                mode === phase.key
                  ? 'bg-[#6264A7] text-white border-[#6264A7] shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {phase.label}
            </button>
          ))}
        </div>
      </div>

      {/* INFO DE FASE */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-[#6264A7] uppercase tracking-wide">
          {current.label}
        </p>
        <p className="text-xs text-slate-500 max-w-2xl">
          {current.description}
        </p>
      </div>

      {/* CHART */}
      <div className="h-44 w-full relative">
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
          <path
            key={mode}
            d={current.path}
            fill="none"
            stroke="#6264A7"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              strokeDasharray: 500,
              strokeDashoffset: 500,
              animation: 'draw-line 0.9s ease-out forwards'
            }}
          />

          {/* Punto final */}
          <circle
            cx="400"
            cy={current.path.includes('18') ? '18' : '40'}
            r="5"
            fill="#6264A7"
            stroke="white"
            strokeWidth="2"
          />

          {/* Badge */}
          <rect
            x="330"
            y="4"
            width="62"
            height="22"
            rx="7"
            fill="#0f172a"
          />
          <text
            x="346"
            y="19"
            fill="white"
            fontSize="9"
            fontWeight="600"
          >
            {current.value}
          </text>
        </svg>
      </div>

      {/* FOOTER */}
      <div className="mt-4 text-[11px] text-slate-400">
        Modelo de madurez de automatización con IA aplicado a SERVEX para maximizar
        eficiencia, escalabilidad y toma de decisiones inteligentes.
      </div>

      <style jsx>{`
        @keyframes draw-line {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </section>
  );
}
