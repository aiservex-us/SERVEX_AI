import os

FILES_TO_PATCH = [
    '/Users/glynne/Desktop/SERVEX_AI/app/LESRO/Actualizer_Excel_LESRO/components/XML_Results_LESRO.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBD/Actualizer_Excel_Desks/components/XML_Results_WBD.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations/components/XML_Results_WBO.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBA/Actualizer_Excel_Accessories/components/XML_Results_WBA.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBS/Actualizer_Excel_Seatings/components/XML_Results_WBS.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_Excel_Tables/components/XML_Results_WBT.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_Excel_Storage/components/XML_Results_WBG.jsx'
]

replacements = {
    "Advertencia de Escalabilidad": "Scalability Warning",
    "Este proceso de actualización y descarga de archivos de forma manual es <strong>ineficiente y propenso a errores</strong>.": 
    "The process of manually updating and downloading files is <strong>inefficient and prone to errors</strong>.",
    "Tener muchos archivos circulando y compartirlos manualmente no es eficiente. Es crítico <strong>modularizar el sistema</strong> para lograr una mejor escalabilidad.":
    "Having multiple files circulating and sharing them manually is not efficient. It is critical to <strong>modularize the system</strong> to achieve better scalability.",
    "Cancelar\n              </button>": "Cancel\n              </button>",
    "Entendido, descargar\n              </button>": "I understand, download\n              </button>"
}

for filepath in FILES_TO_PATCH:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for old_text, new_text in replacements.items():
        if old_text in content:
            content = content.replace(old_text, new_text)
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Translated to English successfully: {filepath}")
