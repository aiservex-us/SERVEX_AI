import os
import glob

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
files = []
for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f == 'AI_contact.jsx' and 'REPORT/components' in root:
            files.append(os.path.join(root, f))

for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # We want to replace `.eq('company_name', modName)` with `.eq('company_name', context)`
    if ".eq('company_name', modName)" in content:
        content = content.replace(".eq('company_name', modName)", ".eq('company_name', 'Servex US')") # Default to Servex US since context might not be captured
        with open(f, 'w') as file:
            file.write(content)
        print(f"[OK] Patched {f}")
