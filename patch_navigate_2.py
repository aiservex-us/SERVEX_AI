import os

app_dir = '/Users/glynne/Desktop/SERVEX_AI/app'

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file == 'AI_contact.jsx':
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            target_str = "setMessages(prev => [...prev, { from: \"bot\", text: \"✅ ¡Proceso ETL completado exitosamente! El catálogo ha sido reestructurado y comparado. Ya puedes revisar la auditoría en 'List Price Changes'.\", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);"
            replacement = target_str + "\n        window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'report' }));"
            
            if target_str in content and "window.dispatchEvent(new CustomEvent('navigateTo'" not in content:
                content = content.replace(target_str, replacement)
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Patched AI_contact: {filepath}")

