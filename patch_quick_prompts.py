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
  {icon: Database, label: "Flujo CET", q: "Solo tengo un archivo XML, el cual es el catálogo exportado de CET." },
  {icon: BarChart2, label: "Flujo Maestro", q: "Ya cuento con todos los archivos, quiero actualizar el catálogo para importarlo a CET." },
];"""

for filepath in FILES_TO_PATCH:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Use regex to find and replace the QUICK_PROMPTS block
    pattern = r"const QUICK_PROMPTS = \[\s*\{.*?\}\s*,\s*\{.*?\}\s*,\s*\];"
    # Actually, the trailing comma might not be there. Let's make it more flexible:
    pattern = r"const QUICK_PROMPTS = \[\s*\{[^}]+\}\s*,\s*\{[^}]+\}\s*,?\s*\];"
    
    if re.search(pattern, content):
        content = re.sub(pattern, new_prompts, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched successfully: {filepath}")
    else:
        print(f"Regex didn't match in: {filepath}")
