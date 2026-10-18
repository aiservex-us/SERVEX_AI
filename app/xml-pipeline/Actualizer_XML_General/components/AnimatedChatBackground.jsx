'use client';

import React from 'react';
import Topography from './Topography';

export default function AnimatedChatBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none bg-[#09090b]">
      {/* ── TOPOGRAPHY WEBGL 3D BACKGROUND (PERMANENT MODO NOCHE) ── */}
      <div className="absolute inset-0 w-full h-full">
        <Topography
          key="dark-mode-topo"
          color="#cbd5e1"
          lineCount={26}
          lineWidth={0.6}
          elevation={0.45}
          foreground={0.05}
          tilt={15}
          speed={0.25}
          direction="forward"
          glow={0.35}
          depthOfField={0.13}
          fog={0.35}
          hoverEffect="light"
          clickEffect="pulse"
          majorLines={false}
          scale={0.95}
          detail={0.57}
          morph={0.22}
          brightness={1.3}
          opacity={0.65}
          mouseStrength={0.45}
          trail={0.94}
          parallax={0.37}
          glitch={0.42}
          lightMode={false}
          className="w-full h-full"
        />
      </div>

      {/* ── VELO PERIFÉRICO EQUILIBRADO ── */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-transparent via-transparent to-black/25" />
    </div>
  );
}
