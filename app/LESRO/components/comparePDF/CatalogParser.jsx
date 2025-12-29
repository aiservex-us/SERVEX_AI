"use client";

import React, { useState, useEffect } from 'react';

// IMPORTANTE: No importamos pdfjsLib aquí arriba de forma directa 
// para evitar que el servidor de Next intente leerlo.

const LesroPricingFix = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLib, setPdfLib] = useState(null);
  const [showModal, setShowModal] = useState(false); // ⬅️ NUEVO
  const itemsPerPage = 50;

  useEffect(() => {
    const loadLib = async () => {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      setPdfLib(pdfjs);
    };
    loadLib();
  }, []);

  const processPDF = async (file) => {
    if (!file || !pdfLib) return;
    setLoading(true);
    setCurrentPage(1);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const loadingTask = pdfLib.getDocument({ data: typedarray });
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
      } catch (err) {
        console.error("Error procesando PDF:", err);
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
    setShowModal(false);
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!pdfLib) return <div className="p-10 text-[#6264A7] font-sans">Cargando motor de sincronización...</div>;

  return (
    <div className="min-h-screen bg-[#FFF] font-sans text-[11px] text-[#242424]">
      <div className="bg-[#6264A7] p-3 shadow-md mb-4 flex items-center justify-between sticky top-0 z-50">
        <h2 className="text-white font-semibold text-[14px]">Lesro Master Sync</h2>
        {loading && <div className="text-white text-[9px] bg-[#4f508a] px-2 py-1 rounded">PROCESANDO PDF...</div>}
      </div>

      <div className="max-w-[1600px] mx-auto p-4">
        <div className="mb-6 bg-white border rounded p-6 shadow-sm flex flex-col items-center gap-4">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => processPDF(e.target.files[0])}
            className="text-[11px] file:bg-[#6264A7] file:text-white file:border-0 file:py-2 file:px-4 file:rounded file:font-bold cursor-pointer"
          />

          {results.length > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#6264A7] text-white px-4 py-2 rounded font-bold text-[11px]"
            >
              Descargar CSV
            </button>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[420px] rounded shadow-xl border">
              <div className="bg-[#6264A7] text-white p-3 font-semibold">
                Actualización de Catálogo
              </div>

              <div className="p-4 text-[12px] text-[#323130] space-y-2">
                <p>
                  Este archivo CSV será utilizado para:
                </p>
                <ul className="list-disc ml-4">
                  <li>Actualizar los datos del catálogo en la base de datos</li>
                  <li>Comparar cambios con la nueva versión del catálogo</li>
                </ul>
                <p className="text-[#605E5C]">
                  Continúa solo si este archivo será usado para sincronización oficial.
                </p>
              </div>

              <div className="flex justify-end gap-2 p-3 border-t bg-[#FAFAFA]">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 border rounded text-[11px]"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => exportToCSV(results)}
                  className="px-3 py-1 bg-[#6264A7] text-white rounded text-[11px] font-bold"
                >
                  Confirmar descarga
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TABLA SIN CAMBIOS */}
        {results.length > 0 && (
          <div className="bg-white rounded shadow-sm border border-[#E1E1E1] overflow-hidden">
            {/* ... resto del código exactamente igual */}
          </div>
        )}
      </div>
    </div>
  );
};

export default LesroPricingFix;
