import os

file_path = "/Users/glynne/Desktop/SERVEX_AI/app/LESRO/components/comparePDF/IncertData/components/EJECUTOR.jsx"

with open(file_path, "r") as f:
    content = f.read()

target = "csv_new_raw: sanitizedJsonData,"
replacement = "csv_new_raw: sanitizedJsonData, CSV_final: sanitizedJsonData,"

if target in content and "CSV_final: sanitizedJsonData" not in content:
    content = content.replace(target, replacement)
    with open(file_path, "w") as f:
        f.write(content)
    print(f"Updated {file_path}")
else:
    print(f"Already updated {file_path}")

