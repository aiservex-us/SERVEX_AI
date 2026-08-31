import os
import glob
import re

MODULES = ['WBS', 'WBA', 'WBO', 'WBD', 'LESRO']
BASE_DIR = '/Users/glynne/Desktop/SERVEX_AI/app'

def get_module_dir(mod):
    if mod == 'LESRO':
        return os.path.join(BASE_DIR, 'LESRO', 'Actualizer_XML_LESRO')
    if mod == 'WBS':
        return os.path.join(BASE_DIR, 'WBS', 'Actualizer_XML_Seatings')
    if mod == 'WBT':
        return os.path.join(BASE_DIR, 'WBT', 'Actualizer_XML_Tables')
    if mod == 'WBA':
        return os.path.join(BASE_DIR, 'WBA', 'Actualizer_XML_Accessories')
    if mod == 'WBO':
        return os.path.join(BASE_DIR, 'WBO', 'Actualizer_XML_Workstations')
    if mod == 'WBD':
        return os.path.join(BASE_DIR, 'WBD', 'Actualizer_XML_Desks')
    return None

def patch_page_jsx(path, mod):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if f"case 'incert_{mod.lower()}_csv_base'" in content:
        print(f"Skipping page.jsx for {mod}, already patched")
        return
        
    content = content.replace(
        "case 'incert_delete': return <IncertDelete />;",
        f"case 'incert_delete': return <IncertDelete step=\"xml\" />;\n                    case 'incert_{mod.lower()}_csv_base': return <IncertDelete step=\"csv_base\" />;\n                    case 'incert_{mod.lower()}_csv_new': return <IncertDelete step=\"csv_new\" />;"
    )
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched page.jsx for {mod}")

def patch_ai_contact(path, mod):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if f"handle{mod}ImportStep" not in content:
        import_step_code = f"""    const handle{mod}ImportStep = (e) => {{
        const {{ step }} = e.detail;
        if (step === 'csv_base') {{
            setMessages(prev => [...prev, {{ from: 'bot', text: 'XML guardado exitosamente. Ahora, por favor sube el archivo CSV Base.', isNew: true, time: new Date().toLocaleTimeString([], {{hour: '2-digit', minute: '2-digit'}}) }}, {{ from: 'tool', toolId: 'incert_{mod.lower()}_csv_base' }}]);
        }} else if (step === 'csv_new') {{
            setMessages(prev => [...prev, {{ from: 'bot', text: 'CSV Base guardado exitosamente. Finalmente, sube el archivo CSV Actualizado.', isNew: true, time: new Date().toLocaleTimeString([], {{hour: '2-digit', minute: '2-digit'}}) }}, {{ from: 'tool', toolId: 'incert_{mod.lower()}_csv_new' }}]);
        }} else if (step === 'done') {{
            setMessages(prev => [...prev, {{ from: 'bot', text: 'Todos los archivos han sido guardados exitosamente. El proceso de Ingestión ha concluido.', isNew: true, time: new Date().toLocaleTimeString([], {{hour: '2-digit', minute: '2-digit'}}) }}]);
            updatePhase(3);
        }}
        setTimeout(() => scrollToBottom(true), 100);
    }};
    window.addEventListener('{mod.lower()}ImportStep', handle{mod}ImportStep);

    return () => {{
      window.removeEventListener('globalChatMessage', handleGlobalMessage);
      window.removeEventListener('{mod.lower()}ImportStep', handle{mod}ImportStep);
    }};"""

        content = content.replace(
            "    return () => window.removeEventListener('globalChatMessage', handleGlobalMessage);\n  }, []);",
            import_step_code + "\n  }, []);"
        )
        print(f"Added handle{mod}ImportStep to AI_contact for {mod}")
    
    # Patch /importBase command to ask for XML directly
    target_cmd = """if (queryToSend.toLowerCase() === '/importbase') {
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'bot', text: 'Abriendo entorno de Ingestión de Datos en el chat...', isNew: true }, { from: 'tool', toolId: 'incert_delete' }]);"""
    replacement_cmd = f"""if (queryToSend.toLowerCase() === '/importbase') {{
      setTimeout(() => {{
        setMessages(prev => [...prev, {{ from: 'bot', text: 'Por favor, sube el archivo XML maestro de {mod}.', isNew: true }}, {{ from: 'tool', toolId: 'incert_delete' }}]);"""
    content = content.replace(target_cmd, replacement_cmd)

    # REMOVE /saveCatalog from SLASH_COMMANDS
    content = re.sub(r"\s*{\s*id:\s*'save',\s*icon:\s*Database,\s*label:\s*'/saveCatalog',\s*desc:\s*'Save uploaded XML/CSV Data',\s*phase:\s*2,\s*category:\s*'Step 1: Data Ingestion'\s*},", "", content)

    # Update regex
    content = content.replace("|saveCatalog", "")

    # Remove if (qLower === '/savecatalog' && unlockedPhase < 3) updatePhase(3);
    content = re.sub(r"^\s*if\s*\(qLower\s*===\s*'/savecatalog'.*\n", "", content, flags=re.MULTILINE)
    
    # Remove saveCatalog logic block
    save_catalog_logic = """    if (queryToSend.toLowerCase() === '/savecatalog') {
      window.dispatchEvent(new CustomEvent('saveCatalogData'));
      setMessages(prev => [...prev, { from: 'bot', text: '✅ Ejecutando el proceso de guardado y saneamiento de datos en la nube...', isNew: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' }) }]);
      setIsLoading(false);
      setTimeout(() => scrollToBottom(true), 100);
      return;
    }"""
    content = content.replace(save_catalog_logic, "")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched AI_contact for {mod}")

