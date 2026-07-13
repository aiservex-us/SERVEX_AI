"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const logos = [
  { src: "/logosEmpresas/9to5 Seating - Red.svg", name: "" },
  { src: "/logosEmpresas/berner-air-curtains-logo-png_seeklogo-351590.png", name: "" },
  { src: "/logosEmpresas/cropped-logo-dals.png", name: "DALS" },

  { src: "/logosEmpresas/download (3).png", name: "" },
  { src: "/logosEmpresas/Haskell-logo-color-topMargin-01.svg", name: "Haskell" },
  { src: "/logosEmpresas/header_logo_hover.svg", name: "Header Logo" },
  { src: "/logosEmpresas/hm-logo-caption.svg", name: "HM" },
  { src: "/logosEmpresas/LOGO (1).png", name: "" },
  { src: "/logosEmpresas/logo-Ali-Group-ForLightBG.svg", name: "Ali Group" },
  { src: "/logosEmpresas/logo-metalumen.png", name: "Metalumen" },
  { src: "/logosEmpresas/logo.svg", name: "" },
  { src: "/logosEmpresas/LogoHeader.avif", name: "Logo Header" },
  { src: "/logosEmpresas/mity-lite-logo.png", name: "Mity Lite" },
  { src: "/logosEmpresas/ShawFloorsLogo_Navy.png", name: "Shaw Floors" },
  { src: "/logosEmpresas/Teknion_logo_RGB.svg", name: "Teknion" },
  { src: "/logosEmpresas/via_peach-brown-logo.webp", name: "Via Peach" },
  { src: "/logosEmpresas/VIRCO_75-600x183.png", name: "VIRCO" },
];

export default function LogosCarousel() {
    return (
        <section className="w-full py-14 overflow-hidden bg-white">
          
          {/* ===== TITLE ===== */}
          <h2
            className="
              text-center
              text-2xl sm:text-3xl
              font-semibold
              tracking-tight
              text-black
              mb-10
            "
          >
            Trusted by leading brands
          </h2>
      
          {/* ===== CAROUSEL WRAPPER ===== */}
          <div className="relative w-full overflow-hidden">
            
            {/* ===== MOVING TRACK ===== */}
            <motion.div
              className="flex gap-6 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 40,
              }}
            >
              {[...logos, ...logos].map((item, i) => (
                <div
                  key={i}
                  className="
                    min-w-[160px] sm:min-w-[180px] md:min-w-[200px]
                    flex flex-col items-center justify-center
                    bg-white border border-black/10
                    rounded-xl p-5
                    shadow-sm hover:shadow-md
                    transition-all duration-300
                  "
                >
                  <Image
                    src={item.src}
                    alt={item.name}
                    width={70}
                    height={70}
                    className="object-contain"
                  />
                  <p
                    className="
                      mt-2
                      text-xs sm:text-sm
                      font-medium
                      text-black/60
                      text-center
                    "
                  >
                    {item.name}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
      
          {/* ===== DESCRIPTION ===== */}
          <p
            className="
              text-center
              text-xs sm:text-sm
              text-black/60
              mt-8
              max-w-2xl
              mx-auto
            "
          >
            Seamlessly integrated with industry-leading platforms and manufacturers.
          </p>
      
        </section>
      );
      
}
