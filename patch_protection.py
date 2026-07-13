import os
import re

app_dir = '/Users/glynne/Desktop/SERVEX_AI/app'

modules = {
    'WBS': 'WBS/Actualizer_XML_Seatings/page.jsx',
    'WBT': 'WBT/Actualizer_XML_Tables/page.jsx',
    'WBD': 'WBD/Actualizer_XML_Desks/page.jsx',
    'WBO': 'WBO/Actualizer_XML_Workstations/page.jsx',
    'WBG': 'WBG/Actualizer_XML/page.jsx'
}

for mod, rel_path in modules.items():
    filepath = os.path.join(app_dir, rel_path)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
            
        protection_code = f"""
  // 🔒 PROTECCIÓN DE RUTA DEL MÓDULO (Redirige si se borró el tenant o no hay delegación)
  useEffect(() => {{
    const checkDelegation = async () => {{
      try {{
        const {{ data: {{ user }} }} = await supabase.auth.getUser();
        if (!user) {{
          window.location.href = '/{mod}';
          return;
        }}
        
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'https://servex-ai-back.onrender.com';
        const res = await fetch(`${{apiURL}}/api/v1/module_delegation/{mod}`);
        const responseData = await res.json();
        
        if (!responseData.locked || (responseData.data && responseData.data.user_id !== user.id)) {{
          window.location.href = '/{mod}';
        }}
      }} catch (err) {{
        console.error('Delegation check failed', err);
      }}
    }};
    checkDelegation();
  }}, []);
"""

        # We need to insert this right after `const router = useRouter();`
        target = "const router = useRouter();"
        if target in content and "checkDelegation" not in content:
            new_content = content.replace(target, target + "\n" + protection_code)
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Patched protection in {filepath}")

