import os
import re

modal_path = "/Users/glynne/Desktop/SERVEX_AI/app/components/CriticalExcelModal.jsx"
with open(modal_path, "r") as f:
    modal_content = f.read()

# The left side div starts at line 51 roughly:
# <div className={`hidden md:flex w-[40%] ...
# Inside it, we have:
# <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" ...>

ultra_pro_cluster = """
              {isWBT ? (
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.15)) drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>
                  {/* Hexagon 1 */}
                  <div
                    className="absolute top-[10%] left-[-10%] w-[130px] h-[130px] bg-gradient-to-br from-[#003873]/20 to-white/10 backdrop-blur-md"
                    style={{
                      transform: 'rotateX(20deg) rotateY(30deg) translateZ(-80px)',
                      boxShadow: 'inset 0 0 30px rgba(255,255,255,0.4), inset 2px 2px 5px rgba(255,255,255,0.8), inset -2px -2px 10px rgba(0,0,0,0.2)',
                      clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
                    }}
                  />
                  {/* Hexagon 2 */}
                  <div
                    className="absolute top-[25%] left-[15%] w-[160px] h-[160px] bg-gradient-to-br from-[#003873]/80 to-[#002244]/40 backdrop-blur-xl z-10"
                    style={{
                      transform: 'rotateX(30deg) rotateY(-30deg) translateZ(40px)',
                      boxShadow: 'inset 0 0 40px rgba(255,255,255,0.2), inset 2px 2px 4px rgba(255,255,255,0.4), inset -3px -3px 12px rgba(0,0,0,0.4)',
                      clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
                    }}
                  />
                  {/* Hexagon 3 */}
                  <div
                    className="absolute bottom-[25%] right-[5%] w-[140px] h-[140px] bg-white/40 backdrop-blur-lg"
                    style={{
                      transform: 'rotateX(15deg) rotateY(20deg) translateZ(10px)',
                      boxShadow: 'inset 0 0 25px rgba(255,255,255,0.6), inset 2px 2px 6px rgba(255,255,255,1), inset -2px -2px 8px rgba(0,0,0,0.05)',
                      clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
                    }}
                  />
                  {/* Hexagon 4 (blur) */}
                  <div
                    className="absolute bottom-[10%] left-[5%] w-[120px] h-[120px] bg-[#003873]/30 backdrop-blur-2xl blur-[2px]"
                    style={{
                      transform: 'rotateX(45deg) rotateY(15deg) translateZ(120px)',
                      boxShadow: 'inset 0 0 20px rgba(255,255,255,0.2), inset 2px 2px 8px rgba(255,255,255,0.5)',
                      clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)'
                    }}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: '1200px' }}>
                  <div
                    className="absolute top-[20%] left-[10%] w-[180px] h-[180px] rounded-full bg-gradient-to-br from-[#464775]/60 to-[#464775]/20 backdrop-blur-xl border border-white/60 z-10"
                    style={{
                      transform: 'rotateX(30deg) rotateY(-30deg) translateZ(50px)',
                      boxShadow: 'inset 0 0 30px rgba(255,255,255,0.6), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -4px 4px 0 #d0d0d0, -15px 15px 30px rgba(0,0,0,0.1)'
                    }}
                  />
                  <div
                    className="absolute bottom-[20%] right-[10%] w-[140px] h-[140px] rounded-full bg-white/40 backdrop-blur-lg border border-white/70"
                    style={{
                      transform: 'rotateX(15deg) rotateY(20deg) translateZ(0px)',
                      boxShadow: 'inset 0 0 20px rgba(255,255,255,0.5), -1px 1px 0 #fff, -2px 2px 0 #f0f0f0, -3px 3px 0 #e0e0e0, -10px 10px 20px rgba(0,0,0,0.05)'
                    }}
                  />
                </div>
              )}
"""

# We need to replace the current <div className="absolute inset-0 z-0 ..."> block in CriticalExcelModal.jsx
parts = modal_content.split('<div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center" style={{ perspective: \'1200px\', filter: isWBT ? \'drop-shadow(0 20px 30px rgba(0,0,0,0.15))\' : \'none\' }}>')

header = parts[0]
footer = parts[1].split('<div className="relative z-20 text-[#2B2C4B] mt-auto w-full">')[1]

new_content = header + ultra_pro_cluster + '              <div className="relative z-20 text-[#2B2C4B] mt-auto w-full">\n' + footer

with open(modal_path, "w") as f:
    f.write(new_content)

print("Modal patched with Ultra Pro conditional shapes.")
