import React, { useState, useEffect, useMemo } from 'react';

const CatalogoLesro = () => {
  const [xmlDoc, setXmlDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Cargar el XML desde la carpeta public
  useEffect(() => {
    fetch('/LES-012626.xml')
      .then(response => {
        if (!response.ok) throw new Error("No se pudo cargar el archivo XML");
        return response.text();
      })
      .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "text/xml");
        setXmlDoc(xml);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 2. Procesar y Organizar la información por Productos
  const catalogoOrganizado = useMemo(() => {
    if (!xmlDoc) return [];

    // Diccionario de Features para búsqueda rápida
    const featuresDict = {};
    const allFeatures = xmlDoc.getElementsByTagName("Feature");
    
    for (let f of allFeatures) {
      const fCode = f.getElementsByTagName("Code")[0]?.textContent;
      const fDesc = f.getElementsByTagName("Description")[0]?.textContent;
      
      const options = Array.from(f.getElementsByTagName("Option")).map(opt => {
        // Extraer precio del nodo <Value> dentro de <OptionPrice>
        const priceVal = opt.getElementsByTagName("Value")[0]?.textContent || "0";
        return {
          optCode: opt.getElementsByTagName("Code")[0]?.textContent,
          optDesc: opt.getElementsByTagName("Description")[0]?.textContent,
          upcharge: parseFloat(priceVal).toFixed(2)
        };
      });

      featuresDict[fCode] = { description: fDesc, options: options };
    }

    // Mapear Productos vinculando sus referencias
    const allProducts = xmlDoc.getElementsByTagName("Product");
    const result = [];

    for (let p of allProducts) {
      const pCode = p.getElementsByTagName("Code")[0]?.textContent;
      const pName = p.getElementsByTagName("Name")[0]?.textContent || pCode;
      const pDesc = p.getElementsByTagName("Description")[0]?.textContent;
      const basePrice = p.getElementsByTagName("Value")[0]?.textContent || "0.00";

      // Obtener las Features asociadas a este producto mediante <FeatureRef>
      const featureRefs = Array.from(p.getElementsByTagName("FeatureRef")).map(ref => {
        const code = ref.textContent;
        return {
          code: code,
          ...(featuresDict[code] || { description: "Sin descripción", options: [] })
        };
      });

      result.push({
        code: pCode,
        name: pName,
        description: pDesc,
        basePrice: parseFloat(basePrice).toFixed(2),
        features: featureRefs
      });
    }

    return result;
  }, [xmlDoc]);

  // Filtro de búsqueda
  const productosFiltrados = catalogoOrganizado.filter(p => 
    p.code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={styles.center}>Cargando catálogo maestro...</div>;
  if (error) return <div style={styles.error}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>LESRO Master Data Explorer</h1>
        <p>Total de productos: {catalogoOrganizado.length}</p>
        <input 
          type="text" 
          placeholder="Buscar por SKU o Descripción (ej: BL1101 o Belmont)..." 
          style={styles.searchBar}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={styles.grid}>
        {productosFiltrados.map((prod) => (
          <div key={prod.code} style={styles.card}>
            <div style={styles.productMain}>
              <div style={styles.badge}>{prod.code}</div>
              <h2 style={styles.title}>{prod.description}</h2>
              <div style={styles.priceTag}>Precio Base: ${prod.basePrice}</div>
            </div>

            <div style={styles.featuresSection}>
              <h4 style={styles.sectionTitle}>Configuraciones y Opciones:</h4>
              {prod.features.length > 0 ? prod.features.map((f, idx) => (
                <details key={idx} style={styles.featureCollapse}>
                  <summary style={styles.summary}>
                    <strong>{f.code}</strong> - {f.description}
                  </summary>
                  <div style={styles.optionsList}>
                    {f.options.map((opt, oIdx) => (
                      <div key={oIdx} style={styles.optionRow}>
                        <span>{opt.optCode} - {opt.optDesc}</span>
                        <span style={styles.upcharge}>+ ${opt.upcharge}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )) : <p style={styles.noData}>No hay configuraciones adicionales.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Estilos en línea para una implementación rápida
const styles = {
  container: { padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, sans-serif' },
  header: { marginBottom: '2rem', textAlign: 'center' },
  searchBar: { width: '100%', maxWidth: '600px', padding: '12px 20px', borderRadius: '25px', border: '1px solid #ddd', fontSize: '1rem', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  grid: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e1e4e8' },
  productMain: { padding: '20px', backgroundColor: '#ffffff', borderBottom: '1px solid #f0f0f0' },
  badge: { display: 'inline-block', backgroundColor: '#0056b3', color: '#fff', padding: '4px 12px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px' },
  title: { margin: '0 0 10px 0', color: '#1a1a1a', fontSize: '1.4rem' },
  priceTag: { color: '#28a745', fontWeight: 'bold', fontSize: '1.1rem' },
  featuresSection: { padding: '15px 20px', backgroundColor: '#fafbfc' },
  sectionTitle: { fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' },
  featureCollapse: { marginBottom: '8px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '5px' },
  summary: { padding: '10px', cursor: 'pointer', outline: 'none', color: '#444' },
  optionsList: { padding: '0 10px 10px 10px', fontSize: '0.9rem' },
  optionRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f9f9f9' },
  upcharge: { fontWeight: 'bold', color: '#d9534f' },
  noData: { fontStyle: 'italic', color: '#999' },
  center: { textAlign: 'center', padding: '50px' },
  error: { color: 'red', textAlign: 'center', padding: '50px' }
};

export default CatalogoLesro;