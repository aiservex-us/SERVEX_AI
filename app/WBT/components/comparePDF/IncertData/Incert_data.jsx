'use client';

import React from 'react';
import DeleteData from './components/delete_data';
import InsertXML from './components/incertXML';

const IncertData = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-sans">
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-black text-[#464775] uppercase tracking-wider">
          Data Management Hub
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Control panel for data operations and XML synchronization.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sección de Inserción XML */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-[#464775]">
            <span className="font-bold uppercase text-[12px] tracking-widest">XML Ingestion</span>
          </div>
          <InsertXML />
        </section>

        {/* Sección de Eliminación */}
        <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-rose-600">
            <span className="font-bold uppercase text-[12px] tracking-widest">Data Purge</span>
          </div>
          <DeleteData />
        </section>
      </div>
    </div>
  );
};

export default IncertData;