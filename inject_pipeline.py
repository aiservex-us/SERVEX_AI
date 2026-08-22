import os

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
files = []
for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f == 'ViewportGraphics.jsx' and 'aiReporting' in root:
            files.append(os.path.join(root, f))

pipeline_jsx = """
            {/* 0. Operations Pipeline Diagram */}
            <CardContainer 
              colSpan={2} 
              title="Data Operations Pipeline" 
              explanation="Visual trace of the ETL transformation process applied to the catalog. Data flows from raw inputs, through the cognitive engine, into final audited outputs."
            >
              <div className="flex w-full h-full items-center justify-center p-4 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-center w-full max-w-4xl justify-between gap-6 lg:gap-8 relative z-10">
                  
                  {/* Step 1: Sources */}
                  <div className="flex flex-row lg:flex-col gap-4">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center justify-center p-3 bg-white/60 backdrop-blur-md rounded-xl border border-white/80 shadow-[0_4px_12px_rgb(0,0,0,0.05)] w-28 h-24">
                      <Database size={24} className="text-[#464775] mb-2" />
                      <span className="text-[10px] font-semibold text-[#242424] text-center leading-tight">XML Master Base</span>
                    </motion.div>
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center justify-center p-3 bg-white/60 backdrop-blur-md rounded-xl border border-white/80 shadow-[0_4px_12px_rgb(0,0,0,0.05)] w-28 h-24">
                      <FileText size={24} className="text-[#107C10] mb-2" />
                      <span className="text-[10px] font-semibold text-[#242424] text-center leading-tight">CSV Update File</span>
                    </motion.div>
                  </div>

                  {/* Connection 1 */}
                  <div className="hidden lg:flex flex-1 h-[2px] bg-gradient-to-r from-[#464775]/20 to-[#0078D4]/50 relative">
                    <div className="absolute top-[-4px] w-2 h-2 rounded-full bg-[#0078D4] animate-ping" style={{ left: '30%' }}></div>
                    <div className="absolute top-[-4px] w-2 h-2 rounded-full bg-[#0078D4] animate-ping" style={{ left: '70%', animationDelay: '0.5s' }}></div>
                  </div>
                  
                  {/* Vertical Connection 1 (Mobile) */}
                  <div className="flex lg:hidden w-[2px] h-8 bg-gradient-to-b from-[#464775]/20 to-[#0078D4]/50 relative"></div>

                  {/* Step 2: ETL Engine */}
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="flex flex-col items-center p-5 bg-gradient-to-br from-[#0078D4]/10 to-[#5C2D91]/10 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_24px_rgb(0,0,0,0.08)] w-48 relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#0078D4] to-[#5C2D91] rounded-2xl blur opacity-20 animate-pulse"></div>
                    <Cpu size={36} className="text-[#5C2D91] mb-3 relative z-10" />
                    <span className="text-[14px] font-bold text-[#242424] text-center relative z-10 leading-tight">Alysa ETL Engine</span>
                    <span className="text-[10px] text-[#605E5C] text-center mt-1 relative z-10">Cognitive Parsing & Alignment</span>
                  </motion.div>

                  {/* Connection 2 */}
                  <div className="hidden lg:flex flex-1 h-[2px] bg-gradient-to-r from-[#5C2D91]/40 to-[#A80000]/30 relative">
                     <div className="absolute top-[-4px] w-2 h-2 rounded-full bg-[#5C2D91] animate-ping" style={{ left: '50%' }}></div>
                  </div>
                  
                  {/* Vertical Connection 2 (Mobile) */}
                  <div className="flex lg:hidden w-[2px] h-8 bg-gradient-to-b from-[#5C2D91]/40 to-[#A80000]/30 relative"></div>

                  {/* Step 3: Output */}
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="flex flex-col items-center justify-center p-4 bg-white/60 backdrop-blur-md rounded-xl border border-white/80 shadow-[0_4px_12px_rgb(0,0,0,0.05)] w-36 h-28 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#107C10] to-[#0078D4]"></div>
                    <Activity size={28} className="text-[#107C10] mb-2" />
                    <span className="text-[12px] font-bold text-[#242424] text-center leading-tight">Matrix Output</span>
                    <span className="text-[10px] text-[#605E5C] text-center mt-1">Audit & Final XML</span>
                  </motion.div>

                </div>
              </div>
            </CardContainer>
"""

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    target = '<motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-8">\n          {/* 1. Catalog Stability Index */}'
    replacement = '<motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-8">\n' + pipeline_jsx + '          {/* 1. Catalog Stability Index */}'
    
    if target in content:
        content = content.replace(target, replacement)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Patched {f}")
    else:
        print(f"Could not find target in {f}")

