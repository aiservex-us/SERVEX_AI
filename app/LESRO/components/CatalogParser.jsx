'use client';

import React, { useState, useCallback } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { FileText, Cpu, Database } from 'lucide-react';

export default function CatalogParser({ companyName = 'LESRO' }) {
  const [pdfJson, setPdfJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(null);

  // ==========================================
  // LÓGICA DE EXTRACCIÓN (PATRONES GLYNNE IA)
  // ==========================================
  
  // SKU: 2-4 letras seguidas de 3-5 números (Ej: BL1101)
  const SKU_PATTERN = /\b[A-Z]{2,4}\d{3,5}\b/g;
  
  // TOC: Título ........ Página (Ej: Ashford Seating ........ 23)
  const TOC_LINE_PATTERN = /^(.*?)\.{3,}\s*(\d+)$/;

  const processPdfData = (pagesText, fileName) => {
    // 1. Extraer Tabla de Contenidos (TOC) de las primeras 10 páginas
    let toc = [];
    pagesText.slice(0, 10).forEach(p => {
      const lines = p.content.split('\n');
      lines.forEach(line => {
        const match = line.trim().match(TOC_LINE_PATTERN);
        if (match) {
          toc.push({
            title: match[1].trim(),
            page: parseInt(match[2], 10)
          });
        }
      });
    });

    // Eliminar duplicados de TOC por número de página
    const uniqueToc = Array.from(new Map(toc.map(item => [item.page, item])).values())
                           .sort((a, b) => a.page - b.page);

    // 2. Construir Estructura por Secciones
    const sections = uniqueToc.map((entry, idx) => {
      const startPage = entry.page;
      const endPage = uniqueToc[idx + 1] 
        ? uniqueToc[idx + 1].page - 1 
        : pagesText[pagesText.length - 1].page;

      const sectionProducts = [];

      // Buscar SKUs en el rango de páginas de esta sección
      pagesText.forEach(p => {
        if (p.page >= startPage && p.page <= endPage) {
          const skusFound = p.content.match(SKU_PATTERN);
          if (skusFound) {
            sectionProducts.push({
              page: p.page,
              skus: [...new Set(skusFound)] // únicos por página
            });
          }
        }
      });

      return {
        title: entry.title,
        start_page: start_page,
        end_page: end_page,
        products: sectionProducts
      };
    });

    return {
      document: fileName,
      total_pages: pagesText.length,
      toc_detected: uniqueToc.length,
      extracted_at: new Date().toISOString(),
      sections: sections
    };
  };

  const extractPdfToJson = async (file) => {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    const pagesText = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      // Mantenemos saltos de línea para que el Regex de TOC funcione
      const text = content.items
        .map(item => item.str)
        .join(' ');

      pagesText.push({
        page: i,
        content: text
      });
    }

    // Aplicar la lógica de estructuración minuciosa
    return processPdfData(pagesText, file.name);
  };

  // ============================
  // Handlers & Supabase
  // ============================

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragActive(false);
    setMessage(null);

    const file = e.dataTransfer.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      setMessage('❌ Please drop a valid PDF');
      return;
    }

    setLoading(true);
    try {
      const structuredJson = await extractPdfToJson(file);
      setPdfJson(structuredJson);
      setMessage('✨ PDF structured successfully');
    } catch (err) {
      console.error('Extraction Error:', err);
      setMessage('❌ Error parsing PDF structure');
    } finally {
      setLoading(false);
    }
  }, [companyName]);

  const handleSave = async () => {
    if (!pdfJson) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthorized');

      const { error } = await supabase
        .from('ClientsSERVEX')
        .update({ pdf_raw: pdfJson })
        .eq('company_name', companyName);

      if (error) throw error;
      setMessage('🚀 Data synchronized with SVX Cloud');
    } catch (err) {
      setMessage('❌ Sync error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-white p-6 rounded-2xl border border-[#EDEBE9] shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#F3F2F1] rounded-lg">
            <Cpu size={20} className="text-[#6264A7]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#242424]">SVX Intelligent Intake</h3>
            <p className="text-[11px] text-[#605E5C]">Powered by GLYNNE S.A.S. Architecture</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#A19F9D]">Target Company</span>
          <p className="text-xs font-black text-[#6264A7]">{companyName}</p>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`w-full h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer
          ${dragActive ? 'border-[#6264A7] bg-[#F3F2F1]' : 'border-[#E1DFDD] bg-[#FAF9F8] hover:border-[#C8C6C4]'}`}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#6264A7]"></div>
            <span className="text-xs font-medium text-[#6264A7]">Analyzing SKUs & TOC...</span>
          </div>
        ) : (
          <>
            <FileText size={28} className="text-[#A19F9D] mb-2" />
            <span className="text-xs font-bold text-[#242424]">Drop Catalog PDF</span>
            <span className="text-[10px] text-[#605E5C]">Automated Extraction & Vectorization</span>
          </>
        )}
      </div>

      {pdfJson && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-[#605E5C] flex items-center gap-1">
              <Database size={12} /> STRUCTURE PREVIEW
            </span>
            <span className="text-[10px] text-[#6264A7]">{pdfJson.sections.length} Sections Found</span>
          </div>
          <pre className="max-h-48 overflow-auto text-[10px] bg-[#242424] text-[#D1D1D1] p-4 rounded-xl font-mono leading-relaxed">
            {JSON.stringify(pdfJson, null, 2)}
          </pre>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={!pdfJson || loading}
        className="w-full py-3 text-xs font-bold rounded-xl bg-[#6264A7] text-white hover:bg-[#4B53BC] transition-all disabled:opacity-30 shadow-lg shadow-[#6264A7]/20 flex items-center justify-center gap-2"
      >
        {loading ? 'Processing...' : 'Sync with SVX Copilot'}
      </button>

      {message && (
        <p className={`text-center text-[10px] font-bold ${message.includes('❌') ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </section>
  );
}