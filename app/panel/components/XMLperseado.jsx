'use client';

import { useState, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient';

/* =========================================================
    🔧 UTILIDADES DE EXTRACCIÓN (Lógica Unificada)
========================================================= */
const getCleanTag = (node) => {
  if (!node || !node.tagName) return '';
  return node.tagName.includes(':') ? node.tagName.split(':').pop() : node.tagName;
};

const getTagText = (container, tagName) => {
  const elements = container.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    if (getCleanTag(elements[i]) === tagName) {
      return elements[i].textContent?.trim() || '';
    }
  }
  return '';
};

const parseXMLToProducts = (xmlString) => {
  if (!xmlString) return [];
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'text/xml');
  
  // Mapeo de precios por Referencia
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

  const finalProducts = [];
  const seenSkus = new Set();
  for (let i = 0; i < allNodes.length; i++) {
    const container = allNodes[i];
    const sku = getTagText(container, 'ProductCode');
    if (sku && !seenSkus.has(sku)) {
      const description = getTagText(container, 'SelectionDescription') || getTagText(container, 'Description');
      const refId = getTagText(container, 'ProductRef');
      let price = getTagText(container, 'Value') || priceMap[refId] || '0';
      
      finalProducts.push({ sku, description, price: parseFloat(price) || 0, refId });
      seenSkus.add(sku);
    }
  }
  return finalProducts;
};

/* =========================================================
    🧩 COMPONENTE UNIFICADO
========================================================= */
export default function PanelMenur() {
  const [companyName, setCompanyName] = useState('');
  const [xmlContent, setXmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  // Parseo automático cuando cambia el contenido del XML
  const previewProducts = useMemo(() => parseXMLToProducts(xmlContent), [xmlContent]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setXmlContent(event.target.result);
    reader.readAsText(file);
  };

  const handleSave = async () => {
    if (!companyName.trim() || !xmlContent.trim()) {
      setStatus({ type: 'error', msg: '❌ Empresa y XML son requeridos' });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('ClientsSERVEX').insert({
        company_name: companyName,
        xml_raw: xmlContent,
        user_id: user?.id,
      });

      if (error) throw error;
      setStatus({ type: 'success', msg: '✅ Catálogo guardado correctamente' });
      // Limpiar campos tras éxito si se desea
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ Error al guardar en Supabase' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* 1. SECCIÓN SUPERIOR: CARGA Y EMPRESA */}
      <div className="bg-white p-6 border-b shadow-sm z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Nombre de la Empresa</label>
            <input
              className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ej: Lesro Industries"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Archivo XML (Arrastra o selecciona)</label>
            <input
              type="file"
              accept=".xml"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading || !xmlContent}
              className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-bold hover:bg-slate-800 disabled:opacity-40 transition-all"
            >
              {loading ? 'Guardando...' : 'Subir Catálogo'}
            </button>
          </div>
        </div>
        {status.msg && (
          <div className={`mt-4 text-center text-xs font-bold ${status.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
            {status.msg}
          </div>
        )}
      </div>

      {/* 2. SECCIÓN INFERIOR: VISTA PREVIA DEL PARSEO */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-extrabold text-slate-800">Vista Previa del Catálogo</h3>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              {previewProducts.length} Productos Detectados
            </span>
          </div>

          {!xmlContent ? (
            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center flex flex-col items-center justify-center bg-white/50">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl mb-4">📄</div>
              <p className="text-slate-400 text-sm italic font-medium">Sube un archivo   c XML para ver el desglose de precios aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previewProducts.map((p, i) => (
                <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-blue-400 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wider group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      SKU: {p.sku}
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700 leading-snug line-clamp-2 min-h-[2.5rem]">
                    {p.description}
                  </h4>
                  <div className="mt-4 pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-mono">
                    Ref ID: {p.refId || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}