import os

wbo_dir = "/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations"
components_dir = os.path.join(wbo_dir, "components")
cet_comparator_path = os.path.join(components_dir, "CET_Comparator.jsx")

with open(cet_comparator_path, "r") as f:
    content = f.read()

content = content.replace("import { toast, Toaster } from 'sonner';", "")
content = content.replace("<Toaster position=\"top-right\" />", "")

content = content.replace("toast.error(\"Baseline XML (xml_actualizer_raw) not found.\");", "alert(\"Baseline XML (xml_actualizer_raw) not found.\");")
content = content.replace("toast.error(\"Modified XML (XM_CET_import) not found.\");", "alert(\"Modified XML (XM_CET_import) not found.\");")

content = content.replace("const computeToast = toast.loading(\"Analyzing XML DOMs and computing deltas...\");", "")
content = content.replace("toast.loading(\"Saving analysis to database...\", { id: computeToast });", "")
content = content.replace("toast.success(\"Comparison completed and saved successfully!\", { id: computeToast });", "alert(\"Comparison completed and saved successfully!\");")
content = content.replace("toast.error(`Error during comparison: ${err.message}`, { id: computeToast });", "alert(`Error during comparison: ${err.message}`);")

with open(cet_comparator_path, "w") as f:
    f.write(content)

print("Removed sonner dependency.")
