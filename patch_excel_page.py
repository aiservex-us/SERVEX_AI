import os
import re

base_app_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
modules = [
    {"id": "LESRO", "dir": "Actualizer_Excel_LESRO", "xml_dir": "Actualizer_XML_LESRO"},
    {"id": "WBT", "dir": "Actualizer_Excel_Tables", "xml_dir": "Actualizer_XML_Tables"},
    {"id": "WBD", "dir": "Actualizer_Excel_Desks", "xml_dir": "Actualizer_XML_Desks"},
    {"id": "WBS", "dir": "Actualizer_Excel_Seatings", "xml_dir": "Actualizer_XML_Seatings"},
    {"id": "WBG", "dir": "Actualizer_Excel_Graphics", "xml_dir": "Actualizer_XML_Graphics"},
    {"id": "WBA", "dir": "Actualizer_Excel_Accessories", "xml_dir": "Actualizer_XML_Accessories"},
    {"id": "WBO", "dir": "Actualizer_Excel_Workstations", "xml_dir": "Actualizer_XML_Workstations"},
]

for mod in modules:
    mod_id = mod["id"]
    target_comp_path = os.path.join(base_app_dir, mod_id, mod["dir"], "page.jsx")
    
    if not os.path.exists(target_comp_path):
        print(f"Skipping {mod_id}, file not found at {target_comp_path}")
        continue
        
    with open(target_comp_path, "r") as f:
        content = f.read()
        
    if "CriticalExcelModal" not in content:
        # Inject import after lucide-react
        content = re.sub(
            r"(import \{[^}]+\} from 'lucide-react';\n)",
            r"\1import CriticalExcelModal from '../../components/CriticalExcelModal.jsx';\n",
            content
        )
        
        # If it wasn't matched (e.g. different import formatting)
        if "CriticalExcelModal" not in content:
            content = content.replace("import MenuLateral", "import CriticalExcelModal from '../../components/CriticalExcelModal.jsx';\nimport MenuLateral")
            
        # Inject component
        # Find: return (\n    <div className="h-[97vh] w-[99%] bg-[#fff] font-sans flex items-center justify-center relative">
        # Or just: <div className="h-[97vh] w-[99%] bg-[#fff] font-sans flex items-center justify-center relative">
        
        route = f"/{mod_id}/{mod['xml_dir']}"
        inject_tag = f"\n      <CriticalExcelModal xmlRoute=\"{route}\" />"
        
        # It's safer to look for 'return (' and the next <div>
        pattern = r"(return \(\s*<div[^>]+>)"
        content = re.sub(pattern, r"\1" + inject_tag, content, count=1)
        
        with open(target_comp_path, "w") as f:
            f.write(content)
            
        print(f"Added CriticalExcelModal to {mod_id}")
    else:
        print(f"Already added in {mod_id}")
