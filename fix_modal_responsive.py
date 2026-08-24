import os
import re

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
modules = ['WBA', 'WBD', 'WBG', 'WBO', 'WBS', 'WBT', 'LESRO']

for mod in modules:
    mod_dir = os.path.join(base_path, mod)
    if not os.path.isdir(mod_dir): continue
    
    xml_dir = None
    for d in os.listdir(mod_dir):
        if d.startswith('Actualizer_XML_'):
            xml_dir = d
            
    if not xml_dir:
        continue

    page_path = os.path.join(mod_dir, xml_dir, 'page.jsx')
        
    if os.path.exists(page_path):
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Old container: <div className="flex items-center justify-center h-full w-full p-6">
        content = content.replace(
            '<div className="flex items-center justify-center h-full w-full p-6">',
            '<div className="flex items-center justify-center h-full w-full p-4 sm:p-6">'
        )
        
        # Old modal class:
        # bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] 
        # rounded-3xl w-full max-w-4xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16
        # transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden relative
        # ${!isIntroDismissed ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto' : 'translate-y-12 scale-95 opacity-0 pointer-events-none'}
        
        old_classes = """bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] 
            rounded-3xl w-full max-w-4xl p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-10 lg:gap-16
            transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden relative
            ${!isIntroDismissed ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto' : 'translate-y-12 scale-95 opacity-0 pointer-events-none'}"""
            
        new_classes = """bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] 
            rounded-3xl w-full max-w-4xl p-6 md:p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-6 md:gap-10 lg:gap-16
            transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] relative
            max-h-[90vh] overflow-y-auto custom-scrollbar
            ${!isIntroDismissed ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto' : 'translate-y-12 scale-95 opacity-0 pointer-events-none'}"""
            
        content = content.replace(old_classes, new_classes)
        
        # Old logo class
        # className="w-72 lg:w-80 h-auto object-contain drop-shadow-2xl mb-8 transition-transform duration-700 hover:scale-105"
        content = content.replace(
            'className="w-72 lg:w-80 h-auto object-contain drop-shadow-2xl mb-8 transition-transform duration-700 hover:scale-105"',
            'className="w-48 md:w-64 lg:w-80 h-auto object-contain drop-shadow-2xl mb-4 md:mb-8 transition-transform duration-700 hover:scale-105"'
        )
        
        # Old H2 class
        # className="text-2xl lg:text-3xl font-light text-slate-800 tracking-tight mb-5 leading-tight"
        content = content.replace(
            'className="text-2xl lg:text-3xl font-light text-slate-800 tracking-tight mb-5 leading-tight"',
            'className="text-xl md:text-2xl lg:text-3xl font-light text-slate-800 tracking-tight mb-4 md:mb-5 leading-tight"'
        )
        
        # Old text <p> class
        # className="text-sm text-slate-500 leading-relaxed font-light mb-8"
        content = content.replace(
            'className="text-sm text-slate-500 leading-relaxed font-light mb-8"',
            'className="text-xs md:text-sm text-slate-500 leading-relaxed font-light mb-6 md:mb-8 text-justify md:text-left"'
        )
        
        # Old close button
        # className="absolute top-6 right-6 p-2 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors z-20"
        content = content.replace(
            'className="absolute top-6 right-6 p-2 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors z-20"',
            'className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-colors z-20"'
        )
        
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Patched modal in {mod}")

