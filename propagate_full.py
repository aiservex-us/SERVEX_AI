import os
import re

base_app_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
wbo_dir = os.path.join(base_app_dir, "WBO/Actualizer_Excel_Workstations")

wbo_cet_comp_path = os.path.join(wbo_dir, "components/CET_Comparator.jsx")
with open(wbo_cet_comp_path, "r") as f:
    wbo_cet_content = f.read()

wbo_xml_comp_path = os.path.join(wbo_dir, "components/XML_Results_WBO.jsx")
with open(wbo_xml_comp_path, "r") as f:
    wbo_xml_content = f.read()

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
    
    # 1. CET_Comparator.jsx
    cet_content = wbo_cet_content.replace("'ClientsSERVEX_WBO'", f"'ClientsSERVEX_{mod_id}'")
    cet_content = cet_content.replace("'company_name', 'WBO'", f"'company_name', '{mod_id}'")
    cet_content = cet_content.replace("CET Matrix Comparator: <span className=\"font-normal text-[#464775]\">WBO</span>", f"CET Matrix Comparator: <span className=\"font-normal text-[#464775]\">{mod_id}</span>")
    with open(os.path.join(mod_dir, "components/CET_Comparator.jsx"), "w") as f:
        f.write(cet_content)
        
    # 2. XML_Results_[MOD].jsx
    xml_content = wbo_xml_content.replace("'ClientsSERVEX_WBO'", f"'ClientsSERVEX_{mod_id}'")
    xml_content = xml_content.replace("'company_name', 'WBO'", f"'company_name', '{mod_id}'")
    xml_content = xml_content.replace("XML_Results_WBO", f"XML_Results_{mod_id}")
    xml_content = xml_content.replace("Database Preview: WBO", f"Database Preview: {mod_id}")
    with open(os.path.join(mod_dir, f"components/XML_Results_{mod_id}.jsx"), "w") as f:
        f.write(xml_content)
        
    # 3. menuLateral.jsx
    menu_path = os.path.join(mod_dir, "components/menuLateral.jsx")
    with open(menu_path, "r") as f:
        menu_content = f.read()
        
    if "FileSpreadsheet" not in menu_content:
        menu_content = menu_content.replace("FileCode,", "FileCode, FileSpreadsheet,")
    if "Activity" not in menu_content:
        menu_content = menu_content.replace("BarChart2", "BarChart2, Activity")
        
    if "xml_results" not in menu_content:
        menu_content = re.sub(r"(\{ id: 'incert_delete'.*?\}),?\s*\];", r"\1,\n  { id: 'xml_results', label: 'XML Results', icon: FileSpreadsheet, sub: 'Data' }\n];", menu_content)
    if "cet_comparator" not in menu_content:
        menu_content = re.sub(r"(\{ id: 'xml_results'.*?\}),?\s*\];", r"\1,\n  { id: 'cet_comparator', label: 'CET XML Comparator', icon: Activity, sub: 'Audit' }\n];", menu_content)

    with open(menu_path, "w") as f:
        f.write(menu_content)
        
    # 4. page.jsx
    page_path = os.path.join(mod_dir, "page.jsx")
    with open(page_path, "r") as f:
        page_content = f.read()
        
    if f"XML_Results_{mod_id}" not in page_content:
        page_content = page_content.replace("import IncertData", f"import IncertData from './components/IncertDataExcel/Incert_data_excel.jsx';\nimport XMLResults{mod_id} from './components/XML_Results_{mod_id}.jsx';\nimport CETComparator from './components/CET_Comparator.jsx';\n//")
        page_content = page_content.replace("// from './components/IncertDataExcel/Incert_data_excel.jsx';", "")
        
    if f"XMLResults{mod_id}" not in page_content and f"XML_Results_{mod_id}" in page_content:
        # Just to ensure we don't double import
        pass
        
    if "case 'xml_results'" not in page_content:
        page_content = page_content.replace("case 'incert_delete': return <IncertData", f"case 'incert_delete': return <IncertData moduleName=\"{mod_id}\" />;\n      case 'xml_results': return <XMLResults{mod_id} />;\n      case 'cet_comparator': return <CETComparator />;\n//")
        page_content = page_content.replace("// moduleName=", "") # clean up
        
    # In case previous script didn't remove chat properly, let's just make sure page_content is clean
    page_content = re.sub(r"import TeamsAgentChat.*?\n", "", page_content)
    page_content = page_content.replace("import { X, AlertCircle , Sparkles} from 'lucide-react';", "import { X, AlertCircle } from 'lucide-react';")
    page_content = re.sub(r"const \[isAiMenuExpanded.*?;\n", "", page_content)
    page_content = re.sub(r"const showAiMenu.*?;\n", "", page_content)
    page_content = page_content.replace("${showAiMenu && isAiMenuExpanded ? 'w-[65%]' : 'w-full'}", "w-full")
    page_content = re.sub(r"\{\/\*\s*Toolbar Superior.*?\n\s*\{showAiMenu && \(\s*<div className=\"absolute top-3 right-3 z-\[90\]\">\s*<button.*?</button>\s*</div>\s*\)\}", "", page_content, flags=re.DOTALL)
    page_content = re.sub(r"\{\/\*\s*Lado Derecho: Asistente IA.*?\n\s*\{\(showAiMenu && isAiMenuExpanded\) && \(\s*<div className=\"relative w-\[35%\].*?<TeamsAgentChat currentSection=\{active\} />\s*</div>\s*\)\}", "", page_content, flags=re.DOTALL)
    
    with open(page_path, "w") as f:
        f.write(page_content)
        
    print(f"Propagated EVERYTHING to {mod_id}")

