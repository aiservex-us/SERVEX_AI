import re
import os
import glob

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
files = glob.glob(os.path.join(base_dir, "W*/**/page.jsx"), recursive=True)

# Ignore root W*/page.jsx if it exists (we want the ones inside Actualizer_XML... mostly, but some are direct like WBA/page.jsx)
files = [f for f in files if 'Actualizer_XML' in f or 'WBA/page.jsx' in f]

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Imports
    if "Sparkles" not in content and "lucide-react" in content:
        content = re.sub(r'(import\s*\{[^}]*)(?=\}\s*from\s*[\'"]lucide-react[\'"])', r'\1, Sparkles', content)
        
    if "import TeamsAgentChat" not in content:
        import_statement = "import TeamsAgentChat from './components/comparePDF/REPORT/components/AI_contact.jsx';"
        content = re.sub(r"(import React[^;]+;)", r"\1\n" + import_statement, content)
        # Just in case there is no 'import React'
        if "import TeamsAgentChat" not in content:
             content = re.sub(r"(import \{[^}]*\}\s*from\s*[\'"]lucide-react[\'"];)", r"\1\n" + import_statement, content)

    # 2. Add state inside the main component before the return statement
    if "const showAiMenu" not in content:
        state_logic = """
  const [isAiMenuExpanded, setIsAiMenuExpanded] = useState(true);
  const showAiMenu = ['dashboard', 'kanban', 'inbox', 'inbox_updated'].includes(active);
"""
        # Inject it right before 'const handleConfirmExit' or 'const renderContent'
        content = re.sub(r'(const renderContent = \(\) => \{)', state_logic + r'\n  \1', content)

    # 3. Replace <main> block
    main_pattern = re.compile(r'(<main[^>]*>.*?<MenuLateral[^>]*/>).*?(<div className="relative group flex-1 h-full w-full min-w-0">.*?</div>\s*</div>\s*</div>\s*</main>)', re.DOTALL)
    
    match = main_pattern.search(content)
    if match:
        prefix = match.group(1)
        
        new_split_layout = """
        {/* CONTENEDOR SPLIT */}
        <div className="flex flex-1 h-full w-full min-w-0 p-2 gap-2 bg-slate-50">
          
          {/* Lado Izquierdo: Contenido Principal */}
          <div className={`relative group transition-all duration-300 ease-in-out h-full ${(showAiMenu && isAiMenuExpanded) ? 'w-[65%]' : 'w-full'}`}>
            <div className="absolute -inset-1 blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 w-full h-full overflow-hidden flex flex-col">
              
              {/* Toolbar Superior (Sólo visible si corresponde el menú IA) */}
              {showAiMenu && (
                <div className="absolute top-3 right-3 z-[90]">
                  <button 
                    onClick={() => setIsAiMenuExpanded(!isAiMenuExpanded)}
                    className={`flex items-center justify-center p-1.5 rounded-lg shadow-sm border transition-all ${isAiMenuExpanded ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    title={isAiMenuExpanded ? 'Ocultar Copilot' : 'Mostrar Copilot'}
                  >
                    <Sparkles size={18} />
                  </button>
                </div>
              )}

              <div className="flex-1 w-full relative overflow-y-auto">
                <div className="p-1 w-full h-full">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Asistente IA (Menú Lateral Derecho) */}
          {(showAiMenu && isAiMenuExpanded) && (
            <div className="relative w-[35%] h-full bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col animate-in slide-in-from-right-8 duration-300">
              <TeamsAgentChat />
            </div>
          )}
          
        </div>
      </main>"""
        
        content = content[:match.start()] + prefix + new_split_layout + content[match.end():]
        
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"[+] Conditional AI Menu integrated in {os.path.basename(fpath)}")
    else:
        print(f"[-] Could not find <main> block to replace in {os.path.basename(fpath)}")
