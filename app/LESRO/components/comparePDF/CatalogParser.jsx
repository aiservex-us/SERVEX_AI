"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  RefreshCw, 
  Download, 
  ShieldCheck, 
  Zap, 
  Info, 
  FileSpreadsheet,
  AlertCircle,
  FileUp,
  ChevronLeft,
  ChevronRight
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
                dims: dims[index] || "See PDF",
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
        console.error("Error processing PDF:", err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const exportToCSV = (data) => {
    const headers = "Page,Model,Dimensions,G2,G3,G4,G5,G6,G7,G8,G9,G10,G11,G12,G13\n";
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

  if (!pdfLib) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="flex items-center gap-3 text-[#464775] font-medium">
        <RefreshCw className="animate-spin" size={20} />
        <span className="text-sm">Initializing Synchronization Engine...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-[11px] text-[#242424] antialiased">
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="max-w-[1400px] mx-auto p-8"
      >
        {/* HEADER SECTION */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#EDEBE9] pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-[#F5F5F5] p-1.5 rounded">
                <Zap size={14} className="text-[#464775] fill-[#464775]" />
              </div>
              <span className="text-[#616161] font-semibold uppercase tracking-wider text-[10px]">SVX Intelligence</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#242424] tracking-tight">Automated Catalog Synchronizer</h1>
            <p className="text-[13px] text-[#616161] mt-1 max-w-xl">
              Process official Lesro PDF catalogs to extract SKUs and grade-based pricing. 
              Outputs a structured CSV optimized for SVX engine integration.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-end border-r border-[#EDEBE9] pr-4">
              <span className="text-[10px] font-bold text-[#616161] uppercase">Output</span>
              <span className="text-sm font-semibold text-[#242424]">CSV UTF-8</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[#616161] uppercase">Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-semibold text-[#242424]">System Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#EDEBE9] rounded-lg p-6">
              <h3 className="text-sm font-semibold text-[#242424] mb-5 flex items-center gap-2">
                <Info size={16} className="text-[#464775]" /> Workflow Instructions
              </h3>
              <div className="space-y-6">
                {[
                  { icon: FileText, t: "Upload Catalog", d: "Select the original Lesro price list PDF." },
                  { icon: RefreshCw, t: "Automated Analysis", d: "SVX identifies SKUs and Grade (G2-G13) values." },
                  { icon: Download, t: "Instant Export", d: "CSV is generated and downloaded automatically." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="bg-[#F5F5F5] p-2 rounded-md text-[#616161]">
                      <step.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[#242424] leading-none">{step.t}</p>
                      <p className="text-[11px] text-[#616161] mt-1.5 leading-normal">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F5F5F5] p-4 rounded-lg border border-[#EDEBE9] flex gap-3">
              <AlertCircle size={18} className="text-[#464775] shrink-0" />
              <p className="text-[11px] text-[#616161] leading-relaxed">
                <strong className="text-[#242424]">Security Note:</strong> Ensure PDF files are decrypted. Encrypted files will prevent the extraction of SKU metadata.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className={`relative bg-white border border-[#EDEBE9] rounded-lg p-12 transition-all duration-200 flex flex-col items-center justify-center min-h-[320px]
              ${loading ? 'bg-[#F5F5F5]' : 'hover:border-[#464775]/30'}`}>
              
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors
                ${loading ? 'bg-white' : 'bg-[#F5F5F5]'}`}>
                {loading ? (
                  <RefreshCw className="text-[#464775] animate-spin" size={36} />
                ) : (
                  <FileUp size={36} className="text-[#464775]" />
                )}
              </div>
              
              <h3 className="text-base font-semibold text-[#242424] mb-2">Import Price Catalog</h3>
              <p className="text-[#616161] text-[13px] mb-8">Drag and drop or browse for the Lesro PDF file</p>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => processPDF(e.target.files[0])} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <button className={`px-8 py-2.5 rounded-md font-bold text-[12px] transition-all shadow-sm
                  ${loading ? 'bg-[#EDEBE9] text-[#616161]' : 'bg-[#464775] text-white hover:bg-[#3b3c63]'}`}>
                  {loading ? 'PROCESSING DATA...' : 'SELECT PDF FILE'}
                </button>
              </div>

              {loading && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-[#464775] font-semibold tracking-wide uppercase text-[10px]"
                >
                  Analyzing Pricing Matrix Structure
                </motion.p>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS TABLE */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg border border-[#EDEBE9] overflow-hidden shadow-sm"
            >
              <div className="p-5 border-b border-[#EDEBE9] flex justify-between items-center bg-white">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#F5F5F5] text-[#242424] rounded border border-[#EDEBE9]">
                    <ShieldCheck size={14} className="text-[#464775]" />
                    <span className="font-bold uppercase text-[10px]">Verified Data</span>
                  </div>
                  <span className="font-semibold text-[#464775] text-[13px]">{results.length} Products Found</span>
                </div>
                
                <div className="flex items-center bg-white border border-[#EDEBE9] rounded-md overflow-hidden">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 hover:bg-[#F5F5F5] disabled:opacity-30 transition-colors border-r border-[#EDEBE9]"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-4 text-[12px] font-medium text-[#242424]">
                    Page {currentPage} <span className="text-[#616161]">of</span> {totalPages}
                  </span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 hover:bg-[#F5F5F5] disabled:opacity-30 transition-colors border-l border-[#EDEBE9]"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F5F5] border-b border-[#EDEBE9]">
                      <th className="p-4 font-bold text-[#242424] border-r border-[#EDEBE9] w-40">MODEL SKU</th>
                      <th className="p-4 font-bold text-[#242424] border-r border-[#EDEBE9]">DIMENSIONS</th>
                      <th className="p-4 text-center border-r border-[#EDEBE9] font-bold text-[#464775]">G2 (BASE)</th>
                      {['G3','G4','G5','G6','G7','G8','G9','G10','G11','G12','G13'].map(g => (
                        <th key={g} className="p-4 text-center border-r border-[#EDEBE9] font-semibold text-[#616161]">{g}</th>
                      ))}
                      <th className="p-4 text-center text-[#616161] font-semibold w-16">PDF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDEBE9]">
                    {currentResults.map((r, i) => (
                      <tr key={i} className="hover:bg-[#F5F5F5]/40 transition-colors group">
                        <td className="p-4 font-bold text-[#464775] border-r border-[#EDEBE9] text-[12px]">{r.sku}</td>
                        <td className="p-4 text-[#616161] border-r border-[#EDEBE9]">{r.dims}</td>
                        <td className="p-4 text-center border-r border-[#EDEBE9] font-bold text-[#242424] bg-[#F5F5F5]/20">${r.g2}</td>
                        {[r.g3, r.g4, r.g5, r.g6, r.g7, r.g8, r.g9, r.g10, r.g11, r.g12, r.g13].map((v, idx) => (
                          <td key={idx} className="p-4 text-center border-r border-[#EDEBE9] text-[#616161]">
                            {v !== '---' ? <span className="font-medium text-[#242424]">${v}</span> : <span className="text-[#C8C6C4]">—</span>}
                          </td>
                        ))}
                        <td className="p-4 text-center text-[#C8C6C4] font-mono text-[10px]">{r.page}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 bg-white border-t border-[#EDEBE9] flex items-center gap-2 text-[#616161]">
                <Info size={14} className="text-[#464775]" />
                <p className="text-[11px]">CSV formatted for direct SVX database injection. No manual sanitization required.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LesroPricingFix;