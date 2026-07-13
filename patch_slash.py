import os
import re

app_dir = '/Users/glynne/Desktop/SERVEX_AI/app'

# Find all AI_contact.jsx
for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file == 'AI_contact.jsx':
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            # Using regex to find the SLASH_COMMANDS array and replace it
            pattern = r"const SLASH_COMMANDS = \[\s*\{ id: 'resumen'[\s\S]*?\{ id: 'execute'[\s\S]*?\},?\s*\];"
            replacement = """const SLASH_COMMANDS = [
  { id: 'execute', icon: Cpu, label: '/executeProcess', desc: 'Restructurar XML y comparar catálogo (Step 2)' },
];"""

            new_content = re.sub(pattern, replacement, content)
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Patched SLASH_COMMANDS in: {filepath}")

