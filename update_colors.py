import os

mods = {
    "WBS": "WBS/Actualizer_XML_Seatings",
    "WBT": "WBT/Actualizer_XML_Tables",
    "WBO": "WBO/Actualizer_XML_Workstations",
    "WBD": "WBD/Actualizer_XML_Desks",
    "WBG": "WBG/Actualizer_XML"
}

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

for mod, path in mods.items():
    incert_path = f"{base_dir}/{path}/components/comparePDF/IncertData/components/incertXML.tsx"
    if os.path.exists(incert_path):
        with open(incert_path, "r") as f:
            content = f.read()
            
        content = content.replace(
            "'bg-green-100 text-green-700'",
            "'bg-[#464775]/10 text-[#464775]'"
        )
        content = content.replace(
            "'border-green-300 bg-green-50 hover:bg-green-100'",
            "'border-[#464775]/40 bg-[#464775]/5 hover:bg-[#464775]/10'"
        )
        content = content.replace(
            '<DatabaseZap className="mx-auto mb-2 text-green-600" size={20} />',
            '<DatabaseZap className="mx-auto mb-2 text-[#464775]" size={20} />'
        )
        content = content.replace(
            "? 'text-green-700' : 'text-[#242424]'",
            "? 'text-[#464775]' : 'text-[#242424]'"
        )
        content = content.replace(
            'className="text-[9px] text-green-600 mt-1"',
            'className="text-[9px] text-[#464775]/80 mt-1 font-medium"'
        )

        with open(incert_path, "w") as f:
            f.write(content)
        print(f"Updated {mod} incertXML.tsx")
