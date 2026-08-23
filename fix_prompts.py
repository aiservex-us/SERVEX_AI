import os

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
files = []
for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f == 'AI_contact.jsx':
            files.append(os.path.join(root, f))

modules_map = {
    'WBA': ('Accessories', 'WBA'),
    'WBD': ('Desks', 'WBD'),
    'WBG': ('Storage', 'WBG'),
    'WBO': ('Workstations', 'WBO'),
    'WBS': ('Seatings', 'WBS'),
    'WBT': ('Tables', 'WBT'),
    'LESRO': ('Lesro', 'LESRO')
}

old_prompts = """const QUICK_PROMPTS = [
  {icon: Shield, label: "RBAC Permissions", q: "How do I configure RBAC permissions on the platform?" },
  {icon: Activity, label: "ETL Flows", q: "Explain the architecture of the available ETL flows." },
];"""

for f in files:
    # Determine module
    module_name = 'Module'
    module_code = 'M'
    for k, v in modules_map.items():
        if f"/{k}/" in f:
            module_name = v[0]
            module_code = v[1]
            break
            
    new_prompts = f"""const QUICK_PROMPTS = [
  {{icon: BarChart2, label: "{module_name} Analysis", q: "Generate a summary of the most critical price variations in the {module_name} catalog." }},
  {{icon: Database, label: "{module_code} Integrity", q: "Verify the structure and alignment of the {module_code} master XML." }},
];"""

    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Check if the exact block is there
    if old_prompts in content:
        content = content.replace(old_prompts, new_prompts)
    else:
        # Maybe slightly different formatting
        start = content.find("const QUICK_PROMPTS = [")
        end = content.find("];", start) + 2
        if start != -1 and end != -1:
            content = content[:start] + new_prompts + content[end:]
            
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    
    print(f"Updated prompts in {f}")

