import os

files = {
    "/Users/glynne/Desktop/SERVEX_AI/app/WBD/Actualizer_XML_Desks/components/comparePDF/presentation_WBD.jsx": "WB Desks",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_XML_Workstations/components/comparePDF/presentation_WBO.jsx": "WB Workstations",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBA/components/comparePDF/presentation_WBA.jsx": "WB Accessories",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_XML_Tables/components/comparePDF/presentation_WBT.jsx": "WB Tables",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_XML/components/comparePDF/presentation_WBG.jsx": "WB General"
}

for f_path, expected_text in files.items():
    if os.path.exists(f_path):
        with open(f_path, 'r') as f:
            content = f.read()
        
        import re
        content = re.sub(r'Catalog Manager(\s+</span>)', expected_text + r'\1', content)
        content = content.replace("</div></div>\n\n    </div>", "</div>\n\n    </div>")
        content = content.replace("</div></div>\n    </div>", "</div>\n    </div>")
        
        with open(f_path, 'w') as f:
            f.write(content)
            
print("Fixed texts and tags.")
