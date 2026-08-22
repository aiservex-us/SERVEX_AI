import os

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
components = [
    'csvs.jsx',
    'csvs_updated.jsx',
    'perceo_XML_MASTER_pre_prosses.jsx',
    'perceo_XML_MASTER_post_prcess.jsx',
    'PDFsection.jsx'
]

orbs_code = """
                {/* ── BACKGROUND ORBS (Matching Chat) ── */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50/50">
                  <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[80px] orb-ring-1" />
                  <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-200/20 blur-[100px] orb-ring-2" />
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay" />
                </div>
"""

for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        file_path = os.path.join(root, f)
        
        # 1. Update page.jsx to include orbs
        if f == 'page.jsx' and ('WBS' in root or 'WBO' in root or 'WBA' in root or 'WBD' in root or 'WBT' in root or 'WBG' in root or 'LESRO' in root):
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            target = '<div className="absolute top-0 left-0 w-full h-full flex flex-col overflow-hidden min-w-[500px]">'
            if target in content and 'BACKGROUND ORBS' not in content:
                content = content.replace(target, target + orbs_code)
                with open(file_path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Added orbs to {file_path}")

        # 2. Make components transparent so orbs show through
        if f in components:
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Remove the bg-slate-50/50 we added before
            content = content.replace(
                'className="min-h-[90vh] bg-slate-50/50',
                'className="min-h-[90vh] bg-transparent relative z-10'
            )
            # Just in case PDFsection still has the gradient
            content = content.replace(
                'className="min-h-[90vh] bg-gradient-to-br from-[#F8F9FE] to-white',
                'className="min-h-[90vh] bg-transparent relative z-10'
            )
            # Table containers: we had `bg-transparent rounded-2xl...` which is good, but let's ensure it has `backdrop-blur-md` if it doesn't.
            # Actually, if we make the wrapper transparent, the inner table needs to have a slight backdrop blur so the text is readable over the orbs.
            content = content.replace(
                'className="bg-transparent rounded-2xl border border-slate-200 shadow-sm overflow-hidden',
                'className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden'
            )
            content = content.replace(
                'className="bg-transparent rounded-2xl border border-slate-200 shadow-sm flex flex-col',
                'className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm flex flex-col'
            )
            
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            
            print(f"Made transparent: {file_path}")

