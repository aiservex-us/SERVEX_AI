'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { FileSpreadsheet, Loader2, DatabaseZap, CheckCircle2, Search } from 'lucide-react';

const CSV_COLUMNS = [
  "Model #", "2026 List Price", "Weight", "Classic/ Premium", "Model Name", 
  "Top", "Casebody", "Top D", "Top L", "Casebody W", "Casebody D", "OA H", 
  "Assembly", "Deadbolt Lock(s)", "# of Optional Locks Required", 
  "3, 6, 9, 12 Replacement Tote Trays", "Tote Tray Lid", "Power Supply Modules", 
  "Hemisphere (only power option available for Mini Nucleus) (-HEM)", 
  "Connecting Magnets for HangOut Stools 2 Locations (-2MA)", 
  "Connecting Magnets for HangOut Stools 4 Locations (-4MA)", 
  "Connecting Magnets for HangOut Stools 6 Locations (-6MA)", 
  "Connecting Magnets for HangOut Stools 8 Locations (-8MA)", 
  "Premium Armor Edge™ Colors (-S2_)", "Non-Standard Edge Band", 
  "Premium Laminate Top Upcharge for Workstations", 
  "Markerboard 48 x 48 60 x 60 48 x 84 (-__MB)", 
  "Chemical Resistant 48 x 48, 60 x 60 48 x 84 (-09C)", "Custom Sizes"
];

export default function XMLResultsWBO() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAndParseXML = async () => {
      try {
        const { data, error } = await supabase
          .from('ClientsSERVEX_WBO')
          .select('XM_CET_import')
          .eq('company_name', 'WBO')
          .maybeSingle();

        if (error) {
          console.error("DB Fetch Error:", error);
          setLoading(false);
          return;
        }

        if (data && data.XM_CET_import) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data.XM_CET_import, "text/xml");
          
          const productNodes = xmlDoc.getElementsByTagName("Product");
          const parsedProducts = [];

          for (let i = 0; i < productNodes.length; i++) {
            const pNode = productNodes[i];
            
            // Extract standard fields
            const codeNode = pNode.querySelector("Code");
            const modelNum = codeNode ? codeNode.textContent : "N/A";
            
            const priceNode = pNode.querySelector("Price > Value");
            const price = priceNode ? priceNode.textContent : "0";
            
            const descNode = pNode.querySelector("Description");
            const modelName = descNode ? descNode.textContent : "N/A";

            // Features extraction (Generic Mapping for now)
            const featureRefs = [...pNode.getElementsByTagName("FeatureRef")].map(f => f.textContent);
            const materials = [...pNode.getElementsByTagName("MaterialRef")].map(m => m.textContent);

            // Create a mapping object aligned with CSV_COLUMNS
            const rowData = {
              "Model #": modelNum,
              "2026 List Price": `$${parseFloat(price).toFixed(2)}`,
              "Weight": "N/A", // Not explicitly standard in XML without heuristic
              "Classic/ Premium": "N/A",
              "Model Name": modelName,
              "Top": materials[0] || "N/A", // Arbitrary assignment for visualization
              "Casebody": materials[1] || "N/A",
              "Top D": "N/A",
              "Top L": "N/A",
              "Casebody W": "N/A",
              "Casebody D": "N/A",
              "OA H": "N/A",
              "Assembly": "N/A",
              "Deadbolt Lock(s)": "N/A",
              "# of Optional Locks Required": "N/A",
              "3, 6, 9, 12 Replacement Tote Trays": "N/A",
              "Tote Tray Lid": "N/A",
              "Power Supply Modules": "N/A",
              "Hemisphere (only power option available for Mini Nucleus) (-HEM)": "N/A",
              "Connecting Magnets for HangOut Stools 2 Locations (-2MA)": "N/A",
              "Connecting Magnets for HangOut Stools 4 Locations (-4MA)": "N/A",
              "Connecting Magnets for HangOut Stools 6 Locations (-6MA)": "N/A",
              "Connecting Magnets for HangOut Stools 8 Locations (-8MA)": "N/A",
              "Premium Armor Edge™ Colors (-S2_)": "N/A",
              "Non-Standard Edge Band": "N/A",
              "Premium Laminate Top Upcharge for Workstations": "N/A",
              "Markerboard 48 x 48 60 x 60 48 x 84 (-__MB)": "N/A",
              "Chemical Resistant 48 x 48, 60 x 60 48 x 84 (-09C)": "N/A",
              "Custom Sizes": "N/A",
              
              // Hidden internal array for search matching
              _rawFeatures: featureRefs.join(" | ")
            };

            parsedProducts.push(rowData);
          }
          
          setProducts(parsedProducts);
        }
      } catch (err) {
        console.error("XML Parsing Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndParseXML();
  }, []);

  const filteredProducts = products.filter(p => 
    p["Model #"].toLowerCase().includes(searchTerm.toLowerCase()) ||
    p["Model Name"].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#FDFDFD] text-[#242424] font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#464775]/10 rounded-md flex items-center justify-center">
            <FileSpreadsheet className="text-[#464775]" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#242424]">WBO Tabular Catalog</h1>
            <p className="text-[11px] text-[#616161]">Live extraction from CET XML Database</p>
          </div>
        </div>
        <div className="flex gap-4">
           {loading ? (
             <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
               <Loader2 className="animate-spin" size={14} /> Parsing XML...
             </div>
           ) : (
             <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
               <CheckCircle2 size={14} /> {products.length} Products Found
             </div>
           )}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="p-4 bg-[#FAF9F8] border-b border-gray-200 flex justify-between items-center shrink-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search by Model # or Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-lg border border-gray-200 bg-white pl-9 pr-4 py-2 outline-none focus:border-[#464775] transition-colors"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <DatabaseZap size={40} className="mb-4 text-[#464775] animate-pulse" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#464775]">Loading Data Matrix...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <FileSpreadsheet size={40} className="mb-4 text-[#464775]" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#464775]">No XML Data Found</p>
            <p className="text-[10px] mt-2">Please upload a CET XML file in the Ingestion module first.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead className="bg-[#FAF9F8] border-b border-gray-200">
                  <tr>
                    {CSV_COLUMNS.map((col, idx) => (
                      <th key={idx} className="px-3 py-3 font-bold text-[#464775] uppercase tracking-wider whitespace-nowrap sticky top-0 bg-[#FAF9F8] shadow-[0_1px_0_#E5E7EB]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-gray-50/80 transition-colors">
                      {CSV_COLUMNS.map((col, cIdx) => (
                        <td key={cIdx} className={`px-3 py-2.5 whitespace-nowrap ${cIdx === 0 ? 'font-bold text-[#464775] sticky left-0 bg-white/90 backdrop-blur shadow-[1px_0_0_#E5E7EB]' : 'text-gray-600'}`}>
                          {row[col]}
                        </td>
                      ))}
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
}
