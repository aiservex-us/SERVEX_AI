import os

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
    target_comp_path = os.path.join(base_app_dir, mod_id, mod["dir"], "components/menuLateral.jsx")
    
    if not os.path.exists(target_comp_path):
        print(f"Skipping {mod_id}, file not found at {target_comp_path}")
        continue
        
    with open(target_comp_path, "r") as f:
        content = f.read()
        
    if "xml_redirect" not in content:
        # Import RefreshCcw
        if "RefreshCcw" not in content:
            # Try to inject after BarChart2, Activity
            if "Activity" in content:
                content = content.replace("Activity\n} from 'lucide-react';", "Activity, RefreshCcw\n} from 'lucide-react';")
            else:
                content = content.replace("} from 'lucide-react';", "  RefreshCcw\n} from 'lucide-react';")
                
        # We need to make sure Next.js router is imported.
        if "useRouter" not in content:
            content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport { useRouter } from 'next/navigation';")
            
            # Inject router hook in the component
            content = content.replace(
                "const [searchQuery, setSearchQuery] = useState('');",
                "const router = useRouter();\n  const [searchQuery, setSearchQuery] = useState('');"
            )
            
        # Update menuItems
        # We find the end of the menuItems array by looking for "];" immediately after the cet_comparator
        link_str = f"/{mod_id}/{mod['xml_dir']}"
        new_item = f"  {{ id: 'xml_redirect', label: 'Ejecutar Actualizacion de XML inicial!!', icon: RefreshCcw, sub: 'Action', link: '{link_str}' }}\n"
        
        # In the WBO file, it ends like:
        # { id: 'cet_comparator', label: 'CET XML Comparator', icon: Activity, sub: 'Audit' }
        # ];
        
        # It could have a trailing comma or not.
        import re
        content = re.sub(
            r"(\{ id: 'cet_comparator'[^\}]+\}),?\n\];", 
            r"\1,\n" + new_item + "];",
            content
        )
        
        # Update onClick logic
        old_onclick_1 = """onClick={() => {
                  if (item.id === 'incert_delete' && typeof window !== 'undefined' && window.innerWidth < 400) {
                    alert("This feature is only available on desktop.");
                    return;
                  }
                  setActive(item.id);"""
                  
        old_onclick_2 = """onClick={() => {
                  if (item.id === 'incert_delete' && typeof window !== 'undefined' && window.innerWidth < 400) {
                    alert("This feature is only available on desktop.");
                    return;
                  }
                  if (item.link) {
                    router.push(item.link);
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
        
        if "if (item.link)" not in content:
            content = content.replace(old_onclick_1, new_onclick)
            
        with open(target_comp_path, "w") as f:
            f.write(content)
            
        print(f"Added xml_redirect to {mod_id}")
    else:
        print(f"Already added in {mod_id}")
