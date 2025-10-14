import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiUploadCloud, 
  FiCheck, 
  FiZap, 
  FiShield, 
  FiCpu
} from 'react-icons/fi';
import { 
  BsFileEarmarkArrowUp
} from 'react-icons/bs';

const SVXCopilotEnterprise = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <div className="flex flex-col items-center h-[90vh] bg-white p-4 md:p-8 font-sans text-[#242424]">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-7xl space-y-6"
      >

        {/* TOP BRANDING & MISSION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-[#FAF9F8] border border-[#EDEBE9] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white border border-[#EDEBE9] rounded-lg flex items-center justify-center shadow-sm">
              <FiCpu className="text-[#464775] text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#464775] text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                  Enterprise AI
                </span>
                <h1 className="text-xl font-extrabold tracking-tight text-[#242424]">
                  SVX Copilot <span className="font-normal text-[#616161]">| Delta Intelligence</span>
                </h1>
              </div>
              <p className="text-[#616161] text-[13px] max-w-2xl leading-relaxed">
                Nuestra tecnología de <strong>Neural Matching 1:1</strong> elimina el error humano y revoluciona la gestión de datos.
                Transformamos semanas de trabajo manual en segundos de procesamiento inteligente.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end border-l border-[#EDEBE9] pl-5">
            <span className="text-[9px] font-bold text-[#616161] uppercase mb-1">Impacto Operativo</span>
            <div className="flex items-center gap-2 text-[#237B4B]">
              <FiZap size={14} />
              <span className="text-2xl font-black">-99.2%</span>
            </div>
            <p className="text-[10px] font-medium text-[#616161]">
              Reducción en tiempo de auditoría
            </p>
          </div>
        </header>

        {/* WORKFLOW & UPLOAD INTERFACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-4 bg-white border border-[#EDEBE9] rounded-xl p-6 flex flex-col">
            <div className="mb-6">
              <h4 className="text-[11px] font-black text-[#464775] uppercase tracking-[1.5px] mb-1">
                Protocolo Copilot
              </h4>
              <p className="text-[12px] text-[#616161]">
                Estándar de sincronización de datos Servex.
              </p>
            </div>

            <div className="space-y-6 relative">
              <div className="absolute left-[10px] top-2 bottom-2 w-px bg-[#EDEBE9]" />

              <div className="flex items-start relative z-10">
                <div className="w-5 h-5 bg-[#464775] rounded-full flex items-center justify-center text-white text-[9px] shadow-md border-2 border-white">
                  <FiCheck strokeWidth={3} />
                </div>
                <div className="ml-4">
                  <h3 className="text-[13px] font-bold">Ingesta Masiva</h3>
                  <p className="text-[10px] text-[#616161] mt-0.5">
                    +10,000 SKU sin latencia.
                  </p>
                </div>
              </div>

              <div className="flex items-start relative z-10">
                <div className="w-5 h-5 bg-white border-2 border-[#464775] rounded-full flex items-center justify-center text-[#464775] text-[9px] font-black shadow-sm">
                  2
                </div>
                <div className="ml-4">
                  <h3 className="text-[13px] font-bold">Mapeo Binario 1:1</h3>
                  <p className="text-[10px] text-[#616161] mt-0.5">
                    Comparación contra sistema maestro.
                  </p>
                </div>
              </div>

              <div className="flex items-start relative z-10 opacity-40">
                <div className="w-5 h-5 bg-white border-2 border-[#EDEBE9] rounded-full flex items-center justify-center text-[#616161] text-[9px] font-black">
                  3
                </div>
                <div className="ml-4">
                  <h3 className="text-[13px] font-bold">Reporte de Variaciones</h3>
                  <p className="text-[10px] text-[#616161] mt-0.5">
                    Extracción visual de discrepancias.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <div className="bg-[#FAF9F8] p-3 rounded-lg border border-dashed border-[#EDEBE9]">
                <p className="text-[10px] text-[#242424] italic leading-relaxed">
                  “Los analistas se enfocan en estrategia, no en copiar datos.”
                </p>
                <p className="text-[9px] text-[#616161] mt-2 font-bold">
                  — Servex US Engineering
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-8 bg-white border border-[#EDEBE9] rounded-xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div className="max-w-md">
                <h2 className="text-xl font-black tracking-tight">
                  Consola de Comparación
                </h2>
                <p className="text-[13px] text-[#616161] mt-1">
                  Cargue el catálogo del cliente para iniciar el análisis profundo.
                </p>
              </div>
              <BsFileEarmarkArrowUp size={32} className="text-[#EDEBE9]" />
            </div>

            <div className="border-2 border-dashed border-[#EDEBE9] rounded-xl p-14 flex flex-col items-center bg-[#FAF9F8] hover:bg-white hover:border-[#464775] transition-all cursor-pointer mb-8">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-md mb-4 text-[#464775]">
                <FiUploadCloud size={28} />
              </div>
              <p className="text-[15px] font-black">
                Arrastra el archivo del cliente
              </p>
              <p className="text-[11px] text-[#616161] mt-2 font-medium">
                PDF • CSV • Excel XLSX
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button className="px-6 py-2 border border-[#D1D1D1] rounded-lg text-[12px] font-bold text-[#616161] hover:bg-[#F5F5F5] transition-all uppercase tracking-wider">
                Descartar
              </button>
              <button className="px-7 py-2 bg-[#464775] text-white rounded-lg text-[12px] font-black hover:bg-[#38395d] shadow-md flex items-center gap-2 transition-all active:scale-95 uppercase tracking-wider">
                Iniciar Auditoría <FiZap size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="pt-6 border-t border-[#EDEBE9] flex justify-between items-center">
          <p className="text-[9px] text-[#616161] font-medium">
            <strong>Servex US Engineering</strong> © 2026 | SVX Copilot Enterprise
          </p>
          <div className="flex items-center gap-1 text-[9px] font-bold text-[#237B4B]">
            <FiShield size={12} /> DATA ENCRYPTED
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

export default SVXCopilotEnterprise;
