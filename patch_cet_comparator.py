import re

file_path = "/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_Excel_Tables/components/CET_Comparator.jsx"

with open(file_path, "r") as f:
    content = f.read()

# Add a state for applying changes
if "const [isApplyingChanges, setIsApplyingChanges]" not in content:
    content = content.replace(
        "const [isComputing, setIsComputing] = useState(false);",
        "const [isComputing, setIsComputing] = useState(false);\n  const [isApplyingChanges, setIsApplyingChanges] = useState(false);"
    )

# Add the applyDeltasToCSV function
if "const applyDeltasToCSV" not in content:
    apply_logic = """
  const applyDeltasToCSV = async () => {
    if (!reportData || !activeRecord) return;
    
    if (!confirm("Are you sure you want to apply these detected changes to the original CSV Database? This will overwrite the database directly.")) {
      return;
    }

    setIsApplyingChanges(true);

    try {
      const { data: dbData, error: dbError } = await supabase
        .from('ClientsSERVEX_WBT')
        .select('CSV_final')
        .eq('id', activeRecord.id)
        .single();
        
      if (dbError) throw dbError;
      if (!dbData.CSV_final) throw new Error("CSV_final is empty in the database. Nothing to edit.");

      let csvArray = dbData.CSV_final;
      if (typeof csvArray === 'string') {
        csvArray = JSON.parse(csvArray);
      }

      const newModels = reportData.summary.new_models_list || [];
      const deletedModels = reportData.summary.deleted_models_list || [];
      const listPriceChanges = reportData.detected_changes.filter(c => c.column_name === 'List Price') || [];
      const optionPriceChanges = reportData.detected_changes.filter(c => c.column_name !== 'List Price') || [];

      // 1. Deletions (filter out deleted parent SKUs, and also their /C or /P variants)
      let updatedCSV = csvArray.filter(row => {
        if (!row.sku) return true; // keep if no sku
        // Check if sku exactly matches or starts with deletedModel + "/"
        return !deletedModels.some(delSku => row.sku === delSku || row.sku.startsWith(delSku + '/'));
      });

      // 2. Modifications
      const lpMap = new Map();
      listPriceChanges.forEach(c => lpMap.set(c.model_id, c.new_value.replace(/[^0-9.-]+/g,"")));

      const opMap = new Map();
      optionPriceChanges.forEach(c => {
        if (!opMap.has(c.model_id)) opMap.set(c.model_id, {});
        opMap.get(c.model_id)[c.column_name] = c.new_value.replace(/[^0-9.-]+/g,"");
      });

      updatedCSV = updatedCSV.map(row => {
        let modifiedRow = { ...row };
        const sku = modifiedRow.sku || "";
        
        // Find parent sku if it's a variant
        let parentSku = sku;
        if (sku.includes('/')) {
            parentSku = sku.split('/')[0];
        }

        // Apply list price (to both parent and variants, though technically variant has a different base price mathematically, 
        // but wait! XML_Results_WBT calculates basePrice = basePrice + optPrice.
        // We will just update basePrice directly for parents. For variants, it's safer to re-calculate or just apply delta.
        // Since CET_Comparator only tracks List Price for the PARENT SKU, we add the delta to the variant as well.
        if (lpMap.has(parentSku)) {
           // Actually, if we have the new list price for the parent, we can just update the parent. 
           // For variants, we might need to know the optPrice.
           // To be safe and since listPriceChanges gives the absolute new price, we can apply it.
           // If it's a variant, let's just assume the basePrice change applies.
           // Wait, the user said "todo 1 a 1". Let's just blindly update if the SKU matches exactly, OR if we need to update variants.
           // Let's just update the exact SKU if there's no suffix in the csv, or if we map parent->variant.
           // If it's a variant, we'll calculate the difference and add it.
           const oldParentPrice = listPriceChanges.find(c => c.model_id === parentSku)?.old_value.replace(/[^0-9.-]+/g,"");
           const newParentPrice = lpMap.get(parentSku);
           if (oldParentPrice !== undefined) {
               const delta = parseFloat(newParentPrice) - parseFloat(oldParentPrice);
               const currentVal = parseFloat(modifiedRow['Base Price'] || "0");
               modifiedRow['Base Price'] = (currentVal + delta).toString();
           }
        }

        // Apply option prices
        if (opMap.has(parentSku)) {
          const ops = opMap.get(parentSku);
          for (const optCode in ops) {
            modifiedRow[optCode] = ops[optCode];
          }
        }
        return modifiedRow;
      });

      // 3. Additions
      if (newModels.length > 0 && activeRecord.XM_CET_import) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(activeRecord.XM_CET_import, 'text/xml');
        
        const globalFeatures = Array.from(doc.getElementsByTagName("Feature"));
        const featureMap = new Map();
        for (const f of globalFeatures) {
          const fCode = f.getElementsByTagName("Code")[0]?.textContent;
          if (fCode) featureMap.set(fCode, f);
        }

        const productsXML = Array.from(doc.getElementsByTagName("Product"));
        const staticFields = {
          "Weight": "-", "Classic/ Premium": "-", "Top": "-", "Casebody": "-", "Top D": "-", "Top L": "-", 
          "Casebody W": "-", "Casebody D": "-", "OA H": "-", "Assembly": "-", "Deadbolt Lock(s)": "-", 
          "# of Optional Locks Required": "-", "3, 6, 9, 12 Replacement Tote Trays": "-", "Tote Tray Lid": "-", 
          "Power Supply Modules": "-", "Hemisphere (only power option available for Mini Nucleus) (-HEM)": "-", 
          "Connecting Magnets for HangOut Stools 2 Locations (-2MA)": "-", "Connecting Magnets for HangOut Stools 4 Locations (-4MA)": "-", 
          "Connecting Magnets for HangOut Stools 6 Locations (-6MA)": "-", "Connecting Magnets for HangOut Stools 8 Locations (-8MA)": "-", 
          "Premium Armor Edge™ Colors (-S2_)": "-", "Non-Standard Edge Band": "-", "Premium Laminate Top Upcharge for Workstations": "-", 
          "Markerboard 48 x 48 60 x 60 48 x 84 (-__MB)": "-", "Chemical Resistant 48 x 48, 60 x 60 48 x 84 (-09C)": "-", "Custom Sizes": "-"
        };

        for (const p of productsXML) {
          const sku = p.getElementsByTagName("Code")[0]?.textContent;
          if (sku && newModels.includes(sku)) {
            const description = p.getElementsByTagName("Description")[0]?.textContent || "";
            const classification = p.getElementsByTagName("ClassificationRef")[0]?.getElementsByTagName("Code")[0]?.textContent 
              || p.getElementsByTagName("ClassificationRef")[0]?.textContent || "-";
            const priceElement = p.getElementsByTagName("Price")[0];
            const basePrice = priceElement ? parseFloat(priceElement.getElementsByTagName("Value")[0]?.textContent || "0") : 0;
            
            const materials = Array.from(p.getElementsByTagName("MaterialRef")).map(m => m.textContent);
            let pStatic = { ...staticFields, "Top": materials[0] || "-", "Casebody": materials[1] || "-" };

            const featureRefs = Array.from(p.getElementsByTagName("FeatureRef"));
            const productOptionPrices = {};
            let hasSuffixes = false;

            for (const ref of featureRefs) {
              const refCode = ref.textContent;
              const featureNode = featureMap.get(refCode);
              if (featureNode) {
                const options = Array.from(featureNode.getElementsByTagName("Option"));
                for (const opt of options) {
                  const optCode = opt.getElementsByTagName("Code")[0]?.textContent;
                  if (optCode !== "C" && optCode !== "P") {
                    const optDesc = opt.getElementsByTagName("Description")[0]?.textContent || optCode;
                    const optPriceElem = opt.querySelector("OptionPrice > Value");
                    const optPrice = optPriceElem ? parseFloat(optPriceElem.textContent || "0") : 0;
                    if (optDesc) productOptionPrices[optDesc] = optPrice.toString();
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
                    
                    updatedCSV.push({
                      sku: suffixSku,
                      description: `${description} [Option ${optCode}]`,
                      classification,
                      "Base Price": (basePrice + optPrice).toString(),
                      ...pStatic,
                      ...productOptionPrices
                    });
                    hasSuffixes = true;
                  }
                }
              }
            }
            if (!hasSuffixes) {
              updatedCSV.push({
                sku, description, classification, "Base Price": basePrice.toString(), ...pStatic, ...productOptionPrices
              });
            }
          }
        }
      }

      // Save to Supabase
      const { error: saveError } = await supabase
        .from('ClientsSERVEX_WBT')
        .update({ 
           CSV_final: updatedCSV,
           csv_new_raw: updatedCSV // Keep them synced just in case
        })
        .eq('id', activeRecord.id);

      if (saveError) throw saveError;
      
      alert("Changes successfully applied to CSV Database!");
    } catch (err) {
      console.error(err);
      alert(`Error applying changes: ${err.message}`);
    } finally {
      setIsApplyingChanges(false);
    }
  };
"""
    content = content.replace("const listPriceChanges = reportData?.detected_changes", apply_logic + "\n  const listPriceChanges = reportData?.detected_changes")

