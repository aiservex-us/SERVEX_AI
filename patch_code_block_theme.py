import os

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
modules = ['WBA', 'WBD', 'WBG', 'WBO', 'WBS', 'WBT', 'LESRO']

old_code = """    code(token) {
      const orig = origRenderer.code.call(this, token);
      return `<div class="my-5 rounded-xl overflow-hidden bg-[#1e1e2e] shadow-lg border border-gray-800">
            <div class="px-4 py-2 bg-[#181825] border-b border-gray-800 flex items-center justify-between">
              <div class="flex gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              </div>
              <span class="text-[11px] font-medium text-gray-500 uppercase tracking-wider">${token.lang || 'text'}</span>
            </div>
            <div class="p-4 overflow-x-auto custom-scrollbar">
              ${orig.replace(/<pre><code[^>]*>/, '<pre class="text-[13px] text-gray-300 font-mono leading-relaxed inline-block"><code class="block">')}
            </div>
          </div>`;
    },"""

new_code = """    code(token) {
      const orig = origRenderer.code.call(this, token);
      return `<div class="my-5 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200">
            <div class="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div class="flex gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">${token.lang || 'text'}</span>
            </div>
            <div class="p-4 overflow-x-auto custom-scrollbar">
              ${orig.replace(/<pre><code[^>]*>/, '<pre class="text-[13px] text-slate-700 font-mono leading-relaxed inline-block"><code class="block">')}
            </div>
          </div>`;
    },"""

for mod in modules:
    mod_dir = os.path.join(base_path, mod)
    if not os.path.isdir(mod_dir): continue
    
    xml_dir = None
    for d in os.listdir(mod_dir):
        if d.startswith('Actualizer_XML_'):
            xml_dir = d
    if xml_dir:
        contact_path = os.path.join(mod_dir, xml_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
        if mod == 'LESRO':
            contact_path = os.path.join(mod_dir, 'components', 'comparePDF', 'REPORT', 'components', 'AI_contact.jsx')
            
        if os.path.exists(contact_path):
            with open(contact_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            if old_code in content:
                content = content.replace(old_code, new_code)
                with open(contact_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Patched {mod}")
            else:
                print(f"Code block not found in {mod} AI_contact.jsx")

