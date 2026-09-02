import os
import glob
import re

# Find all menuLateral.jsx files
menu_files = []
for root, dirs, files in os.walk('/Users/glynne/Desktop/SERVEX_AI/app'):
    for file in files:
        if file == 'menuLateral.jsx' or file == 'menuEmpresas.jsx':
            menu_files.append(os.path.join(root, file))

for filepath in menu_files:
    with open(filepath, 'r') as f:
        content = f.read()

    # If it's already patched, skip
    if 'isHovered, setIsHovered' in content:
        continue

    # 1. Add isHovered state
    content = re.sub(
        r'const \[searchQuery, setSearchQuery\] = useState\(\'\'\);',
        r"const [searchQuery, setSearchQuery] = useState('');\n  const [isHovered, setIsHovered] = useState(false);\n  const isEffectivelyCollapsed = collapsed && !isHovered;",
        content
    )

    # 2. Fix the aside onMouseEnter and onMouseLeave
    content = re.sub(
        r'onMouseEnter=\{[^}]*setCollapsed\(false\);[^}]*\}',
        r'onMouseEnter={() => setIsHovered(true)}',
        content
    )
    content = re.sub(
        r'onMouseLeave=\{[^}]*setCollapsed\(true\);[^}]*\}',
        r'onMouseLeave={() => setIsHovered(false)}',
        content
    )

    # 3. Replace 'collapsed' with 'isEffectivelyCollapsed' ONLY after <aside
    # We can split by '<aside'
    parts = content.split('<aside')
    if len(parts) > 1:
        before_aside = parts[0]
        aside_and_after = '<aside' + parts[1]
        
        # In the aside part, we replace '\bcollapsed\b' with 'isEffectivelyCollapsed'
        # But wait, what if `collapsed` is used as a property like `setCollapsed`?
        # \bcollapsed\b will match 'collapsed'. 
        
        aside_and_after = re.sub(r'\bcollapsed\b', 'isEffectivelyCollapsed', aside_and_after)
        
        content = before_aside + aside_and_after
        
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")
