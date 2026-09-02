import os
import glob

# Find all menuLateral.jsx files
menu_files = []
for root, dirs, files in os.walk('/Users/glynne/Desktop/SERVEX_AI/app'):
    for file in files:
        if file == 'menuLateral.jsx' or file == 'menuEmpresas.jsx':
            menu_files.append(os.path.join(root, file))

for filepath in menu_files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix syntax error
    content = content.replace('onMouseEnter={() => setIsHovered(true)}}', 'onMouseEnter={() => setIsHovered(true)}')
    content = content.replace('onMouseLeave={() => setIsHovered(false)}}', 'onMouseLeave={() => setIsHovered(false)}')

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Fixed syntax in {filepath}")
