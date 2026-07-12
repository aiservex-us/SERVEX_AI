import os
import re

app_dir = '/Users/glynne/Desktop/SERVEX_AI/app'

def patch_ejecutor_play(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Skip if already patched (e.g. WBS)
    if 'executeProcessCommand' in content:
        print(f"Already patched: {filepath}")
        return

    # 1. Add guard to ejecutarSegundoProceso
    content = content.replace('const ejecutarSegundoProceso = async () => {\n', 'const ejecutarSegundoProceso = async () => {\n    if (estadoProcesando) return;\n')

    # 2. Add useEffect before return (
    use_effect_code = """
  useEffect(() => {
    const handleTrigger = () => {
      ejecutarSegundoProceso();
    };
    window.addEventListener('executeProcessCommand', handleTrigger);
    return () => window.removeEventListener('executeProcessCommand', handleTrigger);
  }, [estadoProcesando]);

  return ("""
    content = content.replace('  return (', use_effect_code, 1)

    # 3. Remove the second button
    pattern = re.compile(r'(\n\s*{?/\*.*SEGUNDO BOTÓN.*\n)?\s*<div[^>]*>\s*<button[^>]*onClick={ejecutarSegundoProceso}[\s\S]*?</div>\s*</div>', re.MULTILINE)
    pattern2 = re.compile(r'\s*<div[^>]*>\s*<button[^>]*onClick={ejecutarSegundoProceso}[\s\S]*?</div>\s*</div>', re.MULTILINE)

    match = pattern.search(content)
    if not match:
        match = pattern2.search(content)
        
    if match:
        content = content[:match.start()] + '\n          {/* Botón removido: La ejecución ahora se hace vía AI Command (/executeProcess) */}' + content[match.end():]
    else:
        print(f"Warning: Could not find second button in {filepath}")

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched: {filepath}")

def patch_ai_contact(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if '/executeProcess' in content:
        print(f"Already patched: {filepath}")
        return

    # 1. Add to SLASH_COMMANDS
    if 'SLASH_COMMANDS = [' in content:
        content = re.sub(r"(SLASH_COMMANDS = \[[\s\S]*?)(\];)", r"\1  { id: 'execute', icon: Cpu, label: '/executeProcess', desc: 'Restructurar XML y comparar catálogo (Step 2)' },\n\2", content)
    
    # 2. Import Cpu if not imported
    if 'Cpu' not in content and 'lucide-react' in content:
        content = content.replace("import {\n", "import {\n  Cpu,")

    # 3. Add to sendMessage
    send_msg_patch = """
    if (queryToSend === '/executeProcess') {
      window.dispatchEvent(new Event('executeProcessCommand'));
    }

    try {"""
    
    content = content.replace('    try {', send_msg_patch, 1)

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched: {filepath}")

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file == 'EJECUTOR_PLAY.jsx':
            patch_ejecutor_play(os.path.join(root, file))
        elif file == 'AI_contact.jsx':
            patch_ai_contact(os.path.join(root, file))

