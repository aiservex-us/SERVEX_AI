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
    
    # We will change the colSpan of some elements to fix the layout.
    # Current grid is lg:grid-cols-2
    # - Pipeline: colSpan=2
    # - Stability: colSpan=1 -> change to 2, or move things.
    # Let's change the colSpan of Diverging Volatility, Financial Impact, Price Deviation to 2? No, then everything is huge.
    # It's better to change them all to colSpan={2} if they have complex charts.
    # But wait! A pie chart doesn't look good if it's very wide.
    # Let's just make Price Deviation Quadrant span 2? No, it's 1.
    # If we do:
    # 1. Stability (colSpan=1)
    # 2. Diverging Volatility (colSpan=1) -- we must move this before Transition Delta!
    
    # Let's extract the blocks using simple split or regex.
    # Actually, the easiest way is to modify the `colSpan={1}` for Transition Delta if it can be 1, but it needs 2 because it has many items on the x-axis.
    
    # Let's change the colSpan of Catalog Stability Index to 2 for now, and see if that fixes it.
    # If a PieChart is full width, ResponsiveContainer handles it. It will just be centered.
    content = content.replace(
        'title="Catalog Stability Index"',
        'title="Catalog Stability Index"'
    ).replace(
        'colSpan={1} \n              title="Catalog Stability Index"',
        'colSpan={2} \n              title="Catalog Stability Index"'
    )
    
    # Let's check Price Deviation Quadrant which is the last one (colSpan=1).
    # Since it's the last one, it also leaves a gap. Let's make it colSpan={2}
    content = content.replace(
        'colSpan={1} \n              title="Price Deviation Quadrant"',
        'colSpan={2} \n              title="Price Deviation Quadrant"'
    )

    # Alternatively, just make everything colSpan={2} so they stack nicely in a single column layout that spans the center of the screen.
    # The grid is grid-cols-1 lg:grid-cols-2. If everything is colSpan=2, it just acts like a flex column!
    # Let's make sure colSpan={1} is replaced with colSpan={2} across the board for these cards.
    # Wait, Diverging Volatility and Financial Impact Distribution are currently colSpan={1}.
    # If they are next to each other, they take 1 row (1+1 = 2). This is GOOD.
    # So we just need to fix Catalog Stability Index (make it 2) and Price Deviation Quadrant (make it 2).
    
    # Let's do exact replacements:
    old_stability = """            <CardContainer 
              colSpan={1} 
              title="Catalog Stability Index" """
    new_stability = """            <CardContainer 
              colSpan={2} 
              title="Catalog Stability Index" """
    content = content.replace(old_stability, new_stability)

    old_quadrant = """            {/* 5. Price Deviation Quadrant */}
            <CardContainer 
              colSpan={1} 
              title="Price Deviation Quadrant" """
    new_quadrant = """            {/* 5. Price Deviation Quadrant */}
            <CardContainer 
              colSpan={2} 
              title="Price Deviation Quadrant" """
    content = content.replace(old_quadrant, new_quadrant)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
        
    print(f"Fixed grid in {f}")
