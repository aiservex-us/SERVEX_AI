import os
import re

app_dir = '/Users/glynne/Desktop/SERVEX_AI/app'

def patch_ai_contact(filepath):
    parts = filepath.split('/')
    module = parts[parts.index('app') + 1]
    module_lower = module.lower()
    
    with open(filepath, 'r') as f:
        content = f.read()

    # Try exact replace first
    old_code = """    if (queryToSend === '/executeProcess') {
      window.dispatchEvent(new Event('executeProcessCommand'));
    }"""
    
    new_code = f"""    if (queryToSend === '/executeProcess') {{
      const nowTime = new Date().toLocaleTimeString([], {{ hour: '2-digit', minute: '2-digit' }});
      setMessages(prev => [...prev, {{ from: "bot", text: "⚙️ Iniciando motor ETL para procesamiento de catálogos en la nube ({module}). Por favor, espera...", time: nowTime }}]);
      
      try {{
        const formData = new FormData();
        formData.append('company_name', '{module}');
        
        const response = await fetch(`${{apiURL}}/{module_lower}/api/v1/pipeline/compare-only-{module}`, {{
          method: 'POST',
          body: formData,
        }});

        if (!response.ok) {{
          throw new Error('Falla en la respuesta del motor de comparación');
        }}
        
        await response.json();
        setMessages(prev => [...prev, {{ from: "bot", text: "✅ ¡Proceso ETL completado exitosamente! El catálogo ha sido reestructurado y comparado. Ya puedes revisar la auditoría en 'List Price Changes'.", time: new Date().toLocaleTimeString([], {{ hour: '2-digit', minute: '2-digit' }}) }}]);
      }} catch (err) {{
        setMessages(prev => [...prev, {{ from: "bot", text: `❌ Error durante la ejecución del proceso ETL: ${{err.message}}`, time: new Date().toLocaleTimeString([], {{ hour: '2-digit', minute: '2-digit' }}) }}]);
      }}
      setIsLoading(false);
      return;
    }}"""

    if old_code in content:
        content = content.replace(old_code, new_code)
        print(f"Patched (exact): {filepath}")
    else:
        # Regex fallback
        pattern = re.compile(r"if\s*\(queryToSend\s*===\s*'/executeProcess'\)\s*\{\s*window\.dispatchEvent\(new Event\('executeProcessCommand'\)\);\s*\}", re.MULTILINE)
        if pattern.search(content):
            content = pattern.sub(new_code, content)
            print(f"Patched (regex): {filepath}")
        else:
            print(f"Not found in: {filepath}")

    with open(filepath, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file == 'AI_contact.jsx':
            patch_ai_contact(os.path.join(root, file))

