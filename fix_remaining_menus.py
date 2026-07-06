import os
import re

files = [
    "/Users/glynne/Desktop/SERVEX_AI/app/WBA/components/menuLateral.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/synchronizer/components/menuLateral.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/LESRO/components/menuLateral.jsx"
]

for f_path in files:
    if not os.path.exists(f_path):
        continue
        
    with open(f_path, 'r') as f:
        content = f.read()

    # Add import Link from 'next/link'; if not there
    if "import Link from 'next/link';" not in content:
        content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport Link from 'next/link';")

    # STYLING FIXES
    # Update Header height
    content = content.replace('className="h-16 flex items-center px-4 shrink-0 relative"', 'className="h-20 flex items-center px-4 shrink-0 relative"')
    
    # Update logo container
    content = content.replace('w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm shrink-0 group hover:border-[#464775]/30 transition-colors', 'w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm shrink-0 group hover:border-[#464775]/30 transition-colors cursor-pointer')
    
    # Update image sizes
    content = content.replace("${collapsed ? 'w-4 h-4' : 'w-5 h-5'}", "${collapsed ? 'w-5 h-5' : 'w-7 h-7'}")
    
    # Update Title Text styling
    content = re.sub(
        r'className="font-bold text-\[12px\] tracking-tight text-slate-800 whitespace-nowrap uppercase"',
        r'className="font-black text-[15px] tracking-tight text-[#464775] whitespace-nowrap uppercase"',
        content
    )
    
    # Update main buttons text size
    content = content.replace("text-[10px] uppercase tracking-wider leading-none", "text-[9px] uppercase tracking-wider leading-none")
    
    # Update footer buttons text size
    content = content.replace('text-[10px] font-bold uppercase tracking-wider whitespace-nowrap', 'text-[9px] font-bold uppercase tracking-wider whitespace-nowrap')
    
    # LINK FIXES
    original_div = '<div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm shrink-0 group hover:border-[#464775]/30 transition-colors cursor-pointer">'
    new_link = '<Link href="/panel" className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm shrink-0 group hover:border-[#464775]/30 transition-colors cursor-pointer">'
    
    content = content.replace(original_div, new_link)
    
    content = re.sub(
        r'(<Link href="/panel" className="w-12 h-12[^>]+>.*?<img[^>]+/>\s*)</div>',
        r'\1</Link>',
        content,
        flags=re.DOTALL
    )

    with open(f_path, 'w') as f:
        f.write(content)
        
print("Updated remaining menuLateral.jsx files.")
