import os
import glob
import re

MODULES = ['WBS', 'WBA', 'WBO', 'WBD', 'LESRO', 'WBT', 'WBG']
BASE_DIR = '/Users/glynne/Desktop/SERVEX_AI/app'

def get_module_dirs(mod):
    excel_dir = None
    xml_dir = None
    if mod == 'LESRO':
        excel_dir = os.path.join(BASE_DIR, 'LESRO', 'Actualizer_Excel_LESRO')
        xml_dir = os.path.join(BASE_DIR, 'LESRO', 'Actualizer_XML_LESRO')
    if mod == 'WBS':
        excel_dir = os.path.join(BASE_DIR, 'WBS', 'Actualizer_Excel_Seatings')
        xml_dir = os.path.join(BASE_DIR, 'WBS', 'Actualizer_XML_Seatings')
    if mod == 'WBT':
        excel_dir = os.path.join(BASE_DIR, 'WBT', 'Actualizer_Excel_Tables')
        xml_dir = os.path.join(BASE_DIR, 'WBT', 'Actualizer_XML_Tables')
    if mod == 'WBA':
        excel_dir = os.path.join(BASE_DIR, 'WBA', 'Actualizer_Excel_Accessories')
        xml_dir = os.path.join(BASE_DIR, 'WBA', 'Actualizer_XML_Accessories')
    if mod == 'WBO':
        excel_dir = os.path.join(BASE_DIR, 'WBO', 'Actualizer_Excel_Workstations')
        xml_dir = os.path.join(BASE_DIR, 'WBO', 'Actualizer_XML_Workstations')
    if mod == 'WBD':
        excel_dir = os.path.join(BASE_DIR, 'WBD', 'Actualizer_Excel_Desks')
        xml_dir = os.path.join(BASE_DIR, 'WBD', 'Actualizer_XML_Desks')
    if mod == 'WBG':
        excel_dir = os.path.join(BASE_DIR, 'WBG', 'Actualizer_Excel_Storage')
        xml_dir = os.path.join(BASE_DIR, 'WBG', 'Actualizer_XML_Storage')
    
    return excel_dir, xml_dir

def patch_ai_contact(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # REMOVE /SaveXMLcet from SLASH_COMMANDS
    content = re.sub(r"\s*{\s*id:\s*'save_cet',\s*icon:\s*Database,\s*label:\s*'/SaveXMLcet',\s*desc:\s*'Save uploaded CET XML Data',\s*phase:\s*1,\s*category:\s*'Export Data From CET or Client'\s*},", "", content)

    # Update regex (remove SaveXMLcet)
    content = content.replace("SaveXMLcet|", "")

    # Remove SaveXMLcet logic block
    save_cet_logic = """    if (queryToSend.toLowerCase() === '/savexmlcet') {
      window.dispatchEvent(new CustomEvent('saveCETCatalogData'));
      setMessages(prev => [...prev, { from: 'bot', text: '✅ Ejecutando el proceso de guardado para la data CET XML...', isNew: true, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit' }) }]);
      setIsLoading(false);
      setTimeout(() => scrollToBottom(true), 100);
      return;
    }"""
    content = content.replace(save_cet_logic, "")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched AI_contact: {path}")

def patch_incert_xml_excel(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # If already patched, skip
    if "handleSave(content)" in content:
        print(f"Skipping {path} - already patched.")
        return

    # Patch readXMLFile
    read_find = """        setXmlContent(e.target?.result as string);
        setMessage({ text: 'XML file loaded successfully', type: 'success' });
        setReadingXml(false);"""
    read_repl = """        const content = e.target?.result as string;
        setXmlContent(content);
        setMessage({ text: 'XML file loaded successfully', type: 'success' });
        setReadingXml(false);
        handleSave(content);"""
    content = content.replace(read_find, read_repl)

    # Patch handleSave function signature and check
    save_find = """  const handleSave = async () => {
    setMessage({ text: '', type: null });
    
    if (!xmlContent.trim()) {"""
    save_repl = """  const handleSave = async (rawContent: string) => {
    setMessage({ text: '', type: null });
    
    if (!rawContent.trim()) {"""
    content = content.replace(save_find, save_repl)
    
    payload_find = """      const payload: any = {
        company_name: moduleName,
        user_id: user.id,
        XM_CET_import: xmlContent
      };"""
    payload_repl = """      const payload: any = {
        company_name: moduleName,
        user_id: user.id,
        XM_CET_import: rawContent
      };"""
    content = content.replace(payload_find, payload_repl)

    # REMOVE saveCETCatalogData listener block
    content = re.sub(r"\s*// --- Global Event Listener for /saveCETxml ---[\s\S]*?(?=\s*const showXmlExistingNotice)", "\n", content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched incertXML_excel.tsx: {path}")

for mod in MODULES:
    print(f"Processing module: {mod}")
    excel_dir, xml_dir = get_module_dirs(mod)
    if not xml_dir: continue
    
    ai_contact = os.path.join(xml_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
    incert_xml_excel = os.path.join(excel_dir, 'components', 'IncertDataExcel', 'incertXML_excel.tsx')
    
    if os.path.exists(ai_contact): 
        patch_ai_contact(ai_contact)
    if os.path.exists(incert_xml_excel): 
        patch_incert_xml_excel(incert_xml_excel)
    print("-" * 20)

print("Done")
