import os

def process_red_errors():
    search_dirs = [
        '/Users/glynne/Desktop/SERVEX_AI/app',
    ]
    
    for root_dir in search_dirs:
        for root, _, files in os.walk(root_dir):
            for file in files:
                if 'XmlToCsvConverter.jsx' in file:
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r') as f:
                        content = f.read()
                    
                    original = content
                    content = content.replace('bg-red-50', 'bg-amber-50')
                    content = content.replace('text-red-700', 'text-amber-700')
                    content = content.replace('border-red-200', 'border-amber-200')
                    
                    if content != original:
                        with open(filepath, 'w') as f:
                            f.write(content)
                        print(f"Updated {filepath}")

process_red_errors()
