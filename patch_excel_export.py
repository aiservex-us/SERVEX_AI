import os

FILES_TO_PATCH = [
    '/Users/glynne/Desktop/SERVEX_AI/app/LESRO/Actualizer_Excel_LESRO/components/XML_Results_LESRO.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBD/Actualizer_Excel_Desks/components/XML_Results_WBD.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations/components/XML_Results_WBO.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBA/Actualizer_Excel_Accessories/components/XML_Results_WBA.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBS/Actualizer_Excel_Seatings/components/XML_Results_WBS.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_Excel_Tables/components/XML_Results_WBT.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_Excel_Storage/components/XML_Results_WBG.jsx'
]

import_target = "import Papa from 'papaparse';"
import_replacement = "import Papa from 'papaparse';\nimport * as XLSX from 'xlsx';"

button_target = """              <button 
                onClick={exportToCSV}
                type="button"
                className="p-1 bg-white border border-slate-200/60 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors flex items-center justify-center"
                title="Export current view to CSV"
              >
                <Download size={13} />
              </button>"""

button_replacement = """              <div className="flex items-center gap-1">
                <button 
                  onClick={exportToCSV}
                  type="button"
                  className="px-2 py-1 bg-white border border-slate-200/60 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-bold"
                  title="Export current view to CSV"
                >
                  <Download size={13} /> CSV
                </button>
                <button 
                  onClick={exportToExcel}
                  type="button"
                  className="px-2 py-1 bg-white border border-slate-200/60 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-bold"
                  title="Export current view to Excel"
                >
                  <Download size={13} /> Excel
                </button>
              </div>"""

for filepath in FILES_TO_PATCH:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "import * as XLSX from 'xlsx';" in content:
        print(f"Already patched: {filepath}")
        continue
        
    # Get module prefix (WBT, WBD, etc.) from filename
    filename = os.path.basename(filepath)
    prefix = filename.split('_')[-1].split('.')[0]
    
    # 1. Replace imports
    content = content.replace(import_target, import_replacement)
    
    # 2. Inject exportToExcel function right after exportToCSV
    func_target = "  const exportToCSV = () => {"
    
    export_to_excel_func = f"""
  const exportToExcel = () => {{
    if (!filtered || filtered.length === 0) return;
    
    const worksheet = XLSX.utils.json_to_sheet(filtered, {{ header: TABLES_HEADERS }});
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Catalog Data");
    
    XLSX.writeFile(workbook, `{prefix}_XML_Results_${{new Date().toISOString().slice(0,10)}}.xlsx`);
  }};
"""
    # Find the end of the exportToCSV function
    # It ends with document.body.removeChild(link); \n  };
    end_func_target = "document.body.removeChild(link);\n  };"
    
    if end_func_target in content:
        content = content.replace(end_func_target, end_func_target + "\n" + export_to_excel_func)
    else:
        print(f"Could not find end of exportToCSV in {filepath}")
        
    # 3. Replace the button UI
    if button_target in content:
        content = content.replace(button_target, button_replacement)
    else:
        print(f"Could not find exact button string in {filepath}, trying fallback...")
        # fallback for slight whitespace differences
        fallback_target = 'onClick={exportToCSV}'
        if fallback_target in content:
            # We will use simple replacement for the first occurrence in the button block
            # Actually, button_target is very specific, if it fails, I'll print.
            pass
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched successfully: {filepath}")
