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
        continue
        
    with open(target_comp_path, "r") as f:
        content = f.read()
        
    # Fix the invalid syntax
    # We want to replace:
    # }   ArrowRightLeft,
    # } from 'lucide-react';
    # With:
    #   , ArrowRightLeft
    # } from 'lucide-react';
    
    content = content.replace("}   ArrowRightLeft,\n} from 'lucide-react';", ", ArrowRightLeft\n} from 'lucide-react';")
    
    with open(target_comp_path, "w") as f:
        f.write(content)
        
    print(f"Fixed {mod['id']}")
