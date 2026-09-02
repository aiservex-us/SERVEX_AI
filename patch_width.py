import os

def process_width():
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
                        
                        # Add max-w-md mx-auto to the outermost container
                        content = content.replace('className="w-full flex font-sans', 'className="w-full max-w-md mx-auto flex font-sans')
                        
                        if content != original:
                            with open(filepath, 'w') as f:
                                f.write(content)
                            print(f"Updated {filepath}")

process_width()
