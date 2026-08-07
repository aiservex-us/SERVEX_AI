import os

files = [
    "app/components/ModuleDelegationGatekeeper.jsx",
    "app/components/LesroGatekeeper.jsx",
    "app/panel/components/GlobalOnboarding.jsx"
]

search_text = 'className="min-h-screen bg-[#FFF] flex flex-col items-center justify-center"'
replace_text = 'className="fixed inset-0 z-[9999] w-screen h-screen bg-[#FFF] flex flex-col items-center justify-center overflow-hidden"'

for f_path in files:
    full_path = os.path.join("/Users/glynne/Desktop/SERVEX_AI", f_path)
    if os.path.exists(full_path):
        with open(full_path, "r") as f:
            content = f.read()
        
        if search_text in content:
            content = content.replace(search_text, replace_text)
            with open(full_path, "w") as f:
                f.write(content)
            print(f"Fixed {f_path}")
        else:
            print(f"Search text not found in {f_path}")
    else:
        print(f"File not found: {full_path}")
