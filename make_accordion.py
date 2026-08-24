import os

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
modules = ['WBA', 'WBD', 'WBG', 'WBO', 'WBS', 'WBT', 'LESRO']

for mod in modules:
    mod_dir = os.path.join(base_path, mod)
    if not os.path.isdir(mod_dir): continue
    
    xml_dir = None
    for d in os.listdir(mod_dir):
        if d.startswith('Actualizer_XML_'):
            xml_dir = d
            
    if not xml_dir:
        continue

    if mod == 'LESRO':
        contact_path = os.path.join(mod_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
    else:
        contact_path = os.path.join(mod_dir, xml_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
        
    if os.path.exists(contact_path):
        with open(contact_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 1. Add state if missing
        if "const [expandedCategory, setExpandedCategory]" not in content:
            content = content.replace(
                "const [showSlashMenu, setShowSlashMenu] = useState(false);",
                "const [showSlashMenu, setShowSlashMenu] = useState(false);\n  const [expandedCategory, setExpandedCategory] = useState(null);"
            )
            
        # 2. Replace render chunk
        old_chunk = """<div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {Object.entries(
                  SLASH_COMMANDS.filter(cmd => cmd.phase <= unlockedPhase).reduce((acc, cmd) => {
                    const cat = cmd.category || 'Other Commands';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(cmd);
                    return acc;
                  }, {})
                ).map(([category, commands]) => (
                  <div key={category} className="mb-2 last:mb-0">
                    <div className="px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-50/30 border-b border-indigo-50 mb-1 sticky top-0 z-10">
                      {category}
                    </div>
                    {commands.map((cmd) => (
                      <button
                        key={cmd.id}
                        onClick={() => handleCommandSelect(cmd.label)}
                        className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left group"
                      >
                        <div className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 flex-shrink-0">
                          <cmd.icon size={11} />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[10px] font-medium text-gray-600 group-hover:text-indigo-700 truncate">{cmd.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
                </div>"""
                
        new_chunk = """<div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {Object.entries(
                  SLASH_COMMANDS.filter(cmd => cmd.phase <= unlockedPhase).reduce((acc, cmd) => {
                    const cat = cmd.category || 'Other Commands';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(cmd);
                    return acc;
                  }, {})
                ).map(([category, commands]) => (
                  <div key={category} className="mb-2 last:mb-0 border border-slate-100 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                      className="w-full flex items-center justify-between px-2 py-1.5 bg-slate-50 hover:bg-indigo-50 transition-colors"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">
                        {category}
                      </span>
                      <ChevronDown size={14} className={`text-indigo-400 transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedCategory === category && (
                      <div className="p-1 bg-white border-t border-slate-100">
                        {commands.map((cmd) => (
                          <button
                            key={cmd.id}
                            onClick={() => handleCommandSelect(cmd.label)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors text-left group mb-0.5 last:mb-0"
                          >
                            <div className="w-6 h-6 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 flex-shrink-0 transition-colors">
                              <cmd.icon size={13} />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-[11px] font-medium text-gray-600 group-hover:text-indigo-700 truncate">{cmd.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                </div>"""
                
        content = content.replace(old_chunk, new_chunk)
        
        with open(contact_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    print(f"Added accordion to {mod}")

