import os
import re

FILES_TO_PATCH = [
    '/Users/glynne/Desktop/SERVEX_AI/app/LESRO/components/comparePDF/REPORT/components/AI_contact.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBD/Actualizer_XML_Desks/components/comparePDF/REPORT/components/AI_contact.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_XML_Workstations/components/comparePDF/REPORT/components/AI_contact.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBA/Actualizer_XML_Accessories/components/comparePDF/REPORT/components/AI_contact.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBS/Actualizer_XML_Seatings/components/comparePDF/REPORT/components/AI_contact.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_XML_Tables/components/comparePDF/REPORT/components/AI_contact.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_XML_Storage/components/comparePDF/REPORT/components/AI_contact.jsx'
]

new_prompts = """const QUICK_PROMPTS = [
  {icon: Database, label: "CET Flow", q: "I only have one XML file, which is the catalog exported from CET." },
  {icon: BarChart2, label: "Master Flow", q: "I already have all the files, I want to update the catalog to import it into CET." },
];"""

for filepath in FILES_TO_PATCH:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    pattern = r"const QUICK_PROMPTS = \[\s*\{[^}]+\}\s*,\s*\{[^}]+\}\s*,?\s*\];"
    
    if re.search(pattern, content):
        content = re.sub(pattern, new_prompts, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched successfully: {filepath}")
    else:
        print(f"Regex didn't match in: {filepath}")
