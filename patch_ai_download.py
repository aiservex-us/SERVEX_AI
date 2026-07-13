import os

app_dir = '/Users/glynne/Desktop/SERVEX_AI/app'

modules = {
    'WBS': 'WBS/Actualizer_XML_Seatings/components/comparePDF/REPORT/components/AI_contact.jsx',
    'WBT': 'WBT/Actualizer_XML_Tables/components/comparePDF/REPORT/components/AI_contact.jsx',
    'WBD': 'WBD/Actualizer_XML_Desks/components/comparePDF/REPORT/components/AI_contact.jsx',
    'WBO': 'WBO/Actualizer_XML_Workstations/components/comparePDF/REPORT/components/AI_contact.jsx',
    'WBA': 'WBA/components/comparePDF/REPORT/components/AI_contact.jsx',
    'WBG': 'WBG/Actualizer_XML/components/comparePDF/REPORT/components/AI_contact.jsx'
}

for mod, rel_path in modules.items():
    filepath = os.path.join(app_dir, rel_path)
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Import Download and supabase
    if "Download" not in content:
        content = content.replace("from 'lucide-react';", "Download,\n} from 'lucide-react';")
    if "supabaseClient" not in content:
        content = content.replace("import { marked } from \"marked\";", "import { marked } from \"marked\";\nimport { supabase } from '@/app/lib/supabaseClient';")

    # 2. Add SLASH_COMMANDS
    if "/DownloadResultXml" not in content:
        target_slash = "desc: 'Restructurar XML y comparar catálogo (Step 2)' },"
        if target_slash in content:
            content = content.replace(target_slash, target_slash + f"\n  {{ id: 'download', icon: Download, label: '/DownloadResultXml', desc: 'Descargar el XML resultante procesado' }},")
    
    # 3. Add logic in sendMessage
    logic_code = f"""
    if (userText.toLowerCase() === '/downloadresultxml') {{
      setMessages(prev => [...prev, {{ from: "user", text: userText, time: new Date().toLocaleTimeString([], {{ hour: '2-digit', minute: '2-digit' }}) }}]);
      setInput("");
      setIsLoading(true);
      
      try {{
        const {{ data, error }} = await supabase
          .from('ClientsSERVEX_{mod}')
          .select('xml_actualizer_raw')
          .eq('company_name', '{mod}')
          .single();

        if (error || !data || !data.xml_actualizer_raw) {{
          setMessages(prev => [...prev, {{ from: "bot", text: "❌ Error: No se encontró el archivo XML en la base de datos para {mod}.", time: new Date().toLocaleTimeString([], {{ hour: '2-digit', minute: '2-digit' }}) }}]);
        }} else {{
          const blob = new Blob([data.xml_actualizer_raw], {{ type: 'application/xml' }});
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', '{mod}.xml');
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setMessages(prev => [...prev, {{ from: "bot", text: "✅ Descarga iniciada. El archivo {mod}.xml ha sido guardado exitosamente.", time: new Date().toLocaleTimeString([], {{ hour: '2-digit', minute: '2-digit' }}) }}]);
        }}
      }} catch (err) {{
        setMessages(prev => [...prev, {{ from: "bot", text: "❌ Ocurrió un error inesperado al intentar descargar el XML.", time: new Date().toLocaleTimeString([], {{ hour: '2-digit', minute: '2-digit' }}) }}]);
      }} finally {{
        setIsLoading(false);
      }}
      return;
    }}
"""
    
    if "/downloadresultxml" not in content.lower():
        target_exec = "if (userText === '/executeProcess') {"
        if target_exec in content:
            content = content.replace(target_exec, logic_code + "\n    " + target_exec)
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched: {filepath}")
