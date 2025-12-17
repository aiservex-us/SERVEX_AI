'use client';

export default function BgLogo() {
  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] overflow-hidden">

      {/* Imagen de fondo (se mantiene) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/')" }}
      />

      {/* Fade blanco superior e inferior (se mantienen) */}
      <div
        className="
          absolute top-0 left-0
          w-full
          h-24 sm:h-28 md:h-32
          bg-gradient-to-b
          from-white to-transparent
          z-20
        "
      />
      <div
        className="
          absolute bottom-0 left-0
          w-full
          h-24 sm:h-28 md:h-32
          bg-gradient-to-t
          from-white to-transparent
          z-20
        "
      />

      {/* Contenido (Centrado) */}
      <div className="relative z-10 flex items-center justify-center h-full p-4">

        {/* *** Contenedor Blanco y Logo (Simplificado y limpio) *** */}
        <div 
          className="
            relative 
            bg-white 
            p-8 md:p-12 
            rounded-2xl 
            shadow-2xl shadow-gray-500/50 /* Sombra sutil gris/negra */
            flex items-center justify-center
            transition-all duration-300
            h-[70vh]
            w-[70%]
          "
        >
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Logo"
            className="
              w-108 sm:w-106 md:w-104 
              max-w-full
              drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)]
            "
          />
        </div>
      </div>
    </section>
  );
}