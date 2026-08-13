import re

files = [
    "/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_Excel_Tables/components/CET_Comparator.jsx",
    "/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations/components/CET_Comparator.jsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # 1. Add X icon to lucide-react import
    if "X," not in content and "{ X " not in content:
        content = content.replace("RefreshCw, Zap", "X, RefreshCw, Zap")

    # 2. Add modal state
    modal_state_code = """
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null, isError: false });

  const showAlert = (message, title="Notification", isError=false) => {
    setModalConfig({ isOpen: true, type: 'alert', title, message, onConfirm: null, isError });
  };

  const showConfirm = (message, onConfirm, title="Confirmation") => {
    setModalConfig({ isOpen: true, type: 'confirm', title, message, onConfirm, isError: false });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
"""
    if "const [modalConfig, setModalConfig]" not in content:
        content = content.replace("const [searchTerm, setSearchTerm] = useState('');", "const [searchTerm, setSearchTerm] = useState('');\n" + modal_state_code)

    # 3. Replace alerts and confirms
    # For computeComparison:
    content = content.replace('alert("Baseline XML (xml_actualizer_raw) not found.");', 'showAlert("Baseline XML (xml_actualizer_raw) not found.", "Missing Data", true);')
    content = content.replace('alert("Modified XML (XM_CET_import) not found.");', 'showAlert("Modified XML (XM_CET_import) not found.", "Missing Data", true);')
    content = content.replace('alert("Comparison completed and saved successfully!");', 'showAlert("Comparison completed and saved successfully!", "Success", false);')
    content = content.replace('alert(`Error during comparison: ${err.message}`);', 'showAlert(`Error during comparison: ${err.message}`, "Error", true);')

    # For applyDeltasToCSV:
    # This one is tricky because it's asynchronous and wrapped in an if. We need to refactor applyDeltasToCSV slightly.
    apply_start = """  const applyDeltasToCSV = async () => {
    if (!reportData || !activeRecord) return;
    
    if (!confirm("Are you sure you want to apply these detected changes to the original CSV Database? This will overwrite the database directly.")) {
      return;
    }

    setIsApplyingChanges(true);"""
    
    new_apply_start = """  const executeApplyDeltas = async () => {
    setIsApplyingChanges(true);"""
    
    if "const executeApplyDeltas = async () => {" not in content:
        content = content.replace(apply_start, new_apply_start)
        
        # also add applyDeltasToCSV back to wrap it
        apply_wrapper = """  const applyDeltasToCSV = () => {
    if (!reportData || !activeRecord) return;
    showConfirm(
      "Are you sure you want to apply these detected changes to the original CSV Database? This will overwrite the database directly.",
      executeApplyDeltas,
      "Apply Deltas to CSV"
    );
  };

  const executeApplyDeltas = async () => {"""
        content = content.replace("const executeApplyDeltas = async () => {", apply_wrapper)

    content = content.replace('alert("Changes successfully applied to CSV Database!");', 'showAlert("Changes successfully applied to CSV Database!", "Success", false);')
    content = content.replace('alert(`Error applying changes: ${err.message}`);', 'showAlert(`Error applying changes: ${err.message}`, "Error", true);')

    # 4. Add the modal UI at the bottom just before the last </div> (or inside the main container)
    modal_ui = """
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={closeModal}
          />
          <div className="relative bg-white w-[440px] rounded-xl shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <span className="text-[14px] font-bold text-[#242424]">{modalConfig.title}</span>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-8 py-6 flex gap-4">
              <div className={`p-2 h-fit rounded-full shrink-0 ${modalConfig.isError ? 'bg-[#C4314B]/10 text-[#C4314B]' : modalConfig.type === 'confirm' ? 'bg-[#5B5FC7]/10 text-[#5B5FC7]' : 'bg-emerald-600/10 text-emerald-600'}`}>
                <AlertCircle size={22} className="currentColor" />
              </div>
              <div className="flex-1 mt-1">
                <p className="text-[13px] text-[#616161] leading-relaxed">
                  {modalConfig.message}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-[#F5F5F5] flex justify-end gap-2 rounded-b-xl border-t border-slate-100">
              {modalConfig.type === 'confirm' ? (
                <>
                  <button onClick={closeModal} className="px-4 py-1.5 text-[12px] font-semibold text-[#242424] bg-white border border-[#D1D1D1] rounded hover:bg-[#F0F0F0] transition-all">
                    Cancel
                  </button>
                  <button onClick={() => { closeModal(); if (modalConfig.onConfirm) modalConfig.onConfirm(); }} className="px-4 py-1.5 text-[12px] font-semibold text-white bg-[#5B5FC7] rounded hover:bg-[#4F52B2] transition-all shadow-md">
                    Confirm and apply
                  </button>
                </>
              ) : (
                <button onClick={closeModal} className="px-4 py-1.5 text-[12px] font-semibold text-[#242424] bg-white border border-[#D1D1D1] rounded hover:bg-[#F0F0F0] transition-all">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    """
    
    # Let's just insert it right before the last closing tag.
    # The last </div> is at the end of the file.
    if "modalConfig.isOpen" not in content:
        # We can find the last `</div>` or `);` and inject the modal right before `);`
        last_return_idx = content.rfind(");")
        # Ensure it's inside the outer div of the component
        outer_div_close_idx = content.rfind("</div>", 0, last_return_idx)
        if outer_div_close_idx != -1:
            content = content[:outer_div_close_idx] + modal_ui + "\n" + content[outer_div_close_idx:]

    with open(file_path, "w") as f:
        f.write(content)

print("Modals implemented.")
