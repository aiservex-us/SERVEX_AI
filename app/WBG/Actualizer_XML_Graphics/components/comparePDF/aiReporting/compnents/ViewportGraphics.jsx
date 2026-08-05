import React from 'react';
import * as PH from "@phosphor-icons/react";

const ViewportGraphics = () => {
  return (
    <div className="w-full h-full bg-[#FAFAFA] flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-[#EDEBE9] pb-4">
        <div className="w-10 h-10 rounded-lg bg-[#464775]/10 flex items-center justify-center text-[#464775]">
          <PH.ChartBar size={24} weight="duotone" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#242424] m-0 leading-tight">Dashboard Gráfico</h2>
          <p className="text-[13px] text-[#605E5C] m-0 mt-1">Visualización de analíticas y métricas de procesamiento.</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#EDEBE9] rounded-xl bg-white">
        <PH.ChartLineUp size={48} weight="thin" className="text-[#605E5C] mb-4 opacity-50" />
        <h3 className="text-[15px] font-semibold text-[#242424] mb-2">Sección en Construcción</h3>
        <p className="text-[13px] text-[#605E5C] text-center max-w-sm">
          Aquí se implementarán los componentes gráficos para monitorear el desempeño del módulo.
        </p>
      </div>
    </div>
  );
};

export default ViewportGraphics;
