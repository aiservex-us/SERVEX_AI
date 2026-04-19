'use client';

import React from 'react';

/**
 * ARCHIVO: app/Panel_Cient/page.jsx
 * Descripción: Página inicial del Panel de Clientes para SERVEX AI.
 * Este archivo corrige el error de "default export" del build de Next.js.
 */

export default function PanelClientPage() {
  return (
    <div style={{ 
      minHeight: '100-vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      backgroundColor: '#FAF9F8',
      color: '#242424'
    }}>
      <div style={{
        padding: '40px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
          SERVEX AI Client Panel
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Initializing secure workspace for corporate partners...
        </p>
        
        <div style={{
          marginTop: '20px',
          padding: '10px',
          border: '1px solid #5B5FC7',
          borderRadius: '8px',
          color: '#5B5FC7',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          READY FOR DEVELOPMENT
        </div>
      </div>
    </div>
  );
}