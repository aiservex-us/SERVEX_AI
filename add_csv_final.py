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
    # payload.csv_new_raw = sanitizeCSV(csvNewContent);
    # with:
    # payload.csv_new_raw = sanitizeCSV(csvNewContent);
    # payload.CSV_final = sanitizeCSV(csvNewContent);
    
    target = "payload.csv_new_raw = sanitizeCSV(csvNewContent);"
    replacement = "payload.csv_new_raw = sanitizeCSV(csvNewContent);\n        payload.CSV_final = sanitizeCSV(csvNewContent);"
    
    if target in content and "payload.CSV_final" not in content:
        content = content.replace(target, replacement)
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Updated {file_path}")

print("All incertXML.tsx files updated to also save to CSV_final")
