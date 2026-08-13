import os
import re

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

modules = [
    {"name": "WBO", "dir": "WBO/Actualizer_Excel_Workstations", "color": "#464775", "hover": "#36375a", "shape_prop": "borderRadius: '9999px'"},
    {"name": "WBT", "dir": "WBT/Actualizer_Excel_Tables", "color": "#003873", "hover": "#002244", "shape_prop": "clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'"},
    {"name": "WBD", "dir": "WBD/Actualizer_Excel_Desks", "color": "#047857", "hover": "#064e3b", "shape_prop": "clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'"},
    {"name": "WBS", "dir": "WBS/Actualizer_Excel_Seatings", "color": "#b91c1c", "hover": "#7f1d1d", "shape_prop": "clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)'"},
    {"name": "WBA", "dir": "WBA/Actualizer_Excel_Accessories", "color": "#b45309", "hover": "#78350f", "shape_prop": "clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'"},
    {"name": "WBG", "dir": "WBG/Actualizer_Excel_Graphics", "color": "#7e22ce", "hover": "#581c87", "shape_prop": "clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'"},
    {"name": "LESRO", "dir": "LESRO/Actualizer_Excel_LESRO", "color": "#334155", "hover": "#0f172a", "shape_prop": "clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'"}
]

# 1. Patch CriticalExcelModal.jsx
modal_path = os.path.join(base_dir, "components/CriticalExcelModal.jsx")
with open(modal_path, "r") as f:
    modal_content = f.read()

# Replace the entire component logic up to the return statement
new_modal_logic = """export default function CriticalExcelModal({ xmlRoute, moduleName = 'default' }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const getTheme = (mod) => {
    switch(mod) {
      case 'WBO': return { color: '#464775', bg: 'bg-[#464775]', hover: 'hover:bg-[#36375a]', text: 'text-[#464775]', grad: 'from-[#464775]/40 via-[#464775]/10', gradShape: 'from-[#464775]/80 to-[#36375a]/40', shadow: 'shadow-[#464775]/30', borderHover: 'hover:border-[#464775]/30', fill: 'bg-[#464775]/15', fillAlt: 'bg-[#464775]/5', border: 'border-[#464775]/20', shape: { borderRadius: '9999px' } };
      case 'WBT': return { color: '#003873', bg: 'bg-[#003873]', hover: 'hover:bg-[#002244]', text: 'text-[#003873]', grad: 'from-[#003873]/40 via-[#003873]/10', gradShape: 'from-[#003873]/80 to-[#002244]/40', shadow: 'shadow-[#003873]/30', borderHover: 'hover:border-[#003873]/30', fill: 'bg-[#003873]/15', fillAlt: 'bg-[#003873]/5', border: 'border-[#003873]/20', shape: { clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)' } };
      case 'WBD': return { color: '#047857', bg: 'bg-[#047857]', hover: 'hover:bg-[#064e3b]', text: 'text-[#047857]', grad: 'from-[#047857]/40 via-[#047857]/10', gradShape: 'from-[#047857]/80 to-[#064e3b]/40', shadow: 'shadow-[#047857]/30', borderHover: 'hover:border-[#047857]/30', fill: 'bg-[#047857]/15', fillAlt: 'bg-[#047857]/5', border: 'border-[#047857]/20', shape: { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' } };
      case 'WBS': return { color: '#b91c1c', bg: 'bg-[#b91c1c]', hover: 'hover:bg-[#7f1d1d]', text: 'text-[#b91c1c]', grad: 'from-[#b91c1c]/40 via-[#b91c1c]/10', gradShape: 'from-[#b91c1c]/80 to-[#7f1d1d]/40', shadow: 'shadow-[#b91c1c]/30', borderHover: 'hover:border-[#b91c1c]/30', fill: 'bg-[#b91c1c]/15', fillAlt: 'bg-[#b91c1c]/5', border: 'border-[#b91c1c]/20', shape: { clipPath: 'polygon(50% 0%, 100% 38%, 81% 100%, 19% 100%, 0% 38%)' } };
      case 'WBA': return { color: '#b45309', bg: 'bg-[#b45309]', hover: 'hover:bg-[#78350f]', text: 'text-[#b45309]', grad: 'from-[#b45309]/40 via-[#b45309]/10', gradShape: 'from-[#b45309]/80 to-[#78350f]/40', shadow: 'shadow-[#b45309]/30', borderHover: 'hover:border-[#b45309]/30', fill: 'bg-[#b45309]/15', fillAlt: 'bg-[#b45309]/5', border: 'border-[#b45309]/20', shape: { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' } };
      case 'WBG': return { color: '#7e22ce', bg: 'bg-[#7e22ce]', hover: 'hover:bg-[#581c87]', text: 'text-[#7e22ce]', grad: 'from-[#7e22ce]/40 via-[#7e22ce]/10', gradShape: 'from-[#7e22ce]/80 to-[#581c87]/40', shadow: 'shadow-[#7e22ce]/30', borderHover: 'hover:border-[#7e22ce]/30', fill: 'bg-[#7e22ce]/15', fillAlt: 'bg-[#7e22ce]/5', border: 'border-[#7e22ce]/20', shape: { clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' } };
      case 'LESRO': return { color: '#334155', bg: 'bg-[#334155]', hover: 'hover:bg-[#0f172a]', text: 'text-[#334155]', grad: 'from-[#334155]/40 via-[#334155]/10', gradShape: 'from-[#334155]/80 to-[#0f172a]/40', shadow: 'shadow-[#334155]/30', borderHover: 'hover:border-[#334155]/30', fill: 'bg-[#334155]/15', fillAlt: 'bg-[#334155]/5', border: 'border-[#334155]/20', shape: { clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' } };
      default: return { color: '#464775', bg: 'bg-[#464775]', hover: 'hover:bg-[#36375a]', text: 'text-[#464775]', grad: 'from-[#464775]/40 via-[#464775]/10', gradShape: 'from-[#464775]/80 to-[#36375a]/40', shadow: 'shadow-[#464775]/30', borderHover: 'hover:border-[#464775]/30', fill: 'bg-[#464775]/15', fillAlt: 'bg-[#464775]/5', border: 'border-[#464775]/20', shape: { borderRadius: '9999px' } };
    }
  };
  const theme = getTheme(moduleName);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;"""

