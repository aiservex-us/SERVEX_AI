import os

files = [
    "/Users/glynne/Desktop/SERVEX_AI/app/WBD/Actualizer_XML_Desks/components/menuLateral.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_XML_Workstations/components/menuLateral.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_XML_Tables/components/menuLateral.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_XML/components/menuLateral.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBS/Actualizer_XML_Seatings/components/menuLateral.jsx"
]

for f_path in files:
    if os.path.exists(f_path):
        with open(f_path, 'r') as f:
            content = f.read()

        # Add import Link from 'next/link'; if not there
        if "import Link from 'next/link';" not in content:
            content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport Link from 'next/link';")
        
        # Replace the div wrapping the logo with a Link
        original_div = '<div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm shrink-0 group hover:border-[#464775]/30 transition-colors">'
        new_link = '<Link href="/panel" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm shrink-0 group hover:border-[#464775]/30 transition-colors cursor-pointer">'
        
        content = content.replace(original_div, new_link)
        
        # We need to replace the closing </div> of the logo with </Link>.
        # We know the structure:
        # <Link ...>
        #   <img ... />
        # </div>
        # So we can replace </Link> instead of </div> right after the img.
        # Let's do it using regex to be safe.
        import re
        content = re.sub(
            r'(<Link href="/panel" className="w-12 h-12[^>]+>.*?<img[^>]+/>\s*)</div>',
            r'\1</Link>',
            content,
            flags=re.DOTALL
        )

        with open(f_path, 'w') as f:
            f.write(content)
            
print("Updated all menuLateral.jsx files with Link.")
