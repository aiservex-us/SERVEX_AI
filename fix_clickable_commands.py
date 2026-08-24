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

    if mod == 'LESRO':
        contact_path = os.path.join(mod_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
    else:
        contact_path = os.path.join(mod_dir, xml_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
        
    if os.path.exists(contact_path):
        with open(contact_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 1. Remove the old injection logic from processedText
        old_injection = """    // Inject interactive command buttons BEFORE parsing markdown
    const COMMANDS_REGEX = /(\\/(?:importCETxml|exportCETcsv|compareCET|importBase|saveCatalog|deleteData|executeProcess|listPriceChanges|graphicsDashboard|aiResumen|DownloadResultXml|createAuditor))\\b/g;
    finalStr = finalStr.replace(COMMANDS_REGEX, '<button class="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md hover:bg-indigo-100 font-medium transition-colors cursor-pointer inline-flex items-center gap-1 mx-0.5 alysa-cmd-btn shadow-sm border border-indigo-100/50" data-cmd="$1">$1</button>');"""
        
        content = content.replace(old_injection, "")
        
        # 2. Add htmlContent useMemo before the return statement of BotMessage
        # We need to find the return statement of BotMessage.
        # It looks like:
        #   const handleClick = (e) => { ... };
        #   return (
        
        html_content_code = """
  const htmlContent = useMemo(() => {
    let html = "";
    if (typeof displayedText === 'string') {
        html = marked.parse(displayedText);
    } else {
        html = marked.parse(String(displayedText || ""));
    }
    
    // Inject interactive command buttons AFTER parsing markdown
    const COMMANDS_REGEX = /(\\/(?:importCETxml|exportCETcsv|compareCET|importBase|saveCatalog|deleteData|executeProcess|listPriceChanges|graphicsDashboard|aiResumen|DownloadResultXml|createAuditor))\\b/g;
    html = html.replace(COMMANDS_REGEX, '<button class="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md hover:bg-indigo-100 font-medium transition-colors cursor-pointer inline-flex items-center gap-1 mx-0.5 alysa-cmd-btn shadow-sm border border-indigo-100/50" data-cmd="$1">$1</button>');
    return html;
  }, [displayedText]);

"""
        
        content = content.replace(
            "  const handleClick = (e) => {",
            html_content_code + "  const handleClick = (e) => {"
        )
        
        # 3. Update the dangerouslySetInnerHTML
        content = content.replace(
            "dangerouslySetInnerHTML={{__html: marked.parse(displayedText) }}",
            "dangerouslySetInnerHTML={{__html: htmlContent }}"
        )
        
        with open(contact_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"Fixed clickable commands rendering in {mod}")

