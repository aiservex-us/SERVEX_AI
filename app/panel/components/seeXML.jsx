'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import ProductDetailModal from './ProductDetailModal'; // <--- Importamos el nuevo componente

/* =========================================================
    🔧 UTILIDADES (Se mantienen igual)
========================================================= */
const getCleanTag = (node) => {
  if (!node || !node.tagName) return '';
  return node.tagName.includes(':') ? node.tagName.split(':').pop() : node.tagName;
};

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
    🧠 LÓGICA DE EXTRACCIÓN (Se mantiene igual)
========================================================= */
const extractProductsFromXML = (xmlString) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'text/xml');
  const allNodes = xml.getElementsByTagName('*');
  const productFullData = {};

  for (let i = 0; i < allNodes.length; i++) {
    const node = allNodes[i];
    if (getCleanTag(node) === 'Product') {
      const id = node.getAttribute('ID');
      if (id) productFullData[id] = xmlToJson(node);
    }
  }

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
          raw_data: productFullData[refId] || null
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

  if (loading) return <div className="p-10 text-center text-gray-400 font-mono">Cargando base de datos XML...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">Catálogo Lesro</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-blue-600 font-mono text-[10px] font-black uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                   {p.sku}
                </span>
              </div>
              <h3 className="text-lg font-bold mt-4 text-gray-800 leading-snug h-14 line-clamp-2">
                {p.description}
              </h3>
              <p className="text-3xl font-black text-emerald-600 mt-2">
                {p.base_price ? `$${p.base_price}` : <span className="text-gray-300 text-sm font-normal italic uppercase">No Price</span>}
              </p>
            </div>
            
            <button 
              onClick={() => setSelectedProduct(p)}
              className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-black active:scale-95 transition-all text-sm font-semibold shadow-lg shadow-slate-200"
            >
              Ver Detalle Completo
            </button>
          </div>
        ))}
      </div>

      {/* IMPORTACIÓN DEL COMPONENTE MODAL */}
      <ProductDetailModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}