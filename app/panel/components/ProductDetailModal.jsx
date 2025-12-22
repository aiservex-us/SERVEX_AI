'use client';

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto p-8 animate-in slide-in-from-right">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Detalles Técnicos XML</h2>
          <button 
            onClick={onClose} 
            className="text-3xl text-gray-400 hover:text-black transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="space-y-6">
          {/* Cabecera del Producto */}
          <section className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <p className="text-xs text-blue-700 font-bold uppercase tracking-widest mb-1">
              Producto Seleccionado
            </p>
            <p className="text-2xl font-bold text-blue-900">{product.description}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-sm font-mono bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                SKU: {product.sku}
              </span>
              <span className="text-sm font-mono bg-green-200 text-green-800 px-2 py-0.5 rounded">
                REF: {product.ref_id}
              </span>
            </div>
          </section>

          {/* Bloque de Datos Crudos */}
          <section>
            <h4 className="font-bold text-gray-700 border-b pb-2 mb-4">
              Contenido Completo del Nodo &lt;Product&gt;
            </h4>
            <div className="bg-slate-900 text-green-400 p-5 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-700">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(product.raw_data, null, 2)}
              </pre>
            </div>
          </section>
          
          <section className="bg-amber-50 border-l-4 border-amber-400 p-4">
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Nota Técnica:</strong> Esta información proviene directamente del mapeo del nodo 
              <code>&lt;Product ID="{product.ref_id}"&gt;</code> en el archivo XML original. 
              Incluye todas las reglas de precios, dimensiones y asociaciones detectadas.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}