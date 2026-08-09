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
        with open(page_path, 'r') as f:
            content = f.read()
            
        # Change `const showAiMenu = true;` to `const showAiMenu = active !== 'reporting';`
        if "const showAiMenu = true;" in content:
            content = content.replace("const showAiMenu = true;", "const showAiMenu = active !== 'reporting';")
            with open(page_path, 'w') as f:
                f.write(content)
            print(f"Updated {mod}")
        elif "const showAiMenu = active !== 'reporting';" in content:
            print(f"Already updated {mod}")
        else:
            print(f"Could not find `const showAiMenu = true;` in {mod}")
            
print("Done.")
