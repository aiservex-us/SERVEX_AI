import os
import re

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
modules = ['WBA', 'WBD', 'WBG', 'WBO', 'WBS', 'WBT', 'LESRO']

for mod in modules:
    main_path = os.path.join(base_path, mod, 'components', 'main.jsx')
    if os.path.exists(main_path):
        with open(main_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Change grid cols from 2 to 1
        content = content.replace('grid-cols-1 md:grid-cols-2', 'grid-cols-1 md:grid-cols-1 max-w-xl')
        
        # Remove the XML to Catalog card block
        pattern = re.compile(r'\{\s*/\*\s*Card XML to Catalog\s*\*/\s*\}.*?</Link>\s*', re.DOTALL)
        content = re.sub(pattern, '', content)
        
        with open(main_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    print(f"Patched main.jsx for {mod}")

