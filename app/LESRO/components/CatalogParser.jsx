"use client";

import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

const LesroPricingFix = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    // Configuración del worker compatible con Next.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }, []);

  const processPDF = async (file) => {
    if (!file) return;
    setLoading(true);
    setCurrentPage(1);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        let finalData = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          const items = textContent.items.sort((a, b) => {
            if (Math.abs(b.transform[5] - a.transform[5]) > 2) return b.transform[5] - a.transform[5];
            return a.transform[4] - b.transform[4];
          });

          const pageText = items.map(item => item.str).join(" ");

          const skus = [...pageText.matchAll(/\b[A-Z]{2}\d{4}\b/g)].map(m => m[0]);
          const dimRegex = /(\d{1,3}(?:\.\d+)?\s*(?:x|dia)\s*\d{1,3}(?:\.\d+)?(?:\s*x\s*\d{1,3}(?:\.\d+)?)?)/gi;
          const dims = [...pageText.matchAll(dimRegex)].map(m => m[0]);
          const priceRegex = /\$\s*([\d,]{2,7})/g;
          const prices = [...pageText.matchAll(priceRegex)].map(m => m[1]);

          if (skus.length > 0) {
            const isFixedPricing = prices.length < (skus.length * 5); 

            skus.forEach((sku, index) => {
              let p = [];
              if (isFixedPricing) {
                p = [prices[index] || "---", "---", "---", "---", "---", "---", "---", "---", "---", "---", "---", "---"];
              } else {
                const startIdx = index * 12;
                p = prices.slice(startIdx, startIdx + 12);
              }

              finalData.push({
                page: i,
                sku: sku,
                dims: dims[index] || "Ver PDF",
                g2: p[0] || "---", g3: p[1] || "---", g4: p[2] || "---", g5: p[3] || "---",
                g6: p[4] || "---", g7: p[5] || "---", g8: p[6] || "---", g9: p[7] || "---",
                g10: p[8] || "---", g11: p[9] || "---", g12: p[10] || "---", g13: p[11] || "---"
              });
            });
          }
        }
        setResults(finalData);
        exportToCSV(finalData);
      } catch (err) {
        console.error("Error procesando PDF:", err);
        alert("Error al leer el PDF. Verifica que el archivo no esté protegido.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const exportToCSV = (data) => {
    const headers = "Página,Modelo,Dimensiones,G2,G3,G4,G5,G6,G7,G8,G9,G10,G11,G12,G13\n";
    const rows = data.map(d => 
      `${d.page},${d.sku},"${d.dims}",${d.g2},${d.g3},${d.g4},${d.g5},${d.g6},${d.g7},${d.g8},${d.g9},${d.g10},${d.g11},${d.g12},${d.g13}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "LESRO_PRICING_2026.csv";
    a.click();
  };

  // Paginación
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[11px] text-[#242424]">
      {/* Navbar Teams */}
      <div className="bg-[#6264A7] p-3 shadow-md mb-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
            <span className="text-white text-lg"></span>
            <h2 className="text-white font-semibold text-[14px]">Lesro Price Sync</h2>
        </div>
        {loading && (
          <div className="bg-[#4f508a] px-3 py-1 rounded text-white flex items-center space-x-2 animate-pulse">
            <span className="text-[10px]">PROCESANDO ARCHIVO...</span>
          </div>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto p-4">
        {/* Dropzone */}
        <div className="mb-6 bg-white border border-[#E1E1E1] rounded p-6 shadow-sm flex flex-col items-center">
          <input 
            type="file" 
            accept=".pdf"
            onChange={(e) => processPDF(e.target.files[0])} 
            className="block w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-[11px] file:font-bold file:bg-[#6264A7] file:text-white hover:file:bg-[#4f508a] cursor-pointer"
          />
          <p className="mt-2 text-gray-400 text-[10px]">Carga el PDF del catálogo Lesro 2026 para sincronizar precios.</p>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded shadow-sm border border-[#E1E1E1] overflow-hidden">
            {/* Pagination Controls */}
            <div className="p-3 bg-[#FDFDFD] border-b flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-[#6264A7]">Total: {results.length} ítems</span>
                <button onClick={() => exportToCSV(results)} className="border border-[#D1D1D1] px-3 py-1 rounded hover:bg-[#F0F0F0] font-bold text-[#444]">DESCARGAR CSV COMPLETO</button>
              </div>

              <div className="flex items-center space-x-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="w-8 h-8 flex items-center justify-center border rounded disabled:opacity-20 hover:bg-gray-100 font-bold"
                >
                  &larr;
                </button>
                <div className="px-4 py-1 bg-[#F3F2F1] rounded font-semibold text-[#6264A7]">
                  Página {currentPage} de {totalPages}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="w-8 h-8 flex items-center justify-center border rounded disabled:opacity-20 hover:bg-gray-100 font-bold"
                >
                  &rarr;
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#F0F0F0]">
                  <tr className="text-[#444] uppercase tracking-tighter">
                    <th className="p-2 text-left border-r w-24">SKU</th>
                    <th className="p-2 text-left border-r w-40">Dimensiones</th>
                    <th className="p-2 text-center border-r bg-[#E8E8FF] text-[#6264A7] font-black">Base/G2</th>
                    {['G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','G13'].map(g => (
                      <th key={g} className="p-2 text-center border-r font-bold">{g}</th>
                    ))}
                    <th className="p-2 text-center w-12 text-gray-400">Pág</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentResults.map((r, i) => (
                    <tr key={i} className="hover:bg-[#F3F2F1] group transition-colors">
                      <td className="p-2 font-black text-[#6264A7] border-r">{r.sku}</td>
                      <td className="p-2 text-gray-500 border-r italic text-[10px]">{r.dims}</td>
                      <td className="p-2 text-center border-r font-bold bg-[#F9F9FB] text-blue-800">${r.g2}</td>
                      {[r.g3, r.g4, r.g5, r.g6, r.g7, r.g8, r.g9, r.g10, r.g11, r.g12, r.g13].map((v, idx) => (
                        <td key={idx} className={`p-2 text-center border-r ${v === '---' ? 'text-gray-200' : 'text-[#242424]'}`}>
                          {v !== '---' ? `$${v}` : '—'}
                        </td>
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
    </div>
  );
};

export default LesroPricingFix;