'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, FileUp, FileDown, 
  Filter, PieChart, Briefcase, Settings, HelpCircle, 
  Search, ChevronDown, Plus 
} from 'lucide-react';

// Recibimos las props desde el padre
export default function ServiceDataSidebar({ isExpanded, setIsExpanded }) {
  
  const menuGroups = { /* ... tus mismos datos de menuGroups ... */ };

  return (
    /* Eliminamos el contenedor centrado y usamos la altura completa del padre */
    <div className="h-[90%]  flex items-center justify-center pl-4">
      <motion.div
        animate={{ 
          width: isExpanded ? 280 : 80,
          height: '95vh' 
        }}
        className="bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 relative"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* CABECERA - El onClick ahora cambia el estado del PADRE */}
        <div className="p-4 mb-2 shrink-0">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
              <Briefcase className="text-white" size={22} />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <span className="font-bold text-gray-900 truncate tracking-tight">Service Manager</span>
                  <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Data Portafolio</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ... El resto de tu buscador y navegación se queda igual ... */}
        {/* Asegúrate de que los MenuItem usen el isExpanded que llega por props */}
      </motion.div>
    </div>
  );
}