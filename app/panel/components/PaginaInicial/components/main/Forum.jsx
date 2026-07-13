import React from 'react';
import { Users, MessageSquare } from 'lucide-react';

const Forum = () => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[500px] flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-[#6264A7]/10 rounded-full flex items-center justify-center mb-6">
        <Users className="w-8 h-8 text-[#6264A7]" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-3">
        Foro de Diagnósticos
      </h2>
      <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
        Esta sección está en construcción. Aquí se mostrará toda la información general y el diagnóstico de cada módulo ejecutado por cada usuario en el futuro.
      </p>
      
      {/* Placeholder de contenido futuro */}
      <div className="mt-12 w-full max-w-2xl border-t border-slate-100 pt-8 flex flex-col gap-4">
        <div className="h-20 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-6 animate-pulse">
           <div className="w-10 h-10 bg-slate-200 rounded-full mr-4"></div>
           <div className="flex-1 space-y-2">
             <div className="h-2 bg-slate-200 rounded w-1/4"></div>
             <div className="h-2 bg-slate-200 rounded w-3/4"></div>
           </div>
        </div>
        <div className="h-20 bg-slate-50 rounded-xl border border-slate-100 flex items-center px-6 animate-pulse opacity-70">
           <div className="w-10 h-10 bg-slate-200 rounded-full mr-4"></div>
           <div className="flex-1 space-y-2">
             <div className="h-2 bg-slate-200 rounded w-1/3"></div>
             <div className="h-2 bg-slate-200 rounded w-2/4"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
