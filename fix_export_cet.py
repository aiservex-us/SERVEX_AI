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
        contact_path = os.path.join(mod_dir, xml_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
        if mod == 'LESRO':
            contact_path = os.path.join(mod_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
            
        if os.path.exists(contact_path):
            with open(contact_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            old_code = """    if (queryToSend.toLowerCase() === '/exportcetcsv') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Abriendo panel de Resultados y Exportación CSV de CET...', isNew: true }, { from: 'tool', toolId: 'exportCETcsv' }]);
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }"""
            
            new_code = """    if (queryToSend.toLowerCase() === '/exportcetcsv') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Abriendo panel principal de Resultados y Exportación CSV de CET...', isNew: true }]);
        if (typeof onOpenToolPanel === 'function') onOpenToolPanel('xml_results');
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }"""
            
            if old_code in content:
                content = content.replace(old_code, new_code)
                with open(contact_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Patched {mod}")
            else:
                print(f"Old code not found in {mod}")

