'use client';

import React, { useState } from 'react';

const DATA = {
  foundation: {
    // Curva suave casi plana al inicio
    path: 'M0,90 C100,90 250,88 400,82',
    endY: 82,
    value: '+6%',
    label: 'Foundation Phase',
    description:
      'Centralization of tools and processes. Unified operational base to enable future automation workflows.'
  },
  automation: {
    // Curva con ligera aceleración al final
    path: 'M0,90 C150,90 280,75 400,60',
    endY: 60,
    value: '+18%',
    label: 'Automation Phase',
    description:
      'Automation of repetitive tasks using AI, significantly reducing manual workload and operational lead times.'
  },
  optimization: {
    // Curva de crecimiento constante
    path: 'M0,90 C180,90 300,60 400,40',
    endY: 40,
    value: '+34%',
    label: 'Optimization Phase',
    description:
      'Optimization of critical flows through AI, focusing on continuous performance improvement and operational efficiency.'
  },
  scaling: {
    // Aceleración pronunciada tipo "hockey stick"
    path: 'M0,90 C200,90 320,40 400,22',
    endY: 22,
    value: '+64%',
    label: 'Scaling Phase',
    description:
      'Scaling automations across multiple departments and processes, enabling sustained business growth.'
  },
  intelligence: {
    // Crecimiento exponencial máximo
    path: 'M0,90 C220,90 350,20 400,8',
    endY: 8,
    value: '+112%',
    label: 'Intelligent Platform Phase',
    description:
      'Mature AI platform with predictive capabilities, autonomous decision-making, and maximum operational efficiency.'
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
            Progressive evolution of SERVEX growth through AI automation, 
            from initial centralization to a fully intelligent and autonomous platform.
          </p>
        </div>

        {/* PHASE CONTROLS */}
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

      {/* INFO DE LA FASE */}
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
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <path
            key={mode}
            d={current.path}
            fill="none"
            stroke="#6264A7"
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              strokeDasharray: 600,
              strokeDashoffset: 600,
              animation: 'draw-line 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards'
            }}
          />

          {/* End Point - Ahora dinámico según la curva */}
          <circle
            cx="400"
            cy={current.endY}
            r="5"
            fill="#6264A7"
            stroke="white"
            strokeWidth="2"
            style={{ transition: 'all 0.5s ease-in-out' }}
          />

          {/* Badge */}
          <rect
            x="320"
            y="4"
            width="72"
            height="22"
            rx="7"
            fill="#0f172a"
          />
          <text
            x="336"
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
        AI automation maturity model applied to SERVEX to maximize efficiency, 
        scalability, and intelligent decision-making.
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