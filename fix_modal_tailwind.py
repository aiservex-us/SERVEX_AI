import os
import re

modal_path = "/Users/glynne/Desktop/SERVEX_AI/app/components/CriticalExcelModal.jsx"
with open(modal_path, "r") as f:
    content = f.read()

new_theme_logic = """  const getTheme = (mod) => {
    switch(mod) {
      case 'WBO': return {
        primaryBg: 'bg-[#464775]', primaryBgHover: 'hover:bg-[#36375a]', primaryText: 'text-[#464775]',
        primaryGradient: 'from-[#464775]/40 via-[#464775]/10', primaryGradientShape: 'from-[#464775]/80 to-[#36375a]/40',
        primaryShadow: 'shadow-[#464775]/30', primaryBorderHover: 'hover:border-[#464775]/30',
        primaryFillBg: 'bg-[#464775]/15', primaryFillBgAlt: 'bg-[#464775]/5', primaryBorder: 'border-[#464775]/20',
        shapeStyle: { borderRadius: '9999px' }, color: '#464775'
      };
      case 'WBT': return {
        primaryBg: 'bg-[#003873]', primaryBgHover: 'hover:bg-[#002244]', primaryText: 'text-[#003873]',
        primaryGradient: 'from-[#003873]/40 via-[#003873]/10', primaryGradientShape: 'from-[#003873]/80 to-[#002244]/40',
        primaryShadow: 'shadow-[#003873]/30', primaryBorderHover: 'hover:border-[#003873]/30',
        primaryFillBg: 'bg-[#003873]/15', primaryFillBgAlt: 'bg-[#003873]/5', primaryBorder: 'border-[#003873]/20',
        shapeStyle: { clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' }, color: '#003873'
      };
      case 'WBD': return {
        primaryBg: 'bg-[#047857]', primaryBgHover: 'hover:bg-[#064e3b]', primaryText: 'text-[#047857]',
        primaryGradient: 'from-[#047857]/40 via-[#047857]/10', primaryGradientShape: 'from-[#047857]/80 to-[#064e3b]/40',
        primaryShadow: 'shadow-[#047857]/30', primaryBorderHover: 'hover:border-[#047857]/30',
        primaryFillBg: 'bg-[#047857]/15', primaryFillBgAlt: 'bg-[#047857]/5', primaryBorder: 'border-[#047857]/20',
        shapeStyle: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }, color: '#047857'
      };
      case 'WBS': return {
        primaryBg: 'bg-[#b91c1c]', primaryBgHover: 'hover:bg-[#7f1d1d]', primaryText: 'text-[#b91c1c]',
        primaryGradient: 'from-[#b91c1c]/40 via-[#b91c1c]/10', primaryGradientShape: 'from-[#b91c1c]/80 to-[#7f1d1d]/40',
        primaryShadow: 'shadow-[#b91c1c]/30', primaryBorderHover: 'hover:border-[#b91c1c]/30',
        primaryFillBg: 'bg-[#b91c1c]/15', primaryFillBgAlt: 'bg-[#b91c1c]/5', primaryBorder: 'border-[#b91c1c]/20',
        shapeStyle: { clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)' }, color: '#b91c1c'
      };
      case 'WBA': return {
        primaryBg: 'bg-[#b45309]', primaryBgHover: 'hover:bg-[#78350f]', primaryText: 'text-[#b45309]',
        primaryGradient: 'from-[#b45309]/40 via-[#b45309]/10', primaryGradientShape: 'from-[#b45309]/80 to-[#78350f]/40',
        primaryShadow: 'shadow-[#b45309]/30', primaryBorderHover: 'hover:border-[#b45309]/30',
        primaryFillBg: 'bg-[#b45309]/15', primaryFillBgAlt: 'bg-[#b45309]/5', primaryBorder: 'border-[#b45309]/20',
        shapeStyle: { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }, color: '#b45309'
      };
      case 'WBG': return {
        primaryBg: 'bg-[#7e22ce]', primaryBgHover: 'hover:bg-[#581c87]', primaryText: 'text-[#7e22ce]',
        primaryGradient: 'from-[#7e22ce]/40 via-[#7e22ce]/10', primaryGradientShape: 'from-[#7e22ce]/80 to-[#581c87]/40',
        primaryShadow: 'shadow-[#7e22ce]/30', primaryBorderHover: 'hover:border-[#7e22ce]/30',
        primaryFillBg: 'bg-[#7e22ce]/15', primaryFillBgAlt: 'bg-[#7e22ce]/5', primaryBorder: 'border-[#7e22ce]/20',
        shapeStyle: { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }, color: '#7e22ce'
      };
      case 'LESRO': return {
        primaryBg: 'bg-[#334155]', primaryBgHover: 'hover:bg-[#0f172a]', primaryText: 'text-[#334155]',
        primaryGradient: 'from-[#334155]/40 via-[#334155]/10', primaryGradientShape: 'from-[#334155]/80 to-[#0f172a]/40',
        primaryShadow: 'shadow-[#334155]/30', primaryBorderHover: 'hover:border-[#334155]/30',
        primaryFillBg: 'bg-[#334155]/15', primaryFillBgAlt: 'bg-[#334155]/5', primaryBorder: 'border-[#334155]/20',
        shapeStyle: { clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }, color: '#334155'
      };
      default: return {
        primaryBg: 'bg-[#464775]', primaryBgHover: 'hover:bg-[#36375a]', primaryText: 'text-[#464775]',
        primaryGradient: 'from-[#464775]/40 via-[#464775]/10', primaryGradientShape: 'from-[#464775]/80 to-[#36375a]/40',
        primaryShadow: 'shadow-[#464775]/30', primaryBorderHover: 'hover:border-[#464775]/30',
        primaryFillBg: 'bg-[#464775]/15', primaryFillBgAlt: 'bg-[#464775]/5', primaryBorder: 'border-[#464775]/20',
        shapeStyle: { borderRadius: '9999px' }, color: '#464775'
      };
    }
  };

  const theme = getTheme(moduleName);"""

