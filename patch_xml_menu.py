import os
import re

base_app_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
modules = [
    {"id": "LESRO", "dir": "Actualizer_XML_LESRO", "excel_dir": "Actualizer_Excel_LESRO"},
    {"id": "WBT", "dir": "Actualizer_XML_Tables", "excel_dir": "Actualizer_Excel_Tables"},
    {"id": "WBD", "dir": "Actualizer_XML_Desks", "excel_dir": "Actualizer_Excel_Desks"},
    {"id": "WBS", "dir": "Actualizer_XML_Seatings", "excel_dir": "Actualizer_Excel_Seatings"},
    {"id": "WBG", "dir": "Actualizer_XML_Graphics", "excel_dir": "Actualizer_Excel_Graphics"},
    {"id": "WBA", "dir": "Actualizer_XML_Accessories", "excel_dir": "Actualizer_Excel_Accessories"},
    {"id": "WBO", "dir": "Actualizer_XML_Workstations", "excel_dir": "Actualizer_Excel_Workstations"},
]

for mod in modules:
    mod_id = mod["id"]
    mod_dir = os.path.join(base_app_dir, mod_id, mod["dir"])
    target_comp_path = os.path.join(mod_dir, "components/menuLateral.jsx")
    
    if not os.path.exists(target_comp_path):
        print(f"Skipping {mod_id}, file not found at {target_comp_path}")
        continue
        
    with open(target_comp_path, "r") as f:
        content = f.read()
        
    # Check if already added
    if "excel_redirect" not in content:
        # Add the item to menuItems
        # Look for { id: 'dashboard', label: 'XML Results', icon: FileSpreadsheet, sub: 'Data' },
        link_str = f"/{mod_id}/{mod['excel_dir']}"
        new_item = f"  {{ id: 'excel_redirect', label: 'Exported XML Results', icon: FileSpreadsheet, sub: 'Data', link: '{link_str}' }},\n"
        
        # Replace the end of menuItems array
        content = content.replace(
            "{ id: 'dashboard', label: 'XML Results', icon: FileSpreadsheet, sub: 'Data' },",
            "{ id: 'dashboard', label: 'XML Results', icon: FileSpreadsheet, sub: 'Data' },\n" + new_item
        )
        
        # We need to make sure Next.js router is imported.
        if "useRouter" not in content:
            content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport { useRouter } from 'next/navigation';")
            
            # Inject router hook in the component
            content = content.replace(
                "const [searchQuery, setSearchQuery] = useState('');",
                "const router = useRouter();\n  const [searchQuery, setSearchQuery] = useState('');"
            )
            
        # Update onClick logic
        old_onclick = """onClick={() => {
                  if (item.id === 'incert_delete' && typeof window !== 'undefined' && window.innerWidth < 400) {
                    alert("This feature is only available on desktop.");
                    return;
                  }
                  setActive(item.id);"""
                  
        new_onclick = """onClick={() => {
                  if (item.link) {
                    router.push(item.link);
                    return;
                  }
                  if (item.id === 'incert_delete' && typeof window !== 'undefined' && window.innerWidth < 400) {
                    alert("This feature is only available on desktop.");
                    return;
                  }
                  setActive(item.id);"""
                  
        content = content.replace(old_onclick, new_onclick)
        
        with open(target_comp_path, "w") as f:
            f.write(content)
            
        print(f"Added excel_redirect to {mod_id}")
    else:
        print(f"Already added in {mod_id}")
