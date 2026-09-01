import os
import re

FILES_TO_PATCH = [
    '/Users/glynne/Desktop/SERVEX_AI/app/LESRO/Actualizer_Excel_LESRO/components/XML_Results_LESRO.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBD/Actualizer_Excel_Desks/components/XML_Results_WBD.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations/components/XML_Results_WBO.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBA/Actualizer_Excel_Accessories/components/XML_Results_WBA.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBS/Actualizer_Excel_Seatings/components/XML_Results_WBS.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_Excel_Tables/components/XML_Results_WBT.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_Excel_Storage/components/XML_Results_WBG.jsx'
]

for filepath in FILES_TO_PATCH:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find the correct header variable from exportToCSV
    # Usually it looks like: columns: DESKS_HEADERS,
    match = re.search(r'columns:\s*([A-Za-z0-9_]+HEADERS|HEADERS_[A-Za-z0-9_]+|[A-Za-z0-9_]+),', content)
    if not match:
        print(f"Could not determine correct headers for {filepath}")
        continue
        
    correct_header = match.group(1)
    print(f"File {os.path.basename(filepath)} -> Correct header is {correct_header}")
    
    # Replace the hardcoded TABLES_HEADERS in exportToExcel
    if "{ header: TABLES_HEADERS }" in content and correct_header != "TABLES_HEADERS":
        content = content.replace("{ header: TABLES_HEADERS }", f"{{ header: {correct_header} }}")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"Fixed successfully: {filepath}")
    else:
        print(f"No changes needed (or already TABLES_HEADERS) for: {filepath}")
