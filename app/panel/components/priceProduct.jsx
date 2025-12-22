'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/app/lib/supabaseClient'; // Asegúrate de que la ruta sea correcta

const PanelMenur = () => {
  const [xmlString, setXmlString] = useState("");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Efecto para obtener el XML directamente de Supabase
  useEffect(() => {
    const fetchXMLFromSupabase = async () => {
      try {
        setLoading(true);
        
        // Obtenemos el usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("No se encontró usuario autenticado");
          return;
        }

        // Consultamos la tabla ClientsSERVEX
        // Traemos el registro más reciente (.order) del usuario actual
        const { data, error: sbError } = await supabase
          .from('ClientsSERVEX')
          .select('xml_raw, company_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (sbError) throw sbError;

        if (data && data.xml_raw) {
          setXmlString(data.xml_raw);
          console.log(`XML cargado de: ${data.company_name}`);
        } else {
          setError("No se encontraron datos XML en la base de datos.");
        }
      } catch (err) {
        console.error("Error fetching XML:", err);
        setError("Error al conectar con Supabase");
      } finally {
        setLoading(false);
      }
    };

    fetchXMLFromSupabase();
  }, []);

  // 2. Procesador de XML (se mantiene igual, reacciona a xmlString)
  useEffect(() => {
    if (!xmlString) return;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const productNodes = xmlDoc.getElementsByTagName("Product");
    const extracted = [];

    for (let i = 0; i < productNodes.length; i++) {
      const product = productNodes[i];
      const code = product.getElementsByTagName("Code")[0]?.textContent || "N/A";
      const description = product.getElementsByTagName("Description")[0]?.textContent || "Sin descripción";
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

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* Header */}
      <div className="p-4 border-b bg-white flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-slate-800">Precios Lesro</h2>
          <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
            {loading ? (
              "⏳ Sincronizando con Supabase..."
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Base de Datos Conectada
              </>
            )}
          </span>
        </div>
        
        <input
          type="text"
          placeholder="Filtrar por código o nombre..."
          className="w-full md:w-80 px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Cuerpo Principal */}
      <div className="flex-1 overflow-auto bg-white mx-4 my-4 rounded-2xl border border-slate-100 shadow-sm">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Precio USD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center text-slate-400">Cargando catálogo...</td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((item, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm font-mono text-blue-600 font-medium">{item.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 group-hover:text-slate-900">{item.description}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-900">
                      ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center text-slate-400 text-sm">
                    No se encontraron productos en el catálogo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-white border-t flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8">
        <span>Items: {filteredProducts.length}</span>
        <span>Origen: Supabase Cloud</span>
      </div>
    </div>
  );
};

export default PanelMenur;