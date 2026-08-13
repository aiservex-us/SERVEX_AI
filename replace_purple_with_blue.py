import os
import glob

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

# Find all .jsx files inside any Actualizer_Excel_* directory
search_pattern = os.path.join(base_dir, "*", "Actualizer_Excel_*", "**", "*.jsx")
files = glob.glob(search_pattern, recursive=True)

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    if "#464775" in content or "#35365e" in content or "#36375a" in content:
        # Replace purples with the exact logo blue
        new_content = content.replace("#464775", "#003873")
        new_content = new_content.replace("#35365e", "#002244")
        new_content = new_content.replace("#36375a", "#002244")
        
        with open(file_path, "w") as f:
            f.write(new_content)
        print(f"Updated {file_path}")

# Also update CriticalExcelModal.jsx where WBO or default is set to #464775
modal_path = os.path.join(base_dir, "components/CriticalExcelModal.jsx")
with open(modal_path, "r") as f:
    modal_content = f.read()

if "#464775" in modal_content:
    modal_content = modal_content.replace("#464775", "#003873")
    modal_content = modal_content.replace("#36375a", "#002244")
    with open(modal_path, "w") as f:
        f.write(modal_content)
    print("Updated CriticalExcelModal.jsx")

print("All residual purple colors replaced with logo blue in Excel modules.")
