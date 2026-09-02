import os
import re

filepath = '/Users/glynne/Desktop/SERVEX_AI/app/LESRO/components/comparePDF/REPORT/components/AI_contact.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# Let's find what LESRO uses. 
# Look for 'csv_base'
import sys
if 'csv_base' not in content:
    print("No csv_base found in LESRO")
else:
    # Match the block
    pattern = r"(if\s*\(\s*step\s*===\s*'csv_base'\s*\)\s*\{.*?setMessages.*?text:\s*)'[^']*'(.*?toolId:\s*)'incert_[a-z0-9_]*csv_base'(.*?\})"
    def repl(match):
        new_tool = match.group(0).split("toolId: '")[1].split("'")[0].replace("csv_base", "csv_new")
        return match.group(1) + "'XML guardado exitosamente. El CSV Base ya está en el sistema. Ahora, por favor sube el archivo CSV Actualizado.'" + match.group(2) + f"'{new_tool}'" + match.group(3)

    new_content = re.sub(pattern, repl, content, flags=re.DOTALL)
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print("Updated LESRO")
    else:
        print("Regex failed for LESRO")
