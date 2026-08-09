import os
import glob

modules = ["WBT", "WBG", "WBO", "WBS", "WBA", "LESRO", "WBD"]
base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

for mod in modules:
    # 1. Update page.jsx
    page_path = os.path.join(base_dir, mod, "page.jsx")
    if os.path.exists(page_path):
        with open(page_path, 'r') as f:
            content = f.read()
        
        # Remove redirectUrl="..."
        search_str = f'redirectUrl="/{mod}/Actualizer_XML_Tables"'
        if search_str in content:
            content = content.replace(f' {search_str}', '')
            with open(page_path, 'w') as f:
                f.write(content)
            print(f"Updated {page_path}")
        else:
            print(f"redirectUrl not found in {page_path}")
            
    # 2. Update components/main.jsx
    main_path = os.path.join(base_dir, mod, "components", "main.jsx")
    if os.path.exists(main_path):
        with open(main_path, 'r') as f:
            content = f.read()
            
        old_card = f'''          {{/* Card Alysa Hub */}}
          <Link 
            href="/{mod}/Alysa_Hub_Tables"
            className="group flex flex-col bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-5 lg:p-7 hover:bg-white/80 hover:border-white hover:shadow-[0_20px_40px_rgba(70,71,117,0.08)] hover:-translate-y-1 transition-all duration-500 ease-out"
          >
            <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center text-[#464775] shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-slate-50 mb-4 group-hover:scale-105 transition-transform duration-500 ease-out">
              <Sparkles size={{18}} strokeWidth={{1.5}} />
            </div>
            <h2 className="text-[15px] font-semibold mb-1.5 text-slate-800 tracking-tight">Alysa Intelligence Hub</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-6 flex-grow pr-4">
              AI-guided delta auditing, structural schema insertion, and direct synchronization with CET Designer.
            </p>'''
            
        new_card = f'''          {{/* Card XML to Catalog */}}
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
            </p>'''
            
        if old_card in content:
            content = content.replace(old_card, new_card)
            with open(main_path, 'w') as f:
                f.write(content)
            print(f"Updated {main_path}")
        else:
            print(f"Card not found in {main_path}")

