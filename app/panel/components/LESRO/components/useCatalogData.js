import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export const useCatalogData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const productNodes = xmlDoc.getElementsByTagName("Product");
        const extracted = [];
        let totalSum = 0;

        for (let i = 0; i < productNodes.length; i++) {
          const p = productNodes[i];
          const basePrice = parseFloat(p.getElementsByTagName("Value")[0]?.textContent || "0");
          const category = p.getElementsByTagName("ClassificationRef")[0]?.textContent || "General";
          
          extracted.push({
            code: p.getElementsByTagName("Code")[0]?.textContent || "N/A",
            description: p.getElementsByTagName("Description")[0]?.textContent || "",
            price: basePrice,
            category: category,
            dimensions: `${p.getElementsByTagName("X")[0]?.textContent || 0}x${p.getElementsByTagName("Y")[0]?.textContent || 0}`,
          });
          totalSum += basePrice;
        }

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

  return { products, loading, catalogStats, refresh: fetchData };
};