import os
import re

def process_incert_excel():
    search_dirs = [
        '/Users/glynne/Desktop/SERVEX_AI/app',
    ]
    
    for root_dir in search_dirs:
        for root, _, files in os.walk(root_dir):
            for file in files:
                if file == 'incertXML_excel.tsx':
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r') as f:
                        content = f.read()
                    
                    original = content
                    
                    # 1. Replace the giant wrapper with the clean one
                    wrapper_pattern = r'return\s*\(\s*<div className="min-h-\[60vh\] bg-\[\#FFF\] flex font-sans text-\[\#242424\] relative">\s*<div className="flex-1 flex flex-col">(.*?)<div className="p-4 sm:p-8 flex flex-col max-w-sm mx-auto w-full h-full justify-center">\s*<div className="w-full">\s*<div className="bg-white/50 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-sm">\s*<div className="px-6 py-6 space-y-6">'
                    
                    def wrapper_repl(match):
                        loading_block = match.group(1)
                        # We want the exact same outer shell as incertXML.tsx
                        return f'''return (
    <div className="w-full max-w-sm mx-auto flex font-sans text-[#242424] relative bg-white/50 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-sm">
      <div className="flex-1 flex flex-col gap-3">
{loading_block}'''
                    
                    content = re.sub(wrapper_pattern, wrapper_repl, content, flags=re.DOTALL)
                    
                    # 2. Fix the grid-cols-3 for the dropzone to grid-cols-1
                    content = content.replace('<div className="grid grid-cols-1 md:grid-cols-3 gap-4">', '<div className="grid grid-cols-1 gap-3">')
                    
                    # 3. Fix the closing tags at the end of the file.
                    # Currently, it has:
                    #             </div>
                    #           </div>
                    #         </div>
                    #       </div>
                    #     </div>
                    #   );
                    # }
                    # We need to remove 3 of those closing divs because we removed three wrappers.
                    closing_pattern = r'</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*\);\s*\}'
                    content = re.sub(closing_pattern, '</div>\n    </div>\n  );\n}', content)
                    
                    if content != original:
                        with open(filepath, 'w') as f:
                            f.write(content)
                        print(f"Updated {filepath}")
                    else:
                        print(f"No changes made to {filepath}")

process_incert_excel()
