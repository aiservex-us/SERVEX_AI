"use client";
import React, { useState } from 'react';
import { 
  Info, Settings, Zap, ArrowRightLeft, FileCheck, 
  BarChart3, ShieldCheck, HelpCircle, Building2, 
  FileSearch, CheckCircle2, Lightbulb, Database, 
  LayoutDashboard, ArrowUpRight, Target, FileText, 
  Clock, Briefcase, ChevronDown, Monitor, Share2, MousePointer2,
  Layers, Search, Cpu, ListTree
} from 'lucide-react';

const SyncInfoPanelFull = () => {
  const [activeTab, setActiveTab] = useState('how');
  const [openAccordion, setOpenAccordion] = useState(0);

  const tabs = [
    { id: 'how', label: 'Protocolo de Sincronización', icon: Settings },
    { id: 'process', label: 'Experimentación of Data', icon: Cpu },
    { id: 'solution', label: 'Impacto en el Día a Día', icon: Briefcase },
    { id: 'formats', label: 'Formatos Requeridos', icon: FileCheck },
  ];

  const accordionData = [
    {
      title: "1. Selección de Entidad y Vinculación Crítica",
      content: "Para iniciar cualquier proceso de sincronización en Servex Copilot, el primer paso fundamental es la elección de la empresa o entidad. Esta no es una simple etiqueta; es el marco lógico que permite al sistema entender bajo qué reglas de negocio se deben procesar los tratados. Al seleccionar la empresa, el sistema carga los diccionarios de SKUs específicos, permitiendo que la vinculación sea exacta. Esto evita que los datos se dispersen o se mezclen con otros portafolios, garantizando que el user esté trabajando en un ambiente sanitario y aislado para su cliente específico.",
      icon: Building2
    },
    {
      title: "2. Carga, Lectura y Experimentación",
      content: "Una vez definida la entidad, el proceso de subir el file (PDF o CSV) activa el motor de experimentación. El SVX Compiler no se limita a copiar texto; analiza la estructura, detecta los paréntesis de información más pequeños y los 'experimenta' frente a la base de datos histórica. En esta fase, el sistema determina instantáneamente cómo han cambiado los datos, detectando variaciones en precios (Grados G2 al G13), dimensiones o descripciones técnicas. Es aquí donde la plataforma 'aprende' las actualizaciones del catálogo y las prepara para la sincronización final.",
      icon: FileSearch
    },
    {
      title: "3. Comparación Instantánea de Tratados",
      content: "La verdadera potencia de la herramienta reside en su capacidad de comparación. Al procesar el formato requerido, el sistema genera un espejo comparativo entre lo que existe actualmente y lo que el new documento propone. Este análisis permite identificar de forma visual y textual qué actualizaciones se han hecho en los tratados comerciales, permitiendo al colaborador validar cambios en segundos en lugar de horas. El sistema resalta las discrepancias para que la toma de decisiones sea basada en datos puros y verificados.",
      icon: ArrowRightLeft
    }
  ];

  return (
    <div className="flex flex-col w-full h-full bg-white font-sans text-[#FFF] overflow-hidden">
      
      {/* HEADER BANNER */}
      <div className="m-4 md:m-6 p-6 md:p-10 bg-[#FFF] rounded-2xl border border-[#EDEBE9] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="z-10 flex-1">
          <div className="flex items-center gap-2 mb-4 bg-white w-fit px-3 py-1 rounded-full border border-[#EDEBE9]">
            <Database size={14} className="text-[#6264A7]" />
            <span className="text-[10px] font-bold text-[#6264A7] uppercase tracking-[0.1em]">Servex Copilot Architecture</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-[#242424] leading-tight mb-4 tracking-tight">
            Synchronization Management <span className="text-[#6264A7]">of Data</span>
          </h1>
          <p className="text-[14px] text-[#605E5C] leading-relaxed max-w-4xl">
            Synchronizing data with Servex Copilot requires a structured flow where each uploaded file is analyzed to allow you to choose exactly which company to link. 
          </p>
        </div>
        <div className="relative shrink-0 hidden lg:block opacity-20 group-hover:opacity-40 transition-opacity">
          <Layers size={160} className="text-[#6264A7]" strokeWidth={1} />
        </div>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="px-6 border-b border-[#EDEBE9] overflow-x-auto bg-white sticky top-0 z-30">
        <div className="flex gap-4 md:gap-10 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 text-[13px] font-bold transition-all relative
                ${activeTab === tab.id 
                  ? 'text-[#6264A7] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#6264A7]' 
                  : 'text-[#605E5C] hover:text-[#242424] hover:bg-[#F3F2F1]/50'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ÁREA DE CONTENIDO MASIVO */}
      <div className="p-4 md:p-8 flex-1 overflow-y-auto bg-[#FFF]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* TAB 1: PROTOCOLO */}
          {activeTab === 'how' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-[#EDEBE9] shadow-sm">
                  <h2 className="text-[16px] font-bold text-[#6264A7] mb-4 flex items-center gap-2">
                    <ListTree size={20} /> Master Operation Flow
                  </h2>
                  <p className="text-[13px] text-[#605E5C] leading-[1.8]">
                    The synchronization process is not a simple document upload. It is an architecture designed so that collaborators can manage massive changes without risk of error. Upon uploading a PDF or CSV, the system first asks to confirm the **Linked Entity**. This is vital because each company has unique treaties and price structures. Once Servex Copilot identifies the company, it proceeds to decompose the file into the smallest possible data brackets: from the individual SKU to the complex G2, G3, and higher grade prices.
                  </p>
                </div>

                <div className="space-y-4">
                  {accordionData.map((item, idx) => (
                    <div key={idx} className="bg-white border border-[#EDEBE9] rounded-xl overflow-hidden shadow-sm">
                      <button 
                        onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                        className="w-full p-5 flex items-center justify-between hover:bg-[#F3F2F1]/30 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <item.icon size={20} className="text-[#6264A7]" />
                          <span className="font-bold text-[14px]">{item.title}</span>
                        </div>
                        <ChevronDown className={`transition-transform duration-300 ${openAccordion === idx ? 'rotate-180' : ''}`} size={18} />
                      </button>
                      {openAccordion === idx && (
                        <div className="p-6 pt-0 text-[13px] text-[#605E5C] leading-relaxed border-t border-[#F3F2F1] mt-2 animate-in slide-in-from-top-2">
                          {item.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#242424] text-white p-6 rounded-2xl shadow-xl border border-[#333]">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-[#FFD700]" /> Instant Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-[11px] font-bold text-[#FFD700] uppercase mb-1">Responsiveness</p>
                      <p className="text-[12px] opacity-80 italic leading-snug">
                        "The system reduces catalog comparison time from 8 manual hours to 45 seconds of digital processing."
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-[11px] font-bold text-[#4ECB71] uppercase mb-1">Precisión Operativa</p>
                      <p className="text-[12px] opacity-80 leading-snug">
                        Automatic validation of 12 price levels and alphanumeric SKUs in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOLUCION PROBLEMAS (TEXTO PROFUNDO) */}
          {activeTab === 'solution' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
              <div className="bg-white p-8 rounded-2xl border border-[#EDEBE9] shadow-sm">
                <div className="w-12 h-12 bg-[#6264A7]/10 rounded-full flex items-center justify-center mb-6">
                  <Target size={24} className="text-[#6264A7]" />
                </div>
                <h3 className="text-xl font-bold mb-4">Solución a Problemas del Día a Día</h3>
                <div className="text-[13px] text-[#605E5C] space-y-4 leading-relaxed">
                  <p>
                    Collaborators often face the challenge of constantly changing catalogs. Manual updating is not only slow, but dangerous for the company's profitability. Servex Copilot solves this by allowing a smooth upload where the system does the dirty work.
                  </p>
                  <p>
                    <strong>Error Elimination:</strong> By reading directly from the source PDF, typo errors when transcribing prices are eliminated. The system tells you exactly which price went up or down, allowing you to update your treaty list instantly.
                  </p>
                  <p>
                    <strong>Agilidad Comercial:</strong> If a factory sends a new price PDF on a Friday afternoon, you can have the system synchronized in 5 minutes, ensuring that the sales team always quotes with the most recent data.
                  </p>
                </div>
              </div>

              <div className="bg-[#6264A7] p-8 rounded-2xl text-white shadow-lg flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck size={24} /> Tratados Seguros e Íntegros
                </h3>
                <p className="text-[14px] opacity-90 leading-relaxed mb-6">
                  The security and solidarity of the system lie in its transparency. Every change detected in data experimentation is recorded. You can see the "before" and "after" of each treaty, which guarantees that the information synchronized with the central platform is consistent, auditable, and free of visual or technical corruption.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-[10px] uppercase font-medium">Digitalizado</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                    <p className="text-2xl font-bold">0%</p>
                    <p className="text-[10px] uppercase font-medium">Manual Entry</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FORMATOS (MAS TEXTO) */}
          {activeTab === 'formats' && (
            <div className="bg-white border border-[#EDEBE9] rounded-2xl shadow-sm overflow-hidden animate-in zoom-in-95">
              <div className="p-8 md:p-12">
                <div className="max-w-4xl">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FileText className="text-[#6264A7]" /> Format Guide and Technical Requirements
                  </h3>
                  <div className="text-[14px] text-[#605E5C] space-y-6 leading-relaxed">
                    <p>
                      In order for the **SVX Compiler** platform to execute its deep reading algorithms, files must be presented in a standard format. This is not just for order, but for processing capacity: the system needs to identify data anchors (such as the SKU) to be able to compare the previous treaty with the new one.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
                      <div className="p-6 bg-[#FAF9F8] rounded-xl border border-[#EDEBE9]">
                        <h4 className="font-bold text-[#242424] mb-3 border-b pb-2">Files PDF</h4>
                        <p className="text-[12px]">The PDF must be of digital origin (not scanned as an image). This allows the extraction engine to read the text layers and correctly assign each price to the corresponding SKU in the treaties table.</p>
                      </div>
                      <div className="p-6 bg-[#FAF9F8] rounded-xl border border-[#EDEBE9]">
                        <h4 className="font-bold text-[#242424] mb-3 border-b pb-2">Files CSV</h4>
                        <p className="text-[12px]">It must be UTF-8 encoded and follow the required column structure: SKU, Dimensions, and the 12 price levels. This ensures that data injection to the cloud is clean and without broken characters.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER ENTERPRISE */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-[#EDEBE9] pt-8 gap-6 max-w-7xl mx-auto pb-10">
          <div className="flex items-center gap-4 text-[#605E5C]">
            <div className="w-12 h-12 rounded-full bg-[#6264A7] flex items-center justify-center text-white font-bold shadow-lg shadow-[#6264A7]/20">
              SVX
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-black tracking-tight text-[#242424]">Data Intelligence Center</span>
              <span className="text-[11px] opacity-70">Sincronizador Servex Copilot v2.5.10 | Sanitario & Seguro</span>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
             <button className="flex-1 md:flex-none px-8 py-3 bg-[#6264A7] text-white rounded-xl text-[13px] font-bold hover:bg-[#4E52B1] transition-all shadow-lg hover:shadow-[#6264A7]/30 flex items-center justify-center gap-2">
                Iniciar Global Sync <ArrowUpRight size={18} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncInfoPanelFull;