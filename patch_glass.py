import os

def process_glass():
    search_dirs = [
        '/Users/glynne/Desktop/SERVEX_AI/app',
    ]
    
    for root_dir in search_dirs:
        for root, _, files in os.walk(root_dir):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.jsx'):
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r') as f:
                        content = f.read()
                    
                    original = content
                    
                    if 'incertXML_excel' in file:
                        content = content.replace('bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden', 'bg-white/50 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-sm')
                        
                    if 'XmlToCsvConverter.jsx' in file:
                        content = content.replace('bg-slate-50', 'bg-transparent')
                        content = content.replace('bg-[#F5F5F5]', 'bg-white/30 backdrop-blur-md')
                        content = content.replace('bg-white', 'bg-white/40 backdrop-blur-md')
                        
                    if content != original:
                        with open(filepath, 'w') as f:
                            f.write(content)
                        print(f"Updated {filepath}")

process_glass()
