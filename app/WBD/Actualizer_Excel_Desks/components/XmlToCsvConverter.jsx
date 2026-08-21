'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, FileUp, Database, Sparkles, FileText, X } from 'lucide-react';
import Papa from 'papaparse';

export default function XmlToCsvConverter() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  
  const fileInputRef = useRef(null);

  const DESKS_HEADERS = [
    "Model #", "List Price", "Weight", "Classic/\r\nPremium", "Model Name", "Top", "Legs/Base/Casebody", 
    "\r\nTop\r\nD\"", "Top\r\nL\"", "Casebody\r\nW\"", "Casebody\r\nH\"", "Casebody\r\nD\"", "OA D\"", 
    "OA H\" \r\nw/ Glides", "OA H\" \r\nw/ Casters", "Assembly", "Locking Casters\r\n (Per Desk)\r\n (-CA)", 
    "Wheelbarrow\r\n(2 Casters)\r\n(-2CA)", "GIB Casters\r\n (-C)", "Grand Hank Glides \r\n (Per Desk)\r\n(-HG)", 
    "Soft Touch Glides \r\n (Per Desk)\r\n(-FG)", "Steel Glides \r\n (Per Desk)\r\n(-SG)", "Plastic Book Box \r\n(-P14CH)", 
    "Plastic Book Box \r\n(-P16CH)", "Plastic Book Box \r\n(-P20CH)", "Plastic Book Box \r\n(-P23CH)", "Backpack Hook (1) \r\n(-BPH)", 
    "3\" Tote\r\nTray Kit\r\n (-GK_S)", "Under Mount Tote Runners 12mm Drop (Set of 2)\r\n(-GTR)", "3\", 6\", 9\", 12\" Replacement Tote Trays", 
    "Tote Tray Lid", "Wire Basket \r\n(-LW)", "Swivel Cup Holder \r\n(-SCH)", "Connector Bar\r\n(-CB)", "Power Supply \r\nModules", 
    "Large Pencil Drawer \r\n(-LPD)", "9\"H Perforated Metal \r\nModesty Panel \r\n(-913_)", "12\"H Perforated Metal Modesty Panel \r\n(-S)", 
    "12\"H Laminate \r\nModesty Panel\r\n(-LMOD_)", "12\"H Laminate Modesty Panel\r\nCLASSIC\r\n (TDLAMMOD)", 
    "12\"H Laminate Modesty Panel\r\nPREMIUM\r\n (TDLAMMOD)", "Metal Wire Management\r\n36\", 48\", 60\" or 72\"L\r\n(-WM)", 
    "Grommet w/Cover \r\n(-GR)", "Deadbolt Lock(s)", "# of Optional Locks Required", "Premium \r\nArmor Edge™ Colors \r\n(-S2_)", 
    "Non-Standard\r\n Edge Band", "Premium Laminate\r\nUpcharge for \r\nTops UNDER 36\"x36\" ", "Premium Laminate\r\nUpcharge for\r\n Tops 36\"x36\" & OVER", 
    "Markerboard\r\nDesks\r\n(-__MB)", "Markerboard\r\nTables\r\n(-__MB)", "Chemical \r\nResistant\r\n(-09C)", "Custom Sizes"
  ];

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

      for (const f of globalFeatures) {
        const fCode = f.getElementsByTagName("Code")[0]?.textContent;
        if (fCode) {
          featureMap.set(fCode, f);
        }
      }
      
      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
      const extracted = [];

      for (const p of productsXML) {
        const sku = p.getElementsByTagName("Code")[0]?.textContent || "";
        const description = p.getElementsByTagName("Description")[0]?.textContent || "";
        
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
        
        const createRow = (baseSku, optSuffixCode, optPrice) => {
          const finalSku = optSuffixCode ? `${baseSku}/${optSuffixCode}` : baseSku;
          const finalDesc = optSuffixCode ? `${description} [Option ${optSuffixCode}]` : description;
          const finalPrice = basePrice + (optPrice || 0);

          const row = {};
          // Initialize all to "-" or 0 to match master struct
          DESKS_HEADERS.forEach(h => row[h] = "-");

          // Map base fields
          row["Model #"] = finalSku;
          row["List Price"] = finalPrice;
          row["Model Name"] = finalDesc;
          
          // These fields don't exist natively in generic XML but are required for structure
          row["Weight"] = 0;
          row["Classic/\r\nPremium"] = "-";
          row["Top"] = "-";
          row["Legs/Base/Casebody"] = "-";
          row["# of Optional Locks Required"] = 0;

          // Map extracted options to the respective columns if their code is in the header
          Object.keys(productOptionPrices).forEach(optCode => {
            const matchingHeader = DESKS_HEADERS.find(h => h.includes(`(${optCode})`) || h.includes(`-${optCode}`));
            if (matchingHeader) {
              row[matchingHeader] = productOptionPrices[optCode];
            } else if (optCode.includes('MB')) {
               // Special case for MB Markerboards
               const mbHeader = DESKS_HEADERS.find(h => h.includes("(__MB)"));
               if (mbHeader) row[mbHeader] = productOptionPrices[optCode];
            }
          });

          return row;
        };

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
                if (!extracted.find(e => e["Model #"] === suffixSku)) {
                  extracted.push(createRow(sku, optCode, optPrice));
                  hasSuffixes = true;
                }
              }
            }
          }
        }
        
        if (!hasSuffixes) {
          extracted.push(createRow(sku, null, 0));
        }
      }

      setProducts(extracted);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (products.length === 0) return;
    
    const csv = Papa.unparse(products, {
      columns: DESKS_HEADERS
    });
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
                <Database size={14} className="text-[#7f1d1d]" />
              </div>
              <span className="text-[#616161] font-semibold uppercase tracking-wider text-[10px]">WBD Desks Actualizer</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#242424] tracking-tight">XML to CSV Converter (Master Format)</h1>
            <p className="text-[13px] text-[#616161] mt-1 max-w-xl">
              Upload your WBD XML file. The generated CSV will exactly match the 53-column Master Price List structure.
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
                className="flex items-center gap-2 bg-[#7f1d1d] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#450a0a] transition-all shadow-md hover:shadow-lg"
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
              <Sparkles className="animate-spin text-[#7f1d1d]" size={32} />
              <p className="text-sm text-[#616161]">Parsing XML file & mapping to Master structure...</p>
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
            <p className="text-[13px] text-[#616161]">Support for valid CET Designer XML files (WBD Desks)</p>
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
                <FileText size={16} className="text-[#7f1d1d]" />
                <span className="font-semibold text-sm">Preview (Master Format): {fileName}</span>
              </div>
              <div className="text-xs text-[#616161] bg-white px-3 py-1 rounded-full border border-[#EDEBE9]">
                Showing first 50 of {products.length} rows (53 Columns)
              </div>
            </div>
            
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[3000px]">
                <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <tr>
                    <th className="py-3 px-4 text-[10px] uppercase font-bold text-[#616161] border-b border-[#EDEBE9] border-r bg-[#F8F8F8] whitespace-nowrap min-w-[50px] text-center">#</th>
                    {DESKS_HEADERS.map(h => (
                      <th key={h} className="py-3 px-4 text-[10px] uppercase font-bold text-[#616161] border-b border-[#EDEBE9] border-r bg-[#F8F8F8] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-[11.5px] text-[#242424]">
                  {products.slice(0, 50).map((p, idx) => (
                    <tr key={idx} className="border-b border-[#EDEBE9] hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 border-r border-[#EDEBE9] text-center text-[#616161] font-mono">{idx + 1}</td>
                      {DESKS_HEADERS.map((h, cIdx) => (
                        <td key={cIdx} className={`py-2.5 px-4 border-r border-[#EDEBE9] whitespace-nowrap ${
                          h === "List Price" ? 'font-semibold text-green-700' : 
                          (p[h] !== "-" && p[h] !== 0) ? 'font-medium' : 'text-slate-400 font-mono'
                        }`}>
                          {h === "List Price" ? `$${p[h]?.toFixed(2)}` : p[h]}
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
