import os

source_file = "app/WBT/Actualizer_XML_Tables/components/menuLateral.jsx"
with open(source_file, "r") as f:
    source_content = f.read()

targets = {
    "WBD": "app/WBD/Actualizer_XML_Desks/components/menuLateral.jsx",
    "WBO": "app/WBO/Actualizer_XML_Workstations/components/menuLateral.jsx",
    "WBA": "app/WBA/Actualizer_XML_Accessories/components/menuLateral.jsx",
    "WBS": "app/WBS/Actualizer_XML_Seatings/components/menuLateral.jsx",
    "WBG": "app/WBG/Actualizer_XML_Graphics/components/menuLateral.jsx",
    "LESRO": "app/LESRO/components/menuLateral.jsx"
}

for mod, path in targets.items():
    if os.path.exists(path):
        content = source_content.replace('WBT Home', f'{mod} Home')
        content = content.replace('DATA WBT', f'DATA {mod}')
        
        with open(path, "w") as f:
            f.write(content)
        print(f"Updated {path}")
    else:
        print(f"File not found: {path}")
