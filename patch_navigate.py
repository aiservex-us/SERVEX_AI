import os

app_dir = '/Users/glynne/Desktop/SERVEX_AI/app'

# 1. Patch AI_contact.jsx
for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file == 'AI_contact.jsx':
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            target_str = "addMessage(\"✅ ¡Proceso ETL completado exitosamente! El catálogo ha sido reestructurado y comparado. Ya puedes revisar la auditoría en 'List Price Changes'.\", \"agent\");"
            replacement = target_str + "\n          window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'report' }));"
            
            if target_str in content and "window.dispatchEvent(new CustomEvent('navigateTo'" not in content:
                content = content.replace(target_str, replacement)
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Patched AI_contact: {filepath}")

# 2. Patch page.jsx in each module's main folder (Actualizer_XML_...)
module_paths = [
    'WBS/Actualizer_XML_Seatings',
    'WBT/Actualizer_XML_Tables',
    'WBD/Actualizer_XML_Desks',
    'WBO/Actualizer_XML_Workstations',
    'WBA',
    'WBG/Actualizer_XML'
]

for mod in module_paths:
    page_path = os.path.join(app_dir, mod, 'page.jsx')
    if os.path.exists(page_path):
        with open(page_path, 'r') as f:
            content = f.read()
        
        insert_code = """
  useEffect(() => {
    const handleNavigate = (e) => {
      if (e.detail) setActive(e.detail);
    };
    window.addEventListener('navigateTo', handleNavigate);
    return () => window.removeEventListener('navigateTo', handleNavigate);
  }, []);
"""
        # Insert right before the checkMobile useEffect
        target = "useEffect(() => {\n    const checkMobile"
        if target in content and "window.addEventListener('navigateTo'" not in content:
            content = content.replace(target, insert_code + "\n  " + target)
            with open(page_path, 'w') as f:
                f.write(content)
            print(f"Patched page.jsx: {page_path}")

