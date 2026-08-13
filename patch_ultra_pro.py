import os
import re

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

# 1. Patch CriticalExcelModal.jsx
modal_path = os.path.join(base_dir, "components/CriticalExcelModal.jsx")
with open(modal_path, "r") as f:
    modal_content = f.read()

# Replace the theme definition
new_theme = """  const theme = {
    primaryBg: isWBT ? 'bg-[#2c3e50]' : 'bg-[#464775]',
    primaryBgHover: isWBT ? 'hover:bg-[#1a252f]' : 'hover:bg-[#36375a]',
    primaryText: isWBT ? 'text-[#2c3e50]' : 'text-[#464775]',
    primaryGradient: isWBT ? 'from-[#2c3e50]/30 via-[#2c3e50]/5' : 'from-[#464775]/40 via-[#464775]/10',
    primaryGradientShape: isWBT ? 'from-[#2c3e50]/60 to-[#1a252f]/30' : 'from-[#464775]/60 to-[#464775]/20',
    primaryShadow: isWBT ? 'shadow-[#2c3e50]/30' : 'shadow-[#464775]/25',
    primaryBorderHover: isWBT ? 'hover:border-[#2c3e50]/30' : 'hover:border-[#464775]/30',
    primaryFillBg: isWBT ? 'bg-[#2c3e50]/15' : 'bg-[#464775]/10',
    primaryFillBgAlt: isWBT ? 'bg-[#2c3e50]/5' : 'bg-[#464775]/5',
    primaryBorder: isWBT ? 'border-[#2c3e50]/20' : 'border-[#464775]/10',
    shapeStyle: isWBT 
      ? { clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' } 
      : { borderRadius: '9999px' }
  };"""

modal_content = re.sub(r"const theme = \{[^}]+\};", new_theme, modal_content)

# We need to wrap the shapes in a drop-shadow container if they are WBT.
# Actually, we can just apply filter drop-shadow to the parent container of the shapes.
# In CriticalExcelModal, the shapes are inside a div with absolute inset-0 z-0
modal_content = modal_content.replace(
    'className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: \'1200px\' }}',
    'className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: \'1200px\', filter: isWBT ? \'drop-shadow(0 20px 30px rgba(0,0,0,0.15))\' : \'none\' }}'
)

with open(modal_path, "w") as f:
    f.write(modal_content)

print("Updated CriticalExcelModal.jsx")

# 2. Patch presentation_excel.jsx for WBT
pres_path = os.path.join(base_dir, "WBT/Actualizer_Excel_Tables/components/presentation_excel.jsx")
with open(pres_path, "r") as f:
    pres_content = f.read()

# Replace #2563eb with #2c3e50 globally
pres_content = pres_content.replace("#2563eb", "#2c3e50")

# Re-design the shapes section completely
parts = pres_content.split("Decorative Floating 3D Glass Coins")
header = parts[0]
footer = parts[1].split("absolute top-12 right-12 cursor-pointer group z-20")[1]

# Ultra-pro 3D hexagon shapes
shapes_html = """Decorative Floating 3D Glass Hexagons (Ultra Pro) */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px', filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.1)) drop-shadow(0 5px 15px rgba(0,0,0,0.05))' }}>

          {/* Hexagon 1: Back left */}
          <div
            className="absolute top-[15%] left-[5%] w-[180px] h-[180px] bg-gradient-to-br from-[#2c3e50]/20 to-white/10 backdrop-blur-md"
            style={{
              transform: 'rotateX(20deg) rotateY(30deg) translateZ(-100px)',
              boxShadow: 'inset 0 0 40px rgba(255,255,255,0.4), inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 15px rgba(0,0,0,0.2)',
              clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
            }}
          />

          {/* Hexagon 2: Main center, solid professional muted blue */}
          <div
            className="absolute top-[20%] left-[20%] w-[200px] h-[200px] bg-gradient-to-br from-[#2c3e50]/80 to-[#1a252f]/40 backdrop-blur-xl z-10"
            style={{
              transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
              boxShadow: 'inset 0 0 50px rgba(255,255,255,0.2), inset 2px 2px 5px rgba(255,255,255,0.4), inset -4px -4px 15px rgba(0,0,0,0.4)',
              clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
            }}
          />

          {/* Hexagon 3: Thin, right side rotated deeply */}
          <div
            className="absolute top-[30%] right-[25%] w-[160px] h-[160px] bg-gradient-to-tr from-white/30 to-[#2c3e50]/10 backdrop-blur-md z-10"
            style={{
              transform: 'rotateX(60deg) rotateY(-50deg) translateZ(100px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), inset 1px 1px 3px rgba(255,255,255,0.9), inset -1px -1px 10px rgba(0,0,0,0.1)',
              clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
            }}
          />

          {/* Hexagon 4: Middle right */}
          <div
            className="absolute bottom-[35%] right-[10%] w-[190px] h-[190px] bg-white/40 backdrop-blur-lg"
            style={{
              transform: 'rotateX(15deg) rotateY(20deg) translateZ(0px)',
              boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), inset 2px 2px 8px rgba(255,255,255,1), inset -2px -2px 10px rgba(0,0,0,0.05)',
              clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
            }}
          />

          {/* Hexagon 5: Blurry foreground bottom left */}
          <div
            className="absolute bottom-[20%] left-[25%] w-[180px] h-[180px] bg-[#2c3e50]/30 backdrop-blur-2xl blur-[2px]"
            style={{
              transform: 'rotateX(45deg) rotateY(15deg) translateZ(150px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2), inset 2px 2px 10px rgba(255,255,255,0.5)',
              clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
            }}
          />

        </div>

        <div className="absolute top-12 right-12 cursor-pointer group z-20">"""

pres_content = header + shapes_html + footer

with open(pres_path, "w") as f:
    f.write(pres_content)

print("Updated WBT presentation_excel.jsx")
