import os

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
files = []
for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f == 'incertXML.tsx':
            files.append(os.path.join(root, f))

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Outer container padding and rounded corners
    content = content.replace(
        'className="w-full flex font-sans text-[#242424] relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"',
        'className="w-full flex font-sans text-[#242424] relative bg-white/50 backdrop-blur-md border border-white/60 rounded-xl p-3 shadow-sm"'
    )
    
    # Also adjust flex-1 gap
    content = content.replace(
        '<div className="flex-1 flex flex-col gap-6">',
        '<div className="flex-1 flex flex-col gap-3">'
    )
    
    # 2. Grid gap
    content = content.replace(
        '<div className="grid grid-cols-1 md:grid-cols-3 gap-6">',
        '<div className="grid grid-cols-1 md:grid-cols-3 gap-3">'
    )
    
    # 3. Drop zone borders and padding
    content = content.replace(
        'className={`border-2 border-dashed rounded-md p-4 text-center transition-all cursor-pointer',
        'className={`border border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer'
    )
    
    # 4. Margins and text sizes inside drop zones
    content = content.replace('size={28}', 'size={20}')
    content = content.replace('mb-2', 'mb-1.5')
    content = content.replace('mt-3', 'mt-1.5')
    
    content = content.replace(
        '<p className="text-[10px] sm:text-xs text-slate-500 mt-1 font-medium">',
        '<p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 font-medium leading-tight">'
    )
    
    content = content.replace(
        'px-2 py-1 rounded-full',
        'px-1.5 py-0.5 rounded-full'
    )

    # Make the "Save" button section smaller
    content = content.replace(
        '<div className="flex justify-end pt-4 border-t border-white/20">',
        '<div className="flex justify-end pt-3 mt-1 border-t border-slate-200/50">'
    )
    
    content = content.replace(
        'px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md',
        'px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm'
    )
    
    # For some modules it might be px-8 py-3
    content = content.replace(
        'px-8 py-3 rounded-xl text-sm font-semibold shadow-md',
        'px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm'
    )
    
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)
        
    print(f"Patched {file_path}")

