'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiX } from 'react-icons/fi';
import AuditCSV from './XML_EDIT_FULL/AuditCSV';
import ConfigXML from './XML_EDIT_FULL/ConfigXML';

const UnifiedPage = () => {
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [skuToSearch, setSkuToSearch] = useState("");

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
  };

  const handleDiscrepancy = (sku) => {
    setSkuToSearch(sku);
  };

  return (
    // h-screen y overflow-hidden en el padre son clave para que nada se salga
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#FDFDFD] font-sans text-[#242424] overflow-hidden fixed inset-0">
      
      {/* Alertas Globales */}
      <AnimatePresence>
        {alert.show && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border bg-white border-[#EDEBE9] min-w-[300px]">
            <div className={`p-2 rounded-md text-white ${alert.type === 'success' ? 'bg-[#237B4B]' : alert.type === 'error' ? 'bg-[#A4262C]' : 'bg-[#D83B01]'}`}>
              {alert.type === 'success' ? <FiCheckCircle /> : <FiAlertTriangle />}
            </div>
            <p className="text-[11px] font-bold flex-grow">{alert.message}</p>
            <button onClick={() => setAlert({ ...alert, show: false })}><FiX /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lado Izquierdo: CSV (65%) */}
      {/* Usamos h-full y flex-col para que el componente interno ocupe exactamente el 65% sin crecer */}
      <div className="flex-[0.65] h-full flex flex-col overflow-hidden border-r border-[#EDEBE9]">
        <AuditCSV 
          showAlert={showAlert} 
          onDiscrepancyFound={handleDiscrepancy} 
          onReset={() => setSkuToSearch("")}
        />
      </div>

      {/* Lado Derecho: XML (35%) */}
      {/* h-full garantiza que el configurador no se estire hacia abajo si hay muchos productos */}
      <div className="flex-[0.35] h-full flex flex-col overflow-hidden">
        <ConfigXML externalSearchSKU={skuToSearch} />
      </div>

    </div>
  );
};

export default UnifiedPage;