import os
import re

modal_path = "/Users/glynne/Desktop/SERVEX_AI/app/components/CriticalExcelModal.jsx"
with open(modal_path, "r") as f:
    content = f.read()

theme_logic = """  const getModuleConfig = (mod) => {
    switch(mod) {
      case 'WBO': return { color: '#464775', hover: '#36375a', shape: { borderRadius: '9999px' } };
      case 'WBT': return { color: '#003873', hover: '#002244', shape: { clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' } };
      case 'WBD': return { color: '#047857', hover: '#064e3b', shape: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' } };
      case 'WBS': return { color: '#b91c1c', hover: '#7f1d1d', shape: { clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)' } };
      case 'WBA': return { color: '#b45309', hover: '#78350f', shape: { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' } };
      case 'WBG': return { color: '#7e22ce', hover: '#581c87', shape: { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' } };
      case 'LESRO': return { color: '#334155', hover: '#0f172a', shape: { clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' } };
      default: return { color: '#464775', hover: '#36375a', shape: { borderRadius: '9999px' } };
    }
  };

  const config = getModuleConfig(moduleName);
  
  const theme = {
    primaryBg: `bg-[${config.color}]`,
    primaryBgHover: `hover:bg-[${config.hover}]`,
    primaryText: `text-[${config.color}]`,
    primaryGradient: `from-[${config.color}]/40 via-[${config.color}]/10`,
    primaryGradientShape: `from-[${config.color}]/80 to-[${config.hover}]/40`,
    primaryShadow: `shadow-[${config.color}]/30`,
    primaryBorderHover: `hover:border-[${config.color}]/30`,
    primaryFillBg: `bg-[${config.color}]/15`,
    primaryFillBgAlt: `bg-[${config.color}]/5`,
    primaryBorder: `border-[${config.color}]/20`,
    shapeStyle: config.shape
  };"""

# Replace the current theme declaration
content = re.sub(r"const isWBT = moduleName === 'WBT';\s*const theme = \{[^\}]+\};", theme_logic, content)

# Update the left panel to use a single Ultra Pro layout for EVERY module dynamically.
# Instead of `isWBT ? (...) : (...)`, just render the Ultra Pro layout with dynamic config.
left_panel_start = '<div className={`hidden md:flex w-[40%] relative items-center justify-center overflow-hidden bg-gradient-to-b ${theme.primaryGradient} to-white p-10 border-r border-slate-100`}>'
left_panel_end = '<div className="relative z-20 text-[#2B2C4B] mt-auto w-full">'

ultra_pro_dynamic = """
              <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15)) drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>
                {/* Shape 1 */}
                <div
                  className={`absolute top-[10%] left-[-10%] w-[130px] h-[130px] bg-gradient-to-br from-[${config.color}]/20 to-white/10 backdrop-blur-md`}
                  style={{
                    transform: 'rotateX(20deg) rotateY(30deg) translateZ(-80px)',
                    boxShadow: 'inset 0 0 30px rgba(255,255,255,0.4), inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 10px rgba(0,0,0,0.2)',
                    ...theme.shapeStyle
                  }}
                />
                {/* Shape 2 */}
                <div
                  className={`absolute top-[25%] left-[15%] w-[160px] h-[160px] bg-gradient-to-br ${theme.primaryGradientShape} backdrop-blur-xl z-10`}
                  style={{
                    transform: 'rotateX(30deg) rotateY(-30deg) translateZ(40px)',
                    boxShadow: 'inset 0 0 40px rgba(255,255,255,0.2), inset 2px 2px 4px rgba(255,255,255,0.4), inset -3px -3px 12px rgba(0,0,0,0.4)',
                    ...theme.shapeStyle
                  }}
                />
                {/* Shape 3 */}
                <div
                  className="absolute bottom-[25%] right-[5%] w-[140px] h-[140px] bg-white/40 backdrop-blur-lg"
                  style={{
                    transform: 'rotateX(15deg) rotateY(20deg) translateZ(10px)',
                    boxShadow: 'inset 0 0 25px rgba(255,255,255,0.6), inset 2px 2px 6px rgba(255,255,255,1), inset -2px -2px 8px rgba(0,0,0,0.05)',
                    ...theme.shapeStyle
                  }}
                />
                {/* Shape 4 (blur) */}
                <div
                  className={`absolute bottom-[10%] left-[5%] w-[120px] h-[120px] bg-[${config.color}]/30 backdrop-blur-2xl blur-[2px]`}
                  style={{
                    transform: 'rotateX(45deg) rotateY(15deg) translateZ(120px)',
                    boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2), inset 2px 2px 8px rgba(255,255,255,0.5)',
                    ...theme.shapeStyle
                  }}
                />
              </div>
"""

parts = content.split(left_panel_start)
header = parts[0] + left_panel_start
footer = parts[1].split(left_panel_end)[1]

new_content = header + ultra_pro_dynamic + left_panel_end + footer

with open(modal_path, "w") as f:
    f.write(new_content)

print("Updated CriticalExcelModal.jsx with dynamic Ultra Pro configurations")