modal_jsx = re.sub(
    r"export default function CriticalExcelModal.*?if \(!isOpen\) return null;",
    new_modal_logic,
    modal_content,
    flags=re.DOTALL
)

# Replace the class variables in the JSX part of modal_jsx
modal_jsx = modal_jsx.replace("${theme.primaryGradient}", "${theme.grad}")
modal_jsx = modal_jsx.replace("${theme.primaryGradientShape}", "${theme.gradShape}")
modal_jsx = modal_jsx.replace("${theme.primaryText}", "${theme.text}")
modal_jsx = modal_jsx.replace("${theme.primaryBg}", "${theme.bg}")
modal_jsx = modal_jsx.replace("${theme.primaryBgHover}", "${theme.hover}")
modal_jsx = modal_jsx.replace("${theme.primaryShadow}", "${theme.shadow}")
modal_jsx = modal_jsx.replace("${theme.primaryBorderHover}", "${theme.borderHover}")
modal_jsx = modal_jsx.replace("${theme.primaryFillBg}", "${theme.fill}")
modal_jsx = modal_jsx.replace("${theme.primaryFillBgAlt}", "${theme.fillAlt}")
modal_jsx = modal_jsx.replace("${theme.primaryBorder}", "${theme.border}")

# Fix the left panel shapes in modal
shapes_block = """
              <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15)) drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>
                {/* Shape 1 */}
                <div
                  className="absolute top-[10%] left-[-10%] w-[130px] h-[130px] backdrop-blur-md"
                  style={{
                    background: `linear-gradient(to bottom right, ${theme.color}33, rgba(255,255,255,0.1))`,
                    transform: 'rotateX(20deg) rotateY(30deg) translateZ(-80px)',
                    boxShadow: 'inset 0 0 30px rgba(255,255,255,0.4), inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 10px rgba(0,0,0,0.2)',
                    ...theme.shape
                  }}
                />
                {/* Shape 2 */}
                <div
                  className={`absolute top-[25%] left-[15%] w-[160px] h-[160px] bg-gradient-to-br ${theme.gradShape} backdrop-blur-xl z-10`}
                  style={{
                    transform: 'rotateX(30deg) rotateY(-30deg) translateZ(40px)',
                    boxShadow: 'inset 0 0 40px rgba(255,255,255,0.2), inset 2px 2px 4px rgba(255,255,255,0.4), inset -3px -3px 12px rgba(0,0,0,0.4)',
                    ...theme.shape
                  }}
                />
                {/* Shape 3 */}
                <div
                  className="absolute bottom-[25%] right-[5%] w-[140px] h-[140px] bg-white/40 backdrop-blur-lg"
                  style={{
                    transform: 'rotateX(15deg) rotateY(20deg) translateZ(10px)',
                    boxShadow: 'inset 0 0 25px rgba(255,255,255,0.6), inset 2px 2px 6px rgba(255,255,255,1), inset -2px -2px 8px rgba(0,0,0,0.05)',
                    ...theme.shape
                  }}
                />
                {/* Shape 4 (blur) */}
                <div
                  className="absolute bottom-[10%] left-[5%] w-[120px] h-[120px] backdrop-blur-2xl blur-[2px]"
                  style={{
                    backgroundColor: `${theme.color}4D`,
                    transform: 'rotateX(45deg) rotateY(15deg) translateZ(120px)',
                    boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2), inset 2px 2px 8px rgba(255,255,255,0.5)',
                    ...theme.shape
                  }}
                />
              </div>"""

