import os

filepath = '/Users/glynne/Desktop/SERVEX_AI/app/components/ModuleDelegationGatekeeper.jsx'
with open(filepath, 'r') as f:
    content = f.read()

target = "const { data: { user } } = await supabase.auth.getUser();\n      setCurrentUser(user);"
replacement = """const { data: { user } } = await supabase.auth.getUser();
      
      // 🔒 PROTECCIÓN DE RUTA PARA TRABAJADORES
      if (!user || user.app_metadata?.provider !== 'azure') {
        router.replace('/login');
        return;
      }
      
      setCurrentUser(user);"""

if target in content and "router.replace('/login')" not in content:
    new_content = content.replace(target, replacement)
    with open(filepath, 'w') as f:
        f.write(new_content)
    print("Patched Gatekeeper")
else:
    print("Target not found or already patched")
