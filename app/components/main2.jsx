'use client';

export default function Hero() {
  return (
    <section
      className="
        relative w-full
        h-[85vh]
        max-[800px]:h-[85vh]
        min-[800px]:h-screen
        bg-white
        overflow-hidden
      "
    >
      
      {/* Acento de color */}
      <div
        className="
          absolute inset-x-0 bottom-0
          h-[55%] sm:h-[60%] md:h-[65%]
          bg-gradient-to-t
          from-[#464775]/30 via-[#464775]/5 to-transparent
          opacity-90
        "
      />

      {/* Grid principal */}
      <div
        className="
          relative z-10
          h-full
          max-w-6xl mx-auto
          px-4 sm:px-6
          grid grid-rows-[auto_1fr]
        "
      >
        
        {/* Texto */}
        <div className="text-center pt-16 sm:pt-20 md:pt-24">
          <span className="block mb-3 text-xs sm:text-sm text-black/60 italic">
            Servex AI Platform
          </span>

          <h1
            className="
              text-3xl sm:text-4xl md:text-6xl
              font-semibold
              tracking-tight
              text-black
            "
          >
            Your AI Hub for Business
          </h1>

          <p
            className="
              mt-2 sm:mt-3
              text-xs sm:text-sm md:text-base
              text-black/60
              max-w-xl
              mx-auto
            "
          >
            Centralize your AI tools, automate tasks, and optimize business decisions.
          </p>
        </div>

        {/* Imagen */}
        <div className="flex items-end justify-center h-full">
          <img
            src="/manocel.png"
            alt="App preview"
            className="
              w-[300px]
              max-[800px]:w-[380px]
              sm:w-[360px]
              md:w-[460px]
              translate-y-4 sm:translate-y-6 md:translate-y-8
              drop-shadow-[0_40px_80px_rgba(0,0,0,0.25)]
            "
          />
        </div>
      </div>

      {/* Fade blanco inferior frontal */}
      <div
        className="
          absolute bottom-0 left-0
          w-full
          h-40 sm:h-56 md:h-64
          bg-gradient-to-t
          from-white via-white/80 to-transparent
          z-20
          pointer-events-none
        "
      />
    </section>
  );
}
