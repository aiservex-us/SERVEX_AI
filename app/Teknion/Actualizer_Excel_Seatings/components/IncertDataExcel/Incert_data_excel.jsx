'use client';

import React, { useState } from 'react';
import InsertXML from './incertXML_excel';
import DeleteData from '../../../Actualizer_XML_Seatings/components/comparePDF/IncertData/components/delete_data';

const IncertData = ({ moduleName }) => {
  return (
    <div className="p-8 max-w-8xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col gap-8">
        
        {/* Sección de Inserción XML (CET) */}
        <section className="relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px]">
          
          <div className="w-full">
            <InsertXML moduleName={moduleName} />
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
