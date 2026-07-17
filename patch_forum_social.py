import re

file_path = "/Users/glynne/Desktop/SERVEX_AI/app/panel/components/PaginaInicial/components/main/Forum.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update Markdown styles
old_markdown = """  // Renderizado Markdown ultra limpio, quitando estilos pesados y sombras abrumadoras
  const renderMarkdown = (content) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-[1.05rem] font-bold text-slate-900 mb-2 mt-4 tracking-tight" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-sm font-semibold text-slate-800 mb-2 mt-4" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-[13px] font-semibold text-slate-800 mb-1 mt-3" {...props} />,
        p: ({node, ...props}) => <p className="mb-3 text-[13px] text-slate-700 leading-relaxed" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-0.5 mb-3 text-[13px] text-slate-700" {...props} />,
        table: ({node, ...props}) => (
          <div className="w-full overflow-x-auto my-3 border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-[11px]" {...props} />
          </div>
        ),
        thead: ({node, ...props}) => <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[9px]" {...props} />,
        th: ({node, ...props}) => <th className="px-3 py-2 whitespace-nowrap" {...props} />,
        td: ({node, ...props}) => <td className="px-3 py-2 border-b border-slate-100 text-slate-700 last:border-0" {...props} />,
        strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
      }}
    >"""

new_markdown = """  // Renderizado Markdown minimalista y corporativo para muro tipo red social
  const renderMarkdown = (content) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-[1.1rem] font-bold text-[#464775] mb-2 mt-4 tracking-tight" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-sm font-bold text-[#464775] mb-2 mt-4" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-[13px] font-bold text-[#464775] mb-1 mt-3" {...props} />,
        p: ({node, ...props}) => <p className="mb-3 text-[13px] text-slate-800 leading-relaxed" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-0.5 mb-3 text-[13px] text-slate-800" {...props} />,
        table: ({node, ...props}) => (
          <div className="w-full overflow-x-auto my-3 border border-gray-100 rounded-lg">
            <table className="w-full text-left border-collapse text-[11px]" {...props} />
          </div>
        ),
        thead: ({node, ...props}) => <thead className="bg-[#464775]/5 border-b border-gray-100 text-[#464775] uppercase tracking-wider font-bold text-[9px]" {...props} />,
        th: ({node, ...props}) => <th className="px-3 py-2 whitespace-nowrap" {...props} />,
        td: ({node, ...props}) => <td className="px-3 py-2 border-b border-gray-50 text-slate-800 last:border-0" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold text-[#464775]" {...props} />,
      }}
    >"""
content = content.replace(old_markdown, new_markdown)


# 2. Update the outer container to be pure white
old_root = """    <div className="relative w-full h-full flex flex-col font-sans overflow-hidden bg-transparent">
      {/* Background matching platform (glassmorphism/gradient) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img src="/fondo.jpg" alt="Background" className="w-full h-full object-cover opacity-30" onError={(e) => e.target.style.display='none'} />
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/80 via-[#464775]/5 to-[#464775]/15" />
      </div>"""
new_root = """    <div className="relative w-full h-full flex flex-col font-sans overflow-hidden bg-white">"""
content = content.replace(old_root, new_root)

# 3. Update header
old_header = '<header className="h-14 bg-white/60 backdrop-blur-md border-b border-white/50 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">'
new_header = '<header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">'
content = content.replace(old_header, new_header)

# 4. Update the article posts to be flat and separated by a subtle border like a social feed
old_article = 'className="border border-white/50 rounded-xl bg-white/70 backdrop-blur-sm p-4 mb-4 flex gap-3 transition-colors hover:bg-white/90 shadow-sm"'
new_article = 'className="border-b border-gray-100 bg-white py-6 flex gap-3 hover:bg-gray-50/30 transition-colors"'
content = content.replace(old_article, new_article)

# 5. Fix z-index on main scroll container and the feed container width
old_main_scroll = '<main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent z-10 relative">'
new_main_scroll = '<main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">'
content = content.replace(old_main_scroll, new_main_scroll)

old_main_container = '<div className="relative z-10 w-[90%] mx-auto py-6 px-4 sm:px-0 flex flex-col">'
new_main_container = '<div className="w-[90%] mx-auto py-2 sm:px-0 flex flex-col">'
content = content.replace(old_main_container, new_main_container)


# 6. Change #module.key_Audit to use the platform color
old_hashtag = 'className="inline-block text-[10px] font-semibold text-blue-600 mb-2"'
new_hashtag = 'className="inline-block text-[10px] font-bold text-[#464775] mb-2"'
content = content.replace(old_hashtag, new_hashtag)

with open(file_path, "w") as f:
    f.write(content)
