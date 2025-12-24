'use client';
import React from 'react';
import { BookOpen, Heart, Users, ChevronRight } from 'lucide-react';

const StatItem = ({ icon, label, value, iconColor }) => (
  <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm border border-slate-100 hover:border-[#6264A7]/30 transition-all cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className={`bg-slate-50 ${iconColor} p-2.5 rounded-lg group-hover:scale-110 transition-transform`}>{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</p>
        <p className="font-extrabold text-lg text-slate-800">{value}</p>
      </div>
    </div>
    <ChevronRight size={16} className="text-slate-300 group-hover:text-[#6264A7] transition-colors" />
  </div>
);

export default function DashboardRight() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <StatItem icon={<BookOpen size={18}/>} label="Articles Posted" value="80" iconColor="text-[#6264A7]" />
        <StatItem icon={<Heart size={18}/>} label="Claps This Week" value="1.5K" iconColor="text-pink-500" />
        <StatItem icon={<Users size={18}/>} label="New Followers" value="972" iconColor="text-blue-500" />
      </div>

      <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-5">Recent Followers</h2>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <img src="https://i.pravatar.cc/150?u=11" className="w-11 h-11 rounded-xl border border-slate-100" />
            <img src="https://i.pravatar.cc/150?u=12" className="w-11 h-11 rounded-xl border border-slate-100" />
            <img src="https://i.pravatar.cc/150?u=13" className="w-11 h-11 rounded-xl border border-slate-100" />
          </div>
          <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-[#6264A7] hover:bg-[#6264A7] hover:text-white transition-all cursor-pointer">
            <ChevronRight size={18} />
          </div>
        </div>
      </section>

      <section className="bg-[#6264A7]/5 border border-[#6264A7]/20 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mx-auto mb-4">🚀</div>
        <h3 className="text-slate-800 font-bold text-sm mb-1 uppercase tracking-tight">Svx Copilot Pro</h3>
        <p className="text-slate-500 mb-5 text-[12px] leading-tight">Next-gen Servex Intelligence. Explore premium features.</p>
        <button className="bg-white text-slate-800 border border-slate-200 w-full py-2.5 rounded-lg font-bold text-xs hover:bg-slate-50 transition-colors shadow-sm">Upgrade Now</button>
      </section>
    </div>
  );
}