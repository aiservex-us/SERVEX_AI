import os
import re

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

        # Update Header height
        content = content.replace('className="h-16 flex items-center px-4 shrink-0 relative"', 'className="h-20 flex items-center px-4 shrink-0 relative"')
        
        # Update logo container
        content = content.replace('w-8 h-8 flex items-center justify-center rounded-lg', 'w-12 h-12 flex items-center justify-center rounded-xl')
        
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
        
        with open(f_path, 'w') as f:
            f.write(content)
            
print("Updated all menuLateral.jsx files.")
