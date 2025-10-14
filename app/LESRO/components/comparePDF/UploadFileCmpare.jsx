import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiUploadCloud, 
  FiCheck, 
  FiZap, 
  FiShield, 
  FiCpu, 
  FiBarChart2, 
  FiLayers, 
  FiTarget,
  FiClock,
  FiSearch
} from 'react-icons/fi';
import { 
  BsFileEarmarkArrowUp, 
  BsLightningFill, 
  BsShieldCheck,
  BsAward
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
    <div className="flex flex-col items-center min-h-screen bg-white p-6 md:p-10 font-sans text-[#242424]">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-7xl space-y-8"
      >
        {/* TOP BRANDING & MISSION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#FAF9F8] border border-[#EDEBE9] rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white border border-[#EDEBE9] rounded-lg flex items-center justify-center shadow-sm">
              <FiCpu className="text-[#5b5fc7] text-3xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#5b5fc7] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Enterprise AI</span>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#242424]">SVX Copilot <span className="font-normal text-[#616161]">| Delta Intelligence</span></h1>
              </div>
              <p className="text-[#616161] text-sm max-w-2xl leading-relaxed">
                Nuestra tecnología de **Neural Matching 1:1** elimina el error humano y revoluciona la gestión de datos. 
                Comparamos cada atributo, precio y especificación técnica con una precisión quirúrgica, transformando 
                semanas de trabajo manual en segundos de procesamiento inteligente.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end border-l border-[#EDEBE9] pl-6">
            <span className="text-[10px] font-bold text-[#616161] uppercase mb-1">Impacto Operativo</span>
            <div className="flex items-center gap-2 text-[#237B4B]">
              <FiZap className="fill-current" />
              <span className="text-3xl font-black">-99.2%</span>
            </div>
            <p className="text-[11px] font-medium text-[#616161]">Reducción en tiempo de auditoría</p>
          </div>
        </header>

        {/* STRATEGIC VALUE METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Time Reduction Card */}
          <div className="bg-white p-6 border border-[#EDEBE9] rounded-xl relative overflow-hidden group hover:border-[#5b5fc7] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#EBF3FC] rounded-lg text-[#0078D4]">
                <FiClock size={20} />
              </div>
              <BsAward className="text-[#5b5fc7] opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-sm font-bold text-[#242424]">Eficiencia Implacable</h3>
            <p className="text-[11px] text-[#616161] mt-2">Sustituimos la comparación manual de producto por producto mediante hilos de ejecución paralelos.</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-2xl font-bold">2.4s</span>
              <span className="text-[10px] text-[#237B4B] font-bold">vs 15 días manuales</span>
            </div>
          </div>

          {/* Accuracy Card */}
          <div className="bg-white p-6 border border-[#EDEBE9] rounded-xl hover:border-[#5b5fc7] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#F5F5F5] rounded-lg text-[#5b5fc7]">
                <FiTarget size={20} />
              </div>
            </div>
            <h3 className="text-sm font-bold text-[#242424]">Exactitud Atómica</h3>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span>MATCHING PRECISION</span>
                <span className="text-[#5b5fc7]">100%</span>
              </div>
              <div className="w-full bg-[#EDEBE9] h-1.5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-[#5b5fc7]" />
              </div>
            </div>
          </div>

          {/* Integrity Card */}
          <div className="bg-white p-6 border border-[#EDEBE9] rounded-xl hover:border-[#5b5fc7] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#FDF3E8] rounded-lg text-[#8A662E]">
                <BsShieldCheck size={20} />
              </div>
            </div>
            <h3 className="text-sm font-bold text-[#242424]">Integridad Impecable</h3>
            <p className="text-[11px] text-[#616161] mt-2">Detección proactiva de inconsistencias en catálogos legacy del cliente.</p>
            <div className="mt-3 py-1 px-2 bg-[#F3F5F8] inline-block rounded border border-[#EDEBE9]">
              <span className="text-[10px] font-bold text-[#464775]">ISO-READY DATA</span>
            </div>
          </div>

          {/* Conversion Card */}
          <div className="bg-[#5b5fc7] p-6 rounded-xl text-white relative overflow-hidden flex flex-col justify-between shadow-lg">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <FiLayers className="text-white/80" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Deep Sync</h3>
              </div>
              <p className="text-[11px] text-white/80 mb-6 leading-relaxed">
                Nuestra IA descompone archivos complejos en estructuras XML optimizadas para CET Designer.
              </p>
           
            </div>
            <BsLightningFill className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10" />
          </div>
        </div>

        {/* WORKFLOW & UPLOAD INTERFACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: STEP GUIDE */}
          <div className="lg:col-span-4 bg-white border border-[#EDEBE9] rounded-xl p-8 flex flex-col">
            <div className="mb-8">
              <h4 className="text-[12px] font-black text-[#5b5fc7] uppercase tracking-[2px] mb-2">Protocolo Copilot</h4>
              <p className="text-[13px] text-[#616161]">El estándar de oro en sincronización de datos para Servex.</p>
            </div>

            <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-[1.5px] bg-[#EDEBE9]" />
              
              <div className="flex items-start relative z-10">
                <div className="w-6 h-6 bg-[#5b5fc7] rounded-full flex items-center justify-center text-white text-[10px] shadow-md border-2 border-white">
                  <FiCheck strokeWidth={4} />
                </div>
                <div className="ml-5">
                  <h3 className="text-[14px] font-bold text-[#242424]">Ingesta Masiva</h3>
                  <p className="text-[11px] text-[#616161] mt-1">Soporta catálogos de +10,000 SKU sin latencia.</p>
                </div>
              </div>

              <div className="flex items-start relative z-10">
                <div className="w-6 h-6 bg-white border-2 border-[#5b5fc7] rounded-full flex items-center justify-center text-[#5b5fc7] text-[10px] font-black shadow-sm">
                  2
                </div>
                <div className="ml-5">
                  <h3 className="text-[14px] font-bold text-[#242424]">Mapeo Binario 1:1</h3>
                  <p className="text-[11px] text-[#616161] mt-1">Comparación cruzada contra el sistema maestro.</p>
                </div>
              </div>

              <div className="flex items-start relative z-10 opacity-40">
                <div className="w-6 h-6 bg-white border-2 border-[#EDEBE9] rounded-full flex items-center justify-center text-[#616161] text-[10px] font-black">
                  3
                </div>
                <div className="ml-5">
                  <h3 className="text-[14px] font-bold text-[#242424]">Reporte de Variaciones</h3>
                  <p className="text-[11px] text-[#616161] mt-1">Extracción visual de deltas y discrepancias.</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10">
              <div className="bg-[#FAF9F8] p-4 rounded-lg border border-dashed border-[#EDEBE9]">
                <p className="text-[11px] text-[#242424] font-medium leading-relaxed italic">
                  "Esta solución permite a los analistas enfocarse en la estrategia, no en el pegado de datos."
                </p>
                <p className="text-[10px] text-[#616161] mt-2 font-bold">— Servex US Engineering Team</p>
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE CONSOLE */}
          <div className="lg:col-span-8 bg-white border border-[#EDEBE9] rounded-xl p-10 shadow-sm">
            <div className="flex justify-between items-start mb-10">
              <div className="max-w-md">
                <h2 className="text-2xl font-black text-[#242424] tracking-tight">Consola de Comparación</h2>
                <p className="text-[14px] text-[#616161] mt-2">Cargue el catálogo proporcionado por el cliente para iniciar el proceso de **Deep Analysis**. SVX Copilot encontrará cada diferencia, por pequeña que sea.</p>
              </div>
              <BsFileEarmarkArrowUp size={40} className="text-[#EDEBE9]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="group">
                <label className="text-[10px] font-black text-[#616161] uppercase mb-2 block tracking-wider group-focus-within:text-[#5b5fc7] transition-colors">Identificador de Sesión</label>
                <input 
                  type="text" 
                  className="w-full h-11 border border-[#EDEBE9] rounded-lg px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/10 focus:border-[#5b5fc7] transition-all bg-[#FAF9F8]" 
                  placeholder="Ej: UPDATE_CLIENT_LESRO_2026" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-[#616161] uppercase mb-2 block tracking-wider">Entorno de Datos</label>
                <select className="w-full h-11 border border-[#EDEBE9] rounded-lg px-4 text-sm focus:outline-none focus:border-[#5b5fc7] bg-white transition-all">
                  <option>Servex Master System (Live)</option>
                  <option>Stage / Validation Environment</option>
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-[#EDEBE9] rounded-2xl p-20 flex flex-col items-center justify-center bg-[#FAF9F8] hover:bg-white hover:border-[#5b5fc7] hover:shadow-xl hover:shadow-[#5b5fc7]/5 transition-all cursor-pointer group relative overflow-hidden mb-10">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 text-[#5b5fc7] group-hover:scale-110 transition-transform duration-500">
                <FiUploadCloud size={36} />
              </div>
              <p className="text-[18px] font-black text-[#242424]">Arrastra el archivo del cliente</p>
              <p className="text-[12px] text-[#616161] mt-3 font-medium bg-white px-4 py-1 rounded-full border border-[#EDEBE9]">Soporta PDF Técnico • CSV Estructurado • Excel XLSX</p>
              
              <div className="mt-8 flex items-center gap-2 text-[11px] font-bold text-[#5b5fc7] opacity-0 group-hover:opacity-100 transition-opacity">
                <FiZap className="animate-pulse" /> IA LISTA PARA PROCESAR
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button className="px-8 py-3 border border-[#D1D1D1] rounded-lg text-[13px] font-bold text-[#616161] hover:bg-[#F5F5F5] transition-all uppercase tracking-widest">
                Descartar
              </button>
              <button className="px-10 py-3 bg-[#5b5fc7] text-white rounded-lg text-[13px] font-black hover:bg-[#4f52b2] shadow-lg shadow-[#5b5fc7]/20 flex items-center gap-3 transition-all active:scale-95 uppercase tracking-widest">
                Iniciar Auditoría Neural <FiZap strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* ENTERPRISE FOOTER */}
        <footer className="pt-8 border-t border-[#EDEBE9] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-[#616161] font-medium tracking-tight">
              <strong>Servex US Engineering</strong> © 2026 | SVX Copilot Dashboard Enterprise Edition v4.8.0
            </p>
            <span className="h-4 w-[1px] bg-[#EDEBE9] hidden md:block" />
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#237B4B]">
              <FiShield /> DATA ENCRYPTED 256-BIT
            </div>
          </div>
          <div className="flex gap-8">
            <span className="text-[11px] font-black text-[#5b5fc7] cursor-pointer hover:underline uppercase tracking-tighter">Protocolo de Ingesta</span>
            <span className="text-[11px] font-black text-[#5b5fc7] cursor-pointer hover:underline uppercase tracking-tighter">Support & SLA</span>
          </div>
        </footer>
      </motion.div>
    </div>
  );
};

export default SVXCopilotEnterprise;