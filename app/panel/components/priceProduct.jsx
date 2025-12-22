'use client';

import React, { useState, useEffect, useMemo } from 'react';

const PanelMenur = () => {
  // Estados para manejar el contenido del XML y la búsqueda
  const [xmlString, setXmlString] = useState("");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Efecto para procesar el XML cuando el estado xmlString cambie
  useEffect(() => {
    if (!xmlString) return;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // Basado en tu resumen: buscamos los nodos <Product>
    const productNodes = xmlDoc.getElementsByTagName("Product");
    const extracted = [];

    for (let i = 0; i < productNodes.length; i++) {
      const product = productNodes[i];
      
      const code = product.getElementsByTagName("Code")[0]?.textContent || "N/A";
      const description = product.getElementsByTagName("Description")[0]?.textContent || "Sin descripción";
      
      // Acceso jerárquico: Product -> Price -> Value
      const priceNode = product.getElementsByTagName("Price")[0];
      const priceValue = priceNode ? priceNode.getElementsByTagName("Value")[0]?.textContent : "0";

      extracted.push({
        code,
        description,
        price: parseFloat(priceValue) || 0
      });
    }

    setProducts(extracted);
  }, [xmlString]);

  // Lógica de filtrado reactiva
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  // Manejador de carga de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (res) => setXmlString(res.target.result);
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header del Buscador y Carga */}
      <div className="p-4 border-b bg-white flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-800">Precios Lesro</h2>
          <input 
            type="file" 
            accept=".xml" 
            onChange={handleFileChange}
            className="text-[10px] mt-1 text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
          />
        </div>
        
        <input
          type="text"
          placeholder="Filtrar por código o nombre..."
          className="w-full md:w-80 px-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabla con Scroll Interno */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Código</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Precio USD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item, idx) => (
                <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-blue-600">{item.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.description}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-slate-900">
                    ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-20 text-center text-slate-400 text-sm">
                  {xmlString ? "No hay coincidencias" : "Selecciona un archivo XML para procesar los precios"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer informativo */}
      <div className="p-3 bg-slate-50 border-t flex justify-between text-[10px] font-bold text-slate-400 uppercase">
        <span>Items: {filteredProducts.length}</span>
        <span>Standard: OFDAxml 2025</span>
      </div>
    </div>
  );
};

export default PanelMenur;