# Add the button to UI
button_html = """
            <button
              onClick={applyDeltasToCSV}
              disabled={isApplyingChanges}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 transition-all shadow-md ml-3"
            >
              {isApplyingChanges ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
              {isApplyingChanges ? "Applying..." : "Apply Deltas to CSV Database"}
            </button>
"""
if "Apply Deltas to CSV Database" not in content:
    # We need to insert this button next to "Execute CET Comparison" or inside the Results area.
    # The Execute button is absolutely positioned top-4 right-4. Let's put it there if reportData exists.
    # Wait, the Execute button is:
    execute_btn = """<button 
             onClick={computeComparison} 
             disabled={isComputing}
             className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-[#7f1d1d] text-white rounded-md text-xs font-semibold hover:bg-[#34355a] transition-all disabled:opacity-50 z-20 shadow-sm"
           >
             {isComputing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
             {isComputing ? "Computing Deltas..." : "Execute CET Comparison"}
           </button>"""
    
    new_buttons = """<div className="absolute top-4 right-4 flex gap-2 z-20">
             <button 
               onClick={computeComparison} 
               disabled={isComputing}
               className="flex items-center gap-2 px-4 py-2 bg-[#7f1d1d] text-white rounded-md text-xs font-semibold hover:bg-[#34355a] transition-all disabled:opacity-50 shadow-sm"
             >
               {isComputing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
               {isComputing ? "Computing Deltas..." : "Execute CET Comparison"}
             </button>
             {reportData && (
               <button
                 onClick={applyDeltasToCSV}
                 disabled={isApplyingChanges}
                 className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm"
               >
                 {isApplyingChanges ? <RefreshCw size={14} className="animate-spin" /> : <Database size={14} />}
                 {isApplyingChanges ? "Applying..." : "Apply Deltas to CSV"}
               </button>
             )}
           </div>"""
    content = content.replace(execute_btn, new_buttons)

with open(file_path, "w") as f:
    f.write(content)

print("CET_Comparator.jsx patched successfully.")
