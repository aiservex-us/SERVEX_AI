'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function BackgroundWrapper({ children, theme = 'light', disableAutoAnimate = false }) {
  const [history, setHistory] = useState([]);
  const stepIdRef = useRef(0);
  const lastCellRef = useRef({ x: -1, y: -1 });
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth > 700 || disableAutoAnimate) return;

    const intervalId = setInterval(() => {
      if (!wrapperRef.current) return;
      
      const rect = wrapperRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(viewportHeight, rect.bottom);
      const visibleHeight = visibleBottom - visibleTop;

      const visibleLeft = Math.max(0, rect.left);
      const visibleRight = Math.min(viewportWidth, rect.right);
      const visibleWidth = visibleRight - visibleLeft;

      if (visibleHeight <= 0 || visibleWidth <= 0) return;

      const randomScreenY = visibleTop + Math.random() * visibleHeight;
      const randomScreenX = visibleLeft + Math.random() * visibleWidth;

      const localY = randomScreenY - rect.top;
      const localX = randomScreenX - rect.left;

      const cx = Math.floor(localX / 96);
      const cy = Math.floor(localY / 96);

      const numNeighbors = Math.floor(Math.random() * 4) + 1;
      const neighbors = [];
      const possibleOffsets = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [1, -1], [-1, 1], [1, 1],
        [-2, 0], [2, 0], [0, -2], [0, 2]
      ];

      const shuffled = possibleOffsets.sort(() => 0.5 - Math.random());
      for (let i = 0; i < numNeighbors; i++) {
        neighbors.push({
          dx: shuffled[i][0],
          dy: shuffled[i][1],
          opacity: (Math.random() * 0.06) + 0.03
        });
      }

      const newStep = {
        id: stepIdRef.current++,
        cx,
        cy,
        neighbors
      };

      setHistory(prev => [newStep, ...prev].slice(0, 8));
    }, 1200);

    return () => clearInterval(intervalId);
  }, [disableAutoAnimate]);

  const handleMouseMove = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth <= 700) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = Math.floor(x / 96);
    const cy = Math.floor(y / 96);

    if (cx !== lastCellRef.current.x || cy !== lastCellRef.current.y) {
      lastCellRef.current = { x: cx, y: cy };

      const numNeighbors = Math.floor(Math.random() * 4) + 1;
      const neighbors = [];
      const possibleOffsets = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [1, -1], [-1, 1], [1, 1],
        [-2, 0], [2, 0], [0, -2], [0, 2]
      ];

      const shuffled = possibleOffsets.sort(() => 0.5 - Math.random());
      for (let i = 0; i < numNeighbors; i++) {
        neighbors.push({
          dx: shuffled[i][0],
          dy: shuffled[i][1],
          opacity: (Math.random() * 0.06) + 0.03
        });
      }

      const newStep = {
        id: stepIdRef.current++,
        cx,
        cy,
        neighbors
      };

      setHistory(prev => [newStep, ...prev].slice(0, 8));
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 700) return;
    setHistory([]);
    lastCellRef.current = { x: -1, y: -1 };
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', width: '100%', backgroundColor: theme === 'dark' ? '#0b0b0d' : '#ffffff' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        @keyframes cellFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      >
        <defs>
          <pattern id="blackbox-grid" width="96" height="96" patternUnits="userSpaceOnUse">
            <path d="M 96 0 L 0 0 0 96" fill="none" stroke={theme === 'dark' ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.07)"} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#blackbox-grid)" />

        {history.map((step, index) => {
          const isCurrent = index === 0;
          return (
            <g key={step.id} style={{ animation: 'cellFadeIn 0.8s ease forwards' }}>
              {step.neighbors.map((n, i) => (
                <rect
                  key={i}
                  x={(step.cx + n.dx) * 96}
                  y={(step.cy + n.dy) * 96}
                  width="96"
                  height="96"
                  fill={theme === 'dark' ? `rgba(255,255,255,${isCurrent ? n.opacity : 0})` : `rgba(0,0,0,${isCurrent ? n.opacity : 0})`}
                  style={{ transition: 'fill 1s ease' }}
                />
              ))}
              <rect
                x={step.cx * 96}
                y={step.cy * 96}
                width="96"
                height="96"
                fill={theme === 'dark' ? `rgba(255,255,255,${isCurrent ? 0.08 : 0})` : `rgba(0,0,0,${isCurrent ? 0.12 : 0})`}
                style={{ transition: 'fill 1s ease' }}
              />
            </g>
          );
        })}
      </svg>
      {children}
    </div>
  );
}
