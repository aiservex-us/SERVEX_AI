import re

files = [
    "/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_Excel_Tables/components/CET_Comparator.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations/components/CET_Comparator.jsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # The block we want to replace starts at `let csvArray = dbData.CSV_final;` 
    # and ends at `// Save to Supabase`
    
    start_marker = "let csvArray = dbData.CSV_final;"
    end_marker = "// Save to Supabase"
    
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    if start_idx != -1 and end_idx != -1:
        new_logic = """let csvArray = dbData.CSV_final;
      if (typeof csvArray === 'string') {
        csvArray = JSON.parse(csvArray);
      }
      
      // Dynamically detect keys based on the first row of the CSV
      const firstRow = csvArray.length > 0 ? csvArray[0] : {};
      const allKeys = Object.keys(firstRow);
      
      const skuKey = allKeys.find(k => k.toLowerCase().includes('model #') || k.toLowerCase().includes('sku')) || 'sku';
      const priceKey = allKeys.find(k => k.toLowerCase().includes('list price') || k.toLowerCase().includes('base price')) || 'Base Price';
      const descKey = allKeys.find(k => k.toLowerCase().includes('model name') || k.toLowerCase().includes('description')) || 'description';
      const classKey = allKeys.find(k => k.toLowerCase().includes('classic/ premium') || k.toLowerCase().includes('classification')) || 'classification';

      const newModels = reportData.summary.new_models_list || [];
      const deletedModels = reportData.summary.deleted_models_list || [];
      const listPriceChanges = reportData.detected_changes.filter(c => c.column_name === 'List Price') || [];
      const optionPriceChanges = reportData.detected_changes.filter(c => c.column_name !== 'List Price') || [];

      // 1. Deletions
      let updatedCSV = csvArray.filter(row => {
        if (!row[skuKey]) return true;
        return !deletedModels.some(delSku => row[skuKey] === delSku || row[skuKey].startsWith(delSku + '/'));
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
        const sku = modifiedRow[skuKey] || "";
        
        let parentSku = sku;
        if (sku.includes('/')) {
            parentSku = sku.split('/')[0];
        }

        if (lpMap.has(parentSku)) {
           const oldParentPrice = listPriceChanges.find(c => c.model_id === parentSku)?.old_value.replace(/[^0-9.-]+/g,"");
           const newParentPrice = lpMap.get(parentSku);
           if (oldParentPrice !== undefined) {
               const delta = parseFloat(newParentPrice) - parseFloat(oldParentPrice);
               const currentVal = parseFloat(modifiedRow[priceKey] || "0");
               modifiedRow[priceKey] = (currentVal + delta).toString();
           }
        }

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
                      [skuKey]: suffixSku,
                      [descKey]: `${description} [Option ${optCode}]`,
                      [classKey]: classification,
                      [priceKey]: (basePrice + optPrice).toString(),
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
                [skuKey]: sku, 
                [descKey]: description, 
                [classKey]: classification, 
                [priceKey]: basePrice.toString(), 
                ...pStatic, 
                ...productOptionPrices
              });
            }
          }
        }
      }

      // Save to Supabase
"""
        new_content = content[:start_idx] + new_logic + content[end_idx:]
        with open(file_path, "w") as f:
            f.write(new_content)

print("Dynamic keys implemented.")
