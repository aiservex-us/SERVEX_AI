import re
import os

file_path = "/Users/glynne/Desktop/SERVEX_AI/app/panel/components/PaginaInicial/components/main/Forum.jsx"

with open(file_path, "r") as f:
    content = f.read()

# 1. Update the outer container to have the background gradient (similar to other components)
old_root = '<div className="w-full h-full flex flex-col bg-white font-sans overflow-hidden">'
new_root = """<div className="relative w-full h-full flex flex-col font-sans overflow-hidden bg-transparent">
      {/* Background matching platform (glassmorphism/gradient) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="/fondo.jpg" alt="Background" className="w-full h-full object-cover opacity-30" onError={(e) => e.target.style.display='none'} />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-[#464775]/5 to-[#464775]/15" />
      </div>"""
content = content.replace(old_root, new_root)

# 2. Update the header styling to match glassmorphism
old_header = '<header className="h-14 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">'
new_header = '<header className="h-14 bg-white/60 backdrop-blur-md border-b border-white/50 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">'
content = content.replace(old_header, new_header)

# 3. Update the main feed container width to 90% instead of 600px
old_main = '<div className="w-full max-w-[600px] mx-auto py-6 px-4 sm:px-0 flex flex-col">'
new_main = '<div className="relative z-10 w-[90%] mx-auto py-6 px-4 sm:px-0 flex flex-col">'
content = content.replace(old_main, new_main)

# 4. Update the article backgrounds to have glassmorphism
old_article = 'className="border-b border-slate-200 bg-white py-4 flex gap-3 transition-colors hover:bg-slate-50/50"'
new_article = 'className="border border-white/50 rounded-xl bg-white/70 backdrop-blur-sm p-4 mb-4 flex gap-3 transition-colors hover:bg-white/90 shadow-sm"'
content = content.replace(old_article, new_article)

# 5. Fix z-index on main to appear above background
old_main_scroll = '<main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">'
new_main_scroll = '<main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent z-10 relative">'
content = content.replace(old_main_scroll, new_main_scroll)

with open(file_path, "w") as f:
    f.write(content)

