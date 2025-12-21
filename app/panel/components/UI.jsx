import { Briefcase, MapPin } from 'lucide-react';

export const NavItem = ({ icon, label, active, badge }) => (
  <div className={`flex items-center justify-between px-4 py-4 rounded-xl cursor-pointer transition-all
    ${active ? 'bg-white/10 border-l-4 border-white shadow-lg' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}>
    <div className="flex items-center gap-4 text-sm font-semibold">
      {icon}
      <span>{label}</span>
    </div>
    {badge && <span className="bg-blue-500 text-[10px] px-2 py-0.5 rounded-full font-bold">{badge}</span>}
  </div>
);

export const JobCard = ({ job }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:border-indigo-200 transition-all group w-full">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-xs font-medium text-gray-400 mb-1">{job.company}</p>
        <h3 className="font-bold text-lg group-hover:text-[#3D2C8D] transition-colors leading-tight">{job.title}</h3>
        <p className="text-sm font-bold text-blue-600 mt-2">{job.salary}</p>
      </div>
      <div className={`${job.color} p-3 rounded-2xl text-white`}>
        <Briefcase size={24} />
      </div>
    </div>
    <p className="text-xs leading-relaxed text-gray-400 mb-6 line-clamp-2">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
      <span className="bg-indigo-50 text-[#3D2C8D] text-[10px] px-3 py-1.5 rounded-md font-bold uppercase tracking-wider">Remote</span>
      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
        <MapPin size={12} /> London, England
      </span>
    </div>
  </div>
);