import os
import glob

# Rutas a buscar (todas las carpetas bajo app que tengan Report.jsx en la ruta específica)
files = glob.glob("/Users/glynne/Desktop/SERVEX_AI/app/**/Report.jsx", recursive=True)

translations = {
    "Centro de Análisis de Desarrollo: Gateway Engine": "Development Analysis Center: Gateway Engine",
    "Monitoreo de sincronización y conciliación posicional de catálogos.": "Monitoring of catalog synchronization and positional reconciliation.",
    "Total Evaluados": "Total Evaluated",
    "Modelos cruzados en matriz": "Models cross-referenced in matrix",
    "Cambios Detectados": "Changes Detected",
    "Inyectados al XML": "Injected into XML",
    "Modelos Eliminados": "Deleted Models",
    "Removidos del origen": "Removed from source",
    "Modelos Nuevos": "New Models",
    "Nuevas entradas de SKU": "New SKU entries",
    "Variaciones de List Price": "List Price Variations",
    "Flujo de Altas y Bajas": "Additions and Deletions Flow"
}

updated_count = 0

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    for es, en in translations.items():
        content = content.replace(es, en)
        
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        updated_count += 1
        print(f"Translated part 2: {file_path}")

print(f"Done. Translated {updated_count} files.")
