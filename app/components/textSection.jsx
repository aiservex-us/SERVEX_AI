import React from 'react';

const StatsSection = () => {
    const stats = [
        {
            value: "100%",
            label: "Centralized and organized data for Servex AI & CD Sign clients",
        },
        {
            value: "100%",
            label: "You’ll be able to edit, update, add, delete, and maintain full control of all your catalogs.",
        },
        {
            value: "80%",
            label: "Less friction between your company’s processes and Servex in catalog updates",
        },
        {
            value: "24/7",
            label: "Real-time visibility into your product and data ecosystem",
        },
    ];

    return (
        <section className="relative py-20 px-6 md:px-12 bg-[#fff] overflow-hidden font-sans">
            {/* Gradientes pasteles sutiles de fondo */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] rounded-full bg-gradient-to-br from-blue-50 to-transparent blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-gradient-to-tl from-purple-50 to-transparent blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                {/* Lado Izquierdo: Explicación de Valor Técnico */}
                <div className="space-y-8">
                    <div className="space-y-3">
                        <h1 className="text-3xl md:text-[220%] font-light text-[#1a1a1a] leading-[1.15] tracking-tighter max-w-xl">
                            <span className="font-bold">Exponential Optimization:</span> <br />
                            The AI-driven core of Servex catalog operations.
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 font-light max-w-sm leading-relaxed">
                            We empower our collaborators by replacing cumbersome Excel workflows with a centralized ecosystem for data analysis and intelligent AI assistance.
                        </p>
                    </div>

                    <button className="group relative bg-[#1a1a1a] text-white px-6 py-3 rounded-full font-medium text-[10px] uppercase tracking-[0.2em] transition-all duration-300 hover:bg-[#ff4d29] overflow-hidden">
                        <span className="relative z-10">View Technical Workflow</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-[#ff4d29] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                </div>

                {/* Lado Derecho: Grid de Estadísticas (Ajustado a tamaños pequeños) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col space-y-2">
                            <span className="text-4xl md:text-5xl font-light text-[#1a1a1a] tracking-tighter">
                                {stat.value}
                            </span>
                            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium leading-snug max-w-[180px]">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default StatsSection;