import os
import re

def process_incert():
    search_dirs = [
        '/Users/glynne/Desktop/SERVEX_AI/app',
    ]
    
    for root_dir in search_dirs:
        for root, _, files in os.walk(root_dir):
            for file in files:
                if file == 'incertXML.tsx':
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r') as f:
                        content = f.read()
                    
                    original = content
                    
                    # 1. Change grid-cols-3 to grid-cols-2
                    content = content.replace("step === 'all' ? 'md:grid-cols-3' : 'md:grid-cols-1'", "step === 'all' ? 'md:grid-cols-2' : 'md:grid-cols-1'")
                    
                    # 2. Remove Drop Zone 2 block
                    # It starts with {/* Drop Zone 2: Base CSV */} and ends right before {/* Drop Zone 3: New CSV */}
                    pattern_dz2 = r'\{\/\*\s*Drop Zone 2:\s*Base CSV\s*\*\/\}.*?(?=\{\/\*\s*Drop Zone 3:\s*New CSV\s*\*\/\})'
                    content = re.sub(pattern_dz2, '', content, flags=re.DOTALL)
                    
                    # 3. Remove CSV Base Preview block
                    pattern_prev = r'\{\(step\s*===\s*\'all\'\s*\|\|\s*step\s*===\s*\'csv_base\'\)\s*&&\s*\(\s*<div className="flex flex-col gap-2">\s*<label[^>]*>CSV Base Preview</label>.*?</div>\s*\)\}'
                    content = re.sub(pattern_prev, '', content, flags=re.DOTALL)
                    
                    if content != original:
                        with open(filepath, 'w') as f:
                            f.write(content)
                        print(f"Updated {filepath}")
                    else:
                        print(f"No changes made to {filepath}")

process_incert()
