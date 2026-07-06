import os
import re

files = [
    "/Users/glynne/Desktop/SERVEX_AI/app/WBD/Actualizer_XML_Desks/components/comparePDF/presentation_WBD.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_XML_Workstations/components/comparePDF/presentation_WBO.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBA/components/comparePDF/presentation_WBA.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_XML/components/comparePDF/presentation_WBG.jsx"
]

def get_styled_block(text_content):
    return f"""      {{/* --- LADO DERECHO (VISUAL) --- */}}
      <div className="hidden lg:flex w-[35%] h-full relative items-center justify-center overflow-hidden border-l border-gray-100 bg-gradient-to-b from-[#464775]/40 via-[#464775]/10 to-white rounded-xl">
        
        {{/* Decorative Floating 3D Glass Coins (Recreating the elegant image) */}}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{{{ perspective: '1200px' }}}}>
          
          {{/* Coin 1: Back left */}}
          <div 
            className="absolute top-[15%] left-[5%] w-[180px] h-[180px] rounded-full bg-white/20 backdrop-blur-md border border-white/50"
            style={{{{ 
              transform: 'rotateX(20deg) rotateY(30deg) translateZ(-100px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -2px 2px 0 rgba(255,255,255,0.6), -10px 10px 20px rgba(0,0,0,0.05)'
            }}}} 
          />
          
          {{/* Coin 2: Main center, distinctly purple with thickness */}}
          <div 
            className="absolute top-[20%] left-[20%] w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#464775]/60 to-[#464775]/20 backdrop-blur-xl border border-white/60 z-10"
            style={{{{ 
              transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
              boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -4px 4px 0 #d0d0d0, -15px 15px 30px rgba(0,0,0,0.1)'
            }}}}
          />
          
          {{/* Coin 3: Thin, right side rotated deeply */}}
          <div 
            className="absolute top-[30%] right-[25%] w-[160px] h-[160px] rounded-full bg-white/30 backdrop-blur-md border border-white/50 z-10"
            style={{{{ 
              transform: 'rotateX(60deg) rotateY(-50deg) translateZ(100px)',
              boxShadow: 'inset 0 0 15px rgba(255,255,255,0.4), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -10px 10px 15px rgba(0,0,0,0.05)'
            }}}}
          />
          
          {{/* Coin 4: Middle right */}}
          <div 
            className="absolute bottom-[35%] right-[10%] w-[190px] h-[190px] rounded-full bg-white/40 backdrop-blur-lg border border-white/70"
            style={{{{ 
              transform: 'rotateX(15deg) rotateY(20deg) translateZ(0px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -10px 10px 20px rgba(0,0,0,0.05)'
            }}}}
          />

          {{/* Coin 5: Blurry foreground bottom left */}}
          <div 
            className="absolute bottom-[20%] left-[25%] w-[180px] h-[180px] rounded-full bg-[#464775]/20 backdrop-blur-xl border border-white/30 blur-[4px]"
            style={{{{ 
              transform: 'rotateX(45deg) rotateY(15deg) translateZ(150px)',
              boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)'
            }}}}
          />

        </div>

        <div className="absolute top-12 right-12 cursor-pointer group z-20">
          <div className="w-6 h-[1.5px] bg-[#464775] mb-1.5 transition-all group-hover:w-8" />
          <div className="w-4 h-[1.5px] bg-[#464775] ml-auto" />
        </div>
        
        <div className="relative z-20 rotate-90 pointer-events-none opacity-30 mix-blend-multiply">
          <span className="text-[#2B2C4B] font-black text-[120px] tracking-tighter select-none leading-none">
            {text_content}
          </span>
        </div>
      </div>"""

for f_path in files:
    if os.path.exists(f_path):
        with open(f_path, 'r') as f:
            content = f.read()
            
        match = re.search(r'<span className="[^"]*text-\[\d+px\][^"]*">\s*(.*?)\s*</span>', content, re.DOTALL)
        if match:
            extracted_text = match.group(1).strip()
            start_idx = content.find('{/* --- LADO DERECHO (VISUAL) --- */}')
            if start_idx != -1:
                end_idx = content.rfind('</div>\n\n    </div>\n  );\n};')
                if end_idx == -1:
                    end_idx = content.rfind('</div>\n    </div>\n  );\n};')
                if end_idx == -1:
                    end_idx = content.rfind('</div>\n\n      </div>\n    </div>')
                
                if end_idx != -1:
                    new_content = content[:start_idx] + get_styled_block(extracted_text) + content[end_idx:]
                    with open(f_path, 'w') as f:
                        f.write(new_content)
                    print(f"Updated {f_path} with text '{extracted_text}'")
                else:
                    print(f"Could not find end of div in {f_path}")
        else:
            print(f"Could not match text in {f_path}")
            
