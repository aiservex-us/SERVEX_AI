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
            
        # Update SLASH_COMMANDS array
        new_slash_commands = """const SLASH_COMMANDS = [
  {id: 'import_cet', icon: Database, label: '/importCETxml', desc: 'Import CET XML', phase: 1, category: 'Export Data From CET or Client' },
  {id: 'exportCETcsv', icon: Download, label: '/exportCETcsv', desc: 'Export processed CET CSV', phase: 4, category: 'Export Data From CET or Client' },
  {id: 'compareCET', icon: Sparkles, label: '/compareCET', desc: 'Compare CET XML against Base', phase: 4, category: 'Export Data From CET or Client' },
  
  {id: 'import', icon: Database, label: '/importBase', desc: 'Import Base excel & XML', phase: 1, category: 'Step 1: Data Ingestion' },
  { id: 'save', icon: Database, label: '/saveCatalog', desc: 'Save uploaded XML/CSV Data', phase: 2, category: 'Step 1: Data Ingestion' },
  { id: 'deleteData', icon: Trash2, label: '/deleteData', desc: 'Delete Tenant Data', phase: 2, category: 'Step 1: Data Ingestion' },
  
  {id: 'execute', icon: Cpu, label: '/executeProcess', desc: 'Restructure XML and compare catalog (Step 2)', phase: 3, category: 'Step 2: XML ETL Engine' },
  
  {id: 'prices', icon: BrainCircuit, label: '/listPriceChanges', desc: 'List Price Changes', phase: 4, category: 'Step 3: Audit & Reporting' },
  {id: 'graphics', icon: BarChart2, label: '/graphicsDashboard', desc: 'Graphics Dashboard', phase: 4, category: 'Step 3: Audit & Reporting' },
  {id: 'resumen', icon: CheckCircle2, label: '/aiResumen', desc: 'AI Resumen', phase: 4, category: 'Step 3: Audit & Reporting' },
  {id: 'download', icon: Download, label: '/DownloadResultXml', desc: 'Download the processed XML result', phase: 4, category: 'Step 3: Audit & Reporting' },
  {id: 'audit', icon: BarChart2, label: '/createAuditor', desc: 'Generate full audit report and publish it to the forum', phase: 4, category: 'Step 3: Audit & Reporting' }
];"""
        
        # Regex to replace the SLASH_COMMANDS array
        pattern_cmds = re.compile(r"const SLASH_COMMANDS = \[[^\]]+\];", re.DOTALL)
        content = re.sub(pattern_cmds, new_slash_commands, content)
        
        # Update render loop
        old_render = """<div className="px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50 mb-0.5">
                  Audit Commands
                </div>
                {SLASH_COMMANDS.filter(cmd => cmd.phase <= unlockedPhase).map((cmd) => (
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
                ))}"""
                
        new_render = """<div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
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
        
        content = content.replace(old_render, new_render)
        
        with open(contact_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    print(f"Patched menu for {mod}")

