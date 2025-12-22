'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/* =========================================================
    🔧 UTILIDADES DE PARSEO (Similares a Python)
========================================================= */
const getCleanTag = (node) => {
  if (!node || !node.tagName) return '';
  // Elimina namespaces (ej: "ns:Product" -> "Product")
  return node.tagName.includes(':') ? node.tagName.split(':').pop() : node.tagName;
};

// Busca el texto de un tag dentro de un nodo específico (descendientes)
const getTagText = (container, tagName) => {
  const elements = container.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    if (getCleanTag(elements[i]) === tagName) {
      return elements[i].textContent?.trim() || '';
    }
  }
  return '';
};

/* =========================================================
    🧠 LÓGICA DE EXTRACCIÓN MEJORADA
========================================================= */
const extractProductsFromXML = (xmlString) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'text/xml');
  
  if (xml.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Error al leer el formato XML');
  }

  // 1. Mapear Precios (Igual que en Python: price_map)
  const priceMap = {};
  const allNodes = xml.getElementsByTagName('*');
  
  for (let i = 0; i < allNodes.length; i++) {
    const node = allNodes[i];
    if (getCleanTag(node) === 'Product') {
      const pId = node.getAttribute('ID') || getTagText(node, 'ProductRef');
      const priceVal = getTagText(node, 'Value');
      if (pId) priceMap[pId] = priceVal;
    }
  }

  // 2. Buscar Contenedores de Productos (Igual que root.iter() en Python)
  const finalProducts = [];
  const seenSkus = new Set();

  for (let i = 0; i < allNodes.length; i++) {
    const container = allNodes[i];
    // Buscamos el SKU dentro de este nodo para ver si es un "contenedor" válido
    const sku = getTagText(container, 'ProductCode');

    if (sku && !seenSkus.has(sku)) {
      const description = getTagText(container, 'SelectionDescription') || getTagText(container, 'Description');
      const refId = getTagText(container, 'ProductRef');
      
      // Lógica de precio: prioridad al valor directo, luego al mapa por refId
      let price = getTagText(container, 'Value');
      if (!price && refId && priceMap[refId]) {
        price = priceMap[refId];
      }

      finalProducts.push({
        sku,
        description,
        base_price: price,
        ref_id: refId
      });
      
      seenSkus.add(sku);
    }
  }

  return finalProducts;
};

/* =========================================================
    🧩 COMPONENTE VISUAL
========================================================= */
export default function ParsedXMLViewer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadXML = async () => {
      try {
        const { data, error: sbError } = await supabase
          .from('ClientsSERVEX')
          .select('xml_raw')
          .order('created_at', { ascending: false })
          .limit(1);

        if (sbError) throw sbError;
        if (!data?.[0]?.xml_raw) {
          setError('No se encontró el XML en la base de datos');
          return;
        }

        const parsed = extractProductsFromXML(data[0].xml_raw);
        setProducts(parsed);
      } catch (err) {
        console.error('Error detallado:', err);
        setError('Error procesando el catálogo');
      } finally {
        setLoading(false);
      }
    };

    loadXML();
  }, []);

  if (loading) return <div className="p-10 text-center font-sans">Cargando catálogo...</div>;
  if (error) return <div className="p-10 text-red-500 text-center font-sans">{error}</div>;

  return (
    <section className="max-w-6xl mx-auto py-12 px-4 font-sans bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Catálogo de Productos</h2>
          <p className="text-gray-500 mt-1">Sincronizado desde XML LESTest</p>
        </div>
        <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
          {products.length} Items
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <div key={i} className="flex flex-col border border-gray-200 rounded-xl p-6 bg-white hover:border-indigo-300 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-600 uppercase">
                SKU: {p.sku}
              </div>
              <div className="text-xl font-bold text-gray-900">
                {p.base_price ? `$${p.base_price}` : <span className="text-gray-300 text-sm italic font-normal">N/A</span>}
              </div>
            </div>

            <h3 className="text-gray-800 font-semibold text-lg leading-tight mb-2 min-h-[3rem]">
              {p.description || 'Sin descripción'}
            </h3>

            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Ref ID: <span className="font-mono">{p.ref_id || '---'}</span>
                </span>
                <span className={`h-2 w-2 rounded-full ${p.base_price ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}