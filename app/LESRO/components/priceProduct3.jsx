'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/* ======================================================
   🔧 PARSER PIM REAL (Feature + FeatureRef)
====================================================== */
const parseXMLtoPIM = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  const products = [...xmlDoc.getElementsByTagName('Product')];

  return products.map((productNode) => {
    const code = productNode.querySelector('Code')?.textContent || 'N/A';
    const description = productNode.querySelector('Description')?.textContent || 'Sin descripción';
    const category = productNode.querySelector('ClassificationRef')?.textContent || 'General';
    const basePrice = parseFloat(productNode.querySelector('Price > Value')?.textContent || 0);

    // ---- FEATURES DIRECTOS + REFERENCIADOS
    const directFeatures = [...productNode.getElementsByTagName('Feature')];
    const featureRefs = [...productNode.getElementsByTagName('FeatureRef')];

    const allFeatures = [
      ...directFeatures.map(f => f),
      ...featureRefs.map(ref =>
        [...xmlDoc.getElementsByTagName('Feature')]
          .find(f => f.querySelector('Code')?.textContent === ref.textContent.trim())
      )
    ].filter(Boolean);

    const features = allFeatures.map(f => {
      const id = f.querySelector('Code')?.textContent;
      const name = f.querySelector('Description')?.textContent || id;

      const options = [...f.getElementsByTagName('Option')]
        .map(o => ({
          code: o.querySelector('Code')?.textContent,
          desc: o.querySelector('Description')?.textContent || 'Opción',
          price: parseFloat(o.querySelector('OptionPrice > Value')?.textContent || 0)
        }))
        .filter(o => o.price > 0);

      return options.length ? { id, name, options } : null;
    }).filter(Boolean);

    return {
      code,
      description,
      category,
      basePrice,
      features,
      selections: {}
    };
  });
};

/* ======================================================
   💰 PRECIO TOTAL
====================================================== */
const calculateTotal = (product) => {
  return product.basePrice +
    Object.values(product.selections).reduce((sum, o) => sum + o.price, 0);
};

/* ======================================================
   🧩 COMPONENTE PRINCIPAL
====================================================== */
const PanelPIM = () => {
  const [xmlRaw, setXmlRaw] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH XML ================= */
  useEffect(() => {
    const fetchXML = async () => {
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
        setXmlRaw(data.xml_raw);
        setProducts(parseXMLtoPIM(data.xml_raw));
      }
      setLoading(false);
    };
    fetchXML();
  }, []);

  /* ================= AGRUPAR POR CATEGORÍA ================= */
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  if (loading) return <div className="p-10 text-xs font-bold">Cargando PIM...</div>;

  return (
    <div className="p-6 space-y-8 bg-white">
      {categories.map(cat => (
        <section key={cat} className="space-y-4">
          <h2 className="text-xs font-black uppercase text-[#464775]">
            {cat}
          </h2>

          {products.filter(p => p.category === cat).map((product, idx) => (
            <div key={idx} className="border rounded-lg shadow-sm">
              
              {/* HEADER PRODUCTO */}
              <div className="p-4 flex justify-between items-center bg-[#F3F2F1]">
                <div>
                  <p className="text-[10px] font-black">{product.code}</p>
                  <p className="text-sm font-semibold">{product.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#464775]">
                    $ {calculateTotal(product).toLocaleString()}
                  </p>
                  <p className="text-[9px] text-gray-500">
                    Base: $ {product.basePrice}
                  </p>
                </div>
              </div>

              {/* FEATURES / GRADOS */}
              <div className="p-4 space-y-4">
                {product.features.map(feat => (
                  <div key={feat.id}>
                    <p className="text-[9px] font-black uppercase text-gray-400">
                      {feat.name}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {feat.options.map(opt => (
                        <button
                          key={opt.code}
                          onClick={() => {
                            const updated = [...products];
                            updated[idx].selections[feat.id] = opt;
                            setProducts(updated);
                          }}
                          className={`p-2 text-[10px] rounded border flex justify-between ${
                            product.selections[feat.id]?.code === opt.code
                              ? 'border-[#464775] bg-[#F3F2F1] font-bold'
                              : 'border-[#EDEBE9]'
                          }`}
                        >
                          <span>{opt.desc}</span>
                          <span className="font-black text-[#464775]">
                            +$ {opt.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </section>
      ))}
    </div>
  );
};

export default PanelPIM;
