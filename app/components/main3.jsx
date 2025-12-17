import React from "react";

export default function TutorialBanner() {
  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 py-10">
  <div
    className="
      flex flex-col md:flex-row items-center gap-10 
      bg-white shadow-[0_15px_35px_rgba(0,0,0,0.1)] 
      rounded-2xl p-6 md:p-10
    "
  >
    {/* Text */}
    <div className="w-full md:w-[45%] text-center md:text-left">
      <h2
        className="
          text-3xl sm:text-4xl
          font-semibold
          tracking-tight
          text-black
          leading-tight
        "
      >
        <span className="text-black/60">SVX Copilot</span>, the AI brain of{" "}
        <strong>SERVEX</strong>.
      </h2>

      <p
        className="
          mt-3
          text-sm md:text-base
          text-black/60
          max-w-sm
        "
      >
        A single, unified artificial intelligence connected to company data,
        operations, and workflows—designed to automate, coordinate, and evolve
        the entire SERVEX ecosystem.
      </p>
    </div>

    {/* Image */}
    <div className="w-full md:w-[55%] flex justify-center">
      <img
        src="https://i.pinimg.com/originals/ac/a0/de/aca0deb479bb10c1fabc5a5bad60a2b9.gif"
        alt="SVX Copilot AI Core"
        className="w-full max-w-xl h-auto"
      />
    </div>
  </div>
</section>

  );
}
