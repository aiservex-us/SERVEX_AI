'use client';

import React, { useState } from 'react';
import DeleteData from './components/delete_data';
import InsertXML from './components/incertXML';

const IncertData = () => {
  return (
    <div className="p-8 max-w-8xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col gap-8">
        
        {/* Sección de Inserción XML y CSVs (Unified) */}
        <section className="relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
          
          <div className="w-full">
            <InsertXML />
          </div>
        </section>

        {/* Sección de Eliminación */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <DeleteData />
        </section>
        
      </div>
    </div>
  );
};

export default IncertData;
