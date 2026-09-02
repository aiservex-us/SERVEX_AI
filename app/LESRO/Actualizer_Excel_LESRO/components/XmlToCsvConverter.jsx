'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, FileUp, Database, Sparkles, FileText, X } from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';
import Papa from 'papaparse';

export default function XmlToCsvConverter() {
  const [products, setProducts] = useState([]);
  const [optionHeaders, setOptionHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  
  const fileInputRef = useRef(null);

  const baseHeaders = ["SKU", "Description", "Classification", "Base Price"];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFileName(file.name);
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlString = event.target.result;
      processXMLString(xmlString);
    };
    reader.onerror = () => {
      setError("Error reading file");
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const processXMLString = (xmlString) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) throw new Error("Error parsing XML structure. Ensure it is a valid XML file.");

      const globalFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const featureMap = new Map();
      const allPossibleOptionsMap = new Map();

      for (const f of globalFeatures) {
        const fCode = f.getElementsByTagName("Code")[0]?.textContent;
        if (fCode) {
          featureMap.set(fCode, f);
        }
      }
      
      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
      const extracted = [];

      for (const p of productsXML) {
        const featureRefs = Array.from(p.getElementsByTagName("FeatureRef"));
        for (const ref of featureRefs) {
          const refCode = ref.textContent;
          const featureNode = featureMap.get(refCode);
          if (featureNode) {
            const options = Array.from(featureNode.getElementsByTagName("Option"));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent;
              if (optCode !== "C" && optCode !== "P") {
                if (optCode) allPossibleOptionsMap.set(optCode, optCode);
              }
            }
          }
        }
      }

      const dynamicOptionHeaders = Array.from(allPossibleOptionsMap.keys()).sort();
      setOptionHeaders(dynamicOptionHeaders);

      for (const p of productsXML) {
        const sku = p.getElementsByTagName("Code")[0]?.textContent || "";
        const description = p.getElementsByTagName("Description")[0]?.textContent || "";
        const classification = p.getElementsByTagName("ClassificationRef")[0]?.getElementsByTagName("Code")[0]?.textContent 
          || p.getElementsByTagName("ClassificationRef")[0]?.textContent 
          || "N/A";
        
        const priceElement = p.getElementsByTagName("Price")[0];
        const basePrice = priceElement ? parseFloat(priceElement.getElementsByTagName("Value")[0]?.textContent || "0") : 0;

        const featureRefs = Array.from(p.getElementsByTagName("FeatureRef"));
        let hasSuffixes = false;
        
        const productOptionPrices = {};
        for (const ref of featureRefs) {
          const refCode = ref.textContent;
          const featureNode = featureMap.get(refCode);
          if (featureNode) {
            const options = Array.from(featureNode.getElementsByTagName("Option"));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent;
              if (optCode !== "C" && optCode !== "P") {
                const optPriceElem = opt.querySelector("OptionPrice > Value");
                const optPrice = optPriceElem ? parseFloat(optPriceElem.textContent || "0") : 0;
                if (optCode) productOptionPrices[optCode] = optPrice;
              }
            }
          }
        }
        
        for (const ref of featureRefs) {
          const refCode = ref.textContent;
          const featureNode = featureMap.get(refCode);
          if (featureNode) {
            const options = Array.from(featureNode.getElementsByTagName("Option"));
            for (const opt of options) {
              const optCode = opt.getElementsByTagName("Code")[0]?.textContent;
              if (optCode === "C" || optCode === "P") {
                const optPriceElem = opt.querySelector("OptionPrice > Value");
                const optPrice = optPriceElem ? parseFloat(optPriceElem.textContent || "0") : 0;
                
                const suffixSku = `${sku}/${optCode}`;
                if (!extracted.find(e => e.sku === suffixSku)) {
                  extracted.push({
                    sku: suffixSku,
                    description: `${description} [Option ${optCode}]`,
                    classification,
                    basePrice: basePrice + optPrice,
                    ...productOptionPrices
                  });
                  hasSuffixes = true;
                }
              }
            }
          }
        }
        
        if (!hasSuffixes) {
          extracted.push({
            sku,
            description,
            classification,
            basePrice,
            ...productOptionPrices
          });
        }
      }

      setProducts(extracted);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    if (products.length === 0) return;
    
    const allHeaders = [...baseHeaders, ...optionHeaders];
    
    const dataForCsv = products.map(prod => {
      const row = {
        "SKU": prod.sku,
        "Description": prod.description,
        "Classification": prod.classification,
        "Base Price": prod.basePrice
      };
      optionHeaders.forEach(opt => {
        row[opt] = prod[opt] !== undefined ? prod[opt] : "0";
      });
      return row;
    });

    const csv = Papa.unparse(dataForCsv);
    
    // AUTO-SAVE to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('ClientsSERVEX_LESRO')
          .update({ csv_raw: dataForCsv })
          .eq('user_id', user.id);
        if (error) console.error("Error auto-saving CSV Base:", error);
      }
    } catch(e) {
      console.error("Error auto-saving CSV Base:", e);
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanFileName = fileName.replace('.xml', '');
    link.download = `${cleanFileName}_converted.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearData = () => {
    setProducts([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#242424] antialiased">
      <div className="max-w-[1400px] mx-auto p-8">
        
        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#EDEBE9] pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white border border-[#EDEBE9] shadow-sm p-1.5 rounded">
                <Database size={14} className="text-[#003873]" />
              </div>
              <span className="text-[#616161] font-semibold uppercase tracking-wider text-[10px]">Excel Actualizer</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#242424] tracking-tight">XML to CSV Converter</h1>
            <p className="text-[13px] text-[#616161] mt-1 max-w-xl">
              Upload your resulting XML file to automatically generate a CSV file with the exact structure required by the system.
            </p>
          </div>
          
          <div className="flex gap-4">
            <input 
              type="file" 
              accept=".xml" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            {products.length === 0 ? (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-[#003873] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#002244] transition-all shadow-md hover:shadow-lg"
              >
                <FileUp size={16} />
                Upload XML
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={clearData}
                  className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-4 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-red-50 transition-all shadow-sm"
                >
                  <X size={16} />
                  Clear
                </button>
                <button 
                  onClick={exportToCSV}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
                >
                  <Download size={16} />
                  Export to CSV
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-3">
            <X size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="flex items-center justify-center p-20 bg-white border border-[#EDEBE9] rounded-xl shadow-sm">
            <div className="flex flex-col items-center gap-4">
              <Sparkles className="animate-spin text-[#003873]" size={32} />
              <p className="text-sm text-[#616161]">Parsing XML file...</p>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && products.length === 0 && !error && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-24 bg-white border-2 border-dashed border-[#EDEBE9] rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group"
          >
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileUp size={28} className="text-[#616161]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#242424] mb-2">Drag and drop or click to upload</h3>
            <p className="text-[13px] text-[#616161]">Support for valid CET Designer XML files</p>
          </div>
        )}

        {/* RESULTS TABLE */}
        {!loading && products.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-[#EDEBE9] overflow-hidden flex flex-col h-[600px]"
          >
            <div className="p-4 border-b border-[#EDEBE9] bg-[#F5F5F5] flex justify-between items-center">
              <div className="flex items-center gap-3 text-[#242424]">
                <FileText size={16} className="text-[#003873]" />
                <span className="font-semibold text-sm">Preview: {fileName}</span>
              </div>
              <div className="text-xs text-[#616161] bg-white px-3 py-1 rounded-full border border-[#EDEBE9]">
                Showing first 50 of {products.length} rows
              </div>
            </div>
            
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <tr>
                    <th className="py-3 px-4 text-[10px] uppercase font-bold text-[#616161] border-b border-[#EDEBE9] border-r bg-[#F8F8F8] whitespace-nowrap min-w-[50px] text-center">#</th>
                    {baseHeaders.map(h => (
                      <th key={h} className="py-3 px-4 text-[10px] uppercase font-bold text-[#616161] border-b border-[#EDEBE9] border-r bg-[#F8F8F8] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    {optionHeaders.map(h => (
                      <th key={h} className="py-3 px-4 text-[10px] uppercase font-bold text-[#003873] border-b border-[#EDEBE9] border-r bg-[#F5F6FA] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[11.5px] text-[#242424]">
                  {products.slice(0, 50).map((p, idx) => (
                    <tr key={idx} className="border-b border-[#EDEBE9] hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 border-r border-[#EDEBE9] text-center text-[#616161] font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-4 border-r border-[#EDEBE9] font-medium">{p.sku}</td>
                      <td className="py-2.5 px-4 border-r border-[#EDEBE9] truncate max-w-[200px]" title={p.description}>{p.description}</td>
                      <td className="py-2.5 px-4 border-r border-[#EDEBE9] text-[#616161]">{p.classification}</td>
                      <td className="py-2.5 px-4 border-r border-[#EDEBE9] font-semibold text-green-700">${p.basePrice?.toFixed(2)}</td>
                      {optionHeaders.map(opt => (
                        <td key={opt} className={`py-2.5 px-4 border-r border-[#EDEBE9] text-right font-mono
                          ${p[opt] ? 'text-[#242424]' : 'text-slate-300'}`}>
                          {p[opt] ? `$${p[opt].toFixed(2)}` : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
