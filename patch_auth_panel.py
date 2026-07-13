import os

filepath = '/Users/glynne/Desktop/SERVEX_AI/app/panel/page.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# Uncomment the block
content = content.replace("{/*} // 🔒 PROTECCIÓN DE RUTA PARA TRABAJADORES", "// 🔒 PROTECCIÓN DE RUTA PARA TRABAJADORES")
content = content.replace("  }, [router]);  */}", "  }, [router]);")

with open(filepath, 'w') as f:
    f.write(content)

print(f"Patched panel: {filepath}")
