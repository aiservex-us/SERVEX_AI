import os
import re
import shutil

base_app_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
wbo_dir = os.path.join(base_app_dir, "WBO/Actualizer_Excel_Workstations")
wbo_comp_path = os.path.join(wbo_dir, "components/CET_Comparator.jsx")

with open(wbo_comp_path, "r") as f:
    wbo_comp_content = f.read()

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
    
    # 1. Create CET_Comparator.jsx
    comp_content = wbo_comp_content.replace("'ClientsSERVEX_WBO'", f"'ClientsSERVEX_{mod_id}'")
    comp_content = comp_content.replace("'company_name', 'WBO'", f"'company_name', '{mod_id}'")
    comp_content = comp_content.replace("CET Matrix Comparator: <span className=\"font-normal text-[#464775]\">WBO</span>", f"CET Matrix Comparator: <span className=\"font-normal text-[#464775]\">{mod_id}</span>")
    
    target_comp_path = os.path.join(mod_dir, "components/CET_Comparator.jsx")
    with open(target_comp_path, "w") as f:
        f.write(comp_content)
        
    # 2. Update menuLateral.jsx
    menu_path = os.path.join(mod_dir, "components/menuLateral.jsx")
    with open(menu_path, "r") as f:
        menu_content = f.read()
        
    if "cet_comparator" not in menu_content:
        # Import Activity
        if "Activity" not in menu_content:
            menu_content = menu_content.replace("CheckCircle2, BarChart2", "CheckCircle2, BarChart2, Activity")
            # If for some reason it's different in other modules, fallback:
            menu_content = re.sub(r"(from 'lucide-react';)", r", Activity \1", menu_content)
            
        # Add to menuItems
        insert_idx = menu_content.find("];", menu_content.find("const menuItems"))
        if insert_idx != -1:
            # We want to add it before ];
            # But let's just do a string replace since we know the last element is xml_results
            menu_content = re.sub(r"(\{ id: 'xml_results'.*?\}),?\s*\];", r"\1,\n  { id: 'cet_comparator', label: 'CET XML Comparator', icon: Activity, sub: 'Audit' }\n];", menu_content)
            
    with open(menu_path, "w") as f:
        f.write(menu_content)
        
    # 3. Update page.jsx
    page_path = os.path.join(mod_dir, "page.jsx")
    with open(page_path, "r") as f:
        page_content = f.read()
        
    if "CETComparator" not in page_content:
        # Import
        page_content = page_content.replace("import XMLResults", "import CETComparator from './components/CET_Comparator.jsx';\nimport XMLResults")
        # Route
        page_content = page_content.replace("case 'xml_results': return <", "case 'cet_comparator': return <CETComparator />;\n      case 'xml_results': return <")
        
    # Remove Chat
    page_content = re.sub(r"import TeamsAgentChat.*?\n", "", page_content)
    page_content = page_content.replace("import { X, AlertCircle , Sparkles} from 'lucide-react';", "import { X, AlertCircle } from 'lucide-react';")
    page_content = re.sub(r"const \[isAiMenuExpanded.*?;\n", "", page_content)
    page_content = re.sub(r"const showAiMenu.*?;\n", "", page_content)
    
    # Remove width class logic
    page_content = page_content.replace("${showAiMenu && isAiMenuExpanded ? 'w-[65%]' : 'w-full'}", "w-full")
    
    # Remove Toolbar Superior
    toolbar_regex = r"\{\/\*\s*Toolbar Superior.*?\n\s*\{showAiMenu && \(\s*<div className=\"absolute top-3 right-3 z-\[90\]\">\s*<button.*?</button>\s*</div>\s*\)\}"
    page_content = re.sub(toolbar_regex, "", page_content, flags=re.DOTALL)
    
    # Remove Lado Derecho
    right_side_regex = r"\{\/\*\s*Lado Derecho: Asistente IA.*?\n\s*\{\(showAiMenu && isAiMenuExpanded\) && \(\s*<div className=\"relative w-\[35%\].*?<TeamsAgentChat currentSection=\{active\} />\s*</div>\s*\)\}"
    page_content = re.sub(right_side_regex, "", page_content, flags=re.DOTALL)

    with open(page_path, "w") as f:
        f.write(page_content)
        
    print(f"Propagated to {mod_id}")

