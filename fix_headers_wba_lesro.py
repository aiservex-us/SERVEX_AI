import os

FILES_TO_PATCH = [
    '/Users/glynne/Desktop/SERVEX_AI/app/WBA/Actualizer_Excel_Accessories/components/XML_Results_WBA.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/LESRO/Actualizer_Excel_LESRO/components/XML_Results_LESRO.jsx'
]

target = """  const exportToExcel = () => {
    if (!filtered || filtered.length === 0) return;
    
    const worksheet = XLSX.utils.json_to_sheet(filtered, { header: TABLES_HEADERS });"""

for filepath in FILES_TO_PATCH:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    filename = os.path.basename(filepath)
    prefix = filename.split('_')[-1].split('.')[0]
    
    replacement = f"""  const exportToExcel = () => {{
    if (!filtered || filtered.length === 0) return;
    
    const allHeaders = [...baseHeaders, ...optionHeaders];
    
    const csvData = filtered.map(p => {{
      const row = {{}};
      allHeaders.forEach(header => {{
        let value = p[header] !== undefined ? p[header] : p[header === "SKU" ? "sku" : header === "Description" ? "description" : header === "Classification" ? "classification" : ""];
        if (header === "Base Price") value = p.basePrice;
        row[header] = value !== undefined ? value : "-";
      }});
      return row;
    }});
    
    const worksheet = XLSX.utils.json_to_sheet(csvData, {{ header: allHeaders }});"""
    
    if target in content:
        content = content.replace(target, replacement)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")
    else:
        print(f"Could not find target in {filepath}")
