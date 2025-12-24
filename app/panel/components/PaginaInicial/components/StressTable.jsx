import { Activity, AlertCircle } from 'lucide-react';

const StressRow = ({ date, level, text, status }) => {
  const styles = {
    success: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-600 bg-amber-50 border-amber-100',
    danger: 'text-red-600 bg-red-50 border-red-100'
  };

  return (
    <tr className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
      <td className="px-6 py-4 text-[11px] font-bold text-slate-500 tracking-tight">{date}</td>
      <td className="px-6 py-4">
        <span className={`text-[11px] font-black px-2.5 py-1 rounded-md border ${styles[status]}`}>{level}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-600 leading-tight font-medium">
          {status === 'danger' && <AlertCircle size={12} className="text-red-500" />}
          {text}
        </div>
      </td>
    </tr>
  );
};

export default function StressTable({ records }) {
  return (
    <section className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white border border-slate-100 rounded-lg text-[#6264A7] shadow-sm"><Activity size={16} /></div>
          <span className="text-[13px] font-bold text-slate-800 uppercase tracking-tight">Check de Estrés</span>
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-50">
            <th className="px-6 py-3">Fecha</th>
            <th className="px-6 py-3">Nivel</th>
            <th className="px-6 py-3">Evaluación</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => <StressRow key={i} {...r} />)}
        </tbody>
      </table>
    </section>
  );
}