# Use regex to replace the previous config block
content = re.sub(r"const getModuleConfig = [^}]+};\s*const config = [^;]+;\s*const theme = \{[^}]+};", new_theme_logic, content, flags=re.DOTALL)

# For the dynamic backgrounds in the shapes that used bg-[${config.color}]/30 we must use inline styles or mapped classnames.
# But Tailwind doesn't allow inline opacity easily without full hex unless we use RGBA.
# The best way is to use Tailwind full strings in the getTheme, but adding all permutations is verbose.
# Let's fix the shapes section:
shapes_section_start = '{/* Shape 1 */}'
shapes_section_end = '</div>\n              <div className="relative z-20 text-[#2B2C4B] mt-auto w-full">'

fixed_shapes = """{/* Shape 1 */}
                <div
                  className="absolute top-[10%] left-[-10%] w-[130px] h-[130px] backdrop-blur-md"
                  style={{
                    background: `linear-gradient(to bottom right, ${theme.color}33, rgba(255,255,255,0.1))`,
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
                  className="absolute bottom-[10%] left-[5%] w-[120px] h-[120px] backdrop-blur-2xl blur-[2px]"
                  style={{
                    backgroundColor: `${theme.color}4D`, /* 30% opacity */
                    transform: 'rotateX(45deg) rotateY(15deg) translateZ(120px)',
                    boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2), inset 2px 2px 8px rgba(255,255,255,0.5)',
                    ...theme.shapeStyle
                  }}
                />
              """

parts = content.split('{/* Shape 1 */}')
header = parts[0]
footer = parts[1].split('</div>\n              <div className="relative z-20 text-[#2B2C4B] mt-auto w-full">')[1]

new_content = header + fixed_shapes + '</div>\n              <div className="relative z-20 text-[#2B2C4B] mt-auto w-full">' + footer

with open(modal_path, "w") as f:
    f.write(new_content)

print("Modal tailwind classes fixed.")
