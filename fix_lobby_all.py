import os
import re

modules = ["WBT", "WBG", "WBO", "WBS", "WBA", "LESRO", "WBD"]
base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

for mod in modules:
    # 1. Update page.jsx
    page_path = os.path.join(base_dir, mod, "page.jsx")
    if os.path.exists(page_path):
        with open(page_path, 'r') as f:
            content = f.read()
        
        # Remove redirectUrl="..."
        new_content = re.sub(r'\s+redirectUrl="[^"]+"', '', content)
        if new_content != content:
            with open(page_path, 'w') as f:
                f.write(new_content)
            print(f"Updated {page_path}")
        else:
            print(f"No changes in {page_path}")
            
    # 2. Update components/main.jsx
    main_path = os.path.join(base_dir, mod, "components", "main.jsx")
    if os.path.exists(main_path):
        with open(main_path, 'r') as f:
            content = f.read()
            
        # Regex to match the second card and replace it
        # We look for {/* Card Alysa Hub */} up to </Link>
        pattern = r'\{\/\*\s*Card Alysa Hub\s*\*\/\}.*?<\/Link>'
        
        new_card = f'''{{/* Card XML to Catalog */}}
          <Link 
            href="/{mod}/Actualizer_Excel_Tables"
            className="group flex flex-col bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-5 lg:p-7 hover:bg-white/80 hover:border-white hover:shadow-[0_20px_40px_rgba(70,71,117,0.08)] hover:-translate-y-1 transition-all duration-500 ease-out"
          >
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#464775] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-slate-50 mb-4 group-hover:scale-105 transition-transform duration-500 ease-out">
              <FileSpreadsheet size={{18}} strokeWidth={{1.5}} />
            </div>
            <h2 className="text-[15px] font-semibold mb-1.5 text-slate-800 tracking-tight">XML to Catalog Converter</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-6 flex-grow pr-4">
              Convert updated XML catalog files to standard format Excel files to send directly to your clients.
            </p>
            <div className="flex items-center text-[#464775] text-[9px] font-extrabold tracking-[0.15em] uppercase mt-auto opacity-60 group-hover:opacity-100 transition-opacity duration-500">
              Access Module 
              <ArrowRight size={{12}} strokeWidth={{2.5}} className="ml-2 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out" />
            </div>
          </Link>'''
          
        new_content = re.sub(pattern, new_card, content, flags=re.DOTALL)
        if new_content != content:
            with open(main_path, 'w') as f:
                f.write(new_content)
            print(f"Updated {main_path}")
        else:
            print(f"No changes in {main_path}")

