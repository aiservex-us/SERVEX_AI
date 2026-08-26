import os
import re

comp_path = '/Users/glynne/Desktop/SERVEX_AI/app/LESRO/Actualizer_Excel_LESRO/components/CET_Comparator.jsx'

with open(comp_path, 'r', encoding='utf-8') as f:
    content = f.read()
    
# Add state for hasAttempted
if "const [hasAttempted, setHasAttempted] = useState(false);" not in content:
    content = content.replace(
        "const [isComputing, setIsComputing] = useState(false);",
        "const [isComputing, setIsComputing] = useState(false);\n  const [hasAttempted, setHasAttempted] = useState(false);"
    )
    
# Add useEffect for auto-compute
auto_compute_effect = """
  useEffect(() => {
    if (activeRecord && !reportData && !isComputing && !hasAttempted) {
      if (activeRecord.xml_actualizer_raw && activeRecord.XM_CET_import) {
         setHasAttempted(true);
         computeComparison();
      }
    }
  }, [activeRecord, reportData, isComputing, hasAttempted]);
"""
if "setHasAttempted(true);" not in content:
    content = content.replace(
        "useEffect(() => {\n    fetchRecord();\n  }, []);",
        "useEffect(() => {\n    fetchRecord();\n  }, []);\n" + auto_compute_effect
    )
    
# Remove alert
content = content.replace('alert("Comparison completed and saved successfully!");', '')

# Remove the button from the header UI
button_pattern = re.compile(r'<div className="absolute top-4 right-4 flex gap-2 z-20">\s*<button\s*onClick=\{computeComparison\}.*?</button>\s*</div>', re.DOTALL)
content = re.sub(button_pattern, '', content)

# Update the No reportData view to handle isComputing
old_no_data = """{!reportData ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] bg-slate-50/50 border border-slate-100 rounded-xl">
             <AlertCircle size={32} className="text-slate-300 mb-3" />
             <p className="text-sm font-medium text-slate-500">No comparison results found in Anormals_raw.</p>
             <p className="text-xs text-slate-400 mt-1">Click "Execute CET Comparison" to analyze the XML DOMs.</p>
          </div>
        )"""

new_no_data = """{!reportData ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] bg-slate-50/50 border border-slate-100 rounded-xl">
            {isComputing ? (
              <>
                <RefreshCw size={32} className="text-[#7f1d1d] mb-3 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Computing Deltas...</p>
                <p className="text-xs text-slate-400 mt-1">Analyzing the XML DOMs, please wait...</p>
              </>
            ) : (
              <>
                <AlertCircle size={32} className="text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-500">No data found for comparison.</p>
                <p className="text-xs text-slate-400 mt-1">Make sure both XML baseline and CET export are uploaded.</p>
              </>
            )}
          </div>
        )"""
if old_no_data in content:
    content = content.replace(old_no_data, new_no_data)
    
with open(comp_path, 'w', encoding='utf-8') as f:
    f.write(content)
    
print("Patched LESRO")

