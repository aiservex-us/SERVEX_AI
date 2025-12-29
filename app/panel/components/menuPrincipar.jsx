'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  FileUp, 
  FileDown, 
  Filter, 
  PieChart, 
  Briefcase, 
  Settings, 
  HelpCircle, 
  Search,
  ChevronDown,
  Plus
} from 'lucide-react';

export default function ServiceDataSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  const menuGroups = {
    gestion: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard General', key: 'dash' },
      { icon: <Building2 size={20} />, label: 'Insertar Empresa', key: 'add-company' },
      { icon: <Filter size={20} />, label: 'Filtros Avanzados', key: 'filters' },
    ],
    intercambio: [
      { icon: <FileUp size={20} />, label: 'Importar XML', key: 'import' },
      { icon: <FileDown size={20} />, label: 'Exportar XML', key: 'export' },
      { icon: <PieChart size={20} />, label: 'Reportes Portafolio', key: 'reports' },
    ],
    segmentos: [
      { color: 'bg-blue-400', label: 'Clientes VIP' },
      { color: 'bg-emerald-400', label: 'Nuevas Empresas' },
      { color: 'bg-amber-400', label: 'Auditoría Pendiente' },
    ]
  };

  return (
    /* Contenedor centrado que ocupa el 100% del alto disponible */
    <div className="flex h-screen bg-slate-100 items-center px-4 font-sans">
      
      <motion.div
        /* Ajuste de altura al 90% del viewport */
        animate={{ 
          width: isExpanded ? 280 : 80,
          height: '90vh' 
        }}
        className="bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 relative"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* --- CABECERA --- */}
        <div className="p-4 mb-2 shrink-0">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
              <Briefcase className="text-white" size={22} />
            </div>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <span className="font-bold text-gray-900 truncate tracking-tight">Service Manager</span>
                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Data Portafolio</span>
              </motion.div>
            )}
            {isExpanded && <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </div>

        {/* --- BUSCADOR --- */}
        <div className="px-4 mb-4 shrink-0">
          <div className="relative flex items-center bg-gray-50 rounded-xl p-2.5 text-gray-400 border border-transparent focus-within:border-indigo-100 transition-all">
            <Search size={18} className="shrink-0" />
            {isExpanded && (
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 placeholder:text-gray-400"
              />
            )}
          </div>
        </div>

        {/* --- NAVEGACIÓN (Scrollable) --- */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {isExpanded && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 block mb-2">Análisis</span>}
          {menuGroups.gestion.map((item) => (
            <MenuItem key={item.key} item={item} isExpanded={isExpanded} />
          ))}

          <hr className="my-4 border-gray-50" />

          <div className="flex items-center justify-between px-3 mb-2">
            {isExpanded && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Intercambio</span>}
            <Plus size={14} className="text-gray-400 cursor-pointer hover:text-indigo-600" />
          </div>
          {menuGroups.intercambio.map((item) => (
            <MenuItem key={item.key} item={item} isExpanded={isExpanded} />
          ))}

          <div className="mt-6 pb-4">
            {isExpanded && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 block mb-2">Portafolios</span>}
            {menuGroups.segmentos.map((proj) => (
              <div key={proj.label} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer group transition-all">
                <div className={`w-2.5 h-2.5 rounded-full ${proj.color} shrink-0 shadow-sm`} />
                {isExpanded && <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 truncate">{proj.label}</span>}
              </div>
            ))}
          </div>
        </nav>

        {/* --- FOOTER (Fijo al fondo) --- */}
        <div className="p-3 border-t border-gray-50 space-y-1 bg-white shrink-0">
          <MenuItem item={{ icon: <Settings size={20} />, label: 'Configuración' }} isExpanded={isExpanded} />
          <MenuItem item={{ icon: <HelpCircle size={20} />, label: 'Soporte' }} isExpanded={isExpanded} />
          
          <div className="mt-4 p-1.5 bg-slate-50 rounded-2xl flex items-center gap-3 border border-gray-100">
            <div className="relative shrink-0">
              <img 
                src="https://ui-avatars.com/api/?name=Admin+Service&background=4f46e5&color=fff" 
                alt="Avatar" 
                className="w-8 h-8 rounded-xl object-cover" 
              />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            {isExpanded && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-[12px] font-bold text-gray-800 truncate">Analista Service</span>
                <span className="text-[9px] text-gray-400 truncate">admin@service.com</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MenuItem({ item, isExpanded, active }) {
  return (
    <div 
      className={`
        flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200
        ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}
      `}
    >
      <div className="shrink-0">{item.icon}</div>
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            className="flex-1 overflow-hidden"
          >
            <span className="text-sm font-semibold whitespace-nowrap">{item.label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}