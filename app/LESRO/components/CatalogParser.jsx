"use client";

import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

const LesroPricingFix = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }, []);

  const processPDF = async (file) => {
    setLoading(true);
    setCurrentPage(1);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
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
                g2: p[0] || "---",
                g3: p[1] || "---",
                g4: p[2] || "---",
                g5: p[3] || "---",
                g6: p[4] || "---",
                g7: p[5] || "---",
                g8: p[6] || "---",
                g9: p[7] || "---",
                g10: p[8] || "---",
                g11: p[9] || "---",
                g12: p[10] || "---",
                g13: p[11] || "---"
              });
            });
          }
        }
        setResults(finalData);
        exportToCSV(finalData);
      } catch (err) {
        console.error("Error procesando PDF:", err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const exportToCSV = (data) => {
    const headers = "Página,Modelo,Dimensiones,Grade 2/Base,Grade 3/COM,Grade 4,Grade 5,Grade 6,Grade 7,Grade 8,Grade 9,Grade 10,Grade 11,Grade 12,Grade 13\n";
    const rows = data.map(d => 
      `${d.page},${d.sku},"${d.dims}",${d.g2},${d.g3},${d.g4},${d.g5},${d.g6},${d.g7},${d.g8},${d.g9},${d.g10},${d.g11},${d.g12},${d.g13}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "LESRO_PRICING_MASTER_2026.csv";
    a.click();
  };

  // Lógica de Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResults = results.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[11px] text-[#242424]">
      {/* Header Teams */}
      <div className="bg-[#6264A7] p-3 shadow-md mb-4 flex items-center justify-between sticky top-0 z-50">
        <h2 className="text-white font-semibold text-[14px]">Lesro Master — Paginación Teams</h2>
        {loading && (
          <div className="flex items-center space-x-2 text-white bg-[#4f508a] px-3 py-1 rounded">
            <span className="animate-spin text-[12px]">↻</span>
            <span className="text-[9px]">PROCESANDO...</span>
          </div>
        )}
      </div>

      <div className="max-w-[1500px] mx-auto p-4">
        {/* Upload Section */}
        {!results.length && (
          <div className="mb-6 p-12 border-2 border-dashed border-[#D1D1D1] rounded bg-white shadow-sm flex flex-col items-center justify-center space-y-4">
            <div className="text-center">
              <p className="font-semibold text-[14px] mb-2 text-[#6264A7]">Cargar Catálogo PDF</p>
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => { if (e.target.files[0]) processPDF(e.target.files[0]); }} 
                className="text-[11px] file:bg-[#6264A7] file:text-white file:border-0 file:py-2 file:px-4 file:rounded file:font-bold hover:file:bg-[#4f508a] cursor-pointer"
              />
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            {/* Toolbar de Paginación */}
            <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-[#FDFDFD]">
              <div className="flex items-center space-x-4">
                <span className="font-bold text-[#6264A7]">Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, results.length)} de {results.length}</span>
                <button onClick={() => exportToCSV(results)} className="border border-[#D1D1D1] px-3 py-1 rounded hover:bg-[#F0F0F0] font-semibold text-[10px]">Exportar Todo</button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-30 hover:bg-gray-50 font-bold"
                >
                  &lt;
                </button>
                <span className="px-2">Página <b>{currentPage}</b> de {totalPages}</span>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-30 hover:bg-gray-50 font-bold"
                >
                  &gt;
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#F0F0F0]">
                  <tr>
                    <th className="p-2 text-left w-20 border-r">SKU</th>
                    <th className="p-2 text-left w-32 border-r">DIMS</th>
                    <th className="p-2 text-center bg-[#EBEBEB] text-[#6264A7] font-bold border-r">BASE</th>
                    {['G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','G13'].map(g => (
                        <th key={g} className="p-2 text-center border-r font-semibold">{g}</th>
                    ))}
                    <th className="p-2 text-center w-12 italic">Pág</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentResults.map((r, i) => (
                    <tr key={i} className="hover:bg-[#F3F2F1] transition-colors">
                      <td className="p-2 font-bold text-[#6264A7] border-r">{r.sku}</td>
                      <td className="p-2 text-[#616161] border-r whitespace-nowrap">{r.dims}</td>
                      <td className="p-2 text-center font-bold bg-[#F9F9FB] border-r">${r.g2}</td>
                      {[r.g3, r.g4, r.g5, r.g6, r.g7, r.g8, r.g9, r.g10, r.g11, r.g12, r.g13].map((val, idx) => (
                        <td key={idx} className="p-2 text-center border-r">
                          {val !== '---' ? `$${val}` : '—'}
                        </td>
                      ))}
                      <td className="p-2 text-center text-gray-400">{r.page}</td>
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