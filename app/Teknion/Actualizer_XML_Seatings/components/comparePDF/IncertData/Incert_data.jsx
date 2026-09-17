'use client';

import React, { useState } from 'react';
import InsertXML from './components/incertXML';

const IncertData = ({ step }) => {
  return (
    <div className="w-full mx-auto space-y-4 font-sans bg-transparent">
      {/* Redesigned to have NO white background, just a sleek transparent layout */}
      <div className="flex flex-col gap-4">
        
        {/* Sección de Inserción XML y CSVs */}
        <section className="relative w-full">
          <div className="w-full">
            <InsertXML step={step} />
          </div>
        </section>

      </div>
    </div>
  );
};

export default IncertData;
