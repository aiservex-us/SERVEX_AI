import os
import glob

# Rutas a buscar (todas las carpetas bajo app que tengan Report.jsx en la ruta específica)
files = glob.glob("/Users/glynne/Desktop/SERVEX_AI/app/**/Report.jsx", recursive=True)

translations = {
    "Centro de Análisis de Desarrollo": "Development Analysis Center",
    "Arquitectura de inteligencia avanzada para la gestión de datos críticos en": "Advanced intelligence architecture for critical data management in",
    "Módulos de auditoría, trazabilidad y optimización en tiempo real.": "Audit, traceability and real-time optimization modules.",
    "Estado de Servidor.": "Server Status.",
    "SISTEMA OPERATIVO": "OPERATING",
    "Seleccione Empresa": "Select Company",
    "Procesamiento de fuentes": "Processing sources",
    "Integridad validada mediante checksums.": "Integrity validated via checksums.",
    "Análisis IA": "AI Analysis",
    "Detección de desviaciones mediante modelos de inferencia SERVEX_AI. Ajustes aplicados.": "Deviation detection via SERVEX_AI inference models. Adjustments applied.",
    "Estado de Sincronización": "Synchronization Status",
    "Ejecución en": "Execution in",
    "Estado:": "Status:",
    "OPTIMIZADO": "OPTIMIZED",
    "TOTAL CAMBIOS DETECTADOS:": "TOTAL CHANGES DETECTED:",
    "Sistema de Integridad SERVEX_AI.": "SERVEX_AI Integrity System.",
    "Cargando auditoría...": "Loading audit..."
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
        print(f"Translated WBA specifics: {file_path}")

print(f"Done. Translated {updated_count} files.")
