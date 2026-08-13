import os
from collections import Counter
try:
    from PIL import Image
    
    img_path = "/Users/glynne/Desktop/SERVEX_AI/public/logo2.png"
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
    else:
        img = Image.open(img_path)
        img = img.convert('RGB')
        
        # Resize to speed up processing
        img.thumbnail((100, 100))
        
        colors = img.getcolors(10000)
        
        # Sort colors by frequency
        sorted_colors = sorted(colors, key=lambda t: t[0], reverse=True)
        
        print("Most common colors:")
        for count, color in sorted_colors[:15]:
            # Convert RGB to HEX
            hex_color = '#%02x%02x%02x' % color
            print(f"{hex_color} - count: {count}")
            
except ImportError:
    print("Pillow not installed. Running pip install...")
    os.system("pip install Pillow")
