import os
import glob

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
files = []
for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f == 'AI_contact.jsx' and 'REPORT/components' in root:
            files.append(os.path.join(root, f))

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    old_str = "window.dispatchEvent(new CustomEvent('navigateTo', {detail: 'report' }));"
    new_str = "setTimeout(() => { sendMessage('/listPriceChanges'); }, 1500);"
    
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"[OK] Patched {f}")
    else:
        print(f"[SKIP] Not found in {f}")

