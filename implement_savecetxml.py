import os
import re

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
modules = ['WBA', 'WBD', 'WBG', 'WBO', 'WBS', 'WBT', 'LESRO']

for mod in modules:
    mod_dir = os.path.join(base_path, mod)
    if not os.path.isdir(mod_dir): continue
    
    # 1. Patch AI_contact.jsx
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
            if "{ id: 'save_cet'," not in content:
                content = content.replace(
                    "{ id: 'import_cet', icon: Database, label: '/importCETxml', desc: 'Import CET XML', phase: 1, category: 'Export Data From CET or Client' },",
                    "{ id: 'import_cet', icon: Database, label: '/importCETxml', desc: 'Import CET XML', phase: 1, category: 'Export Data From CET or Client' },\n  { id: 'save_cet', icon: Database, label: '/saveCETxml', desc: 'Save uploaded CET XML Data', phase: 1, category: 'Export Data From CET or Client' },"
                )
            
            # Update regex
            content = content.replace(
                "importCETxml|exportCETcsv",
                "importCETxml|saveCETxml|exportCETcsv"
            )
            
            # Add action handler
            if "queryToSend.toLowerCase() === '/savecetxml'" not in content:
                handler_logic = """    if (queryToSend.toLowerCase() === '/savecetxml') {
      window.dispatchEvent(new CustomEvent('saveCETCatalogData'));
      setMessages(prev => [...prev, { from: 'bot', text: '✅ Ejecutando el proceso de guardado para la data CET XML...', isNew: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' }) }]);
      setIsLoading(false);
      setTimeout(() => scrollToBottom(true), 100);
      return;
    }
"""
                content = content.replace(
                    "if (queryToSend.toLowerCase() === '/savecatalog') {",
                    handler_logic + "    if (queryToSend.toLowerCase() === '/savecatalog') {"
                )
                
            with open(contact_path, 'w', encoding='utf-8') as f:
                f.write(content)

    # 2. Patch incertXML_excel.tsx
    excel_dir = None
    for d in os.listdir(mod_dir):
        if d.startswith('Actualizer_Excel_'):
            excel_dir = d
    if excel_dir:
        incert_path = os.path.join(mod_dir, excel_dir, 'components', 'IncertDataExcel', 'incertXML_excel.tsx')
        if not os.path.exists(incert_path):
            incert_path = incert_path.replace('.tsx', '.jsx')
            
        if os.path.exists(incert_path):
            with open(incert_path, 'r', encoding='utf-8') as f:
                incert_content = f.read()
                
            # Add listener logic before return
            listener_logic = """  // --- Global Event Listener for /saveCETxml ---
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  });
  useEffect(() => {
    const listener = () => handleSaveRef.current();
    window.addEventListener('saveCETCatalogData', listener);
    return () => window.removeEventListener('saveCETCatalogData', listener);
  }, []);

"""
            if "handleSaveRef.current = handleSave" not in incert_content:
                incert_content = incert_content.replace(
                    "  const showXmlExistingNotice = existingXml && !xmlContent && !readingXml;",
                    listener_logic + "  const showXmlExistingNotice = existingXml && !xmlContent && !readingXml;"
                )
                
            # Remove the button div
            button_div_pattern = re.compile(
                r'<div className="bg-\[#FAF9F8\] px-6 py-4 flex justify-end border-t border-gray-200">\s*<button.*?Save Catalog Data.*?</button>\s*</div>',
                re.DOTALL
            )
            incert_content = re.sub(button_div_pattern, '', incert_content)
            
            with open(incert_path, 'w', encoding='utf-8') as f:
                f.write(incert_content)
                
    print(f"Completed {mod}")

