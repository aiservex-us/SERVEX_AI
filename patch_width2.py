import os

def process_width2():
    search_dirs = [
        '/Users/glynne/Desktop/SERVEX_AI/app',
    ]
    
    for root_dir in search_dirs:
        for root, _, files in os.walk(root_dir):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.jsx'):
                    if 'incertXML' in file or 'incertXML_excel' in file or 'incert' in file.lower():
                        filepath = os.path.join(root, file)
                        with open(filepath, 'r') as f:
                            content = f.read()
                        
                        original = content
                        
                        # Fix incertXML.tsx from max-w-md to max-w-sm
                        content = content.replace('className="w-full max-w-md mx-auto', 'className="w-full max-w-sm mx-auto')
                        
                        # Fix incertXML_excel.tsx from max-w-4xl to max-w-sm
                        content = content.replace('max-w-4xl', 'max-w-sm')
                        
                        if content != original:
                            with open(filepath, 'w') as f:
                                f.write(content)
                            print(f"Updated {filepath}")

process_width2()
