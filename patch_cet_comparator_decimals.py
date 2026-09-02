import os
import re

files = [
    '/Users/glynne/Desktop/SERVEX_AI/app/LESRO/Actualizer_Excel_LESRO/components/CET_Comparator.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBD/Actualizer_Excel_Desks/components/CET_Comparator.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBO/Actualizer_Excel_Workstations/components/CET_Comparator.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBA/Actualizer_Excel_Accessories/components/CET_Comparator.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBS/Actualizer_Excel_Seatings/components/CET_Comparator.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBT/Actualizer_Excel_Tables/components/CET_Comparator.jsx',
    '/Users/glynne/Desktop/SERVEX_AI/app/WBG/Actualizer_Excel_Storage/components/CET_Comparator.jsx'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Original line 1:
    # const basePrice = priceNode ? parseFloat(priceNode.getElementsByTagName('Value')[0]?.textContent || "0") : 0;
    
    # We replace it with robust parsing
    new_base_price_logic = """const rawBase = priceNode?.getElementsByTagName('Value')[0]?.textContent || "0";
      const basePrice = parseFloat(rawBase.replace(/,/g, '.')) || 0;"""

    content = re.sub(
        r'const basePrice = priceNode \? parseFloat\(priceNode\.getElementsByTagName\(\'Value\'\)\[0\]\?\.textContent \|\| "0"\) : 0;',
        new_base_price_logic,
        content
    )

    # Original line 2:
    # const optPrice = optPriceElem ? parseFloat(optPriceElem.textContent || "0") : 0;
    
    new_opt_price_logic = """const rawOpt = optPriceElem?.textContent || "0";
              const optPrice = parseFloat(rawOpt.replace(/,/g, '.')) || 0;"""

    content = re.sub(
        r'const optPrice = optPriceElem \? parseFloat\(optPriceElem\.textContent \|\| "0"\) : 0;',
        new_opt_price_logic,
        content
    )

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"Patched {file_path}")

