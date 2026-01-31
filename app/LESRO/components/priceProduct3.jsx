'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/* ======================================================
    🔧 PARSER XML → SKU + GRADES + OPTIONALS
====================================================== */
const parseXMLtoPIM = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  // 1. Crear índice de Features para búsqueda rápida
  const featureIndex = {};
  [...xmlDoc.getElementsByTagName('Feature')].forEach(f => {
    const code = f.querySelector('Code')?.textContent;
    if (code) featureIndex[code] = f;
  });

  const products = [...xmlDoc.getElementsByTagName('Product')];

  return products.map((productNode) => {
    // Identificadores básicos
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

    /* ================= LÓGICA DE GRADES MEJORADA ================= */
    let priceGrades = [];
    const optionals = [];

    [...productNode.getElementsByTagName('FeatureRef')].forEach(ref => {
      const featureCode = ref.textContent.trim();
      const feature = featureIndex[featureCode];
      if (!feature) return;

      const featureName = feature.querySelector('Description')?.textContent || featureCode;
      const options = [...feature.getElementsByTagName('Option')];

      // Detectar si esta Feature es de "Grades" (Tapicería)
      // Buscamos palabras clave en el código o descripción del Feature
      const isGradeFeature = /GRADE|UPH|GRD/i.test(featureCode) || /Grade/i.test(featureName);

      if (isGradeFeature) {
        options.forEach(opt => {
          const optCode = opt.querySelector('Code')?.textContent || '';
          const optDesc = opt.querySelector('Description')?.textContent || '';
          const increment = parseFloat(opt.querySelector('OptionPrice > Value')?.textContent || 0);

          // Si el código o la descripción sugieren un Grado (ej: GRD2, GRADE3S, Grade 4)
          if (/GRADE|GRD|COM/i.test(optCode) || /Grade/i.test(optDesc)) {
            priceGrades.push({
              grade: optDesc, // Usamos la descripción "Grade 2" para que se vea bien
              increment: increment,
              finalPrice: basePrice + increment
            });
          }
        });
      } else {
        // Si no es un Grade, es un opcional normal (Brazos, Patas, etc.)
        const validOptions = options.map(o => ({
          code: o.querySelector('Code')?.textContent,
          desc: o.querySelector('Description')?.textContent || 'Opción',
          price: parseFloat(o.querySelector('OptionPrice > Value')?.textContent || 0)
        })).filter(o => o.price > 0);

        if (validOptions.length > 0) {
          optionals.push({ name: featureName, options: validOptions });
        }
      }
    });

    // Ordenar los grados numéricamente si es posible
    priceGrades.sort((a, b) => {
        const numA = parseInt(a.grade.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.grade.replace(/\D/g, '')) || 0;
        return numA - numB;
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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('ClientsSERVEX')
          .select('xml_raw')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data?.xml_raw) {
          setProducts(parseXMLtoPIM(data.xml_raw));
        }
      } catch (err) {
        console.error("Error cargando XML:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchXML();
  }, []);

  const categories = useMemo(
    () => [...new Set(products.map(p => p.category))],
    [products]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-sm font-bold animate-pulse text-gray-500">PROCESANDO CATÁLOGO PIM...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen space-y-12">
      {categories.map(cat => (
        <section key={cat} className="max-w-6xl mx-auto space-y-6">
          <div className="border-b-2 border-[#464775] pb-2">
            <h2 className="text-sm font-black uppercase text-[#464775] tracking-widest">
              {cat}
            </h2>
          </div>

          <div className="grid gap-6">
            {products.filter(p => p.category === cat).map((product, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                {/* HEADER PRODUCTO */}
                <div className="p-5 flex justify-between items-start bg-gray-50 border-b">
                  <div>
                    <span className="inline-block px-2 py-1 bg-white border rounded text-[10px] font-bold text-gray-500 mb-2">
                      SKU: {product.code}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800">{product.description}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Precio Base</p>
                    <p className="text-xl font-black text-[#464775]">
                      ${product.basePrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* COLUMNA GRADOS */}
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-tighter">
                      Variaciones de Tapicería (Grades)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {product.priceGrades.map((g, i) => (
                        <div key={i} className="bg-white border rounded-lg p-3 flex flex-col justify-center">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">{g.grade}</span>
                          <span className="text-sm font-bold text-gray-900">${g.finalPrice.toLocaleString()}</span>
                          {g.increment > 0 && (
                            <span className="text-[9px] text-green-600 font-medium">+{g.increment.toLocaleString()}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COLUMNA OPCIONALES */}
                  {product.optionals.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-tighter">
                        Opciones de Configuración
                      </h4>
                      <div className="space-y-4">
                        {product.optionals.map((opt, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-[9px] font-black uppercase text-gray-500 mb-2 border-b border-gray-200 pb-1">
                              {opt.name}
                            </p>
                            <div className="grid grid-cols-1 gap-1">
                              {opt.options.map(o => (
                                <div key={o.code} className="flex justify-between text-[11px] py-1">
                                  <span className="text-gray-600">{o.desc}</span>
                                  <span className="font-bold text-gray-800">+${o.price.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default PanelPIM;