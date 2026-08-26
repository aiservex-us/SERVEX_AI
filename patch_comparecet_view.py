import os

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
        # Patch page.jsx
        page_path = os.path.join(mod_dir, xml_dir, 'page.jsx')
        if os.path.exists(page_path):
            with open(page_path, 'r', encoding='utf-8') as f:
                page_content = f.read()
                
            if "case 'compare_cet':" not in page_content:
                page_content = page_content.replace(
                    "case 'compare': return <Compare />;",
                    "case 'compare': return <Compare />;\n      case 'compare_cet': return <CETComparator />;"
                )
                with open(page_path, 'w', encoding='utf-8') as f:
                    f.write(page_content)
                    
        # Patch AI_contact.jsx
        contact_path = os.path.join(mod_dir, xml_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
        if mod == 'LESRO':
            contact_path = os.path.join(mod_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
            
        if os.path.exists(contact_path):
            with open(contact_path, 'r', encoding='utf-8') as f:
                contact_content = f.read()
                
            old_code = """    if (queryToSend.toLowerCase() === '/comparecet') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Abriendo el Comparador CET...', isNew: true }, { from: 'tool', toolId: 'compareCET' }]);
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }"""
            
            new_code = """    if (queryToSend.toLowerCase() === '/comparecet') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Desplegando el Comparador CET en el panel principal...', isNew: true }]);
        if (typeof onOpenToolPanel === 'function') onOpenToolPanel('compare_cet');
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }"""
            
            if old_code in contact_content:
                contact_content = contact_content.replace(old_code, new_code)
                with open(contact_path, 'w', encoding='utf-8') as f:
                    f.write(contact_content)
                print(f"Patched {mod}")
            else:
                print(f"Code block not found in {mod} AI_contact.jsx")

