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
    
    # Add max-width: 100% to table CSS
    if '.prose-light table {' in content:
        content = content.replace(
            '.prose-light table {\n          width: 100%; border-collapse: collapse;',
            '.prose-light table {\n          width: 100%; max-width: 100%; border-collapse: collapse;'
        )
    
    # Add overflow-x-auto to BotMessage container
    if 'className="text-sm font-sans flex flex-col gap-1 w-full max-w-full"' in content:
        content = content.replace(
            'className="text-sm font-sans flex flex-col gap-1 w-full max-w-full"',
            'className="text-sm font-sans flex flex-col gap-1 w-full max-w-full overflow-x-auto overflow-y-hidden"'
        )
    
    # Add min-w-0 max-w-full to motion.div of the bubble
    if 'className={`py-2 text-[14.5px] leading-relaxed relative transition-all' in content:
        content = content.replace(
            'className={`py-2 text-[14.5px] leading-relaxed relative transition-all',
            'className={`py-2 text-[14.5px] leading-relaxed relative transition-all max-w-full overflow-hidden'
        )
        
    # And relative z-10 inside motion.div
    if '<div className="relative z-10">' in content:
        content = content.replace(
            '<div className="relative z-10">',
            '<div className="relative z-10 max-w-full overflow-hidden">'
        )
        
    # Also add prose-light to BotMessage directly in case it's missing (though it might be added via javascript or elsewhere)
    # Actually wait, BotMessage doesn't have prose-light in className?
    # Let's check.

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    
    print(f"Patched table width in {f}")

