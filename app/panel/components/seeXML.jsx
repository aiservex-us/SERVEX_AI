'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/* =========================================================
   🔧 UTILIDADES (idénticas a Python)
========================================================= */

const getCleanTag = (node) => {
  if (!node || !node.tagName) return '';
  return node.tagName.includes(':')
    ? node.tagName.split(':').pop()
    : node.tagName;
};

const getTextByTag = (container, tagName) => {
  if (!container) return '';
  const nodes = container.getElementsByTagName('*');
  for (let el of nodes) {
    if (getCleanTag(el) === tagName) {
      return el.textContent?.trim() || '';
    }
  }
  return '';
};

/* =========================================================
   🧠 PARSEO XML — PORT EXACTO DEL SCRIPT PYTHON
========================================================= */

const extractProductsFromXML = (xmlString) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'text/xml');

  if (xml.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Invalid XML');
  }

  const root = xml.documentElement;

  /* =========================================
     1️⃣ PRICE MAP (igual que Python)
  ========================================= */

  const priceMap = {};
  const allNodes = root.getElementsByTagName('*');

  for (let node of allNodes) {
    if (getCleanTag(node) === 'Product') {
      const productId =
        node.getAttribute('ID') || getTextByTag(node, 'ProductRef');

      let priceVal = '';

      for (let child of node.getElementsByTagName('*')) {
        if (getCleanTag(child) === 'Price') {
          priceVal = getTextByTag(child, 'Value');
          break;
        }
      }

      if (productId) {
        priceMap[productId] = priceVal;
      }
    }
  }

  /* =========================================
     2️⃣ EXTRAER PRODUCTOS (NO desde <Product>)
  ========================================= */

  const finalProducts = [];

  for (let container of allNodes) {
    const sku = getTextByTag(container, 'ProductCode');
    if (!sku) continue;

    const description =
      getTextByTag(container, 'SelectionDescription') ||
      getTextByTag(container, 'Description');

    const refId = getTextByTag(container, 'ProductRef');

    let price = getTextByTag(container, 'Value');
    if (!price && refId && priceMap[refId]) {
      price = priceMap[refId];
    }

    if (!finalProducts.some((p) => p.sku === sku)) {
      finalProducts.push({
        sku,
        description,
        base_price: price,
        ref_id: refId,
      });
    }
  }

  return finalProducts;
};

/* =========================================================
   🧩 COMPONENTE — SOLO LECTURA
========================================================= */

export default function ParsedXMLViewer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadXML = async () => {
      try {
        const { data, error } = await supabase
          .from('ClientsSERVEX')
          .select('xml_raw')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (!data || !data.length || !data[0].xml_raw) {
          setError('No XML found');
          return;
        }

        const parsed = extractProductsFromXML(data[0].xml_raw);
        setProducts(parsed);
      } catch (err) {
        console.error('XML PARSE ERROR:', err);
        setError('Error parsing XML');
      } finally {
        setLoading(false);
      }
    };

    loadXML();
  }, []);

  if (loading) {
    return <p className="text-sm text-neutral-500 px-4 py-6">Loading XML…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-500 px-4 py-6">{error}</p>;
  }

  return (
    <section className="w-full max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-semibold mb-6">
        Parsed XML Products ({products.length})
      </h2>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={index}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-sm font-semibold text-black">
                  SKU: {product.sku}
                </p>
                <p className="text-xs text-neutral-600 mt-1">
                  {product.description || 'No description'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">
                  {product.base_price ? `$${product.base_price}` : '—'}
                </p>
                <p className="text-[11px] text-neutral-400">
                  Ref: {product.ref_id || '—'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
