'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/* =========================================================
    🔧 UTILIDADES DE PARSEO PROFUNDO
========================================================= */

const getCleanTag = (node) => {
  if (!node || !node.tagName) return '';
  return node.tagName.includes(':') ? node.tagName.split(':').pop() : node.tagName;
};

// Convierte un nodo XML y sus hijos en un objeto JSON para fácil visualización
const xmlToJson = (xml) => {
  let obj = {};
  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    obj = xml.nodeValue.trim();
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = getCleanTag(item);
      if (nodeName === "") continue;
      
      if (typeof obj[nodeName] === "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push === "undefined") {
          const old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
};

/* =========================================================
    🧠 LÓGICA DE EXTRACCIÓN MEJORADA
========================================================= */

const extractProductsFromXML = (xmlString) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'text/xml');
  const allNodes = xml.getElementsByTagName('*');
  
  const productFullData = {}; // Diccionario de nodos <Product> completos

  // 1. Mapear toda la información técnica de los nodos <Product>
  for (let i = 0; i < allNodes.length; i++) {
    const node = allNodes[i];
    if (getCleanTag(node) === 'Product') {
      const id = node.getAttribute('ID');
      if (id) {
        productFullData[id] = xmlToJson(node);
      }
    }
  }

  // 2. Mapear el catálogo y cruzar datos
  const products = [];
  const seenSku = new Set();

  for (let i = 0; i < allNodes.length; i++) {
    const node = allNodes[i];
    if (getCleanTag(node) === 'ProductCode') {
      const parent = node.parentNode;
      const sku = node.textContent?.trim();
      const refId = parent.getElementsByTagName('ProductRef')[0]?.textContent?.trim() || parent.getAttribute('ProductRef');

      if (sku && !seenSku.has(sku)) {
        products.push({
          sku,
          description: parent.getElementsByTagName('SelectionDescription')[0]?.textContent?.trim() || "N/A",
          base_price: productFullData[refId]?.Price?.Value || "",
          ref_id: refId,
          raw_data: productFullData[refId] || null // Guardamos TODO el objeto relacionado
        });
        seenSku.add(sku);
      }
    }
  }
  return products;
};

/* =========================================================
    🧩 COMPONENTE PRINCIPAL
========================================================= */

export default function CatalogViewer() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadXML = async () => {
      try {
        const { data } = await supabase.from('ClientsSERVEX').select('xml_raw').limit(1);
        if (data?.[0]?.xml_raw) {
          setProducts(extractProductsFromXML(data[0].xml_raw));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadXML();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Catálogo Completo Lesro</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <div key={i} className="bg-white border rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-blue-600 font-mono text-xs font-bold uppercase">{p.sku}</span>
              <h3 className="text-lg font-semibold mt-1 text-gray-800 leading-tight">{p.description}</h3>
              <p className="text-2xl font-black text-green-600 mt-4">
                {p.base_price ? `$${p.base_price}` : 'Consultar'}
              </p>
            </div>
            
            <button 
              onClick={() => setSelectedProduct(p)}
              className="mt-6 w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-medium"
            >
              Ver Detalle Completo
            </button>
          </div>
        ))}
      </div>

      {/* MODAL / PANEL DE DETALLE */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto p-8 animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Información Técnica</h2>
              <button onClick={() => setSelectedProduct(null)} className="text-3xl">&times;</button>
            </div>

            <div className="space-y-6">
              <section className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 font-bold uppercase tracking-widest">Producto Seleccionado</p>
                <p className="text-xl font-bold">{selectedProduct.description}</p>
                <p className="text-sm text-blue-600">SKU: {selectedProduct.sku}</p>
              </section>

              <section>
                <h4 className="font-bold border-b pb-2 mb-4">Estructura de Precios (XML Data)</h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify(selectedProduct.raw_data, null, 2)}</pre>
                </div>
              </section>
              
              <section className="text-sm text-gray-500 italic">
                * El visor de arriba muestra todos los campos encontrados en el nodo &lt;Product&gt; relacionado, incluyendo descuentos, factores de precio y referencias externas.
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}