import os

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
    page_path = os.path.join(base_dir, mod, excel_folder, "page.jsx")
    
    if os.path.exists(page_path):
        with open(page_path, "r") as f:
            content = f.read()
            
        old_line = "const showAiMenu = active !== 'reporting' && active !== 'incert_delete';"
        new_line = "const showAiMenu = active !== 'reporting';"
        
        if old_line in content:
            content = content.replace(old_line, new_line)
            with open(page_path, "w") as f:
                f.write(content)
            print(f"Restored Alysa chat for {mod}")

print("Done restoring AI chat.")
