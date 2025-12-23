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
        .from('ClientsSERVEX')
        .select('xml_raw')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.xml_raw) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.xml_raw, "text/xml");
        
        // Extraer métricas generales de estructura
        const materialCount = xmlDoc.getElementsByTagName("Material").length;
        const featureCount = xmlDoc.getElementsByTagName("Feature").length;
        const totalNodes = xmlDoc.getElementsByTagName("*").length;

        const productNodes = xmlDoc.getElementsByTagName("Product");
        const extracted = [];
        let totalSum = 0;

        for (let i = 0; i < productNodes.length; i++) {
          const p = productNodes[i];
          const basePrice = parseFloat(p.getElementsByTagName("Value")[0]?.textContent || "0");
          
          extracted.push({
            id: i,
            code: p.getElementsByTagName("Code")[0]?.textContent || "N/A",
            description: p.getElementsByTagName("Description")[0]?.textContent || "",
            price: basePrice,
            category: p.getElementsByTagName("ClassificationRef")[0]?.textContent || "General",
            x: parseFloat(p.getElementsByTagName("X")[0]?.textContent || "0"),
            y: parseFloat(p.getElementsByTagName("Y")[0]?.textContent || "0"),
            z: parseFloat(p.getElementsByTagName("Z")[0]?.textContent || "0"),
            features: p.getElementsByTagName("FeatureRef").length
          });
          totalSum += basePrice;
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