def patch_incert_data(path, mod):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "({ step })" in content:
        print(f"Skipping Incert_data.jsx for {mod}, already patched")
        return
        
    content = content.replace("const IncertData = () => {", "const IncertData = ({ step }) => {")
    content = content.replace("<InsertXML />", "<InsertXML step={step} />")
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched Incert_data.jsx for {mod}")

def patch_incert_xml(path, mod):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if "saveSingleStep" not in content:
        # Patch export component and step param
        content = content.replace("export default function UploadClientXML() {", "export default function UploadClientXML({ step = 'all' }: { step?: string }) {")

        # Patch readXMLFile
        xml_find = """        setXmlContent(e.target?.result as string);
        setMessage({ text: 'XML file loaded successfully', type: 'success' });
        setReadingXml(false);"""
        xml_repl = """        const content = e.target?.result as string;
        setXmlContent(content);
        setMessage({ text: 'XML file loaded successfully', type: 'success' });
        setReadingXml(false);
        if (step === 'xml') {
          saveSingleStep('xml', content);
        }"""
        content = content.replace(xml_find, xml_repl)

        # Patch readCSVFile
        csv_find = """        setCsvContent(e.target?.result as string);
        setMessage({ text: 'CSV Base file loaded successfully', type: 'success' });
        setReadingCsv(false);"""
        csv_repl = """        const content = e.target?.result as string;
        setCsvContent(content);
        setMessage({ text: 'CSV Base file loaded successfully', type: 'success' });
        setReadingCsv(false);
        if (step === 'csv_base') {
          saveSingleStep('csv_base', content);
        }"""
        content = content.replace(csv_find, csv_repl)

        # Patch readNewCSVFile
        csv_new_find = """        setCsvNewContent(e.target?.result as string);
        setMessage({ text: 'CSV Nuevo file loaded successfully', type: 'success' });
        setReadingNewCsv(false);"""
        csv_new_repl = """        const content = e.target?.result as string;
        setCsvNewContent(content);
        setMessage({ text: 'CSV Nuevo file loaded successfully', type: 'success' });
        setReadingNewCsv(false);
        if (step === 'csv_new') {
          saveSingleStep('csv_new', content);
        }"""
        content = content.replace(csv_new_find, csv_new_repl)

        save_single_step_code = f"""  const saveSingleStep = async (type: 'xml' | 'csv_base' | 'csv_new', rawContent: string) => {{
    setLoading(true);
    setMessage({{ text: 'Saving to Supabase...', type: null }});

    try {{
      const {{ data: {{ user }} }} = await supabase.auth.getUser();
      if (!user) {{
        setMessage({{ text: 'User not authorized', type: 'error' }});
        setLoading(false);
        return;
      }}

      const payload: any = {{
        company_name: '{mod}',
        user_id: user.id,
      }};

      if (type === 'xml') {{
        payload.xml_raw = rawContent;
      }} else if (type === 'csv_base') {{
        payload.csv_raw = sanitizeCSV(rawContent);
      }} else if (type === 'csv_new') {{
        payload.csv_new_raw = sanitizeCSV(rawContent);
        payload.CSV_final = sanitizeCSV(rawContent);
      }}

      const {{ error }} = await supabase
        .from('ClientsSERVEX_{mod}')
        .update(payload)
        .eq('user_id', user.id);

      if (error) {{
        console.error('Supabase Error:', error);
        setMessage({{ text: `DB Error: ${{error.message}}`, type: 'error' }});
      }} else {{
        setMessage({{ text: 'Saved successfully', type: 'success' }});
        if (type === 'xml') {{
            window.dispatchEvent(new CustomEvent('{mod.lower()}ImportStep', {{ detail: {{ step: 'csv_base' }} }}));
        }} else if (type === 'csv_base') {{
            window.dispatchEvent(new CustomEvent('{mod.lower()}ImportStep', {{ detail: {{ step: 'csv_new' }} }}));
        }} else if (type === 'csv_new') {{
            window.dispatchEvent(new CustomEvent('{mod.lower()}ImportStep', {{ detail: {{ step: 'done' }} }}));
        }}
      }}
    }} catch (err) {{
      console.error(err);
      setMessage({{ text: 'Unexpected error', type: 'error' }});
    }} finally {{
      setLoading(false);
    }}
  }};

  // --- Lógica de Saneamiento y Guardado ---"""
        
        content = content.replace("// --- Lógica de Saneamiento y Guardado ---", save_single_step_code)

        # Patch conditional UI Grid 1
        content = content.replace(
            '<div className="grid grid-cols-1 md:grid-cols-3 gap-3">\n                  {/* Drop Zone 1: XML */}',
            '<div className={`grid grid-cols-1 ${step === \'all\' ? \'md:grid-cols-3\' : \'md:grid-cols-1\'} gap-3`}>\n                  {/* Drop Zone 1: XML */}\n                  {(step === \'all\' || step === \'xml\') && ('
        )
        content = content.replace(
            'readXMLFile(file); }} />\n                  </div>\n\n                  {/* Drop Zone 2: Base CSV */}',
            'readXMLFile(file); }} />\n                  </div>\n                  )}\n\n                  {/* Drop Zone 2: Base CSV */}\n                  {(step === \'all\' || step === \'csv_base\') && ('
        )
        content = content.replace(
            'readCSVFile(file); }} />\n                  </div>\n\n                  {/* Drop Zone 3: New CSV */}',
            'readCSVFile(file); }} />\n                  </div>\n                  )}\n\n                  {/* Drop Zone 3: New CSV */}\n                  {(step === \'all\' || step === \'csv_new\') && ('
        )
        content = content.replace(
            'readNewCSVFile(file); }} />\n                  </div>\n\n                </div>',
            'readNewCSVFile(file); }} />\n                  </div>\n                  )}\n\n                </div>'
        )

        # Previews section
        preview_find = """                {/* Previews (3 Columns now) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">XML Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={xmlContent} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">CSV Base Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={csvContent} readOnly />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">New CSV Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={csvNewContent} readOnly />
                  </div>
                </div>"""
                    
        preview_repl = """                {/* Previews */}
                <div className={`grid grid-cols-1 ${step === 'all' ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-3`}>
                  {(step === 'all' || step === 'xml') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">XML Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={xmlContent} readOnly />
                  </div>
                  )}
                  {(step === 'all' || step === 'csv_base') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">CSV Base Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={csvContent} readOnly />
                  </div>
                  )}
                  {(step === 'all' || step === 'csv_new') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#242424]">New CSV Preview</label>
                    <textarea className="w-full text-[10px] font-mono rounded border border-gray-300 bg-[#F3F2F1] px-3 py-2 h-32 resize-none outline-none" value={csvNewContent} readOnly />
                  </div>
                  )}
                </div>"""
        
        content = content.replace(preview_find, preview_repl)

    # REMOVE handleSave
    # We can do this with a regex to remove the entire handleSave function block
    content = re.sub(r"\s*const handleSave = async \(\) => \{[\s\S]*?(?=\s*const showXmlExistingNotice)", "", content)

    # REMOVE saveCatalogData listener
    content = re.sub(r"\s*// --- Lógica de Evento Global para /saveCatalogData ---[\s\S]*?(?=\s*return \()", "", content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched incertXML.tsx for {mod}")

for mod in MODULES:
    print(f"Processing module: {mod}")
    base = get_module_dir(mod)
    if not base: continue
    
    page_jsx = os.path.join(base, 'page.jsx')
    ai_contact = os.path.join(base, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
    incert_data = os.path.join(base, 'components', 'comparePDF', 'IncertData', 'Incert_data.jsx')
    
    # incertXML can be .tsx or .jsx
    incert_xml_tsx = os.path.join(base, 'components', 'comparePDF', 'IncertData', 'components', 'incertXML.tsx')
    incert_xml_jsx = os.path.join(base, 'components', 'comparePDF', 'IncertData', 'components', 'incertXML.jsx')
    
    if os.path.exists(page_jsx): patch_page_jsx(page_jsx, mod)
    if os.path.exists(ai_contact): patch_ai_contact(ai_contact, mod)
    if os.path.exists(incert_data): patch_incert_data(incert_data, mod)
    
    if os.path.exists(incert_xml_tsx):
        patch_incert_xml(incert_xml_tsx, mod)
    elif os.path.exists(incert_xml_jsx):
        patch_incert_xml(incert_xml_jsx, mod)
    print("-" * 20)

print("Done")
