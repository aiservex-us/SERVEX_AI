'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/* ======================================================
   🔧 PARSER XML → SKU + GRADES + OPTIONALS
====================================================== */
const parseXMLtoPIM = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  /* ================= FEATURE INDEX ================= */
  const featureIndex = {};
  [...xmlDoc.getElementsByTagName('Feature')].forEach(f => {
    const code = f.querySelector('Code')?.textContent;
    if (code) featureIndex[code] = f;
  });

  const products = [...xmlDoc.getElementsByTagName('Product')];

  return products.map((productNode) => {

    /* ================= SKU REAL ================= */
    const code =
      productNode.querySelector('MirrorProductRef')?.textContent ||
      productNode.querySelector('ProductCode')?.textContent ||
      productNode.querySelector('ProductRef')?.textContent ||
      productNode.querySelector('Code')?.textContent ||
      'N/A';

    const description =
      productNode.querySelector('SelectionDescription')?.textContent ||
      productNode.querySelector('Description')?.textContent ||
      'Sin descripción';

    const category =
      productNode.querySelector('ClassificationRef')?.textContent || 'General';

    const basePrice = parseFloat(
      productNode.querySelector('Price > Value')?.textContent || 0
    );

    /* ================= PRICE GRADES ================= */
    const gradeIncrementMap = {};

    [...productNode.getElementsByTagName('FeatureRef')].forEach(ref => {
      const feature = featureIndex[ref.textContent.trim()];
      if (!feature) return;

      const featureCode = feature.querySelector('Code')?.textContent || '';

      if (/G\d{2}/.test(featureCode)) {
        [...feature.getElementsByTagName('Option')].forEach(opt => {
          const increment = parseFloat(
            opt.querySelector('OptionPrice > Value')?.textContent || 0
          );
          if (increment > 0) {
            gradeIncrementMap[featureCode] = increment;
          }
        });
      }
    });

    const priceGrades = Array.from({ length: 12 }, (_, i) => {
      const grade = `G${String(i + 2).padStart(2, '0')}`;
      const increment = gradeIncrementMap[grade] || 0;

      return {
        grade,
        increment,
        finalPrice: basePrice + increment
      };
    });

    /* ================= OPTIONALS ================= */
    const optionals = [];

    [...productNode.getElementsByTagName('FeatureRef')].forEach(ref => {
      const feature = featureIndex[ref.textContent.trim()];
      if (!feature) return;

      const name =
        feature.querySelector('Description')?.textContent ||
        feature.querySelector('Code')?.textContent;

      const options = [...feature.getElementsByTagName('Option')]
        .map(o => ({
          code: o.querySelector('Code')?.textContent,
          desc: o.querySelector('Description')?.textContent || 'Option',
          price: parseFloat(
            o.querySelector('OptionPrice > Value')?.textContent || 0
          )
        }))
        .filter(o => o.price > 0);

      if (options.length) {
        optionals.push({ name, options });
      }
    });

    return {
      code,
      description,
      category,
      basePrice,
      priceGrades,
      optionals
    };
  });
};

/* ======================================================
   🧩 COMPONENTE PRINCIPAL
====================================================== */
const PanelPIM = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setProducts(parseXMLtoPIM(data.xml_raw));
      }
      setLoading(false);
    };
    fetchXML();
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category))],
    [products]
  );

  if (loading) {
    return <div className="p-10 text-xs font-bold">Cargando PIM...</div>;
  }

  return (
    <div className="p-6 space-y-10 bg-white">
      {categories.map(cat => (
        <section key={cat} className="space-y-4">
          <h2 className="text-xs font-black uppercase text-[#464775]">
            {cat}
          </h2>

          {products.filter(p => p.category === cat).map((product, idx) => (
            <div key={idx} className="border rounded-lg shadow-sm">

              {/* HEADER */}
              <div className="p-4 flex justify-between bg-[#F3F2F1]">
                <div>
                  <p className="text-[10px] font-black">{product.code}</p>
                  <p className="text-sm font-semibold">{product.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#464775]">
                    Base: ${product.basePrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* PRICE GRADES */}
              <div className="p-4">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-2">
                  Price Grades
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {product.priceGrades.map(g => (
                    <div
                      key={g.grade}
                      className="border rounded p-2 text-[10px] flex justify-between items-center"
                    >
                      <span>{g.grade}</span>

                      <div className="text-right">
                        <div className="font-bold">
                          ${g.finalPrice.toLocaleString()}
                        </div>
                        {g.increment > 0 && (
                          <div className="text-[9px] text-gray-400">
                            +${g.increment.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OPTIONALS */}
              {product.optionals.length > 0 && (
                <div className="p-4 space-y-4">
                  {product.optionals.map((opt, i) => (
                    <div key={i}>
                      <p className="text-[10px] font-black uppercase text-gray-400">
                        {opt.name}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {opt.options.map(o => (
                          <div
                            key={o.code}
                            className="border rounded p-2 text-[10px] flex justify-between"
                          >
                            <span>{o.desc}</span>
                            <span className="font-bold">
                              +${o.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </section>
      ))}
    </div>
  );
};

export default PanelPIM;
