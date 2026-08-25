import os
import re

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
modules = ['WBA', 'WBD', 'WBG', 'WBO', 'WBS', 'WBT', 'LESRO']

for mod in modules:
    mod_dir = os.path.join(base_path, mod)
    if not os.path.isdir(mod_dir): continue
    
    xml_dir = None
    for d in os.listdir(mod_dir):
        if d.startswith('Actualizer_XML_'):
            xml_dir = d
    if xml_dir:
        menu_path = os.path.join(mod_dir, xml_dir, 'components', 'menuLateral.jsx')
        if mod == 'LESRO':
            menu_path = os.path.join(mod_dir, 'components', 'menuLateral.jsx')
            
        if os.path.exists(menu_path):
            with open(menu_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extract reporting line
            reporting_match = re.search(r"{\s*id:\s*'reporting'.*?}", content)
            if not reporting_match: continue
            reporting_str = reporting_match.group(0)
            
            # Extract excel_redirect line
            excel_match = re.search(r"{\s*id:\s*'excel_redirect'.*?}", content)
            if not excel_match: continue
            excel_str = excel_match.group(0)
            
            new_menu = f"""const menuItems = [
  {reporting_str},
  {{ id: 'xml_results', label: 'Export Data client', icon: FileSpreadsheet, sub: 'Data' }},
  {{ id: 'inbox', label: 'cataloge base', icon: FileCode, sub: 'Intelligence' }},
  {{ id: 'kanban', label: 'XML base', icon: FileSpreadsheet, sub: 'Data' }},
  {{ id: 'inbox_updated', label: 'Current Catalog', icon: FileCode, sub: 'Data' }},
  {{ id: 'dashboard', label: 'XML Results', icon: FileSpreadsheet, sub: 'Data' }},
  {excel_str},
];"""
            
            # Replace old menuItems
            # We find everything from const menuItems = [ to ];
            pattern = re.compile(r"const\s+menuItems\s*=\s*\[.*?\];", re.DOTALL)
            content = re.sub(pattern, new_menu, content)
            
            with open(menu_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
            print(f"Patched {mod}")

