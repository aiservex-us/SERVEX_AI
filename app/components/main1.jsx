'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Componente básico del Modal
function SimpleModal({ isOpen, onClose, title }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            p-4 sm:p-6
            backdrop-filter backdrop-blur-md 
            bg-black/20
          "
          // Animación del fondo (Overlay)
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose} // Cierra si se hace clic fuera del modal
        >
          {/* Contenedor del Modal (Contenido) */}
          <motion.div
            className="
              relative
              w-full max-w-lg
              bg-white
              rounded-xl shadow-2xl
              p-6 sm:p-8
            "
            // Animación del contenido
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal cierre el overlay
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {title}
            </h2>
            
            {/* Contenido para futuras importaciones */}
            <div className="text-gray-600 space-y-3">
              <p>
                Este es el cuerpo del modal. Aquí podrás importar el contenido y la información específica para: 
              </p>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                <p className="font-mono text-sm text-black/80">
                  // FUTURA IMPORTACIÓN DE COMPONENTE O DATA AQUÍ
                </p>
                <p className="text-xs mt-2">
                    (Por ejemplo, documentación, herramientas de automatización, o visualización de datos).
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="
                mt-6 inline-flex justify-center 
                rounded-full border border-transparent 
                bg-black px-4 py-2 text-sm font-medium 
                text-white shadow-sm hover:bg-gray-800
                transition
              "
            >
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

export default function Main1() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
  });

  const openModal = (title) => {
    setModalState({ isOpen: true, title });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, title: '' });
  };

  const navItems = [
    { name: 'Docs', action: () => openModal('Documentación (Docs)') },
    { name: 'Automation', action: () => openModal('Herramientas de Automatización') },
    { name: 'Data', action: () => openModal('Visualización y Gestión de Datos') },
    { name: 'Use Cases', action: () => openModal('Casos de Uso Empresariales') },
    { name: 'Support', action: () => openModal('Soporte y Asistencia') },
  ];

  return (
    <main
      className="
        relative w-full min-h-[90%]
        bg-white text-black
        flex items-center justify-center
        font-inter
        px-3 sm:px-6
      "
    >
      {/* Modal Overlay y Contenido */}
      <SimpleModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
      />
      
      {/* Main Card */}
      <section
        className="
          relative
          w-full max-w-[1400px]
          min-h-[80vh] md:h-[80vh]
          mx-auto
          rounded-[24px] md:rounded-[28px]
          bg-white
          overflow-hidden
          flex flex-col
        "
      >
        {/* Navbar */}
        <header
          className="
            flex items-center justify-between
            px-4 sm:px-6 md:px-10
            py-4 md:py-6
            shrink-0
          "
        >
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-black" />
            <span className="font-semibold text-sm md:text-base">
              SERVEX US
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-black/70">
            {navItems.map((item) => (
              <a 
                key={item.name}
                onClick={item.action}
                className="cursor-pointer hover:text-black transition font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>
        </header>

        {/* Hero */}
        <div
          className="
            flex-1
            grid grid-cols-1 md:grid-cols-2
            gap-10
            px-4 sm:px-6 md:px-10
            pb-6 md:pb-10
            items-center
          "
        >
          {/* Left content */}
          <div>
            <span
              className="
                inline-block mb-5
                rounded-full
                border border-black/10
                px-4 py-1
                text-[11px] sm:text-xs
              "
            >
              Internal Platform · CET Servex US
            </span>

            <h1
              className="
                text-3xl sm:text-4xl md:text-5xl
                font-medium
                leading-tight
                tracking-tight
              "
            >
              Automation <br />
              and Data <br />
              Management <span className="opacity-60">*</span>
            </h1>

            <p
              className="
                mt-5 sm:mt-6
                max-w-md
                text-sm
                text-black/60
              "
            >
              This platform centralizes automation tools and data control systems
              designed to optimize operational processes outside of CET Designer,
              enabling CET Servex teams to work more efficiently, in an organized
              and scalable way.
            </p>

            <div
              className="
                mt-7 sm:mt-8
                flex flex-col sm:flex-row
                sm:items-center
                gap-5 sm:gap-6
              "
            >
              {/* EXTERNAL LINK BUTTON */}
              <a
                href="https://servex-us.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex
                  items-center
                  justify-center
                  w-full sm:w-auto
                  rounded-full
                  bg-black
                  px-8 py-3
                  text-sm
                  font-medium
                  text-white
                  shadow-lg
                  transition hover:scale-[1.03]
                "
              >
                Access the platform
              </a>

              <div className="flex items-center gap-4 text-xs text-black/60">
                <span>✓ Centralized processes</span>
                <span>✓ Controlled data</span>
              </div>
            </div>
          </div>

          {/* Right visual (HIDDEN < 800px) */}
          <div
            className="
              hidden md:block
              relative
              w-full
              min-h-[420px]
              md:h-full
            "
          >
            {/* WHITE BASE */}
            <div className="absolute inset-0 rounded-3xl bg-white" />

            {/* SOFT CENTRAL DIAGONAL GRADIENT */}
            <div
              className="
                absolute inset-0
                rounded-3xl
                bg-[radial-gradient(ellipse_at_center,_rgba(236,72,153,0.35)_0%,_rgba(216,180,254,0.35)_35%,_rgba(186,230,253,0.35)_55%,_transparent_70%)]
              "
            />

            {/* Image container */}
            <div
              className="
                relative z-10
                w-full h-full
                flex items-center justify-center
                p-10
              "
            >
              <Image
                src="/imgMain1.png"
                alt="Platform preview"
                width={1100}
                height={1100}
                className="
                  max-w-full
                  max-h-full
                  object-contain
                  drop-shadow-2xl
                "
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}