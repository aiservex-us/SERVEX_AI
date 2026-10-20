'use client';

import React, { useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { Download, Loader2 } from 'lucide-react';

const DownloadResultXML = ({ moduleName = 'General_Procces' }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { data, error } = await supabase
        .from(`ClientsSERVEX_${moduleName}`)
        .select('xml_actualizer_raw')
        .eq('company_name', moduleName)
        .single();

      if (error) throw error;
      
      if (!data || !data.xml_actualizer_raw) {
        alert('No XML found in the database for this module.');
        return;
      }

      const xmlContent = data.xml_actualizer_raw;
      const blob = new Blob([xmlContent], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${moduleName}.xml`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Registrar evento de descarga en seguimiento_client
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://servex-ai-back.onrender.com';
        fetch(`${backendUrl}/api/v1/cet-ai-engine/tracking/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_name: moduleName,
            event_type: 'DOWNLOAD_RESULT_XML',
            title: 'Descarga de XML Certificado',
            description: `El usuario descargó el archivo XML actualizado '${moduleName}.xml'.`,
            actor: 'user',
            details: { file_name: `${moduleName}.xml` }
          }),
          keepalive: true
        }).catch(() => {});
      } catch (_) {}
    } catch (err) {
      console.error('Error downloading XML:', err);
      alert('An error occurred while downloading the XML.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={isDownloading}
      className="bg-[#18181b] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#09090b] transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
    >
      {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {isDownloading ? 'Downloading...' : `Download ${moduleName}.xml`}
    </button>
  );
};

export default DownloadResultXML;
