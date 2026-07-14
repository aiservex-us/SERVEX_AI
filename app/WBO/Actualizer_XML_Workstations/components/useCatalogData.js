import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export const useCatalogData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({ materials: 0, features: 0, rawNodes: 0 });
  const [catalogStats, setCatalogStats] = useState({ totalValue: 0, avgPrice: 0, currency: 'USD' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('ClientsSERVEX_WBO')
        .select('xml_raw')
        .eq('company_name', 'WBO')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.xml_raw) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.xml_raw, "text/xml");
        
        const materialCount = xmlDoc.getElementsByTagName("Material").length;
        const featureCount = xmlDoc.getElementsByTagName("Feature").length;
        const totalNodes = xmlDoc.getElementsByTagName("*").length;

        // Mapeo rápido de Features para encontrar los deltas de las opciones C y P
        const globalFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));
        const featureMap = new Map();
        for (const f of globalFeatures) {
          const fCode = f.getElementsByTagName("Code")[0]?.textContent;
          if (fCode) featureMap.set(fCode, f);
        }

        const productNodes = Array.from(xmlDoc.getElementsByTagName("Product"));
        const extracted = [];
        let totalSum = 0;
        let idCounter = 0;

        for (const p of productNodes) {
          const baseSku = p.getElementsByTagName("Code")[0]?.textContent || "N/A";
          const description = p.getElementsByTagName("Description")[0]?.textContent || "";
          const category = p.getElementsByTagName("ClassificationRef")[0]?.textContent || "General";
          const x = parseFloat(p.getElementsByTagName("X")[0]?.textContent || "0");
          const y = parseFloat(p.getElementsByTagName("Y")[0]?.textContent || "0");
          const z = parseFloat(p.getElementsByTagName("Z")[0]?.textContent || "0");
          const featuresLen = p.getElementsByTagName("FeatureRef").length;
          
          const basePrice = parseFloat(p.getElementsByTagName("Value")[0]?.textContent || "0");
          
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
                  
                  const suffixSku = `${baseSku}/${optCode}`;
                  if (!extracted.find(e => e.code === suffixSku)) {
                    const finalPrice = basePrice + optPrice;
                    extracted.push({
                      id: idCounter++,
                      code: suffixSku,
                      description: `${description} [Option ${optCode}]`,
                      price: finalPrice,
                      category, x, y, z, features: featuresLen
                    });
                    totalSum += finalPrice;
                    hasSuffixes = true;
                  }
                }
              }
            }
          }

          if (!hasSuffixes) {
            extracted.push({
              id: idCounter++,
              code: baseSku,
              description,
              price: basePrice,
              category, x, y, z, features: featuresLen
            });
            totalSum += basePrice;
          }
        }

        setMetadata({ materials: materialCount, features: featureCount, rawNodes: totalNodes });
        setProducts(extracted);
        setCatalogStats({
          totalValue: totalSum,
          avgPrice: totalSum / (extracted.length || 1),
          currency: xmlDoc.getElementsByTagName("Currency")[0]?.textContent || "USD"
        });
      }
    } catch (err) {
      console.error("Error parsing XML:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return { products, loading, catalogStats, metadata, refresh: fetchData };
};