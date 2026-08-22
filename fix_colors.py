import os

base_path = '/Users/glynne/Desktop/SERVEX_AI/app'
files = []
for root, dirs, filenames in os.walk(base_path):
    for f in filenames:
        if f == 'ViewportGraphics.jsx' and 'aiReporting' in root:
            files.append(os.path.join(root, f))

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We only want to replace #107C10 in the Pipeline block. 
    # Since we don't want to accidentally change #107C10 in the other charts (like diverging volatility),
    # we will isolate the Data Operations Pipeline block.
    
    start_marker = '{/* 0. Operations Pipeline Diagram */}'
    end_marker = '{/* 1. Catalog Stability Index */}'
    
    if start_marker in content and end_marker in content:
        start_idx = content.find(start_marker)
        end_idx = content.find(end_marker)
        
        pipeline_block = content[start_idx:end_idx]
        # Replace green with blue (#0078D4)
        pipeline_block = pipeline_block.replace('#107C10', '#0078D4')
        
        content = content[:start_idx] + pipeline_block + content[end_idx:]
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Fixed colors in {f}")
    else:
        print(f"Markers not found in {f}")

