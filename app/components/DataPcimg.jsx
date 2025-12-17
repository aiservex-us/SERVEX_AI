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
<div className="w-full md:w-1/2 text-center md:text-left">
  <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
    Centralized <span className="text-purple-300">Artificial Intelligence</span> platform
    for process automation at <strong>SERVEX</strong>.
  </h2>

  <p className="text-gray-600 mt-4 text-xs sm:text-base max-w-md">
    This platform brings together SERVEX’s core artificial intelligence tools
    into a single, unified environment designed to optimize, automate, and
    scale business processes.
    <br /><br />
    By leveraging AI models connected to internal data, the platform helps
    reduce manual tasks, improve decision-making, and accelerate operational,
    technical, and commercial workflows—all from a centralized and adaptable
    system tailored to the company’s needs.
  </p>
</div>


           {/* Imagen */}
           <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="/CData.png"
            alt="Tutoriales GLYNNE"
            className="w-full max-w-md h-auto"
          />
        </div>
      </div>
    </section>
  );
}
