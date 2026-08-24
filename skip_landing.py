import os
import re

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
modules = ['WBA', 'WBD', 'WBG', 'WBO', 'WBS', 'WBT', 'LESRO']

for mod in modules:
    mod_dir = os.path.join(base_path, mod)
    if not os.path.isdir(mod_dir): continue
    
    xml_dir = None
    for d in os.listdir(mod_dir):
        if d.startswith('Actualizer_XML_'):
            xml_dir = d
            
    if not xml_dir:
        continue

    page_path = os.path.join(mod_dir, 'page.jsx')
        
    if os.path.exists(page_path):
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        redirect_url = f"/{mod}/{xml_dir}"
        
        # Add redirectUrl prop to ModuleDelegationGatekeeper
        if "redirectUrl=" not in content:
            content = re.sub(
                rf'<ModuleDelegationGatekeeper\s+moduleName="{mod}">', 
                f'<ModuleDelegationGatekeeper moduleName="{mod}" redirectUrl="{redirect_url}">', 
                content
            )
            
            # Optionally replace <Main1 /> or similar with a loader or just remove it to keep it clean
            # but leaving it is also fine since it won't be seen (the gatekeeper will push before rendering children).
            # Let's replace <Main1 /> with a simple loader to avoid flickering of the old UI if router.push takes a moment.
            content = re.sub(r'<Main1\s*/>', '<div className="flex justify-center items-center h-64"><div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></div></div>', content)
            # Some might have <Main /> instead of <Main1 />
            content = re.sub(r'<Main\s*/>', '<div className="flex justify-center items-center h-64"><div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-indigo-600 animate-spin"></div></div>', content)
            
            with open(page_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Patched landing page for {mod} to redirect to {redirect_url}")

