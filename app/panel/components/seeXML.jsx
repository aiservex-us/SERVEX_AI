'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/* =========================================================
    🔧 UTILIDADES DE BÚSQUEDA
========================================================= */

const getCleanTag = (node) => {
  if (!node || !node.tagName) return '';
  return node.tagName.includes(':') ? node.tagName.split(':').pop() : node.tagName;
};

// Busca un tag específico dentro de los hijos directos o descendientes
const findValueByTag = (container, tagName) => {
  if (!container) return '';
  const elements = container.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    if (getCleanTag(elements[i]) === tagName) {
      return elements[i].textContent?.trim() || '';
    }
  }
  return '';
};

/* =========================================================
    🧠 LÓGICA DE PARSEO MEJORADA
========================================================= */

const extractProductsFromXML = (xmlString) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'text/xml');

  if (xml.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Error al leer el formato XML');
  }

  const allNodes = xml.getElementsByTagName('*');
  
  // 1. Crear un mapa de precios usando el ID del Producto
  // En OFDAXML, el precio suele estar en: Product -> Price -> Value
  const productDataMap = {};

  for (let i = 0; i < allNodes.length; i++) {
    const node = allNodes[i];
    if (getCleanTag(node) === 'Product') {
      const id = node.getAttribute('ID');
      if (id) {
        // Buscamos el valor del precio dentro de este producto
        const priceValue = findValueByTag(node, 'Value');
        productDataMap[id] = priceValue;
      }
    }
  }

  // 2. Buscar las entradas del catálogo (donde está el SKU/ProductCode)
  const products = [];
  const seenSku = new Set();

  for (let i = 0; i < allNodes.length; i++) {
    const node = allNodes[i];
    const tagName = getCleanTag(node);

    // Buscamos nodos que contienen referencias a productos (usualmente dentro de Selection o Catalog)
    if (tagName === 'ProductCode') {
      const parent = node.parentNode;
      const sku = node.textContent?.trim();

      if (sku && !seenSku.has(sku)) {
        // Intentamos obtener el ID de referencia que conecta con el bloque de precios
        // A veces está en un tag hermano llamado <ProductRef> o en un atributo
        const refId = findValueByTag(parent, 'ProductRef') || parent.getAttribute('ProductRef');
        
        // Buscamos la descripción
        const description = findValueByTag(parent, 'SelectionDescription') || 
                            findValueByTag(parent, 'Description');

        // Cruzamos con el mapa de precios usando el refId
        let price = '';
        if (refId && productDataMap[refId]) {
          price = productDataMap[refId];
        } else {
          // Si no hay refId, intentamos ver si el "Value" está dentro del mismo nodo actual
          price = findValueByTag(parent, 'Value');
        }

        products.push({
          sku,
          description,
          base_price: price,
          ref_id: refId || 'N/A',
        });

        seenSku.add(sku);
      }
    }
  }

  return products;
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

  if (loading) return <div className="p-10 text-center">Cargando catálogo...</div>;
  if (error) return <div className="p-10 text-red-500 text-center">{error}</div>;

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800">Catálogo de Productos</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {products.length} Items encontrados
        </span>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p, i) => (
          <div key={i} className="group border rounded-xl p-5 hover:shadow-lg transition-shadow bg-white">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
                SKU: {p.sku}
              </span>
              <span className="text-lg font-bold text-green-600">
                {p.base_price ? `$${p.base_price}` : <span className="text-gray-300 text-sm font-normal">Sin precio</span>}
              </span>
            </div>
            <h3 className="text-gray-700 font-medium mb-4 line-clamp-2 h-12">
              {p.description || 'Sin descripción'}
            </h3>
            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <span className="text-[10px] text-gray-400">ID Ref: {p.ref_id}</span>
              <button className="text-xs text-blue-500 hover:underline">Ver detalles</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}