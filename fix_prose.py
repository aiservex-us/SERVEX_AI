import os

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
files = []
for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f == 'AI_contact.jsx':
            files.append(os.path.join(root, f))

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Add prose-light to the BotMessage className
    if 'className="text-sm font-sans flex flex-col gap-1 w-full max-w-full overflow-x-auto overflow-y-hidden"' in content:
        content = content.replace(
            'className="text-sm font-sans flex flex-col gap-1 w-full max-w-full overflow-x-auto overflow-y-hidden"',
            'className="text-sm font-sans flex flex-col gap-1 w-full max-w-full overflow-x-auto overflow-y-hidden prose-light"'
        )

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    
    print(f"Added prose-light to {f}")

