import os
import glob
import re

base_dir = "/Users/glynne/Desktop/SERVEX_AI/app"
search_pattern = os.path.join(base_dir, "*", "Actualizer_Excel_*", "components", "presentation_excel.jsx")
files = glob.glob(search_pattern)

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # Replacements
    content = content.replace("Excel & CSV Converter", "Client Export Module")
    content = content.replace("Internal Administration Platform", "Data Distribution Center")
    
    # Replace Header
    content = re.sub(
        r"WB mfg Excel <br />\s*<span className=\"text-black/25\">Data Processing</span>",
        r"Export Data <br />\n              <span className=\"text-black/25\">For Complete Client</span>",
        content
    )
    
    # Replace Paragraph
    content = re.sub(
        r"Centralized processing for XML parsing, CSV generation,\s*and Excel data extraction within the",
        r"Seamlessly format, preview, and export complete datasets directly to your clients through the",
        content
    )
    
    # Replace bottom features
    content = content.replace("Data Control", "1-Click Export")
    content = content.replace("ETL Optimized", "Client Verified")

    with open(file_path, "w") as f:
        f.write(content)
    
    print(f"Updated text in {file_path}")
