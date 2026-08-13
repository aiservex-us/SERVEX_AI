import os
import glob
import re

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
search_pattern = os.path.join(base_dir, "*", "Actualizer_Excel_*", "components", "presentation_excel.jsx")
files = glob.glob(search_pattern)

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # Remove the backslashes from the quotes
    content = content.replace('className=\\"text-black/25\\"', 'className="text-black/25"')

    with open(file_path, "w") as f:
        f.write(content)
