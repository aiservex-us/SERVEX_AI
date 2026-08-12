import os

base_app_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
modules = [
    {"id": "LESRO", "path": "LESRO/components/menuLateral.jsx"},
    {"id": "WBT", "path": "WBT/Actualizer_XML_Tables/components/menuLateral.jsx"},
    {"id": "WBD", "path": "WBD/Actualizer_XML_Desks/components/menuLateral.jsx"},
    {"id": "WBS", "path": "WBS/Actualizer_XML_Seatings/components/menuLateral.jsx"},
    {"id": "WBG", "path": "WBG/Actualizer_XML_Graphics/components/menuLateral.jsx"},
    {"id": "WBA", "path": "WBA/Actualizer_XML_Accessories/components/menuLateral.jsx"},
    {"id": "WBO", "path": "WBO/Actualizer_XML_Workstations/components/menuLateral.jsx"},
]

for mod in modules:
    target_comp_path = os.path.join(base_app_dir, mod["path"])
    
    if not os.path.exists(target_comp_path):
        print(f"File not found: {target_comp_path}")
        continue
        
    with open(target_comp_path, "r") as f:
        content = f.read()
        
    # Inject ArrowRightLeft in lucide-react imports if not present
    if "ArrowRightLeft" not in content:
        content = content.replace("from 'lucide-react';", "  ArrowRightLeft,\n} from 'lucide-react';")
        
    # Replace label and icon for excel_redirect
    content = content.replace("label: 'Exported XML Results', icon: FileSpreadsheet", "label: 'Transform to Excel', icon: ArrowRightLeft")
    
    with open(target_comp_path, "w") as f:
        f.write(content)
        
    print(f"Updated {mod['id']}")
