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
    if xml_dir:
        contact_path = os.path.join(mod_dir, xml_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
        if mod == 'LESRO':
            contact_path = os.path.join(mod_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
            
        if os.path.exists(contact_path):
            with open(contact_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Add command definition
            target = "{id: 'import_cet', icon: Database, label: '/importCETxml', desc: 'Import CET XML', phase: 1, category: 'Export Data From CET or Client' },"
            new_cmd = "\n  {id: 'save_cet', icon: Database, label: '/SaveXMLcet', desc: 'Save uploaded CET XML Data', phase: 1, category: 'Export Data From CET or Client' },"
            
            if "id: 'save_cet'" not in content:
                content = content.replace(target, target + new_cmd)
                
            # Update regex to use SaveXMLcet (case insensitive or specific)
            content = content.replace("saveCETxml", "SaveXMLcet")
            
            # Update if condition
            content = content.replace("queryToSend.toLowerCase() === '/savecetxml'", "queryToSend.toLowerCase() === '/savexmlcet'")
                
            with open(contact_path, 'w', encoding='utf-8') as f:
                f.write(content)

    print(f"Fixed {mod}")

