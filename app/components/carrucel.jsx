"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const logos = [
    { src: "/logosCompanys/9to5 Seating - Red.svg", name: "" },
    { src: "/logosCompanys/berner-air-curtains-logo-png_seeklogo-351590.png", name: "" },
    { src: "/logosCompanys/cropped-logo-dals.png", name: "DALS" },
    { src: "/logosCompanys/download (3).png", name: "" },
    { src: "/logosCompanys/Haskell-logo-color-topMargin-01.svg", name: "Haskell" },
    { src: "/logosCompanys/header_logo_hover.svg", name: "Header Logo" },
    { src: "/logosCompanys/hm-logo-caption.svg", name: "HM" },
    { src: "/logosCompanys/LOGO (1).png", name: "" },
    { src: "/logosCompanys/logo-Ali-Group-ForLightBG.svg", name: "Ali Group" },
    { src: "/logosCompanys/logo-metalumen.png", name: "Metalumen" },
    { src: "/logosCompanys/logo.svg", name: "" },
    { src: "/logosCompanys/LogoHeader.avif", name: "Logo Header" },
    { src: "/logosCompanys/mity-lite-logo.png", name: "Mity Lite" },
    { src: "/logosCompanys/ShawFloorsLogo_Navy.png", name: "Shaw Floors" },
    { src: "/logosCompanys/Teknion_logo_RGB.svg", name: "Teknion" },
    { src: "/logosCompanys/via_peach-brown-logo.webp", name: "Via Peach" },
    { src: "/logosCompanys/VIRCO_75-600x183.png", name: "VIRCO" },
];

export default function LogosCarousel() {
    return (
        <section className="w-full py-14 overflow-hidden bg-white">

            {/* ===== TITLE ===== */}
            <h2 className="text-center text-2xl sm:text-3xl font-semibold tracking-tight text-black mb-10">
                Trusted by leading brands
            </h2>

            {/* ===== CAROUSEL WRAPPER (85% Width & Centered) ===== */}
            <div
                className="relative max-w-[80%] mx-auto overflow-hidden"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                }}
            >

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
                                alt={item.name || "Company Logo"}
                                width={70}
                                height={70}
                                className="object-contain"
                            />
                            {item.name && (
                                <p className="mt-2 text-xs sm:text-sm font-medium text-black/60 text-center">
                                    {item.name}
                                </p>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* ===== DESCRIPTION ===== */}
            <p className="text-center text-xs sm:text-sm text-black/60 mt-8 max-w-2xl mx-auto px-4">
                Seamlessly integrated with industry-leading platforms and manufacturers.
            </p>

        </section>
    );
}