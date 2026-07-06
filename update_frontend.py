import os

mods = {
    "WBS": "WBS/Actualizer_XML_Seatings",
    "WBO": "WBO/Actualizer_XML_Workstations",
    "WBD": "WBD/Actualizer_XML_Desks",
    "WBG": "WBG/Actualizer_XML"
}

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
wbt_file = f"{base_dir}/WBT/Actualizer_XML_Tables/components/comparePDF/REPORT/components/AI_contact.jsx"

with open(wbt_file, "r") as f:
    wbt_code = f.read()

for mod, path in mods.items():
    target_file = f"{base_dir}/{path}/components/comparePDF/REPORT/components/AI_contact.jsx"
    
    if os.path.exists(target_file):
        new_code = wbt_code.replace("/wbt/api/v1/agent/chat", f"/{mod.lower()}/api/v1/agent/chat")
        with open(target_file, "w") as f:
            f.write(new_code)
        print(f"Updated {target_file}")
    else:
        print(f"File not found: {target_file}")
