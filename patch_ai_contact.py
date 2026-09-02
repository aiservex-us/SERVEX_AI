import os
import re

def process_ai_contact():
    search_dirs = [
        '/Users/glynne/Desktop/SERVEX_AI/app',
    ]
    
    for root_dir in search_dirs:
        for root, _, files in os.walk(root_dir):
            for file in files:
                if file == 'AI_contact.jsx':
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r') as f:
                        content = f.read()
                    
                    original = content
                    
                    # Look for the block handling 'csv_base'
                    # It typically looks like:
                    # if (step === 'csv_base') {
                    #     setMessages(prev => [...prev, { from: 'bot', text: 'XML guardado exitosamente. Ahora, por favor sube el archivo CSV Base.', isNew: true, time: ... }, { from: 'tool', toolId: 'incert_wbs_csv_base' }]);
                    # } else if (step === 'csv_new') {
                    
                    # We can use regex to replace the text and the toolId
                    # Match the first setMessages inside if (step === 'csv_base')
                    
                    pattern = r"(if\s*\(\s*step\s*===\s*'csv_base'\s*\)\s*\{.*?setMessages.*?text:\s*)'[^']*'(.*?toolId:\s*)'incert_[a-z0-9_]*csv_base'(.*?\})"
                    
                    def repl(match):
                        # We need to find the correct toolId for csv_new. It's usually the same prefix but ends in csv_new.
                        # Wait, let's just extract the module prefix.
                        old_tool = re.search(r"toolId:\s*'incert_([a-z0-9_]+)_csv_base'", match.group(0))
                        new_tool = ""
                        if old_tool:
                            prefix = old_tool.group(1)
                            new_tool = f"incert_{prefix}_csv_new"
                        else:
                            # fallback if it's just 'incert_csv_base'
                            new_tool = match.group(0).split("toolId: '")[1].split("'")[0].replace("csv_base", "csv_new")
                        
                        return match.group(1) + "'XML guardado exitosamente. El CSV Base ya está en el sistema. Ahora, por favor sube el archivo CSV Actualizado.'" + match.group(2) + f"'{new_tool}'" + match.group(3)

                    content = re.sub(pattern, repl, content, flags=re.DOTALL)
                    
                    if content != original:
                        with open(filepath, 'w') as f:
                            f.write(content)
                        print(f"Updated {filepath}")
                    else:
                        print(f"No changes made to {filepath}")

process_ai_contact()
