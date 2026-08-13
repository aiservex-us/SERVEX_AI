import re

files = [
    "/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_Excel_Tables/components/CET_Comparator.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations/components/CET_Comparator.jsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # The confirm color in the icon background: 'bg-[#5B5FC7]/10 text-[#5B5FC7]'
    content = content.replace("bg-[#5B5FC7]/10 text-[#5B5FC7]", "bg-[#7f1d1d]/10 text-[#7f1d1d]")
    
    # The confirm button: bg-[#5B5FC7] hover:bg-[#4F52B2]
    content = content.replace("bg-[#5B5FC7] rounded hover:bg-[#4F52B2]", "bg-[#7f1d1d] rounded hover:bg-[#5a1515]")

    with open(file_path, "w") as f:
        f.write(content)

print("Modal colors updated to red.")
