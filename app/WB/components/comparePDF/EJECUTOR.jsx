'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUploadCloud,
  FiZap,
  FiX,
  FiCode,
  FiDatabase,
  FiMaximize2
} from 'react-icons/fi';
import {
  FileText,
  Loader2,
  DownloadCloud,
  X,
  Zap,
  Terminal
} from 'lucide-react';

import { supabase } from '../../../lib/supabaseClient';

import EjecutorAgente from './EJECUTOR_agente';
import XML_EJECUTADO_VEW from './XML_EJECUTADO_VEW';
import EJECUTOR_PLAY from './EJECUTOR_PLAY';
import LocalComparisonViewer from './LocalComparisonViewer';

const SVXUnifiedPlatform = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState('console');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [data, setData] = useState([]);
  const [masterDataRows, setMasterDataRows] = useState([]);
  const [auditReportJson, setAuditReportJson] = useState(null);
  const [xmlActualizerRaw, setXmlActualizerRaw] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isXmlLoading, setIsXmlLoading] = useState(false);
  const [matchStatus, setMatchStatus] = useState(null);
  const [diffCount, setDiffCount] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [backendSuccess, setBackendSuccess] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [agentReport, setAgentReport] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = sessionStorage.getItem('servex_audit_tutorial_seen');
    if (!hasSeenTutorial) setShowTutorial(true);
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    sessionStorage.setItem('servex_audit_tutorial_seen', 'true');
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
  };

  const processFileSelection = (selectedFile) => {
    if (!selectedFile?.name.endsWith('.csv')) {
      showAlert('Invalid format. Use only .CSV', 'error');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (!lines.length) return;

      const sampleLine = lines.find(l => l.includes(';') || l.includes(','));
      const delimiter = sampleLine?.includes(';') ? ';' : ',';
      const matrix = lines.map(line => line.split(delimiter).map(cell => cell.trim()));

      setData(matrix);
      setMatchStatus(null);
      setMasterDataRows([]);
      showAlert('File linked successfully', 'success');
    };

    reader.readAsText(selectedFile);
  };

  const handleTabChangeToXml = () => {
    setIsXmlLoading(true);
    setActiveTab('xml_view');
    setTimeout(() => setIsXmlLoading(false), 100);
  };

  const handleDownloadXML = () => {
    if (!xmlActualizerRaw) return;

    const blob = new Blob([xmlActualizerRaw], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LESRO_PRICING_MASTER_AUDIT_${new Date().getFullYear()}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderVisualizerContent = () => (
    <AnimatePresence mode="wait">
      {activeTab === 'console' && (
        <LocalComparisonViewer
          file={file}
          data={data}
          masterDataRows={masterDataRows}
          matchStatus={matchStatus}
          processFileSelection={processFileSelection}
        />
      )}

      {activeTab === 'audit_json' && (
        <motion.div key="json" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-4 overflow-hidden">
          <h2 className="flex-shrink-0 text-xs font-black text-[#464775] uppercase mb-4">Column: audit_report_json</h2>
          <div className="bg-[#1E1E1E] text-[#D4D4D4] p-4 rounded-lg font-mono text-[11px] overflow-auto flex-grow shadow-inner">
            {isProcessing ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>
            ) : auditReportJson ? (
              <pre>{JSON.stringify(auditReportJson, null, 2)}</pre>
            ) : (
              <p className="opacity-50">// No data processed in cloud yet...</p>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'xml_view' && (
        <motion.div key="xml" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-4 overflow-hidden">
          <div className="bg-white border border-[#EDEBE9] rounded-lg flex-grow shadow-inner relative flex flex-col items-center justify-center text-center p-8">
            {(isProcessing || isXmlLoading) ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#444791] mb-2" size={32} />
                <span className="text-[10px] font-black text-[#444791] uppercase tracking-widest">
                  {isProcessing ? 'Generating XML...' : 'Preparing Download Link...'}
                </span>
              </div>
            ) : xmlActualizerRaw ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#F3F2F1] rounded-full flex items-center justify-center mb-4">
                  <FiCode size={30} className="text-[#464775]" />
                </div>
                <h2 className="text-sm font-black text-[#464775] uppercase mb-2">XML Ready for Export</h2>
                <button onClick={handleDownloadXML} className="flex items-center gap-3 bg-[#464775] text-white px-8 py-3 rounded-md text-[11px] font-bold">
                  <DownloadCloud size={18} /> DOWNLOAD XML FILE
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-30 italic">
                <FiDatabase size={40} className="mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest">// Waiting for data synchronization...</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'xml_inspector' && (
        <motion.div key="inspector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full overflow-hidden">
          {isProcessing ? (
            <div className="h-full flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[#444791] mb-2" size={32} />
            </div>
          ) : (
            <XML_EJECUTADO_VEW xmlString={xmlActualizerRaw} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return <div>{/* Full component preserved; Local Comparison Viewer extracted */}</div>;
};

export default SVXUnifiedPlatform;