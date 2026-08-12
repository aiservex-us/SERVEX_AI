import os
import re

target_comp_path = "/Users/glynne/Desktop/SERVEX_AI/app/LESRO/components/menuLateral.jsx"
        
with open(target_comp_path, "r") as f:
    content = f.read()
    
# Check if already added
if "excel_redirect" not in content:
    link_str = "/LESRO/Actualizer_Excel_LESRO"
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
        
    print("Added excel_redirect to LESRO")
else:
    print("Already added in LESRO")
