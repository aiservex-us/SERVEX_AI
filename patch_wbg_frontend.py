import re
import os

files_to_patch = [
    "/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_XML_Graphics/components/perceo_XML_MASTER_pre_prosses.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_XML_Graphics/components/perceo_XML_MASTER_post_prcess.jsx"
]

for file_path in files_to_patch:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, "r") as f:
        content = f.read()
        
    # We want to replace the product loop logic.
    old_loop = """      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
      const extracted = [];

      for (const p of productsXML) {
        const sku = p.getElementsByTagName("Model")[0]?.textContent || "Unknown SKU";
        const description = p.getElementsByTagName("Description")[0]?.textContent || "Sin descripción";
        
        const classification = p.getElementsByTagName("ClassificationRef")[0]?.getElementsByTagName("Code")[0]?.textContent 
          || p.getElementsByTagName("ClassificationRef")[0]?.textContent 
          || "N/A";
        
        // Extracción del valor numérico del precio base (<Price><Value>...</Value></Price>)
        const priceElement = p.getElementsByTagName("Price")[0];
        const basePrice = priceElement ? parseFloat(priceElement.getElementsByTagName("Value")[0]?.textContent || "0") : 0;

        extracted.push({
          sku,
          description,
          classification,
          basePrice
        });
      }"""

    new_loop = """      // 1. Mapear todos los Features globales para búsqueda rápida (O(1))
      const globalFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
      const featureMap = new Map();
      for (const f of globalFeatures) {
        const fCode = f.getElementsByTagName("Code")[0]?.textContent;
        if (fCode) featureMap.set(fCode, f);
      }

      const productsXML = Array.from(xmlDoc.getElementsByTagName("Product"));
      const extracted = [];

      for (const p of productsXML) {
        const sku = p.getElementsByTagName("Model")[0]?.textContent || "Unknown SKU";
        const description = p.getElementsByTagName("Description")[0]?.textContent || "Sin descripción";
        
        const classification = p.getElementsByTagName("ClassificationRef")[0]?.getElementsByTagName("Code")[0]?.textContent 
          || p.getElementsByTagName("ClassificationRef")[0]?.textContent 
          || "N/A";
        
        // Extracción del valor numérico del precio base (<Price><Value>...</Value></Price>)
        const priceElement = p.getElementsByTagName("Price")[0];
        const basePrice = priceElement ? parseFloat(priceElement.getElementsByTagName("Value")[0]?.textContent || "0") : 0;

        // 2. Extraer opciones /C y /P buscando en sus FeatureRefs
        const featureRefs = Array.from(p.getElementsByTagName("FeatureRef"));
        let hasSuffixes = false;
        
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
                    basePrice: basePrice + optPrice
                  });
                  hasSuffixes = true;
                }
              }
            }
          }
        }
        
        // Si no tiene sufijos C o P, entonces añadimos el producto base
        if (!hasSuffixes) {
          extracted.push({
            sku,
            description,
            classification,
            basePrice
          });
        }
      }"""

    if old_loop in content:
        content = content.replace(old_loop, new_loop)
    else:
        print(f"WARNING: Could not find loop in {file_path}")
        
    with open(file_path, "w") as f:
        f.write(content)
