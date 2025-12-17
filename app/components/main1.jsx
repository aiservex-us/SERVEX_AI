'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// ====================================================================
// MODAL
// ====================================================================

function SimpleModal({ isOpen, onClose, title, description }) {
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
          "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="
              relative
              w-full max-w-lg
              bg-white
              rounded-xl shadow-2xl
              p-6 sm:p-8
            "
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-black mb-3">
              {title}
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-black/60 leading-relaxed">
              {description}
            </p>

            <button
              onClick={onClose}
              className="
                mt-6 inline-flex justify-center
                rounded-full
                bg-black px-4 py-2
                text-sm font-medium text-white
                shadow-sm hover:bg-gray-800
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
// MAIN
// ====================================================================

export default function Main1() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    description: '',
  });

  const openModal = (title, description) => {
    setModalState({ isOpen: true, title, description });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, title: '', description: '' });
  };

  const navItems = [
    { name: 'Docs', action: () => openModal('SERVEX Ecosystem Documentation','SERVEX is an AI-driven software ecosystem designed to digitize, automate, and scale Servex’s manual and operational work.') },
    { name: 'Automation', action: () => openModal('Intelligent Operational Automation','Automation in SERVEX transforms repetitive tasks into autonomous, adaptive, and scalable flows.') },
    { name: 'Data', action: () => openModal('Data as a Decision Engine','SERVEX centralizes operational data and converts it into actionable knowledge.') },
    { name: 'Use Cases', action: () => openModal('AI Applied to Real Work','SERVEX use cases are born directly from daily operations.') },
    { name: 'Support', action: () => openModal('AI-Guided Support','Artificial intelligence monitors, assists, and optimizes processes continuously.') },
  ];

  return (
    <main
      className="
        relative w-full min-h-[90%]
        flex items-center justify-center
        px-3 sm:px-6
        bg-black text-white
        md:bg-white md:text-black
      "
    >
      <SimpleModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        description={modalState.description}
      />

      <section
        className="
          relative
          w-full max-w-[1400px]
          min-h-[80vh] md:h-[80vh]
          mx-auto
          rounded-[24px]
          overflow-hidden
          flex flex-col

          bg-black text-white
          bg-[url('/bg-mobile.jpg')]
          bg-cover bg-center

          md:bg-white md:text-black
        "
      >
        <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 md:py-6">
          <div className="flex items-center gap-2">
            <img src="/logo2.png" alt="Servex Logo" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
            <span className="font-semibold text-sm md:text-base">
              SVX COPILOT
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-black/70">
            {navItems.map((item) => (
              <span
                key={item.name}
                onClick={item.action}
                className="cursor-pointer hover:text-black transition font-medium"
              >
                {item.name}
              </span>
            ))}
          </nav>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 px-4 sm:px-6 md:px-10 pb-6 md:pb-10 items-center">
          <div>
            <span className="inline-block mb-5 rounded-full px-4 py-1 text-[11px] sm:text-xs border border-white/30 md:border-black/10">
              Internal Platform · CET Servex US
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium leading-tight tracking-tight">
              Automation <br /> and Data <br /> Management <span className="opacity-60">*</span>
            </h1>

            <p className="mt-5 sm:mt-6 max-w-md text-sm text-white/80 md:text-black/60">
              This platform centralizes automation tools and data control systems designed to optimize operational processes.
            </p>

            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
              <a
                href="https://servex-us.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex items-center justify-center
                  w-full sm:w-auto
                  rounded-full
                  px-8 py-3
                  text-sm font-medium
                  bg-white text-black
                  md:bg-black md:text-white
                  shadow-lg transition hover:scale-[1.03]
                "
              >
                Go to SERVEX
              </a>

              <div className="flex items-center gap-4 text-xs text-white/70 md:text-black/60">
                <span>✓ Centralized processes</span>
                <span>✓ Controlled data</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block relative w-full min-h-[420px] md:h-full">
            <div className="absolute inset-0 rounded-3xl bg-white" />
            <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_center,_rgba(236,72,153,0.35)_0%,_rgba(216,180,254,0.35)_35%,_rgba(186,230,253,0.35)_55%,_transparent_70%)]" />
            <div className="relative z-10 flex items-center justify-center overflow-visible">
              <Image
                src="/imgMain1.png"
                alt="Platform preview"
                width={2000}
                height={2000}
                className="w-[180%] h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
