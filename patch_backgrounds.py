import os
import re

def process_incert_files():
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
                    
                    # For incertXML and similar
                    if 'incertXML' in file or 'incertXML_excel' in file or 'incert' in file.lower():
                        content = content.replace("border-gray-200 bg-[#FAF9F8] hover:bg-[#F3F2F1]", "border-white/40 bg-white/20 backdrop-blur-md hover:bg-white/30")
                        content = content.replace("border-gray-300 bg-[#F3F2F1]", "border-white/40 bg-white/20 backdrop-blur-md text-gray-700")
                        
                        # sometimes it's border border-gray-300
                        content = content.replace("bg-[#F3F2F1]", "bg-white/20 backdrop-blur-md")
                    
                    # For AI_contact.jsx
                    if file == 'AI_contact.jsx':
                        content = content.replace("bg-white rounded-xl shadow-lg border border-slate-200", "bg-white/40 backdrop-blur-md rounded-xl shadow-lg border border-white/50")
                        
                    if content != original:
                        with open(filepath, 'w') as f:
                            f.write(content)
                        print(f"Updated {filepath}")

process_incert_files()
