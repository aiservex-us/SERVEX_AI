const fs = require('fs');

const csvArray = [
  {
    "Weight": 12,
    "Model #": "STL9186-AF4",
    "Assembly": "Some Assembly",
    "2026 List Price": "370",
    "Model Name": "4-Legged Square Tube Stool"
  }
];

const listPriceChanges = [
  { model_id: "STL9186-AF4", column_name: "List Price", old_value: "$378", new_value: "$374" }
];

const firstRow = csvArray.length > 0 ? csvArray[0] : {};
const allKeys = Object.keys(firstRow);

const skuKey = allKeys.find(k => k.toLowerCase().includes('model #') || k.toLowerCase().includes('sku')) || 'sku';
const priceKey = allKeys.find(k => k.toLowerCase().includes('list price') || k.toLowerCase().includes('base price')) || 'Base Price';

const lpMap = new Map();
listPriceChanges.forEach(c => lpMap.set(c.model_id, c.new_value.replace(/[^0-9.-]+/g,"")));

console.log("skuKey:", skuKey);
console.log("priceKey:", priceKey);
console.log("lpMap:", lpMap);

const updatedCSV = csvArray.map(row => {
  let modifiedRow = { ...row };
  const sku = modifiedRow[skuKey] || "";
  
  let parentSku = sku;
  if (sku.includes('/')) {
      parentSku = sku.split('/')[0];
  }

  if (lpMap.has(parentSku)) {
      const oldParentPrice = listPriceChanges.find(c => c.model_id === parentSku)?.old_value.replace(/[^0-9.-]+/g,"");
      const newParentPrice = lpMap.get(parentSku);
      console.log("Found match for", parentSku, "old:", oldParentPrice, "new:", newParentPrice);
      if (oldParentPrice !== undefined) {
          const delta = parseFloat(newParentPrice) - parseFloat(oldParentPrice);
          const currentVal = parseFloat(modifiedRow[priceKey] || "0");
          modifiedRow[priceKey] = (currentVal + delta).toString();
          console.log("Updated price from", currentVal, "to", modifiedRow[priceKey]);
      }
  }
  return modifiedRow;
});

console.log("Updated row:", updatedCSV[0]);
