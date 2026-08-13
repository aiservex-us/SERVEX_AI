import os

file_path = "/Users/glynne/Desktop/SERVEX_AI/app/LESRO/components/comparePDF/IncertData/components/incertXML.tsx"

with open(file_path, "r") as f:
    content = f.read()

target1 = "csv_new_raw: sanitizeCSV(csvNewContent)"
replacement1 = "csv_new_raw: sanitizeCSV(csvNewContent),\n          CSV_final: sanitizeCSV(csvNewContent)"

target2 = "payload.csv_new_raw = sanitizeCSV(csvNewContent);"
replacement2 = "payload.csv_new_raw = sanitizeCSV(csvNewContent);\n        payload.CSV_final = sanitizeCSV(csvNewContent);"

if "CSV_final:" not in content and "payload.CSV_final" not in content:
    if target1 in content:
        content = content.replace(target1, replacement1)
    elif target2 in content:
        content = content.replace(target2, replacement2)
    
    with open(file_path, "w") as f:
        f.write(content)
    print(f"Updated {file_path}")
else:
    print(f"Already updated {file_path}")

