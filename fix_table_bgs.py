import os

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
components = [
    'csvs.jsx',
    'csvs_updated.jsx',
    'perceo_XML_MASTER_pre_prosses.jsx',
    'perceo_XML_MASTER_post_prcess.jsx'
]

for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f in components:
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Replace outer background
            content = content.replace(
                'className="min-h-[90vh] bg-gradient-to-br from-[#F8F9FE] to-white',
                'className="min-h-[90vh] bg-slate-50/50'
            )
            content = content.replace(
                'className="min-h-[90vh] bg-[#FAFAFA]',
                'className="min-h-[90vh] bg-slate-50/50'
            )
            content = content.replace(
                'className="min-h-[90vh] bg-white',
                'className="min-h-[90vh] bg-slate-50/50'
            )

            # Replace inner container background (remove white block look)
            content = content.replace(
                'className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-2xl shadow-[#464775]/10',
                'className="bg-transparent rounded-2xl border border-slate-200 shadow-sm'
            )
            content = content.replace(
                'className="bg-white rounded-md border border-[#EDEBE9]',
                'className="bg-transparent rounded-2xl border border-slate-200 shadow-sm'
            )
            
            # Table headers
            content = content.replace(
                'bg-white/80 backdrop-blur-md',
                'bg-slate-50/80 backdrop-blur-md'
            )
            
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            
            print(f"Patched {file_path}")

# Also update page.jsx right side container
for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f == 'page.jsx' and ('WBS' in root or 'WBO' in root or 'WBA' in root or 'WBD' in root or 'WBT' in root or 'WBG' in root or 'LESRO' in root):
            file_path = os.path.join(root, f)
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            content = content.replace(
                'flex-shrink-0 bg-white\n               ${isToolsOpen ?',
                'flex-shrink-0 bg-slate-50/50\n               ${isToolsOpen ?'
            )
            
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"Patched {file_path}")
