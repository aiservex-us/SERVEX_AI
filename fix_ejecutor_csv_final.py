import os
import glob
import re

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
search_pattern = os.path.join(base_dir, "*", "Actualizer_XML_*", "components", "comparePDF", "IncertData", "components", "EJECUTOR.jsx")
files = glob.glob(search_pattern)

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # We want to replace:
    # const payload = { company_name: currentTenant, csv_new_raw: sanitizedJsonData, created_at: new Date().toISOString() };
    # with:
    # const payload = { company_name: currentTenant, csv_new_raw: sanitizedJsonData, CSV_final: sanitizedJsonData, created_at: new Date().toISOString() };
    
    target = "csv_new_raw: sanitizedJsonData,"
    replacement = "csv_new_raw: sanitizedJsonData, CSV_final: sanitizedJsonData,"
    
    if target in content and "CSV_final: sanitizedJsonData" not in content:
        content = content.replace(target, replacement)
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Updated {file_path}")

print("All EJECUTOR.jsx files updated to also save to CSV_final")
