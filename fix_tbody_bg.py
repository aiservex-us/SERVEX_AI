import os

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
components = [
    'csvs.jsx',
    'csvs_updated.jsx',
    'perceo_XML_MASTER_pre_prosses.jsx',
    'perceo_XML_MASTER_post_prcess.jsx',
    'PDFsection.jsx'
]

for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f in components:
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Replace bg-white on tbody
            if 'className="bg-white divide-y' in content:
                content = content.replace(
                    'className="bg-white divide-y',
                    'className="bg-transparent divide-y'
                )
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Patched tbody in {file_path}")

