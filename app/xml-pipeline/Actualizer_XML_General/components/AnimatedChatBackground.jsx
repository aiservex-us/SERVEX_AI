'use client';

import React from 'react';
import Topography from './Topography';

export default function AnimatedChatBackground({ isDarkMode = true }) {
  return (
    <div className={`absolute inset-0 z-0 overflow-hidden select-none pointer-events-none transition-colors duration-500 ${isDarkMode ? 'bg-[#09090b]' : 'bg-[#fafafa]'}`}>
      {/* ── TOPOGRAPHY WEBGL 3D BACKGROUND (DARK / LIGHT MODO NEGATIVO) ── */}
      <div className="absolute inset-0 w-full h-full">
        <Topography
          key="chat-topography"
          color={isDarkMode ? '#71717a' : '#27272a'}
          lineCount={26}
          lineWidth={isDarkMode ? 0.58 : 0.62}
          elevation={isDarkMode ? 0.45 : 0.46}
          foreground={0.05}
          tilt={15}
          speed={0.22}
          direction="forward"
          glow={isDarkMode ? 0.18 : 0.08}
          depthOfField={0.13}
          fog={isDarkMode ? 0.38 : 0.26}
          hoverEffect="light"
          clickEffect="pulse"
          majorLines={false}
          scale={0.95}
          detail={0.57}
          morph={0.22}
          brightness={isDarkMode ? 0.95 : 1.10}
          opacity={isDarkMode ? 0.58 : 0.45}
          mouseStrength={0.45}
          trail={0.94}
          parallax={0.37}
          glitch={0.42}
          lightMode={!isDarkMode}
          className="w-full h-full"
        />
      </div>

      {/* ── VELO PERIFÉRICO EQUILIBRADO ── */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'bg-gradient-to-t from-transparent via-transparent to-black/30' : 'bg-gradient-to-t from-transparent via-transparent to-black/5'}`} />
    </div>
  );
}
