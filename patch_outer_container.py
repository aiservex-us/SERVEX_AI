import os

def process_outer():
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
                    
                    # WBS had this one
                    content = content.replace(
                        'className="w-full my-3 p-1 bg-white/40 backdrop-blur-md rounded-xl shadow-lg border border-white/50 overflow-hidden relative"',
                        'className="w-full my-3 p-1 bg-transparent overflow-hidden relative flex justify-center"'
                    )
                    
                    # The others had this one
                    content = content.replace(
                        'className="w-full my-3 p-1 bg-transparent rounded-2xl overflow-hidden relative"',
                        'className="w-full my-3 p-1 bg-transparent overflow-hidden relative flex justify-center"'
                    )
                    
                    if content != original:
                        with open(filepath, 'w') as f:
                            f.write(content)
                        print(f"Updated {filepath}")

process_outer()
