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
    
    # 1. Update menuLateral.jsx
    menu_path = os.path.join(base_dir, mod, excel_folder, "components", "menuLateral.jsx")
    if os.path.exists(menu_path):
        with open(menu_path, "r") as f:
            content = f.read()
            
        # Remove the converter option from menuItems
        # Look for { id: 'converter', ... },
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if "id: 'converter'" in line:
                continue
            new_lines.append(line)
            
        with open(menu_path, "w") as f:
            f.write('\n'.join(new_lines))
            
    # 2. Update page.jsx
    page_path = os.path.join(base_dir, mod, excel_folder, "page.jsx")
    if os.path.exists(page_path):
        with open(page_path, "r") as f:
            page_content = f.read()
            
        # Remove import
        page_lines = page_content.split('\n')
        new_page_lines = []
        for line in page_lines:
            if "import XmlToCsvConverter" in line:
                continue
            if "case 'converter': return <XmlToCsvConverter />" in line:
                continue
            new_page_lines.append(line)
            
        with open(page_path, "w") as f:
            f.write('\n'.join(new_page_lines))
            
    print(f"Removed XML to CSV from {mod}")

print("Done.")
