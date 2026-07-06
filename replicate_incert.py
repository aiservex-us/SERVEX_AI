import os

mods = {
    "WBT": "WBT/Actualizer_XML_Tables",
    "WBO": "WBO/Actualizer_XML_Workstations",
    "WBD": "WBD/Actualizer_XML_Desks",
    "WBG": "WBG/Actualizer_XML"
}

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

popup_ejecutor = """  return (
    <div className="h-[88vh] bg-[#FDFDFD] p-6 font-sans text-[#242424] max-w-[1600px] mx-auto space-y-4 relative overflow-hidden flex flex-col">
      
      {/* --- POPUP PROCESANDO DATOS BASE --- */}
      {isProcessing && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-6">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-lg sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 sm:space-y-4 transform animate-in zoom-in-95 duration-200">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#5b5fc7]/10 rounded-full animate-ping"></div>
                <div className="relative bg-white border border-gray-100 p-2 sm:p-3 rounded-full shadow-sm">
                  <FiDatabase className="text-[#5b5fc7] animate-pulse" size={20} />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-tight">System Base Storage</h3>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Module ({currentTenant})</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 text-left">
              <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={14} />
              <p className="text-[9px] sm:text-[10px] text-amber-800 leading-tight">
                <strong>IMPORTANT:</strong> Uploading base {currentTenant} files to Cloud Database. <strong>Do not close</strong> this window or switch sections.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#5b5fc7]">
              <Loader2 size={12} className="animate-spin" />
              <span className="uppercase tracking-widest">Saving to Cloud Database...</span>
            </div>
          </div>
        </div>
      )}"""

popup_incert = """return (
    <div className="min-h-[60vh] bg-[#FFF] flex font-sans text-[#242424] relative">
      <div className="flex-1 flex flex-col">

        {/* --- POPUP PROCESANDO DATOS BASE --- */}
        {loading && (
          <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-white/20 backdrop-blur-md animate-in fade-in duration-300 p-4 sm:p-6">
            <div className="bg-white border border-gray-200 shadow-2xl rounded-lg sm:rounded-2xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 sm:space-y-4 transform animate-in zoom-in-95 duration-200">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#5b5fc7]/10 rounded-full animate-ping"></div>
                  <div className="relative bg-white border border-gray-100 p-2 sm:p-3 rounded-full shadow-sm">
                    <DatabaseZap className="text-[#5b5fc7] animate-pulse" size={20} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-tight">System Base Storage</h3>
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Module ({companyName})</p>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 text-left">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={14} />
                <p className="text-[9px] sm:text-[10px] text-amber-800 leading-tight">
                  <strong>IMPORTANT:</strong> Uploading base {companyName} files to Cloud Database. <strong>Do not close</strong> this window.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#5b5fc7]">
                <Loader2 size={12} className="animate-spin" />
                <span className="uppercase tracking-widest">Saving to Cloud Database...</span>
              </div>
            </div>
          </div>
        )}

        {/* --- PAGE HEADER --- */}"""

for mod, path in mods.items():
    # 1. EJECUTOR_PLAY.jsx
    play_path = f"{base_dir}/{path}/components/comparePDF/IncertData/components/EJECUTOR_PLAY.jsx"
    if os.path.exists(play_path):
        with open(play_path, "r") as f:
            content = f.read()
        if "disabled={(!file && !hasExistingData) || estadoProcesando}" in content:
            content = content.replace(
                "disabled={(!file && !hasExistingData) || estadoProcesando}",
                """disabled={!hasExistingData || !file || estadoProcesando}\n              title={!hasExistingData ? "Must complete the first step (upload base) before executing this step." : ""}"""
            )
            with open(play_path, "w") as f:
                f.write(content)
            print(f"Updated EJECUTOR_PLAY.jsx for {mod}")
            
    # 2. EJECUTOR.jsx
    ej_path = f"{base_dir}/{path}/components/comparePDF/IncertData/components/EJECUTOR.jsx"
    if os.path.exists(ej_path):
        with open(ej_path, "r") as f:
            content = f.read()
        if "POPUP PROCESANDO DATOS BASE" not in content:
            content = content.replace(
                "import { \n  FiUploadCloud, FiX, FiMaximize2, FiChevronLeft, FiChevronRight \n} from 'react-icons/fi';",
                "import { \n  FiUploadCloud, FiX, FiMaximize2, FiChevronLeft, FiChevronRight, FiAlertCircle, FiDatabase \n} from 'react-icons/fi';"
            )
            content = content.replace(
                "import {\n  FiUploadCloud, FiX, FiMaximize2, FiChevronLeft, FiChevronRight\n} from 'react-icons/fi';",
                "import {\n  FiUploadCloud, FiX, FiMaximize2, FiChevronLeft, FiChevronRight, FiAlertCircle, FiDatabase\n} from 'react-icons/fi';"
            )
            content = content.replace(
                """  return (
    <div className="h-[88vh] bg-[#FDFDFD] p-6 font-sans text-[#242424] max-w-[1600px] mx-auto space-y-4 relative overflow-hidden flex flex-col">""",
                popup_ejecutor
            )
            with open(ej_path, "w") as f:
                f.write(content)
            print(f"Updated EJECUTOR.jsx for {mod}")

    # 3. incertXML.tsx
    incert_path = f"{base_dir}/{path}/components/comparePDF/IncertData/components/incertXML.tsx"
    if os.path.exists(incert_path):
        with open(incert_path, "r") as f:
            content = f.read()
        if "POPUP PROCESANDO DATOS BASE" not in content:
            content = content.replace(
                "  Info,\n  DatabaseZap\n} from 'lucide-react';",
                "  Info,\n  DatabaseZap,\n  Loader2\n} from 'lucide-react';"
            )
            content = content.replace(
                """return (
    <div className="min-h-[60vh] bg-[#FFF] flex font-sans text-[#242424] relative">
      <div className="flex-1 flex flex-col">

        {/* --- PAGE HEADER --- */}""",
                popup_incert
            )
            with open(incert_path, "w") as f:
                f.write(content)
            print(f"Updated incertXML.tsx for {mod}")

