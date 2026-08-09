import os
import re

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
    mod_id = mod["id"]
    mod_dir = os.path.join(base_app_dir, mod_id, mod["dir"])
    page_path = os.path.join(mod_dir, "page.jsx")
    
    with open(page_path, "r") as f:
        page_content = f.read()
        
    page_content = re.sub(r'\"' + mod_id + r'\" \/>;', '', page_content)
    page_content = re.sub(r'\/\/', '', page_content)
    
    with open(page_path, "w") as f:
        f.write(page_content)
        
    print(f"Fixed {mod_id}")
