"use client";

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  RefreshCw, 
  Download, 
  ShieldCheck, 
  Zap, 
  Info, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

const LesroPricingFix = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLib, setPdfLib] = useState(null); 
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
    const headers = "Page,Modelo,Dimensiones,G2,G3,G4,G5,G6,G7,G8,G9,G10,G11,G12,G13\n";
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

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!pdfLib) return <div className="p-10 text-[#6264A7] font-sans flex items-center gap-3">
    <RefreshCw className="animate-spin" size={20} />
    Loading motor de sincronización...
  </div>;

  return (
    <div className="min-h-screen bg-[#FAF9F8] font-sans text-[11px] text-[#242424]">
      {/* Header Teams */}
      <div className="bg-[#FFF] p-3 shadow-md flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded shadow-sm">
            <img src="/logo2.png" alt="SVX" className="h-4 w-auto" />
          </div>
          <h2 className="text-white font-semibold text-[14px]">Lesro Master Sync | SVX Copilot</h2>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-white text-[10px] bg-[#4f508a] px-3 py-1 rounded-full animate-pulse">
            <RefreshCw size={12} className="animate-spin" />
            PROCESSING ESTRUCTURA PDF...
          </div>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto p-6">
        
        {/* BANNER INFORMATIVO */}
        <div className="mb-8 bg-gradient-to-r from-[#6264A7] to-[#464775] rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3 bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Zap size={12} className="fill-white" /> AI-Powered Extraction
              </div>
              <h1 className="text-2xl font-bold mb-2">Sincronizador Automático de Catalogs</h1>
              <p className="text-[13px] opacity-90 leading-relaxed">
                Esta herramienta procesa el PDF oficial de Lesro, extrae los SKUs y las 12 categorías de precios (G2-G13). 
                Al finalizar, generará automáticamente un file **CSV estructurado** listo para ser importado en el motor de sincronización SVX.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 flex flex-col items-center">
              <FileSpreadsheet size={40} className="mb-2 text-green-300" />
              <span className="text-[10px] font-bold">FORMATO DE SALIDA</span>
              <span className="text-lg font-black">CSV UTF-8</span>
            </div>
          </div>
          {/* Decoración fondo */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-10">
            <RefreshCw size={200} />
          </div>
        </div>

        {/* PASOS Y CARGA */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-lg border border-[#E1DFDD] shadow-sm">
              <h3 className="font-bold text-[#6264A7] mb-4 flex items-center gap-2">
                <Info size={14} /> Guía de proceso
              </h3>
              <div className="space-y-4 relative">
                {[
                  { icon: FileText, t: "Cargar PDF", d: "Sube el catálogo de precios." },
                  { icon: RefreshCw, t: "Procesar", d: "SVX analiza SKUs y Grados." },
                  { icon: Download, t: "Descarga", d: "El CSV se bajará solo." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="bg-[#F3F2F1] p-2 rounded text-[#6264A7]">
                      <step.icon size={16} />
                    </div>
                    <div>
                      <p className="font-bold leading-none">{step.t}</p>
                      <p className="text-[10px] text-[#616161] mt-1">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FFF4CE] p-4 rounded-lg border border-[#F3D372] flex gap-3">
              <AlertCircle size={18} className="text-[#7A5407] shrink-0" />
              <p className="text-[10px] text-[#7A5407] leading-tight">
                <strong>Nota:</strong> Verifique que el PDF no esté protegido por contraseña para permitir la lectura de SKUs.
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className={`bg-white border-2 border-dashed rounded-xl p-12 transition-all flex flex-col items-center justify-center
              ${loading ? 'border-[#6264A7] bg-[#F3F2F1]' : 'border-[#C8C6C4] hover:border-[#6264A7] hover:bg-[#FAF9F8]'}`}>
              
              <div className="w-16 h-16 bg-[#6264A7]/10 rounded-full flex items-center justify-center mb-4">
                {loading ? <RefreshCw className="text-[#6264A7] animate-spin" size={32} /> : <FileUp size={32} className="text-[#6264A7]" />}
              </div>
              
              <h3 className="text-sm font-bold mb-1">Arrastra tu catálogo aquí</h3>
              <p className="text-[#616161] mb-6">Soporta formatos PDF de lista de precios Lesro</p>
              
              <input 
                type="file" 
                accept=".pdf"
                onChange={(e) => processPDF(e.target.files[0])} 
                className="text-[11px] file:bg-[#6264A7] file:text-white file:border-0 file:py-2.5 file:px-6 file:rounded-md file:font-bold cursor-pointer file:shadow-md file:hover:bg-[#4f508a] transition-all"
              />
              
              {loading && <p className="mt-4 text-[#6264A7] font-bold animate-pulse">Analizando estructura de precios...</p>}
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md border border-[#E1E1E1] overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4">
            <div className="p-4 bg-[#F8F8F8] border-b flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full border border-green-200">
                  <ShieldCheck size={14} />
                  <span className="font-bold uppercase tracking-tighter">Extracción Exitosa</span>
                </div>
                <span className="font-bold text-[#6264A7] text-[13px]">{results.length} productos detectados</span>
              </div>
              
              <div className="flex items-center space-x-3 bg-white p-1 rounded-md border border-[#EDEBE9]">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1.5 hover:bg-[#F3F2F1] rounded disabled:opacity-20 transition-colors font-bold"
                > Previous </button>
                <div className="h-4 w-[1px] bg-[#EDEBE9]"></div>
                <span className="px-2 font-medium">Page {currentPage} de {totalPages}</span>
                <div className="h-4 w-[1px] bg-[#EDEBE9]"></div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1.5 hover:bg-[#F3F2F1] rounded disabled:opacity-20 transition-colors font-bold"
                > Next </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#F3F2F1]">
                  <tr>
                    <th className="p-3 text-left border-r w-32 font-bold text-[#444]">SKU MODELO</th>
                    <th className="p-3 text-left border-r w-48 font-bold text-[#444]">DIMENSIONES</th>
                    <th className="p-3 text-center border-r bg-[#E8E8FF] text-[#6264A7] font-black italic">G2 / BASE</th>
                    {['G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','G13'].map(g => (
                      <th key={g} className="p-3 text-center border-r font-bold text-[#616161]">{g}</th>
                    ))}
                    <th className="p-3 text-center w-12 text-gray-400 font-bold">PDF P.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {currentResults.map((r, i) => (
                    <tr key={i} className="hover:bg-[#F3F2F1]/50 transition-colors group">
                      <td className="p-3 font-black text-[#6264A7] border-r text-[12px]">{r.sku}</td>
                      <td className="p-3 text-gray-500 border-r">{r.dims}</td>
                      <td className="p-3 text-center border-r font-black bg-[#F9F9FB] text-[#2B579A] text-[12px]">${r.g2}</td>
                      {[r.g3, r.g4, r.g5, r.g6, r.g7, r.g8, r.g9, r.g10, r.g11, r.g12, r.g13].map((v, idx) => (
                        <td key={idx} className="p-3 text-center border-r group-hover:bg-white transition-colors">
                          {v !== '---' ? (
                            <span className="font-semibold text-gray-700">${v}</span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      ))}
                      <td className="p-3 text-center text-gray-400 font-mono">{r.page}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer de la tabla */}
            <div className="p-4 bg-[#FAF9F8] border-t flex items-center gap-2 text-[#616161]">
              <Info size={14} />
              <p>El file CSV ha sido optimizado para la importación directa. No requiere limpieza manual de datos.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Icon para el botón de carga
const FileUp = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/>
  </svg>
);

export default LesroPricingFix;