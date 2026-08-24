import os
import re

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
modules = ['WBA', 'WBD', 'WBG', 'WBO', 'WBS', 'WBT', 'LESRO']

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

    # 1. Get the component names from Excel page.jsx
    excel_page_path = os.path.join(mod_dir, excel_dir, 'page.jsx')
    xml_results_name = "XMLResults" + mod
    if os.path.exists(excel_page_path):
        with open(excel_page_path, 'r', encoding='utf-8') as f:
            c = f.read()
            match = re.search(r"import (XMLResults\w+) from", c)
            if match:
                xml_results_name = match.group(1)
                
    # 2. Modify XML menuLateral.jsx
    menu_path = os.path.join(mod_dir, xml_dir, 'components', 'menuLateral.jsx')
    if os.path.exists(menu_path):
        with open(menu_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add to menuItems
        if "id: 'xml_results'" not in content:
            new_item = "  { id: 'xml_results', label: 'XML Results', icon: FileSpreadsheet, sub: 'Data' },\n"
            content = content.replace("  { id: 'kanban',", new_item + "  { id: 'kanban',")
            
        with open(menu_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    # 3. Modify AI_contact.jsx
    # Note: LESRO AI_contact is in a different path
    if mod == 'LESRO':
        contact_path = os.path.join(mod_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
    else:
        contact_path = os.path.join(mod_dir, xml_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
        
    if os.path.exists(contact_path):
        with open(contact_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "/importCETxml" not in content:
            content = content.replace(
                "const SLASH_COMMANDS = [",
                "const SLASH_COMMANDS = [\n  {id: 'import_cet', icon: Database, label: '/importCETxml', desc: 'Import CET XML', phase: 1 },"
            )
            
            export_handler = """
    if (queryToSend.toLowerCase() === '/importcetxml') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Abriendo entorno de Ingestión de Datos CET en el chat...', isNew: true }, { from: 'tool', toolId: 'import_cet_xml' }]);
        setIsLoading(false);
        scrollToBottom(true);
      }, 500);
      return;
    }
"""
            content = content.replace(
                "if (queryToSend.toLowerCase() === '/importbase') {",
                export_handler + "if (queryToSend.toLowerCase() === '/importbase') {"
            )
            
        with open(contact_path, 'w', encoding='utf-8') as f:
            f.write(content)

    # 4. Modify XML page.jsx
    xml_page_path = os.path.join(mod_dir, xml_dir, 'page.jsx')
    if os.path.exists(xml_page_path):
        with open(xml_page_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Add imports
        if "ImportCETXml" not in content:
            imports = f"""
import {xml_results_name} from '../{excel_dir}/components/XML_Results_{mod}.jsx';
import ImportCETXml from '../{excel_dir}/components/IncertDataExcel/incertXML_excel';
"""
            # Handle special cases where file ends differently
            if mod == 'LESRO':
                imports = imports.replace(f'XML_Results_{mod}.jsx', f'XML_Results_LESRO.jsx')
            
            content = content.replace("'use client';", "'use client';" + imports)
            
        # Add to renderTool
        if "case 'import_cet_xml':" not in content:
            render_tool = """
        case 'import_cet_xml': return (
          <div className="w-full h-full p-2 overflow-y-auto">
            <ImportCETXml moduleName=""" + f'"{mod}"' + """ />
          </div>
        );
"""
            content = content.replace(
                "case 'kanban': return <PriceProduct />;",
                render_tool + "                    case 'kanban': return <PriceProduct />;"
            )
            
        # Add to renderContent
        if "case 'xml_results':" not in content:
            content = content.replace(
                "case 'kanban': return <PriceProduct />;",
                f"case 'xml_results': return <{xml_results_name} />;\n      case 'kanban': return <PriceProduct />;"
            )
            
        with open(xml_page_path, 'w', encoding='utf-8') as f:
            f.write(content)

    print(f"Integrated {mod}")

