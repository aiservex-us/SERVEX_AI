import os
import re

mod_suffixes = {
    "LESRO": "LESRO",
    "WBA": "Accessories",
    "WBD": "Desks",
    "WBG": "Graphics",
    "WBO": "Workstations",
    "WBS": "Seatings",
}

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

for mod, suffix in mod_suffixes.items():
    excel_folder = f"Actualizer_Excel_{suffix}"
    
    # Paths
    src_menu = os.path.join(base_dir, mod, "components", "menuLateral.jsx")
    dest_menu_dir = os.path.join(base_dir, mod, excel_folder, "components")
    dest_menu = os.path.join(dest_menu_dir, "menuLateral.jsx")
    dest_page = os.path.join(base_dir, mod, excel_folder, "page.jsx")
    
    os.makedirs(dest_menu_dir, exist_ok=True)
    
    # 1. Copiar y modificar menuLateral.jsx
    if os.path.exists(src_menu):
        with open(src_menu, 'r') as f:
            menu_content = f.read()

        pattern = r'const menuItems = \[.*?\];'
        new_items = """const menuItems = [
  { id: 'converter', label: 'XML to CSV', icon: FileSpreadsheet, sub: 'Data Converter' },
];"""

        menu_content = re.sub(pattern, new_items, menu_content, flags=re.DOTALL)
        menu_content = re.sub(r'DATA (WBT|WBG|WBO|WBS|WBA|LESRO|WBD)', f'DATA {mod}', menu_content)

        with open(dest_menu, 'w') as f:
            f.write(menu_content)
    else:
        print(f"ERROR: No se encontró {src_menu}")

    # 2. Arreglar los imports en page.jsx
    if os.path.exists(dest_page):
        with open(dest_page, 'r') as f:
            page_content = f.read()
            
        # Reemplazar el path de TeamsAgentChat que apuntaba a Actualizer_XML_...
        # por el path correcto ../components/comparePDF/...
        old_import = f"import TeamsAgentChat from '../Actualizer_XML_{suffix}/components/comparePDF/REPORT/components/AI_contact.jsx';"
        new_import = "import TeamsAgentChat from '../components/comparePDF/REPORT/components/AI_contact.jsx';"
        
        page_content = page_content.replace(old_import, new_import)
        
        with open(dest_page, 'w') as f:
            f.write(page_content)
    
    print(f"Fixed {mod}")

