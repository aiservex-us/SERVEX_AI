import glob
import os

files = glob.glob("/Users/glynne/Desktop/SERVEX_AI/app/**/AI_contact.jsx", recursive=True)

for path in files:
    with open(path, 'r') as f:
        content = f.read()

    # 1. Container bg
    content = content.replace(
        '<div className="w-full h-[88vh] flex flex-col bg-white font-sans text-gray-900 overflow-hidden">',
        '''<div className="relative w-full h-[88vh] flex flex-col font-sans text-gray-900 overflow-hidden">
      {/* --- FONDO ESTILO MAIN1 (SIN ANIMACIONES) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="/fondo.jpg" alt="Background" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-[#464775]/5 to-[#464775]/15" />
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[120%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/10 to-transparent border-l border-white/60 shadow-[1px_0_10px_rgba(0,0,0,0.03)]" />
        </div>
        <div className="absolute top-[5%] right-[15%] w-[40%] h-[100%] rotate-[15deg]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#464775]/5 to-transparent border-l border-white/50" />
        </div>
      </div>'''
    )

    # 2. Header
    content = content.replace(
        '<header className="h-[52px] flex-shrink-0 flex items-center justify-between px-5 bg-white border-b border-gray-100 z-50">',
        '<header className="relative z-10 h-[52px] flex-shrink-0 flex items-center justify-between px-5 bg-white/60 backdrop-blur-md border-b border-white/50">'
    )

    # 3. Main
    content = content.replace(
        '<main ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">',
        '<main ref={scrollContainerRef} className="relative z-10 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent">'
    )

    # 4. Hero box
    content = content.replace(
        'className="relative z-10 flex border border-gray-100/60 rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm shadow-sm"',
        'className="relative z-10 flex border border-white/60 rounded-xl overflow-hidden bg-white/60 backdrop-blur-md shadow-sm"'
    )
    content = content.replace(
        'border-r border-gray-100',
        'border-r border-white/50'
    )

    # 5. Quick prompts
    content = content.replace(
        'className="flex flex-col items-start gap-1.5 p-3.5 rounded-xl bg-white border border-gray-100 text-left hover:border-indigo-200 hover:bg-indigo-50/40 hover:-translate-y-px hover:shadow-md transition-all duration-200 group"',
        'className="flex flex-col items-start gap-1.5 p-3.5 rounded-xl bg-white/60 backdrop-blur-md border border-white/50 text-left hover:border-indigo-200 hover:bg-white/80 hover:-translate-y-px hover:shadow-md transition-all duration-200 group"'
    )

    # 6. Bot messages
    content = content.replace(
        ": 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'",
        ": 'bg-white/80 backdrop-blur-md text-gray-800 rounded-tl-sm border border-white/60'"
    )

    # 7. Typing indicator
    content = content.replace(
        'bg-white border border-gray-100 rounded-2xl rounded-tl-sm',
        'bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl rounded-tl-sm'
    )

    # 8. Footer
    content = content.replace(
        '<footer className="flex-shrink-0 px-5 py-3 pb-4 bg-white border-t border-gray-100 relative">',
        '<footer className="relative z-10 flex-shrink-0 px-5 py-3 pb-4 bg-white/40 backdrop-blur-md border-t border-white/50">'
    )

    # 9. Footer inner
    content = content.replace(
        'bg-white border border-gray-200 rounded-2xl relative',
        'bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl relative'
    )

    # 10. Footer meta row
    content = content.replace(
        'bg-gray-50/80 border-b border-gray-100 rounded-t-2xl',
        'bg-white/40 border-b border-white/50 rounded-t-2xl'
    )
    
    # 11. Slash Commands Menu
    content = content.replace(
        'bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden',
        'bg-white/80 backdrop-blur-md border border-white/60 rounded-xl shadow-xl z-50 overflow-hidden'
    )

    with open(path, 'w') as f:
        f.write(content)
        
    print(f"Patched {path}")

