'use client';

import React, { useState } from 'react';
import Topography from './Topography';

const artPlates = [
  {
    id: 'plate-1',
    coord: 'LAT -28.50 · LON +14.20',
    topoKey: 'art-topo-coord-west',
    title: 'XML Data Architecture',
    summary: 'Auditoría y parsing estructural de esquemas XML para CET Designer.',
    originX: -28.5,
    originZ: 14.2,
    morphOffset: 1.2,
    elevation: 0.65,
    tilt: 85,
    scale: 0.78,
    direction: 'left',
  },
  {
    id: 'plate-2',
    coord: 'LAT +42.80 · LON -19.60',
    topoKey: 'art-topo-coord-central',
    title: 'Deterministic Translation',
    summary: 'Pipelines multi-agente con reglas de negocio inmutables.',
    originX: 42.8,
    originZ: -19.6,
    morphOffset: 4.8,
    elevation: 0.42,
    tilt: 72,
    scale: 1.05,
    direction: 'right',
  },
  {
    id: 'plate-3',
    coord: 'LAT +08.40 · LON +65.10',
    topoKey: 'art-topo-coord-north',
    title: 'Autonomous Synchronization',
    summary: 'Alineación bidireccional continua con catálogos Configura CET.',
    originX: 8.4,
    originZ: 65.1,
    morphOffset: 8.5,
    elevation: 0.54,
    tilt: 90,
    scale: 0.90,
    direction: 'forward',
  },
];

export default function TopographyCards() {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section className="relative w-screen left-1/2 -translate-x-1/2 max-w-[100vw] py-8 sm:py-12 px-6 sm:px-10 md:px-14 lg:px-20 overflow-hidden">
      {/* Grid 100vw con 3 tarjetas más compactas y equilibradas */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch">
        {artPlates.map((plate) => {
          const isHovered = hoveredId === plate.id;

          return (
            <div
              key={plate.id}
              onMouseEnter={() => setHoveredId(plate.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="group relative h-[340px] sm:h-[370px] md:h-[390px] flex flex-col justify-between p-5 sm:p-6 bg-[#09090b] shadow-[0_16px_40px_rgba(0,0,0,0.14)] transition-all duration-500 overflow-hidden cursor-pointer"
            >
              {/* Ángulos esquineros arquitectónicos */}
              <span className={`absolute top-0 left-0 w-3.5 h-3.5 border-t border-l transition-colors duration-300 pointer-events-none z-30 ${isHovered ? 'border-white' : 'border-white/50'}`} />
              <span className={`absolute top-0 right-0 w-3.5 h-3.5 border-t border-r transition-colors duration-300 pointer-events-none z-30 ${isHovered ? 'border-white' : 'border-white/50'}`} />
              <span className={`absolute bottom-0 left-0 w-3.5 h-3.5 border-b border-l transition-colors duration-300 pointer-events-none z-30 ${isHovered ? 'border-white' : 'border-white/50'}`} />
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r transition-colors duration-300 pointer-events-none z-30 ${isHovered ? 'border-white' : 'border-white/50'}`} />

              {/* Topography WebGL en NEGATIVO:
                  - Líneas visiblemente claras en reposo (opacity-65, brightness-100)
                  - Al hacer hover: resplandor intenso (opacity-100, brightness-135) y activa movimiento
                  - Al salir del hover: se congela en su sitio sin reiniciarse */}
              <div
                className={`absolute inset-0 z-0 pointer-events-none transition-all duration-700 ease-out filter ${
                  isHovered
                    ? 'opacity-100 brightness-135 contrast-115'
                    : 'opacity-65 brightness-100 contrast-100'
                }`}
              >
                <Topography
                  key={plate.topoKey}
                  color="#ffffff"
                  lineCount={9}
                  lineWidth={0.9}
                  elevation={plate.elevation}
                  foreground={0.2}
                  tilt={plate.tilt}
                  speed={isHovered ? 0.16 : 0}
                  direction={plate.direction}
                  originX={plate.originX}
                  originZ={plate.originZ}
                  morphOffset={plate.morphOffset}
                  glow={isHovered ? 0.7 : 0.5}
                  depthOfField={0}
                  fog={0.02}
                  hoverEffect="lift"
                  clickEffect="peak"
                  majorLines={false}
                  scale={plate.scale}
                  detail={0.12}
                  morph={isHovered ? 0.18 : 0}
                  brightness={isHovered ? 1.25 : 1.0}
                  opacity={0.98}
                  mouseInteraction={isHovered}
                  markers="none"
                  lightMode={false}
                  className="w-full h-full"
                />
              </div>

              {/* Velo degradado inferior para garantizar perfecta legibilidad del texto puntual */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent pointer-events-none z-10" />

              {/* Placard Superior: Coordenada discreta */}
              <div className="relative z-20 flex items-center justify-end">
                <span className={`text-[9px] sm:text-[10px] font-mono tracking-widest uppercase transition-colors duration-300 ${
                  isHovered ? 'text-white/90' : 'text-white/60'
                }`}>
                  {plate.coord}
                </span>
              </div>

              {/* Placard Inferior: Información Puntual limpia y compacta */}
              <div className="relative z-20 flex flex-col gap-1.5">
                <h3 className="text-base sm:text-lg md:text-xl font-light text-white tracking-tight leading-snug">
                  {plate.title}
                </h3>

                <p className="text-xs sm:text-[13px] text-white/70 font-light leading-relaxed">
                  {plate.summary}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
