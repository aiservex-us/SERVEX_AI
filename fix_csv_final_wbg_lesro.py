import os
import glob
import re

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
search_pattern = os.path.join(base_dir, "*", "Actualizer_XML_*", "components", "comparePDF", "IncertData", "components", "incertXML.tsx")
files = glob.glob(search_pattern)

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # We want to replace:
    # csv_new_raw: sanitizeCSV(csvNewContent)
    # with:
    # csv_new_raw: sanitizeCSV(csvNewContent),
    # CSV_final: sanitizeCSV(csvNewContent)
    
    target1 = "csv_new_raw: sanitizeCSV(csvNewContent)"
    replacement1 = "csv_new_raw: sanitizeCSV(csvNewContent),\n          CSV_final: sanitizeCSV(csvNewContent)"
    
    target2 = "csv_new_raw: sanitizeCSV(csvNewContent),"
    replacement2 = "csv_new_raw: sanitizeCSV(csvNewContent),\n          CSV_final: sanitizeCSV(csvNewContent),"
    
    if target2 in content and "CSV_final:" not in content:
        content = content.replace(target2, replacement2)
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Updated {file_path}")
    elif target1 in content and "CSV_final:" not in content:
        content = content.replace(target1, replacement1)
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Updated {file_path}")

