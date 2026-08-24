import os
import re

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
            
        pattern = re.compile(r'<div className="max-h-\[300px\] overflow-y-auto custom-scrollbar pr-1 pb-1">.*?</div>\s*</motion\.div>', re.DOTALL)
        
        new_ui = """<div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1 pb-1">
                {Object.entries(
                  SLASH_COMMANDS.filter(cmd => cmd.phase <= unlockedPhase).reduce((acc, cmd) => {
                    const cat = cmd.category || 'Other Commands';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(cmd);
                    return acc;
                  }, {})
                ).map(([category, commands]) => (
                  <div key={category} className="mb-1 last:mb-0 overflow-hidden">
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                      className="w-full flex items-center justify-between px-2 py-2 hover:bg-gray-50 transition-colors rounded-md"
                    >
                      <span className="text-[10px] font-semibold text-gray-500 tracking-wide">
                        {category}
                      </span>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${expandedCategory === category ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {expandedCategory === category && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-1 pl-3 bg-white">
                            {commands.map((cmd) => (
                              <button
                                key={cmd.id}
                                onClick={() => handleCommandSelect(cmd.label)}
                                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-left group mb-0.5 last:mb-0"
                              >
                                <div className="text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0">
                                  <cmd.icon size={13} strokeWidth={2} />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-900 truncate transition-colors">{cmd.label}</span>
                                  <span className="text-[9px] text-gray-400 group-hover:text-gray-500 truncate transition-colors">{cmd.desc}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>"""
            
        content, count = re.subn(pattern, new_ui, content)
        if count > 0:
            print(f"Patched minimalist accordion UI for {mod}")
        else:
            print(f"Failed to match UI chunk for {mod}")
            
        with open(contact_path, 'w', encoding='utf-8') as f:
            f.write(content)

