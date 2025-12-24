export default function StatCard({ title, icon, items }) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm group hover:border-[#6264A7]/30 transition-all">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400 group-hover:text-[#6264A7] transition-colors">{icon}</div>
          <span className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">{title}</span>
        </div>
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-all">
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-400 font-bold">{item.date}</span>
                <span className="text-[11px] text-slate-700 font-medium">{item.label}</span>
              </div>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${item.isAlert ? 'bg-red-50 text-red-600' : 'bg-[#6264A7]/10 text-[#6264A7]'}`}>
                {item.statusText}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }