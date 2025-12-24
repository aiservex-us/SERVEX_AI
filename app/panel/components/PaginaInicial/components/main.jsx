'use client';
import EmployeeProfile from './Profile';
import StressTable from './StressTable';
import StatCard from './StatCard';
import { Clipboard, Clock } from 'lucide-react';

export default function MainDashboard() {
  const employeeData = {
    name: "Elena Martínez",
    id: "000001",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400",
    birthday: "1987/12/24 (36 años)",
    department: "Planificación Corporativa",
    role: "Estratega Senior",
    joinDate: "2010/04/02 (14 años)",
    hasAlert: true
  };

  const stressRecords = [
    { date: "2023.06.07", level: "A", text: "Rendimiento óptimo.", status: "success" },
    { date: "2022.12.06", level: "B", text: "Estrés moderado detectado.", status: "warning" },
    { date: "2021.06.08", level: "C", text: "Nivel de estrés alto. Cita requerida.", status: "danger" },
  ];

  return (
    <div className="flex-1 bg-white min-h-screen overflow-y-auto">
      {/* Header idéntico al estilo de tu MenuLateral */}
      <header className="h-16 border-b border-slate-100/80 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex flex-col">
          <h1 className="text-[14px] font-bold text-slate-800 tracking-tight">Expediente de Empleado</h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Salud y Bienestar Laboral</p>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4">
          <EmployeeProfile data={employeeData} />
        </div>
        
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <StressTable records={stressRecords} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard 
              title="Exámenes Médicos" 
              icon={<Clipboard size={16} />}
              items={[
                { date: '2023.05.12', label: 'Anual Periódico', isAlert: true, statusText: 'Hallazgos' },
                { date: '2022.05.10', label: 'Anual Periódico', isAlert: false, statusText: 'Normal' }
              ]}
            />
            <StatCard 
              title="Carga Laboral" 
              icon={<Clock size={16} />}
              items={[
                { date: '2023.05', label: 'Sobretiempo: 54h', isAlert: true, statusText: 'Crítico' },
                { date: '2023.04', label: 'Sobretiempo: 12h', isAlert: false, statusText: 'Bajo' }
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}