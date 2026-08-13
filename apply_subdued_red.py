import os
import glob
import re

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"

# Modules to change to subdued red
red_modules = ["WBT", "WBO", "WBS", "WBG", "WBD", "WBA"]

# We will replace all previous unique colors AND the blue color with subdued red
# Primary colors to replace -> #7f1d1d
primaries = ["#003873", "#047857", "#b91c1c", "#b45309", "#7e22ce"]
# Hover colors to replace -> #450a0a
hovers = ["#002244", "#064e3b", "#7f1d1d", "#78350f", "#581c87"]
# NOTE: #7f1d1d is actually in the hovers array (it was used as hover for WBS).
# So if we replace #7f1d1d with #450a0a, we must do it carefully to avoid double replacement.

new_primary = "#7f1d1d"
new_hover = "#450a0a"

for mod in red_modules:
    search_pattern = os.path.join(base_dir, mod, "Actualizer_Excel_*", "**", "*.jsx")
    files = glob.glob(search_pattern, recursive=True)
    
    for file_path in files:
        with open(file_path, "r") as f:
            content = f.read()
        
        # Temporary replacement for WBS hover to avoid double replacing #7f1d1d
        content = content.replace("#7f1d1d", "TEMP_HOVER_WBS")
        
        for p in primaries:
            content = content.replace(p, new_primary)
            
        for h in hovers:
            if h != "#7f1d1d":
                content = content.replace(h, new_hover)
                
        content = content.replace("TEMP_HOVER_WBS", new_hover)
        
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Updated {file_path}")

# Finally, update CriticalExcelModal.jsx to use subdued red for all these modules
modal_path = os.path.join(base_dir, "components/CriticalExcelModal.jsx")
with open(modal_path, "r") as f:
    modal_content = f.read()

# We can just run regex to replace the color configurations in the switch statement
for mod in red_modules:
    # Find the line like: case 'WBT': return { color: '#...', bg: 'bg-[#...]', ... }
    # Replace all colors on that line.
    
    # We can do this safely line by line
    new_lines = []
    for line in modal_content.split('\n'):
        if f"case '{mod}':" in line or (mod == "WBT" and "default:" in line):
            # It's the config line for this module
            # We want to replace all hex codes except the shape
            # To be safe, we just replace the exact known primaries and hovers
            line = line.replace("#7f1d1d", "TEMP_HOVER")
            for p in primaries:
                line = line.replace(p, new_primary)
            for h in hovers:
                if h != "#7f1d1d":
                    line = line.replace(h, new_hover)
            line = line.replace("TEMP_HOVER", new_hover)
        new_lines.append(line)
        
    modal_content = '\n'.join(new_lines)

with open(modal_path, "w") as f:
    f.write(modal_content)

print("CriticalExcelModal updated.")
print("All W* modules updated to subdued red.")
