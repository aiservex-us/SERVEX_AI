import os
import re

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

# 1. Update CriticalExcelModal.jsx
modal_path = os.path.join(base_dir, "components/CriticalExcelModal.jsx")
with open(modal_path, "r") as f:
    modal_content = f.read()

# Add moduleName prop
modal_content = modal_content.replace(
    "export default function CriticalExcelModal({ xmlRoute }) {",
    "export default function CriticalExcelModal({ xmlRoute, moduleName = 'default' }) {"
)

# Insert logic for WBT theme
theme_logic = """  const isWBT = moduleName === 'WBT';
  const theme = {
    primaryBg: isWBT ? 'bg-[#2563eb]' : 'bg-[#464775]',
    primaryBgHover: isWBT ? 'hover:bg-[#1d4ed8]' : 'hover:bg-[#36375a]',
    primaryText: isWBT ? 'text-[#2563eb]' : 'text-[#464775]',
    primaryGradient: isWBT ? 'from-[#2563eb]/40 via-[#2563eb]/10' : 'from-[#464775]/40 via-[#464775]/10',
    primaryGradientShape: isWBT ? 'from-[#2563eb]/60 to-[#2563eb]/20' : 'from-[#464775]/60 to-[#464775]/20',
    primaryShadow: isWBT ? 'shadow-[#2563eb]/25' : 'shadow-[#464775]/25',
    primaryBorderHover: isWBT ? 'hover:border-[#2563eb]/30' : 'hover:border-[#464775]/30',
    primaryFillBg: isWBT ? 'bg-[#2563eb]/10' : 'bg-[#464775]/10',
    primaryFillBgAlt: isWBT ? 'bg-[#2563eb]/5' : 'bg-[#464775]/5',
    primaryBorder: isWBT ? 'border-[#2563eb]/10' : 'border-[#464775]/10',
    shapeStyle: isWBT 
      ? { clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' } 
      : { borderRadius: '9999px' }
  };
"""
modal_content = modal_content.replace(
    "const router = useRouter();",
    "const router = useRouter();\n" + theme_logic
)

# Apply dynamic classes
# Let's just use Python's re.sub to carefully replace hardcoded '#464775' strings

modal_content = modal_content.replace("bg-gradient-to-b from-[#464775]/40 via-[#464775]/10", "bg-gradient-to-b ${theme.primaryGradient}")
modal_content = modal_content.replace("bg-gradient-to-br from-[#464775]/60 to-[#464775]/20", "bg-gradient-to-br ${theme.primaryGradientShape}")
modal_content = modal_content.replace("text-[#464775]", "${theme.primaryText}")
modal_content = modal_content.replace("bg-[#464775]", "${theme.primaryBg}")
modal_content = modal_content.replace("hover:bg-[#36375a]", "${theme.primaryBgHover}")
modal_content = modal_content.replace("shadow-[#464775]/25", "${theme.primaryShadow}")
modal_content = modal_content.replace("hover:border-[#464775]/30", "${theme.primaryBorderHover}")
modal_content = modal_content.replace("bg-[#464775]/5", "${theme.primaryFillBgAlt}")
modal_content = modal_content.replace("border-[#464775]/10", "${theme.primaryBorder}")
modal_content = modal_content.replace("from-[#464775]/10 to-[#464775]/5", "${theme.primaryFillBg} to-${theme.primaryFillBgAlt.replace('bg-', '')}")

# Replace rounded-full on the shapes with dynamic style
modal_content = modal_content.replace(
    "w-[180px] h-[180px] rounded-full",
    "w-[180px] h-[180px] ${!isWBT ? 'rounded-full' : ''}"
)
modal_content = modal_content.replace(
    "w-[140px] h-[140px] rounded-full",
    "w-[140px] h-[140px] ${!isWBT ? 'rounded-full' : ''}"
)
# Add shapeStyle to style props
modal_content = re.sub(
    r"(transform: 'rotateX[^']+',\n\s*boxShadow: '[^']+')",
    r"\1,\n                    ...theme.shapeStyle",
    modal_content
)

# To use template literals, we must convert className="..." to className={`...`} in affected elements
# This is tricky with simple string replace. Let's do it manually for the key divs.

# Left side container
modal_content = modal_content.replace(
    'className="hidden md:flex w-[40%] relative items-center justify-center overflow-hidden bg-gradient-to-b ${theme.primaryGradient} to-white p-10 border-r border-slate-100"',
    'className={`hidden md:flex w-[40%] relative items-center justify-center overflow-hidden bg-gradient-to-b ${theme.primaryGradient} to-white p-10 border-r border-slate-100`}'
)

# Shape 1
modal_content = modal_content.replace(
    'className="absolute top-[20%] left-[10%] w-[180px] h-[180px] ${!isWBT ? \'rounded-full\' : \'\'} bg-gradient-to-br ${theme.primaryGradientShape} backdrop-blur-xl border border-white/60 z-10"',
    'className={`absolute top-[20%] left-[10%] w-[180px] h-[180px] ${!isWBT ? \'rounded-full\' : \'\'} bg-gradient-to-br ${theme.primaryGradientShape} backdrop-blur-xl border border-white/60 z-10`}'
)

