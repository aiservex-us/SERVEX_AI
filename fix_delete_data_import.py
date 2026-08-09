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
    if mod == "LESRO":
        continue
    
    excel_folder = f"Actualizer_Excel_{suffix}"
    xml_folder = f"Actualizer_XML_{suffix}"
    
    incert_data_path = os.path.join(base_dir, mod, excel_folder, "components", "IncertDataExcel", "Incert_data_excel.jsx")
    
    if os.path.exists(incert_data_path):
        with open(incert_data_path, "r") as f:
            content = f.read()
            
        old_import = f"import DeleteData from '../../../../{xml_folder}/components/comparePDF/IncertData/components/delete_data';"
        new_import = f"import DeleteData from '../../../{xml_folder}/components/comparePDF/IncertData/components/delete_data';"
        
        content = content.replace(old_import, new_import)
        
        with open(incert_data_path, "w") as f:
            f.write(content)
        
        print(f"Fixed {mod}")

print("Done fixing delete_data imports.")
