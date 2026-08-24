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
            
        # 1. Update BotMessage signature
        content = content.replace(
            "const BotMessage = \n({text, isNew, onType }) => {",
            "const BotMessage = \n({text, isNew, onType, onCommandSelect }) => {"
        )
        content = content.replace(
            "const BotMessage = ({text, isNew, onType }) => {",
            "const BotMessage = ({text, isNew, onType, onCommandSelect }) => {"
        )
        
        # 2. Update processedText logic
        old_processed_text = """  const processedText = useMemo(() => {
    if (!text) return "";
    if (text.includes('\\t') && !text.includes('|---')) {
      const lines = text.split('\\n');
      let inTable = false;
      let newText = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('\\t')) {
          const cols = line.split('\\t').map(c => c.trim().replace(/\\|/g, '-'));
          const mdRow = '| ' + cols.join(' | ') + ' |';
          if (!inTable) {
            inTable = true;
            newText.push(mdRow);
            newText.push('|' + cols.map(() => '---|').join(''));
          } else {
            newText.push(mdRow);
          }
        } else {
          inTable = false;
          newText.push(line);
        }
      }
      return newText.join('\\n');
    }
    return text;
  }, [text]);"""

        new_processed_text = """  const processedText = useMemo(() => {
    if (!text) return "";
    let finalStr = text;
    if (text.includes('\\t') && !text.includes('|---')) {
      const lines = text.split('\\n');
      let inTable = false;
      let newText = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('\\t')) {
          const cols = line.split('\\t').map(c => c.trim().replace(/\\|/g, '-'));
          const mdRow = '| ' + cols.join(' | ') + ' |';
          if (!inTable) {
            inTable = true;
            newText.push(mdRow);
            newText.push('|' + cols.map(() => '---|').join(''));
          } else {
            newText.push(mdRow);
          }
        } else {
          inTable = false;
          newText.push(line);
        }
      }
      finalStr = newText.join('\\n');
    }
    
    // Inject interactive command buttons BEFORE parsing markdown
    const COMMANDS_REGEX = /(\\/(?:importCETxml|exportCETcsv|compareCET|importBase|saveCatalog|deleteData|executeProcess|listPriceChanges|graphicsDashboard|aiResumen|DownloadResultXml|createAuditor))\\b/g;
    finalStr = finalStr.replace(COMMANDS_REGEX, '<button class="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md hover:bg-indigo-100 font-medium transition-colors cursor-pointer inline-flex items-center gap-1 mx-0.5 alysa-cmd-btn shadow-sm border border-indigo-100/50" data-cmd="$1">$1</button>');

    return finalStr;
  }, [text]);"""
        
        content = content.replace(old_processed_text, new_processed_text)
        
        # 3. Add handleClick and update return of BotMessage
        old_return = """  return (
    <div
      className="text-sm font-sans flex flex-col gap-1 w-full max-w-full overflow-x-auto overflow-y-hidden prose-light"
      dangerouslySetInnerHTML={{__html: marked.parse(displayedText) }}
    />
  );"""

        new_return = """  const handleClick = (e) => {
    const btn = e.target.closest('.alysa-cmd-btn');
    if (btn && onCommandSelect) {
      const cmd = btn.getAttribute('data-cmd');
      onCommandSelect(cmd);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="text-sm font-sans flex flex-col gap-1 w-full max-w-full overflow-x-auto overflow-y-hidden prose-light"
      dangerouslySetInnerHTML={{__html: marked.parse(displayedText) }}
    />
  );"""
        content = content.replace(old_return, new_return)
        
        # 4. Pass onCommandSelect down
        content = content.replace(
            "<BotMessage text={msg.text} isNew={msg.isNew} onType={scrollToBottom} />",
            "<BotMessage text={msg.text} isNew={msg.isNew} onType={scrollToBottom} onCommandSelect={handleCommandSelect} />"
        )
        
        with open(contact_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched BotMessage in {mod}")

