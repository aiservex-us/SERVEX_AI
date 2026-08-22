import os
import glob
import re

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
files = []
for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f == 'ViewportGraphics.jsx' and 'aiReporting' in root:
            files.append(os.path.join(root, f))

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()

    # 1. Update background gradient
    content = content.replace(
        'className="flex-1 flex flex-col relative bg-[#FAFAFA] h-[100%] font-sans overflow-hidden"',
        'className="flex-1 flex flex-col relative bg-gradient-to-br from-[#F8F9FA] via-[#E2E8F0] to-[#CBD5E1] h-[100%] font-sans overflow-hidden"'
    )
    
    # 2. Update Header glassmorphism
    content = content.replace(
        'className="h-16 flex flex-shrink-0 items-center justify-between px-6 bg-white border-b border-[#EDEBE9] z-20"',
        'className="h-16 flex flex-shrink-0 items-center justify-between px-6 bg-white/60 backdrop-blur-md border-b border-white/50 shadow-sm z-20"'
    )

    # 3. Update CardContainer for Glassmorphism
    old_card = "className={`bg-white rounded-md border border-[#EDEBE9] p-5 flex flex-col lg:col-span-${colSpan} hover:shadow-sm transition-shadow h-[480px]`}"
    new_card = "className={`bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 flex flex-col lg:col-span-${colSpan} hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 h-[480px]`}"
    content = content.replace(old_card, new_card)
    
    # Remove the summaryNode grey background
    content = content.replace(
        'className="mb-4 p-3 bg-[#FAFAFA] border border-[#EDEBE9] rounded-md text-[11px] text-[#605E5C] max-h-[80px] overflow-y-auto"',
        'className="mb-4 p-3 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl text-[11px] text-[#605E5C] max-h-[80px] overflow-y-auto shadow-inner"'
    )

    # 4. Remove KPIs block
    # We will use regex to find the KPI block and remove it.
    kpi_regex = re.compile(r'\{\/\* KPIs \*\/.*?</div>\s*</div>\s*</div>\s*<div className="flex flex-col gap-6 mb-6">', re.DOTALL)
    
    if '{/* KPIs */}' in content:
        # manual replacement since regex with balanced tags is hard
        start_idx = content.find('{/* KPIs */}')
        end_idx = content.find('{/* 1. Catalog Stability Index */}')
        if start_idx != -1 and end_idx != -1:
            # We want to keep the `<div className="w-full max-w-6xl mx-auto">` which is before KPIs.
            # So we remove from start_idx to end_idx
            content = content[:start_idx] + content[end_idx:]
            
    # 5. Insert Framer Motion Variants and wrap grid
    # Find `return (`
    return_idx = content.find('return (')
    variants_code = """
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
  };

  """
    if 'containerVariants =' not in content:
        content = content[:return_idx] + variants_code + content[return_idx:]
        
    # Wrap <div className="w-full max-w-6xl mx-auto"> inner content with motion.div
    content = content.replace(
        '<div className="w-full max-w-6xl mx-auto">',
        '<div className="w-full max-w-6xl mx-auto">\n          <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-8">'
    )
    
    # We need to replace all `<div className="flex flex-col gap-6 mb-6">` with nothing, because we wrapped it all in one motion.div
    content = content.replace('<div className="flex flex-col gap-6 mb-6">', '')
    
    # We need to close the motion.div before the end of max-w-6xl.
    # The end of max-w-6xl is right before `</div>\n\n      </div>\n\n    </main>`
    # We can replace the end.
    content = content.replace(
        '        </div>\n\n      </div>\n\n    </main>',
        '          </motion.div>\n        </div>\n\n      </div>\n\n    </main>'
    )
    
    # 6. Wrap CardContainers in motion.div variants={itemVariants}
    # Find all `<CardContainer` and replace with `<motion.div variants={itemVariants}><CardContainer`
    # BUT wait, CardContainer can't just be wrapped if we don't close the motion.div.
    # Instead, let's wrap it inside the CardContainer component definition!
    old_card_def = """  const CardContainer = ({ title, children, explanation, colSpan = 1, summaryNode }) => (
    <div className={`bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 flex flex-col lg:col-span-${colSpan} hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 h-[480px]`}>"""
    
    new_card_def = """  const CardContainer = ({ title, children, explanation, colSpan = 1, summaryNode }) => (
    <motion.div variants={itemVariants} className={`bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 flex flex-col lg:col-span-${colSpan} hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 h-[480px]`}>"""
    
    content = content.replace(old_card_def, new_card_def)
    
    # And close the motion.div in CardContainer
    old_card_end = """      )}
    </div>
  );"""
    
    new_card_end = """      )}
    </motion.div>
  );"""
    content = content.replace(old_card_end, new_card_end)

    # Some old closing divs need to be cleaned up because we removed `<div className="flex flex-col gap-6 mb-6">`
    # That div was wrapping 1. Catalog Stability Index and 2. Transition Delta
    # Let's clean up the mismatched closing divs by simply counting them or doing targeted replace.
    # Let's fix the layout structure. The original had:
    # <div max-w-6xl>
    #   <div gap-6 mb-6> <Card 1/> <Card 2/> </div>
    #   <div gap-6 mb-6> <Card 3/> <Card 4/> </div>
    #   <div gap-6 mb-6> <Card 5/> </div>
    # </div>
    # If we removed `<div gap-6 mb-6>`, we now have 3 extra `</div>`s.
    content = content.replace('            </CardContainer>\n          </div>', '            </CardContainer>')
    
    # Put them all into a grid
    content = content.replace(
        '<motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-8">',
        '<motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-8">'
    )

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
        
    print(f"Patched {f}")
