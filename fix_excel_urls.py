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
    main_path = os.path.join(base_dir, mod, "components", "main.jsx")
    if os.path.exists(main_path):
        with open(main_path, 'r') as f:
            content = f.read()
            
        old_href = f'href="/{mod}/Actualizer_Excel_Tables"'
        new_href = f'href="/{mod}/Actualizer_Excel_{suffix}"'
        
        if old_href in content:
            content = content.replace(old_href, new_href)
            with open(main_path, 'w') as f:
                f.write(content)
            print(f"Fixed {main_path} -> {new_href}")
        else:
            print(f"{old_href} not found in {main_path}")

