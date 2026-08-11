import os
import re

base_app_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
modules = [
    {"id": "LESRO", "dir": "Actualizer_Excel_LESRO"},
    {"id": "WBT", "dir": "Actualizer_Excel_Tables"},
    {"id": "WBD", "dir": "Actualizer_Excel_Desks"},
    {"id": "WBS", "dir": "Actualizer_Excel_Seatings"},
    {"id": "WBG", "dir": "Actualizer_Excel_Graphics"},
    {"id": "WBA", "dir": "Actualizer_Excel_Accessories"},
]

for mod in modules:
    mod_id = mod["id"]
    mod_dir = os.path.join(base_app_dir, mod_id, mod["dir"])
    target_comp_path = os.path.join(mod_dir, f"components/XML_Results_{mod_id}.jsx")
    
    with open(target_comp_path, "r") as f:
        content = f.read()
        
    # Check if already added
    if "exportToCSV" not in content:
        # Add imports
        content = content.replace("  AlertCircle\n} from 'lucide-react';", "  AlertCircle,\n  Download\n} from 'lucide-react';\nimport Papa from 'papaparse';")
        
        # Add function
        export_func = f"""
  const exportToCSV = () => {{
    if (!filtered || filtered.length === 0) return;
    
    const allHeaders = [...baseHeaders, ...optionHeaders];
    
    const csvData = filtered.map(p => {{
      const row = {{}};
      allHeaders.forEach(header => {{
        let value = p[header] !== undefined ? p[header] : p[header === "SKU" ? "sku" : header === "Description" ? "description" : header === "Classification" ? "classification" : ""];
        if (header === "Base Price") value = p.basePrice;
        row[header] = value !== undefined ? value : "-";
      }});
      return row;
    }});

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], {{ type: 'text/csv;charset=utf-8;' }});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `{mod_id}_XML_Results_${{new Date().toISOString().slice(0,10)}}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }};
"""
        content = content.replace("return { total, filtered: filtered.length, avgPrice };\n  }, [products, filtered]);", "return { total, filtered: filtered.length, avgPrice };\n  }, [products, filtered]);\n" + export_func)
        
        # Add button
        button_html = """
              <button 
                onClick={exportToCSV}
                type="button"
                className="p-1 bg-white border border-slate-200/60 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors flex items-center justify-center"
                title="Export current view to CSV"
              >
                <Download size={13} />
              </button>
"""
        # We need to insert it right after the processXML button.
        # Find where the processXML button ends
        process_btn_regex = r"(<button\s*onClick=\{processXML\}.*?</button>)"
        content = re.sub(process_btn_regex, r"\1" + button_html, content, flags=re.DOTALL)

        with open(target_comp_path, "w") as f:
            f.write(content)
            
        print(f"Added CSV Export to {mod_id}")
    else:
        print(f"Already added in {mod_id}")
