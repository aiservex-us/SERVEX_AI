import os
import re

files = [
    "/Users/glynne/Desktop/SERVEX_AI/app/WBD/Actualizer_XML_Desks/components/comparePDF/REPORT/dashboard.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_XML_Workstations/components/comparePDF/REPORT/dashboard.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBA/components/comparePDF/REPORT/dashboard.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_XML_Tables/components/comparePDF/REPORT/dashboard.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_XML/components/comparePDF/REPORT/dashboard.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBS/Actualizer_XML_Seatings/components/comparePDF/REPORT/dashboard.jsx"
]

for f_path in files:
    if os.path.exists(f_path):
        with open(f_path, 'r') as f:
            content = f.read()

        # Update card background class
        original_card_classes = "bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"
        new_card_classes = "bg-gradient-to-br from-[#464775]/10 via-[#464775]/5 to-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] backdrop-blur-sm"
        content = content.replace(original_card_classes, new_card_classes)

        # Update decorative blobs
        old_blobs = """                {/* Elementos decorativos de fondo de la card */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#464775]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />"""
        
        new_blobs = """                {/* Elementos decorativos sutiles de la card (estilo corporativo #464775) */}
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#464775]/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#464775]/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-[30%] left-[30%] w-[200px] h-[200px] bg-white/40 rounded-full blur-[60px] pointer-events-none" />"""
                
        content = content.replace(old_blobs, new_blobs)

        with open(f_path, 'w') as f:
            f.write(content)
            
print("Updated card styling in all dashboard.jsx files.")
