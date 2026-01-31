'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/* ======================================================
   🔧 PARSER XML → LÓGICA DE UPCHARGES CORREGIDA
====================================================== */
const parseXMLtoPIM = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  // Indexamos las Features por su código para búsqueda rápida
  const featureIndex = {};
  const allFeatures = xmlDoc.getElementsByTagName('Feature');
  for (let f of allFeatures) {
    const fCode = f.querySelector('Code')?.textContent;
    if (fCode) featureIndex[fCode] = f;
  }

  const products = [...xmlDoc.getElementsByTagName('Product')];

  return products.map((productNode) => {
    // Identificación del SKU
    const code =
      productNode.querySelector('MirrorProductRef')?.textContent ||
      productNode.querySelector('ProductCode')?.textContent ||
      productNode.querySelector('Code')?.textContent ||
      'N/A';

    const description =
      productNode.querySelector('SelectionDescription')?.textContent ||
      productNode.querySelector('Description')?.textContent ||
      'Sin descripción';

    const category =
      productNode.querySelector('ClassificationRef')?.textContent || 'General';

    // PRECIO BASE (Pivote central)
    const basePrice = parseFloat(
      productNode.querySelector('Price > Value')?.textContent || 0
    );

    /* ================= LÓGICA DE GRADOS (UPCHARGES) ================= */
    const gradeUpcharges = {};
    const optionals = [];

    // Buscamos en las referencias de características del producto
    const featureRefs = [...productNode.getElementsByTagName('FeatureRef')];
    
    featureRefs.forEach(ref => {
      const fId = ref.textContent.trim();
      const feature = featureIndex[fId];
      if (!feature) return;

      const featureName = feature.querySelector('Description')?.textContent || fId;
      const options = [...feature.getElementsByTagName('Option')];

      let isGradeFeature = false;

      options.forEach(opt => {
        const optCode = opt.querySelector('Code')?.textContent || '';
        const upcharge = parseFloat(opt.querySelector('OptionPrice > Value')?.textContent || 0);

        // Si la opción es un Grado (G02, G03...), guardamos el incremento
        if (/^G\d{2}$/.test(optCode)) {
          gradeUpcharges[optCode] = upcharge;
          isGradeFeature = true;
        } else if (upcharge > 0) {
          // Si no es grado pero tiene precio, es un opcional (ej. Power Unit)
          if (!isGradeFeature) {
            // Evitamos duplicados de grupos de opcionales
            const existingOptGroup = optionals.find(o => o.name === featureName);
            const optData = {
              code: optCode,
              desc: opt.querySelector('Description')?.textContent || optCode,
              price: upcharge
            };
            
            if (existingOptGroup) {
              existingOptGroup.options.push(optData);
            } else {
              optionals.push({ name: featureName, options: [optData] });
            }
          }
        }
      });
    });

    // Generamos los 12 grados estándar sumando el incremento al base
    const priceGrades = Array.from({ length: 12 }, (_, i) => {
      const gradeLabel = `G${String(i + 2).padStart(2, '0')}`;
      const increment = gradeUpcharges[gradeLabel] || 0;

      return {
        grade: gradeLabel,
        increment: increment,
        finalPrice: basePrice + increment
      };
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
   🧩 COMPONENTE PRINCIPAL: PANEL PIM SERVEX_AI
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
    return (
      <div className="p-10 flex flex-col items-center justify-center space-y-3">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Iniciando Motor PIM...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-12 bg-white min-h-screen">
      {categories.map(cat => (
        <section key={cat} className="space-y-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xs font-black uppercase tracking-tighter text-blue-900 bg-blue-50 px-2 py-1 rounded">
              {cat}
            </h2>
            <div className="h-[1px] flex-1 bg-gray-100"></div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {products.filter(p => p.category === cat).map((product, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                
                {/* CABECERA DEL PRODUCTO */}
                <div className="p-4 flex justify-between items-start bg-gray-50 border-b border-gray-200">
                  <div>
                    <span className="text-[9px] font-bold text-blue-600 px-1.5 py-0.5 bg-blue-100 rounded mb-1 inline-block">
                      {product.code}
                    </span>
                    <h3 className="text-sm font-bold text-gray-800 uppercase leading-tight">
                      {product.description}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Precio Base</p>
                    <p className="text-lg font-black text-gray-900">
                      ${product.basePrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  
                  {/* COLUMNA GRADOS */}
                  <div className="p-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center">
                      <span className="mr-2">📊</span> Matriz de Grados (UPH)
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {product.priceGrades.map(g => (
                        <div key={g.grade} className="bg-white border border-gray-100 p-2 rounded flex flex-col justify-center">
                          <span className="text-[9px] font-bold text-gray-400">{g.grade}</span>
                          <span className="text-xs font-black text-gray-800">
                            ${g.finalPrice.toLocaleString()}
                          </span>
                          {g.increment > 0 && (
                            <span className="text-[8px] text-green-600 font-medium">
                              +${g.increment.toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COLUMNA OPCIONALES */}
                  <div className="p-4 bg-gray-50/30">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center">
                      <span className="mr-2">⚙️</span> Opciones Adicionales
                    </h4>
                    {product.optionals.length > 0 ? (
                      <div className="space-y-4">
                        {product.optionals.map((group, i) => (
                          <div key={i} className="space-y-1.5">
                            <p className="text-[9px] font-bold text-gray-500 uppercase italic">{group.name}</p>
                            <div className="grid grid-cols-1 gap-1">
                              {group.options.map(o => (
                                <div key={o.code} className="flex justify-between items-center text-[10px] bg-white p-2 border border-gray-100 rounded">
                                  <span className="text-gray-600">{o.desc}</span>
                                  <span className="font-bold text-blue-700">+${o.price.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-400 italic">No hay opciones de configuración extra disponibles.</p>
                    )}
                  </div>
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