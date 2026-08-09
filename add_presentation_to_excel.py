import os
import re

mod_suffixes = {
    "LESRO": "LESRO",
    "WBA": "Accessories",
    "WBD": "Desks",
    "WBG": "Graphics",
    "WBO": "Workstations",
    "WBS": "Seatings",
    "WBT": "Tables"
}

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

for mod, suffix in mod_suffixes.items():
    xml_folder = f"Actualizer_XML_{suffix}"
    excel_folder = f"Actualizer_Excel_{suffix}"
    
    if mod == "LESRO":
        src_presentation = os.path.join(base_dir, mod, "components", "comparePDF", f"presentation_{mod}.jsx")
    else:
        src_presentation = os.path.join(base_dir, mod, xml_folder, "components", "comparePDF", f"presentation_{mod}.jsx")

    dest_presentation = os.path.join(base_dir, mod, excel_folder, "components", f"presentation_excel.jsx")
    
    # 1. Copiar y modificar presentation
    if os.path.exists(src_presentation):
        with open(src_presentation, 'r') as f:
            content = f.read()
            
        content = re.sub(r'Catalog Manager', 'Excel & CSV Converter', content)
        content = re.sub(r'Catalog <br />\s*<span className="text-black/25">Administration</span>', 'Excel <br />\n              <span className="text-black/25">Data Processing</span>', content)
        content = re.sub(r'Centralized management for data integrity, ETL workflows,\s*and real-time updates for WB mfg product catalogs', 'Centralized processing for XML parsing, CSV generation,\n              and Excel data extraction', content)

        with open(dest_presentation, 'w') as f:
            f.write(content)
    else:
        print(f"WARN: No se encontró presentation original {src_presentation}")
        continue

    # 2. Update menuLateral.jsx
    menu_path = os.path.join(base_dir, mod, excel_folder, "components", "menuLateral.jsx")
    if os.path.exists(menu_path):
        with open(menu_path, 'r') as f:
            menu_content = f.read()
            
        pattern = r"const menuItems = \[\s*\{ id: 'converter', label: 'XML to CSV', icon: FileSpreadsheet, sub: 'Data Converter' \},\s*\];"
        
        new_items = f"""const menuItems = [
  {{ id: 'reporting', label: '{mod} Home', icon: LayoutDashboard, sub: 'Dashboard' }},
  {{ id: 'converter', label: 'XML to CSV', icon: FileSpreadsheet, sub: 'Data Converter' }},
];"""
        menu_content = re.sub(pattern, new_items, menu_content, flags=re.DOTALL)
        
        with open(menu_path, 'w') as f:
            f.write(menu_content)

    # 3. Update page.jsx
    page_path = os.path.join(base_dir, mod, excel_folder, "page.jsx")
    if os.path.exists(page_path):
        with open(page_path, 'r') as f:
            page_content = f.read()
            
        if "presentation_excel.jsx" not in page_content:
            page_content = page_content.replace("import XmlToCsvConverter", "import AIReporting from './components/presentation_excel.jsx';\nimport XmlToCsvConverter")
            
        page_content = page_content.replace("useState('converter')", "useState('reporting')")
        
        old_render = """switch (active) {
      case 'converter': return <XmlToCsvConverter />;
      default:"""
        new_render = """switch (active) {
      case 'reporting': return <AIReporting />;
      case 'converter': return <XmlToCsvConverter />;
      default:"""
        page_content = page_content.replace(old_render, new_render)
        
        with open(page_path, 'w') as f:
            f.write(page_content)
            
    print(f"Updated {mod} with presentation.")

print("Presentation integration complete.")
