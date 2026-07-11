import os
import glob

# Rutas de los Report.jsx
search_pattern = '/Users/glynne/Desktop/SERVEX_AI/app/**/Report.jsx'
files = glob.glob(search_pattern, recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already patched
    if 'searchTerm' in content:
        print(f"Skipping (already patched): {file}")
        continue

    # 1. Import Search
    if 'Search' not in content and 'lucide-react' in content:
        content = content.replace("from 'lucide-react';", ", Search } from 'lucide-react';").replace("} , Search }", ", Search }")

    # 2. Add State
    state_anchor = "const [activeTab, setActiveTab] = useState('changes');"
    if state_anchor in content:
        content = content.replace(
            state_anchor,
            state_anchor + "\n  const [searchTerm, setSearchTerm] = useState('');"
        )
    
    # 3. Add Filter logic
    changes_anchor = "const changesP = reportDataP?.xml_injection_manifest || [];"
    if changes_anchor in content:
        content = content.replace(
            changes_anchor,
            changes_anchor + "\n\n  const filteredChangesP = changesP.filter(c => \n    (c.model_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || \n    (c.injected_value_old || '').toLowerCase().includes(searchTerm.toLowerCase()) ||\n    (c.injected_value_new || '').toLowerCase().includes(searchTerm.toLowerCase())\n  );"
        )

    # 4. Add Search Input UI
    ui_anchor = "{activeTab === 'changes' && ("
    search_ui = """{activeTab === 'changes' && (
            <div className="w-full flex flex-col">
              <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-2">
                 <Search size={14} className="text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Filter by Model ID or Value..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full md:w-1/3 text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] transition-all"
                 />
              </div>"""
    
    if ui_anchor in content:
        # Reemplazar the first inner div
        # Find the next <div className="w-full overflow-x-auto...
        content = content.replace(ui_anchor + "\n            <div className=\"w-full overflow-x-auto", search_ui + "\n            <div className=\"w-full overflow-x-auto")

    # 5. Replace mapping over changesP to filteredChangesP
    content = content.replace("{changesP.map((c, i) => {", "{filteredChangesP.map((c, i) => {")
    content = content.replace("{changesP.length === 0 && (", "{filteredChangesP.length === 0 && (")

    # Write back
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Patched: {file}")

