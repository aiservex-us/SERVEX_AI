import os

FILES_TO_PATCH = [
    '/Users/glynne/Desktop/SERVEX_AI/app/LESRO/Actualizer_Excel_LESRO/components/XML_Results_LESRO.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBD/Actualizer_Excel_Desks/components/XML_Results_WBD.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations/components/XML_Results_WBO.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBA/Actualizer_Excel_Accessories/components/XML_Results_WBA.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBS/Actualizer_Excel_Seatings/components/XML_Results_WBS.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_Excel_Tables/components/XML_Results_WBT.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_Excel_Storage/components/XML_Results_WBG.jsx'
]

import_target = """  AlertCircle,
  Download
} from 'lucide-react';"""

import_replacement = """  AlertCircle,
  Download,
  X
} from 'lucide-react';"""

state_target = "  const [currentPage, setCurrentPage] = useState(1);"
state_replacement = "  const [showWarningModal, setShowWarningModal] = useState(false);\n  const [currentPage, setCurrentPage] = useState(1);"

button_target = """                <button 
                  onClick={exportToExcel}
                  type="button"
                  className="px-2 py-1 bg-white border border-slate-200/60 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-bold"
                  title="Export current view to Excel"
                >
                  <Download size={13} /> Excel
                </button>"""

button_replacement = """                <button 
                  onClick={() => setShowWarningModal(true)}
                  type="button"
                  className="px-2 py-1 bg-white border border-slate-200/60 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-bold"
                  title="Export current view to Excel"
                >
                  <Download size={13} /> Excel
                </button>"""

modal_target = """    </div>
  );
};"""

modal_replacement = """      {/* ── EXCEL SCALABILITY WARNING MODAL ── */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowWarningModal(false)}
          />
          <div className="relative bg-white w-[440px] rounded-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <span className="text-[14px] font-bold text-[#242424]">Advertencia de Escalabilidad</span>
              <button onClick={() => setShowWarningModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-8 py-6 flex gap-4">
              <div className="p-2 h-fit rounded-full shrink-0 bg-[#C4314B]/10 text-[#C4314B]">
                <AlertCircle size={22} className="currentColor" />
              </div>
              <div className="flex-1 mt-1">
                <p className="text-[13px] text-[#616161] leading-relaxed mb-3">
                  Este proceso de actualización y descarga de archivos de forma manual es <strong>ineficiente y propenso a errores</strong>. 
                </p>
                <p className="text-[13px] text-[#616161] leading-relaxed">
                  Tener muchos archivos circulando y compartirlos manualmente no es eficiente. Es crítico <strong>modularizar el sistema</strong> para lograr una mejor escalabilidad.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-[#F5F5F5] flex justify-end gap-2 rounded-b-xl border-t border-slate-100">
              <button onClick={() => setShowWarningModal(false)} className="px-4 py-1.5 text-[12px] font-semibold text-[#242424] bg-white border border-[#D1D1D1] rounded hover:bg-[#F0F0F0] transition-all">
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowWarningModal(false);
                  exportToExcel();
                }} 
                className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[#7f1d1d] rounded hover:bg-[#5a1515] transition-all shadow-md"
              >
                Entendido, descargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};"""

for filepath in FILES_TO_PATCH:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "showWarningModal" in content:
        print(f"Already patched: {filepath}")
        continue
        
    # 1. Imports
    if import_target in content:
        content = content.replace(import_target, import_replacement)
    
    # 2. State
    if state_target in content:
        content = content.replace(state_target, state_replacement)
        
    # 3. Button onClick
    if button_target in content:
        content = content.replace(button_target, button_replacement)
        
    # 4. Modal injection
    if modal_target in content:
        content = content.replace(modal_target, modal_replacement)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched successfully: {filepath}")
