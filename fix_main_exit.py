import os
import re

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
modules = ['WBA', 'WBD', 'WBG', 'WBO', 'WBS', 'WBT', 'LESRO']

for mod in modules:
    file_path = os.path.join(base_path, mod, 'components', 'main.jsx')
    if not os.path.exists(file_path):
        print(f"Not found: {file_path}")
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Check if already added
    if 'showExitModal' in content:
        print(f"Already patched: {file_path}")
        continue
        
    # 1. Imports
    if 'import { useState' not in content:
        content = content.replace("import React from 'react';", "import React, { useState } from 'react';")
    else:
        if 'useState' not in content:
            content = content.replace("import React", "import React, { useState }")
            
    if 'import { useRouter }' not in content:
        content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport { useRouter } from 'next/navigation';")
        
    # lucide-react imports: add X, AlertCircle if not present
    lucide_match = re.search(r"import\s+{([^}]+)}\s+from\s+'lucide-react';", content)
    if lucide_match:
        imports = lucide_match.group(1)
        if 'X' not in imports:
            imports += ', X'
        if 'AlertCircle' not in imports:
            imports += ', AlertCircle'
        new_lucide = f"import {{{imports}}} from 'lucide-react';"
        content = content.replace(lucide_match.group(0), new_lucide)

    # 2. Add state
    # find const HeroSection = () => {
    # and insert state
    state_str = f"""
  const router = useRouter();
  const [showExitModal, setShowExitModal] = useState(false);
"""
    content = content.replace("const HeroSection = () => {", f"const HeroSection = () => {{{state_str}")
    
    # 3. Add modal & button
    # find <section className="relative min-h-[80vh]...
    section_match = re.search(r'<section className="relative min-h-[[^"]+].*?>', content)
    if section_match:
        section_tag = section_match.group(0)
        
        modal_code = f"""
      {{/* Back Button */}}
      <button 
        onClick={{() => setShowExitModal(true)}}
        className="absolute top-4 left-4 md:top-8 md:left-8 z-50 flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md border border-slate-200 rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-all shadow-sm"
      >
        <ArrowRight className="rotate-180" size={{14}} />
        <span className="text-[11px] font-semibold tracking-wide uppercase">Back to Panel</span>
      </button>

      {{/* Exit Modal */}}
      {{showExitModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={{() => setShowExitModal(false)}}
          />

          <div className="relative bg-white w-[440px] rounded-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 text-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <span className="text-[14px] font-bold text-[#242424]">Confirm exit</span>
              <button onClick={{() => setShowExitModal(false)}} className="text-slate-400 hover:text-slate-600">
                <X size={{18}} />
              </button>
            </div>

            <div className="px-8 py-6 flex gap-4">
              <div className="bg-[#C4314B]/10 p-2 h-fit rounded-full shrink-0">
                <AlertCircle size={{22}} className="text-[#C4314B]" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#242424] mb-1">
                  Do you want to return to the main panel?
                </p>
                <p className="text-[13px] text-[#616161] leading-relaxed">
                  You are about to leave the {mod} management area.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F5F5F5] flex justify-end gap-2 rounded-b-xl border-t border-slate-100">
              <button
                onClick={{() => setShowExitModal(false)}}
                className="px-4 py-1.5 text-[12px] font-semibold text-[#242424] bg-white border border-[#D1D1D1] rounded hover:bg-[#F0F0F0] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={{() => router.push('/panel')}}
                className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[#C4314B] rounded hover:bg-[#A3293E] transition-all shadow-sm"
              >
                Confirm and return
              </button>
            </div>
          </div>
        </div>
      )}}
"""
        content = content.replace(section_tag, section_tag + "\n" + modal_code)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched {file_path}")

