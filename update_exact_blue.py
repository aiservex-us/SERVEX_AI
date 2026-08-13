import os

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

# 1. Update CriticalExcelModal.jsx
modal_path = os.path.join(base_dir, "components/CriticalExcelModal.jsx")
with open(modal_path, "r") as f:
    modal_content = f.read()

# Replace #2c3e50 with #003873
modal_content = modal_content.replace("#2c3e50", "#003873")

# We had hover states like hover:bg-[#1a252f] which was a darker shade of #2c3e50
# Let's make the hover for #003873 slightly darker, maybe #00254f or just #002244
modal_content = modal_content.replace("hover:bg-[#1a252f]", "hover:bg-[#002244]")
modal_content = modal_content.replace("to-[#1a252f]", "to-[#002244]")

with open(modal_path, "w") as f:
    f.write(modal_content)

print("Updated CriticalExcelModal.jsx")

# 2. Update WBT presentation_excel.jsx
pres_path = os.path.join(base_dir, "WBT/Actualizer_Excel_Tables/components/presentation_excel.jsx")
with open(pres_path, "r") as f:
    pres_content = f.read()

# Replace #2c3e50 with #003873
pres_content = pres_content.replace("#2c3e50", "#003873")
# Replace #1a252f with #002244
pres_content = pres_content.replace("#1a252f", "#002244")

with open(pres_path, "w") as f:
    f.write(pres_content)

print("Updated WBT presentation_excel.jsx")
