import os

base_app_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
modules = [
    {"id": "LESRO", "dir": "Actualizer_Excel_LESRO"},
    {"id": "WBT", "dir": "Actualizer_Excel_Tables"},
    {"id": "WBD", "dir": "Actualizer_Excel_Desks"},
    {"id": "WBS", "dir": "Actualizer_Excel_Seatings"},
    {"id": "WBG", "dir": "Actualizer_Excel_Graphics"},
    {"id": "WBA", "dir": "Actualizer_Excel_Accessories"},
]

for mod in modules:
    mod_dir = os.path.join(base_app_dir, mod["id"], mod["dir"])
    menu_path = os.path.join(mod_dir, "components/menuLateral.jsx")
    
    with open(menu_path, "r") as f:
        menu_content = f.read()
        
    menu_content = menu_content.replace("} , Activity from 'lucide-react';", "} from 'lucide-react';")
    
    with open(menu_path, "w") as f:
        f.write(menu_content)
        
    print(f"Fixed menu in {mod['id']}")
