import os
import re

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
modules = ['WBA', 'WBD', 'WBG', 'WBO', 'WBT', 'LESRO']

for mod in modules:
    mod_dir = os.path.join(base_path, mod)
    if not os.path.isdir(mod_dir): continue
    
    xml_dir = None
    excel_dir = None
    for d in os.listdir(mod_dir):
        if d.startswith('Actualizer_XML_'):
            xml_dir = d
        elif d.startswith('Actualizer_Excel_'):
            excel_dir = d
            
    if not xml_dir or not excel_dir:
        continue

    # 1. Modify AI_contact.jsx
    if mod == 'LESRO':
        contact_path = os.path.join(mod_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
    else:
        contact_path = os.path.join(mod_dir, xml_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
        
    if os.path.exists(contact_path):
        with open(contact_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "/exportCETcsv" not in content:
            # Add to SLASH_COMMANDS
            content = content.replace(
                "{id: 'import_cet', icon: Database, label: '/importCETxml', desc: 'Import CET XML', phase: 1 },",
                "{id: 'import_cet', icon: Database, label: '/importCETxml', desc: 'Import CET XML', phase: 1 },\n  {id: 'exportCETcsv', icon: Download, label: '/exportCETcsv', desc: 'Export processed CET CSV', phase: 4 },\n  {id: 'compareCET', icon: Sparkles, label: '/compareCET', desc: 'Compare CET XML against Base', phase: 4 },"
            )
            
            # Add handlers
            export_handler = """
    if (queryToSend.toLowerCase() === '/exportcetcsv') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Abriendo panel de Resultados y Exportación CSV de CET...', isNew: true }, { from: 'tool', toolId: 'exportCETcsv' }]);
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }
    if (queryToSend.toLowerCase() === '/comparecet') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Abriendo el Comparador CET...', isNew: true }, { from: 'tool', toolId: 'compareCET' }]);
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }
"""
            content = content.replace(
                "if (queryToSend.toLowerCase() === '/listpricechanges') {",
                export_handler + "    if (queryToSend.toLowerCase() === '/listpricechanges') {"
            )
            
        with open(contact_path, 'w', encoding='utf-8') as f:
            f.write(content)

    # 2. Modify XML page.jsx
    xml_page_path = os.path.join(mod_dir, xml_dir, 'page.jsx')
    xml_results_name = "XMLResults" + mod
    if os.path.exists(xml_page_path):
        with open(xml_page_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Add CETComparator import
        if "CETComparator" not in content:
            content = content.replace(
                f"import ImportCETXml from '../{excel_dir}/components/IncertDataExcel/incertXML_excel';",
                f"import ImportCETXml from '../{excel_dir}/components/IncertDataExcel/incertXML_excel';\nimport CETComparator from '../{excel_dir}/components/CET_Comparator.jsx';"
            )
            
        # Fix import_cet_xml position in renderContent -> renderTool
        if "case 'import_cet_xml': return (" in content:
            # Remove it from active switch
            pattern = re.compile(r"\s*case 'import_cet_xml': return \(\s*<div className=\"w-full h-full p-2 overflow-y-auto\">\s*<ImportCETXml moduleName=\"[^\"]+\" />\s*</div>\s*\);")
            content = re.sub(pattern, "", content)
            
        if "case 'import_cet_xml': return <div" not in content:
            # Add to renderTool switch
            new_render_tool = f"                    case 'incert_delete': return <IncertDelete />;\n                    case 'import_cet_xml': return <div className=\"w-full h-full overflow-y-auto\"><ImportCETXml moduleName=\"{mod}\" /></div>;\n                    case 'exportCETcsv': return <{xml_results_name} />;\n                    case 'compareCET': return <CETComparator />;"
            
            content = content.replace(
                "case 'incert_delete': return <IncertDelete />;",
                new_render_tool
            )
            
        with open(xml_page_path, 'w', encoding='utf-8') as f:
            f.write(content)

    print(f"Patched {mod}")

