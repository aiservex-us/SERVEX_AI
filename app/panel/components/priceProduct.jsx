import React, { useState, useEffect } from 'react';
import { parseString } from 'xml2js'; // Librería común para parsear XML

const PriceListDisplay = ({ xmlData }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (xmlData) {
      parseString(xmlData, { explicitArray: false }, (err, result) => {
        if (err) {
          console.error("Error parseando XML", err);
          return;
        }

        // Navegamos por la estructura según el resumen que enviaste
        // Nota: La ruta exacta depende de la jerarquía total del XML
        const productNodes = result?.Envelope?.Catalog?.Product || [];
        
        const extracted = Array.isArray(productNodes) 
          ? productNodes.map(p => ({
              code: p.Code,
              description: p.Description?._ || p.Description,
              // Buscamos el valor numérico en el nodo Price
              price: p.Price?.Value || "0.00" 
            }))
          : [];

        setProducts(extracted);
      });
    }
  }, [xmlData]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Precios Lesro 2025</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Código de Producto</th>
              <th className="px-4 py-2 border">Descripción</th>
              <th className="px-4 py-2 border">Precio Base (USD)</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border font-mono">{item.code}</td>
                <td className="px-4 py-2 border">{item.description}</td>
                <td className="px-4 py-2 border text-right text-green-700 font-bold">
                  ${parseFloat(item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceListDisplay;