'use client';

export default function BgLogo() {
  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] overflow-hidden">
      
      {/* Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/FONT.webp')" }}
      />

      {/* Overlay sutil para contraste */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Contenido */}
      <div className="relative z-10 flex items-center justify-center h-full">
        
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Logo"
          className="
            w-28 sm:w-36 md:w-44
            drop-shadow-[0_25px_60px_rgba(0,0,0,0.45)]
          "
        />
      </div>
    </section>
  );
}
