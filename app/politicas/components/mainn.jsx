"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import AgentConfigPanel from "./componets/logicPanel2";

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <main className="w-screen h-screen bg-white flex p-0 m-0 overflow-hidden">
      {/* 🔹 Panel principal (AHORA 100%) */}
      <div className="w-full h-full overflow-y-auto flex flex-col items-center justify-center relative">
        {/* Sección de texto centrada */}
        <motion.div
          className="relative z-10 max-w-4xl text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Título */}
          <motion.h2
            className="text-neutral-800 text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-wider"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            GLYNNE <span className="text-gray-500">PANEL AI</span>
          </motion.h2>

          {/* Texto descriptivo */}
          <motion.p
            className="text-gray-600 text-sm md:text-base lg:text-base leading-relaxed mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            GLYNNE Panel AI is the environment where developers design, configure, and test their intelligent models before integrating them
            into the <strong>LLM processing engine</strong>. Here you can modify the structure, personality, and behavior of each agent,
            assign specific roles and define advanced technical parameters. It is the link between human creativity and generative autonomy,
            optimized so that each adjustment translates into performance, consistency, and precision within the GLYNNE ecosystem.
          </motion.p>

          {/* Botón que abre el popup */}
          <motion.button
            onClick={() => setOpen(true)}
            className="relative px-12 py-3 text-sm md:text-base font-semibold 
                      bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900
                      text-white shadow-xl overflow-hidden rounded-xl group transition-all duration-300 inline-block cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span className="relative z-10 font-medium">
              Start GLYNNE dev AI development environment
            </span>
          </motion.button>

          {/* Nota final */}
          <motion.p
            className="text-gray-400 text-xs md:text-sm mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            tu agente al instante
          </motion.p>
        </motion.div>

        {/* Leyenda inferior */}
        <div className="w-full text-center absolute bottom-4 text-gray-500 text-xs tracking-wide">
          © GLYNNE 2025 - Innovation powered by artificial intelligence
        </div>
      </div>

      {/* 🔹 Popup con AgentConfigPanel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="agent-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center overflow-y-auto z-50"
          >
            {/* Contenedor del contenido */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-full ml-[-80px] max-w-[100%] h-[100vh] rounded-2xl p-8"
            >
          

              {/* Descripción del panel */}
              <motion.div
                className="max-w-3xl text-center mx-auto "
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
              
              </motion.div>

              {/* Contenedor del componente */}
              <div className=" ">
                <AgentConfigPanel />
              </div>
            </motion.div>
          </motion.div>
        )}

      
      </AnimatePresence>

    </main>
  );
}
