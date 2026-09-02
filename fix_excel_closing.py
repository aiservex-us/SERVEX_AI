import os
import re

def fix():
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
                    
                    # We just need to ensure the file ends with EXACTLY:
                    #       </div>
                    #     </div>
                    #   );
                    # }
                    
                    # Remove all trailing closing divs before ); }
                    content = re.sub(r'(</div>\s*)+\);\s*\}', '  </div>\n    </div>\n  );\n}', content)
                    
                    with open(filepath, 'w') as f:
                        f.write(content)
                    print(f"Fixed {filepath}")

fix()
