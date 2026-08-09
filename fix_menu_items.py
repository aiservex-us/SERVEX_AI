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
    excel_folder = f"Actualizer_Excel_{suffix}"
    menu_path = os.path.join(base_dir, mod, excel_folder, "components", "menuLateral.jsx")
    
    if os.path.exists(menu_path):
        with open(menu_path, "r") as f:
            content = f.read()
            
        # Find where to insert
        target_str = "{ id: 'converter', label: 'XML to CSV', icon: FileSpreadsheet, sub: 'Data Converter' },"
        if "Import Base excel & XML" not in content and target_str in content:
            new_item = "  { id: 'incert_delete', label: 'Import Base excel & XML', icon: UploadCloud, sub: 'Ingestion' },"
            content = content.replace(target_str, f"{target_str}\n{new_item}")
            
            with open(menu_path, "w") as f:
                f.write(content)
            print(f"Fixed {mod} menuItems")

print("Done fixing menu items.")