modal_jsx = re.sub(
    r'<div className="absolute inset-0 z-0 pointer-events-none.*?</div>\s*<div className="relative z-20 text-\[#2B2C4B\]',
    shapes_block + '\n              <div className="relative z-20 text-[#2B2C4B]',
    modal_jsx,
    flags=re.DOTALL
)

with open(modal_path, "w") as f:
    f.write(modal_jsx)
print("Patched CriticalExcelModal.jsx")

# 2. Iterate through all modules and patch page.jsx and presentation_excel.jsx
for mod in modules:
    print(f"Processing {mod['name']}...")
    
    # Patch page.jsx
    page_path = os.path.join(base_dir, mod["dir"], "page.jsx")
    if os.path.exists(page_path):
        with open(page_path, "r") as f:
            page_content = f.read()
        
        # Ensure moduleName is passed
        if f'moduleName="{mod["name"]}"' not in page_content:
            page_content = re.sub(
                r'<CriticalExcelModal\s+xmlRoute="([^"]+)"\s*(?:moduleName="[^"]+")?\s*/>',
                f'<CriticalExcelModal xmlRoute="\\1" moduleName="{mod["name"]}" />',
                page_content
            )
            with open(page_path, "w") as f:
                f.write(page_content)
            print(f"  Patched page.jsx for {mod['name']}")

    # Patch presentation_excel.jsx
    pres_path = os.path.join(base_dir, mod["dir"], "components/presentation_excel.jsx")
    if os.path.exists(pres_path):
        with open(pres_path, "r") as f:
            pres_content = f.read()

        # Update styling inside presentation_excel.jsx to match the new ultra pro format
        # First we replace any old styling with the generic template
        
        pres_ultra_pro_html = f"""<div className="hidden lg:flex w-[35%] h-full relative items-center justify-center overflow-hidden border-l border-gray-100 bg-gradient-to-b from-[{mod['color']}]/40 via-[{mod['color']}]/10 to-white">
        
        {{/* Decorative Floating 3D Glass Shapes (Ultra Pro) */}}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{{{ perspective: '1200px', filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.15)) drop-shadow(0 5px 15px rgba(0,0,0,0.05))' }}}}>

          {{/* Shape 1: Back left */}}
          <div
            className="absolute top-[15%] left-[5%] w-[180px] h-[180px] backdrop-blur-md"
            style={{{{
              background: 'linear-gradient(135deg, {mod['color']}33, rgba(255,255,255,0.1))',
              transform: 'rotateX(20deg) rotateY(30deg) translateZ(-100px)',
              boxShadow: 'inset 0 0 40px rgba(255,255,255,0.4), inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 15px rgba(0,0,0,0.2)',
              {mod['shape_prop']}
            }}}}
          />

          {{/* Shape 2: Main center, solid professional color */}}
          <div
            className="absolute top-[20%] left-[20%] w-[200px] h-[200px] bg-gradient-to-br from-[{mod['color']}]/80 to-[{mod['hover']}]/40 backdrop-blur-xl z-10"
            style={{{{
              transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
              boxShadow: 'inset 0 0 50px rgba(255,255,255,0.2), inset 2px 2px 5px rgba(255,255,255,0.4), inset -4px -4px 15px rgba(0,0,0,0.4)',
              {mod['shape_prop']}
            }}}}
          />

          {{/* Shape 3: Thin, right side rotated deeply */}}
          <div
            className="absolute top-[30%] right-[25%] w-[160px] h-[160px] backdrop-blur-md z-10"
            style={{{{
              background: 'linear-gradient(45deg, rgba(255,255,255,0.3), {mod['color']}1A)',
              transform: 'rotateX(60deg) rotateY(-50deg) translateZ(100px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), inset 1px 1px 3px rgba(255,255,255,0.9), inset -1px -1px 10px rgba(0,0,0,0.1)',
              {mod['shape_prop']}
            }}}}
          />

          {{/* Shape 4: Middle right */}}
          <div
            className="absolute bottom-[35%] right-[10%] w-[190px] h-[190px] bg-white/40 backdrop-blur-lg"
            style={{{{
              transform: 'rotateX(15deg) rotateY(20deg) translateZ(0px)',
              boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), inset 2px 2px 8px rgba(255,255,255,1), inset -2px -2px 10px rgba(0,0,0,0.05)',
              {mod['shape_prop']}
            }}}}
          />

          {{/* Shape 5: Blurry foreground bottom left */}}
          <div
            className="absolute bottom-[20%] left-[25%] w-[180px] h-[180px] backdrop-blur-2xl blur-[2px]"
            style={{{{
              backgroundColor: '{mod['color']}4D',
              transform: 'rotateX(45deg) rotateY(15deg) translateZ(150px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2), inset 2px 2px 10px rgba(255,255,255,0.5)',
              {mod['shape_prop']}
            }}}}
          />

        </div>

        <div className="absolute top-12 right-12 cursor-pointer group z-20">
          <div className="w-6 h-[1.5px] bg-[{mod['color']}] mb-1.5 transition-all group-hover:w-8" />
          <div className="w-4 h-[1.5px] bg-[{mod['color']}] ml-auto" />
        </div>"""

        # Replace everything from <div className="hidden lg:flex w-[35%] ... down to the text section
        pres_content = re.sub(
            r'<div className="hidden lg:flex w-\[35%\] h-full relative items-center justify-center overflow-hidden border-l border-gray-100 bg-gradient-to-b.*?<div className="w-4 h-\[1\.5px\] bg-\[[^\]]+\] ml-auto" />\s*</div>',
            pres_ultra_pro_html,
            pres_content,
            flags=re.DOTALL
        )

        # Ensure the pills and icons in the hero section are also updated with the right color
        pres_content = re.sub(r'bg-\[#[a-fA-F0-9]+\]\/5', f'bg-[{mod["color"]}]/5', pres_content)
        pres_content = re.sub(r'border-\[#[a-fA-F0-9]+\]\/20', f'border-[{mod["color"]}]/20', pres_content)
        pres_content = re.sub(r'text-\[#[a-fA-F0-9]+\]', f'text-[{mod["color"]}]', pres_content)
        pres_content = re.sub(r'bg-\[#[a-fA-F0-9]+\]', f'bg-[{mod["color"]}]', pres_content)
        
        with open(pres_path, "w") as f:
            f.write(pres_content)
        print(f"  Patched presentation_excel.jsx for {mod['name']}")

print("All modules patched successfully.")
