'use client';

import CatalogParser from './components/PDFsection';

export default function MenuInicial() {
  return (
    /* Contenedor padre al 100% sin scrolls innecesarios ni padding */
    <div className="h-screen w-full bg-white font-sans overflow-hidden">
      
      <main className="w-full h-full flex flex-col">
        
        {/* Eliminamos el 'relative group', el 'glow' y los bordes redondeados */}
        <div className="flex-1 w-full h-full overflow-y-auto">
          
          {/* Renderizado directo al 100% de ancho y alto */}
          <div className="w-full h-full">
            <CatalogParser />
          </div>

        </div>
      </main>
    </div>
  );
}