# Shape 2
modal_content = modal_content.replace(
    'className="absolute bottom-[20%] right-[10%] w-[140px] h-[140px] ${!isWBT ? \'rounded-full\' : \'\'} bg-white/40 backdrop-blur-lg border border-white/70"',
    'className={`absolute bottom-[20%] right-[10%] w-[140px] h-[140px] ${!isWBT ? \'rounded-full\' : \'\'} bg-white/40 backdrop-blur-lg border border-white/70`}'
)

# ShieldCheck icon
modal_content = modal_content.replace(
    'className="${theme.primaryText} mb-3"',
    'className={`${theme.primaryText} mb-3`}'
)

# Action Required pill
modal_content = modal_content.replace(
    'className="inline-flex items-center gap-2 rounded-full ${theme.primaryFillBgAlt} px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${theme.primaryText} mb-4 border ${theme.primaryBorder}"',
    'className={`inline-flex items-center gap-2 rounded-full ${theme.primaryFillBgAlt} px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${theme.primaryText} mb-4 border ${theme.primaryBorder}`}'
)

# Action Required pulse dot
modal_content = modal_content.replace(
    'className="w-1.5 h-1.5 rounded-full ${theme.primaryBg} animate-pulse"',
    'className={`w-1.5 h-1.5 rounded-full ${theme.primaryBg} animate-pulse`}'
)

# Feature 1 box
modal_content = modal_content.replace(
    'className="group flex gap-4 items-start p-4 bg-white rounded-2xl border border-slate-100 shadow-sm ${theme.primaryBorderHover} hover:shadow-md transition-all duration-300 cursor-default"',
    'className={`group flex gap-4 items-start p-4 bg-white rounded-2xl border border-slate-100 shadow-sm ${theme.primaryBorderHover} hover:shadow-md transition-all duration-300 cursor-default`}'
)
modal_content = modal_content.replace(
    'className="w-12 h-12 rounded-xl bg-gradient-to-br ${theme.primaryFillBg} to-${theme.primaryFillBgAlt.replace(\'bg-\', \'\')} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300"',
    'className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.primaryFillBg} to-${theme.primaryFillBgAlt.replace(\'bg-\', \'\')} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}'
)
modal_content = modal_content.replace(
    'className="w-6 h-6 ${theme.primaryText}"',
    'className={`w-6 h-6 ${theme.primaryText}`}'
)

# Feature 2 box
modal_content = modal_content.replace(
    'className="group flex gap-4 items-start p-4 bg-white rounded-2xl border border-slate-100 shadow-sm ${theme.primaryBorderHover} hover:shadow-md transition-all duration-300 cursor-default"',
    'className={`group flex gap-4 items-start p-4 bg-white rounded-2xl border border-slate-100 shadow-sm ${theme.primaryBorderHover} hover:shadow-md transition-all duration-300 cursor-default`}'
)

# Main Button
modal_content = modal_content.replace(
    'className="w-full sm:flex-1 px-6 py-3 rounded-xl text-[13px] font-bold text-white ${theme.primaryBg} ${theme.primaryBgHover} shadow-lg ${theme.primaryShadow} hover:shadow-xl hover:-translate-y-px transition-all flex items-center justify-center gap-2 group"',
    'className={`w-full sm:flex-1 px-6 py-3 rounded-xl text-[13px] font-bold text-white ${theme.primaryBg} ${theme.primaryBgHover} shadow-lg ${theme.primaryShadow} hover:shadow-xl hover:-translate-y-px transition-all flex items-center justify-center gap-2 group`}'
)

with open(modal_path, "w") as f:
    f.write(modal_content)

print("Updated CriticalExcelModal.jsx")

# 2. Update WBT page.jsx to pass moduleName="WBT"
page_path = os.path.join(base_dir, "WBT/Actualizer_Excel_Tables/page.jsx")
with open(page_path, "r") as f:
    page_content = f.read()

page_content = page_content.replace(
    '<CriticalExcelModal xmlRoute="/WBT/Actualizer_XML_Tables" />',
    '<CriticalExcelModal xmlRoute="/WBT/Actualizer_XML_Tables" moduleName="WBT" />'
)

with open(page_path, "w") as f:
    f.write(page_content)

print("Updated WBT page.jsx")

# 3. Update WBT presentation_excel.jsx
pres_path = os.path.join(base_dir, "WBT/Actualizer_Excel_Tables/components/presentation_excel.jsx")
with open(pres_path, "r") as f:
    pres_content = f.read()

# Replace all #464775 with #2563eb (blue-600)
pres_content = pres_content.replace("#464775", "#2563eb")

# Replace rounded-full on the glass shapes with a hexagon clipPath
shape_pattern = r"(rounded-full )(bg-[^ ]+ backdrop-blur-[^ ]+ border border-white/[0-9]+)"
# Wait, let's just do a blanket replace of "rounded-full" for the shapes.
# The shapes are on lines ~115+
# Let's use a function to only replace rounded-full in the shapes section
parts = pres_content.split("Decorative Floating 3D Glass Coins")
header = parts[0]
shapes_section = parts[1]

shapes_section = shapes_section.replace("rounded-full", "")
# add style clipPath to each style object in the shapes
shapes_section = re.sub(
    r"(style=\{\{\n?[^\}]+)(boxShadow: [^\}]+)(\n?\s*\}\})",
    r"\1\2,\n              clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'\3",
    shapes_section
)

pres_content = header + "Decorative Floating 3D Glass Coins" + shapes_section

with open(pres_path, "w") as f:
    f.write(pres_content)

print("Updated WBT presentation_excel.jsx")
