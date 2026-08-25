import os
import re

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
modules = ['WBA', 'WBD', 'WBG', 'WBO', 'WBS', 'WBT', 'LESRO']

for mod in modules:
    mod_dir = os.path.join(base_path, mod)
    if not os.path.isdir(mod_dir): continue
    
    excel_dir = None
    for d in os.listdir(mod_dir):
        if d.startswith('Actualizer_Excel_'):
            excel_dir = d
            
    if not excel_dir:
        continue

    # The file could be .jsx or .tsx
    target_dir = os.path.join(mod_dir, excel_dir, 'components', 'IncertDataExcel')
    if not os.path.isdir(target_dir): continue
    
    file_path = os.path.join(target_dir, 'incertXML_excel.tsx')
    if not os.path.exists(file_path):
        file_path = os.path.join(target_dir, 'incertXML_excel.jsx')
        if not os.path.exists(file_path):
            continue
            
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # The block starts right after the `loading` div (around `</div> </div> </div> </div> </div> )} <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">`)
    # and ends at `<div className="w-full"> <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"> <div className="px-6 py-6 space-y-6"> <div className="flex flex-col gap-2"> <label className="text-xs font-bold text-[#242424]">Target Entity</label>`
    
    pattern = re.compile(
        r'<div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">.*?(?=<div className="w-full">\s*<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">\s*<div className="px-6 py-6 space-y-6">)',
        re.DOTALL
    )
    
    # We also need to keep the container `<div className="p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">` that was wrapping it, but since we remove it, we need to inject it back before the remaining `w-full` div.
    
    def repl(m):
        return '<div className="p-4 sm:p-8 flex flex-col max-w-4xl mx-auto w-full h-full justify-center">\n          '
        
    new_content, count = re.subn(pattern, repl, content)
    
    if count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched {mod}")
    else:
        print(f"Failed to match in {mod}")
        
