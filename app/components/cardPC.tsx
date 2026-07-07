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
                {/* Image */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <img
                        src="/CData.png"
                        alt="Tutoriales SERVEX"
                        className="w-full max-w-md h-auto"
                    />
                </div>

                {/* Text */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <h2
                        className="
              text-3xl md:text-[250%] 
              font-light 
              text-[#1a1a1a] 
              leading-[1.1] 
              tracking-tighter 
              max-w-2xl
            "
                    >
                        <span className="font-bold">Exponential Data Evolution:</span> <br />
                        The AI-driven core for Servex catalog intelligence.
                    </h2>

                    <p
                        className="
              mt-6
              text-sm md:text-base lg:text-lg 
              font-light 
              text-gray-500 
              max-w-xl 
              md:max-w-2xl 
              leading-relaxed
            "
                    >
                        Say goodbye to the complexity of manual spreadsheets. This{" "}
                        <span className="text-black font-normal">
                            centralized platform
                        </span>{" "}
                        hosts all your catalogs in one place, specifically engineered for
                        <span className="text-black font-normal"> Servex and CET Designer collaborators.</span>
                        <br /><br />
                        Replace cumbersome Excel workflows and duplicate files with a
                        professional ecosystem designed to <span className="text-black font-normal">edit, update, and analyze</span>
                        data through intelligent automation and specialized tools.
                    </p>
                </div>
            </div>
        </section>
    );
}