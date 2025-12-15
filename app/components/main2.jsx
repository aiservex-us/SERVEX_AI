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
          from-pink-300 via-purple-200 to-transparent
          opacity-70
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
            Your day, in perfect rhythm.
          </span>

          <h1
            className="
              text-3xl sm:text-4xl md:text-6xl
              font-semibold
              tracking-tight
              text-black
            "
          >
            Work Smarter, <br /> Not Harder
          </h1>

          <p
            className="
              mt-4 sm:mt-5
              text-sm sm:text-base md:text-lg
              text-black/60
              max-w-xl
              mx-auto
            "
          >
            Take control of your time with an all-in-one productivity platform.
            Organize processes, manage data, and focus on what truly matters—
            without unnecessary complexity.
          </p>
        </div>

        {/* Imagen */}
        <div className="flex items-end justify-center h-full">
          <img
            src="/manocel.png"
            alt="App preview"
            className="
              w-[260px]
              max-[800px]:w-[340px]
              sm:w-[300px]
              md:w-[380px]
              drop-shadow-[0_40px_80px_rgba(0,0,0,0.25)]
            "
          />
        </div>
      </div>

      {/* Fade blanco inferior */}
      <div
        className="
          absolute bottom-0 left-0
          w-full
          h-28 sm:h-32 md:h-36
          bg-gradient-to-t
          from-white to-transparent
          z-20
        "
      />
    </section>
  );
}
