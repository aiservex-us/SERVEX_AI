import os
import re

def process_logic():
    search_dirs = [
        '/Users/glynne/Desktop/SERVEX_AI/app',
    ]
    
    for root_dir in search_dirs:
        for root, _, files in os.walk(root_dir):
            for file in files:
                if file.startswith('XML_Results_') and file.endswith('.jsx'):
                    filepath = os.path.join(root, file)
                    with open(filepath, 'r') as f:
                        content = f.read()
                    
                    original = content
                    
                    # Extract the module name (e.g. WBS, WBD, LESRO)
                    mod_match = re.search(r'XML_Results_([A-Za-z0-9]+)\.jsx', file)
                    if not mod_match:
                        continue
                    mod_name = mod_match.group(1)
                    
                    # Determine the headers variable by looking for it in the exportToCSV function
                    headers_match = re.search(r'columns:\s*([A-Za-z0-9_]+_HEADERS)', content)
                    if headers_match:
                        headers_var = headers_match.group(1)
                    else:
                        # Fallback
                        headers_var = f"{mod_name}_HEADERS"
                    
                    # 1. Remove the CSV button
                    # The button usually looks like:
                    # <button 
                    #   onClick={exportToCSV}
                    #   ...
                    #   <Download size={13} /> CSV
                    # </button>
                    csv_btn_pattern = r'<button[^>]*?onClick=\{exportToCSV\}[^>]*?>.*?CSV\s*</button>'
                    content = re.sub(csv_btn_pattern, '', content, flags=re.DOTALL)
                    
                    # 2. Modify the "I understand, download" button onClick logic
                    # Current logic:
                    # onClick={() => {
                    #   setShowWarningModal(false);
                    #   exportToExcel();
                    # }}
                    
                    new_onclick = f"""onClick={{async () => {{
                  setShowWarningModal(false);
                  
                  if (filtered && filtered.length > 0) {{
                    const csvString = Papa.unparse(filtered, {{
                      columns: {headers_var},
                      delimiter: ";"
                    }});
                    
                    try {{
                      await supabase
                        .from('ClientsSERVEX_{mod_name}')
                        .update({{ csv_raw: csvString }})
                        .eq('company_name', '{mod_name}');
                    }} catch (err) {{
                      console.error('Error saving raw CSV:', err);
                    }}
                  }}
                  
                  exportToExcel();
                }}}}"""
                    
                    # We match the onClick block inside the warning modal. 
                    # The modal button looks like:
                    # <button 
                    #   onClick={() => {
                    #     setShowWarningModal(false);
                    #     exportToExcel();
                    #   }} 
                    #   className="... text-white bg-[#464775] ... "
                    # >
                    #   I understand, download
                    # </button>
                    
                    onclick_pattern = r'onClick=\{.*?\}\s*(?=\s*className="[^"]*I understand, download)'
                    # Note: this pattern might not work perfectly because className comes after onClick. 
                    # A better way is replacing the specific onClick contents.
                    
                    onclick_regex = r'onClick=\{\(\)\s*=>\s*\{\s*setShowWarningModal\(false\);\s*exportToExcel\(\);\s*\}\}'
                    
                    content = re.sub(onclick_regex, new_onclick, content)
                    
                    if content != original:
                        with open(filepath, 'w') as f:
                            f.write(content)
                        print(f"Updated {filepath}")
                    else:
                        print(f"No changes made to {filepath}")

process_logic()
