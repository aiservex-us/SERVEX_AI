"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { FileText, Cpu, Database, X, UploadCloud } from 'lucide-react';

const LesroPricingFix = ({ companyName = 'LESRO' }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLib, setPdfLib] = useState(null);
  const itemsPerPage = 50;

  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [pdfJson, setPdfJson] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const loadLib = async () => {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      setPdfLib(pdfjs);
    };
    loadLib();
  }, []);

  const SKU_PATTERN = /\b[A-Z]{2,4}\d{3,5}\b/g;
  const TOC_LINE_PATTERN = /^(.*?)\.{3,}\s*(\d+)$/;

  const processStructuredData = (pagesText, fileName) => {
    let toc = [];

    pagesText.slice(0, 10).forEach(p => {
      const lines = p.content.split('\n');
      lines.forEach(line => {
        const match = line.trim().match(TOC_LINE_PATTERN);
        if (match) toc.push({ title: match[1].trim(), page: parseInt(match[2], 10) });
      });
    });

    const uniqueToc = Array.from(new Map(toc.map(i => [i.page, i])).values())
      .sort((a, b) => a.page - b.page);

    const sections = uniqueToc.map((entry, idx) => {
      const startPage = entry.page;
      const endPage = uniqueToc[idx + 1]
        ? uniqueToc[idx + 1].page - 1
        : pagesText[pagesText.length - 1].page;

      const products = [];

      pagesText.forEach(p => {
        if (p.page >= startPage && p.page <= endPage) {
          const skusFound = p.content.match(SKU_PATTERN);
          if (skusFound) {
            products.push({ page: p.page, skus: [...new Set(skusFound)] });
          }
        }
      });

      return { title: entry.title, start_page: startPage, end_page: endPage, products };
    });

    return {
      document: fileName,
      total_pages: pagesText.length,
      toc_detected: uniqueToc.length,
      extracted_at: new Date().toISOString(),
      sections
    };
  };

  const processPDF = async (file) => {
    if (!file || !pdfLib) return;
    setLoading(true);
    setCurrentPage(1);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfLib.getDocument({ data: typedarray }).promise;

        let finalData = [];
        let pagesTextForIntake = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          const items = textContent.items.sort((a, b) => {
            if (Math.abs(b.transform[5] - a.transform[5]) > 2) return b.transform[5] - a.transform[5];
            return a.transform[4] - b.transform[4];
          });

          const pageText = items.map(item => item.str).join(" ");
          pagesTextForIntake.push({ page: i, content: pageText });

          const skus = [...pageText.matchAll(/\b[A-Z]{2}\d{4}\b/g)].map(m => m[0]);
          const dims = [...pageText.matchAll(/(\d{1,3}(?:\.\d+)?\s*(?:x|dia)\s*\d{1,3}(?:\.\d+)?)/gi)].map(m => m[0]);
          const prices = [...pageText.matchAll(/\$\s*([\d,]{2,7})/g)].map(m => m[1]);

          if (skus.length) {
            const isFixedPricing = prices.length < skus.length * 5;
            skus.forEach((sku, index) => {
              const p = isFixedPricing
                ? [prices[index] || "---", ...Array(11).fill("---")]
                : prices.slice(index * 12, index * 12 + 12);

              finalData.push({
                page: i,
                sku,
                dims: dims[index] || "Ver PDF",
                g2: p[0] || "---", g3: p[1] || "---", g4: p[2] || "---",
                g5: p[3] || "---", g6: p[4] || "---", g7: p[5] || "---",
                g8: p[6] || "---", g9: p[7] || "---", g10: p[8] || "---",
                g11: p[9] || "---", g12: p[10] || "---", g13: p[11] || "---"
              });
            });
          }
        }

        setResults(finalData);
        setPdfJson(processStructuredData(pagesTextForIntake, file.name));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSaveToSupabase = async () => {
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
      setMessage('✅ Data synchronized with SVX Cloud');
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!pdfLib) return <div className="p-10 text-[#6264A7]">Cargando motor de sincronización...</div>;

  return (
    <div className="min-h-screen bg-[#FFF] font-sans text-[11px] text-[#242424]">
      
      {/* HEADER ORIGINAL CON BOTÓN ADICIONAL */}
      <div className="bg-[#6264A7] p-3 shadow-md mb-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold text-[14px]">Lesro Master Sync</h2>
          <button 
            onClick={() => setIsIntakeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#4f508a] hover:bg-[#3d3e6a] text-white rounded text-[10px] font-bold transition-all border border-[#7a7cc2]"
          >
            <Cpu size={12} /> CATALOG INTAKE
          </button>
        </div>
        {loading && <div className="text-white text-[9px] bg-[#4f508a] px-2 py-1 rounded">PROCESANDO PDF...</div>}
      </div>

      <div className="max-w-[1600px] mx-auto p-4">
        {/* INPUT DE ARCHIVO ORIGINAL */}
        <div className="mb-6 bg-white border rounded p-6 shadow-sm flex flex-col items-center">
          <input 
            type="file" 
            accept=".pdf"
            onChange={(e) => processPDF(e.target.files[0])} 
            className="text-[11px] file:bg-[#6264A7] file:text-white file:border-0 file:py-2 file:px-4 file:rounded file:font-bold cursor-pointer"
          />
        </div>

        {/* TABLA ORIGINAL (Matrix Visualization) */}
        {results.length > 0 && (
          <div className="bg-white rounded shadow-sm border border-[#E1E1E1] overflow-hidden">
            <div className="p-3 bg-[#FDFDFD] border-b flex justify-between items-center">
              <span className="font-bold text-[#6264A7]">Total: {results.length} productos</span>
              <div className="flex items-center space-x-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-2 py-1 border rounded disabled:opacity-20">Anterior</button>
                <span className="px-2">Página {currentPage} de {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-2 py-1 border rounded disabled:opacity-20">Siguiente</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#F0F0F0]">
                  <tr>
                    <th className="p-2 text-left border-r w-24">SKU</th>
                    <th className="p-2 text-left border-r w-40">DIMS</th>
                    <th className="p-2 text-center border-r bg-[#E8E8FF] text-[#6264A7] font-bold">G2/BASE</th>
                    {['G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','G13'].map(g => (
                      <th key={g} className="p-2 text-center border-r font-semibold">{g}</th>
                    ))}
                    <th className="p-2 text-center w-10 text-gray-400">Pág</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {currentResults.map((r, i) => (
                    <tr key={i} className="hover:bg-[#F3F2F1]">
                      <td className="p-2 font-bold text-[#6264A7] border-r">{r.sku}</td>
                      <td className="p-2 text-gray-500 border-r">{r.dims}</td>
                      <td className="p-2 text-center border-r font-bold bg-[#F9F9FB] text-blue-800">${r.g2}</td>
                      {[r.g3, r.g4, r.g5, r.g6, r.g7, r.g8, r.g9, r.g10, r.g11, r.g12, r.g13].map((v, idx) => (
                        <td key={idx} className="p-2 text-center border-r">{v !== '---' ? `$${v}` : '—'}</td>
                      ))}
                      <td className="p-2 text-center text-gray-300">{r.page}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PARA CATALOG INTAKE */}
      {isIntakeOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#EDEBE9]">
            <div className="bg-[#F3F2F1] p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-[#6264A7]" />
                <h3 className="text-[12px] font-bold">SVX Intelligent Intake — {companyName}</h3>
              </div>
              <button onClick={() => setIsIntakeOpen(false)} className="hover:bg-black/10 p-1 rounded-full"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-6">
              {!pdfJson ? (
                <div 
                  className={`h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${dragActive ? 'border-[#6264A7] bg-[#F3F2F1]' : 'border-[#E1DFDD]'}`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); processPDF(e.dataTransfer.files[0]); }}
                >
                  <UploadCloud size={32} className="text-[#A19F9D]" />
                  <span className="font-bold">Arrastra el PDF aquí</span>
                  <p className="text-[10px] text-[#605E5C]">Se extraerá el JSON estructurado automáticamente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#F8F8F8] p-3 rounded-lg border">
                    <div>
                      <p className="font-bold text-[#6264A7]">Análisis completado</p>
                      <p className="text-[9px] text-[#605E5C]">{pdfJson.sections.length} secciones detectadas en {pdfJson.document}</p>
                    </div>
                    <button 
                      onClick={handleSaveToSupabase}
                      className="px-4 py-2 bg-[#6264A7] text-white rounded-lg font-bold hover:bg-[#4f508a] transition-all"
                    >
                      Sincronizar con Supabase
                    </button>
                  </div>
                  <pre className="bg-[#242424] text-[#00FF41] p-4 rounded-xl text-[9px] max-h-64 overflow-auto font-mono">
                    {JSON.stringify(pdfJson, null, 2)}
                  </pre>
                </div>
              )}
              {message && <p className="text-center font-bold text-[#6264A7]">{message}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LesroPricingFix;