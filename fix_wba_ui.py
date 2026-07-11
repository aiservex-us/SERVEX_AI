import glob

files = [
    '/Users/glynne/Desktop/SERVEX_AI/app/WBA/components/comparePDF/REPORT/components/Report.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_XML/components/comparePDF/REPORT/components/Report.jsx'
]

search_ui = """          <div className="w-full flex flex-col">
            <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-2">
               <Search size={14} className="text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Filter by Model ID or Value..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full md:w-1/3 text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] transition-all"
               />
            </div>
          <div className="w-full overflow-x-auto"""

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Reemplazar the table start
    if 'Filter by Model' not in content:
        content = content.replace('          <div className="w-full overflow-x-auto', search_ui)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched WBA/WBG UI: {file}")

