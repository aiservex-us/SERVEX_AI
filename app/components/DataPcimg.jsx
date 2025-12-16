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
     
        {/* Texto */}
        <div className="w-full md:w-1/2 text-center md:text-left">
        <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
  IA integrada al catálogo centralizado de <strong>Diversified Spaces</strong>, 
  con análisis preciso y <span className="text-purple-800">totalmente adaptable</span>.
</h2>

<p className="text-gray-600 mt-4 text-xs sm:text-base max-w-md">
  Para este demo, se recopiló y unificó todo el catálogo oficial de 
  <strong>Diversified Spaces</strong>. Se realizó una extracción completa de datos 
  desde los documentos PDF, identificando cada producto, sus características, modelos y 
  especificaciones técnicas. Toda esta información fue procesada y centralizada dentro de 
  una base de datos relacional diseñada para este proyecto.
  <br /><br />
  Gracias a esta estructura, el modelo de inteligencia artificial puede acceder libremente 
  a cada componente del catálogo, analizarlo en tiempo real y filtrar resultados con base 
  en las necesidades del usuario. Esto permite generar respuestas claras, confiables y 
  totalmente alineadas con los datos reales de la empresa.
</p>

        </div>

           {/* Imagen con Efecto Sutil en la Esquina Superior Derecha */}
           <div className="w-full md:w-1/2 flex justify-center relative">
               {/* 1. Elemento Sutil (Círculo/Mancha de color) */}
               <div className="
                   absolute top-0 right-0 
                   w-16 h-16 sm:w-20 sm:h-20 
                   bg-purple-800 opacity-70 
                   rounded-full 
                   transform translate-x-1/2 -translate-y-1/2 
                   blur-xl pointer-events-none 
                   z-0
               " aria-hidden="true"></div>
               
               {/* 2. Imagen Principal (z-10 para asegurar que esté por encima del sutil elemento) */}
               <img
                   src="/CData.png"
                   alt="Tutoriales GLYNNE"
                   className="w-full max-w-md h-auto relative z-10" 
               />
           </div>
      </div>
    </section>
  );
}