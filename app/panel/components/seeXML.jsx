'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/* =========================================================
   🔧 UTILIDADES (IGUAL A PYTHON)
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
   🧠 PARSEO XML (MISMA LÓGICA QUE PYTHON)
========================================================= */

const extractProductsFromXML = (xmlString) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'text/xml');

  if (xml.getElementsByTagName('parsererror').length > 0) {
    throw new Error('Invalid XML');
  }

  const root = xml.documentElement;
  const allNodes = root.getElementsByTagName('*');

  /* -------------------------------------------------------
     1️⃣ MAPEAR PRECIOS POR PRODUCT (price_map)
  ------------------------------------------------------- */

  const priceMap = {};

  for (let node of allNodes) {
    if (getCleanTag(node) !== 'Product') continue;

    const refId =
      node.getAttribute('ID') ||
      getTextByTag(node, 'ProductRef');

    if (!refId) continue;

    let price = '';
    for (let child of node.getElementsByTagName('*')) {
      if (getCleanTag(child) === 'Price') {
        price = getTextByTag(child, 'Value');
        break;
      }
    }

    priceMap[refId] = price;
  }

  /* -------------------------------------------------------
     2️⃣ BUSCAR SKUs Y CRUZAR CON PRECIOS
  ------------------------------------------------------- */

  const products = [];
  const seenSku = new Set();

  for (let container of allNodes) {
    const sku = getTextByTag(container, 'ProductCode');
    if (!sku || seenSku.has(sku)) continue;

    const description =
      getTextByTag(container, 'SelectionDescription') ||
      getTextByTag(container, 'Description');

    const refId = getTextByTag(container, 'ProductRef');

    let price = getTextByTag(container, 'Value');
    if (!price && refId && priceMap[refId]) {
      price = priceMap[refId];
    }

    products.push({
      sku,
      description,
      base_price: price,
      ref_id: refId,
    });

    seenSku.add(sku);
  }

  return products;
};

/* =========================================================
   🧩 COMPONENTE
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
        if (!data?.[0]?.xml_raw) {
          setError('No XML found');
          return;
        }

        const parsed = extractProductsFromXML(data[0].xml_raw);
        setProducts(parsed);
      } catch (err) {
        console.error(err);
        setError('XML parse error');
      } finally {
        setLoading(false);
      }
    };

    loadXML();
  }, []);

  if (loading) {
    return <p className="px-4 py-6 text-sm text-neutral-500">Loading XML…</p>;
  }

  if (error) {
    return <p className="px-4 py-6 text-sm text-red-500">{error}</p>;
  }

  return (
    <section className="max-w-6xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-semibold mb-6">
        Parsed XML Products ({products.length})
      </h2>

      <div className="space-y-4">
        {products.map((p, i) => (
          <div
            key={i}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex justify-between gap-6">
              <div>
                <p className="font-semibold text-sm">SKU: {p.sku}</p>
                <p className="text-xs text-neutral-600 mt-1">
                  {p.description || '—'}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">
                  {p.base_price ? `$${p.base_price}` : '—'}
                </p>
                <p className="text-[11px] text-neutral-400">
                  Ref: {p.ref_id || '—'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
