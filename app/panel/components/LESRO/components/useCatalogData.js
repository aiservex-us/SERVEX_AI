import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

export const useCatalogData = () => {
  const [data, setData] = useState({
    products: [],
    materials: [],
    features: [],
    stats: {},
    loading: true
  });

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: dbData } = await supabase.from('ClientsSERVEX').select('xml_raw').eq('user_id', user.id).single();

      if (dbData?.xml_raw) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(dbData.xml_raw, "text/xml");

        // 1. Mapeo de Materiales (Calidad y Referencias)
        const materialNodes = Array.from(xmlDoc.getElementsByTagName("Material"));
        const materials = materialNodes.map(m => ({
          code: m.getElementsByTagName("Code")[0]?.textContent,
          quality: m.getElementsByTagName("Quality")[0]?.textContent || 'N/A'
        }));

        // 2. Mapeo de Productos y su Complejidad
        const productNodes = Array.from(xmlDoc.getElementsByTagName("Product"));
        let totalValue = 0;
        const products = productNodes.map(p => {
          const price = parseFloat(p.getElementsByTagName("Value")[0]?.textContent || 0);
          totalValue += price;
          return {
            code: p.getElementsByTagName("Code")[0]?.textContent,
            desc: p.getElementsByTagName("Description")[0]?.textContent,
            category: p.getElementsByTagName("ClassificationRef")[0]?.textContent || "Unassigned",
            price,
            optionsCount: p.getElementsByTagName("Option").length,
            hasDimensions: !!(p.getElementsByTagName("X")[0]?.textContent)
          };
        });

        setData({
          products,
          materials,
          featuresCount: xmlDoc.getElementsByTagName("Feature").length,
          stats: {
            totalValue,
            avgPrice: totalValue / products.length,
            totalOptions: xmlDoc.getElementsByTagName("Option").length,
            effectiveDate: xmlDoc.getElementsByTagName("EffectiveDate")[0]?.textContent
          },
          loading: false
        });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);
  return data;
};