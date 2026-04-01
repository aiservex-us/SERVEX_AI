import React, { useState, useMemo } from 'react';

const CatalogPriceTable = ({ xmlData }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const tableData = useMemo(() => {
    if (!xmlData) return [];

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    const products = xmlDoc.getElementsByTagName("Product");
    const allFeatures = Array.from(xmlDoc.getElementsByTagName("Feature"));

    return Array.from(products).map(product => {
      const productCode = product.getElementsByTagName("Code")[0]?.textContent;
      const productName = product.getElementsByTagName("Description")[0]?.textContent;
      const basePrice = parseFloat(product.querySelector("Price > Value")?.textContent || "0");

      // Función auxiliar para buscar precios de opciones dentro de las Features del producto
      const getOptionExtra = (featureKeyword, optionKeyword) => {
        const productFeatureRefs = Array.from(product.getElementsByTagName("FeatureRef"))
          .map(ref => ref.textContent);

        // Buscar la Feature que coincida con las del producto y tenga el keyword (ej: 'GRADE' o 'ARMPAD')
        const targetFeature = allFeatures.find(f => 
          productFeatureRefs.includes(f.getElementsByTagName("Code")[0]?.textContent) &&
          f.getElementsByTagName("Code")[0]?.textContent.includes(featureKeyword)
        );

        if (!targetFeature) return 0;

        const options = Array.from(targetFeature.getElementsByTagName("Option"));
        const targetOption = options.find(o => 
          o.getElementsByTagName("Description")[0]?.textContent.toLowerCase().includes(optionKeyword.toLowerCase()) ||
          o.getElementsByTagName("Code")[0]?.textContent.toLowerCase().includes(optionKeyword.toLowerCase())
        );

        return parseFloat(targetOption?.querySelector("OptionPrice > Value")?.textContent || "0");
      };

      // Mapeo de columnas solicitado
      return {
        id: productCode,
        productName: productName,
        basePrice: basePrice,
        // Grados de Tela (Suma Base + Incremento de la Feature UPH-GRADE)
        grade02: basePrice + getOptionExtra("GRADE", "GRADE2"),
        grade03: basePrice + getOptionExtra("GRADE", "GRADE3"),
        grade04: basePrice + getOptionExtra("GRADE", "GRADE4"),
        grade05: basePrice + getOptionExtra("GRADE", "GRADE5"),
        grade06: basePrice + getOptionExtra("GRADE", "GRADE6"),
        grade07: basePrice + getOptionExtra("GRADE", "GRADE7"),
        grade08: basePrice + getOptionExtra("GRADE", "GRADE8"),
        grade09: basePrice + getOptionExtra("GRADE", "GRADE9"),
        grade10: basePrice + getOptionExtra("GRADE", "GRADE10"),
        // Opcionales (Solo el valor del incremento/upcharge)
        armpadPoly: getOptionExtra("ARMPAD", "APU"), // APU = Urethane en tu XML
        armpadSolid: getOptionExtra("ARMPAD", "SS"),  // SS = Solid Surface
      };
    });
  }, [xmlData]);

  const filteredData = tableData.filter(row => 
    row.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 overflow-x-auto">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          className="p-2 border rounded w-full max-w-md"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <table className="min-w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">ID (Product Code)</th>
            <th className="border p-2">Product Name</th>
            <th className="border p-2">Base Price</th>
            <th className="border p-2 text-blue-600">Grade 02</th>
            <th className="border p-2 text-blue-600">Grade 03</th>
            <th className="border p-2 text-blue-600">Grade 04</th>
            <th className="border p-2 text-blue-600">Grade 05</th>
            <th className="border p-2 text-blue-600">Grade 06</th>
            <th className="border p-2 text-blue-600">Grade 07</th>
            <th className="border p-2 text-blue-600">Grade 08</th>
            <th className="border p-2 text-blue-600">Grade 09</th>
            <th className="border p-2 text-blue-600">Grade 10</th>
            <th className="border p-2 text-green-600">Upcharge: Poly Armpad</th>
            <th className="border p-2 text-green-600">Upcharge: Solid Surface</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="border p-2 font-mono">{row.id}</td>
              <td className="border p-2">{row.productName}</td>
              <td className="border p-2 font-bold">${row.basePrice}</td>
              <td className="border p-2">${row.grade02}</td>
              <td className="border p-2">${row.grade03}</td>
              <td className="border p-2">${row.grade04}</td>
              <td className="border p-2">${row.grade05}</td>
              <td className="border p-2">${row.grade06}</td>
              <td className="border p-2">${row.grade07}</td>
              <td className="border p-2">${row.grade08}</td>
              <td className="border p-2">${row.grade09}</td>
              <td className="border p-2">${row.grade10}</td>
              <td className="border p-2 text-center text-gray-600">
                {row.armpadPoly > 0 ? `+$${row.armpadPoly}` : '—'}
              </td>
              <td className="border p-2 text-center text-gray-600">
                {row.armpadSolid > 0 ? `+$${row.armpadSolid}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CatalogPriceTable;