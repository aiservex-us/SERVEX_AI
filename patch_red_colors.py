import os
import re

def process_red_colors():
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
                    
                    # Replace dark reds with indigo
                    content = content.replace('#7f1d1d', '#464775')
                    content = content.replace('#450a0a', '#32335b')
                    
                    # The clear button in XmlToCsvConverter.jsx
                    if 'XmlToCsvConverter.jsx' in file:
                        content = content.replace('text-red-600 border border-red-200', 'text-slate-600 border border-slate-200')
                        content = content.replace('hover:bg-red-50', 'hover:bg-slate-50')
                        
                    # presentation_excel.jsx / presentation_WBG.jsx hover buttons
                    if 'presentation_excel.jsx' in file or 'presentation_WBG.jsx' in file:
                        content = content.replace('hover:bg-red-50 text-slate-500 hover:text-red-500', 'hover:bg-[#464775]/10 text-slate-500 hover:text-[#464775]')

                    # CET_Comparator.jsx price differences
                    if 'CET_Comparator.jsx' in file or 'Report.jsx' in file:
                        # Replace red-100 and red-700 with a neutral/slate or green depending on if they are negative.
                        # We'll just replace 'bg-red-100 text-red-700' with 'bg-emerald-50 text-emerald-600' for price drops, and keep increases as #464775
                        content = content.replace('bg-red-100 text-red-700', 'bg-emerald-50 text-emerald-600')
                        
                    if 'menuLateral.jsx' in file:
                        content = content.replace('text-red-500/80', 'text-[#464775]/80')
                        content = content.replace('bg-red-50', 'bg-[#464775]/10')
                        content = content.replace('border-red-100', 'border-[#464775]/20')
                        
                    if content != original:
                        with open(filepath, 'w') as f:
                            f.write(content)
                        print(f"Updated {filepath}")

process_red_colors()
