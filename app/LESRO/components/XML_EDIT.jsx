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
    /* CAMBIO CLAVE: 
       Eliminamos 'fixed', 'inset-0' y 'h-screen'.
       Usamos 'h-full' y 'w-full' para que llene el contenedor blanco del menú.
    */
    <div className="flex h-full w-full bg-[#FDFDFD] overflow-hidden">
      
      {/* Lado Izquierdo: CSV */}
      <div className="w-[55%] min-w-0 h-full overflow-hidden border-r border-[#EDEBE9]">
        <AuditCSV 
          showAlert={showAlert} 
          onDiscrepancyFound={handleDiscrepancy} 
          onReset={() => setSkuToSearch("")}
        />
      </div>

      {/* Lado Derecho: XML */}
      <div className="w-[45%] min-w-0 h-full flex flex-col overflow-hidden">
        <ConfigXML externalSearchSKU={skuToSearch} />
      </div>

    </div>
  );
}

export default UnifiedPage;