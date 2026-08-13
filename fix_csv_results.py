import re

files = [
    "/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations/components/CSV_Final_Results_WBO.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_Excel_Tables/components/CSV_Final_Results_WBT.jsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # 1. Fix exportToCSV
    export_pattern = r"const exportToCSV = \(\) => \{[\s\S]*?link\.setAttribute\('download', `.*?`\);[\s\S]*?document\.body\.removeChild\(link\);\s*\};"
    new_export = """const exportToCSV = () => {
    if (!filtered || filtered.length === 0) return;
    const csvString = Papa.unparse(filtered);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CSV_Final_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };"""
    content = re.sub(export_pattern, new_export, content)

    # 2. Remove baseHeaders from table rendering
    td_map_pattern = r"\{baseHeaders\.map\(\(header\) => \{[\s\S]*?\}\)\}"
    content = re.sub(td_map_pattern, "", content)

    # 3. Fix TOTAL COLUMNS stat
    stats_pattern = r"\{baseHeaders\.length \+ optionHeaders\.length\}"
    content = re.sub(stats_pattern, "{optionHeaders.length}", content)

    with open(file_path, "w") as f:
        f.write(content)

print("Fixed CSV_Final_Results files.")
