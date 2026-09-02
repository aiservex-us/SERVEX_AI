import os

def process_ai_contact_files():
    search_dirs = [
        '/Users/glynne/Desktop/SERVEX_AI/app',
    ]
    
    for root_dir in search_dirs:
        for root, _, files in os.walk(root_dir):
            for file in files:
                if file == 'AI_contact.jsx':
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r') as f:
                        content = f.read()
                    
                    original = content
                    content = content.replace("bg-white rounded-xl shadow-lg border border-slate-200", "bg-white/40 backdrop-blur-md rounded-xl shadow-lg border border-white/50")
                        
                    if content != original:
                        with open(filepath, 'w') as f:
                            f.write(content)
                        print(f"Updated {filepath}")

process_ai_contact_files()
